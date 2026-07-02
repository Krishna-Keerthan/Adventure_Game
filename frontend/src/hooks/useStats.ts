import { useQuery } from "@tanstack/react-query"
import { statsApi } from "@/api/stats.api"

export function useMyStats() {
  return useQuery({
    queryKey: ["stats", "me"],
    queryFn: statsApi.me,
    staleTime: 1000 * 30,
  })
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: statsApi.leaderboard,
    staleTime: 1000 * 60 * 5,
  })
}