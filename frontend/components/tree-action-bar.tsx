"use client"

import { Sparkles, Plus, Trash2, Edit2, Play, CheckCircle } from "lucide-react"
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
  onMarkComplete?: () => void
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
  onMarkComplete,
  analyzing = false,
  cooldownSeconds = 0,
}: TreeActionBarProps) {
  const isDisabled = analyzing || cooldownSeconds > 0
  const isReadOnly = decisionStatus === "complete"

  return (
    <div className="flex items-center gap-3 p-4 bg-black border-b border-white/10">
      {/* Mark as Active - Only show for draft status */}
      {decisionStatus === "draft" && onMarkActive && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onMarkActive}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
            >
              <Play className="w-4 h-4" />
              Mark as Active
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Start making decisions by marking branches Yes/No</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Mark as Complete - Only show for active status */}
      {decisionStatus === "active" && onMarkComplete && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onMarkComplete}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Complete
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Lock this decision as complete and read-only</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* AI Analysis */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onAnalyze}
            disabled={isDisabled}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            {analyzing ? "Analyzing..." : cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s` : "AI Analysis"}
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
            className="bg-white text-black hover:bg-gray-200 font-semibold gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Node
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
            className="border-white/30 text-white hover:bg-white/10 font-semibold gap-2 disabled:opacity-50"
          >
            <Edit2 className="w-4 h-4" />
            Edit
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
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 font-semibold gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isReadOnly ? "Cannot delete nodes from complete decisions" : !selectedNodeId ? "Select a node to delete" : "Delete selected node"}</p>
        </TooltipContent>
      </Tooltip>

      {/* Status Indicator */}
      <div className="ml-auto flex items-center gap-3">
        {selectedNodeId && <span className="text-sm text-gray-400">Node selected</span>}
        {isReadOnly && <span className="text-sm text-blue-400 font-medium">Read-Only Mode</span>}
      </div>
    </div>
  )
}
