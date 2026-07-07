import { motion } from "motion/react"
import { Scroll } from "lucide-react"
import { TypewriterText } from "./TypewriterText"

interface StoryNodeProps {
  content: string
  nodeNumber?: number
  onComplete?: () => void
}

export function StoryNodeDisplay({ content, nodeNumber, onComplete }: StoryNodeProps) {
  return (
    <motion.div
      key={nodeNumber}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="border-gold rounded-xl bg-card/90 backdrop-blur-sm p-8"
    >
      {/* Header ornament */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/30">
          <Scroll className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-primary/40 to-transparent" />
        <div className="h-1 w-1 rounded-full bg-primary/40" />
      </div>

      <p className="text-foreground/90 leading-[1.9] text-base sm:text-lg font-light">
        <TypewriterText
          text={content}
          speed={22}
          onComplete={onComplete}
        />
      </p>

      {/* Footer ornament */}
      <div className="flex items-center gap-3 mt-6">
        <div className="h-1 w-1 rounded-full bg-primary/40" />
        <div className="flex-1 h-px bg-gradient-to-l from-primary/40 to-transparent" />
      </div>
    </motion.div>
  )
}