'use client';
import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Edit, 
  Check, 
  X, 
  Calendar, 
  Clock,
  AlertTriangle,
  User,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { maintenanceService, MaintenanceLog } from '../../services/maintenanceApiService';

interface MaintenanceTaskTableProps {
  onTaskSelect?: (task: MaintenanceLog) => void;
  onTaskEdit?: (task: MaintenanceLog) => void;
  onTaskApprove?: (task: MaintenanceLog) => void;
  refreshTrigger?: number;
}

const MaintenanceTaskTable: React.FC<MaintenanceTaskTableProps> = ({
  onTaskSelect,
  onTaskEdit,
  onTaskApprove,
  refreshTrigger = 0
}) => {
  const [tasks, setTasks] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });

  const pageSize = 10;

  useEffect(() => {
    loadTasks();
  }, [currentPage, filters, refreshTrigger]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams: any = {
        page: currentPage,
        page_size: pageSize
      };

      if (filters.status !== 'all') {
        filterParams.status = filters.status;
      }
      if (filters.priority !== 'all') {
        filterParams.priority = filters.priority;
      }
      if (filters.search) {
        filterParams.search = filters.search;
      }

      const response = await maintenanceService.getMaintenanceLogs(filterParams);
      
      if (response.success && response.data) {
        setTasks(response.data);
        setTotalTasks(response.data.length);
        setTotalPages(Math.ceil(response.data.length / pageSize));
      }
    } catch (err) {
      console.error('Failed to load maintenance tasks:', err);
      setError('Failed to load maintenance tasks');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleApprove = async (task: MaintenanceLog) => {
    try {
      if (task.status !== 'completed') {
        alert('Only completed tasks can be approved');
        return;
      }
      
      if (onTaskApprove) {
        onTaskApprove(task);
      }
      
      // Refresh the table
      loadTasks();
    } catch (err) {
      console.error('Failed to approve task:', err);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      await maintenanceService.updateMaintenanceLog(taskId, { status: newStatus });
      loadTasks(); // Refresh the table
    } catch (err) {
      console.error('Failed to update task status:', err);
      setError('Failed to update task status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (task: MaintenanceLog) => {
    if (task.status === 'completed') return false;
    
    if (task.next_due_date) {
      return new Date(task.next_due_date) < new Date();
    }
    
    // Consider task overdue if pending for more than 1 day
    const daysSinceReported = Math.floor(
      (Date.now() - new Date(task.reported_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    return task.status === 'pending' && daysSinceReported > 1;
  };

  if (loading) {
    return (
      <Card padding="lg">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading maintenance tasks...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="secondary" onClick={loadTasks}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="none">
      {/* Header with filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Maintenance Tasks</h3>
            <p className="text-sm text-gray-500">{totalTasks} total tasks</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Status filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            
            {/* Priority filter */}
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Machine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Technician
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scheduled Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id} className={`hover:bg-gray-50 ${isOverdue(task) ? 'bg-red-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      #{task.id.slice(0, 8)}
                    </div>
                    {isOverdue(task) && (
                      <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{task.machine}</div>
                      <div className="text-sm text-gray-500">ID: {task.machine}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <div className="text-sm text-gray-900">{task.technician_name || task.technician}</div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <div className="text-sm text-gray-900">
                      {task.next_due_date ? formatDate(task.next_due_date) : formatDate(task.reported_at)}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusColor(task.status)} size="sm">
                    {task.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getPriorityColor(task.priority)} size="sm">
                    {task.priority.toUpperCase()}
                  </Badge>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {/* View */}
                    <button
                      onClick={() => onTaskSelect && onTaskSelect(task)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    {/* Edit */}
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => onTaskEdit && onTaskEdit(task)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                        title="Edit Task"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    
                    {/* Approve (for completed tasks) */}
                    {task.status === 'completed' && (
                      <button
                        onClick={() => handleApprove(task)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Approve Task"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    
                    {/* Status update buttons */}
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'in_progress')}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                        title="Start Task"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalTasks)} of {totalTasks} tasks
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No maintenance tasks found</p>
        </div>
      )}
    </Card>
  );
};

export default MaintenanceTaskTable;
