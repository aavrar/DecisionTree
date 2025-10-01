"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2, Edit2, Save, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TreeVisualization } from "@/components/tree-visualization"
import { DecisionCosmos3D } from "@/components/decision-cosmos-3d"
import type { Decision, Factor, TreeNodeData } from "@/types/decision"

interface TreeBuilderModalProps {
  isOpen: boolean
  onClose: () => void
  decision: Decision
  onSave: (updatedDecision: Decision) => void
}

export function TreeBuilderModal({ isOpen, onClose, decision, onSave }: TreeBuilderModalProps) {
  const [editingDecision, setEditingDecision] = useState<Decision>(decision)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  // Update editing decision when decision prop changes
  useEffect(() => {
    if (isOpen) {
      setEditingDecision(decision)
    }
  }, [decision, isOpen])

  if (!isOpen) return null

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const handleAddChildNode = (parentId: string, parentPath: number[] = []) => {
    const newNode: TreeNodeData = {
      id: Date.now().toString(),
      name: "New Node",
      type: "outcome",
      description: "",
      children: []
    }

    const updatedFactors = [...editingDecision.factors]

    if (parentPath.length === 0) {
      // Adding to a factor (top level)
      const factorIndex = updatedFactors.findIndex(f => f.id === parentId)
      if (factorIndex !== -1) {
        updatedFactors[factorIndex] = {
          ...updatedFactors[factorIndex],
          children: [...(updatedFactors[factorIndex].children || []), newNode]
        }
      }
    } else {
      // Adding to a nested node
      const factorIndex = parentPath[0]
      let currentNode: any = updatedFactors[factorIndex]

      for (let i = 1; i < parentPath.length; i++) {
        currentNode = currentNode.children[parentPath[i]]
      }

      if (currentNode.id === parentId) {
        currentNode.children = [...(currentNode.children || []), newNode]
      }
    }

    setEditingDecision({ ...editingDecision, factors: updatedFactors })
    setExpandedNodes(new Set([...expandedNodes, parentId]))
  }

  const handleUpdateNode = (nodeId: string, updates: Partial<TreeNodeData>, path: number[]) => {
    const updatedFactors = [...editingDecision.factors]

    if (path.length === 1) {
      // Updating a direct child of factor
      const factorIndex = path[0]
      const factor = updatedFactors[factorIndex]
      if (factor.children) {
        const childIndex = factor.children.findIndex(c => c.id === nodeId)
        if (childIndex !== -1) {
          factor.children[childIndex] = { ...factor.children[childIndex], ...updates }
        }
      }
    } else {
      // Navigate to nested node
      let currentNode: any = updatedFactors[path[0]]
      for (let i = 1; i < path.length - 1; i++) {
        currentNode = currentNode.children[path[i]]
      }
      const childIndex = currentNode.children?.findIndex((c: TreeNodeData) => c.id === nodeId)
      if (childIndex !== -1) {
        currentNode.children[childIndex] = { ...currentNode.children[childIndex], ...updates }
      }
    }

    setEditingDecision({ ...editingDecision, factors: updatedFactors })
  }

  const handleDeleteNode = (nodeId: string, parentPath: number[]) => {
    const updatedFactors = [...editingDecision.factors]

    if (parentPath.length === 1) {
      const factorIndex = parentPath[0]
      const factor = updatedFactors[factorIndex]
      if (factor.children) {
        factor.children = factor.children.filter(c => c.id !== nodeId)
      }
    } else {
      let currentNode: any = updatedFactors[parentPath[0]]
      for (let i = 1; i < parentPath.length - 1; i++) {
        currentNode = currentNode.children[parentPath[i]]
      }
      if (currentNode.children) {
        currentNode.children = currentNode.children.filter((c: TreeNodeData) => c.id !== nodeId)
      }
    }

    setEditingDecision({ ...editingDecision, factors: updatedFactors })
  }

  const handleSave = () => {
    onSave(editingDecision)
    onClose()
  }

  // Recursive component for rendering tree nodes
  const TreeNodeItem = ({
    node,
    path,
    parentId,
    depth = 0
  }: {
    node: TreeNodeData
    path: number[]
    parentId: string
    depth?: number
  }) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0

    return (
      <div className="ml-6 mt-2">
        <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded border border-slate-700 hover:border-slate-600 transition-all group">
          {/* Expand/Collapse */}
          {hasChildren && (
            <button
              onClick={() => toggleExpand(node.id)}
              className="text-slate-400 hover:text-white"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}

          {/* Node Type Badge */}
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            node.type === "outcome" ? "bg-blue-500/20 text-blue-300" :
            node.type === "consequence" ? "bg-purple-500/20 text-purple-300" :
            node.type === "option" ? "bg-green-500/20 text-green-300" :
            "bg-orange-500/20 text-orange-300"
          }`}>
            {node.type}
          </div>

          {/* Node Name Input */}
          <Input
            value={node.name}
            onChange={(e) => handleUpdateNode(node.id, { name: e.target.value }, path)}
            className="flex-1 bg-slate-800 border-slate-600 text-white text-sm"
            placeholder="Node name..."
          />

          {/* Node Type Selector */}
          <Select
            value={node.type}
            onValueChange={(value) =>
              handleUpdateNode(node.id, { type: value as TreeNodeData["type"] }, path)
            }
          >
            <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="outcome">Outcome</SelectItem>
              <SelectItem value="consequence">Consequence</SelectItem>
              <SelectItem value="option">Option</SelectItem>
              <SelectItem value="consideration">Consideration</SelectItem>
            </SelectContent>
          </Select>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAddChildNode(node.id, path)}
              className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
              title="Add child node"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteNode(node.id, path)}
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              title="Delete node"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Recursively render children */}
        {isExpanded && hasChildren && (
          <div className="border-l-2 border-slate-700 pl-4 ml-2">
            {node.children!.map((child, index) => (
              <TreeNodeItem
                key={child.id}
                node={child}
                path={[...path, index]}
                parentId={node.id}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-[95vw] h-[95vh] bg-slate-900 rounded-xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
          <div>
            <h2 className="text-2xl font-bold text-white">{decision.title}</h2>
            <p className="text-sm text-slate-400">Interactive Tree Builder</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setViewMode("2d")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "2d"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                2D View
              </button>
              <button
                onClick={() => setViewMode("3d")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "3d"
                    ? "bg-purple-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                3D View
              </button>
            </div>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Side: Tree Editor */}
          <div className="flex-1 overflow-auto p-6 border-r border-slate-700">
            {viewMode === "2d" ? (
              <div className="space-y-6">
                <div className="text-slate-300 text-sm">
                  <p className="mb-4">
                    Click on any factor node below to add child nodes. Build a complete decision tree
                    by adding outcomes, consequences, and sub-decisions.
                  </p>
                </div>

                {/* Debug Info */}
                {(!editingDecision.factors || editingDecision.factors.length === 0) && (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-lg mb-2">No factors found</p>
                    <p className="text-sm">Please add factors to your decision first</p>
                  </div>
                )}

                {/* Factor List with Nested Children */}
                <div className="space-y-4">
                  {editingDecision.factors?.map((factor, factorIndex) => (
                    <div
                      key={factor.id}
                      className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            factor.category === "financial" ? "bg-emerald-500" :
                            factor.category === "personal" ? "bg-blue-500" :
                            factor.category === "career" ? "bg-purple-500" :
                            "bg-red-500"
                          }`} />
                          <div>
                            <h3 className="text-white font-semibold">{factor.name}</h3>
                            <p className="text-xs text-slate-400">
                              Factor • Weight: {factor.weight}% • {factor.category}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAddChildNode(factor.id, [])}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Child
                        </Button>
                      </div>

                      {/* Recursively render children */}
                      {factor.children && factor.children.length > 0 && (
                        <div className="border-l-2 border-slate-700">
                          {factor.children.map((child, childIndex) => (
                            <TreeNodeItem
                              key={child.id}
                              node={child}
                              path={[factorIndex, childIndex]}
                              parentId={factor.id}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full">
                <DecisionCosmos3D decision={editingDecision} />
              </div>
            )}
          </div>

          {/* Right Side: Preview */}
          <div className="w-1/2 overflow-auto p-6 bg-slate-950/50">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Live Preview</h3>
              <p className="text-sm text-slate-400">
                See how your decision tree looks in real-time
              </p>
            </div>
            <TreeVisualization
              decision={editingDecision}
              width={600}
              height={500}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
