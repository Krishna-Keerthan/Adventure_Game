import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { Loader2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
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

  const [optionsVisible, setOptionsVisible] = useState(false)

  const isEnded = session?.status === "win" || session?.status === "lost"

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background bg-rune-grid">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="h-12 w-12 rounded-full border border-primary/20 border-t-primary"
          />
          <p className="text-xs tracking-widest text-muted-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Opening the tome...
          </p>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">This tale could not be found.</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <Home className="h-4 w-4 mr-2" />
            Return to Keep
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background bg-rune-grid parchment flex flex-col">
      {/* Minimal top bar — no full navbar during immersive play */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/70 backdrop-blur-lg border-b border-border/30">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors tracking-widest"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <Home className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Keep</span>
        </button>

        <p
          className="text-xs tracking-[0.2em] text-primary/70 truncate max-w-xs"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {session.story_title}
        </p>

        <div className="w-16 flex justify-end">
          <div
            className={`h-2 w-2 rounded-full ${
              session.status === "in-progress" ? "bg-amber-400 animate-pulse" :
              session.status === "win" ? "bg-primary" : "bg-destructive"
            }`}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-2xl space-y-8">

          {/* Ambient orb */}
          <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-primary/4 blur-[120px]" />

          <AnimatePresence mode="wait">
            {isEnded ? (
              <motion.div
                key="end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
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
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                {/* Story text with typewriter */}
                <StoryNodeDisplay
                  content={session.current_node.content}
                  nodeNumber={session.current_node.node_id}
                  onComplete={() => setOptionsVisible(true)}
                />

                {/* Options — appear only after typewriter finishes */}
                <AnimatePresence>
                  {optionsVisible && session.current_node.options.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-3"
                    >
                      <p
                        className="text-xs tracking-[0.3em] text-primary/50 text-center uppercase"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        Choose Your Path
                      </p>

                      {session.current_node.options.map((option, index) => (
                        <OptionCard
                          key={index}
                          text={option.text}
                          index={index}
                          onChoose={(i) => {
                            setOptionsVisible(false)
                            chooseOption.mutate(i)
                          }}
                          disabled={chooseOption.isPending}
                          visible={true}
                        />
                      ))}

                      {chooseOption.isPending && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4"
                        >
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                          <span className="tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                            The story unfolds...
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}