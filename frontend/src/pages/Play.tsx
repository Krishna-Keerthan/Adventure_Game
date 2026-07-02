import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { Loader2, BookOpen, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { StoryNodeDisplay } from "@/components/game/StoryNode"
import { OptionCard } from "@/components/game/OptionCard"
import { GameEndScreen } from "@/components/game/GameEndScreen"
import { useSession, useChooseOption } from "@/hooks/useSessions"



export default function Play() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const id = Number(sessionId)

  const { data: session, isLoading, error } = useSession(id || null)
  const chooseOption = useChooseOption(id)

  if (isLoading) {
    return (
      <PageWrapper className="flex items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading your adventure...</p>
        </div>
      </PageWrapper>
    )
  }

  if (error || !session) {
    return (
      <PageWrapper className="flex items-center justify-center pt-16">
        <div className="text-center space-y-4">
          <p className="text-destructive text-lg font-medium">
            Session not found
          </p>
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </PageWrapper>
    )
  }

  const isEnded = session.status === "win" || session.status === "lost"

  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        {/* Title bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span className="font-medium text-foreground truncate max-w-64">
              {session.story_title}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            <Home className="h-4 w-4" />
          </Button>
        </motion.div>

        <AnimatePresence mode="wait">
          {isEnded ? (
            <motion.div
              key="end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GameEndScreen
                isWin={session.status === "win"}
                storyTitle={session.story_title}
                content={session.current_node.content}
                storyId={session.story_id}
              />
            </motion.div>
          ) : (
            <motion.div
              key={session.current_node.node_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <StoryNodeDisplay
                content={session.current_node.content}
                nodeNumber={session.current_node.node_id}
              />

              {session.current_node.options.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                    What do you do?
                  </p>
                  {session.current_node.options.map((option, index) => (
                    <OptionCard
                      key={index}
                      text={option.text}
                      index={index}
                      onChoose={(i) => chooseOption.mutate(i)}
                      disabled={chooseOption.isPending}
                    />
                  ))}
                </div>
              )}

              {chooseOption.isPending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  The story unfolds...
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  )
}