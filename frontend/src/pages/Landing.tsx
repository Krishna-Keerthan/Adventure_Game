import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { Sword, Sparkles, GitBranch, Trophy, ArrowRight, Scroll } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { GoldDivider } from "@/components/ui/GoldDivider"
import { useAuthStore } from "@/store/auth.store"

const FEATURES = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "AI-Forged Tales",
    description: "Every adventure is uniquely conjured by an ancient intelligence from your chosen theme.",
  },
  {
    icon: <GitBranch className="h-5 w-5" />,
    title: "Branching Fates",
    description: "Your choices reshape destiny. Multiple paths diverge — only one leads to glory.",
  },
  {
    icon: <Trophy className="h-5 w-5" />,
    title: "Hall of Heroes",
    description: "Claim victory and etch your name among the greatest adventurers in the realm.",
  },
  {
    icon: <Scroll className="h-5 w-5" />,
    title: "Infinite Scrolls",
    description: "No two stories are alike. New worlds unfold with every quest you undertake.",
  },
]

export default function Landing() {
  const { isAuthenticated } = useAuthStore()

  return (
    <PageWrapper>
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16 overflow-hidden">

        {/* Ambient glows */}
        <div className="pointer-events-none absolute top-1/4 left-1/3 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-crimson/4 blur-[100px]" />

        {/* Hero */}
        <div className="relative z-10 max-w-4xl text-center space-y-10">

          {/* Crest */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-primary/30 bg-primary/8 glow-gold">
              <Sword className="h-12 w-12 text-primary" />
              <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-xl" />
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs tracking-[0.4em] text-primary/60 uppercase"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            An AI-Powered Adventure
          </motion.p>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-4"
          >
            <h1
              className="text-5xl sm:text-7xl font-bold tracking-wider text-foreground text-glow-gold leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              QUESTCRAFT
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
              Enter a theme. An ancient intelligence weaves your story.
              Every choice echoes through the ages.
              <span className="text-primary"> Will you be remembered?</span>
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              className="glow-gold-strong text-sm px-10 tracking-widest bg-primary text-primary-foreground hover:bg-primary/90"
              style={{ fontFamily: "var(--font-heading)" }}
              asChild
            >
              <Link to={isAuthenticated ? "/generate" : "/register"}>
                <Sword className="h-4 w-4 mr-2" />
                {isAuthenticated ? "Begin New Quest" : "Enter the Realm"}
              </Link>
            </Button>
            {!isAuthenticated && (
              <Button
                size="lg"
                variant="outline"
                className="text-sm px-8 border-primary/30 hover:border-primary/60 hover:bg-primary/5 tracking-wider"
                asChild
              >
                <Link to="/login">
                  Already a Hero
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
          transition={{ duration: 0.7, delay: 0.7 }}
          className="relative z-10 mt-28 w-full max-w-5xl"
        >
          <GoldDivider label="The Realm Awaits" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="border-gold rounded-xl bg-card/50 backdrop-blur-sm p-5 space-y-3 hover:glow-gold transition-all duration-300 group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary/20 transition-colors duration-300">
                  {f.icon}
                </div>
                <h3
                  className="text-sm font-semibold tracking-wider text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {f.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-light">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="h-24" />
      </div>
    </PageWrapper>
  )
}