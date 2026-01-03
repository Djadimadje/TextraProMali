'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { qualityService } from '../../../../../services/qualityService';
import AdminSidebar from '../../../../../components/layout/AdminSidebar';
import Header from '../../../../../components/layout/Header';
import QualityDashboard from '../../../../../components/quality/QualityDashboard';
import RecentChecks from '../../../../../components/quality/RecentChecks';
import QualityAlerts from '../../../../../components/quality/QualityAlerts';
import QualityChecks from '../../../../../components/quality/QualityChecks';
import QualityStandards from '../../../../../components/quality/QualityStandards';
import { 
  XCircle,
  AlertTriangle, 
  FileText,
  RefreshCw,
  BarChart3,
  CheckCircle
} from 'lucide-react';

const QualityPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states with proper types
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [qualityChecks, setQualityChecks] = useState<any[]>([]);
  const [qualityStats, setQualityStats] = useState<any>(null);

  // Load data on component mount
  useEffect(() => {
    console.log('=== QUALITY PAGE DEBUG ===');
    console.log('authLoading:', authLoading);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('localStorage access_token:', !!localStorage.getItem('access_token'));
    console.log('localStorage user:', !!localStorage.getItem('user'));
    console.log('========================');
    
    if (isAuthenticated && !authLoading) {
      loadDashboardData();
      loadQualityChecks();
      loadStats();
    }
  }, [isAuthenticated, authLoading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await qualityService.getDashboardData();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadQualityChecks = async () => {
    try {
      const response = await qualityService.getQualityChecks({ page_size: 20 });
      if (response.success) {
        setQualityChecks(response.data.results || []);
      }
    } catch (err) {
      console.error('Failed to load quality checks:', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await qualityService.getQualityStats();
      if (response.success) {
        setQualityStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center ml-[240px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading quality control...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col items-center justify-center ml-[240px]">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access the quality control module.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-[240px]">
        <Header 
          userRole="admin"
          title="Quality Control"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Quality Control</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Monitor and manage textile quality inspections
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
                  { id: 'checks', name: 'Quality Checks', icon: CheckCircle },
                  { id: 'standards', name: 'Standards', icon: FileText }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-violet-500 text-violet-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <QualityDashboard dashboardData={dashboardData} loading={loading} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RecentChecks 
                    checks={dashboardData?.recent_checks || []} 
                    loading={loading} 
                  />
                  <QualityAlerts 
                    alerts={dashboardData?.alerts || []} 
                    loading={loading} 
                  />
                </div>
              </div>
            )}

            {/* Quality Checks Tab */}
            {activeTab === 'checks' && (
              <QualityChecks 
                onNewCheck={() => {
                  // Reload data when new check is completed
                  loadDashboardData();
                  loadQualityChecks();
                }}
              />
            )}

            {/* Upload Images tab removed per request */}

            {/* Quality Standards Tab */}
            {activeTab === 'standards' && <QualityStandards />}

            {/* Other tabs placeholder - Remove this section */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default QualityPage;
