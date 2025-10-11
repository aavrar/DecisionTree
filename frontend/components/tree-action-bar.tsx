"use client"

import { Sparkles, Plus, Trash2, Edit2, Play, CheckCircle, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface TreeActionBarProps {
  selectedNodeId: string | null
  decisionStatus: "draft" | "active" | "resolved" | "archived" | "complete"
  onAnalyze: () => void
  onAddNode: () => void
  onDeleteNode: () => void
  onEditNode: () => void
  onMarkActive?: () => void
  onMarkDraft?: () => void
  onMarkComplete?: () => void
  onRecalculateWeights?: () => void
  analyzing?: boolean
  cooldownSeconds?: number
}

export function TreeActionBar({
  selectedNodeId,
  decisionStatus,
  onAnalyze,
  onAddNode,
  onDeleteNode,
  onEditNode,
  onMarkActive,
  onMarkDraft,
  onMarkComplete,
  onRecalculateWeights,
  analyzing = false,
  cooldownSeconds = 0,
}: TreeActionBarProps) {
  const isDisabled = analyzing || cooldownSeconds > 0
  const isReadOnly = decisionStatus === "complete"

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-2 sm:p-4 bg-black border-b border-white/10">
      {/* Mark as Active - Only show for draft status */}
      {decisionStatus === "draft" && onMarkActive && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onMarkActive}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
            >
              <Play className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Mark as Active</span>
              <span className="sm:hidden">Active</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Start making decisions by marking branches Yes/No</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Back to Draft - Only show for active status */}
      {decisionStatus === "active" && onMarkDraft && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onMarkDraft}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-semibold gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
            >
              <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Back to Draft</span>
              <span className="sm:hidden">Draft</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Return to draft mode to edit factors and weights</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Mark as Complete - Only show for active status */}
      {decisionStatus === "active" && onMarkComplete && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onMarkComplete}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
            >
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Mark as Complete</span>
              <span className="sm:hidden">Complete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Lock this decision as complete and read-only</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Recalculate Weights - Only show for active status */}
      {decisionStatus === "active" && onRecalculateWeights && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onRecalculateWeights}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
            >
              <Scale className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden lg:inline">Recalculate Weights</span>
              <span className="lg:hidden">Weights</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Re-run pairwise comparisons to update weights</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* AI Analysis */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onAnalyze}
            disabled={isDisabled}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{analyzing ? "Analyzing..." : cooldownSeconds > 0 ? `${cooldownSeconds}s` : "AI"}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Get AI insights on your decision tree</p>
        </TooltipContent>
      </Tooltip>

      {/* Add Node - Disabled for complete decisions */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onAddNode}
            disabled={!selectedNodeId || isReadOnly}
            className="bg-white text-black hover:bg-gray-200 font-semibold gap-1 disabled:opacity-50 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-10"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isReadOnly ? "Cannot add nodes to complete decisions" : !selectedNodeId ? "Select a node to add child" : "Add child node to selected"}</p>
        </TooltipContent>
      </Tooltip>

      {/* Edit Node - Disabled for complete decisions */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onEditNode}
            disabled={!selectedNodeId || isReadOnly}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 font-semibold gap-1 disabled:opacity-50 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-10"
          >
            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isReadOnly ? "Cannot edit complete decisions" : !selectedNodeId ? "Select a node to edit" : "Edit selected node"}</p>
        </TooltipContent>
      </Tooltip>

      {/* Delete Node - Disabled for complete decisions */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onDeleteNode}
            disabled={!selectedNodeId || isReadOnly}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 font-semibold gap-1 disabled:opacity-50 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-10"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isReadOnly ? "Cannot delete nodes from complete decisions" : !selectedNodeId ? "Select a node to delete" : "Delete selected node"}</p>
        </TooltipContent>
      </Tooltip>

      {/* Status Indicator */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {selectedNodeId && <span className="hidden sm:inline text-xs sm:text-sm text-gray-400">Node selected</span>}
        {isReadOnly && <span className="text-xs sm:text-sm text-blue-400 font-medium">Read-Only</span>}
      </div>
    </div>
  )
}
