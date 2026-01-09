import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Bookings: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReviewForm, setShowReviewForm] = useState<number | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [showPaymentRequestForm, setShowPaymentRequestForm] = useState<number | null>(null);
  const [paymentRequestData, setPaymentRequestData] = useState({ amount: '', reason: '', description: '' });
  const [paymentRequests, setPaymentRequests] = useState<{[key: number]: any[]}>({});

  // Get provider info from navigation state
  const providerId = location.state?.providerId;
  const provider = location.state?.provider;

  const [formData, setFormData] = useState({
    providerId: providerId || '',
    serviceDate: '',
    serviceTime: '',
    duration: '2',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    description: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
    
    // If coming from provider detail page, show booking form
    if (providerId && provider) {
      setShowForm(true);
      setFormData(prev => ({ ...prev, providerId }));
    }
  }, [user, navigate, providerId, provider]);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.bookings || []);
      
      // Fetch payment adjustments for each booking
      const requestsMap: {[key: number]: any[]} = {};
      for (const booking of response.data.bookings || []) {
        try {
          const adjResponse = await api.get(`/bookings/${booking.id}/adjustments`);
          requestsMap[booking.id] = adjResponse.data.adjustments || [];
        } catch (err) {
          requestsMap[booking.id] = [];
        }
      }
      setPaymentRequests(requestsMap);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBookingAction = async (bookingId: number, action: 'confirmed' | 'cancelled' | 'completed') => {
    setError('');
    setSuccess('');
    
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: action });
      const actionText = action === 'confirmed' ? 'confirmed' : action === 'cancelled' ? 'cancelled' : 'completed';
      setSuccess(`Booking ${actionText} successfully!`);
      fetchBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} booking`);
    }
  };

  const handleReviewSubmit = async (bookingId: number) => {
    setError('');
    setSuccess('');

    if (reviewData.rating < 1 || reviewData.rating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }

    try {
      await api.post('/reviews', {
        bookingId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      setSuccess('Review submitted successfully!');
      setShowReviewForm(null);
      setReviewData({ rating: 5, comment: '' });
      fetchBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handlePaymentRequest = async (bookingId: number) => {
    setError('');
    setSuccess('');

    const amount = parseFloat(paymentRequestData.amount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!paymentRequestData.reason) {
      setError('Please provide a reason for the additional charge');
      return;
    }

    try {
      await api.post(`/bookings/${bookingId}/request-payment`, {
        amount,
        reason: paymentRequestData.reason,
        description: paymentRequestData.description,
      });
      setSuccess('Payment request sent to customer!');
      setShowPaymentRequestForm(null);
      setPaymentRequestData({ amount: '', reason: '', description: '' });
      fetchBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send payment request');
    }
  };

  const handlePaymentResponse = async (adjustmentId: number, action: 'approve' | 'reject') => {
    setError('');
    setSuccess('');

    try {
      await api.put(`/bookings/adjustments/${adjustmentId}/respond`, { action });
      setSuccess(action === 'approve' ? 'Payment approved!' : 'Payment request rejected');
      fetchBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to respond to payment request');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const bookingData = {
        ...formData,
        duration: parseInt(formData.duration),
        serviceCategoryId: provider?.serviceCategoryId,
      };

      await api.post('/bookings', bookingData);
      setSuccess('Booking created successfully!');
      setShowForm(false);
      fetchBookings();
      
      // Clear form
      setFormData({
        providerId: '',
        serviceDate: '',
        serviceTime: '',
        duration: '2',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        description: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Bookings</h1>
        {!showForm && user?.role === 'customer' && (
          <button
            onClick={() => navigate('/providers')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Find Providers
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      {/* Booking Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {provider ? `Book ${provider.businessName}` : 'Create New Booking'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {provider && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{provider.serviceCategory?.icon}</span>
                <div>
                  <h3 className="font-semibold">{provider.businessName}</h3>
                  <p className="text-sm text-gray-600">{provider.serviceCategory?.name}</p>
                  <p className="text-primary-600 font-semibold">${provider.hourlyRate}/hour</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Service Date *</label>
                <input
                  type="date"
                  name="serviceDate"
                  value={formData.serviceDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Service Time *</label>
                <input
                  type="time"
                  name="serviceTime"
                  value={formData.serviceTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Duration (hours) *</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="6">6 hours</option>
                  <option value="8">8 hours (full day)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="123 Main St"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Detroit"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="MI"
                  maxLength={2}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">ZIP Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="48201"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Describe the service you need..."
              />
            </div>

            {provider && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Estimated Cost:</strong> ${provider.hourlyRate * parseInt(formData.duration || '2')} 
                  ({formData.duration || '2'} hours × ${provider.hourlyRate}/hour)
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700"
              >
                Confirm Booking
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">No bookings yet. Book a service to get started!</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{booking.serviceCategory?.icon}</span>
                    <div>
                      <h3 className="font-bold text-lg">{booking.provider?.businessName}</h3>
                      <p className="text-gray-600">{booking.serviceCategory?.name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-semibold">
                        {formatDate(booking.serviceDate)} at {booking.serviceTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">{booking.duration} hours</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold">{booking.address}</p>
                      <p className="text-sm text-gray-600">
                        {booking.city}, {booking.state} {booking.zipCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cost</p>
                      <p className="font-semibold text-primary-600">
                        ${booking.estimatedCost || booking.finalCost || 'TBD'}
                      </p>
                    </div>
                  </div>

                  {booking.description && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="text-gray-700">{booking.description}</p>
                    </div>
                  )}

                  {/* Provider Actions for Pending Bookings */}
                  {user?.role === 'provider' && booking.status === 'pending' && (
                    <div className="flex gap-3 mt-4 pt-4 border-t">
                      <button
                        onClick={() => handleBookingAction(booking.id, 'confirmed')}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-semibold"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleBookingAction(booking.id, 'cancelled')}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition font-semibold"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}

                  {/* Provider Action - Mark as Completed */}
                  {user?.role === 'provider' && booking.status === 'confirmed' && (
                    <div className="flex gap-3 mt-4 pt-4 border-t">
                      <button
                        onClick={() => handleBookingAction(booking.id, 'completed')}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-semibold"
                      >
                        ✓ Mark as Completed
                      </button>
                    </div>
                  )}

                  {/* Provider Action - Request Additional Payment */}
                  {user?.role === 'provider' && ['confirmed', 'in-progress'].includes(booking.status) && (
                    <div className="mt-4 pt-4 border-t">
                      {showPaymentRequestForm === booking.id ? (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-3">Request Additional Payment</h4>
                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-2">Amount ($)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={paymentRequestData.amount}
                              onChange={(e) => setPaymentRequestData({ ...paymentRequestData, amount: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="100.00"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-2">Reason</label>
                            <select
                              value={paymentRequestData.reason}
                              onChange={(e) => setPaymentRequestData({ ...paymentRequestData, reason: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="">Select reason...</option>
                              <option value="extra_time">Extra Time/Hours</option>
                              <option value="materials">Materials</option>
                              <option value="scope_increase">Scope Increase</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                            <textarea
                              value={paymentRequestData.description}
                              onChange={(e) => setPaymentRequestData({ ...paymentRequestData, description: e.target.value })}
                              rows={2}
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Explain the additional charge..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePaymentRequest(booking.id)}
                              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-semibold"
                            >
                              Send Request
                            </button>
                            <button
                              onClick={() => {
                                setShowPaymentRequestForm(null);
                                setPaymentRequestData({ amount: '', reason: '', description: '' });
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowPaymentRequestForm(booking.id)}
                          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition font-semibold"
                        >
                          💰 Request Additional Payment
                        </button>
                      )}
                    </div>
                  )}

                  {/* Show Payment Requests */}
                  {paymentRequests[booking.id] && paymentRequests[booking.id].length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-3">Payment Requests</h4>
                      {paymentRequests[booking.id].map((request) => (
                        <div key={request.id} className="bg-gray-50 p-4 rounded-lg mb-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-lg text-green-600">${request.amount}</p>
                              <p className="text-sm text-gray-600 capitalize">{request.reason.replace('_', ' ')}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          {request.description && (
                            <p className="text-sm text-gray-700 mb-2">{request.description}</p>
                          )}
                          {user?.role === 'customer' && request.status === 'pending' && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handlePaymentResponse(request.id, 'approve')}
                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-semibold"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => handlePaymentResponse(request.id, 'reject')}
                                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-semibold"
                              >
                                ✕ Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Customer Action - Leave Review */}
                  {user?.role === 'customer' && booking.status === 'completed' && !booking.review && (
                    <div className="mt-4 pt-4 border-t">
                      {showReviewForm === booking.id ? (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-3">Leave a Review</h4>
                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-2">Rating</label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                                  className={`text-3xl ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-2">Comment</label>
                            <textarea
                              value={reviewData.comment}
                              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Share your experience..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReviewSubmit(booking.id)}
                              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 font-semibold"
                            >
                              Submit Review
                            </button>
                            <button
                              onClick={() => {
                                setShowReviewForm(null);
                                setReviewData({ rating: 5, comment: '' });
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowReviewForm(booking.id)}
                          className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition font-semibold"
                        >
                          ⭐ Leave a Review
                        </button>
                      )}
                    </div>
                  )}

                  {/* Show Review if Already Left */}
                  {user?.role === 'customer' && booking.review && (
                    <div className="mt-4 pt-4 border-t bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Your Review</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-yellow-400">
                          {'★'.repeat(booking.review.rating)}{'☆'.repeat(5 - booking.review.rating)}
                        </div>
                        <span className="text-sm text-gray-600">{booking.review.rating}/5</span>
                      </div>
                      {booking.review.comment && (
                        <p className="text-gray-700">{booking.review.comment}</p>
                      )}
                    </div>
                  )}

                  {/* Customer Info for Provider */}
                  {user?.role === 'provider' && booking.customer && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-1">Customer</p>
                      <p className="font-semibold">
                        {booking.customer.firstName} {booking.customer.lastName}
                      </p>
                      {booking.customer.phone && (
                        <p className="text-sm text-gray-600">{booking.customer.phone}</p>
                      )}
                      {booking.customer.email && (
                        <p className="text-sm text-gray-600">{booking.customer.email}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Bookings;
