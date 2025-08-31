"use client"

import React, { useEffect, useState } from 'react'
import { Brain, Lightbulb, Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VisibleInput } from '@/components/ui/visible-input'
import { VisibleTextarea } from '@/components/ui/visible-textarea'
import { GlassmorphicCard, GlassmorphicCardContent, GlassmorphicCardHeader, GlassmorphicCardTitle } from '@/components/ui/glassmorphic-card'
import { useDecisionForm } from '@/contexts/DecisionFormContext'

export function Step1DecisionQuestion() {
  const { state, updateDecision, setStepValid } = useDecisionForm()
  const { decision } = state
  const [isListening, setIsListening] = useState(false)
  const [suggestions] = useState([
    "Should I change careers?",
    "Which apartment should I choose?",
    "Should I start my own business?",
    "Which college major is right for me?",
    "Should I move to a different city?"
  ])

  // Validate step
  useEffect(() => {
    const isValid = decision.title.trim().length > 0 && decision.description.trim().length > 10
    setStepValid(0, isValid)
  }, [decision.title, decision.description, setStepValid])

  const handleVoiceInput = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        updateDecision({ description: decision.description + " " + transcript })
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.start()
    }
  }

  const applySuggestion = (suggestion: string) => {
    updateDecision({ title: suggestion })
  }

  return (
    <div className="space-y-6">
      <GlassmorphicCard 
        className="animate-float-up"
        emotionalState="confident"
      >
        <GlassmorphicCardHeader>
          <GlassmorphicCardTitle className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-blue-400 animate-pulse" />
            What Decision Are You Trying to Make?
          </GlassmorphicCardTitle>
          <p className="text-white/70 text-sm leading-relaxed">
            Start by clearly defining your decision. This helps frame everything that follows
            and ensures we're solving the right problem.
          </p>
        </GlassmorphicCardHeader>

        <GlassmorphicCardContent className="space-y-6">
          {/* Decision Question Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90">
              Decision Question *
            </label>
            <VisibleInput
              value={decision.title}
              onChange={(e) => updateDecision({ title: e.target.value })}
              placeholder="e.g., Should I change careers to software development?"
            />
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/80">Quick Start Ideas</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => applySuggestion(suggestion)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Context Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white/90">
                Additional Context *
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceInput}
                className={`hover:scale-105 transition-all text-white/70 hover:text-white ${
                  isListening ? "text-red-400 animate-pulse" : ""
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isListening ? "Stop" : "Voice"}
              </Button>
            </div>
            <VisibleTextarea
              value={decision.description}
              onChange={(e) => updateDecision({ description: e.target.value })}
              placeholder="Provide any background information, constraints, or context that might be relevant to your decision..."
              style={{ minHeight: '120px' }}
            />
            <p className="text-xs text-white/50">
              Minimum 10 characters. The more context you provide, the better recommendations you'll receive.
            </p>
          </div>

          {/* Validation Feedback */}
          {decision.title.trim().length > 0 && decision.description.trim().length > 10 && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-green-300">
                Great! You can proceed to the next step.
              </span>
            </div>
          )}
        </GlassmorphicCardContent>
      </GlassmorphicCard>

      {/* Helpful Tips */}
      <GlassmorphicCard variant="surface" className="animate-float-up delay-300">
        <GlassmorphicCardContent className="p-4">
          <h4 className="font-medium text-white/90 mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-400" />
            Tips for Better Decisions
          </h4>
          <ul className="text-sm text-white/70 space-y-1">
            <li>• Be specific about what you're deciding between</li>
            <li>• Include any time constraints or deadlines</li>
            <li>• Mention key stakeholders who might be affected</li>
            <li>• Note any non-negotiable requirements</li>
          </ul>
        </GlassmorphicCardContent>
      </GlassmorphicCard>
    </div>
  )
}