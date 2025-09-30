"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Brain, Mic, MicOff, GripVertical, Sparkles, Heart, Clock, TrendingUp, AlertTriangle, Timer, Save, Loader2 } from "lucide-react"
import type { Decision, Factor } from "@/types/decision"
import { useDecisions } from "@/hooks/useDecisions"

interface DecisionFormProps {
  decision: Decision
  onDecisionChange: (decision: Decision) => void
  onNotification: (message: string, type?: "success" | "warning" | "error") => void
  onSaveSuccess?: (savedDecision: Decision) => void
  editMode?: boolean
}

export function DecisionForm({ decision, onDecisionChange, onNotification, onSaveSuccess, editMode = false }: DecisionFormProps) {
  const [newFactorName, setNewFactorName] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const recognitionRef = useRef<any>(null)
  const { createDecision, updateDecision: updateDecisionAPI } = useDecisions({ autoFetch: false })

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

  const handleSaveDecision = async () => {
    if (!decision.title) {
      onNotification("Please enter a decision title", "error")
      return
    }

    if (decision.factors.length === 0) {
      onNotification("Please add at least one factor", "error")
      return
    }

    setIsSaving(true)

    try {
      let savedDecision: Decision | null = null

      if (editMode && decision.id) {
        savedDecision = await updateDecisionAPI(decision.id, decision)
        onNotification("Decision updated successfully!", "success")
      } else {
        const { id, createdAt, updatedAt, ...decisionData } = decision
        savedDecision = await createDecision(decisionData)
        onNotification("Decision saved successfully!", "success")
      }

      if (savedDecision && onSaveSuccess) {
        onSaveSuccess(savedDecision)
      }
    } catch (error) {
      onNotification("Failed to save decision. Please try again.", "error")
      console.error("Save decision error:", error)
    } finally {
      setIsSaving(false)
    }
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
    <Card className="glassmorphism-strong border-slate-700/50 hover-lift animate-float-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
            <Brain className="h-5 w-5 text-white" />
          </div>
          Decision Input
          <Button
            variant="ghost"
            size="sm"
            onClick={generateAISuggestions}
            className="ml-auto hover:scale-105 transition-all bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white border-purple-500/30"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            AI Assist
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 backdrop-blur-sm animate-float-up">
            <h4 className="text-sm font-medium mb-2 flex items-center text-white">
              <Sparkles className="h-4 w-4 mr-1 text-blue-400" />
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
                  className="block w-full text-left text-xs p-2 rounded hover:bg-slate-700/50 transition-all hover:scale-[1.02] text-slate-300 hover:text-white"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Decision Question */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Decision Question</label>
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
            <label className="text-sm font-medium text-slate-200">Context</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              className={`hover:scale-105 transition-all ${isListening ? "text-red-400 animate-pulse bg-red-500/20" : "text-slate-300 hover:text-white hover:bg-slate-700/50"}`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isListening ? "Stop" : "Voice"}
            </Button>
          </div>
          <Textarea
            value={decision.description}
            onChange={(e) => updateDecision({ description: e.target.value })}
            placeholder="Provide additional context about your decision..."
            className="glassmorphism min-h-[100px] hover:scale-[1.01] transition-transform focus:scale-[1.01] bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>

        {/* Emotional Context Section */}
        <div className="space-y-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-400" />
            <label className="text-sm font-medium text-white">How Are You Feeling About This Decision?</label>
          </div>
          <p className="text-xs text-slate-400">
            Understanding your emotional state helps us provide better guidance and reduces decision stress.
          </p>
          
          <div className="grid gap-4">
            {/* Confidence Level */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-slate-200">Confidence Level</span>
                </div>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {decision.emotionalContext?.confidenceLevel || 5}/10
                </Badge>
              </div>
              <Slider
                value={[decision.emotionalContext?.confidenceLevel || 5]}
                onValueChange={([value]) => updateDecision({
                  emotionalContext: {
                    ...decision.emotionalContext,
                    confidenceLevel: value,
                    urgencyRating: decision.emotionalContext?.urgencyRating || 5,
                    initialStressLevel: decision.emotionalContext?.initialStressLevel || 5
                  }
                })}
                max={10}
                min={1}
                step={1}
                className="w-full hover:scale-[1.02] transition-transform"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Very Uncertain</span>
                <span>Very Confident</span>
              </div>
            </div>

            {/* Urgency Rating */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-medium text-slate-200">Time Pressure</span>
                </div>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  {decision.emotionalContext?.urgencyRating || 5}/10
                </Badge>
              </div>
              <Slider
                value={[decision.emotionalContext?.urgencyRating || 5]}
                onValueChange={([value]) => updateDecision({
                  emotionalContext: {
                    ...decision.emotionalContext,
                    urgencyRating: value,
                    confidenceLevel: decision.emotionalContext?.confidenceLevel || 5,
                    initialStressLevel: decision.emotionalContext?.initialStressLevel || 5
                  }
                })}
                max={10}
                min={1}
                step={1}
                className="w-full hover:scale-[1.02] transition-transform"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>No Rush</span>
                <span>Very Urgent</span>
              </div>
            </div>

            {/* Stress Level */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-medium">Stress Level</span>
                </div>
                <Badge variant="secondary" className="animate-pulse">
                  {decision.emotionalContext?.initialStressLevel || 5}/10
                </Badge>
              </div>
              <Slider
                value={[decision.emotionalContext?.initialStressLevel || 5]}
                onValueChange={([value]) => updateDecision({
                  emotionalContext: {
                    ...decision.emotionalContext,
                    initialStressLevel: value,
                    confidenceLevel: decision.emotionalContext?.confidenceLevel || 5,
                    urgencyRating: decision.emotionalContext?.urgencyRating || 5
                  }
                })}
                max={10}
                min={1}
                step={1}
                className="w-full hover:scale-[1.02] transition-transform"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Very Calm</span>
                <span>Very Stressed</span>
              </div>
            </div>

            {/* Emotional Insight */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/50">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Heart className="h-4 w-4 mr-1 text-red-400" />
                Emotional Insight
              </h4>
              <p className="text-xs text-muted-foreground">
                {(() => {
                  const confidence = decision.emotionalContext?.confidenceLevel || 5;
                  const urgency = decision.emotionalContext?.urgencyRating || 5;
                  const stress = decision.emotionalContext?.initialStressLevel || 5;
                  
                  if (stress >= 7 && urgency >= 7) {
                    return "High stress + urgency detected. Consider taking time to calm down before deciding.";
                  } else if (confidence <= 3 && urgency <= 3) {
                    return "Low confidence detected. Consider gathering more information or talking to someone you trust.";
                  } else if (confidence >= 7 && stress <= 3) {
                    return "Great emotional state for decision making! You seem calm and confident.";
                  } else {
                    return "Understanding your emotional state helps create better decision strategies.";
                  }
                })()}
              </p>
            </div>
          </div>
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

              {/* Enhanced Factor Properties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Importance Weight */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Importance
                    </span>
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

                {/* Uncertainty Level */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Uncertainty
                    </span>
                    <Badge variant="outline" className="text-orange-600">
                      {factor.uncertainty || 50}%
                    </Badge>
                  </div>
                  <Slider
                    value={[factor.uncertainty || 50]}
                    onValueChange={([value]) => updateFactor(factor.id, { uncertainty: value })}
                    max={100}
                    step={5}
                    className="w-full hover:scale-[1.02] transition-transform"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Very Certain</span>
                    <span>Very Uncertain</span>
                  </div>
                </div>

                {/* Emotional Weight */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      Emotional Impact
                    </span>
                    <Badge variant="outline" className="text-red-600">
                      {factor.emotionalWeight || 50}%
                    </Badge>
                  </div>
                  <Slider
                    value={[factor.emotionalWeight || 50]}
                    onValueChange={([value]) => updateFactor(factor.id, { emotionalWeight: value })}
                    max={100}
                    step={5}
                    className="w-full hover:scale-[1.02] transition-transform"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Purely Logical</span>
                    <span>Highly Emotional</span>
                  </div>
                </div>

                {/* Regret Potential */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      Regret Risk
                    </span>
                    <Badge variant="outline" className="text-purple-600">
                      {factor.regretPotential || 50}%
                    </Badge>
                  </div>
                  <Slider
                    value={[factor.regretPotential || 50]}
                    onValueChange={([value]) => updateFactor(factor.id, { regretPotential: value })}
                    max={100}
                    step={5}
                    className="w-full hover:scale-[1.02] transition-transform"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>No Regret Risk</span>
                    <span>High Regret Risk</span>
                  </div>
                </div>
              </div>

              {/* Time Horizon */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">When will this matter most?</span>
                </div>
                <Select
                  value={factor.timeHorizon || "medium"}
                  onValueChange={(value: "immediate" | "short" | "medium" | "long") => 
                    updateFactor(factor.id, { timeHorizon: value })
                  }
                >
                  <SelectTrigger className="glassmorphism">
                    <SelectValue placeholder="Select time horizon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate (days)</SelectItem>
                    <SelectItem value="short">Short-term (weeks)</SelectItem>
                    <SelectItem value="medium">Medium-term (months)</SelectItem>
                    <SelectItem value="long">Long-term (years)</SelectItem>
                  </SelectContent>
                </Select>
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

        {/* Save Decision Button */}
        <Button
          className="w-full gradient-success text-white border-0 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          size="lg"
          onClick={handleSaveDecision}
          disabled={isSaving || !decision.title || decision.factors.length === 0}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {editMode ? "Updating..." : "Saving..."}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {editMode ? "Update Decision" : "Save Decision"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
