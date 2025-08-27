/**
 * Authentication Context for TexPro AI
 * Manages user authentication state across the application
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { User, LoginRequest, LoginResponse } from '../types/api';
import apiService from '../services/api';
import { getRoleDashboard } from '../../lib/roles';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  getDashboardRoute: (userRole: string) => string;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use useRef instead of state for timer to avoid re-renders
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-logout after 5 minutes of inactivity
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
  const WARNING_THRESHOLD = 60; // Show warning 60 seconds before logout

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      
      // Clear inactivity timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Redirect to login page without force parameter to prevent loops
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, []); // No dependencies to prevent loops

  const resetInactivityTimer = useCallback(() => {
    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    // Set new timer only if user is authenticated
    if (user) {
      const timer = setTimeout(() => {
        console.log('Auto-logout due to inactivity');
        logout();
        alert('You have been logged out due to inactivity. Please login again.');
      }, INACTIVITY_TIMEOUT);
      
      inactivityTimerRef.current = timer;
    }
  }, [user, logout]); // Now both are stable

  // Set up activity listeners
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetTimer = () => {
      resetInactivityTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Initialize timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user, resetInactivityTimer]); // Now using callback

  // Track navigation - force logout when leaving dashboard areas
  // TEMPORARILY DISABLED to prevent infinite loops
  /*
  useEffect(() => {
    if (typeof window === 'undefined' || !user) return;

    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      const isDashboardRoute = currentPath.includes('/admin') || 
                              currentPath.includes('/supervisor') || 
                              currentPath.includes('/technician') || 
                              currentPath.includes('/inspector') || 
                              currentPath.includes('/analyst');
      
      // Only logout if on landing page (not login page)
      if (!isDashboardRoute && currentPath === '/') {
        console.log('User navigated to landing page - logging out for security');
        logout();
      }
    };

    // Listen to popstate (back/forward buttons) - but don't call immediately
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [user]); // Removed logout from dependencies to prevent infinite loops
  */

  useEffect(() => {
    // Check for existing authentication on mount
    console.log('AuthContext: useEffect triggered - calling checkAuthStatus');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('AuthContext: checkAuthStatus function called!');
    
    // Ensure we're in the browser environment
    if (typeof window === 'undefined') {
      console.log('AuthContext: Not in browser environment');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('AuthContext: Checking auth status');
      // Check if user data exists in localStorage
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access_token');
      
      console.log('AuthContext: localStorage user:', storedUser ? 'found' : 'null');
      console.log('AuthContext: localStorage access_token:', accessToken ? 'found' : 'null');

      if (storedUser && accessToken) {
        console.log('AuthContext: Found stored user and token');
        const userData = JSON.parse(storedUser);
        
        // Validate user data structure
        if (userData && userData.role) {
          console.log('AuthContext: Setting user from localStorage with role:', userData.role);
          setUser(userData);

          // Skip token verification for now to simplify debugging
          console.log('AuthContext: User restored from localStorage successfully');
        } else {
          console.warn('AuthContext: Invalid stored user data, clearing auth');
          await logout();
        }
      } else {
        console.log('AuthContext: No stored auth data found');
        setUser(null);
      }
    } catch (error) {
      console.error('AuthContext: Error checking auth status:', error);
      await logout();
    } finally {
      console.log('AuthContext: Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Starting login process');
      const response: LoginResponse = await apiService.login(credentials);
      console.log('AuthContext: Login response received:', response);
      
      if (response.user && response.user.role) {
        console.log('AuthContext: Setting user with role:', response.user.role);
        setUser(response.user);
        
        // Validate that we have a proper role before storing
        const validRoles = ['admin', 'supervisor', 'technician', 'inspector', 'analyst'];
        if (!validRoles.includes(response.user.role)) {
          throw new Error(`Invalid user role: ${response.user.role}`);
        }
        
        // Store user data in localStorage explicitly
        console.log('AuthContext: Storing user data in localStorage');
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Also verify the tokens are stored
        const storedTokens = localStorage.getItem('access_token');
        console.log('AuthContext: Tokens stored:', storedTokens ? 'yes' : 'no');
      } else {
        throw new Error('Invalid user data received from login');
      }
      
      // Store user data in localStorage (already handled in apiService)
      // localStorage.setItem('user', JSON.stringify(response.user));
      
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get dashboard route based on user role
  const getDashboardRoute = (userRole: string): string => {
    console.log('AuthContext: Getting dashboard route for role:', userRole);
    
    // Validate role
    if (!userRole || typeof userRole !== 'string') {
      console.warn('AuthContext: Invalid role provided to getDashboardRoute:', userRole);
      return '/admin'; // Fallback
    }
    
    const route = getRoleDashboard(userRole as any);
    console.log('AuthContext: Dashboard route resolved to:', route);
    
    // Additional validation
    if (!route || route.includes('undefined') || route === '/undefined') {
      console.error('AuthContext: Invalid dashboard route generated:', route, 'for role:', userRole);
      return '/admin'; // Fallback to admin
    }
    
    return route;
  };

  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
    } catch (error) {
      console.error('Error refreshing user:', error);
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUser,
    getDashboardRoute,
    resetInactivityTimer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protecting routes
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login (this would be handled by middleware in a real app)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }

    return <Component {...props} />;
  };
};

// Hook for role-based access control
export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isSupervisor = (): boolean => hasRole(['admin', 'supervisor']);
  const isTechnician = (): boolean => hasRole('technician');
  const isInspector = (): boolean => hasRole('inspector');
  const isAnalyst = (): boolean => hasRole('analyst');

  const canManageUsers = (): boolean => isAdmin();
  const canManageMachines = (): boolean => hasRole(['admin', 'supervisor']);
  const canViewAnalytics = (): boolean => hasRole(['admin', 'supervisor', 'analyst']);
  const canPerformMaintenance = (): boolean => hasRole(['admin', 'supervisor', 'technician']);
  const canInspectQuality = (): boolean => hasRole(['admin', 'supervisor', 'inspector']);

  return {
    user,
    hasRole,
    isAdmin,
    isSupervisor,
    isTechnician,
    isInspector,
    isAnalyst,
    canManageUsers,
    canManageMachines,
    canViewAnalytics,
    canPerformMaintenance,
    canInspectQuality,
  };
};
