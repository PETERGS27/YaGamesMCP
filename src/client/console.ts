import type { AuthCredentials, GameDraft, ModerationResult, GameBuild } from '../types.js'

const CONSOLE_BASE = 'https://games.yandex.ru/console'

export class ConsoleClient {
  private auth: AuthCredentials

  constructor(auth: AuthCredentials) {
    this.auth = auth
  }

  private get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-CSRF-Token': this.auth.csrfToken,
      Cookie: `Session_id=${this.auth.sessionCookie}`,
    }
  }

  async createDraft(draft: GameDraft): Promise<{ appId: string }> {
    const res = await fetch(`${CONSOLE_BASE}/api/application`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(draft),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Failed to create draft: ${res.status} - ${err}`)
    }

    return res.json() as Promise<{ appId: string }>
  }

  async updateDraft(appId: string, draft: Partial<GameDraft>): Promise<void> {
    const res = await fetch(`${CONSOLE_BASE}/api/application/${appId}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(draft),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Failed to update draft: ${res.status} - ${err}`)
    }
  }

  async uploadBuild(appId: string, build: GameBuild): Promise<void> {
    const formData = new FormData()
    formData.append('version', build.version)
    formData.append('archive', new Blob([build.archivePath]), 'game.zip')

    const res = await fetch(`${CONSOLE_BASE}/api/application/${appId}/builds`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': this.auth.csrfToken,
        Cookie: `Session_id=${this.auth.sessionCookie}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Failed to upload build: ${res.status} - ${err}`)
    }
  }

  async uploadScreenshot(appId: string, filePath: string, type: 'desktop' | 'mobile'): Promise<void> {
    const formData = new FormData()
    formData.append('type', type)
    formData.append('file', new Blob([filePath]))

    const res = await fetch(`${CONSOLE_BASE}/api/application/${appId}/screenshots`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': this.auth.csrfToken,
        Cookie: `Session_id=${this.auth.sessionCookie}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Failed to upload screenshot: ${res.status} - ${err}`)
    }
  }

  async uploadIcon(appId: string, filePath: string): Promise<void> {
    const formData = new FormData()
    formData.append('icon', new Blob([filePath]))

    const res = await fetch(`${CONSOLE_BASE}/api/application/${appId}/icon`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': this.auth.csrfToken,
        Cookie: `Session_id=${this.auth.sessionCookie}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Failed to upload icon: ${res.status} - ${err}`)
    }
  }

  async uploadCover(appId: string, filePath: string): Promise<void> {
    const formData = new FormData()
    formData.append('cover', new Blob([filePath]))

    const res = await fetch(`${CONSOLE_BASE}/api/application/${appId}/cover`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': this.auth.csrfToken,
        Cookie: `Session_id=${this.auth.sessionCookie}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Failed to upload cover: ${res.status} - ${err}`)
    }
  }

  async submitForModeration(appId: string): Promise<ModerationResult> {
    const res = await fetch(`${CONSOLE_BASE}/api/application/${appId}/moderation`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ action: 'submit' }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Failed to submit for moderation: ${res.status} - ${err}`)
    }

    return res.json() as Promise<ModerationResult>
  }

  async publishGame(appId: string): Promise<void> {
    const res = await fetch(`${CONSOLE_BASE}/api/application/${appId}/publish`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ action: 'publish' }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Failed to publish: ${res.status} - ${err}`)
    }
  }

  async getGameStatus(appId: string): Promise<{
    status: string
    moderationStatus: string
    draftStatus: string
  }> {
    const res = await fetch(`${CONSOLE_BASE}/api/application/${appId}`, {
      headers: this.headers,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Failed to get game status: ${res.status} - ${err}`)
    }

    const data = await res.json()
    return {
      status: data.status ?? 'unknown',
      moderationStatus: data.moderationStatus ?? 'unknown',
      draftStatus: data.draftStatus ?? 'unknown',
    }
  }

  async listMyGames(): Promise<{ appId: string; title: string; status: string }[]> {
    const params = new URLSearchParams({
      'page-size': '100',
      'page-number': '0',
      'relation_context': '-1',
      'filter-field': 'hide-delete-drafts:true',
      'filter-mode': 'and',
      'order-by': 'version.changed:desc',
    })

    const res = await fetch(`${CONSOLE_BASE}/api/applications?${params}`, {
      headers: this.headers,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Failed to list games: ${res.status} - ${err}`)
    }

    const data = await res.json()
    if (Array.isArray(data)) return data
    return data.applications ?? data.games ?? []
  }
}
