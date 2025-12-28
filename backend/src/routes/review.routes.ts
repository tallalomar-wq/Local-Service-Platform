import { Router } from 'express';
import { createReview, getProviderReviews, addReviewResponse } from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createReview);
router.get('/provider/:providerId', getProviderReviews);
router.put('/:id/response', authenticate, authorize('provider'), addReviewResponse);

export default router;
