'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import InspectorSidebar from '../../../../components/layout/InspectorSidebar';
import Header from '../../../../components/layout/Header';
import InspectorOverview from '../../../../components/inspector/InspectorOverview';
import RecentInspections from '../../../../components/inspector/RecentInspections';
import QualityMetrics from '../../../../components/inspector/QualityMetrics';
import MachineStatusPanel from '../../../../components/inspector/MachineStatusPanel';
import QuickActions from '../../../../components/inspector/QuickActions';
import { inspectorService } from '../../../services/inspectorService';
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  RefreshCw
} from 'lucide-react';

export interface InspectorDashboardData {
  todayInspections: {
    completed: number;
    pending: number;
    passed: number;
    failed: number;
  };
  qualityMetrics: {
    passRate: number;
    defectRate: number;
    aiAccuracy: number;
    avgScore: number;
  };
  machineStatus: {
    total: number;
    operational: number;
    maintenance: number;
    offline: number;
  };
  alerts: {
    high: number;
    medium: number;
    low: number;
  };
  recentInspections: Array<{
    id: string;
    batchCode: string;
    productType: string;
    result: 'passed' | 'failed' | 'pending';
    score: number;
    timestamp: string;
    defectsFound: number;
  }>;
}

const InspectorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InspectorDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get real dashboard data from backend
      const dashboardData = await inspectorService.getDashboardData();
      
      setData(dashboardData);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  if (!user) {
    return <div>Please log in to access this page.</div>;
  }

  if (user.role !== 'inspector') {
    return <div>Access denied. This page is only available to quality inspectors.</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <InspectorSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-[240px]">
        <Header 
          userRole="inspector"
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
                    onClick={handleRefresh}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user?.first_name || user?.username || 'Inspector'}!
            </h1>
            <p className="text-gray-600 text-lg">
              Monitor quality metrics, conduct inspections, and ensure textile quality standards.
            </p>
            
            {/* Data Source Indicator */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse mr-2"></div>
                Quality System Active
              </div>
              
              <div className="text-sm text-gray-500">
                Last updated: {lastRefresh.toLocaleString('en-US')}
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="space-y-6">
            {/* Inspector Overview Cards */}
            <InspectorOverview 
              data={data}
              loading={loading}
            />

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Quality Metrics & Recent Inspections */}
              <div className="lg:col-span-2 space-y-6">
                <QualityMetrics 
                  data={data?.qualityMetrics}
                  loading={loading}
                />
                
                <RecentInspections 
                  inspections={data?.recentInspections}
                  loading={loading}
                />
              </div>

              {/* Right Column - Machine Status & Quick Actions */}
              <div className="space-y-6">
                <QuickActions 
                  loading={loading}
                />
                
                <MachineStatusPanel 
                  data={data?.machineStatus}
                  loading={loading}
                />
              </div>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Daily Target</p>
                    <p className="text-2xl font-bold text-gray-900">50</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>94% completed</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quality Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data?.qualityMetrics?.avgScore?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>Above target</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Efficiency</p>
                    <p className="text-2xl font-bold text-gray-900">97.2%</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>+2.3% vs yesterday</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data?.qualityMetrics?.aiAccuracy?.toFixed(1) || '0.0'}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InspectorDashboard;
