import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OBSWebSocketClient } from "../client.js";
import { z } from "zod";

export async function initialize(server: McpServer, client: OBSWebSocketClient): Promise<void> {
  // GetRecordStatus tool
  server.registerTool(
    "obs-get-record-status",
    {
      title: "Get Record Status",
      description: "Gets the status of the record output",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const response = await client.sendRequest("GetRecordStatus");
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
              text: `Error getting record status: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // ToggleRecord tool
  server.registerTool(
    "obs-toggle-record",
    {
      title: "Toggle Recording",
      description: "Toggles the status of the record output",
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async () => {
      try {
        const response = await client.sendRequest("ToggleRecord");
        return {
          content: [
            {
              type: "text",
              text: `Recording toggled, now ${response.outputActive ? "active" : "inactive"}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error toggling recording: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // StartRecord tool
  server.registerTool(
    "obs-start-record",
    {
      title: "Start Recording",
      description: "Starts the record output",
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async () => {
      try {
        await client.sendRequest("StartRecord");
        return {
          content: [
            {
              type: "text",
              text: "Recording started"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error starting recording: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // StopRecord tool
  server.registerTool(
    "obs-stop-record",
    {
      title: "Stop Recording",
      description: "Stops the record output",
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async () => {
      try {
        const response = await client.sendRequest("StopRecord");
        return {
          content: [
            {
              type: "text",
              text: `Recording stopped, saved to: ${response.outputPath}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error stopping recording: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // ToggleRecordPause tool
  server.registerTool(
    "obs-toggle-record-pause",
    {
      title: "Toggle Record Pause",
      description: "Toggles pause on the record output",
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async () => {
      try {
        await client.sendRequest("ToggleRecordPause");
        return {
          content: [
            {
              type: "text",
              text: "Recording pause toggled"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error toggling record pause: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // PauseRecord tool
  server.registerTool(
    "obs-pause-record",
    {
      title: "Pause Recording",
      description: "Pauses the record output",
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async () => {
      try {
        await client.sendRequest("PauseRecord");
        return {
          content: [
            {
              type: "text",
              text: "Recording paused"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error pausing recording: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // ResumeRecord tool
  server.registerTool(
    "obs-resume-record",
    {
      title: "Resume Recording",
      description: "Resumes the record output",
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async () => {
      try {
        await client.sendRequest("ResumeRecord");
        return {
          content: [
            {
              type: "text",
              text: "Recording resumed"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error resuming recording: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SplitRecordFile tool
  server.registerTool(
    "obs-split-record-file",
    {
      title: "Split Record File",
      description: "Splits the current file being recorded into a new file",
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async () => {
      try {
        await client.sendRequest("SplitRecordFile");
        return {
          content: [
            {
              type: "text",
              text: "Recording file split"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error splitting record file: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // CreateRecordChapter tool
  server.registerTool(
    "obs-create-record-chapter",
    {
      title: "Create Record Chapter",
      description: "Adds a new chapter marker to the file currently being recorded",
      inputSchema: {
        chapterName: z.string().optional().describe("Name of the new chapter")
      },
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async ({ chapterName }) => {
      try {
        const requestParams: Record<string, any> = {};
        if (chapterName !== undefined) {
          requestParams.chapterName = chapterName;
        }

        await client.sendRequest("CreateRecordChapter", requestParams);
        return {
          content: [
            {
              type: "text",
              text: `Record chapter${chapterName ? ` "${chapterName}"` : ""} created`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating record chapter: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );
}
