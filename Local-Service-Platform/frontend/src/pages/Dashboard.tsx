import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-xl mb-2">Welcome, {user?.firstName}!</p>
        <p className="text-gray-600">Role: {user?.role}</p>
      </div>
    </div>
  );
};

export default Dashboard;
