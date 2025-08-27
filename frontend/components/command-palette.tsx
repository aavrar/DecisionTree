"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, Zap, BarChart3, Settings, Plus } from "lucide-react"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCommand: (command: string) => void
}

export function CommandPalette({ open, onOpenChange, onCommand }: CommandPaletteProps) {
  const [query, setQuery] = useState("")

  const commands = [
    { id: "new-decision", label: "Create New Decision", icon: Plus, shortcut: "⌘N" },
    { id: "analytics", label: "View Analytics", icon: BarChart3, shortcut: "⌘A" },
    { id: "ai-suggest", label: "AI Suggestions", icon: Zap, shortcut: "⌘I" },
    { id: "settings", label: "Settings", icon: Settings, shortcut: "⌘," },
  ]

  const filteredCommands = commands.filter((cmd) => cmd.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg glassmorphism border-0">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="border-0 focus-visible:ring-0 h-12"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.map((command) => {
            const Icon = command.icon
            return (
              <button
                key={command.id}
                onClick={() => onCommand(command.label)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="flex items-center">
                  <Icon className="mr-2 h-4 w-4" />
                  {command.label}
                </div>
                <span className="text-xs text-muted-foreground">{command.shortcut}</span>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
