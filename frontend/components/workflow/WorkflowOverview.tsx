'use client';
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Users,
  Settings,
  BarChart3,
  ArrowRight,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';
import { workflowService, WorkflowStats, WorkflowDashboard } from '@/services/workflowService';
import { BatchWorkflow } from '@/types/api';

interface WorkflowOverviewProps {
  filters: any;
  refreshData: () => void;
}

const WorkflowOverview: React.FC<WorkflowOverviewProps> = ({ filters, refreshData }) => {
  const [stats, setStats] = useState<WorkflowStats>({
    total_batches: 0,
    active_batches: 0,
    completed_batches: 0,
    delayed_batches: 0,
    cancelled_batches: 0,
    avg_completion_time: 0,
    on_time_delivery_rate: 0,
    current_efficiency: 0,
  });

  const [recentBatches, setRecentBatches] = useState<BatchWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, dashboardData] = await Promise.all([
        workflowService.getWorkflowStats(),
        workflowService.getWorkflowDashboard(),
      ]);

      setStats(statsData);
      setRecentBatches(dashboardData.recent_batches || []);
    } catch (err) {
      console.error('Error loading workflow data:', err);
      setError('Failed to load workflow data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  useEffect(() => {
    const handleRefresh = () => loadData();
    window.addEventListener('workflowRefresh', handleRefresh);
    return () => window.removeEventListener('workflowRefresh', handleRefresh);
  }, []);

  const handleRefresh = () => {
    refreshData();
    loadData();
  };

  // Calculate completion rate
  const completionRate = stats.total_batches > 0 
    ? Math.round((stats.completed_batches / stats.total_batches) * 100)
    : 0;

  // Process metrics based on real data
  const processMetrics = [
    {
      name: 'Production Efficiency',
      current: Math.round(stats.current_efficiency),
      target: 90,
      trend: stats.current_efficiency >= 80 ? 'up' : 'down',
      change: stats.current_efficiency >= 80 ? '+2.1%' : '-1.2%'
    },
    {
      name: 'On-Time Delivery',
      current: Math.round(stats.on_time_delivery_rate),
      target: 95,
      trend: stats.on_time_delivery_rate >= 90 ? 'up' : 'down',
      change: stats.on_time_delivery_rate >= 90 ? '+1.5%' : '-0.8%'
    },
    {
      name: 'Average Cycle Time',
      current: Math.round(stats.avg_completion_time * 10) / 10,
      target: 7.0,
      trend: stats.avg_completion_time <= 8 ? 'up' : 'down',
      change: stats.avg_completion_time <= 8 ? '-0.3d' : '+0.5d',
      unit: 'days'
    },
    {
      name: 'Batch Completion Rate',
      current: completionRate,
      target: 92,
      trend: completionRate >= 85 ? 'up' : 'down',
      change: completionRate >= 85 ? '+3.2%' : '-2.1%'
    }
  ];

  // Mock department status - in real app this would come from API
  const departmentStatus = [
    { name: 'Production Line A', status: 'optimal', efficiency: 92, issues: 0 },
    { name: 'Production Line B', status: 'good', efficiency: 85, issues: 1 },
    { name: 'Quality Control', status: 'optimal', efficiency: 96, issues: 0 },
    { name: 'Maintenance', status: 'warning', efficiency: 78, issues: 2 },
    { name: 'Logistics', status: stats.delayed_batches > 5 ? 'delayed' : 'good', efficiency: 71, issues: stats.delayed_batches },
    { name: 'Planning', status: 'good', efficiency: 88, issues: 1 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'delayed': return 'danger';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'optimal': return 'success';
      case 'good': return 'info';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'in_progress': return <Activity size={16} />;
      case 'delayed': return <AlertTriangle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'cancelled': return <AlertTriangle size={16} />;
      case 'optimal': return <CheckCircle size={16} />;
      case 'good': return <TrendingUp size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const formatBatchActivity = (batch: BatchWorkflow) => {
    const timeAgo = batch.created_at 
      ? new Date(Date.now() - new Date(batch.created_at).getTime()).getHours() + 'h ago'
      : 'Recently';

    switch (batch.status) {
      case 'completed':
        return {
          time: timeAgo,
          detail: `${workflowService.formatDuration(batch.duration_days)} • ${workflowService.calculateProgress(batch)}% efficiency`
        };
      case 'in_progress':
        return {
          time: timeAgo,
          detail: `${workflowService.calculateProgress(batch)}% complete`
        };
      case 'delayed':
        return {
          time: timeAgo,
          detail: `Delayed • ${batch.days_remaining ? Math.abs(batch.days_remaining) + 'd overdue' : 'Timeline exceeded'}`
        };
      case 'pending':
        return {
          time: timeAgo,
          detail: 'Awaiting start'
        };
      default:
        return {
          time: timeAgo,
          detail: 'Status unknown'
        };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} padding="lg" className="text-center animate-pulse">
              <div className="w-6 h-6 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
        <button 
          onClick={handleRefresh} 
          className="mt-3 text-red-600 hover:text-red-800 text-sm underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card padding="lg" className="text-center">
          <Activity className="mx-auto mb-2 text-blue-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{stats.active_batches}</div>
          <div className="text-sm text-gray-600">Active Workflows</div>
        </Card>

        <Card padding="lg" className="text-center">
          <Clock className="mx-auto mb-2 text-green-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{stats.avg_completion_time.toFixed(1)}d</div>
          <div className="text-sm text-gray-600">Avg Cycle Time</div>
        </Card>

        <Card padding="lg" className="text-center">
          <TrendingUp className="mx-auto mb-2 text-purple-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{Math.round(stats.current_efficiency)}%</div>
          <div className="text-sm text-gray-600">Efficiency</div>
        </Card>

        <Card padding="lg" className="text-center">
          <AlertTriangle className="mx-auto mb-2 text-orange-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{stats.delayed_batches}</div>
          <div className="text-sm text-gray-600">Delayed</div>
        </Card>

        <Card padding="lg" className="text-center">
          <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{stats.completed_batches}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </Card>

        <Card padding="lg" className="text-center">
          <Target className="mx-auto mb-2 text-indigo-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{Math.round(stats.on_time_delivery_rate)}%</div>
          <div className="text-sm text-gray-600">On-Time Rate</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Batches</h3>
            <button 
              onClick={handleRefresh}
              className="text-blue-600 hover:text-blue-800"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="space-y-4">
            {recentBatches.length > 0 ? (
              recentBatches.slice(0, 4).map(batch => {
                const activity = formatBatchActivity(batch);
                return (
                  <div key={batch.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(batch.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{batch.batch_code}</p>
                          <p className="text-xs text-gray-600 mb-1">{batch.description || 'No description'}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(batch.status)} size="sm">
                              {batch.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-gray-600">
                              {activity.time} • {activity.detail}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="text-gray-400" size={14} />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500">
                No recent batches found
              </div>
            )}
          </div>
        </Card>

        {/* Process Metrics */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Process Metrics</h3>
            <BarChart3 className="text-blue-600" size={20} />
          </div>

          <div className="space-y-4">
            {processMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {metric.current}{metric.unit || '%'}
                    </span>
                    <Badge 
                      variant={metric.trend === 'up' ? 'success' : 'danger'} 
                      size="sm"
                    >
                      {metric.change}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <ProgressBar 
                    value={Math.min((metric.current / metric.target) * 100, 100)} 
                    variant={metric.current >= metric.target ? 'success' : 'warning'}
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-gray-600">
                    Target: {metric.target}{metric.unit || '%'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Department Status */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Department Status</h3>
          <Users className="text-blue-600" size={20} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentStatus.map((dept, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">{dept.name}</h4>
                <Badge variant={getStatusColor(dept.status)} size="sm">
                  {dept.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Efficiency</span>
                  <span className="font-medium">{dept.efficiency}%</span>
                </div>
                
                <ProgressBar 
                  value={dept.efficiency} 
                  variant={dept.efficiency >= 90 ? 'success' : dept.efficiency >= 80 ? 'warning' : 'danger'}
                  className="h-2"
                />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {dept.issues === 0 ? 'No issues' : `${dept.issues} issue${dept.issues > 1 ? 's' : ''}`}
                  </span>
                  {dept.efficiency >= 90 && (
                    <Zap className="text-green-600" size={12} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <BarChart3 className="text-blue-600 mb-2" size={20} />
            <div className="text-sm font-medium text-gray-900">View Analytics</div>
            <div className="text-xs text-gray-600">Detailed process analysis</div>
          </button>
          
          <button className="p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <AlertTriangle className="text-orange-600 mb-2" size={20} />
            <div className="text-sm font-medium text-gray-900">Check Bottlenecks</div>
            <div className="text-xs text-gray-600">Identify process delays</div>
          </button>
          
          <button className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <TrendingUp className="text-green-600 mb-2" size={20} />
            <div className="text-sm font-medium text-gray-900">Optimize Processes</div>
            <div className="text-xs text-gray-600">Improve efficiency</div>
          </button>
          
          <button className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Settings className="text-purple-600 mb-2" size={20} />
            <div className="text-sm font-medium text-gray-900">Workflow Designer</div>
            <div className="text-xs text-gray-600">Create new workflows</div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default WorkflowOverview;
