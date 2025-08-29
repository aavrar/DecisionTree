"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { GlassmorphicCard } from "./glassmorphic-card"
import { Slider } from "./slider"

interface EmotionalStateData {
  confidence: number // 1-10
  urgency: number    // 1-10
  anxiety: number    // 1-10
  clarity: number    // 1-10
  motivation: number // 1-10
}

interface EmotionalStateInputProps {
  value?: Partial<EmotionalStateData>
  onChange?: (state: EmotionalStateData) => void
  className?: string
  showAdvanced?: boolean
  stressReductionMode?: boolean
}

const EmotionalStateInput = React.forwardRef<
  HTMLDivElement,
  EmotionalStateInputProps
>(({ 
  value = {}, 
  onChange, 
  className, 
  showAdvanced = false,
  stressReductionMode = true 
}, ref) => {
  const [state, setState] = useState<EmotionalStateData>({
    confidence: 5,
    urgency: 5,
    anxiety: 5,
    clarity: 5,
    motivation: 7,
    ...value,
  })

  const [focusedDimension, setFocusedDimension] = useState<string | null>(null)

  useEffect(() => {
    onChange?.(state)
  }, [state, onChange])

  const handleSliderChange = (dimension: keyof EmotionalStateData) => (value: number[]) => {
    setState(prev => ({
      ...prev,
      [dimension]: value[0]
    }))
  }

  const getEmotionalColor = (dimension: keyof EmotionalStateData, value: number) => {
    switch (dimension) {
      case 'confidence':
      case 'clarity':
      case 'motivation':
        // Higher is better - green to blue gradient
        return value >= 7 ? 'var(--balance-primary)' : 
               value >= 5 ? 'var(--trust-primary)' : 
               'var(--energy-secondary)'
      case 'anxiety':
        // Lower is better - inverted scale
        return value <= 3 ? 'var(--balance-primary)' : 
               value <= 6 ? 'var(--trust-primary)' : 
               'var(--energy-primary)'
      case 'urgency':
        // Moderate is optimal
        return (value >= 4 && value <= 7) ? 'var(--trust-primary)' : 
               'var(--energy-secondary)'
      default:
        return 'var(--trust-primary)'
    }
  }

  const getEmotionalFeedback = () => {
    const { confidence, anxiety, clarity } = state
    const avgWellbeing = (confidence + (10 - anxiety) + clarity) / 3

    if (avgWellbeing >= 7.5) {
      return {
        message: "You're in a great headspace for making this decision",
        color: "var(--balance-primary)",
        suggestion: "Your clarity and confidence are strong. Trust your analysis."
      }
    } else if (avgWellbeing >= 5.5) {
      return {
        message: "You're reasonably prepared for this decision",
        color: "var(--trust-primary)",
        suggestion: "Consider taking a moment to clarify any concerns."
      }
    } else {
      return {
        message: "It might help to take a step back and breathe",
        color: "var(--energy-primary)",
        suggestion: "Perhaps revisit this decision when you're feeling more centered."
      }
    }
  }

  const feedback = getEmotionalFeedback()

  const basicDimensions = [
    { 
      key: 'confidence' as const, 
      label: 'How confident do you feel?', 
      lowLabel: 'Uncertain', 
      highLabel: 'Very sure' 
    },
    { 
      key: 'anxiety' as const, 
      label: 'How anxious are you about this?', 
      lowLabel: 'Calm', 
      highLabel: 'Stressed' 
    },
    { 
      key: 'urgency' as const, 
      label: 'How urgent is this decision?', 
      lowLabel: 'Can wait', 
      highLabel: 'Very urgent' 
    },
  ]

  const advancedDimensions = [
    { 
      key: 'clarity' as const, 
      label: 'How clear are your thoughts?', 
      lowLabel: 'Foggy', 
      highLabel: 'Crystal clear' 
    },
    { 
      key: 'motivation' as const, 
      label: 'How motivated are you to decide?', 
      lowLabel: 'Reluctant', 
      highLabel: 'Eager' 
    },
  ]

  const dimensionsToShow = showAdvanced 
    ? [...basicDimensions, ...advancedDimensions] 
    : basicDimensions

  return (
    <GlassmorphicCard
      ref={ref}
      variant="surface"
      className={cn("w-full", className)}
      stressIndicator={state.anxiety > 7}
      emotionalState={state.anxiety > 7 ? "anxious" : state.confidence > 7 ? "confident" : "calm"}
    >
      <div className="space-y-breathing-lg">
        <div className="text-center">
          <h3 className="text-decision-secondary mb-breathing-xs">
            How are you feeling about this decision?
          </h3>
          <p className="text-helper">
            Understanding your emotional state helps create a better decision experience
          </p>
        </div>

        <div className="space-y-breathing-md">
          {dimensionsToShow.map(({ key, label, lowLabel, highLabel }) => (
            <div 
              key={key}
              className={cn(
                "space-y-breathing-xs transition-all duration-300",
                focusedDimension === key && "scale-[1.02] opacity-100",
                focusedDimension && focusedDimension !== key && "opacity-70"
              )}
            >
              <div className="flex justify-between items-center">
                <label className="text-factor font-medium">{label}</label>
                <span 
                  className="text-sm font-bold px-2 py-1 rounded-full glassmorphic"
                  style={{ color: getEmotionalColor(key, state[key]) }}
                >
                  {state[key]}/10
                </span>
              </div>
              
              <div className="px-breathing-xs">
                <Slider
                  value={[state[key]]}
                  onValueChange={handleSliderChange(key)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                  onFocus={() => setFocusedDimension(key)}
                  onBlur={() => setFocusedDimension(null)}
                  style={{
                    '--slider-color': getEmotionalColor(key, state[key])
                  } as React.CSSProperties}
                />
                <div className="flex justify-between text-xs text-calm-text-secondary mt-1">
                  <span>{lowLabel}</span>
                  <span>{highLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {stressReductionMode && (
          <div 
            className="glassmorphic-surface rounded-lg p-breathing-md text-center"
            style={{ borderColor: feedback.color + '40' }}
          >
            <div className="flex items-center justify-center gap-breathing-sm mb-breathing-xs">
              <div 
                className="w-3 h-3 rounded-full pulse-subtle"
                style={{ backgroundColor: feedback.color }}
              />
              <p className="text-factor font-medium" style={{ color: feedback.color }}>
                {feedback.message}
              </p>
            </div>
            <p className="text-helper text-xs">
              {feedback.suggestion}
            </p>
          </div>
        )}

        {!showAdvanced && (
          <button
            onClick={() => {/* This would toggle showAdvanced in parent */}}
            className="w-full text-center text-helper hover:text-calm-text transition-colors py-breathing-xs"
          >
            Show more emotional dimensions →
          </button>
        )}
      </div>
    </GlassmorphicCard>
  )
})

EmotionalStateInput.displayName = "EmotionalStateInput"

// Simplified quick check component
const QuickEmotionalCheck = React.forwardRef<
  HTMLDivElement,
  {
    onStateChange?: (state: 'good' | 'okay' | 'stressed') => void
    className?: string
  }
>(({ onStateChange, className }, ref) => {
  const [selectedState, setSelectedState] = useState<'good' | 'okay' | 'stressed' | null>(null)

  const handleStateSelect = (state: 'good' | 'okay' | 'stressed') => {
    setSelectedState(state)
    onStateChange?.(state)
  }

  const states = [
    { 
      value: 'good' as const, 
      emoji: '😊', 
      label: 'Feeling good', 
      color: 'var(--balance-primary)' 
    },
    { 
      value: 'okay' as const, 
      emoji: '😐', 
      label: 'Doing okay', 
      color: 'var(--trust-primary)' 
    },
    { 
      value: 'stressed' as const, 
      emoji: '😰', 
      label: 'A bit stressed', 
      color: 'var(--energy-primary)' 
    },
  ]

  return (
    <div ref={ref} className={cn("flex gap-breathing-sm", className)}>
      <span className="text-helper self-center">How are you feeling right now?</span>
      {states.map(({ value, emoji, label, color }) => (
        <button
          key={value}
          onClick={() => handleStateSelect(value)}
          className={cn(
            "flex items-center gap-breathing-xs px-breathing-sm py-breathing-xs rounded-full transition-all",
            "glassmorphic hover:scale-105",
            selectedState === value && "ring-2 ring-offset-2"
          )}
          style={{
            ringColor: selectedState === value ? color : 'transparent',
            borderColor: selectedState === value ? color : 'transparent',
          }}
        >
          <span className="text-lg">{emoji}</span>
          <span className="text-sm">{label}</span>
        </button>
      ))}
    </div>
  )
})

QuickEmotionalCheck.displayName = "QuickEmotionalCheck"

export { EmotionalStateInput, QuickEmotionalCheck, type EmotionalStateData }