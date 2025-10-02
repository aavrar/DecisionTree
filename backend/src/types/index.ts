import { Document } from 'mongoose';

// Recursive tree node structure
export interface ITreeNodeData {
  id: string;
  name: string;
  type: 'outcome' | 'consequence' | 'option' | 'consideration';
  category?: 'financial' | 'personal' | 'career' | 'health';
  weight?: number; // 0-100 - Normalized weight among siblings
  description?: string;
  importance?: number; // 0-100
  emotionalWeight?: number; // 0-100
  uncertainty?: number; // 0-100
  regretPotential?: number; // 0-100
  notes?: string;
  ccs?: number; // Choice Consequence Score
  children?: ITreeNodeData[];
}

export interface IFactor {
  id: string;
  name: string;
  type?: 'outcome' | 'consequence' | 'option' | 'consideration';
  weight: number; // 0-100 - Normalized weight among siblings
  category: 'financial' | 'personal' | 'career' | 'health';
  description?: string;
  importance?: number; // 0-100 - How critical is this factor
  uncertainty?: number; // 0-100
  timeHorizon?: 'immediate' | 'short' | 'medium' | 'long';
  emotionalWeight?: number; // 0-100
  regretPotential?: number; // 0-100
  children?: ITreeNodeData[]; // Support nested tree structure
}

export interface IDecision extends Document {
  userId: string;
  title: string;
  description: string;
  factors: IFactor[];
  status: 'draft' | 'active' | 'resolved';
  emotionalContext: {
    initialStressLevel: number;
    confidenceLevel: number;
    urgencyRating: number;
    valuesAlignment: string[];
  };
  visualPreferences: {
    complexity: 'simple' | 'detailed';
    viewMode: '2d' | '3d' | 'auto';
    colorScheme: 'trust' | 'balance' | 'energy';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  profile: {
    decisionMakingStyle: 'analytical' | 'intuitive' | 'balanced';
    stressLevel: number; // 1-10
    preferredComplexity: 'simple' | 'moderate' | 'complex';
    emotionalState: {
      confidence: number; // 1-10
      urgency: number; // 1-10
      anxiety: number; // 1-10
    };
    cognitivePreferences: {
      maxChoicesPerDecision: number; // 3-7 (Miller's Law)
      preferredVisualization: '2d' | '3d' | 'auto';
      stressReductionMode: boolean;
    };
  };
  gamification: {
    level: number;
    xp: number;
    streak: number;
    badges: string[];
    satisfactionHistory: {
      date: Date;
      score: number; // 1-10
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IDecisionNode extends Document {
  decisionId: string;
  parentId?: string;
  title: string;
  type: 'root' | 'factor' | 'outcome';
  probability?: number;
  score?: number;
  position: { x: number; y: number; z: number };
  children: string[];
}

export interface ISimulation extends Document {
  decisionId: string;
  scenarios: ISimulationScenario[];
  confidenceInterval: number;
  recommendedPath: string[];
  createdAt: Date;
}

export interface ISimulationScenario {
  id: string;
  outcome: string;
  probability: number;
  satisfaction: number;
  regretScore: number;
}

export interface IFutureSelfReflection extends Document {
  decisionId: string;
  userId: string;
  questions: {
    question: string;
    answer: string;
    regretScore: number; // 1-10
  }[];
  overallRegretScore: number;
  valuesAlignment: number;
  createdAt: Date;
}

// Enhanced psychological profiling
export interface IPsychologicalProfile extends Document {
  userId: string;
  cognitiveStyle: {
    analyticalVsIntuitive: number; // -100 to 100 (negative = intuitive, positive = analytical)
    riskTolerance: number; // 1-10
    timeOrientation: 'past' | 'present' | 'future';
    decisionSpeed: 'deliberate' | 'moderate' | 'quick';
  };
  emotionalPatterns: {
    stressTriggers: string[];
    calmingElements: string[];
    motivationalFactors: string[];
  };
  adaptedInterface: {
    preferredComplexity: number; // 1-5
    optimalChoiceCount: number; // 3-7
    helpfulMicrointeractions: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced Future Self Reflection with temporal perspectives
export interface IEnhancedFutureSelfReflection extends Document {
  decisionId: string;
  userId: string;
  temporalPerspective: {
    timeHorizon: '1month' | '1year' | '5years' | '10years';
    regretScenarios: {
      scenario: string;
      regretIntensity: number; // 1-10
      probability: number; // 0-100
    }[];
  };
  valuesAlignment: {
    coreValue: string;
    alignmentScore: number; // 1-10
    importance: number; // 1-10
  }[];
  emotionalProjection: {
    anticipatedSatisfaction: number; // 1-10
    anticipatedRegret: number; // 1-10
    confidenceInPrediction: number; // 1-10
  };
  createdAt: Date;
}

export interface IUserAnalytics extends Document {
  userId: string;
  decisionPatterns: {
    mostImportantFactors: string[];
    averageFactorCount: number;
    preferredCategories: string[];
    decisionSpeed: number; // days to resolve
    stressPatterns: {
      averageStressLevel: number;
      stressReductionEffectiveness: number;
      commonStressTriggers: string[];
    };
  };
  satisfactionTrends: {
    date: Date;
    score: number;
  }[];
  insights: string[];
  psychologicalInsights: {
    decisionMakingEfficiency: number;
    emotionalRegulationScore: number;
    recommendedAdjustments: string[];
  };
}

export interface IDecisionStats {
  totalDecisions: number;
  satisfactionRate: number;
  activeDecisions: number;
  trends: {
    decisionsThisMonth: number;
    satisfactionChange: number;
  };
}

export interface AuthenticatedRequest {
  userId: string;
  email: string;
}