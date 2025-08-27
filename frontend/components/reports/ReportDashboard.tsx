'use client';
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { ReportFilters } from '../../src/app/(dashboard)/analyst/reports/page';
import { formatCurrency } from '../../lib/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Users
} from 'lucide-react';

interface DashboardMetrics {
  production: {
    total_output: number;
    efficiency: number;
    trend: 'up' | 'down' | 'stable';
    target_achievement: number;
  };
  quality: {
    defect_rate: number;
    quality_score: number;
    trend: 'up' | 'down' | 'stable';
    customer_satisfaction: number;
  };
  maintenance: {
    planned_vs_unplanned: {
      planned: number;
      unplanned: number;
    };
    average_downtime: number;
    trend: 'up' | 'down' | 'stable';
  };
  financial: {
    total_cost: number;
    cost_per_unit: number;
    savings: number;
    trend: 'up' | 'down' | 'stable';
  };
}

interface ReportDashboardProps {
  filters: ReportFilters;
  loading: boolean;
  data?: any;
}

const ReportDashboard: React.FC<ReportDashboardProps> = ({ filters, loading, data }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'current' | 'previous'>('current');

  useEffect(() => {
    if (data) {
      // Use backend data when available
      console.log('Using backend data for ReportDashboard:', data);
      setMetrics(transformBackendData(data));
    } else {
      // Fallback to mock data
      loadDashboardData();
    }
  }, [filters, data]);

  const transformBackendData = (backendData: any): DashboardMetrics => {
    // Transform backend data to match the component's expected format
    return {
      production: {
        total_output: backendData?.metrics?.totalProduction || 0,
        efficiency: backendData?.metrics?.efficiency || 0,
        trend: backendData?.trends?.production || 'stable',
        target_achievement: backendData?.metrics?.targetAchievement || 0
      },
      quality: {
        defect_rate: backendData?.metrics?.defectRate || 0,
        quality_score: backendData?.metrics?.qualityScore || 0,
        trend: backendData?.trends?.quality || 'stable',
        customer_satisfaction: backendData?.metrics?.customerSatisfaction || 0
      },
      maintenance: {
        planned_vs_unplanned: {
          planned: backendData?.metrics?.plannedMaintenance || 0,
          unplanned: backendData?.metrics?.unplannedMaintenance || 0
        },
        average_downtime: backendData?.metrics?.avgDowntime || 0,
        trend: backendData?.trends?.maintenance || 'stable'
      },
      financial: {
        total_cost: backendData?.metrics?.totalCost || 0,
        cost_per_unit: backendData?.metrics?.costPerUnit || 0,
        savings: backendData?.metrics?.savings || 0,
        trend: backendData?.trends?.financial || 'stable'
      }
    };
  };

  useEffect(() => {
    const handleRefresh = () => {
      loadDashboardData();
    };
    
    window.addEventListener('reportsRefresh', handleRefresh);
    return () => window.removeEventListener('reportsRefresh', handleRefresh);
  }, []);

  const loadDashboardData = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock data based on filters
    const mockMetrics: DashboardMetrics = {
      production: {
        total_output: 125400,
        efficiency: 89.2,
        trend: 'up',
        target_achievement: 94.7
      },
      quality: {
        defect_rate: 2.1,
        quality_score: 96.8,
        trend: 'up',
        customer_satisfaction: 4.7
      },
      maintenance: {
        planned_vs_unplanned: {
          planned: 78,
          unplanned: 22
        },
        average_downtime: 4.2,
        trend: 'down'
      },
      financial: {
        total_cost: 847250,
        cost_per_unit: 6.76,
        savings: 23400,
        trend: 'down'
      }
    };

    setMetrics(mockMetrics);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="text-green-600" size={16} />;
    if (trend === 'down') return <TrendingDown className="text-red-600" size={16} />;
    return <Activity className="text-gray-600" size={16} />;
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', isPositive: boolean = true) => {
    if (trend === 'stable') return 'text-gray-600';
    if (trend === 'up') return isPositive ? 'text-green-600' : 'text-red-600';
    return isPositive ? 'text-red-600' : 'text-green-600';
  };

  const getDateRangeLabel = () => {
    if (filters.timeRange === 'custom') {
      return `${filters.dateFrom} to ${filters.dateTo}`;
    }
    const labels = {
      '1d': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days'
    };
    return labels[filters.timeRange] || 'Last 7 Days';
  };

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} variant="elevated" padding="lg">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reports Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Comprehensive overview for {getDateRangeLabel().toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">
            <Activity size={12} />
            Live Data
          </Badge>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Production Metrics */}
        <Card variant="elevated" padding="lg">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <BarChart3 className="text-blue-600" size={20} />
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Production Output
              </h3>
            </div>
            {getTrendIcon(metrics.production.trend)}
          </div>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {metrics.production.total_output.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">units</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {metrics.production.efficiency}% efficiency
            </p>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Target Achievement</span>
            <span className={`font-medium ${metrics.production.target_achievement >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
              {metrics.production.target_achievement}%
            </span>
          </div>
        </Card>

        {/* Quality Metrics */}
        <Card variant="elevated" padding="lg">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Quality Score
              </h3>
            </div>
            {getTrendIcon(metrics.quality.trend)}
          </div>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {metrics.quality.quality_score}%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {metrics.quality.defect_rate}% defect rate
            </p>
          </div>

          <ProgressBar 
            value={metrics.quality.quality_score}
            variant={metrics.quality.quality_score >= 95 ? 'success' : 
                   metrics.quality.quality_score >= 85 ? 'warning' : 'danger'}
            size="sm"
          />
        </Card>

        {/* Maintenance Metrics */}
        <Card variant="elevated" padding="lg">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Avg Downtime
              </h3>
            </div>
            {getTrendIcon(metrics.maintenance.trend)}
          </div>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {metrics.maintenance.average_downtime}
              </span>
              <span className="text-sm text-gray-500">hours</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {metrics.maintenance.planned_vs_unplanned.planned}% planned
            </p>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Planned vs Unplanned</span>
            <span className="font-medium text-blue-600">
              {metrics.maintenance.planned_vs_unplanned.planned}:{metrics.maintenance.planned_vs_unplanned.unplanned}
            </span>
          </div>
        </Card>

        {/* Financial Metrics */}
        <Card variant="elevated" padding="lg">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100">
                <DollarSign className="text-purple-600" size={20} />
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Total Cost
              </h3>
            </div>
            {getTrendIcon(metrics.financial.trend)}
          </div>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(metrics.financial.total_cost)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              ${metrics.financial.cost_per_unit} per unit
            </p>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Savings</span>
            <span className="font-medium text-green-600">
              +${metrics.financial.savings.toLocaleString()}
            </span>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Efficiency Breakdown */}
        <Card variant="elevated" padding="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Production Efficiency</h3>
              <Badge variant="info" size="sm">
                Daily
              </Badge>
            </div>

            <div className="space-y-4">
              {/* Overall Efficiency */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Efficiency</span>
                  <span className="text-sm font-bold text-gray-900">{metrics.production.efficiency}%</span>
                </div>
                <ProgressBar 
                  value={metrics.production.efficiency}
                  variant={metrics.production.efficiency >= 90 ? 'success' : 
                         metrics.production.efficiency >= 75 ? 'warning' : 'danger'}
                  size="md"
                />
              </div>

              {/* Target Achievement */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Target Achievement</span>
                  <span className="text-sm font-bold text-gray-900">{metrics.production.target_achievement}%</span>
                </div>
                <ProgressBar 
                  value={metrics.production.target_achievement}
                  variant={metrics.production.target_achievement >= 95 ? 'success' : 
                         metrics.production.target_achievement >= 85 ? 'warning' : 'danger'}
                  size="md"
                />
              </div>

              {/* Department Breakdown */}
              <div className="pt-2 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Department Performance</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Production Line A', efficiency: 94.2 },
                    { name: 'Production Line B', efficiency: 87.1 },
                    { name: 'Quality Control', efficiency: 91.7 },
                    { name: 'Packaging', efficiency: 85.3 }
                  ].map(dept => (
                    <div key={dept.name} className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">{dept.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{dept.efficiency}%</span>
                        <div className="w-16">
                          <ProgressBar 
                            value={dept.efficiency}
                            variant={dept.efficiency >= 90 ? 'success' : 
                                   dept.efficiency >= 80 ? 'warning' : 'danger'}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quality & Maintenance Overview */}
        <Card variant="elevated" padding="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Quality & Maintenance</h3>
              <Badge variant="success" size="sm">
                Optimized
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Quality Metrics */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Quality</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Quality Score</span>
                    <span className="text-sm font-bold text-green-600">{metrics.quality.quality_score}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Defect Rate</span>
                    <span className="text-sm font-bold text-gray-900">{metrics.quality.defect_rate}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Customer Satisfaction</span>
                    <span className="text-sm font-bold text-blue-600">{metrics.quality.customer_satisfaction}/5.0</span>
                  </div>
                </div>
              </div>

              {/* Maintenance Metrics */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Maintenance</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Avg Downtime</span>
                    <span className="text-sm font-bold text-gray-900">{metrics.maintenance.average_downtime}h</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Planned %</span>
                    <span className="text-sm font-bold text-green-600">{metrics.maintenance.planned_vs_unplanned.planned}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Unplanned %</span>
                    <span className="text-sm font-bold text-red-600">{metrics.maintenance.planned_vs_unplanned.unplanned}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Cost Analysis</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-600">Total Cost</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(metrics.financial.total_cost)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Cost per Unit</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(metrics.financial.cost_per_unit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Savings</p>
                  <p className="text-lg font-bold text-green-600">
                    +${(metrics.financial.savings / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="elevated" padding="lg">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Report Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                title: 'Production Report', 
                description: 'Detailed production metrics and trends',
                icon: <BarChart3 size={20} />,
                color: 'bg-blue-100 text-blue-600'
              },
              { 
                title: 'Quality Analysis', 
                description: 'Quality metrics and compliance data',
                icon: <Target size={20} />,
                color: 'bg-green-100 text-green-600'
              },
              { 
                title: 'Maintenance Schedule', 
                description: 'Preventive and corrective maintenance',
                icon: <Clock size={20} />,
                color: 'bg-yellow-100 text-yellow-600'
              },
              { 
                title: 'Financial Summary', 
                description: 'Cost analysis and ROI calculations',
                icon: <DollarSign size={20} />,
                color: 'bg-purple-100 text-purple-600'
              }
            ].map((action, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <div className={`p-2 rounded-lg ${action.color} w-fit mb-3`}>
                  {action.icon}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportDashboard;
