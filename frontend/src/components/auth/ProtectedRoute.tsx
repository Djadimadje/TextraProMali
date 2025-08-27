/**
 * Protected Route Component
 * Ensures only authenticated users with correct roles can access routes
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useActivityTracker } from '../../hooks/useActivityTracker';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  redirectTo = '/login?force=true'
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // Track activity for auto-logout
  useActivityTracker();

  useEffect(() => {
    if (!isLoading) {
      // Check authentication
      if (!isAuthenticated || !user) {
        console.log('User not authenticated, redirecting to login');
        router.push(redirectTo);
        return;
      }

      // Check role if specified
      if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!roles.includes(user.role)) {
          console.log(`User role ${user.role} not authorized for this route. Required: ${roles.join(', ')}`);
          // Redirect to appropriate dashboard based on user's actual role
          const dashboardRoute = getDashboardRoute(user.role);
          router.push(dashboardRoute);
          return;
        }
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, redirectTo, router]);

  const getDashboardRoute = (userRole: string): string => {
    const roleRoutes: Record<string, string> = {
      admin: '/admin',
      supervisor: '/supervisor',
      technician: '/technician',
      inspector: '/inspector',
      analyst: '/analyst'
    };
    return roleRoutes[userRole] || '/admin';
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated or wrong role
  if (!isAuthenticated || !user) {
    return null;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return null;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
