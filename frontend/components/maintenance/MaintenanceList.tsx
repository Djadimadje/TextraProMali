'use client';
import React, { useState } from 'react';
import { 
  Settings, 
  AlertTriangle, 
  BarChart3, 
  TrendingUp,
  Calendar,
  Filter,
  Download,
  FileText
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import MaintenanceTaskTable from './MaintenanceTaskTable';
import { maintenanceService } from '../../services/maintenanceApiService';
import { exportService } from '../../services/exportService';

const MaintenanceList: React.FC = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    dateRange: '30'
  });

  const exportMaintenanceData = async () => {
    try {
      // Build filters for API call
      const apiFilters: any = {};
      if (filters.status !== 'all') apiFilters.status = filters.status;
      if (filters.priority !== 'all') apiFilters.priority = filters.priority;
      
      // Add date range filter
      if (filters.dateRange !== 'all') {
        const days = parseInt(filters.dateRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        apiFilters.start_date = startDate.toISOString().split('T')[0];
      }

      // Fetch maintenance logs
      const logsResponse = await maintenanceService.getMaintenanceLogs({
        ...apiFilters,
        page_size: 1000
      });
      
      if (logsResponse.success && logsResponse.data) {
        // Format data for export
        const exportData = logsResponse.data.map(log => ({
          id: log.id.slice(0, 8),
          machine: log.machine,
          technician_name: log.technician_name,
          issue_reported: log.issue_reported,
          action_taken: log.action_taken || 'Not completed',
          status: log.status,
          priority: log.priority,
          reported_at: new Date(log.reported_at).toLocaleDateString(),
          resolved_at: log.resolved_at ? new Date(log.resolved_at).toLocaleDateString() : 'Not resolved',
          downtime_hours: log.downtime_hours || 0,
          cost: log.cost || 0,
          parts_replaced: log.parts_replaced || 'None',
          notes: log.notes || 'No notes'
        }));

        await exportService.exportToExcel(exportData, {
          filename: `maintenance_tasks_${new Date().toISOString().split('T')[0]}.xlsx`,
          headers: exportService.getMaintenanceLogsHeaders(),
          title: 'Maintenance Tasks Export'
        });
      } else {
        alert('No maintenance data available for export');
      }
    } catch (err) {
      console.error('Failed to export maintenance data:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  const exportMaintenancePDF = async () => {
    try {
      // Build filters for API call
      const apiFilters: any = {};
      if (filters.status !== 'all') apiFilters.status = filters.status;
      if (filters.priority !== 'all') apiFilters.priority = filters.priority;
      
      // Add date range filter
      if (filters.dateRange !== 'all') {
        const days = parseInt(filters.dateRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        apiFilters.start_date = startDate.toISOString().split('T')[0];
      }

      // Fetch maintenance logs and stats for comprehensive PDF
      const logsResponse = await maintenanceService.getMaintenanceLogs({
        ...apiFilters,
        page_size: 100 // Limit for PDF
      });
      
      const statsResponse = await maintenanceService.getMaintenanceStats();
      
      if (logsResponse.success && logsResponse.data) {
        const reportData = {
          title: 'Maintenance Tasks Report',
          stats: statsResponse.success ? statsResponse.data : null,
          logs: logsResponse.data,
          filters: filters,
          totalRecords: logsResponse.data.length
        };
        
        await exportService.exportMaintenanceReportPDF(reportData);
      } else {
        alert('No maintenance data available for PDF export');
      }
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Failed to export PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">All Maintenance Tasks</h2>
          <p className="text-gray-600">Complete list of maintenance activities and history</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button variant="secondary" onClick={exportMaintenanceData}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="secondary" onClick={exportMaintenancePDF}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="primary" className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Task Table */}
      <MaintenanceTaskTable />
    </div>
  );
};

export default MaintenanceList;
