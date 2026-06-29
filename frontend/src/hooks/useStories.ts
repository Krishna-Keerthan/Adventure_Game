import { useMutation, useQuery } from "@tanstack/react-query"
import { storiesApi } from "@/api/stories.api"

export function useCreateStory() {
  return useMutation({
    mutationFn: storiesApi.create,
  })
}

export function useCompleteStory(storyId: number | null) {
  return useQuery({
    queryKey: ["story", storyId],
    queryFn: () => storiesApi.getComplete(storyId!),
    enabled: !!storyId,
  })
}