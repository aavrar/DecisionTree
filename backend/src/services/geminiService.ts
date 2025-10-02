import { GoogleGenerativeAI } from '@google/generative-ai';
import { IDecision } from '../types';
import { AnalysisResult } from './decisionAnalyzer';

export interface GeminiRecommendation {
  clearRecommendation: {
    action: 'proceed' | 'dont_proceed' | 'needs_more_info' | 'reconsider';
    statement: string; // Direct actionable statement
    topFactor: string; // The single most important factor driving this
  };
  quantitativeScore: {
    decisionScore: number; // 0-100 overall confidence in this decision
    topOptionName?: string; // If binary/multiple choice, which option wins
    topOptionScore?: number; // Score for the winning option
    confidence: number; // 0-100 confidence in the recommendation
  };
  recommendation: string;
  reasons: string[];
  warnings: string[];
  nextSteps: string[]; // Concrete actions to take
  dealBreakers: string[]; // Top 3 critical issues
  missingInfo: string[]; // What's missing from the decision tree
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

    // Include the full tree structure with children
    const decisionTree = decision.factors.map(f => ({
      name: f.name,
      type: f.type,
      weight: f.weight,
      category: f.category,
      description: f.description,
      address: f.address,
      importance: f.importance,
      emotionalWeight: f.emotionalWeight,
      uncertainty: f.uncertainty,
      regretPotential: f.regretPotential,
      timeHorizon: f.timeHorizon,
      children: f.children || [],
    }));

    // Check if any factors or nodes have addresses
    const hasAddresses = decision.factors.some(f => {
      if (f.address) return true;

      const checkChildren = (children: any[]): boolean => {
        if (!children || children.length === 0) return false;
        return children.some(child => {
          if (child.address) return true;
          if (child.children) return checkChildren(child.children);
          return false;
        });
      };

      return checkChildren(f.children || []);
    });

    const locationContext = hasAddresses ? `

LOCATION CONTEXT:
Some factors or outcomes in this decision have location addresses. Consider these addresses when making your recommendation, as location can significantly impact quality of life, commute times, and practical feasibility.
` : '';

