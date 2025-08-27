import React from 'react';

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  className = '',
  padding = 'md'
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  return (
    <div className={`${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default CardContent;
export { CardContent };
