# yagames-mcp

**MCP server for Yandex Games** — search the catalog, manage game drafts, upload builds, and publish games, all from your MCP client.

[![License: MIT](https://img.shields.io/badge/license-MIT-green)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-%5E1.6.1-blue)](https://github.com/modelcontextprotocol/typescript-sdk)

---

## Features

- **Public catalog** — search games, browse popular titles, list categories (no auth required)
- **Game management** — create and update game drafts
- **Build upload** — upload game ZIP archives as new versions
- **Moderation & publish** — submit for review, publish approved games
- **Status tracking** — check draft/moderation/publish status, list all your games

## Tools

### Public (no auth)

| Tool | Description |
|------|-------------|
| `yagames-search` | Search games by keyword |
| `yagames-popular` | Get popular games, optionally filtered by category |
| `yagames-categories` | List all available genres |

### Authenticated (env vars required)

| Tool | Description |
|------|-------------|
| `yagames-create-draft` | Register a new game in the console |
| `yagames-update-draft` | Update an existing game draft |
| `yagames-upload-build` | Upload a ZIP archive as a new build |
| `yagames-submit-moderation` | Send the game for moderation review |
| `yagames-publish` | Publish a game that passed moderation |
| `yagames-status` | Check status of a specific game |
| `yagames-list-my-games` | List all games on your account |

## Quick start

### Requirements

- **Node.js >= 18**
- npm

### Install & run

```bash
npm install
npm run build
```

### Authenticated tools

Set these environment variables to use the console management tools:

```bash
export YAGAMES_SESSION_COOKIE="your_session_id_value"
export YAGAMES_CSRF_TOKEN="your_csrf_token_value"
```

**How to obtain credentials:**

1. Go to [games.yandex.ru/console](https://games.yandex.ru/console) and log in with your developer account
2. Open DevTools (`F12` / `Cmd+Option+I`)
3. **Session\_id:** Application → Cookies → `games.yandex.ru` → copy `Session_id` value
4. **CSRF token:** Network tab → find a POST request to `/console/api/application` → Request Headers → copy `X-CSRF-Token`

> **Warning:** Credentials grant full access to your developer account. Never share them or commit them to version control.

### Usage with opencode

Add to `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "servers": {
      "yagames-mcp": {
        "command": "node",
        "args": ["/path/to/yagames-mcp/build/index.js"],
        "env": {
          "YAGAMES_SESSION_COOKIE": "your_session_id",
          "YAGAMES_CSRF_TOKEN": "your_csrf_token"
        }
      }
    }
  }
}
```

### Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "yagames-mcp": {
      "command": "node",
      "args": ["/path/to/yagames-mcp/build/index.js"],
      "env": {
        "YAGAMES_SESSION_COOKIE": "your_session_id",
        "YAGAMES_CSRF_TOKEN": "your_csrf_token"
      }
    }
  }
}
```

### npx (from npm)

```bash
npx yagames-mcp
```

## Architecture

```
yagames-mcp/
├── src/
│   ├── index.ts              # MCP server entry (JSON-RPC over stdio)
│   ├── types.ts              # Shared TypeScript types
│   ├── client/
│   │   ├── catalog.ts        # Public catalog client (HTML scraping)
│   │   └── console.ts        # Authenticated console client (REST API)
│   └── tools/
│       ├── catalog.ts        # yagames-search, yagames-popular, yagames-categories
│       ├── draft.ts          # yagames-create-draft, yagames-update-draft
│       ├── build.ts          # yagames-upload-build
│       ├── moderation.ts     # yagames-submit-moderation, yagames-publish
│       └── status.ts         # yagames-status, yagames-list-my-games
├── build/                    # Compiled JS output
├── package.json
└── tsconfig.json
```

### How it works

- **Public catalog** scrapes HTML from `yandex.ru/games` — Yandex Games renders game data server-side in `__appData__` JSON and game-card elements. No API key required.
- **Console API** calls `games.yandex.ru/console/api/application*` with `Session_id` cookie and `X-CSRF-Token` header for authentication.
- **Transport:** stdio (standard MCP protocol). The server speaks JSON-RPC 2.0.

## API endpoints

| Endpoint | Purpose |
|----------|---------|
| `yandex.ru/games/` | Public catalog (HTML) |
| `games.yandex.ru/console/api/application` | Create a game draft |
| `games.yandex.ru/console/api/applications` | List all games |
| `games.yandex.ru/console/api/application/{id}` | Get/update game details |
| `games.yandex.ru/console/api/application/{id}/builds` | Upload build |
| `games.yandex.ru/console/api/application/{id}/moderation` | Submit for review |
| `games.yandex.ru/console/api/application/{id}/publish` | Publish game |

## The Yandex Games platform

[Yandex Games](https://yandex.com/games/) is one of the largest HTML5 game platforms in the CIS region.  
Developer documentation: [yandex.ru/dev/games](https://yandex.ru/dev/games/), with a library of over 2,000 games. The audience is predominantly 55+ (38%), with 58% women and 42% men. Games are monetized through in-game ads. The platform has 27 genre categories.

## License

MIT
