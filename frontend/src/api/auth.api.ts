import api from "@/lib/axios"
import type { LoginRequest, RegisterRequest, TokenResponse, User } from "@/types/auth"

export const authApi = {
  register: async (data: RegisterRequest): Promise<TokenResponse> => {
    const res = await api.post("/auth/register", data)
    return res.data
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const res = await api.post("/auth/login", data)
    return res.data
  },

  me: async (): Promise<User> => {
    const res = await api.get("/auth/me")
    return res.data
  },
}