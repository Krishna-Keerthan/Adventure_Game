import { Link, useLocation } from "react-router-dom"
import { Sword, LayoutDashboard, Trophy, LogOut, User, Scroll } from "lucide-react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "./ThemeToggle"
import { useAuthStore } from "@/store/auth.store"
import { useLogout } from "@/hooks/useAuth"

export function Navbar() {
  const { isAuthenticated, user } = useAuthStore()
  const logout = useLogout()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/85 backdrop-blur-xl"
    >
      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="absolute inset-0 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-300" />
              <Sword className="h-4 w-4 text-primary relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span
              className="text-lg font-bold tracking-widest text-foreground group-hover:text-primary transition-colors duration-300"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              QUESTCRAFT
            </span>
          </Link>

          {/* Nav items */}
          <div className="flex items-center gap-1">
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={`text-xs tracking-wider transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                  }`}
                >
                  <Link to="/dashboard" className="flex items-center gap-1.5">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={`text-xs tracking-wider transition-all duration-200 ${
                    isActive("/leaderboard")
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                  }`}
                >
                  <Link to="/leaderboard" className="flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Leaderboard</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={`text-xs tracking-wider transition-all duration-200 ${
                    isActive("/generate")
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                  }`}
                >
                  <Link to="/generate" className="flex items-center gap-1.5">
                    <Scroll className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">New Quest</span>
                  </Link>
                </Button>
              </>
            )}

            <div className="w-px h-5 bg-border/60 mx-1" />
            <ThemeToggle />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-xs tracking-wider ml-1"
                  >
                    <User className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    <span className="hidden sm:inline max-w-24 truncate">{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 border-border/60">
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive cursor-pointer text-xs"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Button variant="ghost" size="sm" asChild className="text-xs">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="text-xs glow-gold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link to="/register">Begin Quest</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}