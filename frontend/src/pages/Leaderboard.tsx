import { motion } from "motion/react"
import { Trophy, Crown, Medal, TrendingUp, Loader2, Sword } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { GoldDivider } from "@/components/ui/GoldDivider"
import { useLeaderboard } from "@/hooks/useStats"
import { useAuthStore } from "@/store/auth.store"

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-primary" />
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />
  return (
    <span
      className="text-xs font-bold text-muted-foreground/60 w-5 text-center"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {rank}
    </span>
  )
}

function getRankStyle(rank: number) {
  if (rank === 1) return "border-primary/40 bg-primary/5 glow-gold"
  if (rank === 2) return "border-slate-400/25 bg-slate-400/5"
  if (rank === 3) return "border-amber-700/25 bg-amber-700/5"
  return "border-border/25 bg-background/30"
}

export default function Leaderboard() {
  const { data, isLoading } = useLeaderboard()
  const { user } = useAuthStore()

  return (
    <PageWrapper>
      <div className="mx-auto max-w-3xl px-4 pt-24 pb-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 space-y-3"
        >
          <div className="flex justify-center mb-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/8 glow-gold">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
          </div>
          <p className="text-xs tracking-[0.4em] text-primary/60 uppercase" style={{ fontFamily: "var(--font-heading)" }}>
            Hall of Heroes
          </p>
          <h1 className="text-3xl font-bold tracking-widest text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            LEADERBOARD
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            The greatest adventurers the realm has ever known
          </p>
        </motion.div>

        <GoldDivider label="Global Rankings" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-gold bg-card/80 backdrop-blur-sm mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xs tracking-widest" style={{ fontFamily: "var(--font-heading)" }}>
                <TrendingUp className="h-4 w-4 text-primary" />
                Champions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-xs text-muted-foreground tracking-wider">Consulting the ancient records...</p>
                  </div>
                </div>
              ) : !data?.entries || data.entries.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <Sword className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground">No heroes have risen yet. Be the first.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data.entries.map((entry, i) => (
                    <motion.div
                      key={entry.username}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`
                        flex items-center gap-4 rounded-xl border p-4
                        transition-all duration-200
                        ${getRankStyle(entry.rank)}
                        ${entry.username === user?.username ? "ring-1 ring-primary/40" : ""}
                      `}
                    >
                      <div className="flex h-8 w-8 items-center justify-center shrink-0">
                        {getRankIcon(entry.rank)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className="font-semibold text-sm text-foreground truncate tracking-wide"
                            style={entry.rank <= 3 ? { fontFamily: "var(--font-heading)" } : {}}
                          >
                            {entry.username}
                          </p>
                          {entry.username === user?.username && (
                            <Badge variant="outline" className="text-xs text-primary border-primary/30 shrink-0">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {entry.total_games} {entry.total_games === 1 ? "quest" : "quests"} completed
                        </p>
                      </div>

                      <div className="text-right shrink-0 space-y-0.5">
                        <p className="font-bold text-primary text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                          {entry.wins}
                          <span className="text-xs font-normal text-muted-foreground ml-1">victories</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{entry.win_rate}% win rate</p>
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