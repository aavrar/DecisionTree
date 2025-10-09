"use client"

import { useState } from "react"
import { Plus, ChevronRight, Trash2, Archive, MoreVertical, ChevronDown, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DeleteDecisionDialog } from "@/components/delete-decision-dialog"
import type { Decision } from "@/types/decision"

interface ActiveBranchesSidebarProps {
  decisions: Decision[]
  selectedDecisionId?: string
  onSelectDecision: (decision: Decision) => void
  onCreateNew: () => void
  onDeleteDecision?: (decisionId: string) => void
  onArchiveDecision?: (decisionId: string) => void
  onUnarchiveDecision?: (decisionId: string) => void
  onDuplicateDecision?: (decisionId: string) => void
  loading?: boolean
  activeTab: "active" | "archived"
}

export function ActiveBranchesSidebar({
  decisions,
  selectedDecisionId,
  onSelectDecision,
  onCreateNew,
  onDeleteDecision,
  onArchiveDecision,
  onUnarchiveDecision,
  onDuplicateDecision,
  loading,
  activeTab
}: ActiveBranchesSidebarProps) {
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null)
  const [completeCollapsed, setCompleteCollapsed] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [decisionToDelete, setDecisionToDelete] = useState<Decision | null>(null)

  const completeBranches = decisions.filter(d => d.status === "complete")
  const activeBranches = activeTab === "active"
    ? decisions.filter(d => d.status !== "archived" && d.status !== "complete")
    : decisions.filter(d => d.status === "archived")

  const getTimeUntilDeletion = (archivedAt: Date | undefined) => {
    if (!archivedAt) return null
    const now = new Date()
    const archived = new Date(archivedAt)
    const deletionDate = new Date(archived.getTime() + 7 * 24 * 60 * 60 * 1000)
    const diff = deletionDate.getTime() - now.getTime()

    if (diff <= 0) return "Deleting..."

    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

    if (days > 0) return `${days}d`
    return `${hours}h`
  }

  return (
    <aside className="w-80 bg-black border-r border-white/10 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white mb-2">
          {activeTab === "active" ? "ACTIVE BRANCHES" : "ARCHIVED BRANCHES"}
        </h2>
        <p className="text-xs text-gray-500">
          {activeBranches.length} {activeTab === "active" ? "active" : "archived"} decision{activeBranches.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Branches List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-black/40 border border-white/10 rounded-lg p-4">
                <Skeleton className="h-4 w-3/4 mb-3 bg-white/10" />
                <Skeleton className="h-3 w-1/2 mb-3 bg-white/10" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 bg-white/10" />
                  <Skeleton className="h-5 w-16 bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : activeBranches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No active Branches</p>
            <p className="text-gray-600 text-xs mt-1">Create one to get started</p>
          </div>
        ) : (
          activeBranches.map((decision) => (
            <div key={decision.id} className="relative">
              <div
                className={`w-full text-left p-4 rounded-lg border transition-all group ${
                  selectedDecisionId === decision.id
                    ? "bg-white/10 border-white/30"
                    : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 min-w-0 pr-2 cursor-pointer"
                    onClick={() => onSelectDecision(decision)}
                  >
                    <h3 className="text-white font-medium text-sm truncate mb-1">
                      {decision.title || "Untitled Decision"}
                    </h3>
                    {decision.description && (
                      <p className="text-gray-400 text-xs truncate mb-2">
                        {decision.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{decision.factors?.length || 0} factors</span>
                      <span className={`px-2 py-0.5 rounded ${
                        decision.status === "draft" ? "bg-yellow-500/20 text-yellow-400" :
                        decision.status === "active" ? "bg-green-500/20 text-green-400" :
                        decision.status === "archived" ? "bg-red-500/20 text-red-400" :
                        "bg-gray-500/20 text-gray-400"
                      }`}>
                        {decision.status === "archived" ? getTimeUntilDeletion(decision.archivedAt) : decision.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpenFor(menuOpenFor === decision.id ? null : decision.id)
                    }}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Dropdown Menu */}
              {menuOpenFor === decision.id && (
                <div className="absolute right-2 top-12 z-20 bg-black border border-white/20 rounded-lg shadow-xl overflow-hidden min-w-[150px]">
                  {onDuplicateDecision && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDuplicateDecision(decision.id)
                        setMenuOpenFor(null)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                  )}
                  {activeTab === "active" && onArchiveDecision && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onArchiveDecision(decision.id)
                        setMenuOpenFor(null)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <Archive className="w-4 h-4" />
                      Archive
                    </button>
                  )}
                  {activeTab === "archived" && onUnarchiveDecision && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onUnarchiveDecision(decision.id)
                        setMenuOpenFor(null)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-green-400 hover:bg-green-500/10 transition-colors flex items-center gap-2"
                    >
                      <Archive className="w-4 h-4" />
                      Unarchive
                    </button>
                  )}
                  {onDeleteDecision && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDecisionToDelete(decision)
                        setDeleteDialogOpen(true)
                        setMenuOpenFor(null)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Complete Branches Section - Only show on active tab - AT BOTTOM */}
      {activeTab === "active" && completeBranches.length > 0 && (
        <div className="border-t border-white/10">
          <button
            onClick={() => setCompleteCollapsed(!completeCollapsed)}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div>
              <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
                Complete Branches
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {completeBranches.length} completed decision{completeBranches.length !== 1 ? 's' : ''}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${completeCollapsed ? '-rotate-90' : ''}`} />
          </button>

          {!completeCollapsed && (
            <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
              {completeBranches.map((decision) => (
                <div key={decision.id} className="relative">
                  <div
                    className={`w-full text-left p-4 rounded-lg border transition-all group ${
                      selectedDecisionId === decision.id
                        ? "bg-white/10 border-white/30"
                        : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="flex-1 min-w-0 pr-2 cursor-pointer"
                        onClick={() => onSelectDecision(decision)}
                      >
                        <h3 className="text-white font-medium text-sm truncate mb-1">
                          {decision.title || "Untitled Decision"}
                        </h3>
                        {decision.description && (
                          <p className="text-gray-400 text-xs truncate mb-2">
                            {decision.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{decision.factors?.length || 0} factors</span>
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                            Complete
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuOpenFor(menuOpenFor === decision.id ? null : decision.id)
                        }}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {menuOpenFor === decision.id && (
                    <div className="absolute right-2 top-12 z-20 bg-black border border-white/20 rounded-lg shadow-xl overflow-hidden min-w-[150px]">
                      {onDuplicateDecision && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDuplicateDecision(decision.id)
                            setMenuOpenFor(null)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </button>
                      )}
                      {onArchiveDecision && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onArchiveDecision(decision.id)
                            setMenuOpenFor(null)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </button>
                      )}
                      {onDeleteDecision && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDecisionToDelete(decision)
                            setDeleteDialogOpen(true)
                            setMenuOpenFor(null)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create New Button */}
      <div className="p-4 border-t border-white/10">
        <a
          href="https://aahadv.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center mb-3 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all"
        >
          <span className="text-xs text-gray-400">Made by</span>
          <span className="text-sm font-semibold text-white ml-1">Aahad Vakani</span>
        </a>
        <Button
          onClick={onCreateNew}
          className="w-full bg-white/5 border-2 border-white/20 text-white font-medium py-3 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          CREATE NEW BRANCH
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDecisionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        decision={decisionToDelete}
        onConfirm={() => {
          if (decisionToDelete && onDeleteDecision) {
            onDeleteDecision(decisionToDelete.id)
            setDeleteDialogOpen(false)
            setDecisionToDelete(null)
          }
        }}
      />
    </aside>
  )
}
