import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Trophy, Crown, Medal, TrendingUp, Loader2,
  Sword, ChevronLeft, ChevronRight, Shield,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { GoldDivider } from "@/components/ui/GoldDivider"
import { useLeaderboard, useMyRank } from "@/hooks/useStats"
import { useAuthStore } from "@/store/auth.store"
import type { LeaderboardEntry } from "@/types/stats"
import { useQueryClient } from "@tanstack/react-query"
import { statsApi } from "@/api/stats.api"

// ── Rank helpers ─────────────────────────────────────────────────────────────

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-primary" />
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />
  return (
    <span
      className="text-xs font-bold text-muted-foreground/50 w-5 text-center tabular-nums"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {rank}
    </span>
  )
}

function getRankStyle(rank: number, isCurrentUser: boolean): string {
  if (isCurrentUser) return "border-primary/50 bg-primary/8 ring-1 ring-primary/30"
  if (rank === 1) return "border-primary/40 bg-primary/5"
  if (rank === 2) return "border-slate-400/25 bg-slate-400/4"
  if (rank === 3) return "border-amber-700/25 bg-amber-700/4"
  return "border-border/20 bg-background/25 hover:border-border/40 hover:bg-background/40"
}

// ── Sticky user rank card ────────────────────────────────────────────────────

