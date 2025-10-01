import mongoose, { Schema, Document } from 'mongoose';
import { AnalysisResult } from '../services/decisionAnalyzer';
import { GeminiRecommendation } from '../services/geminiService';

export interface IAnalysisCache extends Document {
  decisionId: string;
  decisionHash: string;
  analysis: AnalysisResult;
  geminiResponse: GeminiRecommendation;
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
}

const analysisCacheSchema = new Schema<IAnalysisCache>(
  {
    decisionId: {
      type: String,
      required: true,
      index: true,
    },
    decisionHash: {
      type: String,
      required: true,
    },
    analysis: {
      type: Schema.Types.Mixed,
      required: true,
    },
    geminiResponse: {
      type: Schema.Types.Mixed,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    hitCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

analysisCacheSchema.index({ decisionId: 1, decisionHash: 1 }, { unique: true });
analysisCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AnalysisCache = mongoose.model<IAnalysisCache>('AnalysisCache', analysisCacheSchema);
