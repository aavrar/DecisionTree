"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
import { DecisionSearchFilter, type SearchFilterState } from "@/components/decision-search-filter"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { ParticleField } from "@/components/ui/particle-field"
import { TreeBuilderModal } from "@/components/tree-builder-modal"
import { OnboardingTutorial, type TutorialStep } from "@/components/onboarding-tutorial"
import { StarterTreeForm } from "@/components/starter-tree-form"
import { DecisionAnalysisPanel } from "@/components/decision-analysis-panel"
import type { Decision, DecisionStats, DecisionTreeNode, Factor } from "@/types/decision"
import { useDecisions, useDecisionStats } from "@/hooks/useDecisions"
import { useDecisionAnalysis } from "@/hooks/useDecisionAnalysis"

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
  const [searchFilters, setSearchFilters] = useState<SearchFilterState>({
    searchQuery: "",
    statusFilter: "all",
    sortBy: "newest"
  })
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false)

  const { stats, loading: statsLoading, refetch: refetchStats } = useDecisionStats()
  const { decisions, loading: decisionsLoading, refetch: refetchDecisions, deleteDecision, updateDecision, createDecision } = useDecisions({ limit: 10 })
  const { analysis, loading: analyzing, error: analysisError, analyzeDecision } = useDecisionAnalysis()

  // Define addNotification early so it can be used in callbacks
  const addNotification = useCallback((message: string, type: "success" | "warning" | "error" = "success") => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 5000)
  }, [])

  // Memoize the starter tree submit handler
  const handleStarterTreeSubmit = useCallback(async (data: { title: string; factors: string[] }) => {
    if (!createDecision) {
      console.error('createDecision is not available')
      return
    }

    const starterDecision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'> = {
      title: data.title,
      description: "My first decision tree",
      factors: data.factors.map((name, index) => ({
        id: Date.now().toString() + index,
        name,
        weight: Math.round(100 / data.factors.length),
        category: "personal",
        description: "",
        uncertainty: 5,
        timeHorizon: "short-term",
        emotionalWeight: 5,
        regretPotential: 5,
        children: []
      })),
      status: "draft",
      emotionalContext: {
        initialStressLevel: 5,
        confidenceLevel: 5,
        urgencyRating: 5
      }
    }

    const created = await createDecision(starterDecision)
    if (created) {
      setCurrentDecision(created)
      setEditMode(true)
      addNotification("🎉 Your first decision created!", "success")
      refetchStats()
      refetchDecisions()
    }
  }, [createDecision, setCurrentDecision, setEditMode, addNotification, refetchStats, refetchDecisions])

  // Memoize tutorial steps
  const tutorialSteps: TutorialStep[] = useMemo(() => [
    {
      id: "welcome",
      title: "Welcome to DecisionTree! 🎉",
      description: "Let's take a quick tour to help you get started with making better decisions. This will only take a minute!",
    },
    {
      id: "stats",
      title: "Your Decision Dashboard",
      description: "Track your decision-making progress with real-time statistics. See how many decisions you've made, your satisfaction rate, and monthly trends.",
      targetElement: ".stats-grid",
      position: "bottom"
    },
    {
      id: "create-starter-tree",
      title: "Create Your First Decision 🌳",
      description: "Let's create your first decision tree together! Fill in a decision you're facing and add 2-3 factors that matter to you.",
      interactive: true,
      interactiveComponent: <StarterTreeForm onComplete={handleStarterTreeSubmit} />
    },
    {
      id: "tree-builder",
      title: "Build Your Decision Tree",
      description: "Once you've added factors, click 'Continue to Tree Builder' to create a hierarchical tree with outcomes, consequences, and nested sub-decisions.",
      targetElement: ".tree-visualization",
      position: "bottom"
    },
    {
      id: "3d-view",
      title: "Explore in 3D",
      description: "View your decision tree in an immersive 3D cosmos. Each factor becomes a planet orbiting your central decision!",
      targetElement: ".visualization-toggle",
      position: "bottom"
    },
    {
      id: "history",
      title: "Decision History",
      description: "All your decisions are saved here. Use the search and filters to quickly find past decisions. You can edit or delete them anytime.",
      targetElement: ".decision-history",
      position: "top"
    },
    {
      id: "shortcuts",
      title: "Keyboard Shortcuts",
      description: "Power users can use keyboard shortcuts! Press Ctrl+K to open the command palette, and Shift+? in the tree builder to see all available shortcuts.",
    },
    {
      id: "complete",
      title: "You're All Set! 🚀",
      description: "You're ready to start making better decisions! Remember, you can always click the help icon to see this tour again.",
    }
  ], [handleStarterTreeSubmit])

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

  // Keep backend alive (Render free tier sleep prevention)
  useEffect(() => {
    const keepAlive = setInterval(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
        .catch(err => console.log('Keep-alive ping failed:', err))
    }, 14 * 60 * 1000) // Every 14 minutes

    return () => clearInterval(keepAlive)
  }, [])

  // Check if user is new (show onboarding)
  useEffect(() => {
    if (status === "authenticated" && stats && stats.totalDecisions === 0) {
      const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding")
      if (!hasSeenOnboarding) {
        setTimeout(() => setShowOnboarding(true), 1000) // Delay for smooth entry
      }
    }
  }, [status, stats])

  const handleSaveSuccess = useCallback((savedDecision: Decision) => {
    setCurrentDecision(savedDecision)
    setEditMode(true)
    refetchStats()
    refetchDecisions()
  }, [refetchStats, refetchDecisions])

  const handleNewDecision = useCallback(() => {
    setCurrentDecision(emptyDecision)
    setEditMode(false)
    addNotification("Starting new decision", "success")
  }, [addNotification])

  const handleNodeClick = useCallback((node: DecisionTreeNode) => {
    setSelectedNode(node)
    setDetailPanelOpen(true)
  }, [])

  const handleFactorUpdate = useCallback((updatedFactor: Factor) => {
    const updatedFactors = currentDecision.factors.map(f =>
      f.id === updatedFactor.id ? updatedFactor : f
    )
    setCurrentDecision({ ...currentDecision, factors: updatedFactors })
    addNotification("Factor updated successfully!", "success")
  }, [currentDecision, addNotification])

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

  const handleAnalyzeDecision = useCallback(async () => {
    if (!currentDecision.id) {
      addNotification("Please save your decision first", "warning")
      return
    }

    if (currentDecision.factors.length === 0) {
      addNotification("Please add at least one factor to analyze", "warning")
      return
    }

    addNotification("Analyzing decision...", "success")
    await analyzeDecision(currentDecision.id)
  }, [currentDecision, analyzeDecision, addNotification])

  useEffect(() => {
    if (analysis && !analyzing && !analysisError) {
      setShowAnalysisPanel(true)
    }
  }, [analysis, analyzing, analysisError])

  useEffect(() => {
    if (analysisError) {
      addNotification(analysisError, "error")
    }
  }, [analysisError, addNotification])

  // Filter and sort decisions based on search filters
  const filteredDecisions = decisions
    .filter(decision => {
      // Search query filter
      if (searchFilters.searchQuery) {
        const query = searchFilters.searchQuery.toLowerCase()
        const matchesTitle = decision.title.toLowerCase().includes(query)
        const matchesDescription = decision.description?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDescription) return false
      }

      // Status filter
      if (searchFilters.statusFilter !== "all" && decision.status !== searchFilters.statusFilter) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      switch (searchFilters.sortBy) {
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "newest":
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      }
    })

  const handleCompleteOnboarding = () => {
    localStorage.setItem("hasSeenOnboarding", "true")
    setShowOnboarding(false)
    addNotification("Welcome to DecisionTree! 🎉", "success")
  }

  const handleSkipOnboarding = () => {
    localStorage.setItem("hasSeenOnboarding", "true")
    setShowOnboarding(false)
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

        <div className="stats-grid">
          <StatsGrid stats={stats || { totalDecisions: 0, satisfactionRate: 0, activeDecisions: 0, trends: { decisionsThisMonth: 0, satisfactionChange: 0 } }} loading={statsLoading} />
        </div>

        {/* Decision Form */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl decision-form">
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
              <div className="bg-gray-800/90 backdrop-blur-md rounded-lg p-1 border border-gray-600/50 shadow-lg visualization-toggle">
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
            <div className="tree-visualization">
              <TreeVisualization
                decision={currentDecision}
                onNodeClick={handleNodeClick}
                onContinueToBuilder={handleOpenTreeBuilder}
                onAnalyze={handleAnalyzeDecision}
              />
            </div>
          </div>
        </div>

        {/* Decision History */}
        <div className="flex justify-center">
          <div className="w-full max-w-6xl space-y-4 decision-history">
            <DecisionSearchFilter
              onFilterChange={setSearchFilters}
              resultsCount={filteredDecisions.length}
            />
            <DecisionHistoryList
              decisions={filteredDecisions}
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

      {/* Onboarding Tutorial */}
      {showOnboarding && (
        <OnboardingTutorial
          steps={tutorialSteps}
          onComplete={handleCompleteOnboarding}
          onSkip={handleSkipOnboarding}
        />
      )}

      {/* Analysis Panel */}
      {showAnalysisPanel && analysis && (
        <DecisionAnalysisPanel
          analysis={analysis}
          onClose={() => setShowAnalysisPanel(false)}
        />
      )}
    </div>
  )
}