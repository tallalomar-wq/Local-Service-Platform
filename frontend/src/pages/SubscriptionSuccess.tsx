import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // You could verify the session with your backend here
    if (!sessionId) {
      navigate('/subscription');
    }
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
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
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Subscription Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Your subscription has been activated successfully. You now have access to all the features of your selected plan.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/provider/dashboard')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/subscription')}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            View Subscription Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
