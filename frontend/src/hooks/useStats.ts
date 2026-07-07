import { useQuery } from "@tanstack/react-query"
import { statsApi } from "@/api/stats.api"

export function useMyStats() {
  return useQuery({
    queryKey: ["stats", "me"],
    queryFn: statsApi.me,
    staleTime: 1000 * 30,
  })
}

export function useMyRank() {
  return useQuery({
    queryKey: ["stats", "me", "rank"],
    queryFn: statsApi.myRank,
    staleTime: 1000 * 60,
  })
}

export function useLeaderboard(page: number, tier: number | null) {
  return useQuery({
    queryKey: ["leaderboard", page, tier],
    queryFn: () => statsApi.leaderboard(page, tier),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev, // keeps previous page visible while loading next
  })
}