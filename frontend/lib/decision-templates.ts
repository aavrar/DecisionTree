import type { Decision } from "@/types/decision"

export interface DecisionTemplate {
  id: string
  name: string
  description: string
  category: "simple" | "moderate" | "complex"
  template: Omit<Decision, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
}

export const decisionTemplates: DecisionTemplate[] = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start from scratch with a single factor",
    category: "simple",
    template: {
      title: "Untitled Decision",
      description: "",
      factors: [
        {
          id: Date.now().toString(),
          name: "First Factor",
          type: "consideration",
          weight: 50,
          category: "personal",
          description: "",
          children: []
        }
      ],
      status: "draft",
      emotionalContext: {
        initialStressLevel: 5,
        confidenceLevel: 5,
        urgencyRating: 5,
      },
    }
  },
  {
    id: "yes-no",
    name: "Yes or No Decision",
    description: "Simple binary choice with pros and cons",
    category: "simple",
    template: {
      title: "Should I...?",
      description: "A simple yes or no decision",
      factors: [
        {
          id: Date.now().toString() + "-1",
          name: "Yes - Proceed",
          type: "option",
          weight: 50,
          category: "personal",
          description: "Reasons to say yes",
          children: [
            {
              id: Date.now().toString() + "-1-1",
              name: "Positive Outcome 1",
              type: "outcome",
              category: "personal",
              importance: 60,
              emotionalWeight: 70,
              uncertainty: 40,
              regretPotential: 30
            },
            {
              id: Date.now().toString() + "-1-2",
              name: "Positive Outcome 2",
              type: "outcome",
              category: "personal",
              importance: 50,
              emotionalWeight: 60,
              uncertainty: 50,
              regretPotential: 40
            }
          ]
        },
        {
          id: Date.now().toString() + "-2",
          name: "No - Don't Proceed",
          type: "option",
          weight: 50,
          category: "personal",
          description: "Reasons to say no",
          children: [
            {
              id: Date.now().toString() + "-2-1",
              name: "Avoiding Risk 1",
              type: "outcome",
              category: "personal",
              importance: 70,
              emotionalWeight: 50,
              uncertainty: 30,
              regretPotential: 60
            },
            {
              id: Date.now().toString() + "-2-2",
              name: "Maintaining Status Quo",
              type: "outcome",
              category: "personal",
              importance: 50,
              emotionalWeight: 40,
              uncertainty: 20,
              regretPotential: 50
            }
          ]
        }
      ],
      status: "draft",
      emotionalContext: {
        initialStressLevel: 5,
        confidenceLevel: 5,
        urgencyRating: 5,
      },
    }
  },
  {
    id: "career-move",
    name: "Career Decision",
    description: "Evaluate a job change or career move",
    category: "moderate",
    template: {
      title: "Career Move Decision",
      description: "Evaluating a new career opportunity",
      factors: [
        {
          id: Date.now().toString() + "-1",
          name: "Financial Impact",
          type: "consideration",
          weight: 33,
          category: "financial",
          description: "Salary, benefits, and financial stability",
          children: [
            {
              id: Date.now().toString() + "-1-1",
              name: "Salary Increase",
              type: "outcome",
              category: "financial",
              importance: 80,
              emotionalWeight: 60,
              uncertainty: 20,
              regretPotential: 30
            },
            {
              id: Date.now().toString() + "-1-2",
              name: "Better Benefits",
              type: "outcome",
              category: "financial",
              importance: 60,
              emotionalWeight: 50,
              uncertainty: 30,
              regretPotential: 40
            }
          ]
        },
        {
          id: Date.now().toString() + "-2",
          name: "Career Growth",
          type: "consideration",
          weight: 33,
          category: "career",
          description: "Learning opportunities and advancement",
          children: [
            {
              id: Date.now().toString() + "-2-1",
              name: "New Skills",
              type: "outcome",
              category: "career",
              importance: 90,
              emotionalWeight: 70,
              uncertainty: 40,
              regretPotential: 20
            },
            {
              id: Date.now().toString() + "-2-2",
              name: "Leadership Role",
              type: "outcome",
              category: "career",
              importance: 70,
              emotionalWeight: 80,
              uncertainty: 50,
              regretPotential: 30
            }
          ]
        },
        {
          id: Date.now().toString() + "-3",
          name: "Work-Life Balance",
          type: "consideration",
          weight: 34,
          category: "personal",
          description: "Impact on lifestyle and wellbeing",
          children: [
            {
              id: Date.now().toString() + "-3-1",
              name: "Flexible Schedule",
              type: "outcome",
              category: "personal",
              importance: 70,
              emotionalWeight: 90,
              uncertainty: 30,
              regretPotential: 40
            },
            {
              id: Date.now().toString() + "-3-2",
              name: "Commute Time",
              type: "consequence",
              category: "personal",
              importance: 60,
              emotionalWeight: 70,
              uncertainty: 20,
              regretPotential: 50
            }
          ]
        }
      ],
      status: "draft",
      emotionalContext: {
        initialStressLevel: 7,
        confidenceLevel: 5,
        urgencyRating: 6,
      },
    }
  },
  {
    id: "major-purchase",
    name: "Major Purchase",
    description: "Deciding on a significant purchase (car, home, etc.)",
    category: "moderate",
    template: {
      title: "Major Purchase Decision",
      description: "Evaluating a significant purchase",
      factors: [
        {
          id: Date.now().toString() + "-1",
          name: "Financial Feasibility",
          type: "consideration",
          weight: 40,
          category: "financial",
          description: "Can I afford this?",
          children: [
            {
              id: Date.now().toString() + "-1-1",
              name: "Down Payment Available",
              type: "outcome",
              category: "financial",
              importance: 90,
              emotionalWeight: 50,
              uncertainty: 20,
              regretPotential: 80
            },
            {
              id: Date.now().toString() + "-1-2",
              name: "Monthly Payment Manageable",
              type: "outcome",
              category: "financial",
              importance: 85,
              emotionalWeight: 60,
              uncertainty: 30,
              regretPotential: 70
            },
            {
              id: Date.now().toString() + "-1-3",
              name: "Impact on Savings",
              type: "consequence",
              category: "financial",
              importance: 70,
              emotionalWeight: 65,
              uncertainty: 40,
              regretPotential: 60
            }
          ]
        },
        {
          id: Date.now().toString() + "-2",
          name: "Need vs Want",
          type: "consideration",
          weight: 30,
          category: "personal",
          description: "Is this necessary?",
          children: [
            {
              id: Date.now().toString() + "-2-1",
              name: "Solves Current Problem",
              type: "outcome",
              category: "personal",
              importance: 80,
              emotionalWeight: 70,
              uncertainty: 30,
              regretPotential: 50
            },
            {
              id: Date.now().toString() + "-2-2",
              name: "Improves Quality of Life",
              type: "outcome",
              category: "personal",
              importance: 60,
              emotionalWeight: 80,
              uncertainty: 40,
              regretPotential: 40
            }
          ]
        },
        {
          id: Date.now().toString() + "-3",
          name: "Timing",
          type: "consideration",
          weight: 30,
          category: "personal",
          description: "Is now the right time?",
          children: [
            {
              id: Date.now().toString() + "-3-1",
              name: "Market Conditions Favorable",
              type: "outcome",
              category: "financial",
              importance: 70,
              emotionalWeight: 50,
              uncertainty: 60,
              regretPotential: 65
            },
            {
              id: Date.now().toString() + "-3-2",
              name: "Life Circumstances Stable",
              type: "outcome",
              category: "personal",
              importance: 75,
              emotionalWeight: 70,
              uncertainty: 40,
              regretPotential: 55
            }
          ]
        }
      ],
      status: "draft",
      emotionalContext: {
        initialStressLevel: 8,
        confidenceLevel: 4,
        urgencyRating: 5,
      },
    }
  },
  {
    id: "education-choice",
    name: "Education Path",
    description: "College, major, or educational program selection",
    category: "complex",
    template: {
      title: "Education Path Decision",
      description: "Choosing the right educational direction",
      factors: [
        {
          id: Date.now().toString() + "-1",
          name: "Academic Fit",
          type: "consideration",
          weight: 25,
          category: "career",
          description: "Does the program match my interests and goals?",
          children: [
            {
              id: Date.now().toString() + "-1-1",
              name: "Program Reputation",
              type: "outcome",
              category: "career",
              importance: 80,
              emotionalWeight: 60,
              uncertainty: 30,
              regretPotential: 40,
              children: [
                {
                  id: Date.now().toString() + "-1-1-1",
                  name: "Industry Recognition",
                  type: "outcome",
                  category: "career",
                  importance: 85,
                  emotionalWeight: 55,
                  uncertainty: 35,
                  regretPotential: 45
                },
                {
                  id: Date.now().toString() + "-1-1-2",
                  name: "Alumni Success Rate",
                  type: "outcome",
                  category: "career",
                  importance: 75,
                  emotionalWeight: 60,
                  uncertainty: 40,
                  regretPotential: 50
                }
              ]
            },
            {
              id: Date.now().toString() + "-1-2",
              name: "Curriculum Alignment",
              type: "outcome",
              category: "career",
              importance: 90,
              emotionalWeight: 70,
              uncertainty: 20,
              regretPotential: 30
            }
          ]
        },
        {
          id: Date.now().toString() + "-2",
          name: "Financial Investment",
          type: "consideration",
          weight: 25,
          category: "financial",
          description: "Cost and financial aid considerations",
          children: [
            {
              id: Date.now().toString() + "-2-1",
              name: "Tuition Costs",
              type: "consequence",
              category: "financial",
              importance: 95,
              emotionalWeight: 80,
              uncertainty: 20,
              regretPotential: 70,
              children: [
                {
                  id: Date.now().toString() + "-2-1-1",
                  name: "Scholarship Opportunities",
                  type: "option",
                  category: "financial",
                  importance: 90,
                  emotionalWeight: 70,
                  uncertainty: 50,
                  regretPotential: 60
                },
                {
                  id: Date.now().toString() + "-2-1-2",
                  name: "Student Loan Burden",
                  type: "consequence",
                  category: "financial",
                  importance: 85,
                  emotionalWeight: 90,
                  uncertainty: 30,
                  regretPotential: 80
                }
              ]
            },
            {
              id: Date.now().toString() + "-2-2",
              name: "Return on Investment",
              type: "outcome",
              category: "financial",
              importance: 85,
              emotionalWeight: 75,
              uncertainty: 50,
              regretPotential: 55
            }
          ]
        },
        {
          id: Date.now().toString() + "-3",
          name: "Career Prospects",
          type: "consideration",
          weight: 25,
          category: "career",
          description: "Job market and career opportunities",
          children: [
            {
              id: Date.now().toString() + "-3-1",
              name: "Job Market Demand",
              type: "outcome",
              category: "career",
              importance: 90,
              emotionalWeight: 70,
              uncertainty: 60,
              regretPotential: 50
            },
            {
              id: Date.now().toString() + "-3-2",
              name: "Earning Potential",
              type: "outcome",
              category: "financial",
              importance: 80,
              emotionalWeight: 65,
              uncertainty: 55,
              regretPotential: 60,
              children: [
                {
                  id: Date.now().toString() + "-3-2-1",
                  name: "Starting Salary Range",
                  type: "outcome",
                  category: "financial",
                  importance: 75,
                  emotionalWeight: 60,
                  uncertainty: 45,
                  regretPotential: 55
                },
                {
                  id: Date.now().toString() + "-3-2-2",
                  name: "Growth Trajectory",
                  type: "outcome",
                  category: "career",
                  importance: 80,
                  emotionalWeight: 70,
                  uncertainty: 65,
                  regretPotential: 50
                }
              ]
            }
          ]
        },
        {
          id: Date.now().toString() + "-4",
          name: "Personal Fulfillment",
          type: "consideration",
          weight: 25,
          category: "personal",
          description: "Passion and life satisfaction",
          children: [
            {
              id: Date.now().toString() + "-4-1",
              name: "Passion for Subject",
              type: "outcome",
              category: "personal",
              importance: 85,
              emotionalWeight: 95,
              uncertainty: 30,
              regretPotential: 35
            },
            {
              id: Date.now().toString() + "-4-2",
              name: "Campus Life Experience",
              type: "outcome",
              category: "personal",
              importance: 60,
              emotionalWeight: 80,
              uncertainty: 40,
              regretPotential: 45,
              children: [
                {
                  id: Date.now().toString() + "-4-2-1",
                  name: "Social Opportunities",
                  type: "outcome",
                  category: "personal",
                  importance: 55,
                  emotionalWeight: 85,
                  uncertainty: 35,
                  regretPotential: 40
                },
                {
                  id: Date.now().toString() + "-4-2-2",
                  name: "Extracurricular Activities",
                  type: "outcome",
                  category: "personal",
                  importance: 50,
                  emotionalWeight: 75,
                  uncertainty: 30,
                  regretPotential: 35
                }
              ]
            }
          ]
        }
      ],
      status: "draft",
      emotionalContext: {
        initialStressLevel: 8,
        confidenceLevel: 4,
        urgencyRating: 7,
      },
    }
  },
  {
    id: "relationship",
    name: "Relationship Decision",
    description: "Major relationship choice or commitment",
    category: "complex",
    template: {
      title: "Relationship Decision",
      description: "Making a significant relationship choice",
      factors: [
        {
          id: Date.now().toString() + "-1",
          name: "Emotional Connection",
          type: "consideration",
          weight: 30,
          category: "personal",
          description: "How do we connect emotionally?",
          children: [
            {
              id: Date.now().toString() + "-1-1",
              name: "Communication Quality",
              type: "outcome",
              category: "personal",
              importance: 95,
              emotionalWeight: 90,
              uncertainty: 25,
              regretPotential: 30
            },
            {
              id: Date.now().toString() + "-1-2",
              name: "Shared Values",
              type: "outcome",
              category: "personal",
              importance: 90,
              emotionalWeight: 85,
              uncertainty: 30,
              regretPotential: 35,
              children: [
                {
                  id: Date.now().toString() + "-1-2-1",
                  name: "Life Goals Alignment",
                  type: "outcome",
                  category: "personal",
                  importance: 85,
                  emotionalWeight: 80,
                  uncertainty: 40,
                  regretPotential: 45
                },
                {
                  id: Date.now().toString() + "-1-2-2",
                  name: "Family Values",
                  type: "outcome",
                  category: "personal",
                  importance: 80,
                  emotionalWeight: 75,
                  uncertainty: 35,
                  regretPotential: 50
                }
              ]
            },
            {
              id: Date.now().toString() + "-1-3",
              name: "Trust Level",
              type: "outcome",
              category: "personal",
              importance: 100,
              emotionalWeight: 95,
              uncertainty: 20,
              regretPotential: 25
            }
          ]
        },
        {
          id: Date.now().toString() + "-2",
          name: "Practical Compatibility",
          type: "consideration",
          weight: 25,
          category: "personal",
          description: "Day-to-day life compatibility",
          children: [
            {
              id: Date.now().toString() + "-2-1",
              name: "Lifestyle Match",
              type: "outcome",
              category: "personal",
              importance: 75,
              emotionalWeight: 70,
              uncertainty: 30,
              regretPotential: 40
            },
            {
              id: Date.now().toString() + "-2-2",
              name: "Financial Compatibility",
              type: "outcome",
              category: "financial",
              importance: 70,
              emotionalWeight: 60,
              uncertainty: 35,
              regretPotential: 55
            },
            {
              id: Date.now().toString() + "-2-3",
              name: "Conflict Resolution",
              type: "outcome",
              category: "personal",
              importance: 85,
              emotionalWeight: 80,
              uncertainty: 40,
              regretPotential: 45
            }
          ]
        },
        {
          id: Date.now().toString() + "-3",
          name: "Personal Growth",
          type: "consideration",
          weight: 20,
          category: "personal",
          description: "Impact on individual development",
          children: [
            {
              id: Date.now().toString() + "-3-1",
              name: "Mutual Support",
              type: "outcome",
              category: "personal",
              importance: 80,
              emotionalWeight: 85,
              uncertainty: 30,
              regretPotential: 40
            },
            {
              id: Date.now().toString() + "-3-2",
              name: "Independence Balance",
              type: "outcome",
              category: "personal",
              importance: 70,
              emotionalWeight: 75,
              uncertainty: 45,
              regretPotential: 50
            }
          ]
        },
        {
          id: Date.now().toString() + "-4",
          name: "Long-term Viability",
          type: "consideration",
          weight: 25,
          category: "personal",
          description: "Can this last?",
          children: [
            {
              id: Date.now().toString() + "-4-1",
              name: "Commitment Level",
              type: "outcome",
              category: "personal",
              importance: 90,
              emotionalWeight: 85,
              uncertainty: 35,
              regretPotential: 40
            },
            {
              id: Date.now().toString() + "-4-2",
              name: "Future Planning Alignment",
              type: "outcome",
              category: "personal",
              importance: 85,
              emotionalWeight: 80,
              uncertainty: 50,
              regretPotential: 55,
              children: [
                {
                  id: Date.now().toString() + "-4-2-1",
                  name: "Children & Family",
                  type: "outcome",
                  category: "personal",
                  importance: 80,
                  emotionalWeight: 90,
                  uncertainty: 40,
                  regretPotential: 70
                },
                {
                  id: Date.now().toString() + "-4-2-2",
                  name: "Career & Location",
                  type: "outcome",
                  category: "career",
                  importance: 70,
                  emotionalWeight: 65,
                  uncertainty: 55,
                  regretPotential: 60
                }
              ]
            }
          ]
        }
      ],
      status: "draft",
      emotionalContext: {
        initialStressLevel: 9,
        confidenceLevel: 5,
        urgencyRating: 6,
      },
    }
  }
]

export function getTemplateById(id: string): DecisionTemplate | undefined {
  return decisionTemplates.find(t => t.id === id)
}

export function getTemplatesByCategory(category: "simple" | "moderate" | "complex"): DecisionTemplate[] {
  return decisionTemplates.filter(t => t.category === category)
}
