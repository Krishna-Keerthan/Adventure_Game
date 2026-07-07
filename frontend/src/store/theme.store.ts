import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "dark" | "light"

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark"
        set({ theme: next })
        applyTheme(next)
      },
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
    }),
    {
      name: "questcraft-theme",
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    }
  )
)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove("dark", "light")
  root.classList.add(theme)
}

// Apply on initial load before React hydrates
const stored = localStorage.getItem("questcraft-theme")
if (stored) {
  try {
    const parsed = JSON.parse(stored)
    applyTheme(parsed.state?.theme ?? "dark")
  } catch {
    applyTheme("dark")
  }
} else {
  applyTheme("dark")
}