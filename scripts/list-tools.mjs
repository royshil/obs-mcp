#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

export async function listTools(root) {
  const mockClient = {
    isConnected: () => false,
    getConnectionStatus: () => ({}),
    on: () => {},
  };

  const server = new McpServer({ name: "obs-mcp", version: "1.0.0" });

  const { initialize } = await import(pathToFileURL(resolve(root, "build/tools/index.js")).href);
  await initialize(server, mockClient);

  return Object.entries(server._registeredTools).map(([name, tool]) => ({
    name,
    // title: tool.title,
    description: tool.description,
  }));
}

// Allow running directly: node scripts/list-tools.mjs
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  console.log(JSON.stringify(await listTools(root), null, 2));
}
