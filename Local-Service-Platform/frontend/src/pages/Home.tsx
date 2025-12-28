import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Find Trusted Local Service Providers</h1>
          <p className="text-xl mb-8">
            Book cleaning, plumbing, lawn care, and more from verified professionals
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/services"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Browse Services
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-400"
              >
                Become a Provider
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose LocalServices?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-semibold mb-2">Verified Providers</h3>
              <p className="text-gray-600">
                All service providers are verified, licensed, and insured
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2">Real Reviews</h3>
              <p className="text-gray-600">
                Read genuine reviews from customers in your area
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Book services online in minutes with instant confirmation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Services */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'House Cleaning', icon: '🧹' },
              { name: 'Lawn Care', icon: '🌿' },
              { name: 'Plumbing', icon: '🔧' },
              { name: 'Electrical', icon: '⚡' },
              { name: 'Handyman', icon: '🔨' },
              { name: 'Pet Grooming', icon: '🐕' },
              { name: 'Moving', icon: '📦' },
              { name: 'Painting', icon: '🎨' },
            ].map((service) => (
              <Link
                key={service.name}
                to="/services"
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center"
              >
                <div className="text-4xl mb-2">{service.icon}</div>
                <h3 className="font-semibold">{service.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join thousands of satisfied customers</p>
          <Link
            to={isAuthenticated ? '/services' : '/register'}
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
          >
            {isAuthenticated ? 'Browse Services' : 'Sign Up Now'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
