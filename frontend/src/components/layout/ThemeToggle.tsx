import { Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useThemeStore } from "@/store/theme.store"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-9 w-9 rounded-full border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Sun className="h-4 w-4 text-primary" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Moon className="h-4 w-4 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
}