    return `You are an expert decision psychologist analyzing a user's decision tree. Your job is to provide CLEAR, DIRECT, ACTIONABLE recommendations.

IMPORTANT CONTEXT ABOUT METRICS:
- Uncertainty & Regret Potential: LOW values (0-30) = GOOD/CONFIDENT, HIGH values (70-100) = BAD/RISKY
- A factor with 20% uncertainty is BETTER than one with 80% uncertainty
- A factor with 15% regret potential is BETTER than one with 85% regret potential
- Importance & Emotional Weight: HIGH values = more significant to the user

Decision Context:
- Title: "${decision.title}"
- Description: "${decision.description || 'No description provided'}"
- Status: ${decision.status}
- Emotional State: Stress=${stress}/10, Confidence=${confidence}/10, Urgency=${urgency}/10
${locationContext}

FULL DECISION TREE STRUCTURE (with all nested children/outcomes):
${JSON.stringify(decisionTree, null, 2)}

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

CRITICAL INSTRUCTIONS:
1. You MUST give a clear, direct recommendation. Do NOT be vague or meta-analytical.
2. Look at the FULL TREE STRUCTURE above - factors have children (outcomes/options). These children are what the user is actually choosing between!
3. If this is a binary decision (yes/no, option A vs B), you MUST pick a side based on the data.
4. If there are multiple paths/options in the decision tree, you MUST identify which specific path/option/child the user should pursue.
5. Be bold and decisive - the user needs direction, not philosophy.
6. Reference SPECIFIC factor names AND their children/outcomes by name from the decision tree.
7. Remember: Low uncertainty/regret = good/confident choice. High uncertainty/regret = risky/uncertain choice.

Provide your response in the following JSON format (do not include any markdown formatting or code blocks):
{
  "clearRecommendation": {
    "action": "proceed | dont_proceed | needs_more_info | reconsider",
    "statement": "A DIRECT statement like 'You should choose [SPECIFIC OPTION/PATH]' or 'Go ahead with [SPECIFIC DECISION]' or 'Don't proceed with [X], instead focus on [Y]'. Be specific - name the actual factors/options from the tree.",
    "topFactor": "The single most important factor influencing this recommendation (use actual factor name from the tree)"
  },
  "quantitativeScore": {
    "decisionScore": 75,
    "topOptionName": "Name of the winning option/path/child node if applicable (e.g., 'Trust Level', 'Financial Compatibility', 'Communication Quality', etc. - use actual names from the tree children)",
    "topOptionScore": 82,
    "confidence": 85
  },
  "recommendation": "A supportive 2-3 sentence explanation of WHY this is the right choice, referencing specific factors",
  "reasons": ["Concrete reason 1 with specific factor names", "Concrete reason 2", "Concrete reason 3"],
  "nextSteps": ["Specific action 1 the user should take next", "Specific action 2", "Specific action 3"],
  "dealBreakers": ["Critical issue 1 that could derail this decision", "Critical issue 2", "Critical issue 3"],
  "missingInfo": ["Information gap 1 in the decision tree", "Information gap 2"],
  "warnings": ["Important consideration 1", "Important consideration 2"],
  "alternatives": ["Alternative approach 1 if the main recommendation doesn't work", "Alternative approach 2"],
  "keyInsights": "The single most important insight in one sentence"
}

EXAMPLES OF GOOD vs BAD RECOMMENDATIONS:

BAD (vague, meta): "Given the complexity, you should revisit your decision tree and consolidate factors."
GOOD (specific, actionable): "Choose the 'New Job Offer' path - the Career Growth factor (weight: 35%) and its 'Salary Increase' outcome (low uncertainty: 20%) strongly favor this option."

BAD (philosophical): "Consider what matters most to your values and long-term happiness."
GOOD (direct): "Don't proceed with this relationship - the 'Trust Level' outcome shows high uncertainty (70%) and the 'Communication Quality' factor has high regret potential (65%), indicating fundamental issues."

BAD (ignoring the tree structure): "Focus on Emotional Connection."
GOOD (using actual tree nodes): "Focus on improving the 'Communication Quality' outcome under Emotional Connection - it has the lowest uncertainty (25%) and highest importance (95), making it your strongest foundation."

UNDERSTANDING THE TREE:
- Top-level nodes are FACTORS (e.g., "Emotional Connection", "Practical Compatibility")
- Their children are OUTCOMES/OPTIONS (e.g., "Trust Level", "Communication Quality", "Lifestyle Match")
- When recommending, reference BOTH the factor AND its specific children/outcomes

Remember: LOW uncertainty/regret = GOOD/CONFIDENT. HIGH uncertainty/regret = RISKY/UNCERTAIN. BE DECISIVE. Output ONLY valid JSON, no markdown formatting.`;
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
        clearRecommendation: {
          action: parsed.clearRecommendation?.action || 'needs_more_info',
          statement: parsed.clearRecommendation?.statement || 'Unable to generate clear recommendation',
          topFactor: parsed.clearRecommendation?.topFactor || 'Unknown',
        },
        quantitativeScore: {
          decisionScore: parsed.quantitativeScore?.decisionScore || 50,
          topOptionName: parsed.quantitativeScore?.topOptionName,
          topOptionScore: parsed.quantitativeScore?.topOptionScore,
          confidence: parsed.quantitativeScore?.confidence || 50,
        },
        recommendation: parsed.recommendation || 'Unable to generate recommendation',
        reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
        nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
        dealBreakers: Array.isArray(parsed.dealBreakers) ? parsed.dealBreakers : [],
        missingInfo: Array.isArray(parsed.missingInfo) ? parsed.missingInfo : [],
        alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : [],
        keyInsights: parsed.keyInsights || 'No key insights available',
      };
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      console.error('Raw response:', text);

      return {
        clearRecommendation: {
          action: 'needs_more_info',
          statement: 'Unable to parse AI recommendation. Please try again.',
          topFactor: 'Unknown',
        },
        quantitativeScore: {
          decisionScore: 50,
          confidence: 0,
        },
        recommendation: 'Unable to parse AI recommendation. Please try again.',
        reasons: [],
        warnings: [],
        nextSteps: [],
        dealBreakers: [],
        missingInfo: [],
        alternatives: [],
        keyInsights: 'Analysis completed but response formatting failed',
      };
    }
  }
}
