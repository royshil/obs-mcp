import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OBSWebSocketClient } from "../client.js";
import { z } from "zod";

export async function initialize(server: McpServer, client: OBSWebSocketClient): Promise<void> {
  // GetSceneItemList tool
  server.tool(
    "obs-get-scene-items",
    "Get a list of all scene items in a scene",
    {
      sceneName: z.string().describe("The name of the scene to get items from")
    },
    { readOnlyHint: true },
    async ({ sceneName }) => {
      try {
        const sceneItems = await client.sendRequest("GetSceneItemList", { sceneName });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(sceneItems, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting scene items: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // CreateSceneItem tool
  server.tool(
    "obs-create-scene-item",
    "Create a scene item for a source in a scene",
    {
      sceneName: z.string().describe("The scene to add the source to"),
      sourceName: z.string().describe("The name of the source to add"),
      enabled: z.boolean().optional().describe("Whether the scene item is enabled/visible (default: true)")
    },
    { destructiveHint: false, idempotentHint: false },
    async ({ sceneName, sourceName, enabled = true }) => {
      try {
        const response = await client.sendRequest("CreateSceneItem", {
          sceneName,
          sourceName,
          sceneItemEnabled: enabled
        });

        return {
          content: [
            {
              type: "text",
              text: `Successfully added ${sourceName} to ${sceneName} with ID: ${response.sceneItemId}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating scene item: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // RemoveSceneItem tool
  server.tool(
    "obs-remove-scene-item",
    "Remove a scene item from a scene",
    {
      sceneName: z.string().describe("The scene to remove the item from"),
      sceneItemId: z.number().describe("The ID of the scene item to remove")
    },
    { destructiveHint: true, idempotentHint: true },
    async ({ sceneName, sceneItemId }) => {
      try {
        await client.sendRequest("RemoveSceneItem", { sceneName, sceneItemId });

        return {
          content: [
            {
              type: "text",
              text: `Successfully removed item with ID ${sceneItemId} from ${sceneName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error removing scene item: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetSceneItemEnabled tool
  server.tool(
    "obs-set-scene-item-enabled",
    "Show or hide a scene item",
    {
      sceneName: z.string().describe("The scene that the source belongs to"),
      sceneItemId: z.number().describe("The ID of the scene item"),
      enabled: z.boolean().describe("Whether to show (true) or hide (false) the item")
    },
    { destructiveHint: false, idempotentHint: true },
    async ({ sceneName, sceneItemId, enabled }) => {
      try {
        await client.sendRequest("SetSceneItemEnabled", {
          sceneName,
          sceneItemId,
          sceneItemEnabled: enabled
        });

        return {
          content: [
            {
              type: "text",
              text: `Successfully ${enabled ? "showed" : "hid"} item with ID ${sceneItemId} in ${sceneName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting scene item visibility: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetSceneItemTransform tool
  server.tool(
    "obs-get-scene-item-transform",
    "Get the position, rotation, scale, or crop of a scene item",
    {
      sceneName: z.string().describe("The scene the item is in"),
      sceneItemId: z.number().describe("The ID of the scene item")
    },
    { readOnlyHint: true },
    async ({ sceneName, sceneItemId }) => {
      try {
        const response = await client.sendRequest("GetSceneItemTransform", { sceneName, sceneItemId });
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
              text: `Error getting scene item transform: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetSceneItemTransform tool
  server.tool(
    "obs-set-scene-item-transform",
    "Set the position, rotation, scale, or crop of a scene item",
    {
      sceneName: z.string().describe("The scene the item is in"),
      sceneItemId: z.number().describe("The ID of the scene item"),
      positionX: z.number().optional().describe("The x position"),
      positionY: z.number().optional().describe("The y position"),
      rotation: z.number().optional().describe("The rotation in degrees"),
      scaleX: z.number().optional().describe("The x scale factor"),
      scaleY: z.number().optional().describe("The y scale factor"),
      cropTop: z.number().optional().describe("The number of pixels cropped off the top"),
      cropBottom: z.number().optional().describe("The number of pixels cropped off the bottom"),
      cropLeft: z.number().optional().describe("The number of pixels cropped off the left"),
      cropRight: z.number().optional().describe("The number of pixels cropped off the right")
    },
    { destructiveHint: false, idempotentHint: true },
    async (params) => {
      try {
        const { sceneName, sceneItemId, ...transformParams } = params;

        // Build the transform object
        const sceneItemTransform: Record<string, any> = {};

        if (transformParams.positionX !== undefined || transformParams.positionY !== undefined) {
          sceneItemTransform.positionX = transformParams.positionX;
          sceneItemTransform.positionY = transformParams.positionY;
        }

        if (transformParams.rotation !== undefined) {
          sceneItemTransform.rotation = transformParams.rotation;
        }

        if (transformParams.scaleX !== undefined || transformParams.scaleY !== undefined) {
          sceneItemTransform.scaleX = transformParams.scaleX;
          sceneItemTransform.scaleY = transformParams.scaleY;
        }

        if (transformParams.cropTop !== undefined || transformParams.cropBottom !== undefined ||
          transformParams.cropLeft !== undefined || transformParams.cropRight !== undefined) {
          if (transformParams.cropTop !== undefined) sceneItemTransform.cropTop = transformParams.cropTop;
          if (transformParams.cropBottom !== undefined) sceneItemTransform.cropBottom = transformParams.cropBottom;
          if (transformParams.cropLeft !== undefined) sceneItemTransform.cropLeft = transformParams.cropLeft;
          if (transformParams.cropRight !== undefined) sceneItemTransform.cropRight = transformParams.cropRight;
        }

        await client.sendRequest("SetSceneItemTransform", {
          sceneName,
          sceneItemId,
          sceneItemTransform
        });

        return {
          content: [
            {
              type: "text",
              text: `Successfully updated transform for item with ID ${sceneItemId} in ${sceneName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting scene item transform: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetSceneItemIdByName tool
  server.tool(
    "obs-get-scene-item-id",
    "Get the ID of a scene item by its source name",
    {
      sceneName: z.string().describe("The scene name to search in"),
      sourceName: z.string().describe("The source name to find")
    },
    { readOnlyHint: true },
    async ({ sceneName, sourceName }) => {
      try {
        const response = await client.sendRequest("GetSceneItemId", {
          sceneName,
          sourceName
        });

        return {
          content: [
            {
              type: "text",
              text: `Scene item ID for ${sourceName} in ${sceneName}: ${response.sceneItemId}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting scene item ID: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );
}