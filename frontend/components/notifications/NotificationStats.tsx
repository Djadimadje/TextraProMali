'use client';
import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Archive,
  TrendingUp,
  Users,
  AlertCircle
} from 'lucide-react';

interface NotificationStatsProps {
  filters: any;
}

const NotificationStats: React.FC<NotificationStatsProps> = ({ filters }) => {
  // Mock data - replace with actual API call
  const statsData = {
    overview: {
      totalNotifications: 347,
      unreadCount: 23,
      criticalAlerts: 4,
      averageResponseTime: 15,
      resolvedToday: 18,
      newToday: 12
    },
    byPriority: [
      { priority: 'critical', count: 4, percentage: 12, trend: 'up' },
      { priority: 'high', count: 12, percentage: 35, trend: 'down' },
      { priority: 'medium', count: 18, percentage: 53, trend: 'stable' },
      { priority: 'low', count: 8, percentage: 23, trend: 'up' }
    ],
    byCategory: [
      { category: 'Production', count: 45, percentage: 30, color: 'bg-blue-500' },
      { category: 'Quality', count: 32, percentage: 21, color: 'bg-green-500' },
      { category: 'Maintenance', count: 28, percentage: 19, color: 'bg-orange-500' },
      { category: 'System', count: 21, percentage: 14, color: 'bg-purple-500' },
      { category: 'Reports', count: 15, percentage: 10, color: 'bg-indigo-500' },
      { category: 'Alerts', count: 9, percentage: 6, color: 'bg-red-500' }
    ],
    recentActivity: [
      {
        type: 'alert',
        message: 'Production line efficiency dropped below 85%',
        time: '2 min ago',
        severity: 'high'
      },
      {
        type: 'report',
        message: 'Daily quality report generated',
        time: '15 min ago',
        severity: 'low'
      },
      {
        type: 'maintenance',
        message: 'Scheduled maintenance reminder for Line A',
        time: '1 hour ago',
        severity: 'medium'
      },
      {
        type: 'system',
        message: 'System backup completed successfully',
        time: '2 hours ago',
        severity: 'low'
      }
    ],
    performance: {
      responseTime: {
        current: 15,
        target: 20,
        trend: 'improving'
      },
      resolutionRate: {
        current: 94.2,
        target: 95.0,
        trend: 'stable'
      },
      escalationRate: {
        current: 8.5,
        target: 10.0,
        trend: 'improving'
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="text-red-500" size={14} />;
      case 'down': return <TrendingUp className="text-green-500 rotate-180" size={14} />;
      case 'stable': return <div className="w-3 h-0.5 bg-gray-400"></div>;
      default: return null;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="text-orange-500" size={14} />;
      case 'medium': return <AlertCircle className="text-yellow-500" size={14} />;
      case 'low': return <CheckCircle className="text-green-500" size={14} />;
      default: return <Bell className="text-blue-500" size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card padding="lg" className="text-center">
          <Bell className="mx-auto mb-2 text-blue-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{statsData.overview.totalNotifications}</div>
          <div className="text-sm text-gray-600">Total Notifications</div>
        </Card>

        <Card padding="lg" className="text-center">
          <AlertCircle className="mx-auto mb-2 text-orange-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{statsData.overview.unreadCount}</div>
          <div className="text-sm text-gray-600">Unread</div>
        </Card>

        <Card padding="lg" className="text-center">
          <AlertTriangle className="mx-auto mb-2 text-red-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{statsData.overview.criticalAlerts}</div>
          <div className="text-sm text-gray-600">Critical Alerts</div>
        </Card>

        <Card padding="lg" className="text-center">
          <Clock className="mx-auto mb-2 text-green-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{statsData.overview.averageResponseTime}m</div>
          <div className="text-sm text-gray-600">Avg Response</div>
        </Card>

        <Card padding="lg" className="text-center">
          <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{statsData.overview.resolvedToday}</div>
          <div className="text-sm text-gray-600">Resolved Today</div>
        </Card>

        <Card padding="lg" className="text-center">
          <TrendingUp className="mx-auto mb-2 text-purple-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{statsData.overview.newToday}</div>
          <div className="text-sm text-gray-600">New Today</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Distribution */}
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          
          <div className="space-y-3">
            {statsData.byPriority.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={getPriorityColor(item.priority)} size="sm">
                    {item.priority}
                  </Badge>
                  <span className="text-sm font-medium text-gray-900">{item.count} notifications</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{item.percentage}%</span>
                  {getTrendIcon(item.trend)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          
          <div className="space-y-3">
            {statsData.byCategory.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{item.category}</span>
                  <span className="text-sm text-gray-600">{item.count}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${item.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-500">{item.percentage}% of total</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          
          <div className="space-y-3">
            {statsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getSeverityIcon(activity.severity)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" size="sm">
                      {activity.type}
                    </Badge>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {statsData.performance.responseTime.current}m
            </div>
            <div className="text-sm text-gray-700 mb-2">Average Response Time</div>
            <div className="text-xs text-gray-600">
              Target: {statsData.performance.responseTime.target}m
            </div>
            <Badge 
              variant={statsData.performance.responseTime.trend === 'improving' ? 'success' : 'warning'} 
              size="sm"
            >
              {statsData.performance.responseTime.trend}
            </Badge>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {statsData.performance.resolutionRate.current}%
            </div>
            <div className="text-sm text-gray-700 mb-2">Resolution Rate</div>
            <div className="text-xs text-gray-600">
              Target: {statsData.performance.resolutionRate.target}%
            </div>
            <Badge 
              variant={statsData.performance.resolutionRate.trend === 'improving' ? 'success' : 'info'} 
              size="sm"
            >
              {statsData.performance.resolutionRate.trend}
            </Badge>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {statsData.performance.escalationRate.current}%
            </div>
            <div className="text-sm text-gray-700 mb-2">Escalation Rate</div>
            <div className="text-xs text-gray-600">
              Target: {statsData.performance.escalationRate.target}%
            </div>
            <Badge 
              variant={statsData.performance.escalationRate.trend === 'improving' ? 'success' : 'warning'} 
              size="sm"
            >
              {statsData.performance.escalationRate.trend}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationStats;
