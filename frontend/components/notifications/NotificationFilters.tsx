'use client';
import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { NotificationFilters as NotificationFiltersType } from '../../src/app/(dashboard)/analyst/notifications/page';
import { 
  Filter, 
  RefreshCw, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Archive,
  Bell,
  Users,
  Settings,
  Search
} from 'lucide-react';

interface NotificationFiltersProps {
  filters: NotificationFiltersType;
  onFiltersChange: (filters: Partial<NotificationFiltersType>) => void;
  onRefresh: () => void;
  loading: boolean;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
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

  const priorities = [
    { key: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800', icon: '🔴' },
    { key: 'high', label: 'High', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
    { key: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
    { key: 'low', label: 'Low', color: 'bg-green-100 text-green-800', icon: '🟢' }
  ];

  const categories = [
    { key: 'alerts', label: 'Alerts', icon: '⚠️' },
    { key: 'reports', label: 'Reports', icon: '📊' },
    { key: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { key: 'quality', label: 'Quality', icon: '✅' },
    { key: 'production', label: 'Production', icon: '🏭' },
    { key: 'system', label: 'System', icon: '⚙️' }
  ];

  const statuses = [
    { key: 'unread', label: 'Unread', icon: '📩' },
    { key: 'read', label: 'Read', icon: '📧' },
    { key: 'archived', label: 'Archived', icon: '📁' }
  ];

  const departments = [
    'Production Line A',
    'Production Line B',
    'Quality Control',
    'Maintenance',
    'Logistics',
    'Planning',
    'Engineering',
    'Safety'
  ];

  const sources = [
    'System Alerts',
    'Machine Sensors',
    'Manual Reports',
    'Scheduled Tasks',
    'Integration APIs',
    'User Actions',
    'Workflow Engine',
    'Monitoring Tools'
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

  const handleDepartmentToggle = (dept: string) => {
    const current = filters.departments;
    const updated = current.includes(dept)
      ? current.filter(d => d !== dept)
      : [...current, dept];
    
    onFiltersChange({ departments: updated });
  };

  const handleSourceToggle = (source: string) => {
    const current = filters.sources;
    const updated = current.includes(source)
      ? current.filter(s => s !== source)
      : [...current, source];
    
    onFiltersChange({ sources: updated });
  };

  return (
    <Card variant="elevated" padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Notification Filters</h3>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
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

          {/* Priority Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-gray-600" size={16} />
              <label className="text-sm font-medium text-gray-700">Priority</label>
            </div>
            
            <select
              value={filters.priority}
              onChange={(e) => onFiltersChange({ priority: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority.key} value={priority.key}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-gray-600" size={16} />
              <label className="text-sm font-medium text-gray-700">Status</label>
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({ status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status.key} value={status.key}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="text-gray-600" size={16} />
              <label className="text-sm font-medium text-gray-700">Category</label>
            </div>
            
            <select
              value={filters.category}
              onChange={(e) => onFiltersChange({ category: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.key} value={category.key}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Departments */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="text-gray-600" size={16} />
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

          {/* Sources */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="text-gray-600" size={16} />
              <label className="text-sm font-medium text-gray-700">Sources</label>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => onFiltersChange({ 
                  sources: filters.sources.length === sources.length ? [] : [...sources] 
                })}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {filters.sources.length === sources.length ? 'Clear All' : 'Select All'}
              </button>
              
              <div className="max-h-32 overflow-y-auto space-y-1">
                {sources.map(source => (
                  <label key={source} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.sources.includes(source)}
                      onChange={() => handleSourceToggle(source)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-gray-700">{source}</span>
                  </label>
                ))}
              </div>
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
            
            {filters.priority !== 'all' && (
              <Badge variant="warning" size="sm">
                <AlertTriangle size={12} />
                {priorities.find(p => p.key === filters.priority)?.label}
              </Badge>
            )}
            
            {filters.status !== 'all' && (
              <Badge variant="success" size="sm">
                <CheckCircle size={12} />
                {statuses.find(s => s.key === filters.status)?.label}
              </Badge>
            )}
            
            {filters.category !== 'all' && (
              <Badge variant="default" size="sm">
                <Bell size={12} />
                {categories.find(c => c.key === filters.category)?.label}
              </Badge>
            )}
            
            {filters.departments.length > 0 && (
              <Badge variant="info" size="sm">
                <Users size={12} />
                {filters.departments.length} Departments
              </Badge>
            )}

            {filters.sources.length > 0 && (
              <Badge variant="default" size="sm">
                <Settings size={12} />
                {filters.sources.length} Sources
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NotificationFilters;
