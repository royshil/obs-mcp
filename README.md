# OBS MCP Server

An MCP server for OBS Studio that provides tools to control OBS via the OBS WebSocket protocol.

## Features

- Connect to OBS WebSocket server
- Control OBS via MCP tools
- Provides tools for:
  - General operations
  - Scene management
  - Source control
  - Scene item manipulation
  - Streaming and recording
  - Transitions


## Usage

1. Make sure OBS Studio is running with WebSocket server enabled (Tools > WebSocket Server Settings). Note the password for the WS.
2. Set the WebSocket password in environment variable (if needed):

```bash
export OBS_WEBSOCKET_PASSWORD="your_password_here"
```

3. Add the MCP server to Claude desktop with the MCP server settings:

```json
{
  "mcpServers": {
    "obs": {
      "command": "npx",
      "args": ["-y", "obs-mcp@latest"],
      "env": {
        "OBS_WEBSOCKET_PASSWORD": "<password_from_obs>"
      }
    }
  }
}
```

4. Use Claude to control your OBS!

### Connection mode

By default the server connects to OBS at startup and, while OBS isn't running, keeps checking in the background so it can connect as soon as OBS starts.

If you'd rather the server stayed idle until you actually use it, set `OBS_CONNECTION_MODE=on-demand`. The server then makes no connection attempts until a tool is called, and connects at that point. `obs-get-status` only reports the current state and never connects.

| Variable | Default | Description |
| --- | --- | --- |
| `OBS_CONNECTION_MODE` | `auto` | `auto` connects at startup and retries in the background. `on-demand` connects only when a tool is called. |
| `OBS_AUTO_LAUNCH` | `false` | On-demand mode only: if OBS isn't running when a tool is called, launch it and wait for its WebSocket server. |
| `OBS_LAUNCH_COMMAND` | `open -a OBS` (macOS), `obs` (Linux) | Command used to launch OBS. Runs in a shell. Required on Windows, where OBS must start from its own folder, for example `cd /d "C:\Program Files\obs-studio\bin\64bit" && start obs64.exe`. |
| `OBS_LAUNCH_TIMEOUT` | `60` | Seconds to wait for OBS to accept a connection after launching it. |

```json
"env": {
  "OBS_WEBSOCKET_PASSWORD": "<password_from_obs>",
  "OBS_CONNECTION_MODE": "on-demand",
  "OBS_AUTO_LAUNCH": "true"
}
```

## Development

If you want to run the server locally using the code in this git repo, you can do the following:


```bash
npm run build
npm run start
```

Then configure Claude desktop:

```json
{
  "mcpServers": {
    "obs": {
      "command": "node",
      "args": [
        "<obs-mcp_root>/build/index.js"
      ],
      "env": {
        "OBS_WEBSOCKET_PASSWORD": "<password_from_obs>"
      }
    }
  }
}
```

## Available Tools

The server provides tools organized by category:

- General tools: Version info, stats, hotkeys, studio mode
- Scene tools: List scenes, switch scenes, create/remove scenes
- Source tools: Manage sources, settings, audio levels, mute/unmute
- Scene item tools: Manage items in scenes (position, visibility, etc.)
- Streaming tools: Start/stop streaming, recording, virtual camera
- Transition tools: Set transitions, durations, trigger transitions

## Environment Variables

- `OBS_WEBSOCKET_URL`: WebSocket URL (default: ws://localhost:4455)
- `OBS_WEBSOCKET_PASSWORD`: Password for authenticating with OBS WebSocket (if required)

## Requirements

- Node.js 16+
- OBS Studio 31+ with WebSocket server enabled
- Claude desktop

## License

See the [LICENSE](LICENSE) file for details.