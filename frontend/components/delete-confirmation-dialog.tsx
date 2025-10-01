"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  nodeName: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmationDialog({
  isOpen,
  nodeName,
  onConfirm,
  onCancel,
}: DeleteConfirmationDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-black border-2 border-red-500/30 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl shadow-red-500/20">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white text-center mb-2">
          Delete Node?
        </h2>

        {/* Message */}
        <p className="text-gray-400 text-center mb-6">
          Are you sure you want to delete <span className="text-white font-semibold">"{nodeName}"</span> and all its children? This action cannot be undone.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-white/30 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
