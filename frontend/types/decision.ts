export interface Decision {
  id: string
  title: string
  description: string
  factors: Factor[]
  status: "draft" | "active" | "resolved"
  userId?: string
  createdAt?: Date
  updatedAt?: Date
  emotionalContext?: {
    initialStressLevel: number // 1-10
    confidenceLevel: number // 1-10
    urgencyRating: number // 1-10
    valuesAlignment?: string[]
  }
  visualPreferences?: {
    complexity: "simple" | "detailed"
    viewMode: "2d" | "3d" | "auto"
    colorScheme: "trust" | "balance" | "energy"
  }
}

export interface Factor {
  id: string
  name: string
  weight: number // 0-100
  category: "financial" | "personal" | "career" | "health"
  description?: string
  // Enhanced properties from Phase 1 plan
  uncertainty?: number // 0-100
  timeHorizon?: "immediate" | "short" | "medium" | "long"
  emotionalWeight?: number // 0-100
  regretPotential?: number // 0-100
  // Tree structure - factors can have child nodes
  children?: TreeNodeData[]
}

// Recursive tree node structure
export interface TreeNodeData {
  id: string
  name: string
  type: "outcome" | "consequence" | "option" | "consideration"
  weight?: number
  description?: string
  children?: TreeNodeData[]
}

export interface DecisionStats {
  totalDecisions: number
  satisfactionRate: number
  activeDecisions: number
  trends: {
    decisionsThisMonth: number
    satisfactionChange: number
  }
}

export interface TreeNode {
  id: string
  label: string
  type: "root" | "success" | "warning" | "danger"
  children?: TreeNode[]
  x?: number
  y?: number
}

// Enhanced tree node types for decision visualization
export interface DecisionTreeNode {
  id: string
  label: string
  type: "decision" | "factor"
  x: number
  y: number
  // Factor-specific properties
  factor?: Factor
  // Visual properties
  size?: number
  color?: string
  borderStyle?: "solid" | "dashed"
  borderWidth?: number
}

export interface DecisionTree {
  root: DecisionTreeNode
  factors: DecisionTreeNode[]
  connections: TreeConnection[]
  bounds: {
    width: number
    height: number
  }
}

export interface TreeConnection {
  id: string
  from: DecisionTreeNode
  to: DecisionTreeNode
  path: string // SVG path string
}

// Enhanced user profiling from Phase 1 plan
export interface UserProfile {
  id: string
  email: string
  profile: {
    decisionMakingStyle: "analytical" | "intuitive" | "balanced"
    stressLevel: number // 1-10
    preferredComplexity: "simple" | "moderate" | "complex"
    emotionalState: {
      confidence: number // 1-10
      urgency: number // 1-10
      anxiety: number // 1-10
    }
  }
  gamification: {
    level: number
    xp: number
    streak: number
    badges: string[]
    satisfactionHistory: { date: Date; score: number }[]
  }
}

export interface PsychologicalProfile {
  id: string
  userId: string
  cognitiveStyle: {
    analyticalVsIntuitive: number // -100 to 100
    riskTolerance: number // 1-10
    timeOrientation: "past" | "present" | "future"
    decisionSpeed: "deliberate" | "moderate" | "quick"
  }
  emotionalPatterns: {
    stressTriggers: string[]
    calmingElements: string[]
    motivationalFactors: string[]
  }
  adaptedInterface: {
    preferredComplexity: number // 1-5
    optimalChoiceCount: number // 3-7
    helpfulMicrointeractions: string[]
  }
}
