"use client"

import { X, Layers, Target, CheckCircle, Archive, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-black border border-white/20 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">How to Use Branches</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white h-8 w-8 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Introduction */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Lego-Style Decision Building</h3>
            <p className="text-gray-300 text-sm">
              Branches uses a flexible, build-as-you-go approach. Start simple and expand your decision tree by adding nodes (factors, outcomes, considerations) wherever needed. Think of it like building with Lego blocks - add pieces as your decision becomes clearer.
            </p>
          </div>

          {/* Feature 1: Decision Workflow */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg mt-1">
                <Layers className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">Three-Stage Decision Workflow</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li><span className="text-yellow-400 font-medium">Draft:</span> Build your decision tree freely. Add, edit, or delete nodes.</li>
                  <li><span className="text-green-400 font-medium">Active:</span> Mark factors as "Yes" or "No" to choose your path. Selecting "Yes" on one option auto-selects "No" on siblings.</li>
                  <li><span className="text-blue-400 font-medium">Complete:</span> Lock your decision as read-only. View it anytime in the Complete Branches section.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 2: Building Your Tree */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg mt-1">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">Building Your Decision Tree</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>Click any node to edit details: name, type, category, weight, and notes</li>
                  <li>Use the <span className="font-medium">Add Node</span> button to add child nodes under selected nodes</li>
                  <li>Double-click a node on the canvas to quickly add a child</li>
                  <li>Each node can have unlimited children - build as deep as needed</li>
                  <li>Weights auto-normalize among siblings to total 100%</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 3: AI Analysis */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-purple-500/20 p-2 rounded-lg mt-1">
                <CheckCircle className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">AI-Powered Analysis</h4>
                <p className="text-gray-300 text-sm">
                  Click <span className="font-medium text-purple-400">AI Analysis</span> to get insights on your decision. The AI considers all factors, weights, emotional context, and even location addresses if you've added them.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 4: Managing Decisions */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-orange-500/20 p-2 rounded-lg mt-1">
                <Archive className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">Managing Decisions</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>Click the <span className="font-medium">⋮</span> menu on any decision for options</li>
                  <li><span className="font-medium text-blue-400">Duplicate:</span> Create a copy to explore different scenarios</li>
                  <li><span className="font-medium text-white">Archive:</span> Store old decisions (auto-deleted after 7 days)</li>
                  <li><span className="font-medium text-red-400">Delete:</span> Permanently remove a decision</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Quick Tips</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Start with templates for common decisions (education, career, etc.)</li>
              <li>• Use pan/zoom on the tree canvas (scroll to zoom, drag to pan)</li>
              <li>• Toggle between 2D and 3D views for different perspectives</li>
              <li>• Add location addresses to factors for AI to consider proximity</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <Button
            onClick={onClose}
            className="w-full bg-white text-black hover:bg-gray-200 font-semibold"
          >
            Got it, thanks!
          </Button>
        </div>
      </div>
    </div>
  )
}
