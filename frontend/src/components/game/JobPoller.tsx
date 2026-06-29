import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { AlertCircle, Sparkles } from "lucide-react"
import { useJobPoller } from "@/hooks/useJobPoller"
import { useStartSession } from "@/hooks/useSessions"
import { Button } from "@/components/ui/button"

interface JobPollerProps {
  jobId: string
  theme: string
}

const STEPS = [
  "Crafting your world...",
  "Building branching paths...",
  "Writing story nodes...",
  "Finalising your adventure...",
]

export function JobPoller({ jobId, theme }: JobPollerProps) {
  const navigate = useNavigate()
  const { data: job } = useJobPoller(jobId)
  const startSession = useStartSession()
  
  // Guard: only fire once when job completes
  const hasStartedSession = useRef(false)

  useEffect(() => {
    if (
      job?.status === "completed" &&
      job.story_id &&
      !hasStartedSession.current &&
      !startSession.isPending &&
      !startSession.isSuccess
    ) {
      hasStartedSession.current = true
      startSession.mutate(job.story_id, {
        onSuccess: (session) => {
          navigate(`/play/${session.id}`)
        },
        onError: () => {
          // Reset guard so user can retry
          hasStartedSession.current = false
        },
      })
    }
  }, [job?.status, job?.story_id, navigate, startSession])

  if (job?.status === "failed") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div>
          <h3 className="text-lg font-semibold text-destructive">Generation Failed</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {job.error ?? "Something went wrong. Please try again."}
          </p>
        </div>
        <Button onClick={() => navigate("/generate")} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (startSession.isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div>
          <h3 className="text-lg font-semibold text-destructive">Failed to Start Session</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Could not connect to the server. Make sure the backend is running.
          </p>
        </div>
        <Button onClick={() => navigate("/generate")} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8 py-12 text-center">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="h-20 w-20 rounded-full border-2 border-primary/20 border-t-primary"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-foreground">
          {startSession.isPending ? "Starting your adventure..." : "Creating your adventure"}
        </h3>
        <p className="text-sm text-muted-foreground">
          Theme: <span className="text-primary font-medium">{theme}</span>
        </p>
      </div>

      <div className="space-y-3 w-full max-w-xs">
        {STEPS.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.8 }}
            className="flex items-center gap-3 text-sm text-muted-foreground"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.8 + 0.2 }}
              className="h-1.5 w-1.5 rounded-full bg-primary shrink-0"
            />
            {step}
          </motion.div>
        ))}
      </div>
    </div>
  )
}