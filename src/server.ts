import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { OBSWebSocketClient } from "./client.js";
import * as tools from "./tools/index.js";
import { enableOnDemandConnection, readOnDemandOptions } from "./on-demand.js";

// Create the OBS WebSocket client
const obsClient = new OBSWebSocketClient(
  process.env.OBS_WEBSOCKET_URL || "ws://localhost:4455",
  process.env.OBS_WEBSOCKET_PASSWORD || null
);

// Create the MCP server
export const server = new McpServer({
  name: "obs-mcp",
  version: "1.0.0",
});

// "auto" (default): connect at startup and keep retrying in the background.
// "on-demand": stay idle and connect only when a tool is called.
const CONNECTION_MODE = process.env.OBS_CONNECTION_MODE === "on-demand" ? "on-demand" : "auto";

export let serverConnected = false;
export let obsConnected = false;
let reconnectInterval: NodeJS.Timeout | null = null;
let connectionCheckInterval: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;
const RECONNECT_INTERVAL = 5000; // 5 seconds (reduced from 10)
const CONNECTION_CHECK_INTERVAL = 1000; // 1 second (reduced from 5)
const MAX_BACKOFF_INTERVAL = 30000; // Max 30 seconds between attempts

const logger = {
  log: (message: string) => console.error(message),
  error: (message: string) => console.error(message),
  debug: (message: string) => console.error(message),
};

// Function to attempt OBS connection
async function attemptOBSConnection(): Promise<void> {
  try {
    logger.log("Attempting to connect to OBS WebSocket...");
    
    // Set a timeout for the connection attempt
    const connectionPromise = obsClient.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Connection timeout after 10 seconds")), 10000);
    });
    
    await Promise.race([connectionPromise, timeoutPromise]);
    logger.log("Connected to OBS WebSocket server");
    obsConnected = true;
    reconnectAttempts = 0;
    
    // Clear any existing reconnect interval
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
    
    // Set up disconnect handler to trigger reconnection
    obsClient.on('disconnected', () => {
      logger.log("OBS WebSocket disconnected, will attempt to reconnect...");
      obsConnected = false;
      startReconnectionTimer();
    });
    
  } catch (obsError) {
    const errorMessage = obsError instanceof Error ? obsError.message : String(obsError);
    logger.error(`Failed to connect to OBS WebSocket: ${errorMessage}`);
    
    if (reconnectAttempts === 0) {
      logger.error("The server will continue running without OBS connection.");
      logger.error("Make sure OBS Studio is running with WebSocket enabled on port 4455");
      logger.error("You can also set OBS_WEBSOCKET_URL and OBS_WEBSOCKET_PASSWORD environment variables");
      logger.error("The server will attempt to reconnect every 5 seconds...");
    }
    
    obsConnected = false;
    reconnectAttempts++;
    
    // Use exponential backoff with a maximum interval
    const backoffInterval = Math.min(RECONNECT_INTERVAL * Math.pow(1.5, Math.min(reconnectAttempts, 3)), MAX_BACKOFF_INTERVAL);
    startReconnectionTimer(backoffInterval);
  }
}

// Function to start reconnection timer with backoff
function startReconnectionTimer(interval?: number): void {
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
  }
  
  const checkInterval = interval || RECONNECT_INTERVAL;
  logger.debug(`Will retry connection in ${checkInterval / 1000} seconds...`);
  
  reconnectInterval = setInterval(async () => {
    if (!obsConnected) {
      logger.log(`Reconnection attempt ${reconnectAttempts + 1}...`);
      await attemptOBSConnection();
    }
  }, checkInterval);
}

// Function to start periodic connection checking
function startConnectionCheckTimer(): void {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
  }
  
  connectionCheckInterval = setInterval(async () => {
    // Only check if we're not currently connected
    if (!obsConnected) {
      logger.debug("Checking if OBS is now available...");
      try {
        // Try a quick connection test
        await attemptOBSConnection();
        if (obsConnected) {
          logger.log("🎉 OBS became available and connection was established!");
        }
      } catch (error) {
        // Silently fail - this is just a check, not a retry
        logger.debug("OBS still not available");
      }
    }
  }, CONNECTION_CHECK_INTERVAL);
}

// Set up server startup logic
export async function startServer() {
  try {
    if (CONNECTION_MODE === "on-demand") {
      enableOnDemandConnection(server, obsClient, readOnDemandOptions());
    }

    // Initialize all tools with the OBS client
    await tools.initialize(server, obsClient);
    logger.log("Initialized MCP tools");

    // Connect the MCP server to stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.log("OBS MCP Server running on stdio");

    serverConnected = true;

    if (CONNECTION_MODE === "auto") {
      // Try to connect to OBS WebSocket (but don't fail if it's not available)
      await attemptOBSConnection();

      // Start the periodic connection check timer
      startConnectionCheckTimer();
    }

    // Set up graceful shutdown
    process.on("SIGINT", handleShutdown);
    process.on("SIGTERM", handleShutdown);
    
    logger.log("Server startup complete");
    
    // Log connection status
    if (CONNECTION_MODE === "on-demand") {
      logger.log("OBS WebSocket: on-demand mode, will connect when a tool is called");
    } else if (obsConnected) {
      logger.log("✅ OBS WebSocket: Connected");
    } else {
      logger.log("❌ OBS WebSocket: Disconnected (will retry automatically)");
      logger.log("💡 The server will also check every 1 second if OBS becomes available");
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error starting server: ${errorMessage}`);
    if (error instanceof Error && error.stack) {
      logger.error(`Stack trace: ${error.stack}`);
    }
    process.exit(1);
  }
}

// Handle graceful shutdown
async function handleShutdown() {
  logger.log("Shutting down...");
  
  // Clear all intervals
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
  
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
    connectionCheckInterval = null;
  }
  
  // Disconnect from OBS if connected
  if (obsConnected) {
    obsClient.disconnect();
  }
  
  process.exit(0);
}

export { obsClient };