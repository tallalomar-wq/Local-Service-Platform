import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export default stripe;

export const SUBSCRIPTION_PLANS = {
  FREE_TRIAL: {
    name: 'Free Trial',
    price: 0,
    duration: 14, // days
    features: [
      '5 service requests per month',
      'Basic profile listing',
      'Email notifications',
      '10% commission on bookings'
    ]
  },
  BASIC: {
    name: 'Basic',
    priceId: process.env.STRIPE_BASIC_PRICE_ID || '',
    price: 29,
    features: [
      'Unlimited service requests',
      'Featured profile listing',
      'Email & SMS notifications',
      'Priority support',
      '8% commission on bookings'
    ]
  },
  PRO: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    price: 49,
    features: [
      'Everything in Basic',
      'Top placement in search',
      'Advanced analytics',
      'Custom branding',
      '5% commission on bookings',
      'Dedicated account manager'
    ]
  }
};

export class StripeService {
  /**
   * Create a new Stripe customer
   */
  static async createCustomer(email: string, name: string) {
    return await stripe.customers.create({
      email,
      name,
      metadata: {
        platform: 'ServiceHub'
      }
    });
  }

  /**
   * Create a checkout session for subscription
   */
  static async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    return await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  /**
   * Get subscription details
   */
  static async getSubscription(subscriptionId: string) {
    return await stripe.subscriptions.retrieve(subscriptionId);
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string) {
    return await stripe.subscriptions.cancel(subscriptionId);
  }

  /**
   * Update subscription
   */
  static async updateSubscription(subscriptionId: string, priceId: string) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }

  /**
   * Create a payment intent for booking commission
   */
  static async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    customerId: string,
    metadata: any = {}
  ) {
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  /**
   * Get customer portal session (for managing subscription)
   */
  static async createPortalSession(customerId: string, returnUrl: string) {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  /**
   * Construct webhook event from request
   */
  static constructWebhookEvent(payload: string | Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
