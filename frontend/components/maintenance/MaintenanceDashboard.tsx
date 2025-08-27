'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Users,
  Activity,
  BarChart3
} from 'lucide-react';
import { 
  maintenanceService,
  MaintenanceStats,
  MaintenanceLog
} from '../../services/maintenanceApiService';

const MaintenanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [recentMaintenance, setRecentMaintenance] = useState<MaintenanceLog[]>([]);
  const [overdueMaintenance, setOverdueMaintenance] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load maintenance statistics
      const statsResponse = await maintenanceService.getMaintenanceStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Load recent maintenance logs
      const recentResponse = await maintenanceService.getMaintenanceLogs({
        page_size: 10,
      });
      if (recentResponse.success && recentResponse.data) {
        setRecentMaintenance(recentResponse.data);
      }

      // Load overdue maintenance
      const overdueResponse = await maintenanceService.getOverdueMaintenance();
      if (overdueResponse.success && overdueResponse.data) {
        setOverdueMaintenance(overdueResponse.data);
      }

    } catch (err) {
      console.error('Failed to load maintenance dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Maintenance Logs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Maintenance</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.total_maintenance_logs || 0}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wrench className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">All maintenance logs</span>
          </div>
        </div>

        {/* Pending Maintenance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats?.pending_count || 0}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Calendar className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-yellow-600">Awaiting assignment</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.in_progress_count || 0}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Users className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-blue-600">Being worked on</span>
          </div>
        </div>

        {/* Overdue Maintenance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-3xl font-bold text-red-600">{stats?.overdue_count || 0}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-red-600">Needs attention</span>
          </div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Resolution Time */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.average_resolution_time_hours ? `${stats.average_resolution_time_hours.toFixed(1)}h` : 'N/A'}
              </p>
            </div>
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Average Downtime */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Downtime</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.average_downtime_hours ? `${stats.average_downtime_hours.toFixed(1)}h` : 'N/A'}
              </p>
            </div>
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(stats?.total_maintenance_cost || 0).toLocaleString()}
              </p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {stats?.stats_by_status?.map((stat) => (
              <div key={stat.status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    stat.status === 'pending' ? 'bg-yellow-400' :
                    stat.status === 'in_progress' ? 'bg-blue-400' :
                    stat.status === 'completed' ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {stat.status.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            {stats?.stats_by_priority?.map((stat) => (
              <div key={stat.priority} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    stat.priority === 'critical' ? 'bg-red-400' :
                    stat.priority === 'high' ? 'bg-orange-400' :
                    stat.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {stat.priority}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent and Overdue Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Maintenance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Maintenance</h3>
          <div className="space-y-4">
            {recentMaintenance.slice(0, 5).map((maintenance) => (
              <div key={maintenance.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{maintenance.machine_info.name}</p>
                  <p className="text-xs text-gray-500 truncate">{maintenance.issue_reported}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(maintenance.status)}`}>
                      {maintenance.status.replace('_', ' ')}
                    </span>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(maintenance.priority)}`}>
                      {maintenance.priority}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{maintenance.technician_name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(maintenance.reported_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Maintenance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Overdue Maintenance
          </h3>
          <div className="space-y-4">
            {overdueMaintenance.slice(0, 5).map((maintenance) => (
              <div key={maintenance.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{maintenance.machine_info.name}</p>
                  <p className="text-xs text-gray-500 truncate">{maintenance.issue_reported}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(maintenance.status)}`}>
                      {maintenance.status.replace('_', ' ')}
                    </span>
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      {maintenance.days_since_reported} days overdue
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{maintenance.technician_name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(maintenance.reported_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
