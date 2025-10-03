import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateDecision = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  
  body('factors')
    .isArray({ min: 1, max: 20 })
    .withMessage('Must have between 1 and 20 factors'),
  
  body('factors.*.name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Factor name must be between 1 and 100 characters'),
  
  body('factors.*.weight')
    .isInt({ min: 0, max: 100 })
    .withMessage('Factor weight must be between 0 and 100'),
  
  body('factors.*.category')
    .isIn(['financial', 'personal', 'career', 'health'])
    .withMessage('Factor category must be one of: financial, personal, career, health'),
  
  body('status')
    .optional()
    .isIn(['draft', 'active', 'resolved', 'archived'])
    .withMessage('Status must be one of: draft, active, resolved, archived')
];

export const validateUser = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .exists()
    .withMessage('Password is required')
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
    return;
  }
  
  next();
};