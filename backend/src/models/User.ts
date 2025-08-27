import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  awardXP(amount: number): void;
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
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.awardXP = function(amount: number): void {
  this.gamification.xp += amount;
  
  const newLevel = Math.floor(this.gamification.xp / 1000) + 1;
  if (newLevel > this.gamification.level) {
    this.gamification.level = newLevel;
  }
};

userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  return userObject;
};

export const User = mongoose.model<IUser, UserModel>('User', userSchema);