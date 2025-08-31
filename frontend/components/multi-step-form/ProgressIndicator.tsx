"use client"

import React from 'react'
import { CheckCircle, Circle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDecisionForm } from '@/contexts/DecisionFormContext'

const stepConfig = [
  {
    title: 'Decision Question',
    description: 'What are you trying to decide?',
    icon: '🤔'
  },
  {
    title: 'Emotional Context', 
    description: 'How are you feeling about this?',
    icon: '💭'
  },
  {
    title: 'Decision Factors',
    description: 'What matters most to you?',
    icon: '⚖️'
  },
  {
    title: 'Review & Generate',
    description: 'Create your decision tree',
    icon: '🌳'
  }
]

export function ProgressIndicator() {
  const { state, goToStep } = useDecisionForm()
  const { currentStep, completed, isValid = [] } = state

  return (
    <div className="w-full glassmorphic rounded-xl p-6 mb-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white/80">Progress</span>
          <span className="text-sm font-medium text-white/80">
            Step {currentStep + 1} of {state.totalSteps}
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 transition-all duration-700 ease-out"
            style={{
              width: `${((currentStep + 1) / state.totalSteps) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {stepConfig.map((step, index) => {
          const isCurrent = index === currentStep
          const isCompleted = completed[index]
          const isStepValid = isValid[index] || false
          const canAccess = index <= currentStep || isCompleted

          return (
            <React.Fragment key={index}>
              <button
                onClick={() => canAccess && goToStep(index)}
                disabled={!canAccess}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-300 group",
                  canAccess ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-50",
                  isCurrent && "bg-white/10 scale-105"
                )}
              >
                {/* Step Icon */}
                <div className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                  isCompleted 
                    ? "bg-green-500/20 border-green-400 text-green-400" 
                    : isCurrent
                    ? "bg-blue-500/20 border-blue-400 text-blue-400 animate-pulse"
                    : isStepValid
                    ? "bg-purple-500/20 border-purple-400 text-purple-400"
                    : "bg-white/5 border-white/20 text-white/40"
                )}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="text-lg">{step.icon}</span>
                  )}
                  
                  {/* Current step pulse effect */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-20" />
                  )}
                </div>

                {/* Step Info */}
                <div className="text-center min-w-0">
                  <div className={cn(
                    "text-xs font-medium transition-colors duration-300",
                    isCurrent ? "text-white" : "text-white/60"
                  )}>
                    {step.title}
                  </div>
                  <div className={cn(
                    "text-xs transition-colors duration-300",
                    isCurrent ? "text-white/70" : "text-white/40"
                  )}>
                    {step.description}
                  </div>
                </div>

                {/* Validation indicator */}
                {isStepValid && !isCompleted && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
                )}
              </button>

              {/* Connector Arrow */}
              {index < stepConfig.length - 1 && (
                <ArrowRight 
                  className={cn(
                    "w-4 h-4 transition-colors duration-300 flex-shrink-0",
                    index < currentStep ? "text-green-400" : "text-white/20"
                  )} 
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}