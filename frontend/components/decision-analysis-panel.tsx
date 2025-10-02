"use client"

import { useState } from "react"
import { X, TrendingUp, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Brain, Target, Timer, Scale, ThumbsUp, ThumbsDown, HelpCircle, RotateCcw, Lightbulb, List, XCircle } from "lucide-react"
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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'proceed': return <ThumbsUp className="h-8 w-8 text-green-400" />
      case 'dont_proceed': return <ThumbsDown className="h-8 w-8 text-red-400" />
      case 'needs_more_info': return <HelpCircle className="h-8 w-8 text-yellow-400" />
      case 'reconsider': return <RotateCcw className="h-8 w-8 text-orange-400" />
      default: return <Brain className="h-8 w-8 text-purple-400" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'proceed': return 'border-green-500/50 bg-green-500/10'
      case 'dont_proceed': return 'border-red-500/50 bg-red-500/10'
      case 'needs_more_info': return 'border-yellow-500/50 bg-yellow-500/10'
      case 'reconsider': return 'border-orange-500/50 bg-orange-500/10'
      default: return 'border-purple-500/50 bg-purple-500/10'
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-2 border-white/20 rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-black border-b border-white/10 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">Decision Analysis</h2>
              {analysis.aiUnavailable && (
                <p className="text-sm text-gray-400">Showing algorithmic analysis (AI temporarily unavailable)</p>
              )}
              {analysis.cached && !analysis.aiUnavailable && (
                <p className="text-sm text-gray-400">Cached result - instant delivery</p>
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

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">AI Confidence</span>
              <div className="text-2xl font-bold text-white">{analysis.recommendation.quantitativeScore.confidence}%</div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${analysis.recommendation.quantitativeScore.confidence}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-400">Decision Score</span>
              <div className="text-2xl font-bold text-white">{analysis.recommendation.quantitativeScore.decisionScore}/100</div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-400">Risk Level</span>
              <div className={`text-xl font-bold ${getRiskColor(analysis.analysis.riskLevel)}`}>
                {analysis.analysis.riskLevel.toUpperCase()}
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-400">Algo Score</span>
              <div className="text-xl font-bold text-white">
                {analysis.analysis.overallScore.toFixed(1)}/100
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Clear Recommendation Section */}
          <div className={`p-6 rounded-xl border-2 ${getActionColor(analysis.recommendation.clearRecommendation.action)}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getActionIcon(analysis.recommendation.clearRecommendation.action)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-white">Clear Recommendation</h3>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white uppercase">
                    {analysis.recommendation.clearRecommendation.action.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xl text-white font-medium mb-3 leading-relaxed">
                  {analysis.recommendation.clearRecommendation.statement}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Target className="h-4 w-4" />
                  <span>Key Factor: <span className="text-white font-medium">{analysis.recommendation.clearRecommendation.topFactor}</span></span>
                </div>
                {analysis.recommendation.quantitativeScore.topOptionName && (
                  <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Recommended Option:</span>
                      <span className="text-white font-semibold">{analysis.recommendation.quantitativeScore.topOptionName}</span>
                    </div>
                    {analysis.recommendation.quantitativeScore.topOptionScore && (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-400 text-sm">Option Score:</span>
                        <span className="text-green-400 font-semibold">{analysis.recommendation.quantitativeScore.topOptionScore}/100</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Supporting Explanation */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <div className="flex items-start gap-3">
              <Brain className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Why This Recommendation</h3>
                <p className="text-gray-300 leading-relaxed">{analysis.recommendation.recommendation}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-xl border border-green-500/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-3">Key Reasons</h3>
                <ul className="space-y-2">
                  {analysis.recommendation.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-400 flex-shrink-0 mt-1">•</span>
                      <span className="text-gray-300">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          {analysis.recommendation.nextSteps && analysis.recommendation.nextSteps.length > 0 && (
            <div className="bg-white/5 p-6 rounded-xl border border-blue-500/30">
              <div className="flex items-start gap-3">
                <List className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3">Next Steps</h3>
                  <ol className="space-y-2">
                    {analysis.recommendation.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-300 flex-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Deal Breakers */}
          {analysis.recommendation.dealBreakers && analysis.recommendation.dealBreakers.length > 0 && (
            <div className="bg-white/5 p-6 rounded-xl border border-red-500/30">
              <div className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3">Critical Issues (Deal Breakers)</h3>
                  <ul className="space-y-2">
                    {analysis.recommendation.dealBreakers.map((dealBreaker, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-400 flex-shrink-0 mt-1">⚠</span>
                        <span className="text-gray-300">{dealBreaker}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Missing Info */}
          {analysis.recommendation.missingInfo && analysis.recommendation.missingInfo.length > 0 && (
            <div className="bg-white/5 p-6 rounded-xl border border-yellow-500/30">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3">What's Missing</h3>
                  <ul className="space-y-2">
                    {analysis.recommendation.missingInfo.map((info, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-400 flex-shrink-0 mt-1">•</span>
                        <span className="text-gray-300">{info}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {analysis.recommendation.warnings.length > 0 && (
            <div className={`bg-white/5 p-6 rounded-xl border ${getRiskBg(analysis.analysis.riskLevel)}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-6 w-6 ${getRiskColor(analysis.analysis.riskLevel)} flex-shrink-0 mt-1`} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3">Important Considerations</h3>
                  <ul className="space-y-2">
                    {analysis.recommendation.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className={`${getRiskColor(analysis.analysis.riskLevel)} flex-shrink-0 mt-1`}>•</span>
                        <span className="text-gray-300">{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {analysis.recommendation.alternatives.length > 0 && (
            <div className="bg-white/5 p-6 rounded-xl border border-purple-500/30">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3">Alternative Approaches</h3>
                  <ul className="space-y-2">
                    {analysis.recommendation.alternatives.map((alt, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-400 flex-shrink-0 mt-1">•</span>
                        <span className="text-gray-300">{alt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <button
              onClick={() => toggleSection('insights')}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold text-white">Deep Insights</h3>
              {expandedSection === 'insights' ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {expandedSection === 'insights' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    <span className="font-medium text-white">Emotional Alignment</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    {analysis.analysis.insights.emotionalAlignment}%
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all"
                      style={{ width: `${analysis.analysis.insights.emotionalAlignment}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="h-5 w-5 text-purple-400" />
                    <span className="font-medium text-white">Time-Value Score</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-400">
                    {analysis.analysis.insights.timeValueScore}%
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-purple-400 rounded-full transition-all"
                      style={{ width: `${analysis.analysis.insights.timeValueScore}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="h-5 w-5 text-green-400" />
                    <span className="font-medium text-white">Category Balance</span>
                  </div>
                  <div className="space-y-1 mt-2">
                    {Object.entries(analysis.analysis.insights.categoryBalance).map(([category, count]) => (
                      <div key={category} className="flex justify-between text-sm">
                        <span className="text-gray-400 capitalize">{category}</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-yellow-400" />
                    <span className="font-medium text-white">Complexity Score</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {analysis.analysis.insights.complexityScore}/100
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
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
            <div className="bg-white/5 p-6 rounded-xl border border-orange-500/30">
              <h3 className="text-lg font-semibold text-white mb-3">Potential Cognitive Biases</h3>
              <div className="space-y-2">
                {analysis.analysis.insights.biasFlags.map((bias, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
                    <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-orange-300 capitalize">{bias.type.replace('_', ' ')}</div>
                      <div className="text-sm text-gray-300">{bias.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Analysis completed in {analysis.analysis.metadata.processingTime}ms</span>
              <span>{analysis.analysis.metadata.totalFactors} factors, {analysis.analysis.metadata.totalNodes} total nodes</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-black p-4 border-t border-white/10 rounded-b-2xl">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            Close Analysis
          </Button>
        </div>
      </div>
    </div>
  )
}
