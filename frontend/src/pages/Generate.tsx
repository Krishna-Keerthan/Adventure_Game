import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "motion/react"
import { Sparkles, Loader2, Wand2, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { GoldDivider } from "@/components/ui/GoldDivider"
import { useJobPoller } from "@/hooks/useJobPoller"
import { useStartSession } from "@/hooks/useSessions"
import { generateSchema, type GenerateSchema } from "@/lib/schemas/story"
import { useCreateStory } from "@/hooks/useStories"


const THEMES = [
  "Pirate treasure hunt", "Medieval kingdom siege", "Cyberpunk heist",
  "Ancient Egypt tomb", "Viking saga", "Underwater realm",
  "Time travel mystery", "Dragon taming", "Space exploration", "Dark forest horror",
]

const LORE_STEPS = [
  "The ancient scribes are awakened...",
  "Worlds are being conjured from the void...",
  "Your fate is being woven into existence...",
  "The final seals are being placed...",
]

function QuestPoller({
  jobId,
  theme,
}: {
  jobId: string
  theme: string
}) {
  const navigate = useNavigate()

  const { data: job } = useJobPoller(jobId)
  const startSession = useStartSession()

  const hasStarted = useRef(false)

  useEffect(() => {
    if (
      job?.status !== "completed" ||
      !job.story_id ||
      hasStarted.current ||
      startSession.isPending ||
      startSession.isSuccess
    ) {
      return
    }

    hasStarted.current = true

    startSession.mutate(job.story_id, {
      onSuccess: (session) => {
        navigate(`/play/${session.id}`)
      },
      onError: () => {
        hasStarted.current = false
      },
    })
  }, [job, startSession, navigate])

  if (job?.status === "failed") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />

        <p className="text-sm text-muted-foreground">
          {job.error ?? "The scribes failed. Try again."}
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/generate")}
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-10 py-12 text-center">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          className="h-24 w-24 rounded-full border border-primary/20 border-t-primary/80"
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>

        <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl animate-pulse" />
      </div>

      <div className="space-y-2">
        <h3
          className="text-lg font-bold tracking-widest text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Weaving Your Tale
        </h3>

        <p className="text-xs text-muted-foreground tracking-wider">
          Theme: <span className="text-primary">{theme}</span>
        </p>
      </div>

      <div className="space-y-3 w-full max-w-xs">
        {LORE_STEPS.map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 1.2 }}
            className="flex items-center gap-3 text-xs text-muted-foreground"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 1.2 + 0.3 }}
              className="h-1.5 w-1.5 rounded-full bg-primary shrink-0"
            />

            {step}
          </motion.div>
        ))}
      </div>
    </div>
  )
}


export default function Generate() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [theme, setTheme] = useState("")
  const createStory = useCreateStory()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<GenerateSchema>({
    resolver: zodResolver(generateSchema),
  })

  const currentTheme = watch("theme")

  const onSubmit = (data: GenerateSchema) => {
    setTheme(data.theme)
    createStory.mutate(data, {
      onSuccess: (job) => setJobId(job.job_id),
    })
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <AnimatePresence mode="wait">
          {!jobId ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/8 glow-gold">
                    <Wand2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold tracking-widest text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  FORGE A QUEST
                </h1>
                <p className="text-sm text-muted-foreground font-light">
                  Name your theme and the ancient intelligence shall craft your story
                </p>
              </div>

              <div className="border-gold rounded-2xl bg-card/90 backdrop-blur-sm p-8 space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-xs tracking-[0.2em] text-muted-foreground uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                      Quest Theme
                    </Label>
                    <Input
                      id="theme"
                      placeholder="e.g. A pirate searching for the lost city of gold..."
                      className={`h-12 text-sm bg-input/50 border-border/50 focus:border-primary/60 ${errors.theme ? "border-destructive" : ""}`}
                      {...register("theme")}
                    />
                    {errors.theme && <p className="text-xs text-destructive">{errors.theme.message}</p>}
                  </div>

                  <GoldDivider label="Or Choose a Realm" />

                  <div className="flex flex-wrap gap-2">
                    {THEMES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setValue("theme", t)}
                        className={`
                          text-xs px-3 py-1.5 rounded-full border transition-all duration-200
                          ${currentTheme === t
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/5"
                          }
                        `}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {createStory.error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-destructive bg-destructive/10 rounded-lg p-3 text-center border border-destructive/20"
                    >
                      The scribes are indisposed. Please try again.
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-sm glow-gold-strong bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest"
                    style={{ fontFamily: "var(--font-heading)" }}
                    disabled={createStory.isPending}
                  >
                    {createStory.isPending
                      ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      : <Sparkles className="h-4 w-4 mr-2" />
                    }
                    Summon the Story
                  </Button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="poller"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="border-gold rounded-2xl bg-card/90 backdrop-blur-sm p-8"
            >
              <QuestPoller jobId={jobId} theme={theme} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  )
}