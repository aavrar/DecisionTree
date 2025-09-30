"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react'
import type { Decision, DecisionTree, DecisionTreeNode, TreeConnection } from '@/types/decision'

interface TreeVisualizationProps {
  decision: Decision
  width?: number
  height?: number
  onNodeClick?: (node: DecisionTreeNode) => void
}

// Utility function to get category color
const getCategoryColor = (category: string): string => {
  switch (category) {
    case "financial": return "#10b981" // green
    case "personal": return "#3b82f6"  // blue
    case "career": return "#8b5cf6"    // purple
    case "health": return "#ef4444"    // red
    default: return "#6b7280"          // gray
  }
}

// Utility function to transform Decision into DecisionTree structure
const generateDecisionTree = (decision: Decision, containerWidth: number, containerHeight: number): DecisionTree => {
  const factors = decision.factors || []
  
  // Calculate layout dimensions
  const rootY = 120  // Increased from 80 to give more space for title
  const factorY = containerHeight - 120
  const centerX = containerWidth / 2
  
  // Create root node (decision)
  const root: DecisionTreeNode = {
    id: 'root',
    label: decision.title || 'Untitled Decision',
    type: 'decision',
    x: centerX,
    y: rootY,
    size: 60,
    color: '#4f46e5', // indigo for decision node
    borderStyle: 'solid',
    borderWidth: 3
  }
  
  // Calculate total weight for relative percentages
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0)
  
  // Create factor nodes
  const factorNodes: DecisionTreeNode[] = factors.map((factor, index) => {
    const totalFactors = factors.length
    const spacing = Math.min(120, (containerWidth - 200) / Math.max(totalFactors - 1, 1))
    const startX = centerX - ((totalFactors - 1) * spacing) / 2
    const x = totalFactors === 1 ? centerX : startX + (index * spacing)
    
    // Calculate relative percentage of this factor vs total
    const relativePercentage = totalWeight > 0 ? Math.round((factor.weight / totalWeight) * 100) : 0
    
    // Calculate visual properties based on factor data
    const baseSize = 30
    const sizeMultiplier = (factor.weight / 100) * 0.8 + 0.4 // 0.4 to 1.2
    const size = baseSize * sizeMultiplier
    
    const uncertainty = factor.uncertainty || 50
    const borderStyle = uncertainty > 70 ? 'dashed' : 'solid'
    
    const emotionalWeight = factor.emotionalWeight || 50
    const borderWidth = Math.max(1, (emotionalWeight / 100) * 4) // 1-4px based on emotional weight
    
    return {
      id: factor.id,
      label: factor.name,
      type: 'factor' as const,
      x,
      y: factorY,
      factor: { ...factor, relativePercentage }, // Add relative percentage to factor data
      size,
      color: getCategoryColor(factor.category),
      borderStyle,
      borderWidth
    }
  })
  
  // Create connections from root to each factor
  const connections: TreeConnection[] = factorNodes.map(factorNode => ({
    id: `${root.id}-${factorNode.id}`,
    from: root,
    to: factorNode,
    path: `M ${root.x} ${root.y + root.size!/2} Q ${(root.x + factorNode.x)/2} ${(root.y + factorNode.y)/2} ${factorNode.x} ${factorNode.y - factorNode.size!/2}`
  }))
  
  return {
    root,
    factors: factorNodes,
    connections,
    bounds: { width: containerWidth, height: containerHeight }
  }
}

