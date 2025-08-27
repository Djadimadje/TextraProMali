'use client';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick,
  hoverable = false
}) => {
  const variants = {
    default: 'bg-global-9 border border-gray-200',
    outlined: 'bg-global-9 border-2 border-gray-300',
    elevated: 'bg-global-9 shadow-lg border-0'
  };

  const paddings = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  const hoverEffect = hoverable ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer' : '';
  const clickable = onClick ? 'cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg sm:rounded-xl
        transition-all
        duration-200
        ease-in-out
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverEffect}
        ${clickable}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </div>
  );
};

export default Card;
