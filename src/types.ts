export interface YandexGame {
  appID: string
  title: string
  url: string
  coverURL: string
  rating?: number
}

export interface YandexCategory {
  id: number
  name: string
  title: string
  gamesCount: number
}

export interface GameDraft {
  title: string
  description: string
  ShortDescription?: string
  HowToPlay: string
  SEO?: string
  category: string[]
  tags: string[]
  ageRating: string
  languages: string[]
  orientation: 'portrait' | 'landscape' | 'any'
  platforms: ('desktop' | 'mobile_ios' | 'mobile_android')[]
  cloudSaves: boolean
  developerComment?: string
}

export interface AuthCredentials {
  sessionCookie: string
  csrfToken: string
  developerId?: string
}

export interface ModerationResult {
  status: 'pending' | 'approved' | 'rejected'
  comment?: string
  submittedAt: string
}

export interface GameBuild {
  version: string
  archivePath: string
  uploadedAt: string
}

export type ToolResponse = {
  content: { type: 'text'; text: string }[]
  isError?: boolean
}
