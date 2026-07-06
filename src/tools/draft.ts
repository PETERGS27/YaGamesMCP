import type { AuthCredentials, GameDraft, ToolResponse } from '../types.js'
import { ConsoleClient } from '../client/console.js'

function getClient(): ConsoleClient {
  const sessionCookie = process.env.YAGAMES_SESSION_COOKIE
  const csrfToken = process.env.YAGAMES_CSRF_TOKEN
  if (!sessionCookie || !csrfToken) {
    throw new Error(
      'YAGAMES_SESSION_COOKIE and YAGAMES_CSRF_TOKEN environment variables are required.\n' +
        'Obtain them from your browser DevTools after logging in at https://games.yandex.ru/console'
    )
  }
  return new ConsoleClient({ sessionCookie, csrfToken })
}

export async function createGameDraft(draft: GameDraft): Promise<ToolResponse> {
  try {
    const client = getClient()
    const result = await client.createDraft(draft)
    return {
      content: [
        {
          type: 'text',
          text: `Draft created successfully.\nApp ID: ${result.appId}\n\nNext steps:\n1. Upload game build: yagames-upload-build --app-id ${result.appId} --archive ./game.zip\n2. Upload icon (512x512 PNG)\n3. Upload cover (800x470 PNG)\n4. Upload screenshots\n5. Submit for moderation`,
        },
      ],
    }
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err}` }], isError: true }
  }
}

export async function updateGameDraft(appId: string, draft: Partial<GameDraft>): Promise<ToolResponse> {
  try {
    const client = getClient()
    await client.updateDraft(appId, draft)
    return { content: [{ type: 'text', text: `Draft ${appId} updated successfully.` }] }
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err}` }], isError: true }
  }
}
