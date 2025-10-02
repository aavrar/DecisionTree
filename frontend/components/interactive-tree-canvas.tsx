"use client"

import { useState, useEffect, useRef } from "react"
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Decision, TreeNodeData } from "@/types/decision"

interface InteractiveTreeCanvasProps {
  decision: Decision
  selectedNodeId: string | null
  onNodeClick: (node: TreeNodeData) => void
  onNodeDoubleClick: (node: TreeNodeData) => void
}

interface PositionedNode {
  node: TreeNodeData
  x: number
  y: number
  factorId: string
}

export function InteractiveTreeCanvas({
  decision,
  selectedNodeId,
  onNodeClick,
  onNodeDoubleClick,
}: InteractiveTreeCanvasProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [positionedNodes, setPositionedNodes] = useState<PositionedNode[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate tree layout using Reingold-Tilford algorithm
  useEffect(() => {
    if (!decision.factors || decision.factors.length === 0) return

    const nodes: PositionedNode[] = []
    const nodeWidth = 240
    const nodeHeight = 100
    const horizontalSpacing = 80
    const verticalSpacing = 150

    // Calculate subtree sizes
    const getSubtreeWidth = (node: TreeNodeData): number => {
      if (!node.children || node.children.length === 0) return 1
      return node.children.reduce((sum, child) => sum + getSubtreeWidth(child), 0)
    }

    // Position tree recursively
    const positionSubtree = (
      node: TreeNodeData,
      x: number,
      y: number,
      factorId: string
    ) => {
      // Add current node
      nodes.push({
        node,
        x,
        y,
        factorId
      })

      // Position children
      if (node.children && node.children.length > 0) {
        const childWidths = node.children.map(getSubtreeWidth)
        const totalWidth = childWidths.reduce((sum, w) => sum + w, 0)
        const startX = x - ((totalWidth - 1) * (nodeWidth + horizontalSpacing)) / 2

        let currentX = startX
        node.children.forEach((child, idx) => {
          const childWidth = childWidths[idx]
          const childCenter = currentX + ((childWidth - 1) * (nodeWidth + horizontalSpacing)) / 2
          positionSubtree(child, childCenter, y + verticalSpacing, factorId)
          currentX += childWidth * (nodeWidth + horizontalSpacing)
        })
      }
    }

    // Add root node
    nodes.push({
      node: {
        id: 'root',
        name: decision.title || 'Decision',
        type: 'option',
        description: decision.description
      },
      x: 1000,
      y: 100,
      factorId: 'root'
    })

    // Calculate total width needed for all factors
    const factorWidths = decision.factors.map(factor => {
      if (!factor.children || factor.children.length === 0) return 1
      return factor.children.reduce((sum, child) => sum + getSubtreeWidth(child), 0)
    })
    const totalFactorWidth = factorWidths.reduce((sum, w) => sum + w, 0)

    // Position factors
    const factorY = 100 + verticalSpacing
    let factorX = 1000 - ((totalFactorWidth - 1) * (nodeWidth + horizontalSpacing)) / 2

    decision.factors.forEach((factor, idx) => {
      const factorWidth = factorWidths[idx]
      const factorCenter = factorX + ((factorWidth - 1) * (nodeWidth + horizontalSpacing)) / 2

      // Add factor node
      nodes.push({
        node: {
          id: factor.id,
          name: factor.name,
          type: factor.type || 'consideration',
          category: factor.category,
          description: factor.description,
          weight: factor.weight
        },
        x: factorCenter,
        y: factorY,
        factorId: factor.id
      })

      // Position factor's children
      if (factor.children && factor.children.length > 0) {
        const childY = factorY + verticalSpacing
        const childWidths = factor.children.map(getSubtreeWidth)
        const totalChildWidth = childWidths.reduce((sum, w) => sum + w, 0)
        let childX = factorCenter - ((totalChildWidth - 1) * (nodeWidth + horizontalSpacing)) / 2

        factor.children.forEach((child, childIdx) => {
          const childWidth = childWidths[childIdx]
          const childCenter = childX + ((childWidth - 1) * (nodeWidth + horizontalSpacing)) / 2
          positionSubtree(child, childCenter, childY, factor.id)
          childX += childWidth * (nodeWidth + horizontalSpacing)
        })
      }

      factorX += factorWidth * (nodeWidth + horizontalSpacing)
    })

    setPositionedNodes(nodes)
  }, [decision])

  // Find all parent-child connections
  const getConnections = () => {
    const connections: Array<{ from: PositionedNode; to: PositionedNode }> = []

    // Recursive function to connect a parent to all its children
    const connectNodeToChildren = (parentNode: TreeNodeData, parentId: string) => {
      const parent = positionedNodes.find(pn => pn.node.id === parentId)
      if (!parent || !parentNode.children || parentNode.children.length === 0) return

      parentNode.children.forEach(child => {
        const childNode = positionedNodes.find(pn => pn.node.id === child.id)
        if (childNode) {
          // Connect parent to this child
          connections.push({ from: parent, to: childNode })
          // Recursively process this child's children
          connectNodeToChildren(child, child.id)
        }
      })
    }

    // 1. Connect root to all factors
    const rootNode = positionedNodes.find(pn => pn.node.id === 'root')
    if (rootNode) {
      decision.factors.forEach(factor => {
        const factorNode = positionedNodes.find(pn => pn.node.id === factor.id)
        if (factorNode) {
          connections.push({ from: rootNode, to: factorNode })
        }
      })
    }

    // 2. Connect each factor to all its descendants
    decision.factors.forEach(factor => {
      connectNodeToChildren(factor, factor.id)
    })

    return connections
  }

  const connections = getConnections()

  // Pan and zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const delta = -e.deltaY * 0.001
      setZoom(prev => Math.max(0.1, Math.min(3, prev + delta)))
    } else {
      // Pan
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }))
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the canvas background (not on a node)
    const target = e.target as HTMLElement
    if (e.button === 0 && (target.classList.contains('tree-canvas-background') || target.tagName === 'svg' || target.tagName === 'path')) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
      e.preventDefault()
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => setZoom(prev => Math.min(3, prev + 0.2))
  const handleZoomOut = () => setZoom(prev => Math.max(0.1, prev - 0.2))
  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  if (!decision.factors || decision.factors.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No factors added yet</p>
          <p className="text-gray-500 text-sm">
            Add factors to start building your decision tree
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-30 flex gap-2 bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleZoomIn}
          className="text-white hover:bg-white/10"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleZoomOut}
          className="text-white hover:bg-white/10"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleResetView}
          className="text-white hover:bg-white/10"
          title="Reset View"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <div className="flex items-center px-2 text-white text-xs">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Canvas */}
      <div
        className="tree-canvas-background"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          width: '4000px',
          height: '4000px',
          position: 'relative'
        }}
      >
        {/* SVG for connections */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.8 }} />
            </linearGradient>
          </defs>
          {connections.map((conn, idx) => {
            const x1 = conn.from.x + 120 // nodeWidth / 2 (240/2 = 120)
            const y1 = conn.from.y + 100 // nodeHeight (bottom of parent)
            const x2 = conn.to.x + 120
            const y2 = conn.to.y // top of child

            // Check if nodes are vertically aligned
            const xDiff = Math.abs(x2 - x1)
            const isVerticallyAligned = xDiff < 10

            // For vertical lines, add horizontal offset to control points to ensure visibility
            // This creates a gentle S-curve instead of a collapsed vertical line
            const midY = (y1 + y2) / 2
            const path = isVerticallyAligned
              ? `M ${x1},${y1} C ${x1 + 20},${midY} ${x2 - 20},${midY} ${x2},${y2}`
              : `M ${x1},${y1} C ${x1},${midY} ${x2},${midY} ${x2},${y2}`

            return (
              <path
                key={`${conn.from.node.id}-${conn.to.node.id}-${idx}`}
                d={path}
                stroke="url(#line-gradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                className="drop-shadow-lg"
              />
            )
          })}
        </svg>

        {/* Nodes */}
        {positionedNodes.map((pNode) => {
          const isSelected = selectedNodeId === pNode.node.id
          return (
            <div
              key={pNode.node.id}
              className="absolute cursor-pointer"
              style={{
                left: `${pNode.x}px`,
                top: `${pNode.y}px`,
                width: '240px',
                zIndex: isSelected ? 20 : 10
              }}
              onClick={(e) => {
                e.stopPropagation()
                onNodeClick(pNode.node)
              }}
              onDoubleClick={(e) => {
                e.stopPropagation()
                onNodeDoubleClick(pNode.node)
              }}
            >
              <div
                className={`bg-white rounded-lg p-3 shadow-lg hover:shadow-xl transition-all ${
                  isSelected
                    ? 'border-2 border-purple-500 shadow-purple-500/40 scale-105'
                    : 'border-2 border-gray-300 hover:border-purple-400'
                }`}
              >
                <div className="flex gap-1 mb-1">
                  <div
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      pNode.node.type === 'outcome'
                        ? 'bg-blue-100 text-blue-800'
                        : pNode.node.type === 'consequence'
                        ? 'bg-purple-100 text-purple-800'
                        : pNode.node.type === 'option'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {pNode.node.type}
                  </div>
                  {pNode.node.category && (
                    <div
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        pNode.node.category === 'financial'
                          ? 'bg-green-100 text-green-800'
                          : pNode.node.category === 'personal'
                          ? 'bg-blue-100 text-blue-800'
                          : pNode.node.category === 'career'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {pNode.node.category}
                    </div>
                  )}
                </div>
                <h4 className="text-black font-bold text-sm line-clamp-2">
                  {pNode.node.name}
                </h4>
                {pNode.node.description && (
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                    {pNode.node.description}
                  </p>
                )}
                {pNode.node.weight !== undefined && (
                  <p className="text-gray-500 text-xs mt-1 font-semibold">
                    {pNode.node.weight}%
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
