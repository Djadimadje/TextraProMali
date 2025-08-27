'use client';
import { useState, useCallback } from 'react';

interface UseLoadingReturn {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(asyncFunction: () => Promise<T>) => Promise<T>;
}

/**
 * Custom hook for managing loading states
 */
const useLoading = (initialState: boolean = false): UseLoadingReturn => {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(async <T>(asyncFunction: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  };
};

export default useLoading;
