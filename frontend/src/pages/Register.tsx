import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "motion/react"
import { Loader2, Sword } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { GoldDivider } from "@/components/ui/GoldDivider"
import { registerSchema, type RegisterSchema } from "@/lib/schemas/auth"
import { useRegister } from "@/hooks/useAuth"

export default function Register() {
  const register_ = useRegister()
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = ({ confirmPassword: _, ...data }: RegisterSchema) => {
    register_.mutate(data)
  }

  return (
    <PageWrapper className="flex items-center justify-center pt-16 min-h-screen">
      <div className="w-full max-w-md px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="border-gold rounded-2xl bg-card/90 backdrop-blur-sm p-8 space-y-6"
        >
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
              FORGE YOUR LEGEND
            </h1>
            <p className="text-xs text-muted-foreground tracking-wider">
              Your name shall echo through the ages
            </p>
          </div>

          <GoldDivider />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { id: "username", label: "Hero Name", type: "text", placeholder: "YourHeroName", field: "username" },
              { id: "email", label: "Scroll Address", type: "email", placeholder: "hero@questcraft.io", field: "email" },
              { id: "password", label: "Secret Oath", type: "password", placeholder: "••••••••", field: "password" },
              { id: "confirmPassword", label: "Confirm Oath", type: "password", placeholder: "••••••••", field: "confirmPassword" },
            ].map(({ id, label, type, placeholder, field }) => (
              <div key={id} className="space-y-1.5">
                <Label htmlFor={id} className="text-xs tracking-wider text-muted-foreground uppercase">
                  {label}
                </Label>
                <Input
                  id={id}
                  type={type}
                  placeholder={placeholder}
                  className={`bg-input/50 border-border/50 focus:border-primary/60 ${
                    errors[field as keyof typeof errors] ? "border-destructive" : ""
                  }`}
                  {...register(field as keyof RegisterSchema)}
                />
                {errors[field as keyof typeof errors] && (
                  <p className="text-xs text-destructive">
                    {errors[field as keyof typeof errors]?.message as string}
                  </p>
                )}
              </div>
            ))}

            {register_.error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-xs text-destructive text-center bg-destructive/10 rounded-lg p-3 border border-destructive/20"
              >
                {(register_.error as any)?.response?.data?.detail ?? "The realm rejected your application."}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full glow-gold bg-primary text-primary-foreground hover:bg-primary/90 tracking-widest text-xs mt-2"
              style={{ fontFamily: "var(--font-heading)" }}
              disabled={register_.isPending}
            >
              {register_.isPending
                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                : <Sword className="h-4 w-4 mr-2" />
              }
              Begin Your Quest
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Already a legend?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 transition-colors">
              Return to the realm
            </Link>
          </p>
        </motion.div>
      </div>
    </PageWrapper>
  )
}