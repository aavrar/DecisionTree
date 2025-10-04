"use client"

import { useState } from "react"
import { DecisionCosmos3D } from "@/components/decision-cosmos-3d"
import { InteractiveTreeCanvas } from "@/components/interactive-tree-canvas"
import { NodeDetailsPanel } from "@/components/node-details-panel"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { TreeActionBar } from "@/components/tree-action-bar"
import type { Decision, TreeNodeData, Factor } from "@/types/decision"

interface InteractiveTreeViewProps {
  decision: Decision
  onUpdate: (decision: Decision) => void
  viewMode?: "2d" | "3d"
  onAnalyze?: () => void
  analyzing?: boolean
  cooldownSeconds?: number
  onMarkActive?: () => void
  onMarkComplete?: () => void
}

export function InteractiveTreeView({ decision, onUpdate, viewMode = "2d", onAnalyze, analyzing = false, cooldownSeconds = 0, onMarkActive, onMarkComplete }: InteractiveTreeViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null)
  const [showDetailsPanel, setShowDetailsPanel] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<{ id: string; name: string; path: number[] } | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const handleAddChild = (parentId: string) => {
    const newNode: TreeNodeData = {
      id: Date.now().toString(),
      name: "New Node",
      type: "outcome",
      description: "",
      children: []
    }

    const updatedFactors = [...decision.factors]
    const factor = updatedFactors.find(f => f.id === parentId)

    if (factor) {
      factor.children = [...(factor.children || []), newNode]
      onUpdate({ ...decision, factors: updatedFactors })
      setExpandedNodes(new Set([...expandedNodes, parentId]))
    }
  }

  const handleAddChildToAnyNode = (parentId: string) => {
    const newNode: TreeNodeData = {
      id: Date.now().toString(),
      name: "New Node",
      type: "outcome",
      description: "",
      children: []
    }

    const updatedFactors = JSON.parse(JSON.stringify(decision.factors))

    const findAndAddChild = (nodes: TreeNodeData[]): boolean => {
      for (const node of nodes) {
        if (node.id === parentId) {
          node.children = [...(node.children || []), newNode]
          return true
        }
        if (node.children && findAndAddChild(node.children)) {
          return true
        }
      }
      return false
    }

    if (findAndAddChild(updatedFactors)) {
      onUpdate({ ...decision, factors: updatedFactors })
      setExpandedNodes(new Set([...expandedNodes, parentId]))
    }
  }

  const handleDeleteAnyNode = (nodeId: string) => {
    const updatedFactors = JSON.parse(JSON.stringify(decision.factors))

    const findAndDelete = (nodes: TreeNodeData[], parentNodes?: TreeNodeData[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === nodeId) {
          nodes.splice(i, 1)
          return true
        }
        if (nodes[i].children && findAndDelete(nodes[i].children, nodes)) {
          return true
        }
      }
      return false
    }

    if (findAndDelete(updatedFactors)) {
      onUpdate({ ...decision, factors: updatedFactors })
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null)
        setSelectedNode(null)
        setShowDetailsPanel(false)
      }
    }
  }

  const handleAddChildToNode = (parentId: string, path: number[]) => {
    const newNode: TreeNodeData = {
      id: Date.now().toString(),
      name: "New Node",
      type: "outcome",
      description: "",
      children: []
    }

    const updatedFactors = JSON.parse(JSON.stringify(decision.factors))
    let currentNode: any = updatedFactors[path[0]]

    for (let i = 1; i < path.length; i++) {
      currentNode = currentNode.children[path[i]]
    }

    if (currentNode.id === parentId) {
      currentNode.children = [...(currentNode.children || []), newNode]
      onUpdate({ ...decision, factors: updatedFactors })
      setExpandedNodes(new Set([...expandedNodes, parentId]))
    }
  }

  const handleDeleteNode = (nodeId: string, path: number[]) => {
    const updatedFactors = JSON.parse(JSON.stringify(decision.factors))

    if (path.length === 1) {
      const factor = updatedFactors[path[0]]
      if (factor.children) {
        factor.children = factor.children.filter((c: TreeNodeData) => c.id !== nodeId)
      }
    } else {
      let currentNode: any = updatedFactors[path[0]]
      for (let i = 1; i < path.length - 1; i++) {
        currentNode = currentNode.children[path[i]]
      }
      if (currentNode.children) {
        currentNode.children = currentNode.children.filter((c: TreeNodeData) => c.id !== nodeId)
      }
    }

    onUpdate({ ...decision, factors: updatedFactors })
    setDeleteDialogOpen(false)
    setNodeToDelete(null)
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null)
      setSelectedNode(null)
      setShowDetailsPanel(false)
    }
  }

  const handleRequestDelete = (nodeId: string, nodeName: string, path: number[]) => {
    setNodeToDelete({ id: nodeId, name: nodeName, path })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (nodeToDelete) {
      handleDeleteNode(nodeToDelete.id, nodeToDelete.path)
    }
  }

  const handleToolbarAddNode = () => {
    if (selectedNodeId && selectedNode) {
      // Check if selected node is a factor itself
      const factorIndex = decision.factors.findIndex(f => f.id === selectedNodeId)
      if (factorIndex !== -1) {
        // Adding child to a factor
        handleAddChild(selectedNodeId)
        return
      }

      // Otherwise, find the node in the tree
      const findNodePath = (nodes: TreeNodeData[], targetId: string, currentPath: number[] = []): number[] | null => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === targetId) {
            return [...currentPath, i]
          }
          if (nodes[i].children) {
            const path = findNodePath(nodes[i].children!, targetId, [...currentPath, i])
            if (path) return path
          }
        }
        return null
      }

      for (let factorIndex = 0; factorIndex < decision.factors.length; factorIndex++) {
        const factor = decision.factors[factorIndex]
        if (factor.children) {
          const path = findNodePath(factor.children, selectedNodeId, [factorIndex])
          if (path) {
            handleAddChildToNode(selectedNodeId, path)
            break
          }
        }
      }
    }
  }

  const handleToolbarDeleteNode = () => {
    if (selectedNodeId && selectedNode) {
      const findNodePath = (nodes: TreeNodeData[], targetId: string, currentPath: number[] = []): number[] | null => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === targetId) {
            return [...currentPath, i]
          }
          if (nodes[i].children) {
            const path = findNodePath(nodes[i].children!, targetId, [...currentPath, i])
            if (path) return path
          }
        }
        return null
      }

      for (let factorIndex = 0; factorIndex < decision.factors.length; factorIndex++) {
        const factor = decision.factors[factorIndex]
        if (factor.children) {
          const path = findNodePath(factor.children, selectedNodeId, [factorIndex])
          if (path) {
            handleRequestDelete(selectedNodeId, selectedNode.name, path)
            break
          }
        }
      }
    }
  }

  const handleToolbarEditNode = () => {
    if (selectedNodeId && selectedNode) {
      setShowDetailsPanel(true)
    }
  }

  const handleStartEdit = (nodeId: string, currentName: string) => {
    setEditingNode(nodeId)
    setEditValue(currentName)
  }

  const handleSaveEdit = (nodeId: string, path: number[]) => {
    const updatedFactors = JSON.parse(JSON.stringify(decision.factors))

    if (path.length === 1) {
      const factor = updatedFactors[path[0]]
      const child = factor.children?.find((c: TreeNodeData) => c.id === nodeId)
      if (child) {
        child.name = editValue
      }
    } else {
      let currentNode: any = updatedFactors[path[0]]
      for (let i = 1; i < path.length - 1; i++) {
        currentNode = currentNode.children[path[i]]
      }
      const child = currentNode.children?.find((c: TreeNodeData) => c.id === nodeId)
      if (child) {
        child.name = editValue
      }
    }

    onUpdate({ ...decision, factors: updatedFactors })
    setEditingNode(null)
    setEditValue("")
  }

  const handleNodeClick = (node: TreeNodeData) => {
    setSelectedNodeId(node.id)
    setSelectedNode(node)
    setShowDetailsPanel(true)
  }

  const handleCanvasNodeDoubleClick = (node: TreeNodeData) => {
    // Find the node and add a child
    const findNodePath = (nodes: TreeNodeData[], targetId: string, currentPath: number[] = []): number[] | null => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === targetId) {
          return [...currentPath, i]
        }
        if (nodes[i].children) {
          const path = findNodePath(nodes[i].children!, targetId, [...currentPath, i])
          if (path) return path
        }
      }
      return null
    }

    for (let factorIndex = 0; factorIndex < decision.factors.length; factorIndex++) {
      const factor = decision.factors[factorIndex]
      if (factor.children) {
        const path = findNodePath(factor.children, node.id, [factorIndex])
        if (path) {
          handleAddChildToNode(node.id, path)
          break
        }
      }
    }
  }

  // Helper function to calculate normalized weights for siblings
  const normalizeWeights = (nodes: (TreeNodeData | Factor)[]) => {
    if (!nodes || nodes.length === 0) return

    // Calculate raw weights from slider values
    // High uncertainty and regret potential should decrease weight
    const rawWeights = nodes.map(node => {
      const importance = node.importance ?? 50
      const emotionalWeight = node.emotionalWeight ?? 50
      const uncertainty = node.uncertainty ?? 50
      const regretPotential = node.regretPotential ?? 50
      // Invert uncertainty and regret potential (100 - value)
      return (importance + emotionalWeight + (100 - uncertainty) + (100 - regretPotential)) / 4
    })

    // Calculate total
    const total = rawWeights.reduce((sum, w) => sum + w, 0)

    // Normalize to 100%
    if (total > 0) {
      nodes.forEach((node, i) => {
        node.weight = Math.round((rawWeights[i] / total) * 100)
      })
    }
  }

  const handleUpdateNodeDetails = (nodeId: string, updates: Partial<TreeNodeData>) => {
    const updatedFactors = JSON.parse(JSON.stringify(decision.factors))

    // First check if the node is a factor itself
    let factorUpdated = false
    let parentSiblings: (TreeNodeData | Factor)[] | null = null

    for (let i = 0; i < updatedFactors.length; i++) {
      const factor = updatedFactors[i]
      if (factor.id === nodeId) {
        // Update the factor with the new values
        Object.assign(factor, updates)
        factorUpdated = true
        parentSiblings = updatedFactors // All factors are siblings
        break
      }
    }

    // If not a factor, search in children
    if (!factorUpdated) {
      const updateNodeRecursive = (nodes: TreeNodeData[]): boolean => {
        for (const node of nodes) {
          if (node.id === nodeId) {
            Object.assign(node, updates)
            parentSiblings = nodes // Store siblings for normalization
            return true
          }
          if (node.children && node.children.length > 0) {
            if (updateNodeRecursive(node.children)) {
              return true
            }
          }
        }
        return false
      }

      for (const factor of updatedFactors) {
        if (factor.children && factor.children.length > 0) {
          if (updateNodeRecursive(factor.children)) {
            break
          }
        }
      }
    }

    // If selection was set to "yes", set all siblings to "no"
    if (updates.selection === "yes" && parentSiblings) {
      parentSiblings.forEach((sibling) => {
        if (sibling.id !== nodeId) {
          sibling.selection = "no"
        }
      })
    }

    // Normalize weights among siblings
    if (parentSiblings) {
      normalizeWeights(parentSiblings)
    }

    onUpdate({ ...decision, factors: updatedFactors })
    setSelectedNode(prev => prev ? { ...prev, ...updates } : null)
  }


  if (!decision.factors || decision.factors.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="text-center">
          <p className="text-gray-400 mb-4 text-lg">No factors in this decision</p>
          <p className="text-gray-500 text-sm">This shouldn't happen - try creating a new branch</p>
        </div>
      </div>
    )
  }

  // 3D View
  if (viewMode === "3d") {
    return (
      <div className="h-full w-full bg-black">
        <DecisionCosmos3D decision={decision} />
      </div>
    )
  }

  // 2D View - Show Tree Visualization + Editable List
  return (
    <div className="h-full flex flex-col overflow-hidden bg-black">
      {/* Action Bar */}
      <TreeActionBar
        selectedNodeId={selectedNodeId}
        decisionStatus={decision.status}
        onAnalyze={() => onAnalyze?.()}
        onAddNode={handleToolbarAddNode}
        onDeleteNode={handleToolbarDeleteNode}
        onEditNode={handleToolbarEditNode}
        onMarkActive={onMarkActive}
        onMarkComplete={onMarkComplete}
        analyzing={analyzing}
        cooldownSeconds={cooldownSeconds}
      />

      <div className="flex-1 overflow-hidden">
        {/* Interactive Tree Canvas - Full Width */}
        <InteractiveTreeCanvas
          decision={decision}
          selectedNodeId={selectedNodeId}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleCanvasNodeDoubleClick}
          onAddChild={handleAddChildToAnyNode}
          onDeleteNode={handleDeleteAnyNode}
          isReadOnly={decision.status === "complete"}
        />
      </div>

      {/* Node Details Panel (slides in from right) */}
      {showDetailsPanel && selectedNode && (
        <NodeDetailsPanel
          node={selectedNode}
          decisionStatus={decision.status}
          onClose={() => {
            setShowDetailsPanel(false)
            setSelectedNodeId(null)
            setSelectedNode(null)
          }}
          onUpdate={handleUpdateNodeDetails}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        nodeName={nodeToDelete?.name || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false)
          setNodeToDelete(null)
        }}
      />
    </div>
  )
}