// Tree visualization component
export function TreeVisualization({ decision, width = 800, height = 400, onNodeClick }: TreeVisualizationProps) {
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  // Force re-render when decision data changes by using JSON.stringify as dependency
  const tree = React.useMemo(() =>
    generateDecisionTree(decision, width, height),
    [decision, width, height, JSON.stringify(decision.factors)]
  )

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleResetView = () => {
    setScale(1)
    setPan({ x: 0, y: 0 })
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleExportSVG = () => {
    if (!svgRef.current) return

    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${decision.title || 'decision-tree'}.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPNG = () => {
    if (!svgRef.current) return

    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const canvas = document.createElement('canvas')
    canvas.width = width * 2
    canvas.height = height * 2
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const img = new Image()
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = pngUrl
          link.download = `${decision.title || 'decision-tree'}.png`
          link.click()
          URL.revokeObjectURL(pngUrl)
        }
      })
      URL.revokeObjectURL(url)
    }

    img.src = url
  }

  if (!decision.title && decision.factors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No Decision Tree to Display</p>
          <p className="text-sm">Add a decision title and factors to generate the tree</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-full bg-slate-900/50 backdrop-blur-xl rounded-lg border border-slate-700/50 shadow-2xl overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Decision Tree Visualization</h3>
            <p className="text-sm text-slate-300">
              {tree.factors.length} factor{tree.factors.length !== 1 ? 's' : ''} •
              Node size = importance •
              Border style = uncertainty •
              Zoom: {Math.round(scale * 100)}%
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={scale >= 3}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={scale <= 0.5}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetView}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <div className="relative group">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={handleExportPNG}
                  className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-md"
                >
                  Export PNG
                </button>
                <button
                  onClick={handleExportSVG}
                  className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-md"
                >
                  Export SVG
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="p-4 overflow-hidden bg-slate-950/50"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="w-full h-auto"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Background grid and glow effects */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="1"/>
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.3"/>
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="#0f172a" />
          <rect width="100%" height="100%" fill="url(#grid)" opacity="0.2" />

          {/* Main group with zoom and pan transforms */}
          <g transform={`translate(${pan.x + width / 2}, ${pan.y + height / 2}) scale(${scale}) translate(${-width / 2}, ${-height / 2})`}>
            {/* Render connections with glow */}
            {tree.connections.map(connection => (
            <g key={connection.id}>
              <path
                d={connection.path}
                stroke="url(#nodeGlow)"
                strokeWidth="3"
                fill="none"
                strokeDasharray={connection.to.factor?.uncertainty && connection.to.factor.uncertainty > 70 ? "5,5" : undefined}
                opacity="0.3"
                filter="url(#glow)"
              />
              <path
                d={connection.path}
                stroke="#60a5fa"
                strokeWidth="2"
                fill="none"
                strokeDasharray={connection.to.factor?.uncertainty && connection.to.factor.uncertainty > 70 ? "5,5" : undefined}
                opacity="0.6"
              />
            </g>
          ))}
          
          {/* Render factor nodes with glow */}
          {tree.factors.map(node => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size! + 8}
                fill={node.color}
                opacity="0.2"
                filter="url(#glow)"
                className="pointer-events-none"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size}
                fill={node.color}
                stroke={node.color}
                strokeWidth={node.borderWidth}
                strokeDasharray={node.borderStyle === 'dashed' ? '5,5' : undefined}
                opacity="0.9"
                filter="url(#glow)"
                className="hover:opacity-100 transition-all cursor-pointer hover:r-[${node.size! + 2}]"
                onClick={(e) => {
                  e.stopPropagation()
                  onNodeClick?.(node)
                }}
              />
              <text
                x={node.x}
                y={node.y + node.size! + 20}
                textAnchor="middle"
                className="text-xs font-medium fill-slate-200 pointer-events-none"
                style={{ fontSize: '12px' }}
              >
                {node.label}
              </text>
              <text
                x={node.x}
                y={node.y + node.size! + 35}
                textAnchor="middle"
                className="text-xs fill-slate-400 pointer-events-none"
                style={{ fontSize: '10px' }}
              >
                {(node.factor as any)?.relativePercentage || 0}%
              </text>
            </g>
          ))}

          {/* Render root node (decision) with enhanced glow */}
          <g>
            <circle
              cx={tree.root.x}
              cy={tree.root.y}
              r={tree.root.size! + 15}
              fill={tree.root.color}
              opacity="0.3"
              filter="url(#glow)"
              className="pointer-events-none animate-pulse-glow"
            />
            <circle
              cx={tree.root.x}
              cy={tree.root.y}
              r={tree.root.size}
              fill={tree.root.color}
              stroke="#818cf8"
              strokeWidth={tree.root.borderWidth}
              opacity="0.95"
              filter="url(#glow)"
              className="hover:opacity-100 transition-all cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onNodeClick?.(tree.root)
              }}
            />
            <text
              x={tree.root.x}
              y={tree.root.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-semibold fill-white pointer-events-none"
              style={{ fontSize: '14px' }}
            >
              Decision
            </text>
            <text
              x={tree.root.x}
              y={tree.root.y - tree.root.size! - 15}
              textAnchor="middle"
              className="text-sm font-medium fill-slate-100 pointer-events-none"
              style={{ fontSize: '13px' }}
            >
              {tree.root.label}
            </text>
          </g>
          </g>
        </svg>
      </div>
    </div>
  )
}