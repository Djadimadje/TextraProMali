'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useActivityTracker } from '../../../../hooks/useActivityTracker';
import AnalystSidebar from '../../../../../components/layout/AnalystSidebar';
import Header from '../../../../../components/layout/Header';
import WorkflowFilters from '../../../../../components/workflow/WorkflowFilters';
import WorkflowOverview from '../../../../../components/workflow/WorkflowOverview';
import ProcessAnalytics from '../../../../../components/workflow/ProcessAnalytics';
import BottleneckAnalysis from '../../../../../components/workflow/BottleneckAnalysis';
import EfficiencyOptimization from '../../../../../components/workflow/EfficiencyOptimization';
import WorkflowDesigner from '../../../../../components/workflow/WorkflowDesigner';
import { AlertTriangle } from 'lucide-react';

export interface WorkflowFilters {
  dateRange: {
    start: string;
    end: string;
    preset: '1d' | '7d' | '30d' | '3m' | 'custom';
  };
  processTypes: string[];
  departments: string[];
  priorities: ('low' | 'medium' | 'high' | 'critical')[];
  status: 'all' | 'active' | 'completed' | 'delayed' | 'optimizing';
  metrics: string[];
  viewType: 'overview' | 'detailed' | 'realtime';
}

const AnalystWorkflowPage: React.FC = () => {
  useActivityTracker();
  
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [filters, setFilters] = useState<WorkflowFilters>({
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      preset: '7d'
    },
    processTypes: ['production', 'quality'],
    departments: [],
    priorities: [],
    status: 'all',
    metrics: ['efficiency', 'throughput', 'cycle_time'],
    viewType: 'overview'
  });
  const [loading, setLoading] = useState(false);

  const refreshData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'analytics' | 'bottlenecks' | 'optimization' | 'designer'>('overview');

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
      loadWorkflowData();
    }
  }, [isAuthenticated, user, filters]);

  const loadWorkflowData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, you would fetch workflow data based on filters
      console.log('Loading workflow data with filters:', filters);
      
    } catch (err) {
      setError('Failed to load workflow data. Please try again.');
      console.error('Error loading workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<WorkflowFilters>) => {
    setFilters((prev: WorkflowFilters) => ({ ...prev, ...newFilters }));
  };

  const handleRefreshData = () => {
    // Dispatch custom event for child components
    window.dispatchEvent(new CustomEvent('workflowRefresh'));
    loadWorkflowData();
  };

  const getViewTitle = () => {
    const titles = {
      overview: 'Workflow Overview',
      analytics: 'Process Analytics',
      bottlenecks: 'Bottleneck Analysis',
      optimization: 'Efficiency Optimization',
      designer: 'Workflow Designer'
    };
    return titles[activeView];
  };

  const getViewDescription = () => {
    const descriptions = {
      overview: 'Real-time workflow monitoring and performance metrics',
      analytics: 'Detailed process analysis and performance insights',
      bottlenecks: 'Identify and resolve workflow bottlenecks',
      optimization: 'AI-driven efficiency optimization recommendations',
      designer: 'Visual workflow design and process modeling'
    };
    return descriptions[activeView];
  };

  if (authLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AnalystSidebar />
        <div className="flex-1 flex items-center justify-center ml-[200px] lg:ml-[240px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (user && user.role !== 'analyst')) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AnalystSidebar />
        <div className="flex-1 flex items-center justify-center ml-[200px] lg:ml-[240px]">
          <div className="text-center">
            <div className="text-red-600 text-xl font-semibold mb-4">Access Denied</div>
            <p className="text-gray-600">You must be an analyst to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AnalystSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-[200px] lg:ml-[240px]">
        <Header 
          userRole="analyst"
          title={getViewTitle()}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Filters */}
            <WorkflowFilters 
              filters={filters}
              onFiltersChange={handleFilterChange}
              onRefresh={handleRefreshData}
              loading={loading}
            />

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { key: 'overview', label: 'Overview', icon: '📈' },
                    { key: 'analytics', label: 'Analytics', icon: '📊' },
                    { key: 'bottlenecks', label: 'Bottlenecks', icon: '🚧' },
                    { key: 'optimization', label: 'Optimization', icon: '⚡' },
                    { key: 'designer', label: 'Designer', icon: '🎨' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveView(tab.key as any)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeView === tab.key
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
                {activeView === 'overview' && (
                  <WorkflowOverview 
                    filters={filters}
                    refreshData={refreshData}
                  />
                )}
                
                {activeView === 'analytics' && (
                  <ProcessAnalytics 
                    filters={filters}
                  />
                )}
                
                {activeView === 'bottlenecks' && (
                  <BottleneckAnalysis />
                )}
                
                {activeView === 'optimization' && (
                  <EfficiencyOptimization 
                    filters={filters}
                  />
                )}
                
                {activeView === 'designer' && (
                  <WorkflowDesigner 
                    filters={filters}
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

export default AnalystWorkflowPage;
