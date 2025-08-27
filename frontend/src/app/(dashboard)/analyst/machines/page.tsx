'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useActivityTracker } from '../../../../hooks/useActivityTracker';
import AnalystSidebar from '../../../../../components/layout/AnalystSidebar';
import Header from '../../../../../components/layout/Header';
import MachineOverviewCards from '../../../../../components/machines/MachineOverviewCards';
import MachineMetricsGrid from '../../../../../components/machines/MachineMetricsGrid';
import MachinePerformanceCharts from '../../../../../components/machines/MachinePerformanceCharts';
import PredictiveMaintenancePanel from '../../../../../components/machines/PredictiveMaintenancePanel';
import MachineFilters from '../../../../../components/machines/MachineFilters';
import { AlertTriangle } from 'lucide-react';

export interface MachineFilters {
  machineTypes: string[];
  departments: string[];
  statusFilter: 'all' | 'running' | 'maintenance' | 'idle' | 'error';
  timeRange: '1h' | '8h' | '24h' | '7d' | '30d';
  sortBy: 'name' | 'efficiency' | 'uptime' | 'alerts';
  sortOrder: 'asc' | 'desc';
}

const AnalystMachinesPage: React.FC = () => {
  useActivityTracker();
  
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [filters, setFilters] = useState<MachineFilters>({
    machineTypes: [],
    departments: [],
    statusFilter: 'all',
    timeRange: '24h',
    sortBy: 'efficiency',
    sortOrder: 'desc'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'performance' | 'maintenance' | 'analytics'>('overview');

  // Authentication check
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (user && user.role !== 'analyst') {
        const userDashboard = `/${user.role}`;
        router.push(userDashboard);
        return;
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleFiltersChange = (newFilters: MachineFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    setError(null);
    // Trigger refresh in child components
    window.dispatchEvent(new CustomEvent('machinesRefresh'));
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authorized
  if (!isAuthenticated || !user || user.role !== 'analyst') {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">Access Denied</div>
          <p className="text-gray-600">You must be an analyst to access this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'performance', label: 'Performance', icon: '📈' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { id: 'analytics', label: 'Analytics', icon: '🤖' }
  ] as const;

  return (
    <div className="flex h-screen bg-gray-50">
      <AnalystSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-[240px]">
        <Header 
          userRole="analyst"
          title="Machine Analytics"
        />

        <main className="flex-1 overflow-y-auto">
          {/* Error Display */}
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Machine Filters */}
          <div className="border-b border-gray-200 bg-white">
            <MachineFilters 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onRefresh={handleRefresh}
            />
          </div>

          {/* Machine Tabs */}
          <div className="border-b border-gray-200 bg-white">
            <nav className="px-6 flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeView === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Machine Content */}
          <div className="flex-1 p-6">
            {activeView === 'overview' && (
              <div className="space-y-6">
                <MachineOverviewCards filters={filters} />
                <MachineMetricsGrid filters={filters} />
              </div>
            )}
            {activeView === 'performance' && (
              <MachinePerformanceCharts filters={filters} />
            )}
            {activeView === 'maintenance' && (
              <PredictiveMaintenancePanel filters={filters} />
            )}
            {activeView === 'analytics' && (
              <div className="space-y-6">
                <MachineOverviewCards filters={filters} />
                <MachinePerformanceCharts filters={filters} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalystMachinesPage;
