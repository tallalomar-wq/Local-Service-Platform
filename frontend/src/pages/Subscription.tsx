import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  commissionRate: number;
  displayOrder: number;
}

const Subscription: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/subscriptions/plans`);
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/subscriptions/current`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurrentPlan(response.data.currentPlan);
    } catch (error) {
      console.error('Error fetching current subscription:', error);
    }
  };

  const handleSubscribe = async (planId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/subscriptions/checkout`,
        { planId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Redirect to Stripe Checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  const handleManageSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/subscriptions/portal`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert('Failed to open billing portal. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading plans...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600">
          Select the perfect plan for your business
        </p>
      </div>

      {currentPlan && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Current Plan</p>
              <p className="text-lg font-semibold text-gray-900">{currentPlan.name}</p>
            </div>
            <button
              onClick={handleManageSubscription}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Manage Subscription
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow-lg overflow-hidden border-2 ${
              plan.name === 'Pro'
                ? 'border-blue-500 transform scale-105'
                : 'border-gray-200'
            }`}
          >
            {plan.name === 'Pro' && (
              <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                MOST POPULAR
              </div>
            )}
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-gray-600">/{plan.interval}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-6 w-6 text-green-500 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => plan.price > 0 && handleSubscribe(plan.id)}
                disabled={plan.price === 0 || currentPlan?.id === plan.id}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  currentPlan?.id === plan.id
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : plan.name === 'Pro'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } ${plan.price === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {currentPlan?.id === plan.id
                  ? 'Current Plan'
                  : plan.price === 0
                  ? 'Contact Sales'
                  : 'Subscribe Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600">
              We accept all major credit cards through our secure Stripe payment processing.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
            <p className="text-gray-600">
              Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What is the commission rate?</h3>
            <p className="text-gray-600">
              Commission rates vary by plan. Higher-tier plans have lower commission rates on completed bookings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
