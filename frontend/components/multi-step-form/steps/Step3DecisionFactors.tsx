"use client"

import React, { useEffect, useState } from 'react'
import { Plus, Trash2, GripVertical, Sparkles, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VisibleInput } from '@/components/ui/visible-input'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { GlassmorphicCard, GlassmorphicCardContent, GlassmorphicCardHeader, GlassmorphicCardTitle } from '@/components/ui/glassmorphic-card'
import { useDecisionForm } from '@/contexts/DecisionFormContext'
import type { Factor } from '@/types/decision'

const factorSuggestions = [
  { name: "Financial Impact", category: "financial" },
  { name: "Career Growth", category: "career" },
  { name: "Work-Life Balance", category: "personal" },
  { name: "Location/Commute", category: "personal" },
  { name: "Learning Opportunities", category: "career" },
  { name: "Job Security", category: "financial" },
  { name: "Company Culture", category: "personal" },
  { name: "Benefits Package", category: "financial" }
]

const getCategoryColor = (category: Factor["category"]) => {
  switch (category) {
    case "financial":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    case "personal":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    case "career":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
    case "health":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  }
}

export function Step3DecisionFactors() {
  const { state, updateDecision, setStepValid } = useDecisionForm()
  const { decision } = state
  const [newFactorName, setNewFactorName] = useState("")
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  // Validate step - need at least 2 factors
  useEffect(() => {
    const isValid = decision.factors.length >= 2
    setStepValid(2, isValid)
  }, [decision.factors.length, setStepValid])

  const addFactor = (name: string = newFactorName, category: Factor["category"] = "personal") => {
    if (!name.trim()) return

    const newFactor: Factor = {
      id: Date.now().toString(),
      name: name.trim(),
      weight: 50,
      category,
    }

    updateDecision({ factors: [...decision.factors, newFactor] })
    setNewFactorName("")
  }

  const removeFactor = (factorId: string) => {
    const updatedFactors = decision.factors.filter((factor) => factor.id !== factorId)
    updateDecision({ factors: updatedFactors })
  }

  const updateFactor = (factorId: string, updates: Partial<Factor>) => {
    const updatedFactors = decision.factors.map((factor) =>
      factor.id === factorId ? { ...factor, ...updates } : factor
    )
    updateDecision({ factors: updatedFactors })
  }

  const handleDragStart = (e: React.DragEvent, factorId: string) => {
    setDraggedItem(factorId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetFactorId: string) => {
    e.preventDefault()
    if (!draggedItem || draggedItem === targetFactorId) return

    const draggedIndex = decision.factors.findIndex((f) => f.id === draggedItem)
    const targetIndex = decision.factors.findIndex((f) => f.id === targetFactorId)

    const newFactors = [...decision.factors]
    const [draggedFactor] = newFactors.splice(draggedIndex, 1)
    newFactors.splice(targetIndex, 0, draggedFactor)

    updateDecision({ factors: newFactors })
    setDraggedItem(null)
  }

  const totalWeight = decision.factors.reduce((sum, factor) => sum + factor.weight, 0)
  const averageWeight = decision.factors.length > 0 ? totalWeight / decision.factors.length : 0

  return (
    <div className="space-y-6">
      <GlassmorphicCard 
        className="animate-float-up"
        emotionalState="confident"
      >
        <GlassmorphicCardHeader>
          <GlassmorphicCardTitle className="flex items-center gap-3">
            <Scale className="h-6 w-6 text-purple-400 animate-pulse" />
            What Factors Matter Most to You?
          </GlassmorphicCardTitle>
          <p className="text-white/70 text-sm leading-relaxed">
            Add the key factors that will influence your decision. Weight them by importance 
            and organize them by priority. You need at least 2 factors to continue.
          </p>
        </GlassmorphicCardHeader>

        <GlassmorphicCardContent className="space-y-6">
          {/* Quick Suggestions */}
          {decision.factors.length === 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-white/80">Common Decision Factors</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {factorSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => addFactor(suggestion.name, suggestion.category)}
                    className="p-2 text-left rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105"
                  >
                    <div className="text-sm text-white/90">{suggestion.name}</div>
                    <Badge className={`${getCategoryColor(suggestion.category)} text-xs mt-1`}>
                      {suggestion.category}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add New Factor */}
          <div className="flex gap-2">
            <VisibleInput
              value={newFactorName}
              onChange={(e) => setNewFactorName(e.target.value)}
              placeholder="Add a new factor (e.g., Salary, Location, Growth)..."
              onKeyPress={(e) => e.key === "Enter" && addFactor()}
            />
            <Button 
              onClick={() => addFactor()} 
              size="sm" 
              className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 hover:scale-110 transition-transform"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Existing Factors */}
          {decision.factors.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">
                  Your Decision Factors ({decision.factors.length})
                </span>
                <div className="text-xs text-white/60">
                  Drag to reorder • Average weight: {averageWeight.toFixed(0)}%
                </div>
              </div>

              {decision.factors.map((factor, index) => (
                <div
                  key={factor.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, factor.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, factor.id)}
                  className={`p-4 rounded-lg border glassmorphic space-y-3 cursor-move hover:scale-[1.02] transition-all duration-300 hover:shadow-lg ${
                    draggedItem === factor.id ? "opacity-50 scale-95" : ""
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-white/40 hover:text-white/70 transition-colors" />
                      <span className="font-medium text-white/90">{factor.name}</span>
                      <Badge className={`${getCategoryColor(factor.category)} animate-pulse text-xs`}>
                        {factor.category}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFactor(factor.id)}
                      className="text-red-400 hover:text-red-300 hover:scale-110 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Importance Level</span>
                      <Badge variant="secondary" className="animate-pulse">
                        {factor.weight}%
                      </Badge>
                    </div>
                    <Slider
                      value={[factor.weight]}
                      onValueChange={([value]) => updateFactor(factor.id, { weight: value })}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full hover:scale-[1.02] transition-transform"
                    />
                    <div className="flex justify-between text-xs text-white/50">
                      <span>Not Important</span>
                      <span>Extremely Important</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Validation Feedback */}
          {decision.factors.length >= 2 ? (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-green-300">
                Great! You have {decision.factors.length} factors. Ready for the final step.
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <span className="text-sm text-orange-300">
                Add at least {2 - decision.factors.length} more factor{2 - decision.factors.length > 1 ? 's' : ''} to continue.
              </span>
            </div>
          )}
        </GlassmorphicCardContent>
      </GlassmorphicCard>

      {/* Factor Analysis */}
      {decision.factors.length > 0 && (
        <GlassmorphicCard variant="surface" className="animate-float-up delay-300">
          <GlassmorphicCardContent className="p-4">
            <h4 className="font-medium text-white/90 mb-3 flex items-center gap-2">
              <Scale className="h-4 w-4 text-purple-400" />
              Factor Analysis
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-white">{decision.factors.length}</div>
                <div className="text-xs text-white/60">Total Factors</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{averageWeight.toFixed(0)}%</div>
                <div className="text-xs text-white/60">Avg. Weight</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {decision.factors.filter(f => f.weight >= 70).length}
                </div>
                <div className="text-xs text-white/60">High Priority</div>
              </div>
            </div>
          </GlassmorphicCardContent>
        </GlassmorphicCard>
      )}
    </div>
  )
}