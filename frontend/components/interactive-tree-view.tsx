"use client"

import { useState } from "react"
import { DecisionCosmos3D } from "@/components/decision-cosmos-3d"
import { InteractiveTreeCanvas } from "@/components/interactive-tree-canvas"
import { NodeDetailsPanel } from "@/components/node-details-panel"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { TreeActionBar } from "@/components/tree-action-bar"
import { PairwiseComparisonModal } from "@/components/pairwise-comparison-modal"
import { WeightingMethodModal } from "@/components/weighting-method-modal"
import type { Decision, TreeNodeData, Factor } from "@/types/decision"

interface InteractiveTreeViewProps {
  decision: Decision
  onUpdate: (decision: Decision) => void
  viewMode?: "2d" | "3d"
  onAnalyze?: () => void
  analyzing?: boolean
  cooldownSeconds?: number
  onMarkActive?: () => void
  onMarkDraft?: () => void
  onMarkComplete?: () => void
}

export function InteractiveTreeView({ decision, onUpdate, viewMode = "2d", onAnalyze, analyzing = false, cooldownSeconds = 0, onMarkActive, onMarkDraft, onMarkComplete }: InteractiveTreeViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null)
  const [showDetailsPanel, setShowDetailsPanel] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<{ id: string; name: string; path: number[] } | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [showComparisonModal, setShowComparisonModal] = useState(false)
  const [comparisonParent, setComparisonParent] = useState<TreeNodeData | null>(null)

  // Guided weighting workflow state
  const [guidedWeightingActive, setGuidedWeightingActive] = useState(false)
  const [isActivationMode, setIsActivationMode] = useState(false) // true = activating, false = recalculating
  const [siblingGroups, setSiblingGroups] = useState<Array<Array<{ id: string; name: string }>>>([])
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [allWeights, setAllWeights] = useState<Record<string, number>>({})
  const [showWeightingMethodModal, setShowWeightingMethodModal] = useState(false)

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
      // Special case: if root node is selected, add a new top-level factor
      if (selectedNodeId === 'root') {
        const newFactor: Factor = {
          id: Date.now().toString(),
          name: "New Factor",
          type: "consideration",
          category: "personal",
          weight: 0,
          children: []
        }

        const updatedFactors = [...decision.factors, newFactor]
        onUpdate({ ...decision, factors: updatedFactors })
        setExpandedNodes(new Set([...expandedNodes, newFactor.id]))
        return
      }

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
      // Special case: cannot delete root node
      if (selectedNodeId === 'root') {
        alert("Cannot delete the root decision node")
        return
      }

      // Check if selected node is a top-level factor
      const factorIndex = decision.factors.findIndex(f => f.id === selectedNodeId)
      if (factorIndex !== -1) {
        // Deleting a top-level factor
        const updatedFactors = decision.factors.filter(f => f.id !== selectedNodeId)
        onUpdate({ ...decision, factors: updatedFactors })
        setSelectedNodeId(null)
        setSelectedNode(null)
        setShowDetailsPanel(false)
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

  // Collect all sibling groups from the decision tree that have 2+ children
  const collectSiblingGroups = (factors: Factor[]): Array<Array<{ id: string; name: string }>> => {
    const groups: Array<Array<{ id: string; name: string }>> = []

    // Add top-level factors if there are 2 or more
    if (factors.length >= 2) {
      groups.push(factors.map(f => ({ id: f.id, name: f.name })))
    }

    // Recursively collect child groups
    const collectFromNode = (node: TreeNodeData | Factor) => {
      if (node.children && node.children.length >= 2) {
        groups.push(node.children.map(c => ({ id: c.id, name: c.name })))
        node.children.forEach(child => collectFromNode(child))
      } else if (node.children && node.children.length === 1) {
        // Still recurse even if only 1 child
        collectFromNode(node.children[0])
      }
    }

    factors.forEach(factor => collectFromNode(factor))
    return groups
  }

  // Show weighting method selection modal when activating
  const handleStartGuidedWeighting = () => {
    setShowWeightingMethodModal(true)
  }

  // Handle weighting method selection
  const handleWeightingMethodSelect = (method: "ahp" | "equal") => {
    setShowWeightingMethodModal(false)

    if (method === "equal") {
      // Apply equal weights to all sibling groups and mark active
      applyEqualWeightsAndActivate()
    } else {
      // Start AHP pairwise comparison workflow
      startAHPWeighting()
    }
  }

  // Apply equal weights to all nodes and mark as active
  const applyEqualWeightsAndActivate = () => {
    const updatedFactors = JSON.parse(JSON.stringify(decision.factors))

    // Apply equal weights to all sibling groups
    const applyEqualWeightsRecursive = (nodes: (TreeNodeData | Factor)[]) => {
      if (nodes.length > 0) {
        const equalWeight = Math.round(100 / nodes.length)
        let remaining = 100

        nodes.forEach((node, index) => {
          if (index === nodes.length - 1) {
            // Last node gets remaining weight to ensure sum is exactly 100
            node.weight = remaining
          } else {
            node.weight = equalWeight
            remaining -= equalWeight
          }

          if (node.children && node.children.length > 0) {
            applyEqualWeightsRecursive(node.children)
          }
        })
      }
    }

    applyEqualWeightsRecursive(updatedFactors)

    // Single atomic update: apply weights AND mark as active
    const updatedDecision = { ...decision, factors: updatedFactors, status: 'active' as const }
    onUpdate(updatedDecision)
  }

  // Start AHP pairwise comparison workflow
  const startAHPWeighting = () => {
    const groups = collectSiblingGroups(decision.factors)

    if (groups.length === 0) {
      // No groups to weight, just mark active
      onMarkActive?.()
      return
    }

    setSiblingGroups(groups)
    setCurrentGroupIndex(0)
    setAllWeights({})
    setIsActivationMode(true)
    setGuidedWeightingActive(true)
    setShowComparisonModal(true)
    setComparisonParent(null)
  }

  // Handle completion of a single pairwise comparison (unified handler)
  const handleGuidedWeightCompletion = (weights: Record<string, number>) => {
    console.log('[GUIDED] handleGuidedWeightCompletion called with weights:', weights)
    console.log('[GUIDED] Current group index:', currentGroupIndex, '/', siblingGroups.length - 1)
    console.log('[GUIDED] isActivationMode:', isActivationMode)

    // Merge these weights into allWeights
    const updatedWeights = { ...allWeights, ...weights }
    setAllWeights(updatedWeights)
    console.log('[GUIDED] Updated allWeights:', updatedWeights)

    // Move to next group or finish
    if (currentGroupIndex < siblingGroups.length - 1) {
      console.log('[GUIDED] Moving to next group')
      setCurrentGroupIndex(currentGroupIndex + 1)
    } else {
      console.log('[GUIDED] All groups completed, applying weights')
      // All groups completed - apply weights and conditionally mark active
      if (isActivationMode) {
        console.log('[GUIDED] Calling applyAllWeightsAndActivate')
        applyAllWeightsAndActivate(updatedWeights)
      } else {
        console.log('[GUIDED] Calling applyAllWeightsOnly')
        applyAllWeightsOnly(updatedWeights)
      }
    }
  }

  // Apply all collected weights and mark decision as active
  const applyAllWeightsAndActivate = (weights: Record<string, number>) => {
    console.log('[AHP] Starting weight application:', weights)
    const updatedFactors = JSON.parse(JSON.stringify(decision.factors))

    // Apply weights to all nodes
    const applyWeightsRecursive = (nodes: (TreeNodeData | Factor)[]) => {
      nodes.forEach(node => {
        if (weights[node.id] !== undefined) {
          console.log(`[AHP] Applying weight to ${node.name}: ${weights[node.id]}`)
          node.weight = weights[node.id]
        }
        if (node.children && node.children.length > 0) {
          applyWeightsRecursive(node.children)
        }
      })
    }

    applyWeightsRecursive(updatedFactors)
    console.log('[AHP] Updated factors:', updatedFactors)

    // Single atomic update: apply AHP weights AND mark as active
    const updatedDecision = { ...decision, factors: updatedFactors, status: 'active' as const }
    console.log('[AHP] Calling onUpdate with:', updatedDecision)
    onUpdate(updatedDecision)

    // Close modal and reset workflow state
    setShowComparisonModal(false)
    setGuidedWeightingActive(false)
    setSiblingGroups([])
    setCurrentGroupIndex(0)
    setAllWeights({})
  }

  // Handle cancellation of guided weighting
  const handleCancelGuidedWeighting = () => {
    setShowComparisonModal(false)
    setGuidedWeightingActive(false)
    setSiblingGroups([])
    setCurrentGroupIndex(0)
    setAllWeights({})
  }

  // Recalculate weights in Active mode (doesn't change status)
  const handleRecalculateWeights = () => {
    const groups = collectSiblingGroups(decision.factors)

    if (groups.length === 0) {
      alert("No sibling groups to weight")
      return
    }

    setSiblingGroups(groups)
    setCurrentGroupIndex(0)
    setAllWeights({})
    setIsActivationMode(false)
    setGuidedWeightingActive(true)
    setShowComparisonModal(true)
    setComparisonParent(null)
  }

  // Apply weights without changing status
  const applyAllWeightsOnly = (weights: Record<string, number>) => {
    const updatedFactors = JSON.parse(JSON.stringify(decision.factors))

    // Apply weights to all nodes
    const applyWeightsRecursive = (nodes: (TreeNodeData | Factor)[]) => {
      nodes.forEach(node => {
        if (weights[node.id] !== undefined) {
          node.weight = weights[node.id]
        }
        if (node.children && node.children.length > 0) {
          applyWeightsRecursive(node.children)
        }
      })
    }

    applyWeightsRecursive(updatedFactors)

    // Update decision with new weights
    onUpdate({ ...decision, factors: updatedFactors })

    // Close modal and reset workflow state
    setShowComparisonModal(false)
    setGuidedWeightingActive(false)
    setSiblingGroups([])
    setCurrentGroupIndex(0)
    setAllWeights({})
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

    // Only normalize weights if slider values were updated (not for other updates like name, description, etc.)
    const sliderFieldsUpdated = updates.importance !== undefined ||
                                  updates.emotionalWeight !== undefined ||
                                  updates.uncertainty !== undefined ||
                                  updates.regretPotential !== undefined

    if (parentSiblings && sliderFieldsUpdated && decision.status === "draft") {
      normalizeWeights(parentSiblings)
    }

    onUpdate({ ...decision, factors: updatedFactors })
    setSelectedNode(prev => prev ? { ...prev, ...updates } : null)
  }

  const handleCompareChildrenWeights = (parentNode: TreeNodeData) => {
    setComparisonParent(parentNode)
    setShowComparisonModal(true)
  }

  const handleApplyWeights = (weights: Record<string, number>) => {
    if (!comparisonParent) return

    const updatedFactors = JSON.parse(JSON.stringify(decision.factors))

    // Find and update the parent node's children weights
    const updateNodeChildren = (nodes: TreeNodeData[]): boolean => {
      for (const node of nodes) {
        if (node.id === comparisonParent.id && node.children) {
          // Apply weights to children
          node.children.forEach((child: TreeNodeData) => {
            if (weights[child.id] !== undefined) {
              child.weight = weights[child.id]
            }
          })
          return true
        }
        if (node.children && updateNodeChildren(node.children)) {
          return true
        }
      }
      return false
    }

    // Update in factors
    updateNodeChildren(updatedFactors)

    onUpdate({ ...decision, factors: updatedFactors })
    setComparisonParent(null)
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
        onMarkActive={handleStartGuidedWeighting}
        onMarkDraft={onMarkDraft}
        onMarkComplete={onMarkComplete}
        onRecalculateWeights={handleRecalculateWeights}
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

      {/* Weighting Method Selection Modal */}
      <WeightingMethodModal
        isOpen={showWeightingMethodModal}
        onClose={() => setShowWeightingMethodModal(false)}
        onSelectMethod={handleWeightingMethodSelect}
      />

      {/* Pairwise Comparison Modal */}
      <PairwiseComparisonModal
        isOpen={showComparisonModal}
        onClose={() => {
          if (guidedWeightingActive) {
            handleCancelGuidedWeighting()
          } else {
            setShowComparisonModal(false)
            setComparisonParent(null)
          }
        }}
        items={
          guidedWeightingActive
            ? siblingGroups[currentGroupIndex] || []
            : comparisonParent?.children?.map(c => ({ id: c.id, name: c.name })) || []
        }
        onApplyWeights={
          guidedWeightingActive
            ? handleGuidedWeightCompletion
            : handleApplyWeights
        }
        groupProgress={
          guidedWeightingActive
            ? { current: currentGroupIndex, total: siblingGroups.length }
            : undefined
        }
      />
    </div>
  )
}
