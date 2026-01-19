import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      // Poll for new notifications every 10 seconds (more frequent)
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications?unreadOnly=true');
      const newCount = response.data.length;
      
      // Show animation if count increased
      if (newCount > unreadCount && unreadCount > 0) {
        setHasNewNotification(true);
        // Play notification sound (optional)
        setTimeout(() => setHasNewNotification(false), 3000);
      }
      
      setUnreadCount(newCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600">🏡 LocalServices</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              {isAuthenticated && user && (
                <span className="text-gray-700 font-semibold">
                  {getGreeting()}, {user.firstName}!
                </span>
              )}
              <Link to="/services" className="text-gray-700 hover:text-primary-600">
                Services
              </Link>
              <Link to="/providers" className="text-gray-700 hover:text-primary-600">
                Find Providers
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-primary-600">
                    Dashboard
                  </Link>
                  <Link to="/bookings" className="text-gray-700 hover:text-primary-600">
                    My Bookings
                  </Link>
                  <Link 
                    to="/notifications" 
                    className={`relative text-gray-700 hover:text-primary-600 ${hasNewNotification ? 'animate-bounce' : ''}`}
                    onClick={() => setHasNewNotification(false)}
                  >
                    <span className="text-2xl">🔔</span>
                    {unreadCount > 0 && (
                      <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${hasNewNotification ? 'animate-ping' : ''}`}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  {user?.role === 'provider' && (
                    <>
                      <Link to="/provider-profile" className="text-gray-700 hover:text-primary-600">
                        My Profile
                      </Link>
                      <Link to="/subscription" className="text-gray-700 hover:text-primary-600">
                        Subscription
                      </Link>
                    </>
                  )}
                  <button
                    onClick={logout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-primary-600">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>&copy; 2025 LocalServices. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
