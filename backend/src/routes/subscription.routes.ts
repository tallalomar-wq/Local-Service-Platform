import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/plans', SubscriptionController.getPlans);

// Protected routes (require authentication)
router.post(
  '/checkout',
  authMiddleware,
  SubscriptionController.createCheckoutSession
);

router.get(
  '/current',
  authMiddleware,
  SubscriptionController.getCurrentSubscription
);

router.post(
  '/cancel',
  authMiddleware,
  SubscriptionController.cancelSubscription
);

router.put(
  '/update',
  authMiddleware,
  SubscriptionController.updateSubscription
);

router.post(
  '/portal',
  authMiddleware,
  SubscriptionController.createPortalSession
);

// Webhook route (no authentication - verified by Stripe signature)
router.post('/webhook', SubscriptionController.handleWebhook);

export default router;
