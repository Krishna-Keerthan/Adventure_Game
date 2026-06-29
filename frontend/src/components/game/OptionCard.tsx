import { motion } from "motion/react"
import { ChevronRight } from "lucide-react"

interface OptionCardProps {
  text: string
  index: number
  onChoose: (index: number) => void
  disabled?: boolean
}

export function OptionCard({ text, index, onChoose, disabled }: OptionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: disabled ? 1 : 1.02, x: disabled ? 0 : 4 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={() => !disabled && onChoose(index)}
      disabled={disabled}
      className={`
        group w-full text-left rounded-xl border p-4 sm:p-5
        transition-all duration-200
        ${
          disabled
            ? "border-border/30 bg-muted/20 cursor-not-allowed opacity-50"
            : "border-border/50 bg-card/50 hover:border-primary/50 hover:bg-primary/5 hover:glow cursor-pointer"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            flex h-7 w-7 shrink-0 items-center justify-center rounded-full
            text-xs font-bold border transition-colors duration-200
            ${
              disabled
                ? "border-border/30 text-muted-foreground"
                : "border-primary/40 text-primary group-hover:bg-primary/20 group-hover:border-primary"
            }
          `}
        >
          {index + 1}
        </div>
        <p
          className={`flex-1 text-sm sm:text-base font-medium transition-colors duration-200 ${
            disabled
              ? "text-muted-foreground"
              : "text-foreground/80 group-hover:text-foreground"
          }`}
        >
          {text}
        </p>
        {!disabled && (
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200 shrink-0" />
        )}
      </div>
    </motion.button>
  )
}