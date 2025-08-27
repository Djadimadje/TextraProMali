'use client';
import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { WorkflowFilters as WorkflowFiltersType } from '../../src/app/(dashboard)/analyst/workflow/page';
import { 
  Filter, 
  RefreshCw, 
  Calendar, 
  Settings,
  TrendingUp,
  Building,
  Flag,
  Activity,
  Eye
} from 'lucide-react';

interface WorkflowFiltersProps {
  filters: WorkflowFiltersType;
  onFiltersChange: (filters: Partial<WorkflowFiltersType>) => void;
  onRefresh: () => void;
  loading: boolean;
}

const WorkflowFilters: React.FC<WorkflowFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  loading
}) => {
  const datePresets = [
    { key: '1d', label: 'Today' },
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '3m', label: '3 Months' },
    { key: 'custom', label: 'Custom Range' }
  ] as const;

  const processTypes = [
    { key: 'production', label: 'Production', icon: '🏭' },
    { key: 'quality', label: 'Quality Control', icon: '✅' },
    { key: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { key: 'logistics', label: 'Logistics', icon: '📦' },
    { key: 'planning', label: 'Planning', icon: '📋' }
  ];

  const departments = [
    'Production Line A',
    'Production Line B',
    'Quality Control',
    'Maintenance',
    'Logistics',
    'Planning'
  ];

  const priorities = [
    { key: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { key: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { key: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const metrics = [
    { key: 'efficiency', label: 'Efficiency' },
    { key: 'throughput', label: 'Throughput' },
    { key: 'cycle_time', label: 'Cycle Time' },
    { key: 'wait_time', label: 'Wait Time' },
    { key: 'utilization', label: 'Utilization' },
    { key: 'cost', label: 'Cost' }
  ];

  const handleDatePresetChange = (preset: string) => {
    let start = new Date();
    let end = new Date();
    
    const updateData: any = {
      ...filters.dateRange,
      preset: preset as any
    };

    if (preset === '1d') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      updateData.start = start.toISOString().split('T')[0];
      updateData.end = end.toISOString().split('T')[0];
    } else if (preset === '7d') {
      start.setDate(start.getDate() - 7);
      updateData.start = start.toISOString().split('T')[0];
      updateData.end = end.toISOString().split('T')[0];
    } else if (preset === '30d') {
      start.setDate(start.getDate() - 30);
      updateData.start = start.toISOString().split('T')[0];
      updateData.end = end.toISOString().split('T')[0];
    } else if (preset === '3m') {
      start.setMonth(start.getMonth() - 3);
      updateData.start = start.toISOString().split('T')[0];
      updateData.end = end.toISOString().split('T')[0];
    }

    onFiltersChange({
      dateRange: updateData
    });
  };

  const handleProcessTypeToggle = (type: string) => {
    const current = filters.processTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    
    onFiltersChange({ processTypes: updated });
  };

  const handleDepartmentToggle = (dept: string) => {
    const current = filters.departments;
    const updated = current.includes(dept)
      ? current.filter(d => d !== dept)
      : [...current, dept];
    
    onFiltersChange({ departments: updated });
  };

  const handlePriorityToggle = (priority: string) => {
    const current = filters.priorities;
    const updated = current.includes(priority as any)
      ? current.filter(p => p !== priority)
      : [...current, priority as any];
    
    onFiltersChange({ priorities: updated });
  };

  const handleMetricToggle = (metric: string) => {
    const current = filters.metrics;
    const updated = current.includes(metric)
      ? current.filter(m => m !== metric)
      : [...current, metric];
    
    onFiltersChange({ metrics: updated });
  };

  return (
    <Card variant="elevated" padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Workflow Filters</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={onRefresh}
              variant="secondary"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={16} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Date Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-600" size={16} />
              <label className="text-sm font-medium text-gray-700">Date Range</label>
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {datePresets.map(preset => (
                  <button
                    key={preset.key}
                    onClick={() => handleDatePresetChange(preset.key)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      filters.dateRange.preset === preset.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              
              {filters.dateRange.preset === 'custom' && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => onFiltersChange({
                      dateRange: { ...filters.dateRange, start: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => onFiltersChange({
                      dateRange: { ...filters.dateRange, end: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Process Types */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-gray-600" size={16} />
              <label className="text-sm font-medium text-gray-700">Process Types</label>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {processTypes.map(type => (
                <button
                  key={type.key}
                  onClick={() => handleProcessTypeToggle(type.key)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    filters.processTypes.includes(type.key)
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Departments */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building className="text-gray-600" size={16} />
              <label className="text-sm font-medium text-gray-700">Departments</label>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => onFiltersChange({ 
                  departments: filters.departments.length === departments.length ? [] : [...departments] 
                })}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {filters.departments.length === departments.length ? 'Clear All' : 'Select All'}
              </button>
              
              <div className="max-h-32 overflow-y-auto space-y-1">
                {departments.map(dept => (
                  <label key={dept} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.departments.includes(dept)}
                      onChange={() => handleDepartmentToggle(dept)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-gray-700">{dept}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Flag className="text-gray-600" size={16} />
              <label className="text-sm font-medium text-gray-700">Priority</label>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {priorities.map(priority => (
                <button
                  key={priority.key}
                  onClick={() => handlePriorityToggle(priority.key)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    filters.priorities.includes(priority.key as any)
                      ? priority.color + ' border'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="text-gray-600" size={16} />
              <label className="text-sm font-medium text-gray-700">Status</label>
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({ status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
              <option value="optimizing">Optimizing</option>
            </select>
          </div>

          {/* Metrics */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-gray-600" size={16} />
              <label className="text-sm font-medium text-gray-700">Metrics</label>
            </div>
            
            <div className="grid grid-cols-2 gap-1">
              {metrics.map(metric => (
                <label key={metric.key} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={filters.metrics.includes(metric.key)}
                    onChange={() => handleMetricToggle(metric.key)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700">{metric.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* View Type Selector */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Eye className="text-gray-600" size={16} />
              <label className="text-sm font-medium text-gray-700">View Type:</label>
            </div>
            
            <div className="flex gap-1">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'detailed', label: 'Detailed' },
                { key: 'realtime', label: 'Real-time' }
              ].map(view => (
                <button
                  key={view.key}
                  onClick={() => onFiltersChange({ viewType: view.key as any })}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    filters.viewType === view.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Active Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="info" size="sm">
              <Calendar size={12} />
              {filters.dateRange.preset === 'custom' 
                ? `${filters.dateRange.start} to ${filters.dateRange.end}`
                : datePresets.find(p => p.key === filters.dateRange.preset)?.label
              }
            </Badge>
            
            {filters.processTypes.length > 0 && (
              <Badge variant="success" size="sm">
                <TrendingUp size={12} />
                {filters.processTypes.length} Process Types
              </Badge>
            )}
            
            {filters.departments.length > 0 && (
              <Badge variant="warning" size="sm">
                <Building size={12} />
                {filters.departments.length} Departments
              </Badge>
            )}
            
            {filters.priorities.length > 0 && (
              <Badge variant="danger" size="sm">
                <Flag size={12} />
                {filters.priorities.length} Priorities
              </Badge>
            )}
            
            {filters.status !== 'all' && (
              <Badge variant="default" size="sm">
                <Activity size={12} />
                {filters.status}
              </Badge>
            )}

            {filters.metrics.length > 0 && (
              <Badge variant="info" size="sm">
                <TrendingUp size={12} />
                {filters.metrics.length} Metrics
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WorkflowFilters;
