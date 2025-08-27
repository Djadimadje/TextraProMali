'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../src/contexts/AuthContext';
import { ChevronLeft, Search, Menu } from 'lucide-react';

interface HeaderProps {
  className?: string;
  userRole?: string;
  userName?: string;
  userTitle?: string;
  showBackButton?: boolean;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  className = '',
  userRole,
  userName,
  userTitle,
  showBackButton = false,
  title
}) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Get proper role title
  const getRoleTitle = (role: string) => {
    const roleTitles: Record<string, string> = {
      admin: 'System Administrator',
      supervisor: 'Production Supervisor',
      technician: 'Technical Specialist',
      inspector: 'Quality Inspector',
      analyst: 'Data Analyst'
    };
    return roleTitles[role] || 'User';
  };

  // Use real auth context data with proper fallbacks
  const displayRole = user?.role || userRole || 'admin';
  const displayName = (() => {
    if (user) {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      return fullName || user.username || 'Administrator';
    }
    return userName || 'Administrator';
  })();
  const displayTitle = user?.role ? getRoleTitle(user.role) : userTitle || 'System Administrator';
  const displayEmail = user?.email || '';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserInitials = (name: string) => {
    if (!name || name.trim() === '') {
      return 'U'; // Default to 'U' for User
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-purple-600',
      supervisor: 'bg-blue-600',
      technician: 'bg-green-600',
      inspector: 'bg-orange-600',
      analyst: 'bg-indigo-600'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-600';
  };
  return (
    <header className={`w-full bg-white border-b border-gray-200 ${className}`}>
      <div className="w-full px-6">
        <div className="flex flex-row justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button 
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:block ml-1 text-sm font-medium">Back</span>
              </button>
            )}
            
            {title && (
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className={`w-10 h-10 rounded-full ${getRoleColor(displayRole)} flex items-center justify-center`}>
                  <span className="text-white font-medium text-sm">
                    {getUserInitials(displayName)}
                  </span>
                </div>
                
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">
                    {displayName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {displayTitle}
                  </span>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full ${getRoleColor(displayRole)} flex items-center justify-center`}>
                        <span className="text-white font-medium">
                          {getUserInitials(displayName)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{displayName}</p>
                        <p className="text-sm text-gray-500">{displayTitle}</p>
                        <p className="text-xs text-purple-600 font-medium mt-1">
                          {displayEmail || user?.email || 'No email'}
                        </p>
                        {user?.employee_id && (
                          <p className="text-xs text-gray-400 mt-1">
                            ID: {user.employee_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    {user && displayRole && (
                      <>
                        <Link
                          href={`/${displayRole}/settings`}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                          onClick={(e) => {
                            setShowUserMenu(false);
                            // Prevent navigation if role is undefined
                            if (!displayRole || displayRole === 'undefined') {
                              e.preventDefault();
                              console.warn('Prevented navigation to undefined settings route');
                            }
                          }}
                        >
                          Account Settings
                        </Link>
                        <Link
                          href={`/${displayRole}`}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                          onClick={(e) => {
                            setShowUserMenu(false);
                            // Prevent navigation if role is undefined
                            if (!displayRole || displayRole === 'undefined') {
                              e.preventDefault();
                              console.warn('Prevented navigation to undefined dashboard route');
                            }
                          }}
                        >
                          Dashboard
                        </Link>
                      </>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;
