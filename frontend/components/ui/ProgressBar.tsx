'use client';
import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className = ''
}) => {
  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  const sizes = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  };

  const variants = {
    default: 'bg-button-1',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-global-4">
            {label || `Progress`}
          </span>
          <span className="text-sm font-medium text-global-6">
            {normalizedValue}%
          </span>
        </div>
      )}
      <div className={`w-full bg-global-5 rounded-full ${sizes[size]}`}>
        <div
          className={`${sizes[size]} rounded-full transition-all duration-300 ease-in-out ${variants[variant]}`}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
