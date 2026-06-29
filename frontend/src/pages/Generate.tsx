import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "motion/react"
import { Sparkles, Loader2, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { JobPoller } from "@/components/game/JobPoller"
import { generateSchema, type GenerateSchema } from "@/lib/schemas/story"
import { useCreateStory } from "@/hooks/useStories"

const THEME_SUGGESTIONS = [
  "Pirate treasure hunt",
  "Space exploration",
  "Medieval fantasy",
  "Cyberpunk heist",
  "Ancient Egypt",
  "Underwater kingdom",
  "Time travel mystery",
  "Viking saga",
]

export function Generate() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [theme, setTheme] = useState("")
  const createStory = useCreateStory()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<GenerateSchema>({
    resolver: zodResolver(generateSchema),
  })

  const currentTheme = useWatch({
    control,
    name: "theme",
  })

  const onSubmit = (data: GenerateSchema) => {
    setTheme(data.theme)
    createStory.mutate(data, {
      onSuccess: (job) => {
        setJobId(job.job_id)
      },
    })
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <AnimatePresence mode="wait">
          {!jobId ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 glow">
                    <Wand2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  Create Your Adventure
                </h1>
                <p className="text-muted-foreground">
                  Choose a theme and our AI will craft a unique branching story
                  just for you.
                </p>
              </div>

              <div className="gradient-border rounded-2xl bg-card/80 backdrop-blur-sm p-8 space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-base">
                      Story Theme
                    </Label>
                    <Input
                      id="theme"
                      placeholder="e.g. Pirate treasure hunt in the Caribbean..."
                      className={`h-12 text-base ${errors.theme ? "border-destructive" : ""}`}
                      {...register("theme")}
                    />
                    {errors.theme && (
                      <p className="text-xs text-destructive">
                        {errors.theme.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Or pick a suggestion:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {THEME_SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setValue("theme", suggestion)}
                          className={`
                            text-xs px-3 py-1.5 rounded-full border transition-all duration-150
                            ${
                              currentTheme === suggestion
                                ? "border-primary bg-primary/20 text-primary"
                                : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-primary/5"
                            }
                          `}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  {createStory.error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 text-center"
                    >
                      Failed to start generation. Please try again.
                    </motion.p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-base glow-strong"
                    disabled={createStory.isPending}
                  >
                    {createStory.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="h-5 w-5 mr-2" />
                    )}
                    Generate Adventure
                  </Button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="poller"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="gradient-border rounded-2xl bg-card/80 backdrop-blur-sm p-8"
            >
              <JobPoller jobId={jobId} theme={theme} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  )
}