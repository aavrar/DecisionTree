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
import { TemplateSelectionModal } from "@/components/template-selection-modal"
import { HelpModal } from "@/components/help-modal"
import { BackgroundWaves } from "@/components/background-waves"
import { Skeleton } from "@/components/ui/skeleton"
import type { Decision } from "@/types/decision"
import { useDecisions } from "@/hooks/useDecisions"
import { useDecisionAnalysis } from "@/hooks/useDecisionAnalysis"
import type { DecisionTemplate } from "@/lib/decision-templates"

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
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false)
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active")
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState("")
  const titleInputRef = useRef<HTMLInputElement>(null)

  const { decisions, loading: decisionsLoading, refetch: refetchDecisions, deleteDecision, updateDecision, createDecision, duplicateDecision } = useDecisions({ limit: 50, autoFetch: false })
  const { analysis, loading: analyzing, error: analysisError, cooldownSeconds, analyzeDecision } = useDecisionAnalysis()

  // Authentication check and token setup
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signup")
      return
    }

    // If authenticated via NextAuth but no token in localStorage, get one from backend
    if (status === "authenticated" && session?.user?.email) {
      const existingToken = localStorage.getItem('authToken')

      // Check if token is expired
      let tokenExpired = false
      if (existingToken) {
        try {
          const payload = JSON.parse(atob(existingToken.split('.')[1]))
          const expiration = payload.exp * 1000
          tokenExpired = Date.now() >= expiration
        } catch (err) {
          tokenExpired = true
        }
      }

      if (!existingToken || tokenExpired) {
        // Clear expired token and get new one
        if (tokenExpired) {
          localStorage.removeItem('authToken')
        }

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
        // Token exists and is valid, fetch decisions
        refetchDecisions()
      }
    }
  }, [status, session, router, refetchDecisions])

  // Keep backend alive (Render free tier sleep prevention)
  useEffect(() => {
    const keepAlive = setInterval(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
        .catch(err => console.log('Keep-alive ping failed:', err))
    }, 10 * 60 * 1000) // Every 14 minutes

    return () => clearInterval(keepAlive)
  }, [])

  // Auto-show analysis panel when analysis completes
  useEffect(() => {
    if (analysis && !analyzing && !analysisError) {
      setShowAnalysisPanel(true)
    }
  }, [analysis, analyzing, analysisError])

  const handleNewDecision = useCallback(() => {
    console.log('Opening template modal')
    setTemplateModalOpen(true)
  }, [])

  const handleSelectTemplate = useCallback(async (template: DecisionTemplate) => {
    setTemplateModalOpen(false)

    // Generate unique IDs for the template
    const generateUniqueIds = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(item => generateUniqueIds(item))
      } else if (obj && typeof obj === 'object') {
        const newObj = { ...obj }
        if (newObj.id) {
          newObj.id = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9)
        }
        Object.keys(newObj).forEach(key => {
          newObj[key] = generateUniqueIds(newObj[key])
        })
        return newObj
      }
      return obj
    }

    const newDecision = generateUniqueIds(template.template) as Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>

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
    console.log('[Dashboard] handleUpdateDecision called with:', updatedDecision)
    setCurrentDecision(updatedDecision)
    if (updatedDecision.id) {
      console.log('[Dashboard] Calling API updateDecision')
      const result = await updateDecision(updatedDecision.id, updatedDecision)
      console.log('[Dashboard] API updateDecision result:', result)
      refetchDecisions()
    }
  }, [updateDecision, refetchDecisions])

  const handleDeleteDecision = useCallback(async (decisionId: string) => {
    const success = await deleteDecision(decisionId)
    if (success) {
      if (currentDecision.id === decisionId) {
        setCurrentDecision(emptyDecision)
      }
      refetchDecisions()
    }
  }, [deleteDecision, currentDecision.id, refetchDecisions])

  const handleArchiveDecision = useCallback(async (decisionId: string) => {
    await updateDecision(decisionId, {
      status: 'archived',
      archivedAt: new Date()
    })
    if (currentDecision.id === decisionId) {
      setCurrentDecision(emptyDecision)
    }
    refetchDecisions()
  }, [updateDecision, currentDecision.id, refetchDecisions])

  const handleUnarchiveDecision = useCallback(async (decisionId: string) => {
    await updateDecision(decisionId, {
      status: 'active',
      archivedAt: undefined
    })
    refetchDecisions()
  }, [updateDecision, refetchDecisions])

  const handleDuplicateDecision = useCallback(async (decisionId: string) => {
    const duplicated = await duplicateDecision(decisionId)
    if (duplicated) {
      setCurrentDecision(duplicated)
      refetchDecisions()
    }
  }, [duplicateDecision, refetchDecisions])

  const handleMarkActive = useCallback(async () => {
    if (!currentDecision.id) {
      alert("Please save the decision first")
      return
    }
    const updated = { ...currentDecision, status: 'active' as const }
    await updateDecision(currentDecision.id, { status: 'active' })
    setCurrentDecision(updated)
    refetchDecisions()
  }, [currentDecision, updateDecision, refetchDecisions])

  const handleMarkDraft = useCallback(async () => {
    if (!currentDecision.id) {
      alert("Please save the decision first")
      return
    }
    const updated = { ...currentDecision, status: 'draft' as const }
    await updateDecision(currentDecision.id, { status: 'draft' })
    setCurrentDecision(updated)
    refetchDecisions()
  }, [currentDecision, updateDecision, refetchDecisions])

  const handleMarkComplete = useCallback(async () => {
    if (!currentDecision.id) {
      alert("Please save the decision first")
      return
    }
    const updated = { ...currentDecision, status: 'complete' as const, completedAt: new Date() }
    await updateDecision(currentDecision.id, { status: 'complete', completedAt: new Date() })
    setCurrentDecision(updated)
    refetchDecisions()
  }, [currentDecision, updateDecision, refetchDecisions])

  const handleAnalyzeDecision = useCallback(async () => {
    if (!currentDecision.id) {
      alert("Please save the decision first")
      return
    }
    await analyzeDecision(currentDecision.id, currentDecision)
  }, [currentDecision, analyzeDecision])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    signOut({ callbackUrl: "/signup" })
  }

  const handleHelp = () => {
    setHelpModalOpen(true)
  }

  const handleArchivedView = () => {
    setActiveTab(activeTab === "active" ? "archived" : "active")
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
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full bg-white/10" />
          <Skeleton className="h-32 w-full bg-white/10" />
          <Skeleton className="h-24 w-full bg-white/10" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-1/2 bg-white/10" />
            <Skeleton className="h-10 w-1/2 bg-white/10" />
          </div>
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
        onHelp={handleHelp}
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
          onDeleteDecision={handleDeleteDecision}
          onArchiveDecision={handleArchiveDecision}
          onUnarchiveDecision={handleUnarchiveDecision}
          onDuplicateDecision={handleDuplicateDecision}
          loading={decisionsLoading}
          activeTab={activeTab}
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
                  cooldownSeconds={cooldownSeconds}
                  onMarkActive={handleMarkActive}
                  onMarkDraft={handleMarkDraft}
                  onMarkComplete={handleMarkComplete}
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

      <TemplateSelectionModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </div>
  )
}
