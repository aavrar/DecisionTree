"use client"

import { Sparkles, Plus, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TreeActionBarProps {
  selectedNodeId: string | null
  onAnalyze: () => void
  onAddNode: () => void
  onDeleteNode: () => void
  onEditNode: () => void
  analyzing?: boolean
}

export function TreeActionBar({
  selectedNodeId,
  onAnalyze,
  onAddNode,
  onDeleteNode,
  onEditNode,
  analyzing = false,
}: TreeActionBarProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-black border-b border-white/10">
      {/* AI Analysis */}
      <Button
        onClick={onAnalyze}
        disabled={analyzing}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold gap-2"
      >
        <Sparkles className="w-4 h-4" />
        {analyzing ? "Analyzing..." : "AI Analysis"}
      </Button>

      {/* Add Node */}
      <Button
        onClick={onAddNode}
        disabled={!selectedNodeId}
        className="bg-white text-black hover:bg-gray-200 font-semibold gap-2"
        title={!selectedNodeId ? "Select a node to add child" : "Add child node"}
      >
        <Plus className="w-4 h-4" />
        Add Node
      </Button>

      {/* Edit Node */}
      <Button
        onClick={onEditNode}
        disabled={!selectedNodeId}
        variant="outline"
        className="border-white/30 text-white hover:bg-white/10 font-semibold gap-2"
        title={!selectedNodeId ? "Select a node to edit" : "Edit node"}
      >
        <Edit2 className="w-4 h-4" />
        Edit
      </Button>

      {/* Delete Node */}
      <Button
        onClick={onDeleteNode}
        disabled={!selectedNodeId}
        variant="outline"
        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 font-semibold gap-2"
        title={!selectedNodeId ? "Select a node to delete" : "Delete node"}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </Button>

      {/* Selection Status */}
      {selectedNodeId && (
        <div className="ml-auto text-sm text-gray-400">
          Node selected
        </div>
      )}
    </div>
  )
}
