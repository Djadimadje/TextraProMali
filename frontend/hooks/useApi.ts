'use client';
import { useState, useCallback } from 'react';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  status: number | null;
}

export const useApi = () => {
  const [state, setState] = useState<ApiResponse>({
    data: null,
    error: null,
    isLoading: false,
    status: null
  });

  const getAuthToken = () => {
    return localStorage.getItem('texproai_auth_token');
  };

  const getDefaultHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  };

  const makeRequest = useCallback(async <T = any>(
    endpoint: string, 
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const url = `${baseUrl}${endpoint}`;
      
      const config: RequestInit = {
        method: options.method || 'GET',
        headers: {
          ...getDefaultHeaders(),
          ...options.headers
        }
      };

      if (options.body) {
        config.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, config);
      
      let data = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}`;
        setState({
          data: null,
          error: errorMessage,
          isLoading: false,
          status: response.status
        });
        return {
          data: null,
          error: errorMessage,
          isLoading: false,
          status: response.status
        };
      }

      setState({
        data,
        error: null,
        isLoading: false,
        status: response.status
      });

      return {
        data,
        error: null,
        isLoading: false,
        status: response.status
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      setState({
        data: null,
        error: errorMessage,
        isLoading: false,
        status: null
      });
      return {
        data: null,
        error: errorMessage,
        isLoading: false,
        status: null
      };
    }
  }, []);

  // Convenience methods
  const get = useCallback(<T = any>(endpoint: string, headers?: Record<string, string>) => {
    return makeRequest<T>(endpoint, { method: 'GET', headers });
  }, [makeRequest]);

  const post = useCallback(<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) => {
    return makeRequest<T>(endpoint, { method: 'POST', body, headers });
  }, [makeRequest]);

  const put = useCallback(<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) => {
    return makeRequest<T>(endpoint, { method: 'PUT', body, headers });
  }, [makeRequest]);

  const patch = useCallback(<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) => {
    return makeRequest<T>(endpoint, { method: 'PATCH', body, headers });
  }, [makeRequest]);

  const del = useCallback(<T = any>(endpoint: string, headers?: Record<string, string>) => {
    return makeRequest<T>(endpoint, { method: 'DELETE', headers });
  }, [makeRequest]);

  const resetState = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      status: null
    });
  }, []);

  return {
    ...state,
    makeRequest,
    get,
    post,
    put,
    patch,
    delete: del,
    resetState
  };
};
