'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  console.log('DashboardLayout - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'user:', user?.username);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// Temporarily disable withAuth to debug
export default DashboardLayout;
