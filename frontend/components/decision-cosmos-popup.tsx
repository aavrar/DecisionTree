"use client"

import React from 'react'
import { DecisionCosmos3D } from './decision-cosmos-3d'
import type { Decision } from '@/types/decision'

interface DecisionCosmosPopupProps {
  decision: Decision
  isOpen: boolean
  onClose: () => void
}

export function DecisionCosmosPopup({ decision, isOpen, onClose }: DecisionCosmosPopupProps) {
  const [dimensions, setDimensions] = React.useState({ width: 1200, height: 800 })
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    if (isOpen && typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth - 64,
        height: window.innerHeight - 64
      })
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors text-lg font-bold"
        >
          ✕
        </button>

        {/* Full-size 3D visualization */}
        <DecisionCosmos3D
          decision={decision}
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>
    </div>
  )
}