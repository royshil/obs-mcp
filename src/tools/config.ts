import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OBSWebSocketClient } from "../client.js";
import { z } from "zod";

export async function initialize(server: McpServer, client: OBSWebSocketClient): Promise<void> {
  // GetPersistentData tool
  server.tool(
    "obs-get-persistent-data",
    "Gets the value of a slot from the selected persistent data realm",
    {
      realm: z.string().describe("The data realm to select. OBS_WEBSOCKET_DATA_REALM_GLOBAL or OBS_WEBSOCKET_DATA_REALM_PROFILE"),
      slotName: z.string().describe("The name of the slot to retrieve data from")
    },
    { readOnlyHint: true },
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
  server.tool(
    "obs-set-persistent-data",
    "Sets the value of a slot from the selected persistent data realm",
    {
      realm: z.string().describe("The data realm to select. OBS_WEBSOCKET_DATA_REALM_GLOBAL or OBS_WEBSOCKET_DATA_REALM_PROFILE"),
      slotName: z.string().describe("The name of the slot to set data for"),
      slotValue: z.any().describe("The value to apply to the slot")
    },
    { destructiveHint: false, idempotentHint: true },
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
  server.tool(
    "obs-get-scene-collection-list",
    "Gets an array of all scene collections",
    {},
    { readOnlyHint: true },
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
  server.tool(
    "obs-set-current-scene-collection",
    "Switches to a scene collection",
    {
      sceneCollectionName: z.string().describe("Name of the scene collection to switch to")
    },
    { destructiveHint: false, idempotentHint: true },
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
  server.tool(
    "obs-create-scene-collection",
    "Creates a new scene collection, switching to it in the process",
    {
      sceneCollectionName: z.string().describe("Name for the new scene collection")
    },
    { destructiveHint: false, idempotentHint: false },
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
  server.tool(
    "obs-get-profile-list",
    "Gets an array of all profiles",
    {},
    { readOnlyHint: true },
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
  server.tool(
    "obs-set-current-profile",
    "Switches to a profile",
    {
      profileName: z.string().describe("Name of the profile to switch to")
    },
    { destructiveHint: false, idempotentHint: true },
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
  server.tool(
    "obs-create-profile",
    "Creates a new profile, switching to it in the process",
    {
      profileName: z.string().describe("Name for the new profile")
    },
    { destructiveHint: false, idempotentHint: false },
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
  server.tool(
    "obs-remove-profile",
    "Removes a profile. If the current profile is chosen, it will change to a different profile first",
    {
      profileName: z.string().describe("Name of the profile to remove")
    },
    { destructiveHint: true, idempotentHint: true },
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
  server.tool(
    "obs-get-profile-parameter",
    "Gets a parameter from the current profile's configuration",
    {
      parameterCategory: z.string().describe("Category of the parameter to get"),
      parameterName: z.string().describe("Name of the parameter to get")
    },
    { readOnlyHint: true },
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
  server.tool(
    "obs-set-profile-parameter",
    "Sets the value of a parameter in the current profile's configuration",
    {
      parameterCategory: z.string().describe("Category of the parameter to set"),
      parameterName: z.string().describe("Name of the parameter to set"),
      parameterValue: z.string().nullable().describe("Value of the parameter to set. Use null to delete")
    },
    { destructiveHint: false, idempotentHint: true },
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
  server.tool(
    "obs-get-video-settings",
    "Gets the current video settings",
    {},
    { readOnlyHint: true },
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
  server.tool(
    "obs-set-video-settings",
    "Sets the current video settings",
    {
      fpsNumerator: z.number().min(1).optional().describe("Numerator of the fractional FPS value"),
      fpsDenominator: z.number().min(1).optional().describe("Denominator of the fractional FPS value"),
      baseWidth: z.number().min(1).max(4096).optional().describe("Width of the base (canvas) resolution in pixels"),
      baseHeight: z.number().min(1).max(4096).optional().describe("Height of the base (canvas) resolution in pixels"),
      outputWidth: z.number().min(1).max(4096).optional().describe("Width of the output resolution in pixels"),
      outputHeight: z.number().min(1).max(4096).optional().describe("Height of the output resolution in pixels")
    },
    { destructiveHint: false, idempotentHint: true },
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
  server.tool(
    "obs-get-stream-service-settings",
    "Gets the current stream service settings",
    {},
    { readOnlyHint: true },
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
  server.tool(
    "obs-set-stream-service-settings",
    "Sets the current stream service settings",
    {
      streamServiceType: z.string().describe("Type of stream service to apply. Example: rtmp_common or rtmp_custom"),
      streamServiceSettings: z.record(z.any()).describe("Settings to apply to the service")
    },
    { destructiveHint: false, idempotentHint: true },
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
  server.tool(
    "obs-get-record-directory",
    "Gets the current directory that the record output is set to",
    {},
    { readOnlyHint: true },
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
  server.tool(
    "obs-set-record-directory",
    "Sets the current directory that the record output writes files to",
    {
      recordDirectory: z.string().describe("Output directory")
    },
    { destructiveHint: false, idempotentHint: true },
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