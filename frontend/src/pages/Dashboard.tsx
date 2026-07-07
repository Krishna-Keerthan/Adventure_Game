import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { Sword, Trophy, TrendingUp, Plus, Play, BookOpen, Skull, Clock, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { GoldDivider } from "@/components/ui/GoldDivider"
import { useMyStats } from "@/hooks/useStats"
import { useSessionList } from "@/hooks/useSessions"
import { useAuthStore } from "@/store/auth.store"
import { formatDate } from "@/lib/utils"

function StatTile({
  label, value, icon, color = "text-primary", delay = 0
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="border-gold rounded-xl bg-card/80 backdrop-blur-sm p-5 hover:glow-gold transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs tracking-[0.15em] text-muted-foreground uppercase"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {label}
        </span>
        <div className={`${color} opacity-60 group-hover:opacity-100 transition-opacity`}>{icon}</div>
      </div>
      <p className={`text-3xl font-bold ${color}`} style={{ fontFamily: "var(--font-heading)" }}>
        {value}
      </p>
    </motion.div>
  )
}

function getStatusColor(status: string) {
  if (status === "win") return "text-primary border-primary/30"
  if (status === "lost") return "text-crimson border-crimson/30"
  return "text-amber-500 border-amber-500/30"
}

function getStatusLabel(status: string) {
  if (status === "win") return "Victory"
  if (status === "lost") return "Defeated"
  return "In Progress"
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { data: stats, isLoading: statsLoading } = useMyStats()
  const { data: sessions, isLoading: sessionsLoading } = useSessionList()

  return (
    <PageWrapper>
      <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-xs tracking-[0.3em] text-primary/60 uppercase mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              Welcome Back
            </p>
            <h1 className="text-3xl font-bold text-foreground text-glow-gold" style={{ fontFamily: "var(--font-heading)" }}>
              {user?.username}
            </h1>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Button className="glow-gold bg-primary text-primary-foreground hover:bg-primary/90 text-xs tracking-widest" asChild>
              <Link to="/generate">
                <Plus className="h-3.5 w-3.5 mr-2" />
                New Quest
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Stats */}
        {!statsLoading && stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatTile label="Quests" value={stats.total_games} icon={<BookOpen className="h-4 w-4" />} delay={0} />
              <StatTile label="Victories" value={stats.wins} icon={<Trophy className="h-4 w-4" />} color="text-primary" delay={0.1} />
              <StatTile label="Defeats" value={stats.losses} icon={<Skull className="h-4 w-4" />} color="text-crimson" delay={0.2} />
              <StatTile label="Win Rate" value={`${stats.win_rate}%`} icon={<TrendingUp className="h-4 w-4" />} color="text-amber-400" delay={0.3} />
            </div>
            <GoldDivider label="Your Chronicles" />
          </>
        )}

        {/* Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-gold bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2 text-sm tracking-widest" style={{ fontFamily: "var(--font-heading)" }}>
                <Sword className="h-4 w-4 text-primary" />
                Adventures
              </CardTitle>
              <Button variant="outline" size="sm" className="text-xs border-border/40 hover:border-primary/40" asChild>
                <Link to="/leaderboard">
                  <Trophy className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  Hall of Fame
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 rounded-lg bg-muted/20 animate-pulse" />
                  ))}
                </div>
              ) : !sessions || sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/8 border border-primary/20">
                    <Target className="h-8 w-8 text-primary/40" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                      No Chronicles Yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Begin your first quest to write your legend</p>
                  </div>
                  <Button className="glow-gold bg-primary text-primary-foreground text-xs tracking-widest" asChild>
                    <Link to="/generate">
                      <Plus className="h-3.5 w-3.5 mr-2" />
                      Begin First Quest
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {sessions.map((session, i) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between rounded-lg border border-border/30 bg-background/40 p-4 hover:border-primary/30 hover:bg-primary/3 transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-medium text-foreground truncate">{session.story_title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground/50" />
                          <span className="text-xs text-muted-foreground">{formatDate(session.started_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="outline" className={`text-xs ${getStatusColor(session.status)}`}>
                          {getStatusLabel(session.status)}
                        </Badge>
                        {session.status === "in-progress" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs border-primary/30 hover:border-primary/60" asChild>
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