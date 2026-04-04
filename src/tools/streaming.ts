import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OBSWebSocketClient } from "../client.js";
import { z } from "zod";

export async function initialize(server: McpServer, client: OBSWebSocketClient): Promise<void> {
  // GetStreamStatus tool
  server.registerTool(
    "obs-get-stream-status",
    {
      title: "Get Stream Status",
      description: "Get the current streaming status",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const status = await client.sendRequest("GetStreamStatus");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(status, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting stream status: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // StartStream tool
  server.registerTool(
    "obs-start-stream",
    {
      title: "Start Stream",
      description: "Start streaming in OBS",
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async () => {
      try {
        await client.sendRequest("StartStream");
        return {
          content: [
            {
              type: "text",
              text: "Successfully started streaming"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error starting stream: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // StopStream tool
  server.registerTool(
    "obs-stop-stream",
    {
      title: "Stop Stream",
      description: "Stop streaming in OBS",
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async () => {
      try {
        await client.sendRequest("StopStream");
        return {
          content: [
            {
              type: "text",
              text: "Successfully stopped streaming"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error stopping stream: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // ToggleStream tool
  server.registerTool(
    "obs-toggle-stream",
    {
      title: "Toggle Stream",
      description: "Toggle the streaming state in OBS",
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async () => {
      try {
        const response = await client.sendRequest("ToggleStream");
        return {
          content: [
            {
              type: "text",
              text: `Successfully toggled streaming state. Stream is now ${response.outputActive ? 'active' : 'inactive'}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error toggling stream: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SendStreamCaption tool
  server.registerTool(
    "obs-send-stream-caption",
    {
      title: "Send Stream Caption",
      description: "Sends CEA-608 caption text over the stream output",
      inputSchema: {
        captionText: z.string().describe("Caption text to send")
      },
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async ({ captionText }) => {
      try {
        await client.sendRequest("SendStreamCaption", { captionText });
        return {
          content: [
            {
              type: "text",
              text: "Successfully sent stream caption"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error sending stream caption: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );
}
