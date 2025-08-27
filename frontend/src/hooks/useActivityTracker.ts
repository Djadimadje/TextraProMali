/**
 * Activity Tracker Hook
 * Automatically resets inactivity timer when user interacts with dashboard
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useActivityTracker = () => {
  const { resetInactivityTimer, isAuthenticated } = useAuth();

  // Create stable callback
  const handleActivity = useCallback(() => {
    if (isAuthenticated) {
      resetInactivityTimer();
    }
  }, [isAuthenticated, resetInactivityTimer]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Reset timer whenever this hook is used (component mounts/updates)
    handleActivity();

    // Add additional activity listeners for this component
    const events = ['click', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAuthenticated, handleActivity]);
};
