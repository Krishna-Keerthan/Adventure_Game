import { motion } from "motion/react"
import type { ReactNode } from "react"

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={`min-h-screen bg-background bg-rune-grid parchment ${className}`}
    >
      {children}
    </motion.div>
  )
}