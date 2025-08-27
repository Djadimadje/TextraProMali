'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useActivityTracker } from '../../../../hooks/useActivityTracker';
import AnalyticsService from '../../../../services/analyticsService';
import AnalystSidebar from '../../../../../components/layout/AnalystSidebar';
import Header from '../../../../../components/layout/Header';
import { AlertTriangle } from 'lucide-react';
import AnalyticsFilters from '../../../../../components/analytics/AnalyticsFilters';
import AnalyticsOverview from '../../../../../components/analytics/AnalyticsOverview';
import ProductionAnalytics from '../../../../../components/analytics/ProductionAnalytics';
import QualityAnalytics from '../../../../../components/analytics/QualityAnalytics';
import MachineAnalytics from '../../../../../components/analytics/MachineAnalytics';
import WorkflowAnalytics from '../../../../../components/analytics/WorkflowAnalytics';

export interface AnalyticsFilters {
  timeRange: '1d' | '7d' | '30d' | '90d' | 'custom';
  dateFrom?: string;
  dateTo?: string;
  machines?: string[];
  departments?: string[];
  shifts?: string[];
  metrics?: string[];
}

const AnalyticsPage: React.FC = () => {
  useActivityTracker();
  
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'production' | 'quality' | 'machine' | 'workflow'>('overview');
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: '7d',
    machines: [],
    departments: [],
    shifts: [],
    metrics: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

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

      // Load initial analytics data
      loadAnalyticsData();
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Reload data when filters change
  useEffect(() => {
    if (user && user.role === 'analyst') {
      loadAnalyticsData();
    }
  }, [filters]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Loading analytics data with filters:', filters);
      
      // Load comprehensive analytics data from backend
      const data = await AnalyticsService.loadAllAnalytics();
      
      console.log('Analytics data loaded successfully:', data);
      setAnalyticsData(data);

    } catch (error: any) {
      console.error('Error loading analytics data:', error);
      setError(`Failed to load analytics data: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    setError(null);
    loadAnalyticsData();
    // Also trigger refresh in child components
    window.dispatchEvent(new CustomEvent('analyticsRefresh'));
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
    { id: 'production', label: 'Production', icon: '🏭' },
    { id: 'quality', label: 'Quality', icon: '✅' },
    { id: 'machine', label: 'Machines', icon: '⚙️' },
    { id: 'workflow', label: 'Workflow', icon: '🔄' }
  ] as const;

  return (
    <div className="flex h-screen bg-gray-50">
      <AnalystSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-[240px]">
        <Header 
          userRole="analyst"
          title="Analytics Center"
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

          {/* Analytics Filters */}
          <div className="border-b border-gray-200 bg-white">
            <AnalyticsFilters 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onRefresh={handleRefresh}
              analyticsData={analyticsData}
            />
          </div>

          {/* Analytics Tabs */}
          <div className="border-b border-gray-200 bg-white">
            <nav className="px-6 flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
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

          {/* Analytics Content */}
          <div className="flex-1 p-6">
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading analytics data...</p>
                </div>
              </div>
            )}

            {!loading && (
              <>
                {activeTab === 'overview' && (
                  <AnalyticsOverview filters={filters} />
                )}
                {activeTab === 'production' && (
                  <ProductionAnalytics filters={filters} />
                )}
                {activeTab === 'quality' && (
                  <QualityAnalytics filters={filters} />
                )}
                {activeTab === 'machine' && (
                  <MachineAnalytics filters={filters} />
                )}
                {activeTab === 'workflow' && (
                  <WorkflowAnalytics filters={filters} />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;
