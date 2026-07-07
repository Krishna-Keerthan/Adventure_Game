import { motion } from "motion/react"
import { Trophy, Skull, RotateCcw, LayoutDashboard } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { GoldDivider } from "@/components/ui/GoldDivider"

interface GameEndScreenProps {
  isWin: boolean
  storyTitle: string
  content: string
  storyId: number
}

export function GameEndScreen({ isWin, storyTitle, content, storyId }: GameEndScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col items-center text-center space-y-8 py-8"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 160, damping: 14 }}
        className={`relative flex h-28 w-28 items-center justify-center rounded-full border-2 ${
          isWin
            ? "border-primary/50 bg-primary/10 glow-gold"
            : "border-crimson/50 bg-crimson/10 glow-crimson"
        }`}
      >
        {isWin
          ? <Trophy className="h-14 w-14 text-primary" />
          : <Skull className="h-14 w-14 text-crimson" />
        }
        <div className={`absolute inset-0 rounded-full blur-xl opacity-30 ${
          isWin ? "bg-primary" : "bg-crimson"
        }`} />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-1"
      >
        <h2
          className={`text-3xl sm:text-4xl font-bold tracking-widest ${
            isWin ? "text-primary text-glow-gold" : "text-crimson text-glow-crimson"
          }`}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {isWin ? "VICTORY" : "DEFEATED"}
        </h2>
        <p className="text-sm text-muted-foreground tracking-wider">{storyTitle}</p>
      </motion.div>

      <GoldDivider />

      {/* Final story text */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-lg border-gold rounded-xl bg-card/60 p-6 text-left"
      >
        <p className="text-foreground/80 leading-relaxed font-light">{content}</p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Button variant="outline" className="border-border/50 hover:border-primary/50 text-xs tracking-wider" asChild>
          <Link to={`/story/${storyId}`}>
            <RotateCcw className="h-3.5 w-3.5 mr-2" />
            Play Again
          </Link>
        </Button>
        <Button className="glow-gold text-xs tracking-wider bg-primary text-primary-foreground" asChild>
          <Link to="/dashboard">
            <LayoutDashboard className="h-3.5 w-3.5 mr-2" />
            Return to Keep
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  )
}