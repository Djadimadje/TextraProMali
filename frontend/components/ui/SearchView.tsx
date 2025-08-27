'use client';
import React from 'react';
import Image from 'next/image';

interface SearchViewProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  leftImage?: {
    src: string;
    width: number;
    height: number;
  };
  rightImage?: {
    src: string;
    width: number;
    height: number;
  };
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outlined' | 'filled';
}

const SearchView: React.FC<SearchViewProps> = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onSearch,
  leftImage,
  rightImage,
  disabled = false,
  className = '',
  variant = 'outlined'
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(value);
    }
  };

  const variants = {
    default: 'bg-global-9 border-gray-300',
    outlined: 'bg-global-9 border-gray-300',
    filled: 'bg-gray-100 border-transparent'
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {leftImage && (
        <div className="absolute left-3 z-10 flex items-center justify-center">
          <Image
            src={leftImage.src}
            alt="Search icon"
            width={leftImage.width}
            height={leftImage.height}
            className="object-contain"
          />
        </div>
      )}
      
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full
          px-3 py-2 sm:px-4 sm:py-3
          text-sm sm:text-base
          font-normal
          text-global-4
          rounded-md sm:rounded-lg
          border
          transition-all
          duration-200
          ease-in-out
          focus:outline-none
          focus:ring-2
          focus:ring-global-5
          focus:border-transparent
          ${leftImage ? 'pl-10 sm:pl-12' : ''}
          ${rightImage ? 'pr-10 sm:pr-12' : ''}
          ${variants[variant]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-global-5'}
          placeholder:text-searchview-1
          min-h-[44px] sm:min-h-[48px]
        `.trim().replace(/\s+/g, ' ')}
      />
      
      {rightImage && (
        <button
          type="button"
          onClick={handleSearchClick}
          disabled={disabled}
          className="absolute right-3 z-10 flex items-center justify-center hover:opacity-75 transition-opacity"
        >
          <Image
            src={rightImage.src}
            alt="Search button"
            width={rightImage.width}
            height={rightImage.height}
            className="object-contain"
          />
        </button>
      )}
    </div>
  );
};

export default SearchView;
