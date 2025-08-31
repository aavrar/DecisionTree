"use client"

import React, { useEffect, useState } from 'react'
import { CheckCircle, Zap, Brain, Heart, Scale, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassmorphicCard, GlassmorphicCardContent, GlassmorphicCardHeader, GlassmorphicCardTitle } from '@/components/ui/glassmorphic-card'
import { useDecisionForm } from '@/contexts/DecisionFormContext'

export function Step4ReviewGenerate() {
  const { state, setStepValid } = useDecisionForm()
  const { decision } = state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  // This step is always valid since it's just review
  useEffect(() => {
    setStepValid(3, true)
  }, [setStepValid])

  const handleGenerateTree = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate AI processing with progress updates
    const steps = [
      { progress: 20, message: "Analyzing your decision context..." },
      { progress: 40, message: "Processing emotional factors..." },
      { progress: 60, message: "Weighing decision factors..." },
      { progress: 80, message: "Generating decision pathways..." },
      { progress: 100, message: "Finalizing your decision tree..." }
    ]

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setGenerationProgress(step.progress)
    }

    // TODO: Actually generate the decision tree and navigate to results
    setTimeout(() => {
      setIsGenerating(false)
      alert("Decision tree generated! (This would navigate to the visualization in the full implementation)")
    }, 500)
  }

  const getDecisionSummary = () => {
    const highPriorityFactors = decision.factors.filter(f => f.weight >= 70)
    const averageWeight = decision.factors.reduce((sum, f) => sum + f.weight, 0) / decision.factors.length
    
    return {
      complexity: decision.factors.length >= 5 ? 'Complex' : decision.factors.length >= 3 ? 'Moderate' : 'Simple',
      highPriorityCount: highPriorityFactors.length,
      averageImportance: averageWeight.toFixed(0),
      contextLength: decision.description.length
    }
  }

  const summary = getDecisionSummary()
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "financial": return "text-green-400 bg-green-500/20"
      case "personal": return "text-blue-400 bg-blue-500/20"  
      case "career": return "text-purple-400 bg-purple-500/20"
      case "health": return "text-red-400 bg-red-500/20"
      default: return "text-gray-400 bg-gray-500/20"
    }
  }

  return (
    <div className="space-y-6">
      <GlassmorphicCard 
        className="animate-float-up"
        emotionalState="confident"
      >
        <GlassmorphicCardHeader>
          <GlassmorphicCardTitle className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-400 animate-pulse" />
            Review Your Decision Setup
          </GlassmorphicCardTitle>
          <p className="text-white/70 text-sm leading-relaxed">
            Everything looks good! Review your inputs below, then generate your personalized decision tree.
          </p>
        </GlassmorphicCardHeader>

        <GlassmorphicCardContent className="space-y-6">
          {/* Decision Question Review */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-400" />
              <span className="font-medium text-white/90">Decision Question</span>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="font-medium text-white mb-2">{decision.title}</div>
              <div className="text-sm text-white/70 line-clamp-3">{decision.description}</div>
            </div>
          </div>

          {/* Emotional Context Review */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-400" />
              <span className="font-medium text-white/90">Emotional Context</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                <div className="text-lg font-bold text-blue-400">Confidence</div>
                <div className="text-sm text-white/70">Ready to decide</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                <div className="text-lg font-bold text-orange-400">Context</div>
                <div className="text-sm text-white/70">{summary.contextLength} chars</div>
              </div>
            </div>
          </div>

          {/* Decision Factors Review */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-purple-400" />
                <span className="font-medium text-white/90">Decision Factors</span>
              </div>
              <Badge className="bg-purple-500/20 text-purple-300">
                {decision.factors.length} factors
              </Badge>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {decision.factors.map((factor, index) => (
                <div 
                  key={factor.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/70">
                      {index + 1}
                    </span>
                    <span className="text-white/90 text-sm">{factor.name}</span>
                    <Badge className={`text-xs ${getCategoryColor(factor.category)}`}>
                      {factor.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-300"
                        style={{ width: `${factor.weight}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/70 w-8">{factor.weight}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Analysis Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{summary.complexity}</div>
              <div className="text-xs text-white/60">Complexity</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{summary.highPriorityCount}</div>
              <div className="text-xs text-white/60">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{summary.averageImportance}%</div>
              <div className="text-xs text-white/60">Avg. Weight</div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-4">
            <Button
              onClick={handleGenerateTree}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 hover:from-blue-600 hover:via-purple-600 hover:to-green-600 text-white font-semibold py-4 rounded-xl shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300 border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Decision Tree... {generationProgress}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5" />
                  <span>Generate My Decision Tree</span>
                  <Sparkles className="w-5 h-5" />
                </div>
              )}
            </Button>
            
            {isGenerating && (
              <div className="mt-3 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 transition-all duration-1000 ease-out"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* AI Processing Message */}
          {isGenerating && (
            <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-sm font-medium text-blue-300">Processing</span>
              </div>
              <p className="text-xs text-white/70">
                Creating personalized decision pathways based on your inputs...
              </p>
            </div>
          )}
        </GlassmorphicCardContent>
      </GlassmorphicCard>
    </div>
  )
}