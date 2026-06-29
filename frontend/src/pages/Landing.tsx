import { Link } from "react-router-dom"
import { motion } from "motion/react"
import {
  Sword,
  Sparkles,
  GitBranch,
  Trophy,
  ArrowRight,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { useAuthStore } from "@/store/auth.store"

const FEATURES = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "AI-Generated Stories",
    description:
      "Every adventure is unique, crafted by an LLM from your chosen theme.",
  },
  {
    icon: <GitBranch className="h-5 w-5" />,
    title: "Branching Narratives",
    description:
      "Your choices shape the story. Multiple paths, multiple endings.",
  },
  {
    icon: <Trophy className="h-5 w-5" />,
    title: "Compete & Conquer",
    description:
      "Track your victories and climb the global leaderboard.",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Instant Generation",
    description:
      "Stories generate in seconds using the fastest LLM inference available.",
  },
]

export function Landing() {
  const { isAuthenticated } = useAuthStore()

  return (
    <PageWrapper>
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16">
        {/* Glow orbs */}
        <div className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

        {/* Hero */}
        <div className="relative z-10 max-w-3xl text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 glow">
              <Sword className="h-10 w-10 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground">
              Your Story,{" "}
              <span className="text-primary text-glow">Your Choice</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Enter a theme. An AI crafts a unique branching adventure.
              Every decision matters. Only one path leads to victory.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="glow-strong text-base px-8" asChild>
              <Link to={isAuthenticated ? "/generate" : "/register"}>
                <Sparkles className="h-5 w-5 mr-2" />
                {isAuthenticated ? "Generate Story" : "Start Your Adventure"}
              </Link>
            </Button>
            {!isAuthenticated && (
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 gradient-border"
                asChild
              >
                <Link to="/login">
                  Sign In
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative z-10 mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="gradient-border rounded-xl bg-card/50 backdrop-blur-sm p-5 space-y-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                {f.icon}
              </div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <div className="h-24" />
      </div>
    </PageWrapper>
  )
}