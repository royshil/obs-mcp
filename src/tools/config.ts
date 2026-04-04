import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OBSWebSocketClient } from "../client.js";
import { z } from "zod";

export async function initialize(server: McpServer, client: OBSWebSocketClient): Promise<void> {
  // GetPersistentData tool
  server.registerTool(
    "obs-get-persistent-data",
    {
      title: "Get Persistent Data",
      description: "Gets the value of a slot from the selected persistent data realm",
      inputSchema: {
        realm: z.string().describe("The data realm to select. OBS_WEBSOCKET_DATA_REALM_GLOBAL or OBS_WEBSOCKET_DATA_REALM_PROFILE"),
        slotName: z.string().describe("The name of the slot to retrieve data from")
      },
      annotations: { readOnlyHint: true },
    },
    async ({ realm, slotName }) => {
      try {
        const response = await client.sendRequest("GetPersistentData", { realm, slotName });
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
              text: `Error getting persistent data: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetPersistentData tool
  server.registerTool(
    "obs-set-persistent-data",
    {
      title: "Set Persistent Data",
      description: "Sets the value of a slot from the selected persistent data realm",
      inputSchema: {
        realm: z.string().describe("The data realm to select. OBS_WEBSOCKET_DATA_REALM_GLOBAL or OBS_WEBSOCKET_DATA_REALM_PROFILE"),
        slotName: z.string().describe("The name of the slot to set data for"),
        slotValue: z.any().describe("The value to apply to the slot")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ realm, slotName, slotValue }) => {
      try {
        await client.sendRequest("SetPersistentData", { realm, slotName, slotValue });
        return {
          content: [
            {
              type: "text",
              text: `Successfully set value for slot '${slotName}' in realm '${realm}'`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting persistent data: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetSceneCollectionList tool
  server.registerTool(
    "obs-get-scene-collection-list",
    {
      title: "Get Scene Collection List",
      description: "Gets an array of all scene collections",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const response = await client.sendRequest("GetSceneCollectionList");
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
              text: `Error getting scene collection list: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetCurrentSceneCollection tool
  server.registerTool(
    "obs-set-current-scene-collection",
    {
      title: "Set Current Scene Collection",
      description: "Switches to a scene collection",
      inputSchema: {
        sceneCollectionName: z.string().describe("Name of the scene collection to switch to")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ sceneCollectionName }) => {
      try {
        await client.sendRequest("SetCurrentSceneCollection", { sceneCollectionName });
        return {
          content: [
            {
              type: "text",
              text: `Successfully switched to scene collection: ${sceneCollectionName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error switching scene collection: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // CreateSceneCollection tool
  server.registerTool(
    "obs-create-scene-collection",
    {
      title: "Create Scene Collection",
      description: "Creates a new scene collection, switching to it in the process",
      inputSchema: {
        sceneCollectionName: z.string().describe("Name for the new scene collection")
      },
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async ({ sceneCollectionName }) => {
      try {
        await client.sendRequest("CreateSceneCollection", { sceneCollectionName });
        return {
          content: [
            {
              type: "text",
              text: `Successfully created and switched to scene collection: ${sceneCollectionName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating scene collection: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetProfileList tool
  server.registerTool(
    "obs-get-profile-list",
    {
      title: "Get Profile List",
      description: "Gets an array of all profiles",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const response = await client.sendRequest("GetProfileList");
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
              text: `Error getting profile list: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetCurrentProfile tool
  server.registerTool(
    "obs-set-current-profile",
    {
      title: "Set Current Profile",
      description: "Switches to a profile",
      inputSchema: {
        profileName: z.string().describe("Name of the profile to switch to")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ profileName }) => {
      try {
        await client.sendRequest("SetCurrentProfile", { profileName });
        return {
          content: [
            {
              type: "text",
              text: `Successfully switched to profile: ${profileName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error switching profile: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // CreateProfile tool
  server.registerTool(
    "obs-create-profile",
    {
      title: "Create Profile",
      description: "Creates a new profile, switching to it in the process",
      inputSchema: {
        profileName: z.string().describe("Name for the new profile")
      },
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    async ({ profileName }) => {
      try {
        await client.sendRequest("CreateProfile", { profileName });
        return {
          content: [
            {
              type: "text",
              text: `Successfully created and switched to profile: ${profileName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating profile: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // RemoveProfile tool
  server.registerTool(
    "obs-remove-profile",
    {
      title: "Remove Profile",
      description: "Removes a profile. If the current profile is chosen, it will change to a different profile first",
      inputSchema: {
        profileName: z.string().describe("Name of the profile to remove")
      },
      annotations: { destructiveHint: true, idempotentHint: true },
    },
    async ({ profileName }) => {
      try {
        await client.sendRequest("RemoveProfile", { profileName });
        return {
          content: [
            {
              type: "text",
              text: `Successfully removed profile: ${profileName}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error removing profile: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetProfileParameter tool
  server.registerTool(
    "obs-get-profile-parameter",
    {
      title: "Get Profile Parameter",
      description: "Gets a parameter from the current profile's configuration",
      inputSchema: {
        parameterCategory: z.string().describe("Category of the parameter to get"),
        parameterName: z.string().describe("Name of the parameter to get")
      },
      annotations: { readOnlyHint: true },
    },
    async ({ parameterCategory, parameterName }) => {
      try {
        const response = await client.sendRequest("GetProfileParameter", { parameterCategory, parameterName });
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
              text: `Error getting profile parameter: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetProfileParameter tool
  server.registerTool(
    "obs-set-profile-parameter",
    {
      title: "Set Profile Parameter",
      description: "Sets the value of a parameter in the current profile's configuration",
      inputSchema: {
        parameterCategory: z.string().describe("Category of the parameter to set"),
        parameterName: z.string().describe("Name of the parameter to set"),
        parameterValue: z.string().nullable().describe("Value of the parameter to set. Use null to delete")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ parameterCategory, parameterName, parameterValue }) => {
      try {
        await client.sendRequest("SetProfileParameter", { parameterCategory, parameterName, parameterValue });
        return {
          content: [
            {
              type: "text",
              text: `Successfully set parameter '${parameterName}' in category '${parameterCategory}'`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting profile parameter: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetVideoSettings tool
  server.registerTool(
    "obs-get-video-settings",
    {
      title: "Get Video Settings",
      description: "Gets the current video settings",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const response = await client.sendRequest("GetVideoSettings");
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
              text: `Error getting video settings: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetVideoSettings tool
  server.registerTool(
    "obs-set-video-settings",
    {
      title: "Set Video Settings",
      description: "Sets the current video settings",
      inputSchema: {
        fpsNumerator: z.number().min(1).optional().describe("Numerator of the fractional FPS value"),
        fpsDenominator: z.number().min(1).optional().describe("Denominator of the fractional FPS value"),
        baseWidth: z.number().min(1).max(4096).optional().describe("Width of the base (canvas) resolution in pixels"),
        baseHeight: z.number().min(1).max(4096).optional().describe("Height of the base (canvas) resolution in pixels"),
        outputWidth: z.number().min(1).max(4096).optional().describe("Width of the output resolution in pixels"),
        outputHeight: z.number().min(1).max(4096).optional().describe("Height of the output resolution in pixels")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async (params) => {
      try {
        // Only include parameters that were provided
        const requestParams: Record<string, any> = {};
        if (params.fpsNumerator !== undefined) requestParams.fpsNumerator = params.fpsNumerator;
        if (params.fpsDenominator !== undefined) requestParams.fpsDenominator = params.fpsDenominator;
        if (params.baseWidth !== undefined) requestParams.baseWidth = params.baseWidth;
        if (params.baseHeight !== undefined) requestParams.baseHeight = params.baseHeight;
        if (params.outputWidth !== undefined) requestParams.outputWidth = params.outputWidth;
        if (params.outputHeight !== undefined) requestParams.outputHeight = params.outputHeight;

        await client.sendRequest("SetVideoSettings", requestParams);
        return {
          content: [
            {
              type: "text",
              text: "Successfully updated video settings"
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting video settings: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetStreamServiceSettings tool
  server.registerTool(
    "obs-get-stream-service-settings",
    {
      title: "Get Stream Service Settings",
      description: "Gets the current stream service settings",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const response = await client.sendRequest("GetStreamServiceSettings");
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
              text: `Error getting stream service settings: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetStreamServiceSettings tool
  server.registerTool(
    "obs-set-stream-service-settings",
    {
      title: "Set Stream Service Settings",
      description: "Sets the current stream service settings",
      inputSchema: {
        streamServiceType: z.string().describe("Type of stream service to apply. Example: rtmp_common or rtmp_custom"),
        streamServiceSettings: z.record(z.any()).describe("Settings to apply to the service")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ streamServiceType, streamServiceSettings }) => {
      try {
        await client.sendRequest("SetStreamServiceSettings", { streamServiceType, streamServiceSettings });
        return {
          content: [
            {
              type: "text",
              text: `Successfully updated stream service settings to type: ${streamServiceType}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting stream service settings: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetRecordDirectory tool
  server.registerTool(
    "obs-get-record-directory",
    {
      title: "Get Record Directory",
      description: "Gets the current directory that the record output is set to",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const response = await client.sendRequest("GetRecordDirectory");
        return {
          content: [
            {
              type: "text",
              text: response.recordDirectory
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting record directory: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetRecordDirectory tool
  server.registerTool(
    "obs-set-record-directory",
    {
      title: "Set Record Directory",
      description: "Sets the current directory that the record output writes files to",
      inputSchema: {
        recordDirectory: z.string().describe("Output directory")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ recordDirectory }) => {
      try {
        await client.sendRequest("SetRecordDirectory", { recordDirectory });
        return {
          content: [
            {
              type: "text",
              text: `Successfully set record directory to: ${recordDirectory}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting record directory: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );
}
