"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface TutorialStep {
  id: string
  title: string
  description: string
  targetElement?: string
  position?: "top" | "bottom" | "left" | "right"
  action?: string
  interactive?: boolean
  interactiveComponent?: React.ReactNode
}

interface OnboardingTutorialProps {
  steps: TutorialStep[]
  onComplete: () => void
  onSkip: () => void
}

export function OnboardingTutorial({ steps, onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightPosition, setHighlightPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null)

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  useEffect(() => {
    if (step.targetElement) {
      // Wait a bit for DOM to be ready
      const timer = setTimeout(() => {
        const element = document.querySelector(step.targetElement!)
        if (element) {
          const rect = element.getBoundingClientRect()
          setHighlightPosition({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
          })

          // Scroll element into view
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        } else {
          // Element not found, center the card
          setHighlightPosition(null)
        }
      }, 100)

      return () => clearTimeout(timer)
    } else {
      setHighlightPosition(null)
    }
  }, [currentStep, step.targetElement])

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[99998] bg-black/80 transition-opacity" />

      {/* Highlight */}
      {highlightPosition && (
        <div
          className="fixed z-[99999] rounded-lg border-4 border-blue-500 pointer-events-none transition-all duration-300"
          style={{
            top: `${highlightPosition.top - 8}px`,
            left: `${highlightPosition.left - 8}px`,
            width: `${highlightPosition.width + 16}px`,
            height: `${highlightPosition.height + 16}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)'
          }}
        />
      )}

      {/* Tutorial Card */}
      <div
        className="fixed z-[100000] bg-slate-900 rounded-xl border-2 border-blue-500 p-6 max-w-md w-full transition-all duration-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(59, 130, 246, 0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-xs font-medium text-slate-400">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">{step.title}</h3>
          </div>
          <Button
            onClick={onSkip}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white -mt-2 -mr-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <p className="text-slate-300 mb-6 leading-relaxed">{step.description}</p>

        {step.action && !step.interactive && (
          <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>Action:</strong> {step.action}
            </p>
          </div>
        )}

        {/* Interactive Component */}
        {step.interactive && step.interactiveComponent && (
          <div className="mb-6">
            {step.interactiveComponent}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={isFirstStep}
            variant="ghost"
            className="text-slate-400 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={onSkip}
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              Skip Tour
            </Button>
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isLastStep ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? "w-8 bg-blue-500"
                  : index < currentStep
                  ? "w-2 bg-blue-500/50"
                  : "w-2 bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>
    </>
  )
}
