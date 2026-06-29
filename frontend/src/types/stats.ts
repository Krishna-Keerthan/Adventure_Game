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

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
}