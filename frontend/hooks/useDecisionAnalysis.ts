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
  recommendation: string;
  reasons: string[];
  warnings: string[];
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

  const analyzeDecision = async (decisionId: string) => {
    if (!decisionId) {
      setError('Decision ID is required');
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
        throw new Error(data.message || 'Failed to analyze decision');
      }

      if (data.success) {
        setAnalysis(data.data);
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
    analyzeDecision,
    getCachedAnalysis,
    clearCache,
    reset,
  };
}
