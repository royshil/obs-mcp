import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OBSWebSocketClient } from "../client.js";
import { z } from "zod";

export async function initialize(server: McpServer, client: OBSWebSocketClient): Promise<void> {
  // GetTransitionList tool
  server.tool(
    "obs-get-transition-list",
    "Get a list of available transitions in OBS",
    {},
    { readOnlyHint: true },
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
  server.tool(
    "obs-get-current-transition",
    "Get the name of the currently active transition",
    {},
    { readOnlyHint: true },
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
  server.tool(
    "obs-set-current-transition",
    "Set the current transition in OBS",
    {
      transitionName: z.string().describe("The name of the transition to set as current")
    },
    { destructiveHint: false, idempotentHint: true },
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
  server.tool(
    "obs-get-transition-duration",
    "Get the duration of the current transition in milliseconds",
    {},
    { readOnlyHint: true },
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
  server.tool(
    "obs-set-transition-duration",
    "Set the duration of the current transition in milliseconds",
    {
      duration: z.number().min(0).describe("The duration to set in milliseconds")
    },
    { destructiveHint: false, idempotentHint: true },
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
  server.tool(
    "obs-get-transition-kind",
    "Get the kind/type of the current transition",
    {},
    { readOnlyHint: true },
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
  server.tool(
    "obs-set-transition-settings",
    "Set the settings of the current transition",
    {
      transitionSettings: z.record(z.any()).describe("The settings to apply to the transition")
    },
    { destructiveHint: false, idempotentHint: true },
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
  server.tool(
    "obs-get-transition-settings",
    "Get the settings of the current transition",
    {},
    { readOnlyHint: true },
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
  server.tool(
    "obs-trigger-transition",
    "Trigger a scene transition in OBS (Studio Mode must be enabled)",
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
              text: `Error triggering transition: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );
}