'use client';
import React, { useState, useEffect } from 'react';
import AnalystSidebar from '../../../../../components/layout/AnalystSidebar';
import Header from '../../../../../components/layout/Header';
import { Bell, AlertTriangle, CheckCircle, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NotificationStats from '../../../../../components/notifications/NotificationStats';
import NotificationFilters from '../../../../../components/notifications/NotificationFilters';
import NotificationList from '../../../../../components/notifications/NotificationList';
import AlertCenter from '../../../../../components/notifications/AlertCenter';
import NotificationSettings from '../../../../../components/notifications/NotificationSettings';

export interface NotificationFilters {
  priority: 'all' | 'critical' | 'high' | 'medium' | 'low';
  status: 'all' | 'unread' | 'read' | 'archived';
  category: 'all' | 'alerts' | 'reports' | 'maintenance' | 'quality' | 'production' | 'system';
  dateRange: {
    preset: '1d' | '7d' | '30d' | '3m' | 'custom';
    start: string;
    end: string;
  };
  departments: string[];
  sources: string[];
}

const AnalystNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'list' | 'alerts' | 'settings'>('list');
  const [filters, setFilters] = useState<NotificationFilters>({
    priority: 'all',
    status: 'all',
    category: 'all',
    dateRange: {
      preset: '7d',
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    departments: [],
    sources: []
  });
  const [loading, setLoading] = useState(false);

  const refreshData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleFiltersChange = (newFilters: Partial<NotificationFilters>) => {
    setFilters((prev: NotificationFilters) => ({ ...prev, ...newFilters }));
  };

  useEffect(() => {
    // Load initial data
    refreshData();
  }, []);

  const tabs = [
    {
      id: 'list',
      label: 'Notifications',
      icon: Bell,
      description: 'View all notifications'
    },
    {
      id: 'alerts',
      label: 'Alert Center',
      icon: AlertTriangle,
      description: 'Critical alerts and warnings'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      description: 'Notification preferences'
    }
  ];

  if (!user) {
    return <div>Please log in to access this page.</div>;
  }

  if (user.role !== 'analyst') {
    return <div>Access denied. This page is only available to analysts.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <AnalystSidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-64">
          <Header 
            title="Notifications"
          />
          
          <div className="p-6">
            {/* Notification Stats */}
            <div className="mb-6">
              <NotificationStats filters={filters} />
            </div>

            {/* Filters */}
            <div className="mb-6">
              <NotificationFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onRefresh={refreshData}
                loading={loading}
              />
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveView(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeView === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeView === 'list' && (
                  <NotificationList 
                    filters={filters}
                    refreshData={refreshData}
                  />
                )}
                
                {activeView === 'alerts' && (
                  <AlertCenter 
                    filters={filters}
                    refreshData={refreshData}
                  />
                )}
                
                {activeView === 'settings' && (
                  <NotificationSettings 
                    filters={filters}
                    refreshData={refreshData}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalystNotificationsPage;
