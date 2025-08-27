'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../../../../components/layout/AdminSidebar';
import Header from '../../../../../components/layout/Header';
import { 
  Wrench, 
  BarChart3, 
  Brain, 
  FileText,
  Settings
} from 'lucide-react';
import MaintenanceDashboard from '../../../../../components/maintenance/MaintenanceDashboardNew';
import MaintenanceList from '../../../../../components/maintenance/MaintenanceList';
import PredictiveMaintenance from '../../../../../components/maintenance/PredictiveMaintenance';
import MaintenanceReports from '../../../../../components/maintenance/MaintenanceReports';

const MaintenancePage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Authentication check
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (user && user.role !== 'admin') {
        router.push(`/${user.role}`);
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center ml-[240px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading maintenance management...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col items-center justify-center ml-[240px]">
          <Settings className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Required</h2>
          <p className="text-gray-600 mb-4">Admin access required for maintenance management.</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: BarChart3,
      component: MaintenanceDashboard
    },
    {
      id: 'maintenance',
      name: 'Maintenance Logs',
      icon: Wrench,
      component: MaintenanceList
    },
    {
      id: 'predictive',
      name: 'Predictive Maintenance',
      icon: Brain,
      component: PredictiveMaintenance
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: FileText,
      component: MaintenanceReports
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || MaintenanceDashboard;

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-[240px]">
        <Header 
          userRole="admin"
          title="Maintenance Management"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Maintenance Management</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Monitor and manage machine maintenance activities
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Settings className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                          ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        <Icon className="h-5 w-5 mr-2" />
                        {tab.name}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Active Tab Content */}
            <div className="tab-content">
              <ActiveComponent />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MaintenancePage;
