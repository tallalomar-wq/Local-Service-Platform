import { Request, Response } from 'express';
import { StripeService, SUBSCRIPTION_PLANS } from '../services/stripe.service';
import { ProviderProfile } from '../models/ProviderProfile.model';
import SubscriptionPlan from '../models/SubscriptionPlan.model';
import { User } from '../models/User.model';

export class SubscriptionController {
  /**
   * Get all subscription plans
   */
  static async getPlans(req: Request, res: Response) {
    try {
      const plans = await SubscriptionPlan.findAll({
        where: { isActive: true },
        order: [['displayOrder', 'ASC']],
      });

      res.json(plans);
    } catch (error) {
      console.error('Get plans error:', error);
      res.status(500).json({ message: 'Failed to fetch subscription plans' });
    }
  }

  /**
   * Create checkout session for subscription
   */
  static async createCheckoutSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { planId } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const providerProfile = await ProviderProfile.findOne({ where: { userId } });
      if (!providerProfile) {
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      const plan = await SubscriptionPlan.findByPk(planId);
      if (!plan || !plan.isActive) {
        return res.status(404).json({ message: 'Subscription plan not found' });
      }

      // Handle free plans (no Stripe checkout needed)
      if (!plan.stripePriceId || plan.stripePriceId === '' || plan.price === 0) {
        // Activate free plan directly
        const subscriptionStartDate = new Date();
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 14); // 14 days trial

        await providerProfile.update({
          subscriptionPlanId: plan.id,
          subscriptionStatus: 'active',
          subscriptionStartDate,
          subscriptionEndDate,
        });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.json({ 
          message: 'Free plan activated successfully',
          url: `${frontendUrl}/subscription/success?free=true`
        });
      }

