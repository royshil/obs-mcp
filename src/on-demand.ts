import { spawn } from "child_process";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OBSWebSocketClient } from "./client.js";

// On-demand connection mode (OBS_CONNECTION_MODE=on-demand).
//
// Instead of polling for OBS in the background, the server stays idle until a tool is
// called. Each tool call first makes sure OBS is connected, and, if OBS_AUTO_LAUNCH is
// enabled and OBS isn't running, starts OBS and waits for its WebSocket server.

const logger = {
  log: (message: string) => console.error(message),
};

// Tools that only report state and should never trigger a connection or launch.
const PASSIVE_TOOLS = new Set(["obs-get-status"]);

const CONNECT_TIMEOUT_MS = 10000;

export interface OnDemandOptions {
  autoLaunch: boolean;
  launchCommand: string | null;
  launchTimeoutMs: number;
}

export function readOnDemandOptions(env: NodeJS.ProcessEnv = process.env): OnDemandOptions {
  const autoLaunch = /^(1|true|yes)$/i.test(env.OBS_AUTO_LAUNCH ?? "");
  const timeoutSec = Number(env.OBS_LAUNCH_TIMEOUT);
  return {
    autoLaunch,
    launchCommand: env.OBS_LAUNCH_COMMAND || null,
    launchTimeoutMs: (Number.isFinite(timeoutSec) && timeoutSec > 0 ? timeoutSec : 60) * 1000,
  };
}

function defaultLaunchCommand(): string | null {
  switch (process.platform) {
    case "darwin":
      return "open -a OBS";
    case "linux":
      return "obs";
    default:
      return null; // e.g. Windows: install paths vary, so require OBS_LAUNCH_COMMAND
  }
}

function launchOBS(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    logger.log(`Launching OBS: ${command}`);
    const child = spawn(command, { shell: true, detached: true, stdio: "ignore" });
    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolve();
    });
  });
}

function isNotRunningError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /ECONNREFUSED|timeout/i.test(message);
}

async function connectOnce(client: OBSWebSocketClient): Promise<void> {
  // Drop a half-open connection left over from an earlier failed attempt.
  if (!client.isConnected()) client.disconnect();
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Connection timeout after ${CONNECT_TIMEOUT_MS / 1000} seconds`)), CONNECT_TIMEOUT_MS);
  });
  try {
    await Promise.race([client.connect(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

// OBS accepts WebSocket connections slightly before it can serve requests and answers
// with status 207 (NotReady) until then, e.g. right after it was launched.
async function waitUntilReady(client: OBSWebSocketClient, deadline: number): Promise<void> {
  for (;;) {
    try {
      await client.sendRequest("GetVersion");
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/\b207\b/.test(message) || Date.now() > deadline) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

export function createEnsureConnected(client: OBSWebSocketClient, options: OnDemandOptions) {
  let pending: Promise<void> | null = null;

  async function ensure(): Promise<void> {
    try {
      await connectOnce(client);
      await waitUntilReady(client, Date.now() + options.launchTimeoutMs);
      return;
    } catch (error) {
      if (!options.autoLaunch || !isNotRunningError(error)) throw error;
    }

    const command = options.launchCommand ?? defaultLaunchCommand();
    if (!command) {
      throw new Error("OBS isn't running and no launch command is known for this platform. Set OBS_LAUNCH_COMMAND.");
    }
    await launchOBS(command);

    const deadline = Date.now() + options.launchTimeoutMs;
    let lastError: unknown;
    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        await connectOnce(client);
      } catch (error) {
        lastError = error;
        continue;
      }
      await waitUntilReady(client, deadline);
      logger.log("Connected to OBS after launching it");
      return;
    }
    const reason = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`OBS was launched but didn't accept a WebSocket connection within ${options.launchTimeoutMs / 1000}s (${reason})`);
  }

  return function ensureConnected(): Promise<void> {
    if (client.isConnected()) return Promise.resolve();
    pending ??= ensure().finally(() => {
      pending = null;
    });
    return pending;
  };
}

/**
 * Wrap server.tool() so every tool registered afterwards connects to OBS on demand
 * before its handler runs. Must be called before the tools are registered.
 */
export function enableOnDemandConnection(server: McpServer, client: OBSWebSocketClient, options: OnDemandOptions): void {
  const ensureConnected = createEnsureConnected(client, options);
  const registerTool = server.tool.bind(server) as (...args: unknown[]) => unknown;

  (server as unknown as { tool: (...args: unknown[]) => unknown }).tool = (...args: unknown[]) => {
    const name = args[0] as string;
    const handler = args[args.length - 1];
    if (typeof handler === "function" && !PASSIVE_TOOLS.has(name)) {
      args[args.length - 1] = async (...handlerArgs: unknown[]) => {
        try {
          await ensureConnected();
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return {
            content: [{ type: "text", text: `Couldn't connect to OBS: ${message}` }],
            isError: true,
          };
        }
        return handler(...handlerArgs);
      };
    }
    return registerTool(...args);
  };
}
