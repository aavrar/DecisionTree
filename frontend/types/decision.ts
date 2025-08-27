export interface Decision {
  id: string
  title: string
  description: string
  factors: Factor[]
  status: "draft" | "active" | "resolved"
}

export interface Factor {
  id: string
  name: string
  weight: number // 0-100
  category: "financial" | "personal" | "career" | "health"
  description?: string
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
