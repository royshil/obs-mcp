import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OBSWebSocketClient } from "../client.js";
import { z } from "zod";
import { createRequire } from "module";

const { version } = createRequire(import.meta.url)("../../package.json");

export async function initialize(server: McpServer, client: OBSWebSocketClient): Promise<void> {
  // Get server status
  server.tool(
    "obs-get-status",
    "Get the current status of the OBS MCP server and OBS connection",
    {},
    { readOnlyHint: true },
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
  server.tool(
    "obs-get-version",
    "Get OBS Studio version information",
    {},
    { readOnlyHint: true },
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
  server.tool(
    "obs-test-connection",
    "Test the connection to OBS WebSocket",
    {},
    { readOnlyHint: true },
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
  server.tool(
    "obs-get-stats",
    "Gets statistics about OBS, obs-websocket, and the current session",
    {},
    { readOnlyHint: true },
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
  server.tool(
    "obs-broadcast-custom-event",
    "Broadcasts a CustomEvent to all WebSocket clients",
    {
      eventData: z.record(z.any()).describe("Data payload to emit to all receivers")
    },
    { destructiveHint: false, idempotentHint: false },
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
  server.tool(
    "obs-call-vendor-request",
    "Call a request registered to a vendor",
    {
      vendorName: z.string().describe("Name of the vendor to use"),
      requestType: z.string().describe("The request type to call"),
      requestData: z.record(z.any()).optional().describe("Object containing appropriate request data")
    },
    { destructiveHint: false, idempotentHint: false },
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
  server.tool(
    "obs-get-hotkey-list",
    "Gets an array of all hotkey names in OBS",
    {},
    { readOnlyHint: true },
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
  server.tool(
    "obs-trigger-hotkey-by-name",
    "Triggers a hotkey using its name",
    {
      hotkeyName: z.string().describe("Name of the hotkey to trigger"),
      contextName: z.string().optional().describe("Name of context of the hotkey to trigger")
    },
    { destructiveHint: false, idempotentHint: false },
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
  server.tool(
    "obs-trigger-hotkey-by-key-sequence",
    "Triggers a hotkey using a sequence of keys",
    {
      keyId: z.string().optional().describe("The OBS key ID to use"),
      keyModifiers: z.object({
        shift: z.boolean().optional().describe("Press Shift"),
        control: z.boolean().optional().describe("Press CTRL"),
        alt: z.boolean().optional().describe("Press ALT"),
        command: z.boolean().optional().describe("Press CMD (Mac)")
      }).optional().describe("Object containing key modifiers to apply")
    },
    { destructiveHint: false, idempotentHint: false },
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
  server.tool(
    "obs-sleep",
    "Sleeps for a time duration or number of frames",
    {
      sleepMillis: z.number().optional().describe("Number of milliseconds to sleep for"),
      sleepFrames: z.number().optional().describe("Number of frames to sleep for")
    },
    { readOnlyHint: true },
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