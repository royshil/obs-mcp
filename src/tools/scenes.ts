import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OBSWebSocketClient } from "../client.js";
import { z } from "zod";

export async function initialize(server: McpServer, client: OBSWebSocketClient): Promise<void> {
  // GetSceneList tool
  server.tool(
    "obs-get-scene-list",
    "Get a list of scenes in OBS",
    {},
    { readOnlyHint: true },
    async () => {
      try {
        const sceneList = await client.sendRequest("GetSceneList");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(sceneList, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting scene list: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetCurrentProgramScene tool
  server.tool(
    "obs-get-current-scene",
    "Get the current active scene in OBS",
    {},
    { readOnlyHint: true },
    async () => {
      try {
        const currentScene = await client.sendRequest("GetCurrentProgramScene");
        return {
          content: [
            {
              type: "text",
              text: `Current scene: ${currentScene.currentProgramSceneName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting current scene: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetCurrentProgramScene tool
  server.tool(
    "obs-set-current-scene",
    "Set the current active scene in OBS",
    {
      sceneName: z.string().describe("The name of the scene to set as current")
    },
    { destructiveHint: false, idempotentHint: true },
    async ({ sceneName }) => {
      try {
        await client.sendRequest("SetCurrentProgramScene", { sceneName });
        return {
          content: [
            {
              type: "text",
              text: `Successfully switched to scene: ${sceneName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting current scene: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetCurrentPreviewScene tool (Studio Mode)
  server.tool(
    "obs-get-preview-scene",
    "Get the current preview scene in OBS Studio Mode",
    {},
    { readOnlyHint: true },
    async () => {
      try {
        const previewScene = await client.sendRequest("GetCurrentPreviewScene");
        return {
          content: [
            {
              type: "text",
              text: `Preview scene: ${previewScene.currentPreviewSceneName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting preview scene: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetCurrentPreviewScene tool (Studio Mode)
  server.tool(
    "obs-set-preview-scene",
    "Set the current preview scene in OBS Studio Mode",
    {
      sceneName: z.string().describe("The name of the scene to set as preview")
    },
    { destructiveHint: false, idempotentHint: true },
    async ({ sceneName }) => {
      try {
        await client.sendRequest("SetCurrentPreviewScene", { sceneName });
        return {
          content: [
            {
              type: "text",
              text: `Successfully set preview scene to: ${sceneName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting preview scene: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // CreateScene tool
  server.tool(
    "obs-create-scene",
    "Create a new scene in OBS",
    {
      sceneName: z.string().describe("The name for the new scene")
    },
    { destructiveHint: false, idempotentHint: false },
    async ({ sceneName }) => {
      try {
        await client.sendRequest("CreateScene", { sceneName });
        return {
          content: [
            {
              type: "text",
              text: `Successfully created scene: ${sceneName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating scene: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // RemoveScene tool
  server.tool(
    "obs-remove-scene",
    "Remove a scene from OBS",
    {
      sceneName: z.string().describe("The name of the scene to remove")
    },
    { destructiveHint: true, idempotentHint: true },
    async ({ sceneName }) => {
      try {
        await client.sendRequest("RemoveScene", { sceneName });
        return {
          content: [
            {
              type: "text",
              text: `Successfully removed scene: ${sceneName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error removing scene: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // TriggerStudioModeTransition tool
  server.tool(
    "obs-trigger-studio-transition",
    "Trigger a transition from preview to program scene in Studio Mode",
    {},
    { destructiveHint: false, idempotentHint: false },
    async () => {
      try {
        await client.sendRequest("TriggerStudioModeTransition");
        return {
          content: [
            {
              type: "text",
              text: "Successfully triggered studio mode transition"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error triggering studio transition: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );
}