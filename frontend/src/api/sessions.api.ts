import api from "@/lib/axios"
import type { GameSession, GameSessionSummary, ChooseOptionRequest } from "@/types/game"

export const sessionsApi = {
  start: async (storyId: number): Promise<GameSession> => {
    const res = await api.post("/sessions/start", { story_id: storyId })
    return res.data
  },

  choose: async (sessionId: number, data: ChooseOptionRequest): Promise<GameSession> => {
    const res = await api.post(`/sessions/${sessionId}/choose`, data)
    return res.data
  },

  get: async (sessionId: number): Promise<GameSession> => {
    const res = await api.get(`/sessions/${sessionId}`)
    return res.data
  },

  list: async (): Promise<GameSessionSummary[]> => {
    const res = await api.get("/sessions/")
    return res.data
  },
}