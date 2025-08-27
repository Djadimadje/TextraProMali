'use client';
import React from 'react';
import Image from 'next/image';

interface EditTextProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
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
  type?: 'text' | 'email' | 'password' | 'number';
  className?: string;
  variant?: 'default' | 'outlined' | 'filled';
}

const EditText: React.FC<EditTextProps> = ({
  placeholder = '',
  value = '',
  onChange,
  leftImage,
  rightImage,
  disabled = false,
  type = 'text',
  className = '',
  variant = 'default'
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const variants = {
    default: 'bg-edittext-1 border-transparent',
    outlined: 'bg-transparent border-gray-300',
    filled: 'bg-gray-100 border-transparent'
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {leftImage && (
        <div className="absolute left-3 z-10 flex items-center justify-center">
          <Image
            src={leftImage.src}
            alt="Left icon"
            width={leftImage.width}
            height={leftImage.height}
            className="object-contain"
          />
        </div>
      )}
      
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full
          px-3 py-2 sm:px-4 sm:py-3
          text-sm sm:text-base
          font-medium
          text-global-7
          rounded-md sm:rounded-lg
          border
          transition-all
          duration-200
          ease-in-out
          focus:outline-none
          focus:ring-2
          focus:ring-global-5
          focus:border-transparent
          ${leftImage ? 'pl-12 sm:pl-14' : ''}
          ${rightImage ? 'pr-12 sm:pr-14' : ''}
          ${variants[variant]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-global-9'}
          placeholder:text-global-6
          min-h-[44px] sm:min-h-[48px]
        `.trim().replace(/\s+/g, ' ')}
      />
      
      {rightImage && (
        <div className="absolute right-3 z-10 flex items-center justify-center">
          <Image
            src={rightImage.src}
            alt="Right icon"
            width={rightImage.width}
            height={rightImage.height}
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default EditText;
