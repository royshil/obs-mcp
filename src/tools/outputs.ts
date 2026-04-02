import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OBSWebSocketClient } from "../client.js";
import { z } from "zod";

export async function initialize(server: McpServer, client: OBSWebSocketClient): Promise<void> {
  // GetVirtualCamStatus tool
  server.tool(
    "obs-get-virtual-cam-status",
    "Gets the status of the virtualcam output",
    {},
    { readOnlyHint: true },
    async () => {
      try {
        const response = await client.sendRequest("GetVirtualCamStatus");
        return {
          content: [
            {
              type: "text",
              text: `Virtual camera is ${response.outputActive ? "active" : "inactive"}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting virtual camera status: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // ToggleVirtualCam tool
  server.tool(
    "obs-toggle-virtual-cam",
    "Toggles the state of the virtualcam output",
    {},
    { destructiveHint: false, idempotentHint: false },
    async () => {
      try {
        const response = await client.sendRequest("ToggleVirtualCam");
        return {
          content: [
            {
              type: "text",
              text: `Virtual camera toggled, now ${response.outputActive ? "active" : "inactive"}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error toggling virtual camera: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // StartVirtualCam tool
  server.tool(
    "obs-start-virtual-cam",
    "Starts the virtualcam output",
    {},
    { destructiveHint: false, idempotentHint: false },
    async () => {
      try {
        await client.sendRequest("StartVirtualCam");
        return {
          content: [
            {
              type: "text",
              text: "Virtual camera started"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error starting virtual camera: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // StopVirtualCam tool
  server.tool(
    "obs-stop-virtual-cam",
    "Stops the virtualcam output",
    {},
    { destructiveHint: false, idempotentHint: true },
    async () => {
      try {
        await client.sendRequest("StopVirtualCam");
        return {
          content: [
            {
              type: "text",
              text: "Virtual camera stopped"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error stopping virtual camera: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetReplayBufferStatus tool
  server.tool(
    "obs-get-replay-buffer-status",
    "Gets the status of the replay buffer output",
    {},
    { readOnlyHint: true },
    async () => {
      try {
        const response = await client.sendRequest("GetReplayBufferStatus");
        return {
          content: [
            {
              type: "text",
              text: `Replay buffer is ${response.outputActive ? "active" : "inactive"}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting replay buffer status: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // ToggleReplayBuffer tool
  server.tool(
    "obs-toggle-replay-buffer",
    "Toggles the state of the replay buffer output",
    {},
    { destructiveHint: false, idempotentHint: false },
    async () => {
      try {
        const response = await client.sendRequest("ToggleReplayBuffer");
        return {
          content: [
            {
              type: "text",
              text: `Replay buffer toggled, now ${response.outputActive ? "active" : "inactive"}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error toggling replay buffer: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // StartReplayBuffer tool
  server.tool(
    "obs-start-replay-buffer",
    "Starts the replay buffer output",
    {},
    { destructiveHint: false, idempotentHint: false },
    async () => {
      try {
        await client.sendRequest("StartReplayBuffer");
        return {
          content: [
            {
              type: "text",
              text: "Replay buffer started"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error starting replay buffer: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // StopReplayBuffer tool
  server.tool(
    "obs-stop-replay-buffer",
    "Stops the replay buffer output",
    {},
    { destructiveHint: false, idempotentHint: true },
    async () => {
      try {
        await client.sendRequest("StopReplayBuffer");
        return {
          content: [
            {
              type: "text",
              text: "Replay buffer stopped"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error stopping replay buffer: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SaveReplayBuffer tool
  server.tool(
    "obs-save-replay-buffer",
    "Saves the contents of the replay buffer output",
    {},
    { destructiveHint: false, idempotentHint: false },
    async () => {
      try {
        await client.sendRequest("SaveReplayBuffer");
        return {
          content: [
            {
              type: "text",
              text: "Replay buffer saved"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error saving replay buffer: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetLastReplayBufferReplay tool
  server.tool(
    "obs-get-last-replay-buffer-replay",
    "Gets the filename of the last replay buffer save file",
    {},
    { readOnlyHint: true },
    async () => {
      try {
        const response = await client.sendRequest("GetLastReplayBufferReplay");
        return {
          content: [
            {
              type: "text",
              text: `Last replay buffer save file: ${response.savedReplayPath}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting last replay buffer file: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetOutputList tool
  server.tool(
    "obs-get-output-list",
    "Gets the list of available outputs",
    {},
    { readOnlyHint: true },
    async () => {
      try {
        const response = await client.sendRequest("GetOutputList");
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
              text: `Error getting output list: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetOutputStatus tool
  server.tool(
    "obs-get-output-status",
    "Gets the status of an output",
    {
      outputName: z.string().describe("Output name")
    },
    { readOnlyHint: true },
    async ({ outputName }) => {
      try {
        const response = await client.sendRequest("GetOutputStatus", { outputName });
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
              text: `Error getting output status: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // ToggleOutput tool
  server.tool(
    "obs-toggle-output",
    "Toggles the status of an output",
    {
      outputName: z.string().describe("Output name")
    },
    { destructiveHint: false, idempotentHint: false },
    async ({ outputName }) => {
      try {
        const response = await client.sendRequest("ToggleOutput", { outputName });
        return {
          content: [
            {
              type: "text",
              text: `Output '${outputName}' toggled, now ${response.outputActive ? "active" : "inactive"}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error toggling output: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // StartOutput tool
  server.tool(
    "obs-start-output",
    "Starts an output",
    {
      outputName: z.string().describe("Output name")
    },
    { destructiveHint: false, idempotentHint: false },
    async ({ outputName }) => {
      try {
        await client.sendRequest("StartOutput", { outputName });
        return {
          content: [
            {
              type: "text",
              text: `Output '${outputName}' started`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error starting output: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // StopOutput tool
  server.tool(
    "obs-stop-output",
    "Stops an output",
    {
      outputName: z.string().describe("Output name")
    },
    { destructiveHint: false, idempotentHint: true },
    async ({ outputName }) => {
      try {
        await client.sendRequest("StopOutput", { outputName });
        return {
          content: [
            {
              type: "text",
              text: `Output '${outputName}' stopped`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error stopping output: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetOutputSettings tool
  server.tool(
    "obs-get-output-settings",
    "Gets the settings of an output",
    {
      outputName: z.string().describe("Output name")
    },
    { readOnlyHint: true },
    async ({ outputName }) => {
      try {
        const response = await client.sendRequest("GetOutputSettings", { outputName });
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
              text: `Error getting output settings: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetOutputSettings tool
  server.tool(
    "obs-set-output-settings",
    "Sets the settings of an output",
    {
      outputName: z.string().describe("Output name"),
      outputSettings: z.record(z.any()).describe("Output settings")
    },
    { destructiveHint: false, idempotentHint: true },
    async ({ outputName, outputSettings }) => {
      try {
        await client.sendRequest("SetOutputSettings", { outputName, outputSettings });
        return {
          content: [
            {
              type: "text",
              text: `Settings updated for output '${outputName}'`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting output settings: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );
}