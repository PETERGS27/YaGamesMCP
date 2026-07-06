#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import { searchGames, getPopularGames, listCategories } from './tools/catalog.js'
import { createGameDraft, updateGameDraft } from './tools/draft.js'
import { uploadGameBuild } from './tools/build.js'
import { submitForModeration, publishGame } from './tools/moderation.js'
import { getGameStatus, listMyGames } from './tools/status.js'

const server = new Server(
  {
    name: 'yagames-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ── Catalog (public) ─────────────────────────────────
    {
      name: 'yagames-search',
      description: 'Search games in the Yandex Games catalog by keyword',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search keyword' },
        },
        required: ['query'],
      },
    },
    {
      name: 'yagames-popular',
      description: 'Get popular games from Yandex Games catalog, optionally filtered by category',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Category slug (e.g. casual, puzzles, match3, merge, action). See yagames-categories for full list',
          },
        },
      },
    },
    {
      name: 'yagames-categories',
      description: 'List all available game categories/genres on Yandex Games',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },

    // ── Draft management (authenticated) ─────────────────
    {
      name: 'yagames-create-draft',
      description: 'Create a new game draft in the Yandex Games Console. Requires YAGAMES_SESSION_COOKIE and YAGAMES_CSRF_TOKEN env vars',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Game title (max 50 chars)' },
          description: { type: 'string', description: 'Full description (100-1000 chars)' },
          howToPlay: { type: 'string', description: 'How to play instructions (100-1000 chars)' },
          shortDescription: { type: 'string', description: 'Short description (max 70 chars)' },
          seo: { type: 'string', description: 'SEO description (50-160 chars)' },
          category: {
            type: 'array',
            items: { type: 'string' },
            description: 'Genre categories (max 2)',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tags describing the game (max 20)',
          },
          ageRating: {
            type: 'string',
            enum: ['0', '6', '12', '16', '18'],
            description: 'Age rating',
          },
          languages: {
            type: 'array',
            items: { type: 'string' },
            description: 'Languages the game supports (e.g. ["ru", "en"])',
          },
          orientation: {
            type: 'string',
            enum: ['portrait', 'landscape', 'any'],
            description: 'Screen orientation',
          },
          platforms: {
            type: 'array',
            items: { type: 'string' },
            description: 'Supported platforms: desktop, mobile_ios, mobile_android',
          },
          cloudSaves: {
            type: 'boolean',
            description: 'Whether the game uses cloud saves via SDK',
          },
          developerComment: {
            type: 'string',
            description: 'Comment for moderation team (max 2048 chars)',
          },
        },
        required: ['title', 'description', 'howToPlay', 'category', 'ageRating', 'languages', 'orientation', 'platforms'],
      },
    },
    {
      name: 'yagames-update-draft',
      description: 'Update an existing game draft. Requires authentication env vars',
      inputSchema: {
        type: 'object',
        properties: {
          appId: { type: 'string', description: 'Game ID from the console' },
          title: { type: 'string' },
          description: { type: 'string' },
          howToPlay: { type: 'string' },
          category: { type: 'array', items: { type: 'string' } },
          tags: { type: 'array', items: { type: 'string' } },
          ageRating: { type: 'string', enum: ['0', '6', '12', '16', '18'] },
          languages: { type: 'array', items: { type: 'string' } },
          orientation: { type: 'string', enum: ['portrait', 'landscape', 'any'] },
          platforms: { type: 'array', items: { type: 'string' } },
          cloudSaves: { type: 'boolean' },
        },
        required: ['appId'],
      },
    },

    // ── Build & assets (authenticated) ──────────────────
    {
      name: 'yagames-upload-build',
      description: 'Upload a game ZIP archive as a new build. Requires authentication env vars',
      inputSchema: {
        type: 'object',
        properties: {
          appId: { type: 'string', description: 'Game ID from the console' },
          archivePath: {
            type: 'string',
            description: 'Local path to the ZIP archive containing the game (must have index.html in root)',
          },
          version: {
            type: 'string',
            description: 'Version string (default: 0.0.0.1)',
          },
        },
        required: ['appId', 'archivePath'],
      },
    },

    // ── Moderation & publish (authenticated) ────────────
    {
      name: 'yagames-submit-moderation',
      description: 'Submit a game draft for moderation review. Takes 3-5 business days. Requires auth env vars',
      inputSchema: {
        type: 'object',
        properties: {
          appId: { type: 'string', description: 'Game ID' },
        },
        required: ['appId'],
      },
    },
    {
      name: 'yagames-publish',
      description: 'Publish a game that has passed moderation. Requires auth env vars',
      inputSchema: {
        type: 'object',
        properties: {
          appId: { type: 'string', description: 'Game ID' },
        },
        required: ['appId'],
      },
    },

    // ── Status (authenticated) ───────────────────────────
    {
      name: 'yagames-status',
      description: 'Check the current status of a game (draft, moderation, publish). Requires auth env vars',
      inputSchema: {
        type: 'object',
        properties: {
          appId: { type: 'string', description: 'Game ID' },
        },
        required: ['appId'],
      },
    },
    {
      name: 'yagames-list-my-games',
      description: 'List all games uploaded to your developer account. Requires auth env vars',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  switch (name) {
    // ── Catalog ──────────────────────────────────────────
    case 'yagames-search':
      return searchGames(args?.query as string)
    case 'yagames-popular':
      return getPopularGames(args?.category as string | undefined)
    case 'yagames-categories':
      return listCategories()

    // ── Drafts ───────────────────────────────────────────
    case 'yagames-create-draft':
      return createGameDraft(args as any)
    case 'yagames-update-draft':
      return updateGameDraft(args?.appId as string, args as any)

    // ── Builds ───────────────────────────────────────────
    case 'yagames-upload-build':
      return uploadGameBuild(
        args?.appId as string,
        args?.archivePath as string,
        args?.version as string | undefined
      )

    // ── Moderation ───────────────────────────────────────
    case 'yagames-submit-moderation':
      return submitForModeration(args?.appId as string)
    case 'yagames-publish':
      return publishGame(args?.appId as string)

    // ── Status ───────────────────────────────────────────
    case 'yagames-status':
      return getGameStatus(args?.appId as string)
    case 'yagames-list-my-games':
      return listMyGames()

    default:
      return {
        content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        isError: true,
      }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('yagames-mcp server running on stdio')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
