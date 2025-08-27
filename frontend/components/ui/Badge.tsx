'use client';
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const variants = {
    default: 'bg-global-5 text-global-6',
    success: 'bg-button-2 text-button-1',
    warning: 'bg-button-4 text-button-3',
    danger: 'bg-button-3 text-button-4',
    info: 'bg-global-4 text-global-3'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        font-medium
        rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </span>
  );
};

export default Badge;
