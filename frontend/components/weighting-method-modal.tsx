"use client"

import { Scale, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WeightingMethodModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectMethod: (method: "ahp" | "equal") => void
}

export function WeightingMethodModal({
  isOpen,
  onClose,
  onSelectMethod,
}: WeightingMethodModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none p-0 md:p-4">
      <div className="bg-black border-0 md:border border-white/20 rounded-none md:rounded-lg shadow-2xl w-full h-full md:h-auto md:max-w-2xl overflow-y-auto relative z-[101] pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-white">Choose Weighting Method</h2>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              How would you like to weight your decision factors?
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Method Options */}
        <div className="p-4 md:p-6 space-y-3 md:space-y-4">
          {/* AHP Method */}
          <button
            onClick={() => onSelectMethod("ahp")}
            className="w-full p-4 md:p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 hover:border-purple-500/50 rounded-lg transition-all active:scale-95 md:hover:scale-105 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Scale className="w-6 h-6 text-purple-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Pairwise Comparison (Recommended)
                </h3>
                <p className="text-sm text-gray-300 mb-3">
                  Compare factors two at a time to determine their relative importance.
                  Uses the Analytic Hierarchy Process (AHP) to calculate optimal weights.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                    Most Accurate
                  </span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                    Science-Backed
                  </span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                    ~2-3 minutes
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Equal Weights Method */}
          <button
            onClick={() => onSelectMethod("equal")}
            className="w-full p-4 md:p-6 bg-white/5 border-2 border-white/10 hover:border-white/20 rounded-lg transition-all active:scale-95 md:hover:scale-105 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Users className="w-6 h-6 text-gray-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Equal Weights (Quick Start)
                </h3>
                <p className="text-sm text-gray-300 mb-3">
                  Assign equal importance to all factors. You can manually adjust weights
                  later using the Advanced Weight Settings.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded">
                    Fast
                  </span>
                  <span className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded">
                    Simple
                  </span>
                  <span className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded">
                    Instant
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <div className="p-6 border-t border-white/10 bg-blue-500/5">
          <p className="text-xs text-gray-400">
            <strong className="text-blue-300">Tip:</strong> Pairwise comparison provides more accurate results
            by forcing you to think critically about each factor's importance. You can always recalculate
            weights later from the Active mode.
          </p>
        </div>
      </div>
    </div>
  )
}
