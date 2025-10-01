"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { StatsGrid } from "@/components/stats-grid"
import { DecisionForm } from "@/components/decision-form"
import { TreeVisualization } from "@/components/tree-visualization"
import { DecisionCosmos3D } from "@/components/decision-cosmos-3d"
import { DecisionCosmosPopup } from "@/components/decision-cosmos-popup"
import { VisualizationArea } from "@/components/visualization-area"
import { CommandPalette } from "@/components/command-palette"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationSystem } from "@/components/notification-system"
import { GamificationPanel } from "@/components/gamification-panel"
import { NodeDetailPanel } from "@/components/node-detail-panel"
import { DecisionHistoryList } from "@/components/decision-history-list"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { ParticleField } from "@/components/ui/particle-field"
import { TreeBuilderModal } from "@/components/tree-builder-modal"
import type { Decision, DecisionStats, DecisionTreeNode, Factor } from "@/types/decision"
import { useDecisions, useDecisionStats } from "@/hooks/useDecisions"

const emptyDecision: Decision = {
  id: "",
  title: "",
  description: "",
  factors: [],
  status: "draft",
  emotionalContext: {
    initialStressLevel: 5,
    confidenceLevel: 5,
    urgencyRating: 5,
  },
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentDecision, setCurrentDecision] = useState<Decision>(emptyDecision)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [splitScreenMode, setSplitScreenMode] = useState(false)
  const [show3DPopup, setShow3DPopup] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [editMode, setEditMode] = useState(false)
  const [selectedNode, setSelectedNode] = useState<DecisionTreeNode | null>(null)
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [treeBuilderOpen, setTreeBuilderOpen] = useState(false)

  const { stats, loading: statsLoading, refetch: refetchStats } = useDecisionStats()
  const { decisions, loading: decisionsLoading, refetch: refetchDecisions, deleteDecision, updateDecision } = useDecisions({ limit: 10 })

  useEffect(() => {
    // Redirect to signup if not authenticated
    if (status === "unauthenticated") {
      router.push('/signup')
      return
    }

    // Get backend JWT token after Google OAuth
    if (status === "authenticated" && session?.user?.email) {
      const token = localStorage.getItem('authToken')
      if (!token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.data?.token) {
            localStorage.setItem('authToken', data.data.token)
          }
        })
        .catch(err => console.error('Failed to get backend token:', err))
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [status, router, session])

  const addNotification = (message: string, type: "success" | "warning" | "error" = "success") => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 5000)
  }

  const handleSaveSuccess = (savedDecision: Decision) => {
    setCurrentDecision(savedDecision)
    setEditMode(true)
    refetchStats()
    refetchDecisions()
  }

  const handleNewDecision = () => {
    setCurrentDecision(emptyDecision)
    setEditMode(false)
    addNotification("Starting new decision", "success")
  }

  const handleNodeClick = (node: DecisionTreeNode) => {
    setSelectedNode(node)
    setDetailPanelOpen(true)
  }

  const handleFactorUpdate = (updatedFactor: Factor) => {
    const updatedFactors = currentDecision.factors.map(f =>
      f.id === updatedFactor.id ? updatedFactor : f
    )
    setCurrentDecision({ ...currentDecision, factors: updatedFactors })
    addNotification("Factor updated successfully!", "success")
  }

  const handleEditDecision = (decision: Decision) => {
    setCurrentDecision(decision)
    setEditMode(true)
    addNotification("Loaded decision for editing", "success")
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteDecision = async (id: string) => {
    const success = await deleteDecision(id)
    if (success) {
      addNotification("Decision deleted successfully", "success")
      refetchStats()
      refetchDecisions()
    } else {
      addNotification("Failed to delete decision", "error")
    }
  }

  const handleOpenTreeBuilder = () => {
    if (currentDecision.factors.length === 0) {
      addNotification("Please add at least one factor first", "warning")
      return
    }
    setTreeBuilderOpen(true)
  }

  const handleSaveTreeChanges = async (updatedDecision: Decision) => {
    setCurrentDecision(updatedDecision)

    // Save to backend if decision has an ID (already created)
    if (updatedDecision.id) {
      const success = await updateDecision(updatedDecision.id, updatedDecision)
      if (success) {
        addNotification("Tree changes saved to database!", "success")
        refetchStats()
        refetchDecisions()
      } else {
        addNotification("Failed to save tree changes", "error")
        return
      }
    } else {
      addNotification("Tree changes saved locally (create decision first)", "warning")
    }

    setTreeBuilderOpen(false)
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
      <AnimatedBackground variant="mesh" />
      <ParticleField count={30} />

      <Header />

      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="container mx-auto px-4 py-8 space-y-8 relative z-10">
        <GamificationPanel onNotification={addNotification} />

        <StatsGrid stats={stats || { totalDecisions: 0, satisfactionRate: 0, activeDecisions: 0, trends: { decisionsThisMonth: 0, satisfactionChange: 0 } }} loading={statsLoading} />

        {/* Decision Form */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <DecisionForm
              decision={currentDecision}
              onDecisionChange={setCurrentDecision}
              onNotification={addNotification}
              onSaveSuccess={handleSaveSuccess}
              editMode={editMode}
            />
          </div>
        </div>

        {/* Decision Visualization */}
        <div className="flex justify-center">
          <div className="w-full max-w-5xl space-y-4">
            {/* 2D/3D Toggle */}
            <div className="flex justify-center">
              <div className="bg-gray-800/90 backdrop-blur-md rounded-lg p-1 border border-gray-600/50 shadow-lg">
                <button
                  onClick={() => {}}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-all bg-blue-600 text-white shadow-sm"
                >
                  2D Tree
                </button>
                <button
                  onClick={() => {
                    setShow3DPopup(true)
                    addNotification("🚀 Opening 3D Cosmos in full-screen mode!", "success")
                  }}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-all bg-purple-600 text-white hover:bg-purple-700"
                >
                  🌌 3D Cosmos
                </button>
              </div>
            </div>

            {/* Visualization Component - Always 2D Tree */}
            <TreeVisualization
              decision={currentDecision}
              onNodeClick={handleNodeClick}
              onContinueToBuilder={handleOpenTreeBuilder}
            />
          </div>
        </div>

        {/* Decision History */}
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            <DecisionHistoryList
              decisions={decisions}
              loading={decisionsLoading}
              onEdit={handleEditDecision}
              onDelete={handleDeleteDecision}
            />
          </div>
        </div>

        {/* Node Detail Panel */}
        <NodeDetailPanel
          node={selectedNode}
          isOpen={detailPanelOpen}
          onClose={() => setDetailPanelOpen(false)}
          onUpdate={handleFactorUpdate}
        />

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

      {/* 3D Cosmos Popup */}
      <DecisionCosmosPopup
        decision={currentDecision}
        isOpen={show3DPopup}
        onClose={() => setShow3DPopup(false)}
      />

      {/* Tree Builder Modal */}
      <TreeBuilderModal
        isOpen={treeBuilderOpen}
        onClose={() => setTreeBuilderOpen(false)}
        decision={currentDecision}
        onSave={handleSaveTreeChanges}
      />
    </div>
  )
}