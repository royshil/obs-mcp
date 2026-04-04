import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OBSWebSocketClient } from "../client.js";
import { z } from "zod";

export async function initialize(server: McpServer, client: OBSWebSocketClient): Promise<void> {
  // GetTransitionList tool
  server.registerTool(
    "obs-get-transition-list",
    {
      title: "Get Transition List",
      description: "Get a list of available transitions in OBS",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const transitions = await client.sendRequest("GetTransitionList");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(transitions, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting transition list: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetCurrentTransition tool
  server.registerTool(
    "obs-get-current-transition",
    {
      title: "Get Current Transition",
      description: "Get the name of the currently active transition",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const transition = await client.sendRequest("GetCurrentSceneTransition");
        return {
          content: [
            {
              type: "text",
              text: `Current transition: ${transition.transitionName} (${transition.transitionKind}) with duration: ${transition.transitionDuration}ms`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting current transition: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetCurrentTransition tool
  server.registerTool(
    "obs-set-current-transition",
    {
      title: "Set Current Transition",
      description: "Set the current transition in OBS",
      inputSchema: {
        transitionName: z.string().describe("The name of the transition to set as current")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ transitionName }) => {
      try {
        await client.sendRequest("SetCurrentSceneTransition", { transitionName });
        return {
          content: [
            {
              type: "text",
              text: `Successfully set current transition to: ${transitionName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting current transition: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetTransitionDuration tool
  server.registerTool(
    "obs-get-transition-duration",
    {
      title: "Get Transition Duration",
      description: "Get the duration of the current transition in milliseconds",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const duration = await client.sendRequest("GetCurrentSceneTransitionDuration");
        return {
          content: [
            {
              type: "text",
              text: `Current transition duration: ${duration.transitionDuration}ms`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting transition duration: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetTransitionDuration tool
  server.registerTool(
    "obs-set-transition-duration",
    {
      title: "Set Transition Duration",
      description: "Set the duration of the current transition in milliseconds",
      inputSchema: {
        duration: z.number().min(0).describe("The duration to set in milliseconds")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ duration }) => {
      try {
        await client.sendRequest("SetCurrentSceneTransitionDuration", { transitionDuration: duration });
        return {
          content: [
            {
              type: "text",
              text: `Successfully set transition duration to: ${duration}ms`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting transition duration: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetTransitionKind tool
  server.registerTool(
    "obs-get-transition-kind",
    {
      title: "Get Transition Kind",
      description: "Get the kind/type of the current transition",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const transition = await client.sendRequest("GetCurrentSceneTransition");
        return {
          content: [
            {
              type: "text",
              text: `Current transition kind: ${transition.transitionKind}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting transition kind: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetTransitionSettings tool
  server.registerTool(
    "obs-set-transition-settings",
    {
      title: "Set Transition Settings",
      description: "Set the settings of the current transition",
      inputSchema: {
        transitionSettings: z.record(z.any()).describe("The settings to apply to the transition")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ transitionSettings }) => {
      try {
        await client.sendRequest("SetCurrentSceneTransitionSettings", { transitionSettings });
        return {
          content: [
            {
              type: "text",
              text: "Successfully updated current transition settings"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting transition settings: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetTransitionSettings tool
  server.registerTool(
    "obs-get-transition-settings",
    {
      title: "Get Transition Settings",
      description: "Get the settings of the current transition",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const settings = await client.sendRequest("GetCurrentSceneTransitionSettings");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(settings, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting transition settings: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // TriggerStudioModeTransition tool
  server.registerTool(
    "obs-trigger-transition",
    {
      title: "Trigger Transition",
      description: "Trigger a scene transition in OBS (Studio Mode must be enabled)",
      annotations: { destructiveHint: false, idempotentHint: false },
    },
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
              text: `Error triggering transition: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );
}
