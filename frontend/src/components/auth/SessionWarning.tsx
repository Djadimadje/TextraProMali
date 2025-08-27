/**
 * Session Warning Component
 * Shows a warning before auto-logout occurs
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SessionWarningProps {
  warningThreshold?: number; // Show warning X seconds before logout
}

const SessionWarning: React.FC<SessionWarningProps> = ({ 
  warningThreshold = 60 // 60 seconds warning by default
}) => {
  const { isAuthenticated, resetInactivityTimer } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    let warningTimer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;

    const startWarning = () => {
      setShowWarning(true);
      setTimeRemaining(warningThreshold);
      
      // Start countdown
      countdownTimer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    // Show warning before actual logout
    const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    const warningTime = INACTIVITY_TIMEOUT - (warningThreshold * 1000);
    
    if (warningTime > 0) {
      warningTimer = setTimeout(startWarning, warningTime);
    }

    return () => {
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [isAuthenticated, warningThreshold, resetInactivityTimer]);

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    setTimeRemaining(0);
    resetInactivityTimer();
  };

  if (!showWarning || !isAuthenticated) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Session Timeout Warning</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          Your session will expire in <strong className="text-red-600">{timeRemaining}</strong> seconds due to inactivity.
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          Click "Stay Logged In" to continue your session, or you will be automatically logged out for security.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={handleStayLoggedIn}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Stay Logged In
          </button>
          <button
            onClick={() => setShowWarning(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionWarning;
