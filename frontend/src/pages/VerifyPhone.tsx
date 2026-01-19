import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const VerifyPhone: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/verify-phone', { code });
      setSuccess(true);
      setError('');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setResendMessage('');
    setError('');

    try {
      const response = await api.post('/auth/resend-phone-verification');
      setResendMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-green-600">Phone Verified!</h2>
          <p className="text-gray-600 mb-4">Your phone number has been successfully verified.</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-primary-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-2">Verify Phone Number</h2>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to{' '}
            <span className="font-semibold">{user?.phone || 'your phone'}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Check your terminal/console in development mode
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {resendMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 text-center">
              Enter Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 border rounded-lg text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500"
              maxLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Code expires in 10 minutes
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 mb-3"
          >
            {loading ? 'Verifying...' : 'Verify Phone'}
          </button>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendLoading}
            className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 mb-2"
          >
            {resendLoading ? 'Sending...' : 'Resend Code'}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-gray-600 py-2 hover:underline text-sm"
          >
            Skip for now
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded">
          <p className="text-sm font-semibold mb-2">💡 Development Mode</p>
          <p className="text-xs text-gray-600">
            If Twilio is not configured, check your terminal/console for the verification code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhone;
