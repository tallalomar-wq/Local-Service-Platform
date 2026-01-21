import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Services: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        console.log('Services response:', response.data);
        setServices(response.data.services || []);
      } catch (error: any) {
        console.error('Error fetching services:', error);
        setError(error.response?.data?.message || 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">No services available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Our Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-5xl mb-4">{service.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <Link
              to={`/providers?service=${service.id}`}
              className="text-primary-600 hover:underline"
            >
              Find Providers →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
