'use client';
import React from 'react';

interface PageLoadingProps {
  message?: string;
  variant?: 'default' | 'dashboard' | 'minimal';
  brandColor?: boolean;
}

const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading...',
  variant = 'default',
  brandColor = true
}) => {
  const defaultLoading = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4">
          <svg
            className={`animate-spin w-full h-full ${brandColor ? 'text-green-600' : 'text-gray-600'}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">TexPro AI</h3>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );

  const dashboardLoading = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-white shadow-sm">
          <div className="p-6 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <div className="h-8 bg-gray-300 rounded w-64 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-96 animate-pulse"></div>
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                  <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-300 rounded w-16 animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-32 animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="h-6 bg-gray-300 rounded w-32 animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/6 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const minimalLoading = () => (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-3">
        <div className={`w-6 h-6 border-2 border-current border-r-transparent rounded-full animate-spin ${brandColor ? 'text-green-600' : 'text-gray-600'}`}></div>
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  );

  switch (variant) {
    case 'dashboard':
      return dashboardLoading();
    case 'minimal':
      return minimalLoading();
    default:
      return defaultLoading();
  }
};

export default PageLoading;