      // Create or get Stripe customer
      let stripeCustomerId = providerProfile.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await StripeService.createCustomer(
          user.email,
          `${user.firstName} ${user.lastName}`
        );
        stripeCustomerId = customer.id;
        await providerProfile.update({ stripeCustomerId });
      }

      // Create checkout session
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const session = await StripeService.createCheckoutSession(
        stripeCustomerId,
        plan.stripePriceId,
        `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        `${frontendUrl}/subscription/cancel`
      );

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Create checkout session error:', error);
      res.status(500).json({ message: 'Failed to create checkout session' });
    }
  }

  /**
   * Get current subscription details
   */
  static async getCurrentSubscription(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const providerProfile = await ProviderProfile.findOne({
        where: { userId },
        include: [
          {
            model: SubscriptionPlan,
            as: 'subscriptionPlan',
          },
        ],
      });

      if (!providerProfile) {
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      let stripeSubscription = null;
      if (providerProfile.stripeSubscriptionId) {
        try {
          stripeSubscription = await StripeService.getSubscription(
            providerProfile.stripeSubscriptionId
          );
        } catch (error) {
          console.error('Error fetching Stripe subscription:', error);
        }
      }

      res.json({
        subscriptionStatus: providerProfile.subscriptionStatus,
        subscriptionStartDate: providerProfile.subscriptionStartDate,
        subscriptionEndDate: providerProfile.subscriptionEndDate,
        currentPlan: providerProfile.subscriptionPlan,
        stripeSubscription,
      });
    } catch (error) {
      console.error('Get current subscription error:', error);
      res.status(500).json({ message: 'Failed to fetch subscription details' });
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const providerProfile = await ProviderProfile.findOne({ where: { userId } });
      if (!providerProfile) {
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      if (!providerProfile.stripeSubscriptionId) {
        return res.status(400).json({ message: 'No active subscription found' });
      }

      await StripeService.cancelSubscription(providerProfile.stripeSubscriptionId);

      await providerProfile.update({
        subscriptionStatus: 'cancelled',
      });

      res.json({ message: 'Subscription cancelled successfully' });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ message: 'Failed to cancel subscription' });
    }
  }

  /**
   * Update subscription plan
   */
  static async updateSubscription(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { planId } = req.body;

      const providerProfile = await ProviderProfile.findOne({ where: { userId } });
      if (!providerProfile) {
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      const plan = await SubscriptionPlan.findByPk(planId);
      if (!plan || !plan.isActive) {
        return res.status(404).json({ message: 'Subscription plan not found' });
      }

      if (!providerProfile.stripeSubscriptionId) {
        return res.status(400).json({ message: 'No active subscription to update' });
      }

      if (!plan.stripePriceId) {
        return res.status(400).json({ message: 'This plan cannot be subscribed to' });
      }

      await StripeService.updateSubscription(
        providerProfile.stripeSubscriptionId,
        plan.stripePriceId
      );

      await providerProfile.update({
        subscriptionPlanId: plan.id,
      });

      res.json({ message: 'Subscription updated successfully' });
    } catch (error) {
      console.error('Update subscription error:', error);
      res.status(500).json({ message: 'Failed to update subscription' });
    }
  }

  /**
   * Create portal session for subscription management
   */
  static async createPortalSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const providerProfile = await ProviderProfile.findOne({ where: { userId } });
      if (!providerProfile || !providerProfile.stripeCustomerId) {
        return res.status(404).json({ message: 'No Stripe customer found' });
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const session = await StripeService.createPortalSession(
        providerProfile.stripeCustomerId,
        `${frontendUrl}/provider/subscription`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error('Create portal session error:', error);
      res.status(500).json({ message: 'Failed to create portal session' });
    }
  }

  /**
   * Handle Stripe webhooks
   */
  static async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const payload = req.body;

      const event = StripeService.constructWebhookEvent(payload, signature);

      switch (event.type) {
        case 'checkout.session.completed':
          await SubscriptionController.handleCheckoutComplete(event.data.object as any);
          break;
        case 'customer.subscription.updated':
          await SubscriptionController.handleSubscriptionUpdated(event.data.object as any);
          break;
        case 'customer.subscription.deleted':
          await SubscriptionController.handleSubscriptionDeleted(event.data.object as any);
          break;
        case 'invoice.payment_succeeded':
          await SubscriptionController.handlePaymentSucceeded(event.data.object as any);
          break;
        case 'invoice.payment_failed':
          await SubscriptionController.handlePaymentFailed(event.data.object as any);
          break;
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ message: 'Webhook error' });
    }
  }

  /**
   * Handle checkout session completed
   */
  private static async handleCheckoutComplete(session: any) {
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    const providerProfile = await ProviderProfile.findOne({
      where: { stripeCustomerId: customerId },
    });

    if (providerProfile && subscriptionId) {
      const subscription = await StripeService.getSubscription(subscriptionId);
      const priceId = subscription.items.data[0].price.id;

      const plan = await SubscriptionPlan.findOne({
        where: { stripePriceId: priceId },
      });

      await providerProfile.update({
        stripeSubscriptionId: subscriptionId,
        subscriptionPlanId: plan?.id,
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(subscription.current_period_start * 1000),
        subscriptionEndDate: new Date(subscription.current_period_end * 1000),
      });
    }
  }

  /**
   * Handle subscription updated
   */
  private static async handleSubscriptionUpdated(subscription: any) {
    const providerProfile = await ProviderProfile.findOne({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (providerProfile) {
      await providerProfile.update({
        subscriptionStatus: subscription.status === 'active' ? 'active' : 'inactive',
        subscriptionEndDate: new Date(subscription.current_period_end * 1000),
      });
    }
  }

  /**
   * Handle subscription deleted/cancelled
   */
  private static async handleSubscriptionDeleted(subscription: any) {
    const providerProfile = await ProviderProfile.findOne({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (providerProfile) {
      await providerProfile.update({
        subscriptionStatus: 'cancelled',
      });
    }
  }

  /**
   * Handle successful payment
   */
  private static async handlePaymentSucceeded(invoice: any) {
    console.log('Payment succeeded for invoice:', invoice.id);
    // Additional logic can be added here (e.g., send confirmation email)
  }

  /**
   * Handle failed payment
   */
  private static async handlePaymentFailed(invoice: any) {
    const customerId = invoice.customer;
    const providerProfile = await ProviderProfile.findOne({
      where: { stripeCustomerId: customerId },
    });

    if (providerProfile) {
      console.log('Payment failed for provider:', providerProfile.id);
      // Send notification email or update status
    }
  }
}
