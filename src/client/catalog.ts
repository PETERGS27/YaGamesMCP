import type { YandexGame, YandexCategory } from '../types.js'

const BASE = 'https://yandex.ru/games'

export class CatalogClient {
  async fetchPage(path: string): Promise<string> {
    const res = await fetch(`${BASE}${path}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    })
    if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`)
    return res.text()
  }

  extractAppData(html: string): Record<string, unknown> {
    const match = html.match(/__appData__"[^>]*>\s*(\{.+?\})\s*(?:<|$)/)
    if (!match) throw new Error('Could not find __appData__ in page')
    let raw = match[1]
    let depth = 0
    for (let i = 0; i < raw.length; i++) {
      if (raw[i] === '{') depth++
      else if (raw[i] === '}') depth--
      if (depth === 0) {
        raw = raw.slice(0, i + 1)
        break
      }
    }
    return JSON.parse(raw) as Record<string, unknown>
  }

  extractCategoriesFromHtml(html: string): YandexCategory[] {
    const data = this.extractAppData(html)
    const raw = data.categoriesForTabs as Array<{ name: string; title: string; gamesCount: number }>
    if (!raw) throw new Error('categoriesForTabs not found in __appData__')
    return raw.map((c, i) => ({
      id: i + 1,
      name: c.name,
      title: c.title,
      gamesCount: c.gamesCount,
    }))
  }

  extractGamesFromHtml(html: string, limit = 20): YandexGame[] {
    const games: YandexGame[] = []
    const seen = new Set<string>()

    const cardRegex = /data-testid="game-card-(\d+)"/g
    let match

    while ((match = cardRegex.exec(html)) !== null) {
      const appID = match[1]
      if (seen.has(appID) || games.length >= limit) continue
      seen.add(appID)

      const pos = match.index
      const context = html.slice(Math.max(0, pos - 300), pos + 800)

      const altMatch = context.match(/alt="([^"]+)"/)
      const title = altMatch ? altMatch[1] : `Game #${appID}`

      const srcMatch = context.match(/src="([^"]+?)"/)
      const coverURL = srcMatch ? srcMatch[1] : ''

      const url = `https://yandex.ru/games/app/${appID}`

      games.push({ appID, title: this.unescapeHtml(title), url, coverURL })
    }

    return games.slice(0, limit)
  }

  unescapeHtml(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
  }

  async searchGames(query: string): Promise<YandexGame[]> {
    const html = await this.fetchPage(`/search?q=${encodeURIComponent(query)}`)
    return this.extractGamesFromHtml(html, 30)
  }

  async getPopularGames(category?: string): Promise<YandexGame[]> {
    const path = category ? `/category/${encodeURIComponent(category)}` : '/'
    const html = await this.fetchPage(path)
    return this.extractGamesFromHtml(html, 30)
  }

  async getCategories(): Promise<YandexCategory[]> {
    const html = await this.fetchPage('/')
    return this.extractCategoriesFromHtml(html)
  }
}
