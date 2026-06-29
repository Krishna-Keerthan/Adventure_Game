import api from "@/lib/axios"
import type { UserStats, LeaderboardResponse } from "@/types/stats"

export const statsApi = {
  me: async (): Promise<UserStats> => {
    const res = await api.get("/stats/me")
    return res.data
  },

  leaderboard: async (): Promise<LeaderboardResponse> => {
    const res = await api.get("/stats/leaderboard")
    return res.data
  },
}