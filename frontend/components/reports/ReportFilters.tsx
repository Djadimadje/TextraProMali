'use client';
import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { ReportFilters as ReportFiltersType } from '../../src/app/(dashboard)/analyst/reports/page';
import { 
  Calendar, 
  Filter, 
  Download, 
  RefreshCw, 
  Settings,
  Clock,
  Building,
  Wrench,
  TrendingUp
} from 'lucide-react';

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: Partial<ReportFiltersType>) => void;
  onRefresh: () => void;
  loading: boolean;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  loading
}) => {
  const todayISO = new Date().toISOString().split('T')[0];
  // Safely access optional dateRange on filters
  const dateRange = filters.dateRange || { start: '', end: '', preset: '' };
  const startVal = dateRange.start || '';
  const presetVal = dateRange.preset || '';
  const endMin = (startVal && startVal > todayISO) ? startVal : todayISO;
  const datePresets = [
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '3m', label: '3 Months' },
    { key: '6m', label: '6 Months' },
    { key: '1y', label: '1 Year' },
    { key: 'custom', label: 'Custom Range' }
  ];

  const reportTypes = [
    { key: 'production', label: 'Production', icon: '🏭' },
    { key: 'quality', label: 'Quality', icon: '✅' },
    { key: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { key: 'financial', label: 'Financial', icon: '💰' },
    { key: 'efficiency', label: 'Efficiency', icon: '⚡' },
    { key: 'safety', label: 'Safety', icon: '🛡️' }
  ];

  const departments = [
    'Production Line A',
    'Production Line B', 
    'Quality Control',
    'Maintenance',
    'Packaging',
    'Shipping'
  ];

  const handleDatePresetChange = (preset: string) => {
    let start = new Date();
    let end = new Date();
    
    switch (preset) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '3m':
        start.setMonth(start.getMonth() - 3);
        break;
      case '6m':
        start.setMonth(start.getMonth() - 6);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        // Custom - don't change dates
        break;
    }

    onFiltersChange({
      dateRange: {
        ...dateRange,
        preset: preset as any,
        ...(preset !== 'custom' && {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        })
      }
    });
  };

  // Use safe defaults for arrays which may be undefined
  const reportTypesCurrent = filters.reportTypes ?? [];
  const departmentsCurrent = filters.departments ?? [];

  const handleReportTypeToggle = (type: string) => {
    const current = reportTypesCurrent;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];

    onFiltersChange({ reportTypes: updated });
  };

  const handleDepartmentToggle = (dept: string) => {
    const current = departmentsCurrent;
    const updated = current.includes(dept)
      ? current.filter(d => d !== dept)
      : [...current, dept];

    onFiltersChange({ departments: updated });
  };

  const exportReport = async () => {
    // In a real app, this would trigger the export
    console.log('Exporting report with filters:', filters);
    
    // Simulate export
    const blob = new Blob(['Sample report data'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date().toISOString().split('T')[0]}.${filters.exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card variant="elevated" padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Report Filters</h3>
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
            
            <Button
              onClick={exportReport}
              variant="primary"
              size="sm"
            >
              <Download className="mr-2" size={16} />
              Export
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
                      presetVal === preset.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              
              {presetVal === 'custom' && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startVal}
                    min={todayISO}
                    onChange={(e) => {
                      const val = e.target.value < todayISO ? todayISO : e.target.value;
                      onFiltersChange({
                        dateRange: { ...dateRange, start: val, preset: 'custom' }
                      });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="date"
                    value={dateRange.end || ''}
                    min={endMin}
                    onChange={(e) => {
                      const val = e.target.value < endMin ? endMin : e.target.value;
                      onFiltersChange({
                        dateRange: { ...dateRange, end: val, preset: 'custom' }
                      });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Report Types */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-gray-600" size={16} />
              <label className="text-sm font-medium text-gray-700">Report Types</label>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {reportTypes.map(type => (
                <button
                  key={type.key}
                  onClick={() => handleReportTypeToggle(type.key)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    reportTypesCurrent.includes(type.key)
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
                onClick={() => onFiltersChange({ departments: [] })}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {departmentsCurrent.length > 0 ? 'Clear All' : 'Select All'}
              </button>
              
              <div className="max-h-32 overflow-y-auto space-y-1">
                {departments.map(dept => (
                  <label key={dept} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={departmentsCurrent.includes(dept)}
                      onChange={() => handleDepartmentToggle(dept)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-gray-700">{dept}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="text-gray-600" size={16} />
              <label className="text-sm font-medium text-gray-700">Options</label>
            </div>
            
            <div className="space-y-3">
              {/* Shift */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Shift</label>
                <select
                  value={filters.shifts?.[0] ?? 'all'}
                  onChange={(e) => onFiltersChange({ shifts: [e.target.value] })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="all">All Shifts</option>
                  <option value="day">Day Shift</option>
                  <option value="night">Night Shift</option>
                  <option value="weekend">Weekend</option>
                </select>
              </div>

              {/* Granularity */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Granularity</label>
                <select
                  value={filters.granularity}
                  onChange={(e) => onFiltersChange({ granularity: e.target.value as any })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Export Format */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Export Format</label>
                <select
                  value={filters.exportFormat}
                  onChange={(e) => onFiltersChange({ exportFormat: e.target.value as any })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              {/* Include Comparisons */}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.includeComparisons}
                  onChange={(e) => onFiltersChange({ includeComparisons: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-gray-700">Include Comparisons</span>
              </label>
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
              {presetVal === 'custom' 
                ? `${dateRange.start} to ${dateRange.end}`
                : datePresets.find(p => p.key === presetVal)?.label
              }
            </Badge>

            {reportTypesCurrent.length > 0 && (
              <Badge variant="success" size="sm">
                <TrendingUp size={12} />
                {reportTypesCurrent.length} Report Types
              </Badge>
            )}

            {departmentsCurrent.length > 0 && (
              <Badge variant="warning" size="sm">
                <Building size={12} />
                {departmentsCurrent.length} Departments
              </Badge>
            )}
            
            {((filters.shifts && filters.shifts[0]) || 'all') !== 'all' && (
              <Badge variant="default" size="sm">
                <Clock size={12} />
                {(filters.shifts && filters.shifts[0]) || 'all'} Shift
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReportFilters;
