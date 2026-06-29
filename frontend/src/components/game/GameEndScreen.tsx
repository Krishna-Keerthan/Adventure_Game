import { motion } from "motion/react"
import { Trophy, Skull, RotateCcw, LayoutDashboard } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

interface GameEndScreenProps {
  isWin: boolean
  storyTitle: string
  content: string
  storyId: number
}

export function GameEndScreen({
  isWin,
  storyTitle,
  content,
  storyId,
}: GameEndScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center space-y-6 py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className={`relative flex h-24 w-24 items-center justify-center rounded-full border-2 ${
          isWin
            ? "border-emerald-500/50 bg-emerald-500/10"
            : "border-red-500/50 bg-red-500/10"
        }`}
      >
        {isWin ? (
          <Trophy className="h-12 w-12 text-emerald-400" />
        ) : (
          <Skull className="h-12 w-12 text-red-400" />
        )}
        <div
          className={`absolute inset-0 rounded-full ${
            isWin ? "bg-emerald-500/10" : "bg-red-500/10"
          } blur-xl`}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <h2
          className={`text-3xl font-bold ${
            isWin ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isWin ? "Victory!" : "Defeated"}
        </h2>
        <p className="text-muted-foreground text-sm">{storyTitle}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-md rounded-xl border border-border/50 bg-card/50 p-5"
      >
        <p className="text-foreground/80 leading-relaxed">{content}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Button
          asChild
          variant="outline"
          className="flex items-center gap-2"
        >
          <Link to={`/story/${storyId}`}>
            <RotateCcw className="h-4 w-4" />
            Play Again
          </Link>
        </Button>
        <Button asChild className="flex items-center gap-2 glow">
          <Link to="/dashboard">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  )
}