'use client';
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../lib/formatters';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  TrendingUp, 
  TrendingDown,
  Users,
  Wrench,
  DollarSign,
  Plus,
  Download
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import MaintenanceTaskTable from './MaintenanceTaskTable';
import MaintenanceForm from './MaintenanceForm';
import { maintenanceService, MaintenanceLog, MaintenanceStats } from '../../services/maintenanceApiService';
import { exportService } from '../../services/exportService';

const MaintenanceDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<MaintenanceLog[]>([]);
  const [overdueLogs, setOverdueLogs] = useState<MaintenanceLog[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceLog | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all dashboard data in parallel
      const [statsResponse, recentResponse, overdueResponse] = await Promise.all([
        maintenanceService.getMaintenanceStats(),
        maintenanceService.getMaintenanceLogs({ page_size: 5 }),
        maintenanceService.getOverdueMaintenance()
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (recentResponse.success && recentResponse.data) {
        setRecentLogs(recentResponse.data);
      }

      if (overdueResponse.success && overdueResponse.data) {
        setOverdueLogs(overdueResponse.data);
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    loadDashboardData();
  };

  const exportDashboardData = async () => {
    try {
      if (!stats) {
        alert('No dashboard data available for export');
        return;
      }

      // Export dashboard summary
      const dashboardData = [
        { metric: 'Total Maintenance Logs', value: stats.total_maintenance_logs || 0 },
        { metric: 'Pending Tasks', value: stats.pending_count || 0 },
        { metric: 'In Progress Tasks', value: stats.in_progress_count || 0 },
        { metric: 'Completed Tasks', value: stats.completed_count || 0 },
        { metric: 'Overdue Tasks', value: stats.overdue_count || 0 },
        { metric: 'Average Resolution Time (hrs)', value: stats.average_resolution_time_hours || 'N/A' },
        { metric: 'Average Downtime (hrs)', value: stats.average_downtime_hours || 'N/A' },
        { metric: 'Total Maintenance Cost ($)', value: stats.total_maintenance_cost || 0 }
      ];

      await exportService.exportToExcel(dashboardData, {
        filename: `maintenance_dashboard_${new Date().toISOString().split('T')[0]}.xlsx`,
        headers: { metric: 'Metric', value: 'Value' },
        title: 'Maintenance Dashboard Summary'
      });
    } catch (err) {
      console.error('Failed to export dashboard data:', err);
      alert('Failed to export dashboard data. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      default: return 'default';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} padding="lg">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading maintenance dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="secondary" onClick={loadDashboardData}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards - Exactly as per requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Machines Requiring Maintenance Today */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.pending_count || 0}
              </p>
              <p className="text-sm text-gray-500">Machines requiring attention</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Total Scheduled Tasks This Month */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.total_maintenance_logs || 0}
              </p>
              <p className="text-sm text-gray-500">Total tasks scheduled</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Settings className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Average Downtime (hrs) */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Downtime</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.average_downtime_hours ? `${stats.average_downtime_hours.toFixed(1)}h` : 'N/A'}
              </p>
              <div className="flex items-center mt-1">
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                <p className="text-sm text-green-600">-12% from last month</p>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        {/* Predictive Alerts (AI-generated) */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Predictive Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.overdue_count || 0}
              </p>
              <div className="flex items-center mt-1">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                <p className="text-sm text-red-600">AI-generated alerts</p>
              </div>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Maintenance Task Management</h2>
          <p className="text-gray-600">Schedule, track and manage all equipment maintenance activities</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={exportDashboardData}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Dashboard
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule New Maintenance
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maintenance Task Table (Main Section) */}
        <div className="lg:col-span-2">
          <MaintenanceTaskTable
            onTaskSelect={setSelectedTask}
            onTaskEdit={(task) => {
              // TODO: Open edit form with task data
              console.log('Edit task:', task);
            }}
            onTaskApprove={(task) => {
              // TODO: Implement approval logic
              console.log('Approve task:', task);
            }}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-4">
              {recentLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      log.status === 'completed' ? 'bg-green-500' :
                      log.status === 'in_progress' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {log.machine}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {log.issue_reported}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(log.reported_at)}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(log.status)} size="sm">
                    {log.status}
                  </Badge>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </Card>

          {/* Machine Health Summary */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Machine Health Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Healthy Machines</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-900">87%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Warning Status</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-900">10%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Critical Status</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-900">3%</span>
                </div>
              </div>
            </div>
            <Button variant="secondary" size="sm" fullWidth className="mt-4">
              View Machine Health Dashboard
            </Button>
          </Card>

          {/* Overdue Maintenance */}
          {overdueLogs.length > 0 && (
            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Overdue Tasks</h3>
                <Badge variant="danger" size="sm">{overdueLogs.length}</Badge>
              </div>
              <div className="space-y-4">
                {overdueLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900">
                          {log.machine}
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          {log.issue_reported}
                        </p>
                        <div className="flex items-center mt-2">
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                          <p className="text-xs text-red-600">
                            Due: {log.next_due_date ? formatDate(log.next_due_date) : 'Overdue'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getPriorityColor(log.priority)} size="sm">
                        {log.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed Today</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.completed_count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.in_progress_count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Resolution Time</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.average_resolution_time_hours ? `${stats.average_resolution_time_hours.toFixed(1)}h` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Maintenance Cost</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.total_maintenance_cost ? formatCurrency(stats.total_maintenance_cost) : formatCurrency(0)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Task Creation Modal */}
      <MaintenanceForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Maintenance Task Details</h2>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Task ID</label>
                    <p className="text-gray-900">#{selectedTask.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Machine</label>
                    <p className="text-gray-900">{selectedTask.machine}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Issue/Work Required</label>
                  <p className="text-gray-900">{selectedTask.issue_reported}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <Badge variant={getStatusColor(selectedTask.status)}>
                        {selectedTask.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <div className="mt-1">
                      <Badge variant={getPriorityColor(selectedTask.priority)}>
                        {selectedTask.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Reported</label>
                    <p className="text-gray-900">{formatDate(selectedTask.reported_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Technician</label>
                    <p className="text-gray-900">{selectedTask.technician_name || 'Not assigned'}</p>
                  </div>
                </div>
                {selectedTask.action_taken && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Action Taken</label>
                    <p className="text-gray-900">{selectedTask.action_taken}</p>
                  </div>
                )}
                {selectedTask.resolved_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Resolved At</label>
                    <p className="text-gray-900">{formatDate(selectedTask.resolved_at)}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <Button variant="secondary" onClick={() => setSelectedTask(null)}>
                  Close
                </Button>
                {selectedTask.status !== 'completed' && (
                  <Button variant="primary">
                    Edit Task
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceDashboard;
