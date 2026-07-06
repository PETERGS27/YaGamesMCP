import type { AuthCredentials, ToolResponse } from '../types.js'
import { ConsoleClient } from '../client/console.js'

function getClient(): ConsoleClient {
  const sessionCookie = process.env.YAGAMES_SESSION_COOKIE
  const csrfToken = process.env.YAGAMES_CSRF_TOKEN
  if (!sessionCookie || !csrfToken) {
    throw new Error(
      'YAGAMES_SESSION_COOKIE and YAGAMES_CSRF_TOKEN environment variables are required.'
    )
  }
  return new ConsoleClient({ sessionCookie, csrfToken })
}

export async function getGameStatus(appId: string): Promise<ToolResponse> {
  try {
    const client = getClient()
    const status = await client.getGameStatus(appId)
    return {
      content: [
        {
          type: 'text',
          text: [
            `Game ${appId}:`,
            `  Status: ${status.status}`,
            `  Moderation: ${status.moderationStatus}`,
            `  Draft: ${status.draftStatus}`,
          ].join('\n'),
        },
      ],
    }
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err}` }], isError: true }
  }
}

export async function listMyGames(): Promise<ToolResponse> {
  try {
    const client = getClient()
    const games = await client.listMyGames()
    if (games.length === 0) {
      return { content: [{ type: 'text', text: 'No games found for your account.' }] }
    }
    const lines = games.map((g) => `- ${g.title} (ID: ${g.appId}) — ${g.status}`)
    return { content: [{ type: 'text', text: lines.join('\n') }] }
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err}` }], isError: true }
  }
}
