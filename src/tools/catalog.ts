import type { ToolResponse } from '../types.js'
import { CatalogClient } from '../client/catalog.js'

const catalog = new CatalogClient()

export async function searchGames(query: string): Promise<ToolResponse> {
  try {
    const games = await catalog.searchGames(query)
    return { content: [{ type: 'text', text: JSON.stringify({ games }, null, 2) }] }
  } catch (err) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: String(err) }) }], isError: true }
  }
}

export async function getPopularGames(category?: string): Promise<ToolResponse> {
  try {
    const games = await catalog.getPopularGames(category)
    return { content: [{ type: 'text', text: JSON.stringify({ games }, null, 2) }] }
  } catch (err) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: String(err) }) }], isError: true }
  }
}

export async function listCategories(): Promise<ToolResponse> {
  try {
    const categories = await catalog.getCategories()
    return { content: [{ type: 'text', text: JSON.stringify(categories, null, 2) }] }
  } catch (err) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: String(err) }) }], isError: true }
  }
}
