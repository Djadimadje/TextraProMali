'use client';
import { useState, useEffect } from 'react';

// Import from relative path for now
const USER_ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor', 
  TECHNICIAN: 'technician',
  INSPECTOR: 'inspector',
  ANALYST: 'analyst'
} as const;

type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: string;
  employeeId?: string;
  department?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for stored auth data on mount
    const token = localStorage.getItem('texproai_auth_token');
    const userData = localStorage.getItem('texproai_user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const { user, token } = data;

      // Store auth data
      localStorage.setItem('texproai_auth_token', token);
      localStorage.setItem('texproai_user_data', JSON.stringify(user));

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });

      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('texproai_auth_token');
    localStorage.removeItem('texproai_user_data');
    
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      localStorage.setItem('texproai_user_data', JSON.stringify(updatedUser));
      setAuthState(prev => ({ ...prev, user: updatedUser }));
    }
  };

  const isAdmin = () => {
    return authState.user?.role === USER_ROLES.ADMIN;
  };

  const isSupervisor = () => {
    return authState.user?.role === USER_ROLES.SUPERVISOR || isAdmin();
  };

  const hasRole = (role: UserRole) => {
    return authState.user?.role === role;
  };

  const getDisplayName = () => {
    if (!authState.user) return '';
    const { firstName, lastName, username } = authState.user;
    return `${firstName} ${lastName}`.trim() || username;
  };

  return {
    ...authState,
    login,
    logout,
    updateUser,
    isAdmin,
    isSupervisor,
    hasRole,
    getDisplayName
  };
};
