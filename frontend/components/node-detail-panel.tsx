"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Save, TrendingUp, AlertTriangle, Heart, Brain, Timer } from 'lucide-react'
import type { DecisionTreeNode, Factor } from '@/types/decision'

interface NodeDetailPanelProps {
  node: DecisionTreeNode | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: (factor: Factor) => void
}

export function NodeDetailPanel({ node, isOpen, onClose, onUpdate }: NodeDetailPanelProps) {
  const [editedFactor, setEditedFactor] = useState<Factor | null>(null)

  React.useEffect(() => {
    if (node?.factor) {
      setEditedFactor({ ...node.factor })
    }
  }, [node])

  if (!isOpen || !node) return null

  const isDecisionNode = node.type === 'decision'
  const factor = editedFactor || node.factor

  const handleSave = () => {
    if (editedFactor && onUpdate) {
      onUpdate(editedFactor)
      onClose()
    }
  }

  const handleCancel = () => {
    setEditedFactor(node.factor ? { ...node.factor } : null)
    onClose()
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "financial": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "personal": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "career": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      case "health": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-[500px] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <Card className="h-full overflow-y-auto border-0 rounded-none">
          <CardHeader className="sticky top-0 bg-white dark:bg-gray-900 border-b z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                {isDecisionNode ? (
                  <>
                    <Brain className="h-5 w-5 text-primary" />
                    Decision Details
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Factor Details
                  </>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {isDecisionNode ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {node.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    This is the central decision node. All factors connect to this decision point.
                  </p>
                </div>
              </div>
            ) : factor ? (
              <div className="space-y-6">
                {/* Factor Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Factor Name</label>
                  <Input
                    value={editedFactor?.name || ''}
                    onChange={(e) => setEditedFactor(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="glassmorphism"
                  />
                </div>

                {/* Category Badge */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Badge className={`${getCategoryColor(factor.category)} text-sm px-3 py-1`}>
                    {factor.category}
                  </Badge>
                </div>

                {/* Importance Weight */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium">Importance</span>
                    </div>
                    <Badge variant="secondary" className="animate-pulse">
                      {editedFactor?.weight || 0}%
                    </Badge>
                  </div>
                  <Slider
                    value={[editedFactor?.weight || 0]}
                    onValueChange={([value]) => setEditedFactor(prev => prev ? { ...prev, weight: value } : null)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" />
                </div>

                {/* Uncertainty Level */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium">Uncertainty</span>
                    </div>
                    <Badge variant="outline" className="text-orange-600">
                      {editedFactor?.uncertainty || 50}%
                    </Badge>
                  </div>
                  <Slider
                    value={[editedFactor?.uncertainty || 50]}
                    onValueChange={([value]) => setEditedFactor(prev => prev ? { ...prev, uncertainty: value } : null)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Very Certain</span>
                    <span>Very Uncertain</span>
                  </div>
                </div>

                {/* Emotional Weight */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium">Emotional Impact</span>
                    </div>
                    <Badge variant="outline" className="text-red-600">
                      {editedFactor?.emotionalWeight || 50}%
                    </Badge>
                  </div>
                  <Slider
                    value={[editedFactor?.emotionalWeight || 50]}
                    onValueChange={([value]) => setEditedFactor(prev => prev ? { ...prev, emotionalWeight: value } : null)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Purely Logical</span>
                    <span>Highly Emotional</span>
                  </div>
                </div>

                {/* Regret Potential */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium">Regret Risk</span>
                    </div>
                    <Badge variant="outline" className="text-purple-600">
                      {editedFactor?.regretPotential || 50}%
                    </Badge>
                  </div>
                  <Slider
                    value={[editedFactor?.regretPotential || 50]}
                    onValueChange={([value]) => setEditedFactor(prev => prev ? { ...prev, regretPotential: value } : null)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>No Regret Risk</span>
                    <span>High Regret Risk</span>
                  </div>
                </div>

                {/* Time Horizon */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium">Time Horizon</span>
                  </div>
                  <Select
                    value={editedFactor?.timeHorizon || "medium"}
                    onValueChange={(value: "immediate" | "short" | "medium" | "long") =>
                      setEditedFactor(prev => prev ? { ...prev, timeHorizon: value } : null)
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

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    className="flex-1 gradient-success text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
