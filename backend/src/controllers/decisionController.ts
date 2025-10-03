import { Request, Response } from 'express';
import { Decision, User } from '../models';
import { IDecisionStats } from '../types';

export const createDecision = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { title, description, factors, status = 'draft' } = req.body;

    const decision = new Decision({
      userId: req.user.userId,
      title,
      description,
      factors: factors.map((factor: any, index: number) => ({
        id: factor.id || Date.now().toString() + index,
        name: factor.name,
        weight: factor.weight,
        category: factor.category,
        description: factor.description,
        uncertainty: factor.uncertainty,
        timeHorizon: factor.timeHorizon,
        emotionalWeight: factor.emotionalWeight,
        regretPotential: factor.regretPotential,
        children: factor.children || [] // Include nested children
      })),
      status
    });

    await decision.save();

    const user = await User.findById(req.user.userId);
    if (user) {
      (user as any).awardXP(50);
      await user.save();
    }

    const decisionWithId = {
      ...decision.toObject(),
      id: (decision._id as any).toString()
    };

    res.status(201).json({
      success: true,
      message: 'Decision created successfully',
      data: { decision: decisionWithId }
    });
  } catch (error) {
    console.error('Create decision error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create decision',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const getDecisions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { page = 1, limit = 10, status, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const query: any = { userId: req.user.userId };
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const decisions = await Decision.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Decision.countDocuments(query);

    const decisionsWithId = decisions.map(decision => ({
      ...decision.toObject(),
      id: (decision._id as any).toString()
    }));

    res.json({
      success: true,
      data: {
        decisions: decisionsWithId,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get decisions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get decisions',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const getDecision = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;
    const decision = await Decision.findOne({ _id: id, userId: req.user.userId });

    if (!decision) {
      res.status(404).json({
        success: false,
        message: 'Decision not found'
      });
      return;
    }

    const decisionWithId = {
      ...decision.toObject(),
      id: (decision._id as any).toString()
    };

    res.json({
      success: true,
      data: { decision: decisionWithId }
    });
  } catch (error) {
    console.error('Get decision error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get decision',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const updateDecision = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;
    const updateData = req.body;

    // Only process factors if they're being updated
    if (updateData.factors && Array.isArray(updateData.factors)) {
      updateData.factors = updateData.factors.map((factor: any, index: number) => ({
        id: factor.id || Date.now().toString() + index,
        name: factor.name,
        type: factor.type,
        weight: factor.weight,
        category: factor.category,
        description: factor.description,
        address: factor.address,
        importance: factor.importance,
        uncertainty: factor.uncertainty,
        timeHorizon: factor.timeHorizon,
        emotionalWeight: factor.emotionalWeight,
        regretPotential: factor.regretPotential,
        children: factor.children || []
      }));
    }

    const decision = await Decision.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { $set: updateData },
      { new: true, runValidators: false }
    );

    if (!decision) {
      res.status(404).json({
        success: false,
        message: 'Decision not found'
      });
      return;
    }

    const decisionWithId = {
      ...decision.toObject(),
      id: (decision._id as any).toString()
    };

    res.json({
      success: true,
      message: 'Decision updated successfully',
      data: { decision: decisionWithId }
    });
  } catch (error: any) {
    console.error('Update decision error:', error);
    console.error('Update data:', JSON.stringify(req.body, null, 2));
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update decision',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const deleteDecision = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;
    const decision = await Decision.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!decision) {
      res.status(404).json({
        success: false,
        message: 'Decision not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Decision deleted successfully'
    });
  } catch (error) {
    console.error('Delete decision error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete decision',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const userId = req.user.userId;
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [totalDecisions, activeDecisions, thisMonthDecisions, lastMonthDecisions] = await Promise.all([
      Decision.countDocuments({ userId }),
      Decision.countDocuments({ userId, status: 'active' }),
      Decision.countDocuments({ userId, createdAt: { $gte: thisMonth } }),
      Decision.countDocuments({ 
        userId, 
        createdAt: { 
          $gte: lastMonth, 
          $lt: thisMonth 
        } 
      })
    ]);

    const resolvedDecisions = await Decision.find({ userId, status: 'resolved' });
    const avgSatisfaction = resolvedDecisions.length > 0 
      ? resolvedDecisions.reduce((sum, decision) => sum + (decision as any).calculateFactorScore(), 0) / resolvedDecisions.length
      : 0;

    const stats: IDecisionStats = {
      totalDecisions,
      satisfactionRate: Math.round(avgSatisfaction),
      activeDecisions,
      trends: {
        decisionsThisMonth: thisMonthDecisions,
        satisfactionChange: thisMonthDecisions - lastMonthDecisions
      }
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stats',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};