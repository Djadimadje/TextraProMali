'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { analyticsService, type AnalyticsFilters } from '../../../../../services/analyticsService';
import AdminSidebar from '../../../../../components/layout/AdminSidebar';
import Header from '../../../../../components/layout/Header';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  CalendarDays,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Cog,
  CheckCircle,
  Wrench,
  BarChart3,
  Activity,
  Clock,
  Target,
  DollarSign,
  Package,
  RefreshCw
} from 'lucide-react';

// Color schemes for charts
const COLORS = {
  primary: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
  secondary: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
  warning: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
  danger: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA'],
  info: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE']
};

// Simple Card Header and Title components
const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`pb-3 border-b border-gray-100 mb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description?: string;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  description 
}) => {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const changeIcon = {
    positive: <TrendingUp className="w-4 h-4" />,
    negative: <TrendingDown className="w-4 h-4" />,
    neutral: null
  };

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
          {change && (
            <div className={`flex items-center space-x-1 ${changeColor[changeType]}`}>
              {changeIcon[changeType]}
              <span className="text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

// Sample chart data (will be replaced with real data)
const sampleProductionData = [
  { date: '2024-01-01', completed: 85, inProgress: 12, delayed: 3 },
  { date: '2024-01-02', completed: 92, inProgress: 6, delayed: 2 },
  { date: '2024-01-03', completed: 88, inProgress: 10, delayed: 2 },
  { date: '2024-01-04', completed: 95, inProgress: 4, delayed: 1 },
  { date: '2024-01-05', completed: 90, inProgress: 8, delayed: 2 },
];

const sampleMachineData = [
  { name: 'Ginning', operational: 45, maintenance: 3, offline: 2 },
  { name: 'Spinning', operational: 38, maintenance: 2, offline: 1 },
  { name: 'Weaving', operational: 32, maintenance: 4, offline: 1 },
  { name: 'Dyeing', operational: 28, maintenance: 2, offline: 0 },
];

const sampleQualityData = [
  { name: 'Approved', value: 78, color: COLORS.primary[0] },
  { name: 'Rejected', value: 12, color: COLORS.danger[0] },
  { name: 'Pending', value: 10, color: COLORS.warning[0] },
];

export default function AnalyticsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [dateRange, setDateRange] = useState('week');
  
  // Analytics data state
  const [productionData, setProductionData] = useState<any>(null);
  const [machineData, setMachineData] = useState<any>(null);
  const [qualityData, setQualityData] = useState<any>(null);
  const [maintenanceData, setMaintenanceData] = useState<any>(null);
  const [allocationData, setAllocationData] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // Load analytics data
  useEffect(() => {
    console.log('Analytics page useEffect triggered');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('authLoading:', authLoading);
    
    if (isAuthenticated && !authLoading) {
      console.log('Loading analytics data...');
      loadAnalyticsData();
    } else {
      console.log('Not loading data - auth state:', { isAuthenticated, authLoading });
    }
  }, [isAuthenticated, authLoading, filters]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        productionResult,
        machineResult,
        qualityResult,
        maintenanceResult,
        allocationResult,
        dashboardResult
      ] = await Promise.all([
        analyticsService.getProductionAnalytics(filters),
        analyticsService.getMachineAnalytics(filters),
        analyticsService.getQualityAnalytics(filters),
        analyticsService.getMaintenanceAnalytics(filters),
        analyticsService.getAllocationAnalytics(filters),
        analyticsService.getDashboardSummary()
      ]);

      if (productionResult.success) setProductionData(productionResult.data);
      if (machineResult.success) setMachineData(machineResult.data);
      if (qualityResult.success) setQualityData(qualityResult.data);
      if (maintenanceResult.success) setMaintenanceData(maintenanceResult.data);
      if (allocationResult.success) setAllocationData(allocationResult.data);
      if (dashboardResult.success) setDashboardStats(dashboardResult.data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      console.error('Analytics loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: string, format: 'pdf' | 'excel' | 'csv' = 'excel') => {
    try {
      const blob = await analyticsService.exportAnalyticsReport(
        type as any,
        format,
        filters
      );
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_analytics_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export analytics report');
    }
  };

  const updateDateRange = (range: string) => {
    setDateRange(range);
    
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    setFilters({
      ...filters,
      date_range: {
        start: startDate.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
      }
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center ml-[240px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics dashboard...</p>
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
          <p className="text-gray-600 mb-4">Please log in to access the analytics module.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
          title="Analytics Dashboard"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Comprehensive analytics and insights for production management
                  </p>
                </div>
                
                {/* Filters and Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <select
                      value={dateRange}
                      onChange={(e) => updateDateRange(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="today">Today</option>
                      <option value="week">Last 7 days</option>
                      <option value="month">Last 30 days</option>
                      <option value="quarter">Last 90 days</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport('production', 'excel')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </button>
                    <button
                      onClick={loadAnalyticsData}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-purple-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Analytics Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={loadAnalyticsData}
                        className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Overall Efficiency"
          value={`${productionData?.efficiency || 87.5}%`}
          change="+2.3%"
          changeType="positive"
          icon={<Target className="h-5 w-5 text-purple-600" />}
          description="Production efficiency vs targets"
        />
        <KPICard
          title="Batches Completed"
          value={productionData?.total_batches || 142}
          change="+15"
          changeType="positive"
          icon={<Package className="h-5 w-5 text-green-600" />}
          description="Total completed in period"
        />
        <KPICard
          title="Machine Uptime"
          value={`${machineData?.utilization_rate || 94.2}%`}
          change="-1.5%"
          changeType="negative"
          icon={<Cog className="h-5 w-5 text-blue-600" />}
          description="Average machine utilization"
        />
        <KPICard
          title="Quality Score"
          value={`${qualityData?.percentages?.approved || 89.3}%`}
          change="+0.8%"
          changeType="positive"
          icon={<CheckCircle className="h-5 w-5 text-orange-600" />}
          description="Approval rate for quality checks"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Production Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sampleProductionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="1"
                  stroke={COLORS.primary[0]}
                  fill={COLORS.primary[0]}
                  name="Completed"
                />
                <Area
                  type="monotone"
                  dataKey="inProgress"
                  stackId="1"
                  stroke={COLORS.info[0]}
                  fill={COLORS.info[0]}
                  name="In Progress"
                />
                <Area
                  type="monotone"
                  dataKey="delayed"
                  stackId="1"
                  stroke={COLORS.danger[0]}
                  fill={COLORS.danger[0]}
                  name="Delayed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Machine Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cog className="h-5 w-5 text-blue-600" />
              Machine Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sampleMachineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="operational"
                  fill={COLORS.secondary[0]}
                  name="Operational"
                />
                <Bar
                  dataKey="maintenance"
                  fill={COLORS.warning[0]}
                  name="Maintenance"
                />
                <Bar
                  dataKey="offline"
                  fill={COLORS.danger[0]}
                  name="Offline"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quality Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Quality Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sampleQualityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sampleQualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resource Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Resource Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Workforce</span>
                  <span>{allocationData?.workforce_stats?.utilization_rate || 85}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${allocationData?.workforce_stats?.utilization_rate || 85}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Materials</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Equipment</span>
                  <span>{machineData?.utilization_rate || 94}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${machineData?.utilization_rate || 94}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Maintenance</span>
                  <span>78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-orange-600" />
              Maintenance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Scheduled</span>
                <Badge variant="info">{maintenanceData?.status_breakdown?.scheduled || 12}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">In Progress</span>
                <Badge variant="warning">{maintenanceData?.status_breakdown?.in_progress || 8}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <Badge variant="success">{maintenanceData?.status_breakdown?.completed || 45}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Overdue</span>
                <Badge variant="danger">{maintenanceData?.status_breakdown?.overdue || 3}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Production Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Batches</span>
                <Badge variant="info">{productionData?.status_breakdown?.in_progress || 18}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completed Today</span>
                <Badge variant="success">{productionData?.status_breakdown?.completed || 127}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Delayed</span>
                <Badge variant="warning">{productionData?.status_breakdown?.delayed || 5}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Duration</span>
                <span className="text-sm font-medium">{productionData?.average_duration_days || 3.2} days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Cost Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Material Costs</span>
                <span className="text-sm font-medium">
                  {analyticsService.formatCurrency(allocationData?.material_stats?.total_cost || 2450000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Maintenance</span>
                <span className="text-sm font-medium">
                  {analyticsService.formatCurrency(maintenanceData?.cost_analysis?.total_cost || 890000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg per Batch</span>
                <span className="text-sm font-medium">
                  {analyticsService.formatCurrency(15000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Efficiency Gain</span>
                <Badge variant="success">+12.5%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
