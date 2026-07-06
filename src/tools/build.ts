import { readFileSync } from 'node:fs'
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

export async function uploadGameBuild(
  appId: string,
  archivePath: string,
  version?: string
): Promise<ToolResponse> {
  try {
    const client = getClient()
    const data = readFileSync(archivePath)
    const build = {
      version: version ?? '0.0.0.1',
      archivePath: data.toString('base64'),
      uploadedAt: new Date().toISOString(),
    }
    await client.uploadBuild(appId, build)
    return {
      content: [
        {
          type: 'text',
          text: `Build uploaded successfully for app ${appId} (version: ${build.version}).\nNext: submit for moderation or upload visual assets.`,
        },
      ],
    }
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err}` }], isError: true }
  }
}
