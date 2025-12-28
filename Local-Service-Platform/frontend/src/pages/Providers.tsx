import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const Providers: React.FC = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const params: any = {};
        const serviceId = searchParams.get('service');
        if (serviceId) params.category = serviceId;

        const response = await api.get('/providers', { params });
        setProviders(response.data.providers);
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [searchParams]);

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Service Providers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <Link
            key={provider.id}
            to={`/providers/${provider.id}`}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-2">{provider.businessName}</h3>
            <p className="text-gray-600 mb-2">{provider.serviceCategory?.name}</p>
            <p className="text-sm text-gray-500 mb-2">{provider.city}, {provider.state}</p>
            <div className="flex items-center mb-2">
              <span className="text-yellow-500 mr-1">⭐</span>
              <span className="font-semibold">{provider.rating || 'New'}</span>
              <span className="text-gray-500 text-sm ml-1">
                ({provider.totalReviews} reviews)
              </span>
            </div>
            <p className="text-primary-600 font-semibold">${provider.hourlyRate}/hour</p>
          </Link>
        ))}
      </div>
      {providers.length === 0 && (
        <p className="text-center text-gray-500">No providers found</p>
      )}
    </div>
  );
};

export default Providers;
