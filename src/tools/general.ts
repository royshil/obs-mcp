import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OBSWebSocketClient } from "../client.js";
import { z } from "zod";
import { createRequire } from "module";

const { version } = createRequire(import.meta.url)("../../package.json");

export async function initialize(server: McpServer, client: OBSWebSocketClient): Promise<void> {
  // Get server status
  server.registerTool(
    "obs-get-status",
    {
      title: "OBS Server Status",
      description: "Get the current status of the OBS MCP server and OBS connection",
      annotations: { readOnlyHint: true },
    },
    async () => {
      const status = client.getConnectionStatus();
      const obsConnected = client.isConnected();

      const statusInfo = {
        server: {
          name: "obs-mcp",
          version,
          status: "running"
        },
        obs: {
          connected: obsConnected,
          url: status.url,
          hasPassword: status.hasPassword,
          identified: status.identified
        },
        timestamp: new Date().toISOString()
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(statusInfo, null, 2)
          }
        ]
      };
    }
  );

  // Get OBS version info
  server.registerTool(
    "obs-get-version",
    {
      title: "OBS Version Info",
      description: "Get OBS Studio version information",
      annotations: { readOnlyHint: true },
    },
    async () => {
      if (!client.isConnected()) {
        return {
          content: [
            {
              type: "text",
              text: "Not connected to OBS WebSocket"
            }
          ],
          isError: true
        };
      }

      try {
        const version = await client.sendRequest("GetVersion");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(version, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get OBS version: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Test OBS connection
  server.registerTool(
    "obs-test-connection",
    {
      title: "Test OBS Connection",
      description: "Test the connection to OBS WebSocket",
      annotations: { readOnlyHint: true },
    },
    async () => {
      if (!client.isConnected()) {
        return {
          content: [
            {
              type: "text",
              text: "Not connected to OBS WebSocket"
            }
          ],
          isError: true
        };
      }

      try {
        // Try a simple request to test the connection
        await client.sendRequest("GetVersion");
        return {
          content: [
            {
              type: "text",
              text: "Connection test successful - OBS is responding"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Connection test failed: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetStats tool
  server.registerTool(
    "obs-get-stats",
    {
      title: "OBS Statistics",
      description: "Gets statistics about OBS, obs-websocket, and the current session",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const stats = await client.sendRequest("GetStats");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(stats, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting stats: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // BroadcastCustomEvent tool
  server.registerTool(
    "obs-broadcast-custom-event",
    {
      title: "Broadcast Custom Event",
      description: "Broadcasts a CustomEvent to all WebSocket clients",
      inputSchema: {
        eventData: z.record(z.any()).describe("Data payload to emit to all receivers")
      },
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async ({ eventData }) => {
      try {
        await client.sendRequest("BroadcastCustomEvent", { eventData });
        return {
          content: [
            {
              type: "text",
              text: "Custom event broadcast successfully"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error broadcasting custom event: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // CallVendorRequest tool
  server.registerTool(
    "obs-call-vendor-request",
    {
      title: "Call Vendor Request",
      description: "Call a request registered to a vendor",
      inputSchema: {
        vendorName: z.string().describe("Name of the vendor to use"),
        requestType: z.string().describe("The request type to call"),
        requestData: z.record(z.any()).optional().describe("Object containing appropriate request data")
      },
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async ({ vendorName, requestType, requestData }) => {
      try {
        const params: Record<string, any> = {
          vendorName,
          requestType
        };

        if (requestData !== undefined) {
          params.requestData = requestData;
        }

        const response = await client.sendRequest("CallVendorRequest", params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error calling vendor request: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetHotkeyList tool
  server.registerTool(
    "obs-get-hotkey-list",
    {
      title: "Get Hotkey List",
      description: "Gets an array of all hotkey names in OBS",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const hotkeyList = await client.sendRequest("GetHotkeyList");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(hotkeyList, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting hotkey list: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // TriggerHotkeyByName tool
  server.registerTool(
    "obs-trigger-hotkey-by-name",
    {
      title: "Trigger Hotkey by Name",
      description: "Triggers a hotkey using its name",
      inputSchema: {
        hotkeyName: z.string().describe("Name of the hotkey to trigger"),
        contextName: z.string().optional().describe("Name of context of the hotkey to trigger")
      },
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async ({ hotkeyName, contextName }) => {
      try {
        const params: Record<string, any> = { hotkeyName };

        if (contextName !== undefined) {
          params.contextName = contextName;
        }

        await client.sendRequest("TriggerHotkeyByName", params);
        return {
          content: [
            {
              type: "text",
              text: `Successfully triggered hotkey: ${hotkeyName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error triggering hotkey: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // TriggerHotkeyByKeySequence tool
  server.registerTool(
    "obs-trigger-hotkey-by-key-sequence",
    {
      title: "Trigger Hotkey by Key Sequence",
      description: "Triggers a hotkey using a sequence of keys",
      inputSchema: {
        keyId: z.string().optional().describe("The OBS key ID to use"),
        keyModifiers: z.object({
          shift: z.boolean().optional().describe("Press Shift"),
          control: z.boolean().optional().describe("Press CTRL"),
          alt: z.boolean().optional().describe("Press ALT"),
          command: z.boolean().optional().describe("Press CMD (Mac)")
        }).optional().describe("Object containing key modifiers to apply")
      },
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async ({ keyId, keyModifiers }) => {
      try {
        const params: Record<string, any> = {};

        if (keyId !== undefined) {
          params.keyId = keyId;
        }

        if (keyModifiers !== undefined) {
          params.keyModifiers = keyModifiers;
        }

        await client.sendRequest("TriggerHotkeyByKeySequence", params);
        return {
          content: [
            {
              type: "text",
              text: "Hotkey triggered by key sequence successfully"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error triggering hotkey by key sequence: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Sleep tool
  server.registerTool(
    "obs-sleep",
    {
      title: "OBS Sleep",
      description: "Sleeps for a time duration or number of frames",
      inputSchema: {
        sleepMillis: z.number().optional().describe("Number of milliseconds to sleep for"),
        sleepFrames: z.number().optional().describe("Number of frames to sleep for")
      },
      annotations: { readOnlyHint: true },
    },
    async ({ sleepMillis, sleepFrames }) => {
      try {
        const params: Record<string, any> = {};

        if (sleepMillis !== undefined) {
          params.sleepMillis = sleepMillis;
        }

        if (sleepFrames !== undefined) {
          params.sleepFrames = sleepFrames;
        }

        await client.sendRequest("Sleep", params);
        return {
          content: [
            {
              type: "text",
              text: "Sleep operation completed successfully"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error during sleep operation: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );
}