function MyRankCard() {
  const { data: myRank, isLoading } = useMyRank()

  if (isLoading) return (
    <div className="h-20 rounded-xl border border-primary/20 bg-primary/5 animate-pulse mb-4" />
  )
  if (!myRank) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-20 z-10 mb-4"
    >
      <div className="rounded-xl border border-primary/40 bg-card/95 backdrop-blur-xl p-4 shadow-lg glow-gold">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px rounded-t-xl bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div className="flex items-center gap-4">
          {/* Rank badge */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p
                className="text-xs tracking-widest text-primary/70 uppercase"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Your Standing
              </p>
              <Badge variant="outline" className="text-xs text-primary border-primary/30 py-0">
                You
              </Badge>
            </div>
            <p className="text-sm font-medium text-foreground truncate">{myRank.username}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-center hidden sm:block">
              <p
                className="text-lg font-bold text-primary leading-none"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                #{myRank.rank}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">rank</p>
            </div>
            <div className="text-center hidden sm:block">
              <p
                className="text-lg font-bold text-foreground leading-none"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {myRank.wins}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">wins</p>
            </div>
            <div className="text-center">
              <p
                className="text-lg font-bold text-amber-400 leading-none"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {myRank.percentile}%
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">top</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Entry row ─────────────────────────────────────────────────────────────────

function EntryRow({ entry, index, currentUsername }: {
  entry: LeaderboardEntry
  index: number
  currentUsername: string | undefined
}) {
  const isMe = entry.username === currentUsername

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className={`
        flex items-center gap-4 rounded-xl border p-4
        transition-all duration-200 relative overflow-hidden
        ${getRankStyle(entry.rank, isMe)}
      `}
    >
      {/* Subtle gold shimmer for top 3 */}
      {entry.rank <= 3 && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-transparent pointer-events-none" />
      )}

      <div className="flex h-8 w-8 items-center justify-center shrink-0">
        {getRankIcon(entry.rank)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className="font-semibold text-sm text-foreground truncate"
            style={entry.rank <= 3 ? { fontFamily: "var(--font-heading)", letterSpacing: "0.05em" } : {}}
          >
            {entry.username}
          </p>
          {isMe && (
            <Badge variant="outline" className="text-xs text-primary border-primary/30 shrink-0">
              You
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {entry.total_games} {entry.total_games === 1 ? "quest" : "quests"}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p
          className="font-bold text-primary text-sm leading-none"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {entry.wins}
          <span className="text-xs font-normal text-muted-foreground ml-1">W</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">{entry.win_rate}%</p>
      </div>
    </motion.div>
  )
}

// ── Tier selector ─────────────────────────────────────────────────────────────

function TierSelector({
  tiers,
  selected,
  totalUsers,
  onChange,
}: {
  tiers: number[]
  selected: number | null
  totalUsers: number
  onChange: (tier: number | null) => void
}) {
  const allOption = { label: "All", value: null }
  const tierOptions = tiers.map((t) => ({ label: `Top ${t}`, value: t }))
  const options = [allOption, ...tierOptions]

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span
        className="text-xs text-muted-foreground tracking-widest uppercase mr-1 hidden sm:inline"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Filter:
      </span>
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={`
            text-xs px-3 py-1.5 rounded-full border transition-all duration-200
            ${selected === opt.value
              ? "border-primary bg-primary/15 text-primary"
              : "border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/5"
            }
          `}
        >
          {opt.label}
        </button>
      ))}
      <span className="text-xs text-muted-foreground ml-auto hidden sm:inline">
        {totalUsers} heroes total
      </span>
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  isLoading,
}: {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  isLoading: boolean
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between pt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={page === 1 || isLoading}
        className="text-xs border-border/40 hover:border-primary/40 disabled:opacity-30"
      >
        <ChevronLeft className="h-3.5 w-3.5 mr-1" />
        Previous
      </Button>

      <span
        className="text-xs text-muted-foreground tracking-wider"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {page} / {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={page === totalPages || isLoading}
        className="text-xs border-border/40 hover:border-primary/40 disabled:opacity-30"
      >
        Next
        <ChevronRight className="h-3.5 w-3.5 ml-1" />
      </Button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Leaderboard() {
  const [page, setPage] = useState(1)
  const [tier, setTier] = useState<number | null>(null)
  const { user } = useAuthStore()

  const { data, isLoading, isFetching } = useLeaderboard(page, tier)

  const queryClient = useQueryClient()

  const handleTierChange = (newTier: number | null) => {
    setTier(newTier)
    setPage(1) // reset to page 1 on tier change
  }

  const handlePrev = () => setPage((p) => Math.max(1, p - 1))
  const handleNext = () => setPage((p) => Math.min(data?.meta.total_pages ?? 1, p + 1))

  useEffect(() => {
  if (data?.meta && page < data.meta.total_pages) {
    queryClient.prefetchQuery({
      queryKey: ["leaderboard", page + 1, tier],
      queryFn: () => statsApi.leaderboard(page + 1, tier),
      staleTime: 1000 * 60 * 5,
    })
  }
  }, [page, tier, data?.meta, queryClient])

  return (
    <PageWrapper>
      <div className="mx-auto max-w-3xl px-4 pt-24 pb-16">

        {/* Page header */}
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
          <p
            className="text-xs tracking-[0.4em] text-primary/60 uppercase"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Hall of Heroes
          </p>
          <h1
            className="text-3xl font-bold tracking-widest text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            LEADERBOARD
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            The greatest adventurers the realm has ever known
          </p>
        </motion.div>

        {/* Sticky current user rank card */}
        <MyRankCard />

        <GoldDivider label="Global Rankings" />

        {/* Tier selector */}
        {data?.meta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 mb-4"
          >
            <TierSelector
              tiers={data.meta.available_tiers}
              selected={tier}
              totalUsers={data.meta.total_users}
              onChange={handleTierChange}
            />
          </motion.div>
        )}

        {/* Table card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-gold bg-card/80 backdrop-blur-sm mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs tracking-widest" style={{ fontFamily: "var(--font-heading)" }}>
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {data?.meta.tier_label ?? "Rankings"}
                </div>
                {isFetching && !isLoading && (
                  <Loader2 className="h-3.5 w-3.5 text-primary/50 animate-spin" />
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Entries */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-xs text-muted-foreground tracking-wider">
                      Consulting the ancient records...
                    </p>
                  </div>
                </div>
              ) : !data?.entries || data.entries.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <Sword className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    No heroes in this tier yet.
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${page}-${tier}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-2"
                  >
                    {data.entries.map((entry, i) => (
                      <EntryRow
                        key={entry.username}
                        entry={entry}
                        index={i}
                        currentUsername={user?.username}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Pagination */}
              {data?.meta && (
                <Pagination
                  page={data.meta.page}
                  totalPages={data.meta.total_pages}
                  onPrev={handlePrev}
                  onNext={handleNext}
                  isLoading={isFetching}
                />
              )}

              {/* Entry count */}
              {data?.meta && (
                <p className="text-center text-xs text-muted-foreground/50 pt-1">
                  Showing{" "}
                  {(data.meta.page - 1) * data.meta.page_size + 1}–
                  {Math.min(data.meta.page * data.meta.page_size, data.meta.total_entries)}{" "}
                  of {data.meta.total_entries} heroes
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageWrapper>
  )
}