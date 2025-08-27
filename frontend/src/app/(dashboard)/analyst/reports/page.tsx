  'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useActivityTracker } from '../../../../hooks/useActivityTracker';
import AnalystSidebar from '../../../../../components/layout/AnalystSidebar';
import Header from '../../../../../components/layout/Header';
import { AlertTriangle } from 'lucide-react';
import { reportsService, ReportData } from '../../../../services/reportsService';
import AnalyticsFilters from '../../../../../components/analytics/AnalyticsFilters';
import ReportDashboard from '../../../../../components/reports/ReportDashboard';
import ProductionReports from '../../../../../components/reports/ProductionReports';
import QualityReports from '../../../../../components/reports/QualityReports';
import MaintenanceReports from '../../../../../components/reports/MaintenanceReports';
import FinancialReports from '../../../../../components/reports/FinancialReports';

export interface ReportFilters {
  timeRange: '1d' | '7d' | '30d' | '90d' | 'custom';
  dateFrom?: string;
  dateTo?: string;
  machines?: string[];
  departments?: string[];
  shifts?: string[];
  metrics?: string[];
  reportTypes?: string[];
  exportFormat?: 'pdf' | 'excel' | 'csv';
}

const AnalystReportsPage: React.FC = () => {
  useActivityTracker();
  
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'production' | 'quality' | 'maintenance' | 'financial'>('dashboard');
  const [filters, setFilters] = useState<ReportFilters>({
    timeRange: '7d',
    machines: [],
    departments: [],
    shifts: [],
    metrics: [],
    reportTypes: ['production', 'quality'],
    exportFormat: 'pdf'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportsData, setReportsData] = useState<ReportData | null>(null);

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
  }, [isAuthenticated, user, authLoading, router]);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated && user?.role === 'analyst') {
      loadReportsData();
    }
  }, [isAuthenticated, user, filters]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading reports data with filters:', filters);
      
      // Transform filters to match reportsService expectations
      const transformedFilters = {
        dateRange: {
          start: filters.dateFrom || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: filters.dateTo || new Date().toISOString().split('T')[0],
          preset: filters.timeRange
        },
        reportTypes: filters.reportTypes || ['production', 'quality'],
        departments: filters.departments || [],
        machines: filters.machines || [],
        shift: 'all',
        granularity: 'daily',
        includeComparisons: true,
        exportFormat: filters.exportFormat || 'pdf'
      };
      
      // Fetch data from backend
      const data = await reportsService.loadAllReports(transformedFilters);
      setReportsData(data);
      
      console.log('Reports data loaded successfully:', data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reports data. Please try again.';
      setError(errorMessage);
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const getViewTitle = () => {
    const titles = {
      dashboard: 'Reports Dashboard',
      production: 'Production Reports',
      quality: 'Quality Reports', 
      maintenance: 'Maintenance Reports',
      financial: 'Financial Reports'
    };
    return titles[activeTab];
  };

  const getViewDescription = () => {
    const descriptions = {
      dashboard: 'Comprehensive overview of all reporting metrics and KPIs',
      production: 'Detailed production performance and output analysis',
      quality: 'Quality control metrics and compliance reporting',
      maintenance: 'Equipment maintenance schedules and cost analysis',
      financial: 'Cost analysis and ROI reporting for operational efficiency'
    };
    return descriptions[activeTab];
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || (user && user.role !== 'analyst')) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AnalystSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-[240px]">
        <Header 
          userRole="analyst"
          title={getViewTitle()}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            )}

            {/* Filters */}
            <AnalyticsFilters 
              filters={filters}
              onFiltersChange={setFilters}
              onRefresh={loadReportsData}
              analyticsData={reportsData}
            />

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
                    { key: 'production', label: 'Production', icon: '🏭' },
                    { key: 'quality', label: 'Quality', icon: '✅' },
                    { key: 'maintenance', label: 'Maintenance', icon: '🔧' },
                    { key: 'financial', label: 'Financial', icon: '💰' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'dashboard' && (
                  <ReportDashboard 
                    filters={filters}
                    loading={loading}
                    data={reportsData?.dashboard}
                  />
                )}
                
                {activeTab === 'production' && (
                  <ProductionReports 
                    filters={filters}
                    loading={loading}
                    data={reportsData?.production}
                  />
                )}
                
                {activeTab === 'quality' && (
                  <QualityReports 
                    filters={filters}
                    loading={loading}
                    data={reportsData?.quality}
                  />
                )}
                
                {activeTab === 'maintenance' && (
                  <MaintenanceReports 
                    filters={filters}
                    loading={loading}
                    data={reportsData?.maintenance}
                  />
                )}
                
                {activeTab === 'financial' && (
                  <FinancialReports 
                    filters={filters}
                    loading={loading}
                    data={reportsData?.financial}
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

export default AnalystReportsPage;
