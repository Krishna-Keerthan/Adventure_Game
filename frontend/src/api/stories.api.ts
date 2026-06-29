import api from "@/lib/axios"
import type { Story, StoryJob, CreateStoryRequest } from "@/types/story"

export const storiesApi = {
  create: async (data: CreateStoryRequest): Promise<StoryJob> => {
    const res = await api.post("/stories/create", data)
    return res.data
  },

  getComplete: async (storyId: number): Promise<Story> => {
    const res = await api.get(`/stories/${storyId}/complete`)
    return res.data
  },
}