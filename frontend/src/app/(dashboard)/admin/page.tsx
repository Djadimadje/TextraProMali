'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useActivityTracker } from '../../../hooks/useActivityTracker';
import apiService from '../../../services/api';
import AdminSidebar from '../../../../components/layout/AdminSidebar';
import Header from '../../../../components/layout/Header';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Badge from '../../../../components/ui/Badge';
import ProgressBar from '../../../../components/ui/ProgressBar';
import { DashboardStats, SystemKPI, Activity } from '../../../types/api';

const AdminDashboard: React.FC = () => {
  // Track user activity for auto-logout
  useActivityTracker();
  
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [systemKPIs, setSystemKPIs] = useState<SystemKPI[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication and authorization check
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.push('/login');
        return;
      }
      
      if (user && user.role !== 'admin') {
        // Redirect to user's own dashboard if not admin
        const userDashboard = `/${user.role}`;
        router.push(userDashboard);
        return;
      }
      
      // Only load data if user is authenticated and is admin
      if (user && user.role === 'admin') {
        loadDashboardData();
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading dashboard data from real API...');

      // Load all dashboard data in parallel
      const [statsResponse, kpisResponse, activitiesResponse] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getSystemKPIs(),
        apiService.getRecentActivities()
      ]);

      console.log('Dashboard data loaded:', { statsResponse, kpisResponse, activitiesResponse });

      setDashboardStats(statsResponse);
      setSystemKPIs(kpisResponse);
      setRecentActivities(activitiesResponse);

    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(`Error loading dashboard data: ${err.message || 'Unknown error'}`);
      
      // Don't fallback to mock data - show the error instead
      console.log('API Error - check backend connection and authentication');
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    // Mock data based on backend structure
    const mockStats: DashboardStats = {
      machines: {
        total: 50,
        active: 47,
        maintenance: 2,
        offline: 1
      },
      production: {
        daily_output: 2850,
        weekly_output: 19950,
        efficiency: 94.7,
        quality_score: 98.2
      },
      maintenance: {
        pending: 3,
        in_progress: 2,
        overdue: 1,
        completed_today: 5
      },
      quality: {
        checks_today: 45,
        defect_rate: 1.8,
        approval_rate: 98.2,
        ai_accuracy: 94.5
      }
    };

    const mockKPIs: SystemKPI[] = [
      {
        title: 'Active Machines',
        value: `${mockStats.machines.active}`,
        unit: `/${mockStats.machines.total}`,
        change: '+2',
        changeType: 'positive',
        target: mockStats.machines.total,
        current: mockStats.machines.active
      },
      {
        title: 'Daily Production',
        value: `${mockStats.production.daily_output.toLocaleString()}`,
        unit: 'kg',
        change: '+12.5%',
        changeType: 'positive',
        target: 3000,
        current: mockStats.production.daily_output
      },
      {
        title: 'Quality Rate',
        value: `${mockStats.production.quality_score}`,
        unit: '%',
        change: '+0.8%',
        changeType: 'positive',
        target: 100,
        current: mockStats.production.quality_score
      },
      {
        title: 'Overall Efficiency',
        value: `${mockStats.production.efficiency}`,
        unit: '%',
        change: '+3.2%',
        changeType: 'positive',
        target: 100,
        current: mockStats.production.efficiency
      }
    ];

    const mockActivities: Activity[] = [
      {
        id: 1,
        type: 'maintenance',
        message: 'Scheduled maintenance - Machine CTN-GIN-045 (Ginning Sikasso)',
        user: 'System',
        time: '5 minutes ago',
        severity: 'info'
      },
      {
        id: 2,
        type: 'user',
        message: 'New user created: Aminata Diarra (Quality Inspector)',
        user: 'Admin',
        time: '12 minutes ago',
        severity: 'success'
      },
      {
        id: 3,
        type: 'alert',
        message: 'Quality threshold exceeded - Batch BAT-2024-089 (Cotton Koutiala)',
        user: 'Quality System',
        time: '18 minutes ago',
        severity: 'warning'
      },
      {
        id: 4,
        type: 'production',
        message: 'Daily target reached at 95% (2,708 kg produced)',
        user: 'Production System',
        time: '25 minutes ago',
        severity: 'success'
      },
      {
        id: 5,
        type: 'maintenance',
        message: 'Corrective maintenance completed - Machine FIL-023 (Spinning Segou)',
        user: 'Boubacar Keita',
        time: '32 minutes ago',
        severity: 'success'
      }
    ];

    setDashboardStats(mockStats);
    setSystemKPIs(mockKPIs);
    setRecentActivities(mockActivities);
  };

    const systemStatus = [
    {
      system: 'Machines',
      status: dashboardStats?.machines.offline === 0 ? 'Operational' : 'Issues',
      statusColor: dashboardStats?.machines.offline === 0 ? 'success' as const : 'warning' as const,
      uptime: '99.8%',
      issues: dashboardStats?.machines.offline || 0,
      description: 'Machine management system'
    },
    {
      system: 'Quality Control',
      status: dashboardStats?.quality.defect_rate && dashboardStats.quality.defect_rate < 5 ? 'Operational' : 'Attention',
      statusColor: dashboardStats?.quality.defect_rate && dashboardStats.quality.defect_rate < 5 ? 'success' as const : 'warning' as const,
      uptime: `${dashboardStats?.quality.approval_rate || 0}%`,
      issues: 0,
      description: 'AI quality control system'
    },
    {
      system: 'Maintenance',
      status: dashboardStats?.maintenance.overdue === 0 ? 'Operational' : 'Overdue',
      statusColor: dashboardStats?.maintenance.overdue === 0 ? 'success' as const : 'danger' as const,
      uptime: '97.2%',
      issues: dashboardStats?.maintenance.overdue || 0,
      description: 'Predictive maintenance system'
    },
    {
      system: 'AI & Analytics',
      status: dashboardStats?.quality.ai_accuracy && dashboardStats.quality.ai_accuracy > 90 ? 'Operational' : 'Calibrating',
      statusColor: dashboardStats?.quality.ai_accuracy && dashboardStats.quality.ai_accuracy > 90 ? 'success' as const : 'warning' as const,
      uptime: `${dashboardStats?.quality.ai_accuracy || 0}%`,
      issues: 0,
      description: 'Artificial intelligence system'
    }
  ];  const getActivityIcon = (type: string) => {
    const icons = {
      system: '⚙️',
      user: '👤',
      alert: '⚠️',
      production: '📦',
      maintenance: '🔧'
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if redirecting (authentication will handle redirect)
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">Access Denied</div>
          <p className="text-gray-600">You must be an administrator to access this page.</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching dashboard data
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center ml-[240px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
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
          title="Admin Dashboard"
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user?.first_name || user?.username || 'Administrator'}!
            </h1>
            <p className="text-gray-600 text-lg">
              Here's a complete overview of your TexPro AI textile production system.
            </p>
            
            {/* Data Source Indicator */}
            <div className="mt-4 flex items-center gap-4">
              {!loading && (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  error ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    error ? 'bg-yellow-400' : 'bg-green-400 animate-pulse'
                  }`}></div>
                  {error ? 'Using Demo Data' : 'Live Data Connected'}
                </div>
              )}
              
              {dashboardStats && (
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleString('en-US')}
                </div>
              )}
            </div>
          </div>

          {/* System KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {systemKPIs.map((kpi, index) => (
              <Card key={index} variant="elevated" padding="lg">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-medium text-gray-600">
                    {kpi.title}
                  </h3>
                  <Badge 
                    variant={kpi.changeType === 'positive' ? 'success' : 'danger'} 
                    size="sm"
                  >
                    {kpi.change}
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {kpi.value}
                    </span>
                    <span className="text-sm text-gray-600">
                      {kpi.unit}
                    </span>
                  </div>
                </div>

                <ProgressBar
                  value={(kpi.current / kpi.target) * 100}
                  variant="success"
                  size="sm"
                  showLabel
                  label={`${Math.round((kpi.current / kpi.target) * 100)}% de l'objectif`}
                />
              </Card>
            ))}
          </div>

          {/* Dashboard Stats Summary */}
          {dashboardStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card variant="elevated" padding="lg">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Maintenance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">En attente :</span>
                    <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded text-sm">
                      {dashboardStats.maintenance.pending}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">En cours :</span>
                    <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">
                      {dashboardStats.maintenance.in_progress}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">En retard :</span>
                    <span className="font-semibold text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                      {dashboardStats.maintenance.overdue}
                    </span>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="lg">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Quality</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Quality checks today:</span>
                    <span className="font-semibold text-gray-900">{dashboardStats.quality.checks_today}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Defect rate:</span>
                    <span className="font-semibold text-orange-600">{dashboardStats.quality.defect_rate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">AI Accuracy:</span>
                    <span className="font-semibold text-green-600">{dashboardStats.quality.ai_accuracy}%</span>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="lg">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Production</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Weekly:</span>
                    <span className="font-semibold text-gray-900">{dashboardStats.production.weekly_output.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Efficiency:</span>
                    <span className="font-semibold text-green-600">{dashboardStats.production.efficiency}%</span>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="lg">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Machines</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Total:</span>
                    <span className="font-semibold text-gray-900">{dashboardStats.machines.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Maintenance:</span>
                    <span className="font-semibold text-orange-600">{dashboardStats.machines.maintenance}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Offline:</span>
                    <span className="font-semibold text-red-600">{dashboardStats.machines.offline}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* System Status */}
            <div className="lg:col-span-2">
              <Card variant="elevated" padding="lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-global-2">
                    System Status
                  </h2>
                  <Button variant="secondary" size="sm" onClick={handleRefresh}>
                    🔄 Refresh
                  </Button>
                </div>

                <div className="space-y-4">
                  {systemStatus.map((status, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-global-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <h3 className="font-semibold text-global-2">
                            {status.system}
                          </h3>
                          <p className="text-sm text-global-6">
                            Performance: {status.uptime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <Badge variant={status.statusColor} size="sm">
                            {status.status}
                          </Badge>
                          {status.issues > 0 && (
                            <p className="text-xs text-global-6 mt-1">
                              {status.issues} issue(s)
                            </p>
                          )}
                        </div>
                        <Button variant="secondary" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Recent Activities */}
            <div>
              <Card variant="elevated" padding="lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-global-2">
                    Recent Activities
                  </h2>
                  <Badge variant="default" size="sm">
                    {recentActivities.length}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 p-3 border border-global-4 rounded-lg">
                      <div className="text-lg flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-global-2 mb-1">
                          {activity.message}
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-global-6">
                            by {activity.user}
                          </p>
                          <p className="text-xs text-global-6">
                            {activity.time}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            activity.severity === 'success' ? 'success' :
                            activity.severity === 'warning' ? 'warning' :
                            activity.severity === 'error' ? 'danger' : 'default'
                          } 
                          size="sm"
                        >
                          {activity.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-global-4">
                  <Button variant="secondary" size="sm" fullWidth>
                    📜 View Full History
                  </Button>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card variant="elevated" padding="lg" className="mt-6">
                <h2 className="text-lg font-bold text-global-2 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <Button variant="secondary" size="sm" fullWidth>
                    👥 Manage Users
                  </Button>
                  <Button variant="secondary" size="sm" fullWidth>
                    🏭 Monitor Machines
                  </Button>
                  <Button variant="secondary" size="sm" fullWidth>
                    📊 View Reports
                  </Button>
                  <Button variant="secondary" size="sm" fullWidth>
                    ⚙️ System Settings
                  </Button>
                  <Button variant="secondary" size="sm" fullWidth>
                    🔄 Backups
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
