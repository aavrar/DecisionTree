"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import type { Decision } from "@/types/decision"

interface DeleteDecisionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  decision: Decision | null
  onConfirm: () => void
}

export function DeleteDecisionDialog({ open, onOpenChange, decision, onConfirm }: DeleteDecisionDialogProps) {
  if (!decision) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-black border border-red-500/30">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-xl">Delete Decision?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            This action cannot be undone. This will permanently delete your decision.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Preview of what's being deleted */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 my-2">
          <div className="text-white font-semibold mb-2">
            {decision.title || "Untitled Decision"}
          </div>
          {decision.description && (
            <p className="text-gray-400 text-sm mb-2 line-clamp-2">{decision.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{decision.factors?.length || 0} factors</span>
            <span className="px-2 py-0.5 rounded bg-gray-500/20 text-gray-400">
              {decision.status}
            </span>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white/5 border-white/20 text-white hover:bg-white/10">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete Decision
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
