import { Router } from 'express';
import {
  getAllProviders,
  getProviderById,
  createProviderProfile,
  updateProviderProfile,
  getMyProviderProfile,
} from '../controllers/provider.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getAllProviders);
router.get('/me', authenticate, getMyProviderProfile);
router.get('/:id', getProviderById);
router.post('/', authenticate, createProviderProfile);
router.put('/', authenticate, authorize('provider'), updateProviderProfile);

export default router;
