"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Brain, Mic, MicOff, GripVertical, Sparkles } from "lucide-react"
import type { Decision, Factor } from "@/types/decision"

interface DecisionFormProps {
  decision: Decision
  onDecisionChange: (decision: Decision) => void
  onNotification: (message: string, type?: "success" | "warning" | "error") => void
}

export function DecisionForm({ decision, onDecisionChange, onNotification }: DecisionFormProps) {
  const [newFactorName, setNewFactorName] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const recognitionRef = useRef<any>(null)

  const startVoiceInput = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        onNotification("Listening... Speak your decision description", "success")
      }

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        updateDecision({ description: decision.description + " " + transcript })
        onNotification("Voice input added successfully!", "success")
      }

      recognitionRef.current.onerror = () => {
        onNotification("Voice input failed. Please try again.", "error")
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.start()
    } else {
      onNotification("Voice input not supported in this browser", "warning")
    }
  }

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const generateAISuggestions = () => {
    const suggestions = [
      "Consider long-term career satisfaction",
      "Evaluate financial stability requirements",
      "Assess learning curve and skill development",
      "Review work-life balance implications",
      "Consider industry growth potential",
    ]
    setAiSuggestions(suggestions)
    onNotification("AI suggestions generated!", "success")
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
    onNotification("Factor reordered successfully!", "success")
  }

  const updateDecision = (updates: Partial<Decision>) => {
    onDecisionChange({ ...decision, ...updates })
  }

  const updateFactor = (factorId: string, updates: Partial<Factor>) => {
    const updatedFactors = decision.factors.map((factor) =>
      factor.id === factorId ? { ...factor, ...updates } : factor,
    )
    updateDecision({ factors: updatedFactors })
  }

  const addFactor = () => {
    if (!newFactorName.trim()) return

    const newFactor: Factor = {
      id: Date.now().toString(),
      name: newFactorName,
      weight: 50,
      category: "personal",
    }

    updateDecision({ factors: [...decision.factors, newFactor] })
    setNewFactorName("")
    onNotification("New factor added!", "success")
  }

  const removeFactor = (factorId: string) => {
    const updatedFactors = decision.factors.filter((factor) => factor.id !== factorId)
    updateDecision({ factors: updatedFactors })
    onNotification("Factor removed", "warning")
  }

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

  return (
    <Card className="hover-lift glassmorphism animate-float-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary animate-pulse" />
          Decision Input
          <Button
            variant="ghost"
            size="sm"
            onClick={generateAISuggestions}
            className="ml-auto hover:scale-105 transition-transform"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            AI Assist
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/50">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-1 text-blue-500" />
              AI Suggestions
            </h4>
            <div className="space-y-1">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const newFactor: Factor = {
                      id: Date.now().toString() + index,
                      name: suggestion,
                      weight: 70,
                      category: "personal",
                    }
                    updateDecision({ factors: [...decision.factors, newFactor] })
                    onNotification("AI suggestion added as factor!", "success")
                  }}
                  className="block w-full text-left text-xs p-2 rounded hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Decision Question */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Decision Question</label>
          <Input
            value={decision.title}
            onChange={(e) => updateDecision({ title: e.target.value })}
            placeholder="What decision are you trying to make?"
            className="glassmorphism hover:scale-[1.02] transition-transform focus:scale-[1.02]"
          />
        </div>

        {/* Context with Voice Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Context</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              className={`hover:scale-105 transition-all ${isListening ? "text-red-500 animate-pulse" : ""}`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isListening ? "Stop" : "Voice"}
            </Button>
          </div>
          <Textarea
            value={decision.description}
            onChange={(e) => updateDecision({ description: e.target.value })}
            placeholder="Provide additional context about your decision..."
            className="glassmorphism min-h-[100px] hover:scale-[1.01] transition-transform focus:scale-[1.01]"
          />
        </div>

        {/* Factors with Drag and Drop */}
        <div className="space-y-4">
          <label className="text-sm font-medium">Decision Factors (Drag to reorder)</label>

          {decision.factors.map((factor, index) => (
            <div
              key={factor.id}
              draggable
              onDragStart={(e) => handleDragStart(e, factor.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, factor.id)}
              className={`p-4 rounded-lg border glassmorphism space-y-3 cursor-move hover:scale-[1.02] transition-all duration-300 hover:shadow-lg ${
                draggedItem === factor.id ? "opacity-50 scale-95" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  <span className="font-medium">{factor.name}</span>
                  <Badge className={`${getCategoryColor(factor.category)} animate-pulse`}>{factor.category}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFactor(factor.id)}
                  className="text-destructive hover:text-destructive hover:scale-110 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Importance</span>
                  <Badge variant="secondary" className="animate-pulse">
                    {factor.weight}%
                  </Badge>
                </div>
                <Slider
                  value={[factor.weight]}
                  onValueChange={([value]) => updateFactor(factor.id, { weight: value })}
                  max={100}
                  step={5}
                  className="w-full hover:scale-[1.02] transition-transform"
                />
              </div>
            </div>
          ))}

          {/* Add Factor */}
          <div className="flex gap-2">
            <Input
              value={newFactorName}
              onChange={(e) => setNewFactorName(e.target.value)}
              placeholder="Add a new factor..."
              className="glassmorphism hover:scale-[1.02] transition-transform focus:scale-[1.02]"
              onKeyPress={(e) => e.key === "Enter" && addFactor()}
            />
            <Button onClick={addFactor} size="sm" className="hover:scale-110 transition-transform">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          className="w-full gradient-success text-white border-0 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          size="lg"
          onClick={() => onNotification("Decision tree generation started!", "success")}
        >
          <Brain className="h-4 w-4 mr-2 animate-spin" />
          Generate Decision Tree
        </Button>
      </CardContent>
    </Card>
  )
}
