"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { StatsGrid } from "@/components/stats-grid"
import { DecisionForm } from "@/components/decision-form"
import { TreeVisualization } from "@/components/tree-visualization"
import { VisualizationArea } from "@/components/visualization-area"
import { CommandPalette } from "@/components/command-palette"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationSystem } from "@/components/notification-system"
import { GamificationPanel } from "@/components/gamification-panel"
import type { Decision, DecisionStats } from "@/types/decision"

// Mock data
const mockStats: DecisionStats = {
  totalDecisions: 127,
  satisfactionRate: 89,
  activeDecisions: 12,
  trends: {
    decisionsThisMonth: 23,
    satisfactionChange: 5.2,
  },
}

const mockDecision: Decision = {
  id: "1",
  title: "Should I change careers?",
  description: "Considering a transition from marketing to software development",
  factors: [
    { id: "1", name: "Financial Impact", weight: 75, category: "financial" },
    { id: "2", name: "Personal Growth", weight: 90, category: "personal" },
    { id: "3", name: "Work-Life Balance", weight: 60, category: "personal" },
  ],
  status: "active",
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentDecision, setCurrentDecision] = useState<Decision>(mockDecision)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [splitScreenMode, setSplitScreenMode] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    // Redirect to signup if not authenticated
    if (status === "unauthenticated") {
      router.push('/signup')
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [status, router])

  const addNotification = (message: string, type: "success" | "warning" | "error" = "success") => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 5000)
  }

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/20 via-purple-50/10 to-pink-50/20 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20 animate-gradient-shift pointer-events-none" />

      <div className="fixed inset-0 pointer-events-none" suppressHydrationWarning>
        {typeof window !== 'undefined' && Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <Header />

      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="container mx-auto px-4 py-8 space-y-8 relative z-10">
        <GamificationPanel onNotification={addNotification} />

        <StatsGrid stats={mockStats} />

        {/* Decision Form */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <DecisionForm 
              decision={currentDecision}
              onDecisionChange={setCurrentDecision}
              onNotification={addNotification}
            />
          </div>
        </div>

        {/* Decision Tree Visualization */}
        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            <TreeVisualization decision={currentDecision} />
          </div>
        </div>

        {/* Visualization Area - Hidden for now during form completion */}
        {/* TODO: Show this after form completion */}
        {false && (
          <div className="grid gap-8">
            <VisualizationArea decision={currentDecision} />
          </div>
        )}

        <button
          onClick={() => setSplitScreenMode(!splitScreenMode)}
          className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
        >
          {splitScreenMode ? "📱" : "📊"}
        </button>
      </main>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onCommand={(command) => {
          addNotification(`Executed: ${command}`)
          setCommandPaletteOpen(false)
        }}
      />

      <NotificationSystem notifications={notifications} />
    </div>
  )
}