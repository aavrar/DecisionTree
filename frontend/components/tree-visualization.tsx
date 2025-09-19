"use client"

import React from 'react'
import type { Decision, DecisionTree, DecisionTreeNode, TreeConnection } from '@/types/decision'

interface TreeVisualizationProps {
  decision: Decision
  width?: number
  height?: number
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
export function TreeVisualization({ decision, width = 800, height = 400 }: TreeVisualizationProps) {
  // Force re-render when decision data changes by using JSON.stringify as dependency
  const tree = React.useMemo(() => 
    generateDecisionTree(decision, width, height), 
    [decision, width, height, JSON.stringify(decision.factors)]
  )
  
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
    <div className="w-full bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Decision Tree Visualization</h3>
        <p className="text-sm text-gray-600">
          {tree.factors.length} factor{tree.factors.length !== 1 ? 's' : ''} • 
          Node size represents importance • 
          Border style shows uncertainty
        </p>
      </div>
      
      <div className="p-4">
        <svg width={width} height={height} className="w-full h-auto">
          {/* Background grid (optional) */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3" />
          
          {/* Render connections */}
          {tree.connections.map(connection => (
            <path
              key={connection.id}
              d={connection.path}
              stroke="#94a3b8"
              strokeWidth="2"
              fill="none"
              strokeDasharray={connection.to.factor?.uncertainty && connection.to.factor.uncertainty > 70 ? "5,5" : undefined}
              opacity="0.7"
            />
          ))}
          
          {/* Render factor nodes */}
          {tree.factors.map(node => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size}
                fill={node.color}
                stroke={node.color}
                strokeWidth={node.borderWidth}
                strokeDasharray={node.borderStyle === 'dashed' ? '5,5' : undefined}
                opacity="0.8"
                className="hover:opacity-100 transition-opacity cursor-pointer"
              />
              <text
                x={node.x}
                y={node.y + node.size! + 20}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-700"
                style={{ fontSize: '12px' }}
              >
                {node.label}
              </text>
              <text
                x={node.x}
                y={node.y + node.size! + 35}
                textAnchor="middle"
                className="text-xs fill-gray-500"
                style={{ fontSize: '10px' }}
              >
                {(node.factor as any)?.relativePercentage || 0}%
              </text>
            </g>
          ))}
          
          {/* Render root node (decision) */}
          <g>
            <circle
              cx={tree.root.x}
              cy={tree.root.y}
              r={tree.root.size}
              fill={tree.root.color}
              stroke={tree.root.color}
              strokeWidth={tree.root.borderWidth}
              opacity="0.9"
              className="hover:opacity-100 transition-opacity cursor-pointer"
            />
            <text
              x={tree.root.x}
              y={tree.root.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-semibold fill-white"
              style={{ fontSize: '14px' }}
            >
              Decision
            </text>
            <text
              x={tree.root.x}
              y={tree.root.y - tree.root.size! - 15}
              textAnchor="middle"
              className="text-sm font-medium fill-gray-800"
              style={{ fontSize: '13px' }}
            >
              {tree.root.label}
            </text>
          </g>
        </svg>
      </div>
    </div>
  )
}