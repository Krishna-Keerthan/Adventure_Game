import { motion } from "motion/react"
import { ChevronRight } from "lucide-react"

interface OptionCardProps {
  text: string
  index: number
  onChoose: (index: number) => void
  disabled?: boolean
  visible?: boolean
}

const ROMAN = ["I", "II", "III", "IV", "V"]

export function OptionCard({
  text,
  index,
  onChoose,
  disabled,
  visible = true,
}: OptionCardProps) {
  if (!visible) return null

  return (
    <motion.button
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: index * 0.12, ease: "easeOut" }}
      whileHover={{ x: disabled ? 0 : 6, scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={() => !disabled && onChoose(index)}
      disabled={disabled}
      className={`
        group w-full text-left rounded-lg border p-4 sm:p-5
        transition-all duration-300
        ${disabled
          ? "border-border/20 bg-muted/10 cursor-not-allowed opacity-40"
          : "border-border/40 bg-card/40 hover:border-primary/60 hover:bg-primary/5 hover:glow-gold cursor-pointer"
        }
      `}
    >
      <div className="flex items-center gap-4">
        <div
          className={`
            flex h-8 w-8 shrink-0 items-center justify-center rounded-full border
            text-xs transition-all duration-300
            ${disabled
              ? "border-border/20 text-muted-foreground"
              : "border-primary/40 text-primary group-hover:bg-primary/15 group-hover:border-primary"
            }
          `}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {ROMAN[index] ?? index + 1}
        </div>

        <p className={`
          flex-1 text-sm sm:text-base transition-colors duration-300 font-light
          ${disabled ? "text-muted-foreground" : "text-foreground/80 group-hover:text-foreground"}
        `}>
          {text}
        </p>

        {!disabled && (
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors duration-300 shrink-0" />
        )}
      </div>
    </motion.button>
  )
}