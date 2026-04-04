import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OBSWebSocketClient } from "../client.js";
import { z } from "zod";

export async function initialize(server: McpServer, client: OBSWebSocketClient): Promise<void> {
  // GetMediaInputStatus tool
  server.registerTool(
    "obs-get-media-input-status",
    {
      title: "Get Media Input Status",
      description: "Gets the status of a media input",
      inputSchema: {
        inputName: z.string().describe("Name of the media input")
      },
      annotations: { readOnlyHint: true },
    },
    async ({ inputName }) => {
      try {
        const response = await client.sendRequest("GetMediaInputStatus", { inputName });
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
              text: `Error getting media input status: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetMediaInputCursor tool
  server.registerTool(
    "obs-set-media-input-cursor",
    {
      title: "Set Media Input Cursor",
      description: "Sets the cursor position of a media input",
      inputSchema: {
        inputName: z.string().describe("Name of the media input"),
        mediaCursor: z.number().min(0).describe("New cursor position to set (in milliseconds)")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ inputName, mediaCursor }) => {
      try {
        await client.sendRequest("SetMediaInputCursor", { inputName, mediaCursor });
        return {
          content: [
            {
              type: "text",
              text: `Successfully set media cursor position to ${mediaCursor}ms for input: ${inputName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting media input cursor: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // OffsetMediaInputCursor tool
  server.registerTool(
    "obs-offset-media-input-cursor",
    {
      title: "Offset Media Input Cursor",
      description: "Offsets the current cursor position of a media input",
      inputSchema: {
        inputName: z.string().describe("Name of the media input"),
        mediaCursorOffset: z.number().describe("Value to offset the current cursor position by (in milliseconds)")
      },
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async ({ inputName, mediaCursorOffset }) => {
      try {
        await client.sendRequest("OffsetMediaInputCursor", { inputName, mediaCursorOffset });
        return {
          content: [
            {
              type: "text",
              text: `Successfully offset media cursor position by ${mediaCursorOffset}ms for input: ${inputName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error offsetting media input cursor: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // TriggerMediaInputAction tool
  server.registerTool(
    "obs-trigger-media-input-action",
    {
      title: "Trigger Media Input Action",
      description: "Triggers an action on a media input",
      inputSchema: {
        inputName: z.string().describe("Name of the media input"),
        mediaAction: z.enum([
          "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PLAY",
          "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PAUSE",
          "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP",
          "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART",
          "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_NEXT",
          "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PREVIOUS"
        ]).describe("Action to trigger (PLAY, PAUSE, STOP, RESTART, NEXT, PREVIOUS)")
      },
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async ({ inputName, mediaAction }) => {
      try {
        await client.sendRequest("TriggerMediaInputAction", { inputName, mediaAction });
        return {
          content: [
            {
              type: "text",
              text: `Successfully triggered media action '${mediaAction}' for input: ${inputName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error triggering media input action: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );
}
