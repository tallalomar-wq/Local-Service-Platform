import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface ServiceCategory {
  id: number;
  name: string;
  icon: string;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
}

interface ProviderProfile {
  id: number;
  businessName: string;
  bio: string;
  serviceCategoryId: number;
  hourlyRate: number;
  yearsOfExperience: number;
  address?: string;
  city: string;
  state: string;
  zipCode: string;
  availableHours?: string;
  certifications?: string;
  insurance?: string;
  rating?: number;
  totalReviews?: number;
  completedBookings?: number;
  subscriptionStatus: string;
  serviceCategory?: ServiceCategory;
  subscriptionPlan?: SubscriptionPlan;
}

const ProviderProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>({
    businessName: '',
    bio: '',
    serviceCategoryId: '',
    hourlyRate: '',
    yearsOfExperience: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    availableHours: '',
    certifications: '',
    insurance: '',
  });
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const hasProfile = !!profileData;

  // Fetch provider profile and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch services
        const servicesRes = await api.get('/services');
        setServices(servicesRes.data.services || []);

        // Fetch provider profile
        try {
          const profileRes = await api.get('/providers/me');
          const profile = profileRes.data.provider;
          setProfileData(profile);
          setFormData({
            businessName: profile.businessName || '',
            bio: profile.bio || '',
            serviceCategoryId: profile.serviceCategoryId || '',
            hourlyRate: profile.hourlyRate || '',
            yearsOfExperience: profile.yearsOfExperience || '',
            address: profile.address || '',
            city: profile.city || '',
            state: profile.state || '',
            zipCode: profile.zipCode || '',
            availableHours: profile.availableHours || '',
            certifications: profile.certifications || '',
            insurance: profile.insurance || '',
          });
        } catch (err: any) {
          if (err.response?.status !== 404) {
            console.error('Error fetching profile:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      let response;
      if (hasProfile) {
        // Update existing profile
        response = await api.put('/providers/me', formData);
        setSuccess('Profile updated successfully!');
      } else {
        // Create new profile
        response = await api.post('/providers', formData);
        setSuccess('Profile created successfully!');
      }

      // Update profile data with response
      const updatedProfile = response.data.provider;
      setProfileData(updatedProfile);
      setIsEditing(false);

      // Refresh profile to get full data with relations
      const profileRes = await api.get('/providers/me');
      setProfileData(profileRes.data.provider);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      const response = await api.post('/subscriptions/portal-session');
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to open subscription management');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
        <span className="ml-4 text-xl text-primary-600">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {hasProfile ? 'Provider Profile' : 'Create Provider Profile'}
        </h1>
        {hasProfile && !isEditing && (
          <button
            onClick={() => {
              setIsEditing(true);
              setError('');
              setSuccess('');
            }}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* View Mode: Always show updated info after update */}
      {hasProfile && !isEditing && profileData && (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-600 font-semibold mb-1">Business Name</h3>
              <p className="text-lg">{profileData.businessName}</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-semibold mb-1">Service Category</h3>
              <p className="text-lg">{profileData.serviceCategory?.icon} {profileData.serviceCategory?.name}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-gray-600 font-semibold mb-1">Bio</h3>
              <p className="text-lg">{profileData.bio}</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-semibold mb-1">Hourly Rate</h3>
              <p className="text-lg">${profileData.hourlyRate}/hour</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-semibold mb-1">Experience</h3>
              <p className="text-lg">{profileData.yearsOfExperience} years</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-semibold mb-1">City</h3>
              <p className="text-lg">{profileData.city}</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-semibold mb-1">State</h3>
              <p className="text-lg">{profileData.state}</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-semibold mb-1">ZIP Code</h3>
              <p className="text-lg">{profileData.zipCode}</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-semibold mb-1">Available Hours</h3>
              <p className="text-lg">{profileData.availableHours || 'Not specified'}</p>
            </div>
            {profileData.address && (
              <div className="md:col-span-2">
                <h3 className="text-gray-600 font-semibold mb-1">Address</h3>
                <p className="text-lg">{profileData.address}</p>
              </div>
            )}
            {profileData.certifications && (
              <div className="md:col-span-2">
                <h3 className="text-gray-600 font-semibold mb-1">Certifications</h3>
                <p className="text-lg">{profileData.certifications}</p>
              </div>
            )}
            {profileData.insurance && (
              <div className="md:col-span-2">
                <h3 className="text-gray-600 font-semibold mb-1">Insurance</h3>
                <p className="text-lg">{profileData.insurance}</p>
              </div>
            )}
            <div>
              <h3 className="text-gray-600 font-semibold mb-1">Rating</h3>
              <p className="text-lg">⭐ {profileData.rating || 'New'}</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-semibold mb-1">Total Reviews</h3>
              <p className="text-lg">{profileData.totalReviews || 0}</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-semibold mb-1">Completed Bookings</h3>
              <p className="text-lg">{profileData.completedBookings || 0}</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-semibold mb-1">Subscription Plan</h3>
              <p className="text-lg">
                {profileData.subscriptionPlan ? (
                  <span className="font-semibold text-blue-600">
                    {profileData.subscriptionPlan.name}
                    <span className="text-gray-600 font-normal"> - ${profileData.subscriptionPlan.price}/month</span>
                  </span>
                ) : (
                  <span className="capitalize">{profileData.subscriptionStatus}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mode: Show form only if editing or no profile */}
      {(!hasProfile || isEditing) && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mt-6">
          {/* Business Name */}
          <div className="md:col-span-2 mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Business Name *</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          {/* Bio */}
          <div className="md:col-span-2 mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Bio / Description *</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Tell customers about your business and expertise..."
              required
            />
          </div>
          {/* Service Category */}
          <div className="md:col-span-2 mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Service Category *</label>
            <select
              name="serviceCategoryId"
              value={formData.serviceCategoryId || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="" disabled>Select a service...</option>
              {services.length === 0 ? (
                <option value="" disabled>No services available</option>
              ) : (
                services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.icon} {service.name}
                  </option>
                ))
              )}
            </select>
          </div>
          {/* Hourly Rate */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Hourly Rate ($) *</label>
            <input
              type="number"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="50"
              required
            />
          </div>
          {/* Years of Experience */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Years of Experience *</label>
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="5"
              required
            />
          </div>
          {/* Address */}
          <div className="md:col-span-2 mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="123 Main St"
            />
          </div>
          {/* City */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          {/* State */}
          <div className="mb-4">
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
          {/* ZIP Code */}
          <div className="mb-4">
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
          {/* Available Hours */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Available Hours</label>
            <input
              type="text"
              name="availableHours"
              value={formData.availableHours}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Mon-Fri 9am-5pm"
            />
          </div>
          {/* Certifications */}
          <div className="md:col-span-2 mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Certifications</label>
            <input
              type="text"
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Licensed & Certified Professional"
            />
          </div>
          {/* Insurance */}
          <div className="md:col-span-2 mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Insurance</label>
            <input
              type="text"
              name="insurance"
              value={formData.insurance}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Fully insured and bonded"
            />
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="mt-8 w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : hasProfile ? 'Update Profile' : 'Create Profile'}
          </button>
          {/* Cancel Button for Edit Mode */}
          {hasProfile && isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setError('');
                setSuccess('');
              }}
              className="mt-4 w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </form>
      )}

      {/* Manage Subscription Button: Only show if profile exists and has subscriptionPlan */}
      {hasProfile && profileData && profileData.subscriptionPlan && (
        <div className="mt-8">
          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Manage Subscription'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProviderProfilePage;
