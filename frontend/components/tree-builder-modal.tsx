"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2, Edit2, Save, ChevronDown, ChevronRight, GripVertical, Copy, Eraser, Keyboard, Undo, Redo } from "lucide-react"
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useKeyboardShortcuts, type KeyboardShortcut } from '@/hooks/useKeyboardShortcuts'
import { useUndoRedo } from '@/hooks/useUndoRedo'
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
  const { state: editingDecision, setState: setEditingDecision, undo, redo, canUndo, canRedo, clear } = useUndoRedo<Decision>(decision, 50)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [showShortcuts, setShowShortcuts] = useState(false)

  const handleSave = () => {
    onSave(editingDecision)
    onClose()
  }

  // Keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 's',
      ctrl: true,
      handler: handleSave,
      description: 'Save changes'
    },
    {
      key: 'Escape',
      handler: onClose,
      description: 'Close modal'
    },
    {
      key: '2',
      ctrl: true,
      handler: () => setViewMode('2d'),
      description: 'Switch to 2D view'
    },
    {
      key: '3',
      ctrl: true,
      handler: () => setViewMode('3d'),
      description: 'Switch to 3D view'
    },
    {
      key: 'z',
      ctrl: true,
      handler: undo,
      description: 'Undo'
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      handler: redo,
      description: 'Redo'
    },
    {
      key: '?',
      shift: true,
      handler: () => setShowShortcuts(!showShortcuts),
      description: 'Toggle shortcuts help'
    }
  ]

  useKeyboardShortcuts(shortcuts, isOpen)

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
    if (!editingDecision?.factors) return

    const newNode: TreeNodeData = {
      id: Date.now().toString(),
      name: "New Node",
      type: "outcome",
      description: "",
      children: []
    }

    setEditingDecision(prev => {
      if (!prev?.factors) return prev

      const updatedFactors = JSON.parse(JSON.stringify(prev.factors)) // Deep clone

      if (parentPath.length === 0) {
        // Adding to a factor (top level)
        const factorIndex = updatedFactors.findIndex((f: Factor) => f.id === parentId)
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

      return { ...prev, factors: updatedFactors }
    })

    setExpandedNodes(new Set([...expandedNodes, parentId]))
  }

  const handleUpdateNode = (nodeId: string, updates: Partial<TreeNodeData>, path: number[]) => {
    if (!editingDecision?.factors) return

    setEditingDecision(prev => {
      if (!prev?.factors) return prev

      const updatedFactors = JSON.parse(JSON.stringify(prev.factors)) // Deep clone

      if (path.length === 1) {
        // Updating a direct child of factor
        const factorIndex = path[0]
        const factor = updatedFactors[factorIndex]
        if (factor.children) {
          const childIndex = factor.children.findIndex((c: TreeNodeData) => c.id === nodeId)
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

      return { ...prev, factors: updatedFactors }
    })
  }

  const handleDeleteNode = (nodeId: string, parentPath: number[]) => {
    if (!editingDecision?.factors) return

    setEditingDecision(prev => {
      if (!prev?.factors) return prev

      const updatedFactors = JSON.parse(JSON.stringify(prev.factors)) // Deep clone

      if (parentPath.length === 1) {
        const factorIndex = parentPath[0]
        const factor = updatedFactors[factorIndex]
        if (factor.children) {
          factor.children = factor.children.filter((c: TreeNodeData) => c.id !== nodeId)
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

      return { ...prev, factors: updatedFactors }
    })
  }

  const handleDeleteAllChildren = (nodeId: string, path: number[]) => {
    handleUpdateNode(nodeId, { children: [] }, path)
  }

  const handleDuplicateSubtree = (node: TreeNodeData, parentPath: number[]) => {
    if (!editingDecision?.factors) return

    // Deep clone the node with new IDs
    const cloneNode = (original: TreeNodeData): TreeNodeData => {
      return {
        ...original,
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        children: original.children?.map(cloneNode)
      }
    }

    const clonedNode = cloneNode(node)

    setEditingDecision(prev => {
      if (!prev?.factors) return prev

      const updatedFactors = JSON.parse(JSON.stringify(prev.factors)) // Deep clone

      if (parentPath.length === 1) {
        const factorIndex = parentPath[0]
        const factor = updatedFactors[factorIndex]
        if (factor.children) {
          factor.children = [...factor.children, clonedNode]
        }
      } else {
        let currentNode: any = updatedFactors[parentPath[0]]
        for (let i = 1; i < parentPath.length - 1; i++) {
          currentNode = currentNode.children[parentPath[i]]
        }
        if (currentNode.children) {
          currentNode.children = [...currentNode.children, clonedNode]
        }
      }

      return { ...prev, factors: updatedFactors }
    })
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !editingDecision?.factors) return

    const { source, destination, draggableId } = result

    setEditingDecision(prev => {
      if (!prev?.factors) return prev

      // Parse source and destination paths from droppableId
      // Format: "factor-{factorIndex}" or "node-{factorIndex}-{childIndex1}-{childIndex2}..."
      const parsePath = (id: string): number[] => {
        const parts = id.split('-')
        return parts.slice(1).map(Number)
      }

      const sourcePath = parsePath(source.droppableId)
      const destPath = parsePath(destination.droppableId)

      const updatedFactors = JSON.parse(JSON.stringify(prev.factors)) // Deep clone

      // Helper function to get node array at path
      const getNodeArray = (path: number[]): any[] => {
        if (path.length === 1) {
          return updatedFactors
        }
        let current: any = updatedFactors[path[0]]
        for (let i = 1; i < path.length - 1; i++) {
          current = current.children[path[i]]
        }
        return current.children
      }

      // Get source and destination arrays
      const sourceArray = getNodeArray(sourcePath)
      const destArray = getNodeArray(destPath)

      // Remove from source
      const [removed] = sourceArray.splice(source.index, 1)

      // Insert at destination
      destArray.splice(destination.index, 0, removed)

      return { ...prev, factors: updatedFactors }
    })
  }

  // Recursive component for rendering tree nodes with drag-and-drop
  const TreeNodeItem = ({
    node,
    path,
    parentId,
    depth = 0,
    index
  }: {
    node: TreeNodeData
    path: number[]
    parentId: string
    depth?: number
    index: number
  }) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0

    return (
      <Draggable draggableId={node.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="ml-6 mt-2"
          >
            <div className={`flex items-center gap-2 p-3 bg-slate-900/50 rounded border border-slate-700 hover:border-slate-600 transition-all group ${
              snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
            }`}>
              {/* Drag Handle */}
              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                <GripVertical className="h-4 w-4 text-slate-500 hover:text-slate-300" />
              </div>

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

              {/* Node Name and Description */}
              <div className="flex-1 flex flex-col gap-1">
                <Input
                  value={node.name}
                  onChange={(e) => handleUpdateNode(node.id, { name: e.target.value }, path)}
                  className="bg-slate-800 border-slate-600 text-white text-sm"
                  placeholder="Node name..."
                />
                <Input
                  value={node.description || ''}
                  onChange={(e) => handleUpdateNode(node.id, { description: e.target.value }, path)}
                  className="bg-slate-800 border-slate-600 text-slate-300 text-xs"
                  placeholder="Description (optional)..."
                />
              </div>

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
                  onClick={() => handleDuplicateSubtree(node, path)}
                  className="text-slate-400 hover:text-green-400 hover:bg-green-500/10"
                  title="Duplicate this node and all children"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {hasChildren && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteAllChildren(node.id, path)}
                    className="text-slate-400 hover:text-orange-400 hover:bg-orange-500/10"
                    title="Delete all child nodes"
                  >
                    <Eraser className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteNode(node.id, path)}
                  className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  title="Delete this node"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Recursively render children */}
              {isExpanded && hasChildren && (
                <Droppable droppableId={`node-${path.join('-')}`} type="NODE">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="border-l-2 border-slate-700 pl-4 ml-2"
                    >
                      {node.children!.map((child, childIndex) => (
                        <TreeNodeItem
                          key={child.id}
                          node={child}
                          path={[...path, childIndex]}
                          parentId={node.id}
                          depth={depth + 1}
                          index={childIndex}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          )}
        </Draggable>
      )
    }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-[95vw] h-[95vh] bg-slate-900 rounded-xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
          <div>
            <h2 className="text-2xl font-bold text-white">{decision?.title || 'Untitled Decision'}</h2>
            <p className="text-sm text-slate-400">Interactive Tree Builder</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Undo/Redo Buttons */}
            <div className="flex items-center gap-1 border-r border-slate-700 pr-3">
              <Button
                onClick={undo}
                disabled={!canUndo}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Undo (Ctrl + Z)"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                onClick={redo}
                disabled={!canRedo}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Redo (Ctrl + Shift + Z)"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            {/* Keyboard Shortcuts Button */}
            <Button
              onClick={() => setShowShortcuts(!showShortcuts)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-800"
              title="Keyboard shortcuts (Shift + ?)"
            >
              <Keyboard className="h-4 w-4" />
            </Button>

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

        {/* Keyboard Shortcuts Help Panel */}
        {showShortcuts && (
          <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-3">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{shortcut.description}</span>
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-200 font-mono">
                    {shortcut.ctrl && 'Ctrl + '}
                    {shortcut.shift && 'Shift + '}
                    {shortcut.alt && 'Alt + '}
                    {shortcut.key === 'Escape' ? 'Esc' : shortcut.key.toUpperCase()}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Side: Tree Editor */}
          <div className={`${viewMode === "3d" ? "w-1/3" : "flex-1"} overflow-auto p-6 border-r border-slate-700 transition-all duration-300`}>
            {viewMode === "2d" ? (
              <div className="space-y-6">
                <div className="text-slate-300 text-sm">
                  <p className="mb-4">
                    Click on any factor node below to add child nodes. Build a complete decision tree
                    by adding outcomes, consequences, and sub-decisions.
                  </p>
                </div>

                {/* Debug Info */}
                {(!editingDecision?.factors || editingDecision.factors.length === 0) && (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-lg mb-2">No factors found</p>
                    <p className="text-sm">Please add factors to your decision first</p>
                  </div>
                )}

                {/* Factor List with Nested Children */}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="space-y-4">
                    {editingDecision?.factors?.map((factor, factorIndex) => (
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

                        {/* Recursively render children with drag-and-drop */}
                        {factor.children && factor.children.length > 0 && (
                          <Droppable droppableId={`factor-${factorIndex}`} type="NODE">
                            {(provided) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="border-l-2 border-slate-700"
                              >
                                {factor.children.map((child, childIndex) => (
                                  <TreeNodeItem
                                    key={child.id}
                                    node={child}
                                    path={[factorIndex, childIndex]}
                                    parentId={factor.id}
                                    index={childIndex}
                                  />
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        )}
                      </div>
                    ))}
                  </div>
                </DragDropContext>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-slate-300 text-sm">
                  <p className="mb-4">
                    Collapsed editor view. Use the list below to quickly navigate and edit nodes.
                  </p>
                </div>

                {/* Collapsed factor list for quick access */}
                <div className="space-y-2">
                  {editingDecision?.factors?.map((factor) => (
                    <div key={factor.id} className="p-3 bg-slate-800/50 rounded border border-slate-700 hover:border-slate-600 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            factor.category === "financial" ? "bg-emerald-500" :
                            factor.category === "personal" ? "bg-blue-500" :
                            factor.category === "career" ? "bg-purple-500" :
                            "bg-red-500"
                          }`} />
                          <span className="text-white text-sm font-medium">{factor.name}</span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {(factor.children || []).length} child nodes
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Preview */}
          <div className={`${viewMode === "3d" ? "flex-1" : "w-1/2"} overflow-auto p-6 bg-slate-950/50 transition-all duration-300`}>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Live Preview</h3>
              <p className="text-sm text-slate-400">
                {viewMode === "2d"
                  ? "See how your decision tree looks in real-time"
                  : "Explore your decision tree in 3D space"
                }
              </p>
            </div>
            {viewMode === "2d" ? (
              <TreeVisualization
                decision={editingDecision}
                width={600}
                height={500}
              />
            ) : (
              <div className="h-full">
                <DecisionCosmos3D decision={editingDecision} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
