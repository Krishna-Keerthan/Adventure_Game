import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { authApi } from "@/api/auth.api"
import { useAuthStore } from "@/store/auth.store"
import type { LoginSchema, RegisterSchema } from "@/lib/schemas/auth"

export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginSchema) => authApi.login(data),
    onSuccess: (data) => {
      setAuth(data.access_token, data.user)
      navigate("/dashboard")
    },
  })
}

export function useRegister() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: Omit<RegisterSchema, "confirmPassword">) =>
      authApi.register(data),
    onSuccess: (data) => {
      setAuth(data.access_token, data.user)
      navigate("/dashboard")
    },
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  return () => {
    logout()
    navigate("/")
  }
}