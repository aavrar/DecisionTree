"use client"

import React from 'react'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DecisionFormProvider, useDecisionForm } from '@/contexts/DecisionFormContext'
import { ProgressIndicator } from './ProgressIndicator'
import { Step1DecisionQuestion } from './steps/Step1DecisionQuestion'
import { Step2EmotionalContext } from './steps/Step2EmotionalContext'
import { Step3DecisionFactors } from './steps/Step3DecisionFactors'
import { Step4ReviewGenerate } from './steps/Step4ReviewGenerate'
import { TestStep } from './steps/TestStep'

const stepComponents = [
  Step1DecisionQuestion, // Restored
  Step2EmotionalContext,
  Step3DecisionFactors,
  Step4ReviewGenerate
]

function MultiStepFormContent() {
  const { state, nextStep, prevStep, canProceed, resetForm } = useDecisionForm()
  const { currentStep, totalSteps } = state

  const CurrentStepComponent = stepComponents[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="w-full mx-auto space-y-6 px-4">
      {/* Progress Indicator */}
      <ProgressIndicator />

      {/* Current Step Content */}
      <div className="min-h-[500px]">
        {CurrentStepComponent ? (
          <CurrentStepComponent />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center">
              <p className="text-xl mb-2">Loading step {currentStep + 1}...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between p-6 glassmorphic rounded-xl">
        <div className="flex items-center gap-3">
          {!isFirstStep && (
            <Button
              variant="ghost"
              onClick={prevStep}
              className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={resetForm}
            className="text-white/50 hover:text-white/70 hover:bg-white/5 transition-all duration-300"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-white/60">
            Step {currentStep + 1} of {totalSteps}
          </div>
          
          {!isLastStep && (
            <Button
              onClick={nextStep}
              disabled={!canProceed}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Step Validation Hints */}
      {!canProceed && !isLastStep && (
        <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <p className="text-sm text-orange-300">
            {currentStep === 0 && "Complete the decision question and provide context to continue"}
            {currentStep === 1 && "Emotional context is automatically saved - you can continue anytime"}
            {currentStep === 2 && "Add at least 2 decision factors to continue"}
          </p>
        </div>
      )}
    </div>
  )
}

export function MultiStepDecisionForm() {
  return (
    <DecisionFormProvider>
      <MultiStepFormContent />
    </DecisionFormProvider>
  )
}