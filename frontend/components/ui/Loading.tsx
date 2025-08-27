'use client';
import React from 'react';

interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'shimmer';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false,
  className = ''
}) => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    primary: 'text-green-600 border-green-600',
    secondary: 'text-blue-600 border-blue-600',
    white: 'text-white border-white',
    gray: 'text-gray-600 border-gray-600'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const renderSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-2">
      <svg
        className={`animate-spin ${sizes[size]} ${colors[color]}`}
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
      {text && <p className={`${textSizes[size]} ${colors[color].split(' ')[0]} animate-pulse`}>{text}</p>}
    </div>
  );

  const renderDots = () => (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="flex space-x-1">
        <div className={`${sizes[size]} ${colors[color].split(' ')[0]} bg-current rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`${sizes[size]} ${colors[color].split(' ')[0]} bg-current rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
        <div className={`${sizes[size]} ${colors[color].split(' ')[0]} bg-current rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
      </div>
      {text && <p className={`${textSizes[size]} ${colors[color].split(' ')[0]} animate-pulse`}>{text}</p>}
    </div>
  );

  const renderPulse = () => (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`${sizes[size]} ${colors[color].split(' ')[0]} bg-current rounded-full animate-pulse`}></div>
      {text && <p className={`${textSizes[size]} ${colors[color].split(' ')[0]} animate-pulse`}>{text}</p>}
    </div>
  );

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      </div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  );

  const renderShimmer = () => (
    <div className="space-y-4">
      <div className="h-4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded animate-pulse loading-shimmer"></div>
      <div className="h-4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded animate-pulse loading-shimmer w-5/6"></div>
      <div className="h-4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded animate-pulse loading-shimmer w-3/4"></div>
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      case 'shimmer':
        return renderShimmer();
      default:
        return renderSpinner();
    }
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={`${containerClasses} ${className}`}>
      {renderContent()}
    </div>
  );
};

export default Loading;
