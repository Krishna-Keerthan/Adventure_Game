import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AnimatePresence, motion } from "motion/react"
import { Loader2 } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"


const Landing = lazy(() => import("@/pages/Landing"))
const Login = lazy(() => import("@/pages/Login"))
const Register = lazy(() => import("@/pages/Register"))
const Dashboard = lazy(() => import("@/pages/Dashboard"))
const Generate = lazy(() => import("@/pages/Generate"))
const Play = lazy(() => import("@/pages/Play"))
const Leaderboard = lazy(() => import("@/pages/Leaderboard"))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
})

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public — no navbar on Play page for immersive experience */}
              <Route path="/" element={<><Navbar /><Landing /></>} />
              <Route path="/login" element={<><Navbar /><Login /></>} />
              <Route path="/register" element={<><Navbar /><Register /></>} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />
                <Route path="/generate" element={<><Navbar /><Generate /></>} />
                <Route path="/leaderboard" element={<><Navbar /><Leaderboard /></>} />
                {/* Play has its own minimal top bar — no Navbar */}
                <Route path="/play/:sessionId" element={<Play />} />
              </Route>
            </Routes>
          </AnimatePresence>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}