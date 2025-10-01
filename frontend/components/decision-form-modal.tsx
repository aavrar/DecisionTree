"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DecisionForm } from "@/components/decision-form"
import type { Decision } from "@/types/decision"

interface DecisionFormModalProps {
  isOpen: boolean
  onClose: () => void
  decision: Decision
  onSave: (decision: Decision) => void
}

export function DecisionFormModal({ isOpen, onClose, decision, onSave }: DecisionFormModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-2 border-white/20 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black border-b border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {decision.id ? "Edit Decision" : "New Decision"}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Define your decision and add factors to consider
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <DecisionForm
            decision={decision}
            onChange={onSave}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-black border-t border-white/20 p-4 flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={onClose}
            className="bg-white text-black font-semibold hover:bg-gray-200"
          >
            Save & Close
          </Button>
        </div>
      </div>
    </div>
  )
}
