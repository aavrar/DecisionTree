"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle, CheckCircle, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  calculateAHPWeights,
  generatePairs,
  getConsistencyInterpretation,
  type PairwiseComparison,
} from "@/lib/ahp-calculator"

interface PairwiseComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  items: Array<{ id: string; name: string }>
  onApplyWeights: (weights: Record<string, number>) => void
  groupProgress?: { current: number; total: number }
}

// AHP 9-point scale with labels
const AHP_SCALE = [
  { value: 1, label: "Equal", description: "Both equally important" },
  { value: 2, label: "Weak", description: "" },
  { value: 3, label: "Moderate", description: "" },
  { value: 4, label: "Moderate+", description: "" },
  { value: 5, label: "Strong", description: "" },
  { value: 6, label: "Strong+", description: "" },
  { value: 7, label: "Very Strong", description: "" },
  { value: 8, label: "Very Strong+", description: "" },
  { value: 9, label: "Extreme", description: "Absolutely more important" },
]

export function PairwiseComparisonModal({
  isOpen,
  onClose,
  items,
  onApplyWeights,
  groupProgress,
}: PairwiseComparisonModalProps) {
  const [currentPairIndex, setCurrentPairIndex] = useState(0)
  const [comparisons, setComparisons] = useState<Record<string, PairwiseComparison>>({})
  const [showResults, setShowResults] = useState(false)
  const [calculatedWeights, setCalculatedWeights] = useState<Record<string, number>>({})
  const [consistencyRatio, setConsistencyRatio] = useState(0)
  const [isConsistent, setIsConsistent] = useState(true)

  const pairs = generatePairs(items.map(item => item.name))
  const totalPairs = pairs.length
  const currentPair = pairs[currentPairIndex]

  // Initialize comparison value to 1 (equal) for current pair
  const [currentValue, setCurrentValue] = useState(1)
  const [favoredItem, setFavoredItem] = useState<'A' | 'B'>('A')

  useEffect(() => {
    // Reset when modal opens
    if (isOpen) {
      setCurrentPairIndex(0)
      setComparisons({})
      setShowResults(false)
      setCurrentValue(1)
      setFavoredItem('A')
    }
  }, [isOpen])

  useEffect(() => {
    // Reset when items change (moving to next sibling group)
    setCurrentPairIndex(0)
    setComparisons({})
    setShowResults(false)
    setCurrentValue(1)
    setFavoredItem('A')
    setCalculatedWeights({})
  }, [items])

  useEffect(() => {
    // Load existing comparison for current pair if it exists
    if (currentPair) {
      const key = `${currentPair.itemA}_${currentPair.itemB}`
      const existing = comparisons[key]
      if (existing) {
        setCurrentValue(Math.abs(existing.value))
        setFavoredItem(existing.value >= 1 ? 'A' : 'B')
      } else {
        setCurrentValue(1)
        setFavoredItem('A')
      }
    }
  }, [currentPairIndex])

  if (!isOpen) return null

  const handleNext = () => {
    // Save current comparison
    if (currentPair) {
      const key = `${currentPair.itemA}_${currentPair.itemB}`
      const actualValue = favoredItem === 'A' ? currentValue : 1 / currentValue

      setComparisons(prev => ({
        ...prev,
        [key]: {
          itemA: currentPair.itemA,
          itemB: currentPair.itemB,
          value: actualValue,
        },
      }))
    }

    if (currentPairIndex < totalPairs - 1) {
      setCurrentPairIndex(prev => prev + 1)
    } else {
      // All pairs completed - calculate weights
      calculateResults()
    }
  }

  const handlePrevious = () => {
    // Save current comparison before going back
    if (currentPair) {
      const key = `${currentPair.itemA}_${currentPair.itemB}`
      const actualValue = favoredItem === 'A' ? currentValue : 1 / currentValue

      setComparisons(prev => ({
        ...prev,
        [key]: {
          itemA: currentPair.itemA,
          itemB: currentPair.itemB,
          value: actualValue,
        },
      }))
    }

    if (currentPairIndex > 0) {
      setCurrentPairIndex(prev => prev - 1)
    }
  }

  const calculateResults = () => {
    // Save final comparison
    if (currentPair) {
      const key = `${currentPair.itemA}_${currentPair.itemB}`
      const actualValue = favoredItem === 'A' ? currentValue : 1 / currentValue
      const finalComparisons = {
        ...comparisons,
        [key]: {
          itemA: currentPair.itemA,
          itemB: currentPair.itemB,
          value: actualValue,
        },
      }

      // Calculate AHP weights
      const result = calculateAHPWeights(
        items.map(item => item.name),
        Object.values(finalComparisons)
      )

      setCalculatedWeights(result.weights)
      setConsistencyRatio(result.consistencyRatio)
      setIsConsistent(result.isConsistent)
      setShowResults(true)
    }
  }

  const handleApply = () => {
    console.log('[MODAL] handleApply clicked')
    console.log('[MODAL] items:', items)
    console.log('[MODAL] calculatedWeights:', calculatedWeights)

    // Map weights from names to IDs
    const weightsById: Record<string, number> = {}
    items.forEach(item => {
      weightsById[item.id] = calculatedWeights[item.name] || 0
    })

    console.log('[MODAL] weightsById:', weightsById)
    console.log('[MODAL] Calling onApplyWeights')
    onApplyWeights(weightsById)
    // Don't close here - let parent decide when to close based on whether there are more groups
  }

  const getScaleLabel = (value: number) => {
    const scale = AHP_SCALE.find(s => s.value === Math.round(value))
    return scale?.label || value.toFixed(1)
  }

  if (showResults) {
    const interpretation = getConsistencyInterpretation(consistencyRatio)

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none p-0 md:p-4">
        <div className="bg-black border-0 md:border border-white/20 rounded-none md:rounded-lg shadow-2xl w-full h-full md:h-auto md:max-w-2xl md:max-h-[90vh] overflow-hidden relative z-[101] pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-white">Calculated Weights</h2>
              <p className="text-sm text-gray-400 mt-1">Based on pairwise comparisons</p>
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

          {/* Results */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
            {/* Consistency Check */}
            <div className={`border rounded-lg p-4 ${
              isConsistent
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-yellow-500/10 border-yellow-500/30'
            }`}>
              <div className="flex items-start gap-3">
                {isConsistent ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    isConsistent ? 'text-green-300' : 'text-yellow-300'
                  }`}>
                    Consistency: {interpretation.level.toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-300 mt-1">
                    {interpretation.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Consistency Ratio: {(consistencyRatio * 100).toFixed(1)}%
                    {!isConsistent && ' (Threshold: 10%)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Calculated Weights */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Normalized Weights
              </h3>
              {items
                .sort((a, b) => (calculatedWeights[b.name] || 0) - (calculatedWeights[a.name] || 0))
                .map(item => {
                  const weight = calculatedWeights[item.name] || 0
                  return (
                    <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{item.name}</span>
                        <span className="text-xl font-bold text-white">{weight}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${weight}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Explanation */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-300 mb-2">
                About These Weights
              </h4>
              <p className="text-xs text-gray-300">
                These weights were calculated using the Analytic Hierarchy Process (AHP), a
                Nobel Prize-winning methodology. They represent the relative importance of
                each factor based on your pairwise comparisons.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex gap-3">
            <Button
              onClick={() => {
                setShowResults(false)
                setCurrentPairIndex(0)
              }}
              variant="outline"
              className="flex-1 border-white/30 text-white hover:bg-white/10"
            >
              Redo Comparisons
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-white text-black hover:bg-gray-200 font-semibold"
            >
              Apply Weights
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentPair) return null

  const progress = ((currentPairIndex + 1) / totalPairs) * 100

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none p-0 md:p-4">
      <div className="bg-black border-0 md:border border-white/20 rounded-none md:rounded-lg shadow-2xl w-full h-full md:h-auto md:max-w-2xl overflow-y-auto relative z-[101] pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2 flex-wrap">
              <Scale className="w-6 h-6" />
              Pairwise Comparison
              {groupProgress && (
                <span className="text-base font-normal text-blue-400">
                  (Group {groupProgress.current + 1} of {groupProgress.total})
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Compare factors to calculate optimal weights
              {groupProgress && groupProgress.total > 1 && (
                <span className="text-yellow-400 ml-2">
                  • {groupProgress.total - groupProgress.current - 1} more group(s) after this
                </span>
              )}
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

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Comparison {currentPairIndex + 1} of {totalPairs}
            </span>
            <span className="text-sm font-semibold text-white">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Comparison */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-lg text-gray-300 mb-6">
              Which factor is more important, and by how much?
            </p>

            {/* Factor Names */}
            <div className="grid grid-cols-3 gap-4 items-center mb-6">
              <div
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  favoredItem === 'A'
                    ? 'bg-purple-500/20 border-purple-500/50'
                    : 'bg-white/5 border-white/10'
                }`}
                onClick={() => setFavoredItem('A')}
              >
                <p className="text-white font-semibold">{currentPair.itemA}</p>
              </div>

              <div className="text-gray-500 font-semibold">VS</div>

              <div
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  favoredItem === 'B'
                    ? 'bg-blue-500/20 border-blue-500/50'
                    : 'bg-white/5 border-white/10'
                }`}
                onClick={() => setFavoredItem('B')}
              >
                <p className="text-white font-semibold">{currentPair.itemB}</p>
              </div>
            </div>

            {/* Scale Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-gray-500">Equal</span>
                <span className="text-lg font-bold text-white">
                  {getScaleLabel(currentValue)}
                </span>
                <span className="text-xs text-gray-500">Extreme</span>
              </div>

              <Slider
                value={[currentValue]}
                onValueChange={(value) => setCurrentValue(value[0])}
                min={1}
                max={9}
                step={1}
                className="w-full cursor-pointer"
              />

              <div className="grid grid-cols-9 gap-1 text-xs text-gray-600">
                {AHP_SCALE.map(scale => (
                  <div key={scale.value} className="text-center">
                    {scale.value}
                  </div>
                ))}
              </div>

              {/* Interpretation */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-300">
                  {favoredItem === 'A' ? (
                    <>
                      <span className="text-purple-300 font-semibold">{currentPair.itemA}</span>
                      {' is '}
                      <span className="text-white font-semibold">
                        {currentValue === 1 ? 'equally important as' :
                         currentValue <= 3 ? 'moderately more important than' :
                         currentValue <= 5 ? 'strongly more important than' :
                         currentValue <= 7 ? 'very strongly more important than' :
                         'extremely more important than'}
                      </span>
                      {' '}
                      <span>{currentPair.itemB}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-blue-300 font-semibold">{currentPair.itemB}</span>
                      {' is '}
                      <span className="text-white font-semibold">
                        {currentValue === 1 ? 'equally important as' :
                         currentValue <= 3 ? 'moderately more important than' :
                         currentValue <= 5 ? 'strongly more important than' :
                         currentValue <= 7 ? 'very strongly more important than' :
                         'extremely more important than'}
                      </span>
                      {' '}
                      <span>{currentPair.itemA}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <Button
            onClick={handlePrevious}
            disabled={currentPairIndex === 0}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 disabled:opacity-30"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-white text-black hover:bg-gray-200 font-semibold"
          >
            {currentPairIndex === totalPairs - 1 ? 'Calculate Weights' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
