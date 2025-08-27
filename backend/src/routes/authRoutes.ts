import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { validateUser, validateLogin, handleValidationErrors } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', validateUser, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.get('/profile', authenticateToken, getProfile);

export default router;