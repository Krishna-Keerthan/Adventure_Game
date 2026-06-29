import { motion } from "motion/react"
import { Trophy, Medal, Crown, TrendingUp, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { useLeaderboard } from "@/hooks/useStats"
import { useAuthStore } from "@/store/auth.store"

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-amber-400" />
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-300" />
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
  return (
    <span className="text-sm font-bold text-muted-foreground w-5 text-center">
      {rank}
    </span>
  )
}

function getRankBg(rank: number) {
  if (rank === 1) return "border-amber-500/30 bg-amber-500/5"
  if (rank === 2) return "border-slate-400/30 bg-slate-400/5"
  if (rank === 3) return "border-amber-700/30 bg-amber-700/5"
  return "border-border/50 bg-background/50"
}

export function Leaderboard() {
  const { data, isLoading } = useLeaderboard()
  const { user } = useAuthStore()

  return (
    <PageWrapper>
      <div className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 space-y-2"
        >
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 glow">
              <Trophy className="h-8 w-8 text-amber-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground">
            The greatest adventurers of all time
          </p>
        </motion.div>

        <Card className="gradient-border bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Global Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : !data?.entries || data.entries.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                No rankings yet. Be the first!
              </div>
            ) : (
              <div className="space-y-3">
                {data.entries.map((entry, i) => (
                  <motion.div
                    key={entry.username}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`
                      flex items-center gap-4 rounded-xl border p-4 transition-all duration-200
                      ${getRankBg(entry.rank)}
                      ${entry.username === user?.username ? "ring-1 ring-primary/50" : ""}
                    `}
                  >
                    <div className="flex h-8 w-8 items-center justify-center shrink-0">
                      {getRankIcon(entry.rank)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground truncate">
                          {entry.username}
                        </p>
                        {entry.username === user?.username && (
                          <Badge
                            variant="outline"
                            className="text-xs text-primary border-primary/30 shrink-0"
                          >
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {entry.total_games} games played
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-emerald-400">
                        {entry.wins}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          wins
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.win_rate}% win rate
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}