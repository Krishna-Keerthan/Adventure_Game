import { useQuery } from "@tanstack/react-query"
import { statsApi } from "@/api/stats.api"

export function useMyStats() {
  return useQuery({
    queryKey: ["stats", "me"],
    queryFn: statsApi.me,
  })
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: statsApi.leaderboard,
  })
}