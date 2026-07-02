import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { lazy, Suspense } from "react"
import { Loader2 } from "lucide-react"
import { AnimatePresence } from "motion/react"
import { Navbar } from "@/components/layout/Navbar"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
})

const  Landing = lazy(() => import("@/pages/Landing"))
const Login = lazy(() => import("@/pages/Login"))
const Register = lazy(() => import("@/pages/Register"))
const Dashboard = lazy(() => import("@/pages/Dashboard"))
const Generate = lazy(() => import("@/pages/Generate"))
const Play = lazy(() => import("@/pages/Play"))
const Leaderboard = lazy(() => import("@/pages/Leaderboard"))

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Loader2 className="h-8 w-8 text-primary animate-spin" />
  </div>
)

export default function App() {



  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader/>}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/generate" element={<Generate />} />
              <Route path="/play/:sessionId" element={<Play />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Route>
          </Routes>
          </Suspense>
        </AnimatePresence>
      </BrowserRouter>
    </QueryClientProvider>
  )
}