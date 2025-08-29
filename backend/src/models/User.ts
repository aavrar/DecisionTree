import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  awardXP(amount: number): void;
  updateEmotionalState(state: Partial<IUser['profile']['emotionalState']>): void;
  calculateStressLevel(): number;
}

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    profile: {
      decisionMakingStyle: {
        type: String,
        enum: ['analytical', 'intuitive', 'balanced'],
        default: 'balanced'
      },
      stressLevel: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
      },
      preferredComplexity: {
        type: String,
        enum: ['simple', 'moderate', 'complex'],
        default: 'moderate'
      },
      emotionalState: {
        confidence: {
          type: Number,
          min: 1,
          max: 10,
          default: 5
        },
        urgency: {
          type: Number,
          min: 1,
          max: 10,
          default: 5
        },
        anxiety: {
          type: Number,
          min: 1,
          max: 10,
          default: 5
        }
      },
      cognitivePreferences: {
        maxChoicesPerDecision: {
          type: Number,
          min: 3,
          max: 7,
          default: 5
        },
        preferredVisualization: {
          type: String,
          enum: ['2d', '3d', 'auto'],
          default: 'auto'
        },
        stressReductionMode: {
          type: Boolean,
          default: true
        }
      }
    },
    gamification: {
      level: {
        type: Number,
        default: 1,
        min: 1
      },
      xp: {
        type: Number,
        default: 0,
        min: 0
      },
      streak: {
        type: Number,
        default: 0,
        min: 0
      },
      badges: [{
        type: String
      }],
      satisfactionHistory: [{
        date: {
          type: Date,
          default: Date.now
        },
        score: {
          type: Number,
          min: 1,
          max: 10
        }
      }]
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ email: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, (this as any).passwordHash);
};

userSchema.methods.awardXP = function(amount: number): void {
  const user = this as any;
  user.gamification.xp += amount;
  
  const newLevel = Math.floor(user.gamification.xp / 1000) + 1;
  if (newLevel > user.gamification.level) {
    user.gamification.level = newLevel;
  }
};

userSchema.methods.updateEmotionalState = function(state: any): void {
  const user = this as any;
  user.profile.emotionalState = {
    ...user.profile.emotionalState,
    ...state
  };
  
  // Calculate and update overall stress level
  user.profile.stressLevel = (user.calculateStressLevel as any)();
};

userSchema.methods.calculateStressLevel = function(): number {
  const user = this as any;
  const { confidence, urgency, anxiety } = user.profile.emotionalState;
  
  // Stress increases with anxiety and urgency, decreases with confidence
  // Formula: weighted combination with emphasis on anxiety
  const stressScore = (
    (anxiety * 0.5) + 
    (urgency * 0.3) + 
    ((10 - confidence) * 0.2)
  );
  
  return Math.min(10, Math.max(1, Math.round(stressScore)));
};

userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  return userObject;
};

export const User = mongoose.model<IUser, UserModel>('User', userSchema);