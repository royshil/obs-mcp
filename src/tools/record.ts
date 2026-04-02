import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OBSWebSocketClient } from "../client.js";
import { z } from "zod";

export async function initialize(server: McpServer, client: OBSWebSocketClient): Promise<void> {
  // GetRecordStatus tool
  server.tool(
    "obs-get-record-status",
    "Gets the status of the record output",
    {},
    { readOnlyHint: true },
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
  server.tool(
    "obs-toggle-record",
    "Toggles the status of the record output",
    {},
    { destructiveHint: false, idempotentHint: false },
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
  server.tool(
    "obs-start-record",
    "Starts the record output",
    {},
    { destructiveHint: false, idempotentHint: false },
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
  server.tool(
    "obs-stop-record",
    "Stops the record output",
    {},
    { destructiveHint: false, idempotentHint: true },
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
  server.tool(
    "obs-toggle-record-pause",
    "Toggles pause on the record output",
    {},
    { destructiveHint: false, idempotentHint: false },
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
  server.tool(
    "obs-pause-record",
    "Pauses the record output",
    {},
    { destructiveHint: false, idempotentHint: true },
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
  server.tool(
    "obs-resume-record",
    "Resumes the record output",
    {},
    { destructiveHint: false, idempotentHint: true },
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
  server.tool(
    "obs-split-record-file",
    "Splits the current file being recorded into a new file",
    {},
    { destructiveHint: false, idempotentHint: false },
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
  server.tool(
    "obs-create-record-chapter",
    "Adds a new chapter marker to the file currently being recorded",
    {
      chapterName: z.string().optional().describe("Name of the new chapter")
    },
    { destructiveHint: false, idempotentHint: false },
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