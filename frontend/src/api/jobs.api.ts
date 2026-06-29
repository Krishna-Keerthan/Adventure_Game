import api from "@/lib/axios"
import type { StoryJob } from "@/types/story"

export const jobsApi = {
  getStatus: async (jobId: string): Promise<StoryJob> => {
    const res = await api.get(`/jobs/${jobId}`)
    return res.data
  },
}