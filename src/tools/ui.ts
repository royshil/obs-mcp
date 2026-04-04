import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OBSWebSocketClient } from "../client.js";
import { z } from "zod";

export async function initialize(server: McpServer, client: OBSWebSocketClient): Promise<void> {
  // GetStudioModeEnabled tool
  server.registerTool(
    "obs-get-studio-mode",
    {
      title: "Get Studio Mode",
      description: "Gets whether studio mode is enabled",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const response = await client.sendRequest("GetStudioModeEnabled");
        return {
          content: [
            {
              type: "text",
              text: `Studio Mode is ${response.studioModeEnabled ? "enabled" : "disabled"}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error checking studio mode: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // SetStudioModeEnabled tool
  server.registerTool(
    "obs-set-studio-mode",
    {
      title: "Set Studio Mode",
      description: "Enables or disables studio mode",
      inputSchema: {
        studioModeEnabled: z.boolean().describe("Whether to enable (true) or disable (false) Studio Mode")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ studioModeEnabled }) => {
      try {
        await client.sendRequest("SetStudioModeEnabled", { studioModeEnabled });
        return {
          content: [
            {
              type: "text",
              text: `Studio Mode has been ${studioModeEnabled ? "enabled" : "disabled"}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting studio mode: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // OpenInputPropertiesDialog tool
  server.registerTool(
    "obs-open-input-properties",
    {
      title: "Open Input Properties",
      description: "Opens the properties dialog of an input",
      inputSchema: {
        inputName: z.string().optional().describe("Name of the input to open the dialog of"),
        inputUuid: z.string().optional().describe("UUID of the input to open the dialog of")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ inputName, inputUuid }) => {
      try {
        const params: Record<string, any> = {};

        if (inputName !== undefined) {
          params.inputName = inputName;
        }
        if (inputUuid !== undefined) {
          params.inputUuid = inputUuid;
        }

        await client.sendRequest("OpenInputPropertiesDialog", params);
        return {
          content: [
            {
              type: "text",
              text: `Properties dialog opened for input: ${inputName || inputUuid}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error opening input properties dialog: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // OpenInputFiltersDialog tool
  server.registerTool(
    "obs-open-input-filters",
    {
      title: "Open Input Filters",
      description: "Opens the filters dialog of an input",
      inputSchema: {
        inputName: z.string().optional().describe("Name of the input to open the dialog of"),
        inputUuid: z.string().optional().describe("UUID of the input to open the dialog of")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ inputName, inputUuid }) => {
      try {
        const params: Record<string, any> = {};

        if (inputName !== undefined) {
          params.inputName = inputName;
        }
        if (inputUuid !== undefined) {
          params.inputUuid = inputUuid;
        }

        await client.sendRequest("OpenInputFiltersDialog", params);
        return {
          content: [
            {
              type: "text",
              text: `Filters dialog opened for input: ${inputName || inputUuid}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error opening input filters dialog: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // OpenInputInteractDialog tool
  server.registerTool(
    "obs-open-input-interact",
    {
      title: "Open Input Interact",
      description: "Opens the interact dialog of an input",
      inputSchema: {
        inputName: z.string().optional().describe("Name of the input to open the dialog of"),
        inputUuid: z.string().optional().describe("UUID of the input to open the dialog of")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ inputName, inputUuid }) => {
      try {
        const params: Record<string, any> = {};

        if (inputName !== undefined) {
          params.inputName = inputName;
        }
        if (inputUuid !== undefined) {
          params.inputUuid = inputUuid;
        }

        await client.sendRequest("OpenInputInteractDialog", params);
        return {
          content: [
            {
              type: "text",
              text: `Interact dialog opened for input: ${inputName || inputUuid}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error opening input interact dialog: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // GetMonitorList tool
  server.registerTool(
    "obs-get-monitor-list",
    {
      title: "Get Monitor List",
      description: "Gets a list of connected monitors and information about them",
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const response = await client.sendRequest("GetMonitorList");
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
              text: `Error getting monitor list: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // OpenVideoMixProjector tool
  server.registerTool(
    "obs-open-video-mix-projector",
    {
      title: "Open Video Mix Projector",
      description: "Opens a projector for a specific output video mix",
      inputSchema: {
        videoMixType: z.enum([
          "OBS_WEBSOCKET_VIDEO_MIX_TYPE_PREVIEW",
          "OBS_WEBSOCKET_VIDEO_MIX_TYPE_PROGRAM",
          "OBS_WEBSOCKET_VIDEO_MIX_TYPE_MULTIVIEW"
        ]).describe("Type of mix to open"),
        monitorIndex: z.number().optional().describe("Monitor index, use -1 for windowed mode"),
        projectorGeometry: z.string().optional().describe("Size/Position data for a windowed projector")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ videoMixType, monitorIndex, projectorGeometry }) => {
      try {
        const requestParams: Record<string, any> = { videoMixType };
        if (monitorIndex !== undefined) {
          requestParams.monitorIndex = monitorIndex;
        }
        if (projectorGeometry !== undefined) {
          requestParams.projectorGeometry = projectorGeometry;
        }

        await client.sendRequest("OpenVideoMixProjector", requestParams);
        return {
          content: [
            {
              type: "text",
              text: `Video mix projector opened for: ${videoMixType}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error opening video mix projector: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // OpenSourceProjector tool
  server.registerTool(
    "obs-open-source-projector",
    {
      title: "Open Source Projector",
      description: "Opens a projector for a source",
      inputSchema: {
        sourceName: z.string().optional().describe("Name of the source to open a projector for"),
        sourceUuid: z.string().optional().describe("UUID of the source to open a projector for"),
        monitorIndex: z.number().optional().describe("Monitor index, use -1 for windowed mode"),
        projectorGeometry: z.string().optional().describe("Size/Position data for a windowed projector")
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    async ({ sourceName, sourceUuid, monitorIndex, projectorGeometry }) => {
      try {
        const requestParams: Record<string, any> = {};

        if (sourceName !== undefined) {
          requestParams.sourceName = sourceName;
        }
        if (sourceUuid !== undefined) {
          requestParams.sourceUuid = sourceUuid;
        }
        if (monitorIndex !== undefined) {
          requestParams.monitorIndex = monitorIndex;
        }
        if (projectorGeometry !== undefined) {
          requestParams.projectorGeometry = projectorGeometry;
        }

        await client.sendRequest("OpenSourceProjector", requestParams);
        return {
          content: [
            {
              type: "text",
              text: `Source projector opened for: ${sourceName || sourceUuid}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error opening source projector: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );
}
