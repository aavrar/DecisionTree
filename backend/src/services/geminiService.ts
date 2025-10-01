import { GoogleGenerativeAI } from '@google/generative-ai';
import { IDecision } from '../types';
import { AnalysisResult } from './decisionAnalyzer';

export interface GeminiRecommendation {
  recommendation: string;
  reasons: string[];
  warnings: string[];
  alternatives: string[];
  keyInsights: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async generateRecommendation(analysis: AnalysisResult, decision: IDecision): Promise<GeminiRecommendation> {
    const prompt = this.buildPrompt(analysis, decision);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseResponse(text);
    } catch (error: any) {
      console.error('Gemini API error:', error);

      if (error.message?.includes('quota')) {
        throw new Error('AI analysis quota exceeded. Please try again later.');
      }

      throw new Error('Failed to generate AI recommendation. Please try again.');
    }
  }

  private buildPrompt(analysis: AnalysisResult, decision: IDecision): string {
    const stress = decision.emotionalContext?.initialStressLevel || 5;
    const confidence = decision.emotionalContext?.confidenceLevel || 5;
    const urgency = decision.emotionalContext?.urgencyRating || 5;

    const factorSummary = decision.factors.map(f => ({
      name: f.name,
      weight: f.weight,
      category: f.category,
      uncertainty: f.uncertainty,
      timeHorizon: f.timeHorizon,
    }));

    return `You are an expert decision psychologist analyzing a user's decision tree using cognitive science principles.

Decision Context:
- Title: "${decision.title}"
- Description: "${decision.description || 'No description provided'}"
- Status: ${decision.status}
- Emotional State: Stress=${stress}/10, Confidence=${confidence}/10, Urgency=${urgency}/10

Factors Being Considered:
${JSON.stringify(factorSummary, null, 2)}

Algorithmic Analysis Results:
- Overall Score: ${analysis.overallScore.toFixed(1)}/100
- Confidence Level: ${analysis.confidence}%
- Risk Assessment: ${analysis.riskLevel}
- Complexity Score: ${analysis.insights.complexityScore}/100
- Emotional Alignment: ${analysis.insights.emotionalAlignment}%
- Time-Value Score: ${analysis.insights.timeValueScore}%
- Category Distribution: ${JSON.stringify(analysis.insights.categoryBalance)}
- Detected Biases: ${analysis.insights.biasFlags.map(b => b.type).join(', ') || 'None'}
- System Warnings: ${analysis.warnings.join('; ')}

Your Task:
Provide a warm, supportive, psychology-informed recommendation that helps the user make a better decision.

Guidelines:
1. Be specific and actionable - reference actual factors by name
2. Use plain language, avoid jargon
3. Acknowledge emotional context
4. Be honest about uncertainties and trade-offs
5. Empower the user - frame as "you can" not "you should"

Provide your response in the following JSON format (do not include any markdown formatting or code blocks):
{
  "recommendation": "A clear, actionable recommendation in 2-3 sentences",
  "reasons": ["Specific reason 1 referencing actual factors", "Specific reason 2", "Specific reason 3"],
  "warnings": ["Important consideration 1", "Important consideration 2"],
  "alternatives": ["Alternative approach 1 if applicable", "Alternative approach 2 if applicable"],
  "keyInsights": "The single most important insight from this analysis in one sentence"
}

Remember: Output ONLY valid JSON, no markdown formatting.`;
  }

  private parseResponse(text: string): GeminiRecommendation {
    try {
      let jsonText = text.trim();

      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(jsonText);

      return {
        recommendation: parsed.recommendation || 'Unable to generate recommendation',
        reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
        alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : [],
        keyInsights: parsed.keyInsights || 'No key insights available',
      };
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      console.error('Raw response:', text);

      return {
        recommendation: 'Unable to parse AI recommendation. Please try again.',
        reasons: [],
        warnings: [],
        alternatives: [],
        keyInsights: 'Analysis completed but response formatting failed',
      };
    }
  }
}
