import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProviderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await api.get(`/providers/${id}`);
        setProvider(response.data.provider);
      } catch (err: any) {
        console.error('Error fetching provider:', err);
        setError('Failed to load provider details');
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Navigate to booking page with provider info
    navigate('/bookings', { state: { providerId: id, provider } });
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  if (error || !provider) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Provider not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header Section */}
        <div className="border-b pb-6 mb-6">
          <h1 className="text-4xl font-bold mb-2">{provider.businessName}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span className="text-2xl">{provider.serviceCategory?.icon}</span>
            <span className="text-xl">{provider.serviceCategory?.name}</span>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center">
              <span className="text-yellow-500 text-xl mr-1">⭐</span>
              <span className="font-bold text-lg">{provider.rating || 'New'}</span>
              <span className="text-gray-500 ml-1">({provider.totalReviews || 0} reviews)</span>
            </div>
            {provider.isVerified && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                ✓ Verified
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            {/* About Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-gray-700">{provider.bio || 'No description available.'}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Experience</h3>
                <p className="text-gray-600">{provider.yearsOfExperience || 0} years</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
                <p className="text-gray-600">
                  {provider.city}, {provider.state} {provider.zipCode}
                </p>
              </div>

              {provider.availableHours && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Available Hours</h3>
                  <p className="text-gray-600">{provider.availableHours}</p>
                </div>
              )}

              {provider.certifications && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Certifications</h3>
                  <p className="text-gray-600">{provider.certifications}</p>
                </div>
              )}

              {provider.insurance && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-700 mb-2">Insurance</h3>
                  <p className="text-gray-600">{provider.insurance}</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-gray-700 mb-4">Service Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-600">{provider.completedBookings || 0}</div>
                  <div className="text-sm text-gray-600">Jobs Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-600">{provider.totalReviews || 0}</div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-600">{provider.rating || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
              {provider.reviewsReceived && provider.reviewsReceived.length > 0 ? (
                <div className="space-y-4">
                  {provider.reviewsReceived.map((review: any) => (
                    <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-semibold">
                              {review.customer?.firstName?.[0]}{review.customer?.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">
                              {review.customer?.firstName} {review.customer?.lastName}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="text-yellow-400">
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                              </div>
                              <span className="text-sm text-gray-600">{review.rating}/5</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 mt-3">{review.comment}</p>
                      )}
                      {review.response && (
                        <div className="mt-3 pl-4 border-l-2 border-primary-200 bg-primary-50 p-3 rounded">
                          <p className="text-sm font-semibold text-primary-700 mb-1">Response from provider:</p>
                          <p className="text-sm text-gray-700">{review.response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 bg-gray-50 p-6 rounded-lg text-center">
                  No reviews yet. Be the first to review this provider!
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  ${provider.hourlyRate}
                  <span className="text-lg text-gray-600">/hour</span>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition mb-4"
              >
                Book Now
              </button>

              {provider.user && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Contact</h4>
                  <p className="text-sm text-gray-600">
                    {provider.user.firstName} {provider.user.lastName}
                  </p>
                  {provider.user.phone && (
                    <p className="text-sm text-gray-600">{provider.user.phone}</p>
                  )}
                </div>
              )}

              {provider.address && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Service Address</h4>
                  <p className="text-sm text-gray-600">{provider.address}</p>
                  <p className="text-sm text-gray-600">
                    {provider.city}, {provider.state} {provider.zipCode}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetail;
