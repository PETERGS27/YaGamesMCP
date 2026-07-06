import type { ToolResponse } from '../types.js'
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

export async function submitForModeration(appId: string): Promise<ToolResponse> {
  try {
    const client = getClient()
    const result = await client.submitForModeration(appId)
    return {
      content: [
        {
          type: 'text',
          text: `Game ${appId} submitted for moderation.\nStatus: ${result.status}\nSubmitted at: ${result.submittedAt}\n\nModeration typically takes 3-5 business days.`,
        },
      ],
    }
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err}` }], isError: true }
  }
}

export async function publishGame(appId: string): Promise<ToolResponse> {
  try {
    const client = getClient()
    await client.publishGame(appId)
    return {
      content: [
        {
          type: 'text',
          text: `Game ${appId} published successfully!\nIt will appear in the Yandex Games catalog shortly.`,
        },
      ],
    }
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err}` }], isError: true }
  }
}
