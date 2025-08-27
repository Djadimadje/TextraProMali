'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, user, getDashboardRoute, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [forceLogin, setForceLogin] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check URL parameters to see if this is a forced logout/login
    const urlParams = new URLSearchParams(window.location.search);
    const forceParam = urlParams.get('force');
    
    if (forceParam === 'true') {
      // Clear authentication when explicitly visiting login page with force=true
      setForceLogin(true);
      // Clear localStorage immediately
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Remove the force parameter from URL to prevent refresh loops
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  useEffect(() => {
    // Only redirect if user is authenticated AND we're not forcing a login AND page is mounted
    if (mounted && isAuthenticated && !isLoading && user && !forceLogin) {
      const dashboardRoute = getDashboardRoute(user.role);
      console.log('Redirecting user:', user.role, 'to:', dashboardRoute);
      
      // Validate the dashboard route before redirecting
      if (dashboardRoute && dashboardRoute !== '/undefined' && !dashboardRoute.includes('undefined')) {
        router.push(dashboardRoute);
      } else {
        console.error('Invalid dashboard route detected:', dashboardRoute, 'for role:', user.role);
        // Fallback to admin dashboard
        router.push('/admin');
      }
    }
  }, [mounted, isAuthenticated, isLoading, user, router, getDashboardRoute, forceLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    setLoginLoading(true);
    setError(null);

    try {
      console.log('Attempting login with username:', formData.username);
      await login({
        username: formData.username,
        password: formData.password
      });

      console.log('Login successful, resetting forceLogin flag');
      // After successful login, redirect will be handled by useEffect
      // But we can also manually check and redirect for immediate response
      // Reset forceLogin flag so redirect can happen
      setForceLogin(false);
      
    } catch (err: any) {
      console.error('Login failed:', err);
      
      // Handle different error types
      if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else if (err.response?.status === 400) {
        setError('Please check your credentials and try again');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  if (!mounted) {
    return null; // Prevent hydration issues
  }

  // Show loading if auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src="/image/login.jpeg"
          alt="Login background"
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ display: 'block' }}
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-start p-12">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white bg-black bg-opacity-30 px-4 py-2 rounded-lg">
              TexPro AI
            </h1>
          </Link>
          <p className="text-xl text-white bg-black bg-opacity-30 px-4 py-2 rounded-lg">
            AI-based system for optimizing textile manufacturing
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back To TexPro AI
            </h2>
            <p className="text-gray-600">
              Textile Production Management System
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username or Employee ID
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your username or employee ID"
                required
                disabled={loginLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                  placeholder="Enter your password"
                  required
                  disabled={loginLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loginLoading}
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L18.586 18.586M9.878 9.878l10.606 10.606" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  disabled={loginLoading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="/forgot-password" className="text-sm text-green-600 hover:text-green-500">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loginLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              © 2025 CMDT - All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
