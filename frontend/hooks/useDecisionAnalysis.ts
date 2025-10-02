import { useState } from 'react';

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

export function useDecisionAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const analyzeDecision = async (decisionId: string) => {
    if (!decisionId) {
      setError('Decision ID is required');
      return;
    }

    // Check cooldown
    if (cooldownSeconds > 0) {
      setError(`Please wait ${cooldownSeconds} seconds before analyzing again`);
      return;
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
        setAnalysis(data.data);
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

  const getCachedAnalysis = async (decisionId: string) => {
    if (!decisionId) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/decisions/${decisionId}/analysis`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalysis(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to get cached analysis:', err);
    }
  };

  const clearCache = async (decisionId: string) => {
    if (!decisionId) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return;
      }

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/decisions/${decisionId}/analysis`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      setAnalysis(null);
    } catch (err) {
      console.error('Failed to clear cache:', err);
    }
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
    getCachedAnalysis,
    clearCache,
    reset,
  };
}
