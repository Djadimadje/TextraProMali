'use client';
import React from 'react';

interface LoadingCardProps {
  rows?: number;
  showHeader?: boolean;
  showImage?: boolean;
  className?: string;
}

const LoadingCard: React.FC<LoadingCardProps> = ({
  rows = 3,
  showHeader = true,
  showImage = false,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-gray-300 rounded w-32 animate-pulse"></div>
          <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
        </div>
      )}

      {/* Image */}
      {showImage && (
        <div className="w-full h-32 bg-gray-300 rounded-lg animate-pulse mb-4"></div>
      )}

      {/* Content Rows */}
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-300 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
            {i < rows - 1 && <div className="h-3 bg-gray-300 rounded animate-pulse" style={{ width: `${Math.random() * 30 + 70}%` }}></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingCard;
