"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Edit2 } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"
import { ActiveBranchesSidebar } from "@/components/active-branches-sidebar"
import { InteractiveTreeView } from "@/components/interactive-tree-view"
import { DecisionFormModal } from "@/components/decision-form-modal"
import { DecisionAnalysisPanel } from "@/components/decision-analysis-panel"
import { BackgroundWaves } from "@/components/background-waves"
import type { Decision } from "@/types/decision"
import { useDecisions } from "@/hooks/useDecisions"
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
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false)
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active")
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState("")
  const titleInputRef = useRef<HTMLInputElement>(null)

  const { decisions, loading: decisionsLoading, refetch: refetchDecisions, deleteDecision, updateDecision, createDecision } = useDecisions({ limit: 50, autoFetch: false })
  const { analysis, loading: analyzing, error: analysisError, analyzeDecision } = useDecisionAnalysis()

  // Authentication check and token setup
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signup")
      return
    }

    // If authenticated via NextAuth but no token in localStorage, get one from backend
    if (status === "authenticated" && session?.user?.email) {
      const existingToken = localStorage.getItem('authToken')
      if (!existingToken) {
        // Call backend to get/create token
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
          }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data?.token) {
              localStorage.setItem('authToken', data.data.token)
              // Refetch decisions after token is set
              refetchDecisions()
            }
          })
          .catch(err => console.error('Failed to get auth token:', err))
      } else {
        // Token exists, fetch decisions
        refetchDecisions()
      }
    }
  }, [status, session, router, refetchDecisions])

  // Keep backend alive (Render free tier sleep prevention)
  useEffect(() => {
    const keepAlive = setInterval(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
        .catch(err => console.log('Keep-alive ping failed:', err))
    }, 14 * 60 * 1000) // Every 14 minutes

    return () => clearInterval(keepAlive)
  }, [])

  // Auto-show analysis panel when analysis completes
  useEffect(() => {
    if (analysis && !analyzing && !analysisError) {
      setShowAnalysisPanel(true)
    }
  }, [analysis, analyzing, analysisError])

  const handleNewDecision = useCallback(async () => {
    // Create a blank decision with one starter factor
    const newDecision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'> = {
      title: "Untitled Decision",
      description: "",
      factors: [
        {
          id: Date.now().toString(),
          name: "First Factor",
          weight: 50,
          category: "personal",
          description: "",
          children: []
        }
      ],
      status: "draft",
      emotionalContext: {
        initialStressLevel: 5,
        confidenceLevel: 5,
        urgencyRating: 5,
      },
    }

    // Create the decision in the backend first
    const created = await createDecision(newDecision)
    if (created) {
      setCurrentDecision(created)
      refetchDecisions()
    }
  }, [createDecision, refetchDecisions])

  const handleSelectDecision = useCallback((decision: Decision) => {
    setCurrentDecision(decision)
  }, [])

  const handleSaveDecision = useCallback(async (decision: Decision) => {
    if (decision.id) {
      // Update existing
      const success = await updateDecision(decision.id, decision)
      if (success) {
        setCurrentDecision(decision)
        refetchDecisions()
      }
    } else {
      // Create new
      const created = await createDecision(decision)
      if (created) {
        setCurrentDecision(created)
        refetchDecisions()
      }
    }
  }, [updateDecision, createDecision, refetchDecisions])

  const handleUpdateDecision = useCallback(async (updatedDecision: Decision) => {
    setCurrentDecision(updatedDecision)
    if (updatedDecision.id) {
      await updateDecision(updatedDecision.id, updatedDecision)
      refetchDecisions()
    }
  }, [updateDecision, refetchDecisions])

  const handleAnalyzeDecision = useCallback(async () => {
    if (!currentDecision.id) {
      alert("Please save the decision first")
      return
    }
    await analyzeDecision(currentDecision.id)
  }, [currentDecision, analyzeDecision])

  const handleLogout = () => {
    signOut({ callbackUrl: "/signup" })
  }

  const handleArchivedView = () => {
    setActiveTab("archived")
  }

  const handleStartEditTitle = () => {
    setEditedTitle(currentDecision.title)
    setIsEditingTitle(true)
    setTimeout(() => titleInputRef.current?.focus(), 0)
  }

  const handleSaveTitle = async () => {
    if (editedTitle.trim() && currentDecision.id) {
      const updated = { ...currentDecision, title: editedTitle.trim() }
      await updateDecision(currentDecision.id, updated)
      setCurrentDecision(updated)
      refetchDecisions()
    }
    setIsEditingTitle(false)
  }

  const handleKeyDownTitle = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle()
    } else if (e.key === "Escape") {
      setIsEditingTitle(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden">
      {/* Background */}
      <BackgroundWaves />

      {/* Navigation */}
      <DashboardNav
        username={session?.user?.name || undefined}
        onNewDecision={handleNewDecision}
        onArchived={handleArchivedView}
        onLogout={handleLogout}
        activeTab={activeTab}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Sidebar - Active Branches */}
        <ActiveBranchesSidebar
          decisions={decisions || []}
          selectedDecisionId={currentDecision.id}
          onSelectDecision={handleSelectDecision}
          onCreateNew={handleNewDecision}
          loading={decisionsLoading}
        />

        {/* Main Content Area - Tree Builder Embedded */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {currentDecision.id ? (
            <>
              {/* Tree Builder Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black">
                <div className="flex items-center gap-3 flex-1">
                  {isEditingTitle ? (
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onBlur={handleSaveTitle}
                      onKeyDown={handleKeyDownTitle}
                      className="text-xl font-bold text-white bg-white/10 border border-white/20 rounded px-3 py-1 focus:outline-none focus:border-white/40"
                      placeholder="Enter decision title..."
                    />
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <h2 className="text-xl font-bold text-white">{currentDecision.title || "Untitled Decision"}</h2>
                      <button
                        onClick={handleStartEditTitle}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {/* View Toggle */}
                  <div className="flex bg-white/5 rounded-lg p-1 border border-white/20">
                    <button
                      onClick={() => setViewMode("2d")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === "2d"
                          ? "bg-white text-black"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      2D View
                    </button>
                    <button
                      onClick={() => setViewMode("3d")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === "3d"
                          ? "bg-white text-black"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      3D View
                    </button>
                  </div>
                </div>
              </div>

              {/* Tree Builder Content */}
              <div className="flex-1 overflow-hidden">
                <InteractiveTreeView
                  decision={currentDecision}
                  onUpdate={handleUpdateDecision}
                  viewMode={viewMode}
                  onAnalyze={handleAnalyzeDecision}
                  analyzing={analyzing}
                />
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Select a decision from the sidebar
                </h2>
                <p className="text-gray-400 mb-6">
                  or create a new one to get started
                </p>
                <button
                  onClick={handleNewDecision}
                  className="bg-white text-black font-semibold px-8 py-3 rounded-lg hover:bg-gray-200 transition-all hover:scale-105"
                >
                  Create New Branch
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <DecisionFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        decision={currentDecision}
        onSave={handleSaveDecision}
      />

      {showAnalysisPanel && analysis && (
        <DecisionAnalysisPanel
          analysis={analysis}
          onClose={() => setShowAnalysisPanel(false)}
        />
      )}
    </div>
  )
}
