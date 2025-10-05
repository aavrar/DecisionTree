import { useState } from 'react';
import type { Decision } from '@/types/decision';

export interface BiasFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface AnalysisResult {
  overallScore: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendedFactorIds: string[];
  warnings: string[];
  insights: {
    emotionalAlignment: number;
    timeValueScore: number;
    categoryBalance: Record<string, number>;
    complexityScore: number;
    biasFlags: BiasFlag[];
  };
  metadata: {
    analyzedAt: string;
    totalFactors: number;
    totalNodes: number;
    processingTime: number;
  };
}

export interface GeminiRecommendation {
  clearRecommendation: {
    action: 'proceed' | 'dont_proceed' | 'needs_more_info' | 'reconsider';
    statement: string;
    topFactor: string;
  };
  quantitativeScore: {
    decisionScore: number;
    topOptionName?: string;
    topOptionScore?: number;
    confidence: number;
  };
  recommendation: string;
  reasons: string[];
  warnings: string[];
  nextSteps: string[];
  dealBreakers: string[];
  missingInfo: string[];
  alternatives: string[];
  keyInsights: string;
}

export interface AnalysisData {
  analysis: AnalysisResult;
  recommendation: GeminiRecommendation;
  cached: boolean;
  aiUnavailable?: boolean;
}

// Simple hash function for decision data
function hashDecision(decision: Decision): string {
  const data = JSON.stringify({
    factors: decision.factors,
    emotionalContext: decision.emotionalContext,
  });

  // Simple hash implementation
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Get cached analysis from sessionStorage
function getCachedFromStorage(decisionId: string, decisionHash: string): AnalysisData | null {
  try {
    const cacheKey = `analysis_${decisionId}_${decisionHash}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if cache is still valid (within 24 hours)
      const cacheAge = Date.now() - new Date(parsed.cachedAt).getTime();
      if (cacheAge < 24 * 60 * 60 * 1000) {
        return { ...parsed.data, cached: true };
      }
    }
  } catch (err) {
    console.error('Failed to read from cache:', err);
  }
  return null;
}

// Save analysis to sessionStorage
function saveToStorage(decisionId: string, decisionHash: string, data: AnalysisData): void {
  try {
    const cacheKey = `analysis_${decisionId}_${decisionHash}`;
    sessionStorage.setItem(cacheKey, JSON.stringify({
      data,
      cachedAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Failed to save to cache:', err);
  }
}

// Clear analysis from sessionStorage
function clearFromStorage(decisionId: string): void {
  try {
    // Remove all cache entries for this decision
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(`analysis_${decisionId}_`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  } catch (err) {
    console.error('Failed to clear cache:', err);
  }
}

export function useDecisionAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const analyzeDecision = async (decisionId: string, decision?: Decision) => {
    if (!decisionId) {
      setError('Decision ID is required');
      return;
    }

    // Check cooldown
    if (cooldownSeconds > 0) {
      setError(`Please wait ${cooldownSeconds} seconds before analyzing again`);
      return;
    }

    // Check browser cache first
    if (decision) {
      const decisionHash = hashDecision(decision);
      const cached = getCachedFromStorage(decisionId, decisionHash);
      if (cached) {
        setAnalysis(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/decisions/${decisionId}/analyze`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Check for rate limiting
        if (response.status === 429 || data.message?.includes('Too many requests')) {
          // Start 30-second cooldown
          setCooldownSeconds(30);
          const interval = setInterval(() => {
            setCooldownSeconds((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          throw new Error('Too many requests. Please wait 30 seconds before analyzing again.');
        }
        throw new Error(data.message || 'Failed to analyze decision');
      }

      if (data.success) {
        const analysisData = { ...data.data, cached: false };
        setAnalysis(analysisData);

        // Save to browser cache
        if (decision) {
          const decisionHash = hashDecision(decision);
          saveToStorage(decisionId, decisionHash, analysisData);
        }

        // Start cooldown after successful analysis
        setCooldownSeconds(30);
        const interval = setInterval(() => {
          setCooldownSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        throw new Error(data.message || 'Analysis failed');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze decision');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = (decisionId: string) => {
    clearFromStorage(decisionId);
    setAnalysis(null);
  };

  const reset = () => {
    setAnalysis(null);
    setError(null);
    setLoading(false);
  };

  return {
    analysis,
    loading,
    error,
    cooldownSeconds,
    analyzeDecision,
    clearCache,
    reset,
  };
}
