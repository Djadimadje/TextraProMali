'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      // TODO: Replace with actual auth service call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setIsSubmitted(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null; // Prevent hydration issues
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Background Image */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gray-400">
          <img 
            src="/image/login.jpeg"
            alt="Forgot password background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-green-600 bg-opacity-10"></div>
          <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              TexPro AI
            </h1>
            <p className="text-xl text-white/90">
              AI-based system for optimizing textile manufacturing
            </p>
          </div>
        </div>

        {/* Right Side - Success Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email Sent Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                A password reset link has been sent to <strong>{email}</strong>.
                Check your inbox and follow the instructions.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                Back to Login
              </button>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Send to Another Email
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400">
                © 2025 CMDT - All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-400">
        <img 
          src="/image/login.jpeg"
          alt="Forgot password background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-green-600 bg-opacity-10"></div>
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            TexPro AI
          </h1>
          <p className="text-xl text-white/90">
            AI-based system for optimizing textile manufacturing
          </p>
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Forgot Your Password?
            </h2>
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-sm text-green-600 hover:text-green-500 transition-colors"
              >
                ← Back to Login
              </button>
            </div>
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

export default ForgotPasswordPage;
