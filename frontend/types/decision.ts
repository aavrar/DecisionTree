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
