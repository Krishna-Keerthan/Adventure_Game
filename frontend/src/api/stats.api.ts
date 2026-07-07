import api from "@/lib/axios"
import type { UserStats, PaginatedLeaderboardResponse, UserRankResponse } from "@/types/stats"

export const statsApi = {
  me: async (): Promise<UserStats> => {
    const res = await api.get("/stats/me")
    return res.data
  },

  myRank: async (): Promise<UserRankResponse> => {
    const res = await api.get("/stats/me/rank")
    return res.data
  },

  leaderboard: async (
    page: number = 1,
    tier: number | null = null
  ): Promise<PaginatedLeaderboardResponse> => {
    const params: Record<string, string | number> = { page }
    if (tier !== null) params.tier = tier
    const res = await api.get("/stats/leaderboard", { params })
    return res.data
  },
}