"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import type { TreeNodeData } from "@/types/decision"
import { useState, useEffect } from "react"

interface NodeDetailsPanelProps {
  node: TreeNodeData | null
  onClose: () => void
  onUpdate: (nodeId: string, updates: Partial<TreeNodeData>) => void
}

export function NodeDetailsPanel({ node, onClose, onUpdate }: NodeDetailsPanelProps) {
  const [localName, setLocalName] = useState("")
  const [localDescription, setLocalDescription] = useState("")
  const [localNotes, setLocalNotes] = useState("")
  const [localType, setLocalType] = useState<"outcome" | "consequence" | "option" | "consideration">("outcome")
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const [importance, setImportance] = useState(50)
  const [emotionalWeight, setEmotionalWeight] = useState(50)
  const [uncertainty, setUncertainty] = useState(50)
  const [regretPotential, setRegretPotential] = useState(50)

  useEffect(() => {
    if (node) {
      setLocalName(node.name || "")
      setLocalDescription(node.description || "")
      setLocalNotes(node.notes || "")
      setLocalType(node.type)
      setImportance(node.importance ?? 50)
      setEmotionalWeight(node.emotionalWeight ?? 50)
      setUncertainty(node.uncertainty ?? 50)
      setRegretPotential(node.regretPotential ?? 50)
    }
  }, [node])

  if (!node) return null

  const handleSave = () => {
    onUpdate(node.id, {
      name: localName,
      description: localDescription,
      notes: localNotes,
      type: localType,
      importance,
      emotionalWeight,
      uncertainty,
      regretPotential,
    })
    onClose()
  }

  const nodeTypes: Array<"outcome" | "consequence" | "option" | "consideration"> = [
    "outcome",
    "consequence",
    "option",
    "consideration"
  ]

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "outcome":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30"
      case "consequence":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30"
      case "option":
        return "bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30"
      case "consideration":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30 hover:bg-gray-500/30"
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-black border-l border-white/20 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">Node Details</h2>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Node Type */}
        <div className="relative">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Type</label>
          <button
            onClick={() => setShowTypeMenu(!showTypeMenu)}
            className={`mt-2 px-3 py-2 rounded-lg border transition-all cursor-pointer ${getTypeStyles(localType)}`}
          >
            {localType}
          </button>

          {/* Type Dropdown Menu */}
          {showTypeMenu && (
            <div className="absolute top-full mt-2 bg-black border border-white/20 rounded-lg shadow-xl z-10 overflow-hidden">
              {nodeTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setLocalType(type)
                    setShowTypeMenu(false)
                  }}
                  className={`w-full px-4 py-2 text-left transition-all ${getTypeStyles(type)} ${
                    localType === type ? 'font-semibold' : ''
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Node Name */}
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Name</label>
          <Input
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            className="mt-2 bg-white/5 border-white/20 text-white"
            placeholder="Enter node name"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Description</label>
          <Textarea
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            className="mt-2 bg-white/5 border-white/20 text-white min-h-[100px]"
            placeholder="Enter description"
          />
        </div>

        {/* CCS Score (if available) */}
        {node.ccs !== undefined && (
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              CCS (Choice Consequence Score)
            </label>
            <div className="mt-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="text-2xl font-bold text-white">{node.ccs}</div>
            </div>
          </div>
        )}

        {/* Weight (if available) */}
        {node.weight !== undefined && (
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Weight</label>
            <div className="mt-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="text-xl font-semibold text-white">{node.weight}%</div>
            </div>
          </div>
        )}

        {/* Importance Slider */}
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 block">
            Importance
          </label>
          <div className="flex items-center gap-4">
            <Slider
              value={[importance]}
              onValueChange={(value) => setImportance(value[0])}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <div className="text-white font-semibold w-12 text-right">{importance}</div>
          </div>
        </div>

        {/* Emotional Weight Slider */}
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 block">
            Emotional Weight
          </label>
          <div className="flex items-center gap-4">
            <Slider
              value={[emotionalWeight]}
              onValueChange={(value) => setEmotionalWeight(value[0])}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <div className="text-white font-semibold w-12 text-right">{emotionalWeight}</div>
          </div>
        </div>

        {/* Uncertainty Slider */}
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 block">
            Uncertainty
          </label>
          <div className="flex items-center gap-4">
            <Slider
              value={[uncertainty]}
              onValueChange={(value) => setUncertainty(value[0])}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <div className="text-white font-semibold w-12 text-right">{uncertainty}</div>
          </div>
        </div>

        {/* Regret Potential Slider */}
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 block">
            Regret Potential
          </label>
          <div className="flex items-center gap-4">
            <Slider
              value={[regretPotential]}
              onValueChange={(value) => setRegretPotential(value[0])}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <div className="text-white font-semibold w-12 text-right">{regretPotential}</div>
          </div>
        </div>

        {/* Notes Section */}
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Notes</label>
          <Textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            className="mt-2 bg-white/5 border-white/20 text-white min-h-[120px]"
            placeholder="Add your notes here..."
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 flex gap-3">
        <Button
          onClick={handleSave}
          className="flex-1 bg-white text-black hover:bg-gray-200 font-semibold"
        >
          Save Changes
        </Button>
        <Button
          onClick={onClose}
          variant="outline"
          className="border-white/30 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
