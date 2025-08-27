import { Document } from 'mongoose';

export interface IFactor {
  id: string;
  name: string;
  weight: number; // 0-100
  category: 'financial' | 'personal' | 'career' | 'health';
  description?: string;
  uncertainty?: number; // 0-1
  timeHorizon?: 'immediate' | 'short' | 'long';
}

export interface IDecision extends Document {
  userId: string;
  title: string;
  description: string;
  factors: IFactor[];
  status: 'draft' | 'active' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  gamification: {
    level: number;
    xp: number;
    streak: number;
    badges: string[];
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

export interface IUserAnalytics extends Document {
  userId: string;
  decisionPatterns: {
    mostImportantFactors: string[];
    averageFactorCount: number;
    preferredCategories: string[];
    decisionSpeed: number; // days to resolve
  };
  satisfactionTrends: {
    date: Date;
    score: number;
  }[];
  insights: string[];
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