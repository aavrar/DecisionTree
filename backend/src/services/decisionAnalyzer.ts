import { IDecision, IFactor, ITreeNodeData } from '../types';

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
    analyzedAt: Date;
    totalFactors: number;
    totalNodes: number;
    processingTime: number;
  };
}

export class DecisionAnalyzer {
  private startTime: number = 0;

  analyze(decision: IDecision): AnalysisResult {
    this.startTime = Date.now();

    const overallScore = this.calculateWeightedScore(decision);
    const riskLevel = this.assessRisk(decision);
    const emotionalAlignment = this.checkEmotionalAlignment(decision);
    const timeValueScore = this.analyzeTimeHorizons(decision);
    const categoryBalance = this.getCategoryDistribution(decision);
    const complexityScore = this.calculateComplexity(decision);
    const biasFlags = this.detectBiases(decision);
    const recommendedFactorIds = this.getRecommendedFactors(decision);
    const warnings = this.generateWarnings(decision, complexityScore, riskLevel);

    const confidence = this.calculateConfidence(decision, complexityScore, riskLevel);

    return {
      overallScore,
      confidence,
      riskLevel,
      recommendedFactorIds,
      warnings,
      insights: {
        emotionalAlignment,
        timeValueScore,
        categoryBalance,
        complexityScore,
        biasFlags,
      },
      metadata: {
        analyzedAt: new Date(),
        totalFactors: decision.factors.length,
        totalNodes: this.countTotalNodes(decision),
        processingTime: Date.now() - this.startTime,
      },
    };
  }

