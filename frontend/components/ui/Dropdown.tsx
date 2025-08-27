'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  rightImage?: {
    src: string;
    width: number;
    height: number;
  };
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outlined' | 'filled';
}

const Dropdown: React.FC<DropdownProps> = ({
  options = [],
  placeholder = 'Select an option',
  value = '',
  onChange,
  rightImage,
  disabled = false,
  className = '',
  variant = 'outlined'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(
    options.find(option => option.value === value) || null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const variants = {
    default: 'bg-global-9 border-gray-300',
    outlined: 'bg-global-9 border-gray-300',
    filled: 'bg-gray-100 border-transparent'
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: DropdownOption) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) {
      onChange(option.value);
    }
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`
          w-full
          px-3 py-2 sm:px-4 sm:py-3
          text-sm sm:text-base
          font-normal
          text-left
          text-global-6
          rounded-md sm:rounded-lg
          border
          transition-all
          duration-200
          ease-in-out
          focus:outline-none
          focus:ring-2
          focus:ring-global-5
          focus:border-transparent
          ${rightImage ? 'pr-10 sm:pr-12' : ''}
          ${variants[variant]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-global-5 cursor-pointer'}
          min-h-[44px] sm:min-h-[48px]
          flex items-center justify-between
        `.trim().replace(/\s+/g, ' ')}
      >
        <span className={selectedOption ? 'text-global-4' : 'text-global-6'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        {rightImage && (
          <div className="flex items-center justify-center ml-2">
            <Image
              src={rightImage.src}
              alt="Dropdown arrow"
              width={rightImage.width}
              height={rightImage.height}
              className={`object-contain transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-global-9 border border-gray-300 rounded-md sm:rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(option)}
              className={`
                w-full
                px-3 py-2 sm:px-4 sm:py-3
                text-sm sm:text-base
                text-left
                text-global-4
                hover:bg-gray-50
                focus:outline-none
                focus:bg-gray-50
                transition-colors
                duration-150
                ${selectedOption?.value === option.value ? 'bg-gray-100 font-medium' : ''}
                ${index === 0 ? 'rounded-t-md sm:rounded-t-lg' : ''}
                ${index === options.length - 1 ? 'rounded-b-md sm:rounded-b-lg' : ''}
              `.trim().replace(/\s+/g, ' ')}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
