import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProviderProfile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasProfile, setHasProfile] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  const [formData, setFormData] = useState({
    businessName: '',
    bio: '',
    serviceCategoryId: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    hourlyRate: '',
    yearsOfExperience: '',
    certifications: '',
    insurance: '',
    availableHours: '',
  });

  useEffect(() => {
    fetchServices();
    fetchProfile();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      console.log('Services response:', response.data);
      setServices(response.data.services);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load service categories. Please refresh the page.');
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/providers?user=${user?.id}`);
      if (response.data.providers && response.data.providers.length > 0) {
        const profile = response.data.providers[0];
        setHasProfile(true);
        setProfileData(profile);
        setFormData({
          businessName: profile.businessName || '',
          bio: profile.bio || '',
          serviceCategoryId: String(profile.serviceCategoryId || ''),
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          zipCode: profile.zipCode || '',
          hourlyRate: String(profile.hourlyRate || ''),
          yearsOfExperience: String(profile.yearsOfExperience || ''),
          certifications: profile.certifications || '',
          insurance: profile.insurance || '',
          availableHours: profile.availableHours || '',
        });
        setIsEditing(false);
      } else {
        // No profile found - reset to empty form
        setHasProfile(false);
        setProfileData(null);
        setFormData({
          businessName: '',
          bio: '',
          serviceCategoryId: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          hourlyRate: '',
          yearsOfExperience: '',
          certifications: '',
          insurance: '',
          availableHours: '',
        });
        setIsEditing(true);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      // Reset form on error
      setHasProfile(false);
      setProfileData(null);
      setFormData({
        businessName: '',
        bio: '',
        serviceCategoryId: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        hourlyRate: '',
        yearsOfExperience: '',
        certifications: '',
        insurance: '',
        availableHours: '',
      });
      setIsEditing(true);
      setError('Error loading profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (hasProfile) {
        await api.put('/providers', formData);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        await fetchProfile();
      } else {
        await api.post('/providers', formData);
        setSuccess('Profile created successfully! Please logout and login again for changes to take effect.');
        // Refresh to get the created profile data
        await fetchProfile();
      }
    } catch (err: any) {
      console.error('Save error:', err);
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.message || err.message || 'Error saving profile';
      setError(`${errorMsg} (Status: ${err.response?.status || 'Unknown'})`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {hasProfile ? 'Provider Profile' : 'Create Provider Profile'}
        </h1>
        {hasProfile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
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

      {/* View Mode */}
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
              <h3 className="text-gray-600 font-semibold mb-1">Subscription Status</h3>
              <p className="text-lg capitalize">{profileData.subscriptionStatus}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mode */}
      {(!hasProfile || isEditing) && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
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

            <div className="md:col-span-2">
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

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">Service Category *</label>
              <select
                name="serviceCategoryId"
                value={formData.serviceCategoryId || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="" disabled>Select a service...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.icon} {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
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

            <div>
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

            <div className="md:col-span-2">
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

            <div>
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

            <div>
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

            <div className="md:col-span-2">
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

            <div className="md:col-span-2">
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
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-8 w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : hasProfile ? 'Update Profile' : 'Create Profile'}
          </button>

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
    </div>
  );
};

export default ProviderProfile;
