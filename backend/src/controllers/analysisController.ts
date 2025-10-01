import { Request, Response } from 'express';
import { Decision } from '../models';
import { AnalysisCache } from '../models/AnalysisCache';
import { DecisionAnalyzer } from '../services/decisionAnalyzer';
import { GeminiService } from '../services/geminiService';
import crypto from 'crypto-js';

const analyzer = new DecisionAnalyzer();
let geminiService: GeminiService | null = null;

function getGeminiService(): GeminiService {
  if (!geminiService) {
    geminiService = new GeminiService();
  }
  return geminiService;
}

function hashDecision(decision: any): string {
  const decisionString = JSON.stringify({
    factors: decision.factors,
    emotionalContext: decision.emotionalContext,
  });
  return crypto.MD5(decisionString).toString();
}

export const analyzeDecision = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;

    const decision = await Decision.findById(id);
    if (!decision) {
      res.status(404).json({
        success: false,
        message: 'Decision not found',
      });
      return;
    }

    if (decision.userId !== req.user.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to analyze this decision',
      });
      return;
    }

    const decisionHash = hashDecision(decision);

    const cached = await AnalysisCache.findOne({
      decisionId: (decision._id as any).toString(),
      decisionHash,
      expiresAt: { $gt: new Date() },
    });

    if (cached) {
      cached.hitCount += 1;
      await cached.save();

      res.json({
        success: true,
        data: {
          analysis: cached.analysis,
          recommendation: cached.geminiResponse,
          cached: true,
        },
      });
      return;
    }

    const analysis = analyzer.analyze(decision as any);

    let geminiResponse;
    try {
      const service = getGeminiService();
      geminiResponse = await service.generateRecommendation(analysis, decision as any);
    } catch (error: any) {
      console.error('Gemini API error:', error);

      res.json({
        success: true,
        data: {
          analysis,
          recommendation: {
            recommendation: 'AI analysis temporarily unavailable. Showing algorithmic analysis only.',
            reasons: analysis.warnings,
            warnings: [],
            alternatives: [],
            keyInsights: `Risk level: ${analysis.riskLevel}, Confidence: ${analysis.confidence}%`,
          },
          cached: false,
          aiUnavailable: true,
        },
      });
      return;
    }

    const cacheTTL = parseInt(process.env.ANALYSIS_CACHE_TTL || '86400', 10);
    const expiresAt = new Date(Date.now() + cacheTTL * 1000);

    await AnalysisCache.create({
      decisionId: (decision._id as any).toString(),
      decisionHash,
      analysis,
      geminiResponse,
      expiresAt,
      hitCount: 0,
    });

    res.json({
      success: true,
      data: {
        analysis,
        recommendation: geminiResponse,
        cached: false,
      },
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze decision',
      error: error.message,
    });
  }
};

export const getCachedAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;

    const decision = await Decision.findById(id);
    if (!decision) {
      res.status(404).json({
        success: false,
        message: 'Decision not found',
      });
      return;
    }

    if (decision.userId !== req.user.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const cached = await AnalysisCache.findOne({
      decisionId: (decision._id as any).toString(),
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!cached) {
      res.status(404).json({
        success: false,
        message: 'No cached analysis found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        analysis: cached.analysis,
        recommendation: cached.geminiResponse,
        cached: true,
        cachedAt: cached.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Get cached analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cached analysis',
      error: error.message,
    });
  }
};

export const clearAnalysisCache = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;

    const decision = await Decision.findById(id);
    if (!decision) {
      res.status(404).json({
        success: false,
        message: 'Decision not found',
      });
      return;
    }

    if (decision.userId !== req.user.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    await AnalysisCache.deleteMany({
      decisionId: (decision._id as any).toString(),
    });

    res.json({
      success: true,
      message: 'Analysis cache cleared',
    });
  } catch (error: any) {
    console.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message,
    });
  }
};
