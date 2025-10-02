import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { geocodeAddress, calculateCommute, compareLocations } from '../controllers/locationController';

const router = express.Router();

router.post('/geocode', authenticateToken, geocodeAddress);

router.post('/calculate-commute', authenticateToken, calculateCommute);

router.post('/compare', authenticateToken, compareLocations);

export default router;
