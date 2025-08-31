"use client"

import React, { useEffect, useState } from 'react'
import { Heart, Brain, Clock, TrendingUp } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { GlassmorphicCard, GlassmorphicCardContent, GlassmorphicCardHeader, GlassmorphicCardTitle, ConfidenceIndicator } from '@/components/ui/glassmorphic-card'
import { useDecisionForm } from '@/contexts/DecisionFormContext'

interface EmotionalState {
  confidence: number
  urgency: number
  anxiety: number
  importance: number
}

const emotionalMetrics = [
  {
    key: 'confidence' as keyof EmotionalState,
    label: 'Confidence Level',
    description: 'How confident are you in making decisions like this?',
    icon: Brain,
    color: 'blue',
    lowLabel: 'Very Uncertain',
    highLabel: 'Very Confident'
  },
  {
    key: 'urgency' as keyof EmotionalState,
    label: 'Time Pressure',
    description: 'How urgent is this decision?',
    icon: Clock,
    color: 'orange',
    lowLabel: 'No Rush',
    highLabel: 'Very Urgent'
  },
  {
    key: 'anxiety' as keyof EmotionalState,
    label: 'Stress Level',
    description: 'How stressed do you feel about this decision?',
    icon: Heart,
    color: 'red',
    lowLabel: 'Very Calm',
    highLabel: 'Very Stressed'
  },
  {
    key: 'importance' as keyof EmotionalState,
    label: 'Impact Level',
    description: 'How important is this decision to your life?',
    icon: TrendingUp,
    color: 'green',
    lowLabel: 'Minor Impact',
    highLabel: 'Life Changing'
  }
]

export function Step2EmotionalContext() {
  const { state, updateDecision, setStepValid } = useDecisionForm()
  const [emotionalState, setEmotionalState] = useState<EmotionalState>({
    confidence: 5,
    urgency: 5,
    anxiety: 5,
    importance: 5
  })

  // Validate step - always valid since all metrics have default values
  useEffect(() => {
    setStepValid(1, true)
  }, [setStepValid])

  // Update decision context with emotional state
  useEffect(() => {
    updateDecision({ 
      description: state.decision.description.replace(/\[Emotional Context:.*?\]/g, '') + 
        ` [Emotional Context: Confidence ${emotionalState.confidence}/10, Urgency ${emotionalState.urgency}/10, Stress ${emotionalState.anxiety}/10, Importance ${emotionalState.importance}/10]`
    })
  }, [emotionalState])

  const handleSliderChange = (key: keyof EmotionalState, values: number[]) => {
    setEmotionalState(prev => ({
      ...prev,
      [key]: values[0]
    }))
  }

  const getEmotionalInsight = () => {
    const { confidence, urgency, anxiety, importance } = emotionalState
    
    if (anxiety >= 7 && urgency >= 7) {
      return {
        type: 'warning',
        message: 'High stress + urgency detected. Consider taking time to calm down before deciding.',
        color: 'text-orange-300'
      }
    } else if (confidence <= 3 && importance >= 7) {
      return {
        type: 'info', 
        message: 'Low confidence on important decision. Consider gathering more information.',
        color: 'text-blue-300'
      }
    } else if (confidence >= 7 && anxiety <= 3) {
      return {
        type: 'success',
        message: 'Great emotional state for decision making! You seem calm and confident.',
        color: 'text-green-300'
      }
    } else {
      return {
        type: 'neutral',
        message: 'Understanding your emotional state helps create better decision strategies.',
        color: 'text-white/70'
      }
    }
  }

  const insight = getEmotionalInsight()
  const overallStress = Math.round((emotionalState.anxiety * 0.4 + emotionalState.urgency * 0.3 + (10 - emotionalState.confidence) * 0.3))

  return (
    <div className="space-y-6">
      <GlassmorphicCard 
        className="animate-float-up"
        emotionalState="calm"
      >
        <GlassmorphicCardHeader>
          <GlassmorphicCardTitle className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-red-400 animate-pulse" />
            How Are You Feeling About This Decision?
          </GlassmorphicCardTitle>
          <p className="text-white/70 text-sm leading-relaxed">
            Your emotional state affects decision quality. Let's understand where you are mentally
            so we can provide the most appropriate guidance.
          </p>
        </GlassmorphicCardHeader>

        <GlassmorphicCardContent className="space-y-8">
          {/* Emotional Metrics */}
          <div className="grid gap-6">
            {emotionalMetrics.map((metric) => {
              const value = emotionalState[metric.key]
              const IconComponent = metric.icon
              
              return (
                <div key={metric.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`h-5 w-5 text-${metric.color}-400`} />
                      <span className="font-medium text-white/90">{metric.label}</span>
                    </div>
                    <Badge 
                      className={`bg-${metric.color}-500/20 text-${metric.color}-300 border-${metric.color}-500/30`}
                    >
                      {value}/10
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-white/60">{metric.description}</p>
                  
                  <div className="space-y-2">
                    <Slider
                      value={[value]}
                      onValueChange={(values) => handleSliderChange(metric.key, values)}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-white/50">
                      <span>{metric.lowLabel}</span>
                      <span>{metric.highLabel}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Overall Stress Indicator */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-white/90">Overall Decision Stress</span>
              <span className="text-sm text-white/60">Calculated from your inputs</span>
            </div>
            <ConfidenceIndicator 
              level={Math.max(0, 100 - (overallStress * 10))} 
              showLabel={true}
              className="mb-3"
            />
          </div>

          {/* Emotional Insight */}
          <div className={`p-4 rounded-lg bg-white/5 border border-white/10`}>
            <h4 className="font-medium text-white/90 mb-2">💡 Emotional Insight</h4>
            <p className={`text-sm ${insight.color}`}>
              {insight.message}
            </p>
          </div>

          {/* Quick Emotional State Presets */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-white/80">Quick Presets</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setEmotionalState({ confidence: 8, urgency: 3, anxiety: 2, importance: 6 })}
                className="p-3 text-left rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 transition-all duration-200 group"
              >
                <div className="font-medium text-green-300 text-sm mb-1">😌 Calm & Confident</div>
                <div className="text-xs text-green-200/70">Low stress, high confidence</div>
              </button>
              
              <button
                onClick={() => setEmotionalState({ confidence: 4, urgency: 8, anxiety: 7, importance: 9 })}
                className="p-3 text-left rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/15 transition-all duration-200 group"
              >
                <div className="font-medium text-orange-300 text-sm mb-1">😰 Stressed & Urgent</div>
                <div className="text-xs text-orange-200/70">High pressure situation</div>
              </button>
            </div>
          </div>
        </GlassmorphicCardContent>
      </GlassmorphicCard>
    </div>
  )
}