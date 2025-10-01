"use client"

import { useState } from "react"
import { X, TrendingUp, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Brain, Target, Timer, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AnalysisData } from "@/hooks/useDecisionAnalysis"

interface DecisionAnalysisPanelProps {
  analysis: AnalysisData
  onClose: () => void
}

export function DecisionAnalysisPanel({ analysis, onClose }: DecisionAnalysisPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getRiskBg = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/20 border-green-500/50'
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50'
      case 'high': return 'bg-red-500/20 border-red-500/50'
      default: return 'bg-gray-500/20 border-gray-500/50'
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-2 border-blue-500/30 rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Decision Analysis</h2>
              {analysis.aiUnavailable && (
                <p className="text-sm text-blue-100">Showing algorithmic analysis (AI temporarily unavailable)</p>
              )}
              {analysis.cached && !analysis.aiUnavailable && (
                <p className="text-sm text-blue-100">Cached result - instant delivery</p>
              )}
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

          <div className="mt-4 flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-blue-100">Confidence</span>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-white">{analysis.analysis.confidence}%</div>
                <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${analysis.analysis.confidence}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-blue-100">Risk Level</span>
              <div className={`text-xl font-bold ${getRiskColor(analysis.analysis.riskLevel)}`}>
                {analysis.analysis.riskLevel.toUpperCase()}
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-blue-100">Overall Score</span>
              <div className="text-xl font-bold text-white">
                {analysis.analysis.overallScore.toFixed(1)}/100
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="glassmorphic p-6 rounded-xl border border-blue-500/30">
            <div className="flex items-start gap-3">
              <Brain className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Recommendation</h3>
                <p className="text-slate-300 leading-relaxed">{analysis.recommendation.recommendation}</p>
              </div>
            </div>
          </div>

          <div className="glassmorphic p-6 rounded-xl border border-green-500/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-3">Key Reasons</h3>
                <ul className="space-y-2">
                  {analysis.recommendation.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-400 flex-shrink-0 mt-1">•</span>
                      <span className="text-slate-300">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {analysis.recommendation.warnings.length > 0 && (
            <div className={`glassmorphic p-6 rounded-xl border ${getRiskBg(analysis.analysis.riskLevel)}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-6 w-6 ${getRiskColor(analysis.analysis.riskLevel)} flex-shrink-0 mt-1`} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3">Important Considerations</h3>
                  <ul className="space-y-2">
                    {analysis.recommendation.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className={`${getRiskColor(analysis.analysis.riskLevel)} flex-shrink-0 mt-1`}>•</span>
                        <span className="text-slate-300">{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {analysis.recommendation.alternatives.length > 0 && (
            <div className="glassmorphic p-6 rounded-xl border border-purple-500/30">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3">Alternative Approaches</h3>
                  <ul className="space-y-2">
                    {analysis.recommendation.alternatives.map((alt, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-400 flex-shrink-0 mt-1">•</span>
                        <span className="text-slate-300">{alt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="glassmorphic p-6 rounded-xl border border-blue-500/30">
            <button
              onClick={() => toggleSection('insights')}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold text-white">Deep Insights</h3>
              {expandedSection === 'insights' ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </button>

            {expandedSection === 'insights' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    <span className="font-medium text-white">Emotional Alignment</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    {analysis.analysis.insights.emotionalAlignment}%
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all"
                      style={{ width: `${analysis.analysis.insights.emotionalAlignment}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="h-5 w-5 text-purple-400" />
                    <span className="font-medium text-white">Time-Value Score</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-400">
                    {analysis.analysis.insights.timeValueScore}%
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-purple-400 rounded-full transition-all"
                      style={{ width: `${analysis.analysis.insights.timeValueScore}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="h-5 w-5 text-green-400" />
                    <span className="font-medium text-white">Category Balance</span>
                  </div>
                  <div className="space-y-1 mt-2">
                    {Object.entries(analysis.analysis.insights.categoryBalance).map(([category, count]) => (
                      <div key={category} className="flex justify-between text-sm">
                        <span className="text-slate-400 capitalize">{category}</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-yellow-400" />
                    <span className="font-medium text-white">Complexity Score</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {analysis.analysis.insights.complexityScore}/100
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${analysis.analysis.insights.complexityScore}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {analysis.analysis.insights.biasFlags.length > 0 && (
            <div className="glassmorphic p-6 rounded-xl border border-orange-500/30">
              <h3 className="text-lg font-semibold text-white mb-3">Potential Cognitive Biases</h3>
              <div className="space-y-2">
                {analysis.analysis.insights.biasFlags.map((bias, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
                    <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-orange-300 capitalize">{bias.type.replace('_', ' ')}</div>
                      <div className="text-sm text-slate-300">{bias.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glassmorphic p-4 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Analysis completed in {analysis.analysis.metadata.processingTime}ms</span>
              <span>{analysis.analysis.metadata.totalFactors} factors, {analysis.analysis.metadata.totalNodes} total nodes</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-900/95 p-4 border-t border-slate-700 rounded-b-2xl">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            Close Analysis
          </Button>
        </div>
      </div>
    </div>
  )
}
