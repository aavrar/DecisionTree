"use client"

import { useState, useEffect } from "react"
import { StickyNote, Save } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface MemoPadProps {
  decisionId: string
  initialNotes?: string
  onSave?: (notes: string) => void
}

export function MemoPad({ decisionId, initialNotes = "", onSave }: MemoPadProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    setNotes(initialNotes)
  }, [initialNotes])

  const handleSave = () => {
    setIsSaving(true)
    if (onSave) {
      onSave(notes)
    }
    setLastSaved(new Date())
    setTimeout(() => setIsSaving(false), 500)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const memoNumber = decisionId.slice(-6).toUpperCase()

  return (
    <div className="bg-white border-2 border-yellow-400 rounded-lg shadow-lg p-4 w-80">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-yellow-300">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-bold text-gray-900">Memo Pad</h3>
            <p className="text-xs text-gray-500">#{memoNumber}</p>
          </div>
        </div>
        {lastSaved && (
          <div className="text-xs text-gray-400">
            {formatDate(lastSaved)}
          </div>
        )}
      </div>

      {/* Notes Area */}
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add your notes here..."
        className="min-h-[200px] bg-yellow-50 border-yellow-200 text-gray-900 placeholder:text-gray-400 resize-none focus:border-yellow-400"
      />

      {/* Save Button */}
      <div className="mt-3 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-yellow-500 hover:bg-yellow-600 text-white gap-2"
          size="sm"
        >
          <Save className="w-3 h-3" />
          {isSaving ? "Saving..." : "Save Notes"}
        </Button>
      </div>

      {/* Auto-save indicator */}
      {lastSaved && (
        <div className="mt-2 text-xs text-center text-gray-400">
          Last saved: {formatDate(lastSaved)}
        </div>
      )}
    </div>
  )
}
