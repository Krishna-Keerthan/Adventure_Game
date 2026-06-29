import { useQuery } from "@tanstack/react-query"
import { jobsApi } from "@/api/jobs.api"

export function useJobPoller(jobId: string | null) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobsApi.getStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === "completed" || status === "failed") return false
      return 2000
    },
  })
}