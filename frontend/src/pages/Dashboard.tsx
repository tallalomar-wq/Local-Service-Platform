import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const isProvider = user?.role === 'provider';

  const stats = [
    {
      title: isProvider ? 'Total Bookings' : 'Active Bookings',
      value: '0',
      icon: '📅',
      color: 'bg-blue-500',
      link: '/bookings'
    },
    {
      title: isProvider ? 'Total Earnings' : 'Services Booked',
      value: isProvider ? '$0.00' : '0',
      icon: '💰',
      color: 'bg-green-500',
      link: isProvider ? '/provider-profile' : '/services'
    },
    {
      title: isProvider ? 'Rating' : 'Favorites',
      value: isProvider ? '5.0⭐' : '0',
      icon: isProvider ? '⭐' : '❤️',
      color: 'bg-yellow-500',
      link: isProvider ? '/provider-profile' : '/providers'
    },
    {
      title: isProvider ? 'Subscription' : 'Providers',
      value: isProvider ? 'Free Trial' : '0',
      icon: '🎯',
      color: 'bg-purple-500',
      link: isProvider ? '/subscription' : '/providers'
    }
  ];

  const quickActions = isProvider ? [
    { title: 'Complete Profile', icon: '👤', link: '/provider-profile', color: 'bg-blue-600' },
    { title: 'View Bookings', icon: '📋', link: '/bookings', color: 'bg-green-600' },
    { title: 'Manage Subscription', icon: '💎', link: '/subscription', color: 'bg-purple-600' },
  ] : [
    { title: 'Find Services', icon: '🔍', link: '/services', color: 'bg-blue-600' },
    { title: 'Book Provider', icon: '📞', link: '/providers', color: 'bg-green-600' },
    { title: 'My Bookings', icon: '📋', link: '/bookings', color: 'bg-purple-600' },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Welcome Header with Animation */}
      <div className={`mb-8 transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.firstName}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                {isProvider ? 'Manage your services and bookings' : 'Find and book local services easily'}
              </p>
            </div>
            <div className="hidden md:block text-6xl animate-bounce">
              {isProvider ? '🏢' : '🏠'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid with Staggered Animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className={`transform transition-all duration-500 hover:scale-105 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-md`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={`mb-8 transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '400ms' }}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`${action.color} text-white rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="flex items-center space-x-4">
                <span className="text-4xl">{action.icon}</span>
                <span className="text-xl font-semibold">{action.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity / Getting Started */}
      <div className={`transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '600ms' }}>
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {isProvider ? '🚀 Getting Started as a Provider' : '🎯 How It Works'}
          </h2>
          
          {isProvider ? (
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Complete Your Profile</h3>
                  <p className="text-gray-600 text-sm">Add your business details, services, and contact information</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Choose a Subscription Plan</h3>
                  <p className="text-gray-600 text-sm">Start with our free trial or upgrade for more features</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Start Receiving Bookings</h3>
                  <p className="text-gray-600 text-sm">Customers will find and book your services</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Browse Services</h3>
                  <p className="text-gray-600 text-sm">Find the service you need from our categories</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Choose a Provider</h3>
                  <p className="text-gray-600 text-sm">Compare ratings, reviews, and prices</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Book & Pay</h3>
                  <p className="text-gray-600 text-sm">Schedule your service and make secure payment</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
