import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { sessionsApi } from "@/api/sessions.api"

export function useStartSession() {
  return useMutation({
    mutationFn: sessionsApi.start,
    retry: false,
  })
}

export function useChooseOption(sessionId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (optionIndex: number) =>
      sessionsApi.choose(sessionId, { option_index: optionIndex }),
    onSuccess: (data) => {
      queryClient.setQueryData(["session", sessionId], data)
    },
  })
}

export function useSession(sessionId: number | null) {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => sessionsApi.get(sessionId!),
    enabled: !!sessionId,
  })
}

export function useSessionList() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: sessionsApi.list,
  })
}