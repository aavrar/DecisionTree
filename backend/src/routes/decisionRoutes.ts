import { Router } from 'express';
import { 
  createDecision, 
  getDecisions, 
  getDecision, 
  updateDecision, 
  deleteDecision, 
  getStats 
} from '../controllers/decisionController';
import { validateDecision, handleValidationErrors } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', validateDecision, handleValidationErrors, createDecision);
router.get('/', getDecisions);
router.get('/stats', getStats);
router.get('/:id', getDecision);
router.put('/:id', updateDecision);
router.delete('/:id', deleteDecision);

export default router;