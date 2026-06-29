import { motion } from "motion/react"
import { ScrollText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StoryNodeProps {
  content: string
  nodeNumber?: number
}

export function StoryNodeDisplay({ content, nodeNumber }: StoryNodeProps) {
  return (
    <motion.div
      key={nodeNumber}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="gradient-border bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
              <ScrollText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-primary/70 uppercase tracking-wider mb-1">
                Story
              </p>
            </div>
          </div>
          <p className="text-foreground/90 leading-relaxed text-base sm:text-lg">
            {content}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}