  private calculateWeightedScore(decision: IDecision): number {
    if (decision.factors.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    decision.factors.forEach(factor => {
      const childScore = this.calculateChildrenScore(factor.children || []);
      const factorScore = factor.weight * (1 + childScore / 100);
      totalWeightedScore += factorScore;
      totalWeight += factor.weight;
    });

    return Math.min(100, (totalWeightedScore / decision.factors.length));
  }

  private calculateChildrenScore(children: ITreeNodeData[]): number {
    if (children.length === 0) return 0;

    const totalChildWeight = children.reduce((sum, child) => {
      const childScore = child.weight || 50;
      return sum + childScore + this.calculateChildrenScore(child.children || []);
    }, 0);

    return totalChildWeight / children.length;
  }

  private assessRisk(decision: IDecision): 'low' | 'medium' | 'high' {
    const avgUncertainty = decision.factors.reduce((sum, f) => sum + (f.uncertainty || 50), 0) / decision.factors.length;
    const avgRegret = decision.factors.reduce((sum, f) => sum + (f.regretPotential || 50), 0) / decision.factors.length;

    const riskScore = (avgUncertainty + avgRegret) / 2;

    if (riskScore < 40) return 'low';
    if (riskScore < 65) return 'medium';
    return 'high';
  }

  private checkEmotionalAlignment(decision: IDecision): number {
    const avgEmotionalWeight = decision.factors.reduce((sum, f) => sum + (f.emotionalWeight || 50), 0) / decision.factors.length;
    const stressLevel = decision.emotionalContext?.initialStressLevel || 5;
    const confidence = decision.emotionalContext?.confidenceLevel || 5;

    const stressAlignment = Math.abs(avgEmotionalWeight - (stressLevel * 10)) / 100;
    const confidenceAlignment = confidence / 10;

    return Math.round((1 - stressAlignment + confidenceAlignment) / 2 * 100);
  }

  private analyzeTimeHorizons(decision: IDecision): number {
    const timeWeights: Record<string, number> = {
      immediate: 0.25,
      short: 0.5,
      medium: 0.75,
      long: 1.0,
    };

    let weightedTimeScore = 0;
    let totalWeight = 0;

    decision.factors.forEach(factor => {
      const timeWeight = timeWeights[factor.timeHorizon || 'medium'];
      weightedTimeScore += factor.weight * timeWeight;
      totalWeight += factor.weight;
    });

    return Math.round((weightedTimeScore / totalWeight) * 100);
  }

  private getCategoryDistribution(decision: IDecision): Record<string, number> {
    const distribution: Record<string, number> = {
      financial: 0,
      personal: 0,
      career: 0,
      health: 0,
    };

    decision.factors.forEach(factor => {
      distribution[factor.category] = (distribution[factor.category] || 0) + 1;
    });

    return distribution;
  }

  private calculateComplexity(decision: IDecision): number {
    const factorCount = decision.factors.length;
    const totalNodes = this.countTotalNodes(decision);

    const millerScore = Math.min(100, (factorCount / 7) * 100);
    const depthScore = Math.min(100, (totalNodes / 20) * 100);

    return Math.round((millerScore + depthScore) / 2);
  }

  private countTotalNodes(decision: IDecision): number {
    let count = decision.factors.length;

    decision.factors.forEach(factor => {
      count += this.countChildren(factor.children || []);
    });

    return count;
  }

  private countChildren(children: ITreeNodeData[]): number {
    let count = children.length;

    children.forEach(child => {
      count += this.countChildren(child.children || []);
    });

    return count;
  }

  private detectBiases(decision: IDecision): BiasFlag[] {
    const biases: BiasFlag[] = [];

    if (decision.factors.length > 0) {
      const firstFactorWeight = decision.factors[0].weight;
      if (firstFactorWeight > 40) {
        biases.push({
          type: 'anchoring',
          severity: firstFactorWeight > 60 ? 'high' : 'medium',
          description: `First factor has disproportionate weight (${firstFactorWeight}%), suggesting anchoring bias`,
        });
      }
    }

    const immediateCount = decision.factors.filter(f => f.timeHorizon === 'immediate' || f.timeHorizon === 'short').length;
    const immediatePercentage = (immediateCount / decision.factors.length) * 100;

    if (immediatePercentage > 60) {
      biases.push({
        type: 'availability',
        severity: immediatePercentage > 75 ? 'high' : 'medium',
        description: `${immediatePercentage.toFixed(0)}% of factors focus on immediate/short-term, suggesting availability bias`,
      });
    }

    const avgRegret = decision.factors.reduce((sum, f) => sum + (f.regretPotential || 50), 0) / decision.factors.length;
    const avgWeight = decision.factors.reduce((sum, f) => sum + f.weight, 0) / decision.factors.length;

    if (avgRegret > 60 && avgWeight < 50) {
      biases.push({
        type: 'sunk_cost',
        severity: 'medium',
        description: 'High regret potential without corresponding weight suggests sunk cost fallacy',
      });
    }

    return biases;
  }

  private getRecommendedFactors(decision: IDecision): string[] {
    return decision.factors
      .sort((a, b) => {
        const scoreA = a.weight * (1 - (a.uncertainty || 50) / 100) * (1 - (a.regretPotential || 50) / 100);
        const scoreB = b.weight * (1 - (b.uncertainty || 50) / 100) * (1 - (b.regretPotential || 50) / 100);
        return scoreB - scoreA;
      })
      .slice(0, 3)
      .map(f => f.id);
  }

  private generateWarnings(decision: IDecision, complexityScore: number, riskLevel: string): string[] {
    const warnings: string[] = [];

    if (complexityScore > 70) {
      warnings.push('Decision complexity is high - consider consolidating factors to reduce cognitive load');
    }

    if (riskLevel === 'high') {
      warnings.push('High uncertainty and regret potential detected - gather more information before deciding');
    }

    const stressLevel = decision.emotionalContext?.initialStressLevel || 5;
    if (stressLevel > 7) {
      warnings.push('High stress level detected - consider taking more time with this decision');
    }

    const categoryDist = this.getCategoryDistribution(decision);
    const maxCategory = Math.max(...Object.values(categoryDist));
    const totalFactors = decision.factors.length;

    if (maxCategory / totalFactors > 0.8) {
      warnings.push('Decision heavily weighted toward one category - consider adding diverse perspectives');
    }

    return warnings;
  }

  private calculateConfidence(decision: IDecision, complexityScore: number, riskLevel: string): number {
    const baseConfidence = decision.emotionalContext?.confidenceLevel || 5;
    const complexityPenalty = complexityScore / 100 * 20;
    const riskPenalty = riskLevel === 'high' ? 20 : riskLevel === 'medium' ? 10 : 0;
    const factorBonus = Math.min(20, decision.factors.length * 3);

    const confidence = (baseConfidence * 10) - complexityPenalty - riskPenalty + factorBonus;

    return Math.max(0, Math.min(100, Math.round(confidence)));
  }
}
