"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { decisionTemplates, type DecisionTemplate } from "@/lib/decision-templates"
import { useState } from "react"

interface TemplateSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: DecisionTemplate) => void
}

export function TemplateSelectionModal({
  isOpen,
  onClose,
  onSelectTemplate
}: TemplateSelectionModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "simple" | "moderate" | "complex">("all")

  console.log('TemplateSelectionModal render, isOpen:', isOpen)

  if (!isOpen) return null

  const filteredTemplates = selectedCategory === "all"
    ? decisionTemplates
    : decisionTemplates.filter(t => t.category === selectedCategory)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "simple": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "moderate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "complex": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-2 border-white/20 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black border-b border-white/10 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Choose a Template</h2>
              <p className="text-sm text-gray-400">Start with a pre-built decision framework or create from scratch</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Category Filter */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-white text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              All Templates
            </button>
            <button
              onClick={() => setSelectedCategory("simple")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "simple"
                  ? "bg-green-500 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setSelectedCategory("moderate")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "moderate"
                  ? "bg-yellow-500 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Moderate
            </button>
            <button
              onClick={() => setSelectedCategory("complex")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === "complex"
                  ? "bg-purple-500 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Complex
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className="text-left p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(template.category)}`}>
                  {template.category}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                {template.name}
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                {template.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{template.template.factors.length} factors</span>
                <span>•</span>
                <span>
                  {template.template.factors.reduce(
                    (sum, f) => sum + (f.children?.length || 0),
                    0
                  )}{" "}
                  nodes
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
