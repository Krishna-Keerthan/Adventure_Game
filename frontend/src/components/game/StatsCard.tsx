import { motion } from "motion/react"
import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  label: string
  value: string | number
  icon: ReactNode
  color?: string
  delay?: number
}

export function StatsCard({
  label,
  value,
  icon,
  color = "text-primary",
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="gradient-border bg-card/80 backdrop-blur-sm hover:glow transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </span>
            <div className={`${color} opacity-70`}>{icon}</div>
          </div>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}