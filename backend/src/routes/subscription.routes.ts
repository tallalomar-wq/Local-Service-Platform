import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/plans', SubscriptionController.getPlans);

// Protected routes (require authentication)
router.post(
  '/checkout',
  authenticate,
  SubscriptionController.createCheckoutSession
);

router.get(
  '/current',
  authenticate,
  SubscriptionController.getCurrentSubscription
);

router.post(
  '/cancel',
  authenticate,
  SubscriptionController.cancelSubscription
);

router.put(
  '/update',
  authenticate,
  SubscriptionController.updateSubscription
);

router.post(
  '/portal',
  authenticate,
  SubscriptionController.createPortalSession
);

// Webhook route (no authentication - verified by Stripe signature)
router.post('/webhook', SubscriptionController.handleWebhook);

export default router;
