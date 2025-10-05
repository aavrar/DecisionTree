import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from '../middleware/auth';
import { analyzeDecision } from '../controllers/analysisController';

const router = express.Router();

const analysisRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: parseInt(process.env.ANALYSIS_RATE_LIMIT || '10', 10),
  message: {
    success: false,
    message: 'Too many analysis requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const perMinuteRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many requests per minute. Please wait.',
  },
});

router.post(
  '/:id/analyze',
  authenticateToken,
  analysisRateLimiter,
  perMinuteRateLimiter,
  analyzeDecision
);

export default router;
