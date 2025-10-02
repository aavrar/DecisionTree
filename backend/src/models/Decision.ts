import mongoose, { Schema } from 'mongoose';
import { IDecision, IFactor, ITreeNodeData } from '../types';

// Recursive tree node schema
const treeNodeSchema = new Schema<ITreeNodeData>({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: [100, 'Node name must be less than 100 characters']
  },
  type: {
    type: String,
    required: true,
    enum: ['outcome', 'consequence', 'option', 'consideration']
  },
  category: {
    type: String,
    enum: ['financial', 'personal', 'career', 'health']
  },
  weight: {
    type: Number,
    min: [0, 'Weight must be between 0 and 100'],
    max: [100, 'Weight must be between 0 and 100']
  },
  description: {
    type: String,
    maxlength: [500, 'Description must be less than 500 characters']
  },
  importance: {
    type: Number,
    min: [0, 'Importance must be between 0 and 100'],
    max: [100, 'Importance must be between 0 and 100']
  },
  emotionalWeight: {
    type: Number,
    min: [0, 'Emotional weight must be between 0 and 100'],
    max: [100, 'Emotional weight must be between 0 and 100']
  },
  uncertainty: {
    type: Number,
    min: [0, 'Uncertainty must be between 0 and 100'],
    max: [100, 'Uncertainty must be between 0 and 100']
  },
  regretPotential: {
    type: Number,
    min: [0, 'Regret potential must be between 0 and 100'],
    max: [100, 'Regret potential must be between 0 and 100']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes must be less than 1000 characters']
  },
  ccs: {
    type: Number
  },
  children: {
    type: [Schema.Types.Mixed],
    default: []
  }
}, { _id: false });

// Enable recursive nesting
treeNodeSchema.add({ children: [treeNodeSchema] });

const factorSchema = new Schema<IFactor>({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Factor name is required'],
    maxlength: [100, 'Factor name must be less than 100 characters']
  },
  type: {
    type: String,
    enum: ['outcome', 'consequence', 'option', 'consideration']
  },
  weight: {
    type: Number,
    required: [true, 'Factor weight is required'],
    min: [0, 'Weight must be between 0 and 100'],
    max: [100, 'Weight must be between 0 and 100']
  },
  category: {
    type: String,
    required: [true, 'Factor category is required'],
    enum: ['financial', 'personal', 'career', 'health']
  },
  description: {
    type: String,
    maxlength: [500, 'Description must be less than 500 characters']
  },
  importance: {
    type: Number,
    min: [0, 'Importance must be between 0 and 100'],
    max: [100, 'Importance must be between 0 and 100']
  },
  uncertainty: {
    type: Number,
    min: [0, 'Uncertainty must be between 0 and 100'],
    max: [100, 'Uncertainty must be between 0 and 100'],
    default: 50
  },
  timeHorizon: {
    type: String,
    enum: ['immediate', 'short', 'medium', 'long'],
    default: 'medium'
  },
  emotionalWeight: {
    type: Number,
    min: [0, 'Emotional weight must be between 0 and 100'],
    max: [100, 'Emotional weight must be between 0 and 100'],
    default: 50
  },
  regretPotential: {
    type: Number,
    min: [0, 'Regret potential must be between 0 and 100'],
    max: [100, 'Regret potential must be between 0 and 100'],
    default: 50
  },
  children: {
    type: [treeNodeSchema],
    default: []
  }
});

const decisionSchema = new Schema<IDecision>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Decision title is required'],
      maxlength: [200, 'Title must be less than 200 characters']
    },
    description: {
      type: String,
      maxlength: [2000, 'Description must be less than 2000 characters']
    },
    factors: {
      type: [factorSchema],
      validate: {
        validator: function(factors: IFactor[]) {
          return factors.length >= 1 && factors.length <= 20;
        },
        message: 'A decision must have between 1 and 20 factors'
      }
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'resolved'],
      default: 'draft'
    },
    emotionalContext: {
      initialStressLevel: {
        type: Number,
        min: [1, 'Stress level must be between 1 and 10'],
        max: [10, 'Stress level must be between 1 and 10'],
        default: 5
      },
      confidenceLevel: {
        type: Number,
        min: [1, 'Confidence level must be between 1 and 10'],
        max: [10, 'Confidence level must be between 1 and 10'],
        default: 5
      },
      urgencyRating: {
        type: Number,
        min: [1, 'Urgency rating must be between 1 and 10'],
        max: [10, 'Urgency rating must be between 1 and 10'],
        default: 5
      },
      valuesAlignment: [{
        type: String
      }]
    },
    visualPreferences: {
      complexity: {
        type: String,
        enum: ['simple', 'detailed'],
        default: 'simple'
      },
      viewMode: {
        type: String,
        enum: ['2d', '3d', 'auto'],
        default: 'auto'
      },
      colorScheme: {
        type: String,
        enum: ['trust', 'balance', 'energy'],
        default: 'trust'
      }
    }
  },
  {
    timestamps: true
  }
);

decisionSchema.index({ userId: 1, createdAt: -1 });
decisionSchema.index({ userId: 1, status: 1 });
decisionSchema.index({ title: 'text', description: 'text' });

decisionSchema.methods.calculateFactorScore = function(): number {
  if (this.factors.length === 0) return 0;
  
  const totalWeight = this.factors.reduce((sum: number, factor: IFactor) => sum + factor.weight, 0);
  return totalWeight / this.factors.length;
};

decisionSchema.methods.getCategoryDistribution = function(): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  this.factors.forEach((factor: IFactor) => {
    distribution[factor.category] = (distribution[factor.category] || 0) + 1;
  });
  
  return distribution;
};

export const Decision = mongoose.model<IDecision>('Decision', decisionSchema);