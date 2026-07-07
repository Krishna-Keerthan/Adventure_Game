import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "motion/react"
import { Loader2, LogIn, Sword } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { GoldDivider } from "@/components/ui/GoldDivider"
import { loginSchema, type LoginSchema } from "@/lib/schemas/auth"
import { useLogin } from "@/hooks/useAuth"

export default function Login() {
  const login = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <PageWrapper className="flex items-center justify-center pt-16 min-h-screen">
      <div className="w-full max-w-md px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="border-gold rounded-2xl bg-card/90 backdrop-blur-sm p-8 space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/30">
                <Sword className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1
              className="text-2xl font-bold tracking-widest text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              RETURN, HERO
            </h1>
            <p className="text-xs text-muted-foreground tracking-wider">
              Your adventures await your return
            </p>
          </div>

          <GoldDivider />

          <form onSubmit={handleSubmit((d) => login.mutate(d))} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs tracking-wider text-muted-foreground uppercase">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="hero@questcraft.io"
                className={`bg-input/50 border-border/50 focus:border-primary/60 ${errors.email ? "border-destructive" : ""}`}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs tracking-wider text-muted-foreground uppercase">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`bg-input/50 border-border/50 focus:border-primary/60 ${errors.password ? "border-destructive" : ""}`}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {login.error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-xs text-destructive text-center bg-destructive/10 rounded-lg p-3 border border-destructive/20"
              >
                Invalid credentials. The realm denies your entry.
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full glow-gold bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest text-xs mt-2"
              style={{ fontFamily: "var(--font-heading)" }}
              disabled={login.isPending}
            >
              {login.isPending
                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                : <LogIn className="h-4 w-4 mr-2" />
              }
              Enter the Realm
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            New to the realm?{" "}
            <Link to="/register" className="text-primary hover:text-primary/80 transition-colors">
              Forge your legend
            </Link>
          </p>
        </motion.div>
      </div>
    </PageWrapper>
  )
}