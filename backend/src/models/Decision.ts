import mongoose, { Schema } from 'mongoose';
import { IDecision, IFactor } from '../types';

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
  uncertainty: {
    type: Number,
    min: [0, 'Uncertainty must be between 0 and 1'],
    max: [1, 'Uncertainty must be between 0 and 1']
  },
  timeHorizon: {
    type: String,
    enum: ['immediate', 'short', 'long']
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