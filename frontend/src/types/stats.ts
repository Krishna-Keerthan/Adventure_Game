export interface UserStats {
  username: string
  total_games: number
  wins: number
  losses: number
  in_progress: number
  win_rate: number
}

export interface LeaderboardEntry {
  rank: number
  username: string
  wins: number
  total_games: number
  win_rate: number
}

export interface LeaderboardMeta {
  page: number
  page_size: number
  total_entries: number
  total_pages: number
  tier: number | null
  tier_label: string
  available_tiers: number[]
  total_users: number
}

export interface PaginatedLeaderboardResponse {
  entries: LeaderboardEntry[]
  meta: LeaderboardMeta
}

export interface UserRankResponse {
  rank: number
  username: string
  wins: number
  total_games: number
  win_rate: number
  total_users: number
  percentile: number
}