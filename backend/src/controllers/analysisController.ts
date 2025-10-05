import { Request, Response } from 'express';
import { Decision } from '../models';
import { DecisionAnalyzer } from '../services/decisionAnalyzer';
import { GeminiService } from '../services/geminiService';

const analyzer = new DecisionAnalyzer();
let geminiService: GeminiService | null = null;

function getGeminiService(): GeminiService {
  if (!geminiService) {
    geminiService = new GeminiService();
  }
  return geminiService;
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
