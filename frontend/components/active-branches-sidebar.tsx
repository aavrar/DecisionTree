"use client"

import { useState } from "react"
import { Plus, ChevronRight, Trash2, Archive, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Decision } from "@/types/decision"

interface ActiveBranchesSidebarProps {
  decisions: Decision[]
  selectedDecisionId?: string
  onSelectDecision: (decision: Decision) => void
  onCreateNew: () => void
  onDeleteDecision?: (decisionId: string) => void
  onArchiveDecision?: (decisionId: string) => void
  onUnarchiveDecision?: (decisionId: string) => void
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
  loading,
  activeTab
}: ActiveBranchesSidebarProps) {
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null)

  const activeBranches = activeTab === "active"
    ? decisions.filter(d => d.status !== "archived")
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
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Loading...</p>
          </div>
        ) : activeBranches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No active decisions</p>
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
                        if (confirm(`Delete "${decision.title || 'Untitled Decision'}"? This cannot be undone.`)) {
                          onDeleteDecision(decision.id)
                        }
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
    </aside>
  )
}
