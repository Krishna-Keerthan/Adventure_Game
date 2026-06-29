import { Link } from "react-router-dom"
import { motion } from "motion/react"
import {
  Sword,
  Trophy,
  Target,
  TrendingUp,
  Plus,
  Play,
  BookOpen,
  Skull,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { StatsCard } from "@/components/game/StatsCard"
import { useMyStats } from "@/hooks/useStats"
import { useSessionList } from "@/hooks/useSessions"
import { useAuthStore } from "@/store/auth.store"
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils"

export function Dashboard() {
  const { user } = useAuthStore()
  const { data: stats, isLoading: statsLoading } = useMyStats()
  const { data: sessions, isLoading: sessionsLoading } = useSessionList()

  return (
    <PageWrapper>
      <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back,{" "}
              <span className="text-primary text-glow">{user?.username}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Ready for another adventure?
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button className="glow" asChild>
              <Link to="/generate">
                <Plus className="h-4 w-4 mr-2" />
                New Adventure
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Stats */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatsCard
              label="Total Games"
              value={stats.total_games}
              icon={<BookOpen className="h-4 w-4" />}
              delay={0}
            />
            <StatsCard
              label="Victories"
              value={stats.wins}
              icon={<Trophy className="h-4 w-4" />}
              color="text-emerald-400"
              delay={0.1}
            />
            <StatsCard
              label="Defeats"
              value={stats.losses}
              icon={<Skull className="h-4 w-4" />}
              color="text-red-400"
              delay={0.2}
            />
            <StatsCard
              label="Win Rate"
              value={`${stats.win_rate}%`}
              icon={<TrendingUp className="h-4 w-4" />}
              color="text-amber-400"
              delay={0.3}
            />
          </div>
        )}

        {/* Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="gradient-border bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sword className="h-5 w-5 text-primary" />
                Your Adventures
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/leaderboard">
                  <Trophy className="h-4 w-4 mr-1" />
                  Leaderboard
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-lg bg-muted/30 animate-pulse"
                    />
                  ))}
                </div>
              ) : !sessions || sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                    <Target className="h-8 w-8 text-primary/50" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">No adventures yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate your first story to get started
                    </p>
                  </div>
                  <Button className="glow" asChild>
                    <Link to="/generate">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Adventure
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session, i) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="font-medium text-foreground truncate">
                          {session.story_title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(session.started_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(session.status)} border-current/30`}
                        >
                          {getStatusLabel(session.status)}
                        </Badge>
                        {session.status === "in-progress" && (
                          <Button size="sm" variant="outline" className="h-8" asChild>
                            <Link to={`/play/${session.id}`}>
                              <Play className="h-3 w-3 mr-1" />
                              Resume
                            </Link>
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageWrapper>
  )
}