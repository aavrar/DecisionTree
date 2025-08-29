import { Request, Response } from 'express';
import { User } from '../models';
import { generateToken } from '../middleware/auth';
import type { IUser } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
      return;
    }

    const user = new User({
      email,
      passwordHash: password,
      gamification: {
        level: 1,
        xp: 0,
        streak: 0,
        badges: ['newcomer']
      }
    });

    await user.save();

    const token = generateToken({
      userId: (user._id as string).toString(),
      email: user.email
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          gamification: user.gamification
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    const isPasswordValid = await (user as any).comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    const token = generateToken({
      userId: (user._id as string).toString(),
      email: user.email
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          gamification: user.gamification
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          gamification: user.gamification,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const googleSignin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, image, googleId } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user's info if needed
      user.profile = {
        ...user.profile,
        // Could update additional Google-specific info here
      };
      await user.save();
    } else {
      // Create new user with default psychology-informed settings
      user = new User({
        email,
        passwordHash: 'google-oauth', // Placeholder since we're using OAuth
        profile: {
          decisionMakingStyle: 'balanced',
          stressLevel: 5,
          preferredComplexity: 'moderate',
          emotionalState: {
            confidence: 5,
            urgency: 5,
            anxiety: 5
          },
          cognitivePreferences: {
            maxChoicesPerDecision: 5,
            preferredVisualization: 'auto',
            stressReductionMode: true
          }
        },
        gamification: {
          level: 1,
          xp: 0,
          streak: 0,
          badges: ['newcomer'],
          satisfactionHistory: []
        }
      });

      await user.save();
    }

    if (!user) {
      res.status(500).json({
        success: false,
        message: 'Failed to create or find user'
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: (user._id as string).toString(),
      email: user.email
    });

    res.json({
      success: true,
      message: user ? 'Welcome back!' : 'Account created successfully!',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          gamification: user.gamification
        }
      }
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};