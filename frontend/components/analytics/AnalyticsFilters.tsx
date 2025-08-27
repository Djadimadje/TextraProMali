'use client';
import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ExportService from '../../src/services/exportService';
import { useAuth } from '../../src/contexts/AuthContext';
import { Calendar, Filter, RefreshCw, Download, Settings, FileText, FileSpreadsheet, File } from 'lucide-react';
import { AnalyticsFilters as IAnalyticsFilters } from '../../src/app/(dashboard)/analyst/analytics/page';

interface AnalyticsFiltersProps {
  filters: IAnalyticsFilters;
  onFiltersChange: (filters: IAnalyticsFilters) => void;
  onRefresh: () => void;
  analyticsData?: any; // Add analytics data for export
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  analyticsData
}) => {
  const { user } = useAuth();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeRawData: true,
    includeSummary: true,
    includeRecommendations: true,
    customTitle: '',
    customDateRange: false
  });

  const timeRangeOptions = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const machineOptions = [
    'Ginning Machine 1',
    'Ginning Machine 2',
    'Carding Machine 1',
    'Carding Machine 2',
    'Spinning Machine 1',
    'Spinning Machine 2',
    'Weaving Loom 1',
    'Weaving Loom 2'
  ];

  const departmentOptions = [
    'Ginning',
    'Carding',
    'Spinning',
    'Weaving',
    'Quality Control',
    'Finishing'
  ];

  const shiftOptions = [
    'Morning (6AM-2PM)',
    'Afternoon (2PM-10PM)',
    'Night (10PM-6AM)'
  ];

  const metricOptions = [
    'Production Volume',
    'Quality Score',
    'Efficiency Rate',
    'Defect Rate',
    'Machine Utilization',
    'Cycle Time',
    'Energy Consumption',
    'Downtime'
  ];

  const handleTimeRangeChange = (timeRange: IAnalyticsFilters['timeRange']) => {
    onFiltersChange({ ...filters, timeRange });
  };

  const handleCustomDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  const handleMultiSelectChange = (
    field: 'machines' | 'departments' | 'shifts' | 'metrics',
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[field] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    onFiltersChange({ ...filters, [field]: newValues });
  };

  const clearFilters = () => {
    onFiltersChange({
      timeRange: '7d',
      machines: [],
      departments: [],
      shifts: [],
      metrics: []
    });
  };

  const exportData = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      setExportLoading(true);
      setShowExportMenu(false);

      console.log('Exporting analytics data in format:', format);
      console.log('Current filters:', filters);

      // Ensure we have analytics data to export
      if (!analyticsData) {
        alert('No data available to export. Please ensure analytics data is loaded.');
        return;
      }

      // Generate comprehensive export data with current filters applied
      const exportData = ExportService.generateAnalyticsReportData(analyticsData, filters, user);

      // Add filter information to the export
      if (filters) {
        exportData.metadata = {
          generatedBy: exportData.metadata?.generatedBy || 'System',
          generatedAt: exportData.metadata?.generatedAt || new Date().toLocaleString(),
          timeRange: exportData.metadata?.timeRange || 'Unknown',
          ...exportData.metadata,
          appliedFilters: {
            timeRange: filters.timeRange,
            customDateRange: filters.timeRange === 'custom' ? `${filters.dateFrom} to ${filters.dateTo}` : null,
            machines: filters.machines?.length ? filters.machines : 'All Machines',
            departments: filters.departments?.length ? filters.departments : 'All Departments',
            shifts: filters.shifts?.length ? filters.shifts : 'All Shifts',
            metrics: filters.metrics?.length ? filters.metrics : 'All Metrics'
          }
        };
      }

      // Export based on format
      switch (format) {
        case 'pdf':
          await ExportService.exportToPDF(exportData);
          break;
        case 'excel':
          await ExportService.exportToExcel(exportData);
          break;
        case 'csv':
          await ExportService.exportToCSV(exportData);
          break;
      }

      console.log(`Successfully exported analytics data as ${format.toUpperCase()} with applied filters`);
      
      // Show success message
      alert(`Report exported successfully as ${format.toUpperCase()} with current filters applied.`);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert(`Failed to export data as ${format.toUpperCase()}. Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <Card variant="default" padding="lg" className="border-0 rounded-none">
      <div className="space-y-4">
        {/* Primary Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Time Range */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <select
              value={filters.timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value as IAnalyticsFilters['timeRange'])}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Range */}
          {filters.timeRange === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleCustomDateChange('dateFrom', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleCustomDateChange('dateTo', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter size={16} />
              Advanced Filters
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              disabled={exportLoading}
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
            
            {/* Export Button with Dropdown */}
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exportLoading}
              >
                <Download size={16} />
                {exportLoading ? 'Exporting...' : 'Export'}
              </Button>

              {/* Export Dropdown Menu */}
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      Quick Export
                    </div>
                    <button
                      onClick={() => exportData('pdf')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      disabled={exportLoading}
                    >
                      <FileText size={16} className="mr-2" />
                      Export as PDF
                    </button>
                    <button
                      onClick={() => exportData('excel')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      disabled={exportLoading}
                    >
                      <FileSpreadsheet size={16} className="mr-2" />
                      Export as Excel
                    </button>
                    <button
                      onClick={() => exportData('csv')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      disabled={exportLoading}
                    >
                      <File size={16} className="mr-2" />
                      Export as CSV
                    </button>
                    
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={() => {
                          setShowExportOptions(true);
                          setShowExportMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                        disabled={exportLoading}
                      >
                        <Settings size={16} className="mr-2" />
                        Custom Export Options
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Export Options Modal */}
              {showExportOptions && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Custom Export Options</h3>
                    </div>
                    
                    <div className="px-6 py-4 space-y-4">
                      {/* Custom Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom Report Title
                        </label>
                        <input
                          type="text"
                          value={exportOptions.customTitle}
                          onChange={(e) => setExportOptions({...exportOptions, customTitle: e.target.value})}
                          placeholder="Leave empty for default title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      {/* Include Options */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Include in Export
                        </label>
                        <div className="space-y-2">
                          {[
                            { key: 'includeSummary', label: 'Executive Summary' },
                            { key: 'includeRawData', label: 'Detailed Data Tables' },
                            { key: 'includeCharts', label: 'Chart Descriptions' },
                            { key: 'includeRecommendations', label: 'AI Recommendations' }
                          ].map(option => (
                            <label key={option.key} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={exportOptions[option.key as keyof typeof exportOptions] as boolean}
                                onChange={(e) => setExportOptions({
                                  ...exportOptions, 
                                  [option.key]: e.target.checked
                                })}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                      <button
                        onClick={() => setShowExportOptions(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          exportData('pdf'); // You can make this selectable too
                          setShowExportOptions(false);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                        disabled={exportLoading}
                      >
                        Export with Options
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Machines Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Machines
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {machineOptions.map(machine => (
                    <label key={machine} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.machines?.includes(machine) || false}
                        onChange={(e) => handleMultiSelectChange('machines', machine, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{machine}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Departments Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departments
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {departmentOptions.map(department => (
                    <label key={department} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.departments?.includes(department) || false}
                        onChange={(e) => handleMultiSelectChange('departments', department, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{department}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Shifts Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shifts
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {shiftOptions.map(shift => (
                    <label key={shift} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.shifts?.includes(shift) || false}
                        onChange={(e) => handleMultiSelectChange('shifts', shift, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{shift}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Metrics Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metrics
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {metricOptions.map(metric => (
                    <label key={metric} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.metrics?.includes(metric) || false}
                        onChange={(e) => handleMultiSelectChange('metrics', metric, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{metric}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {(filters.machines?.length || filters.departments?.length || filters.shifts?.length || filters.metrics?.length) ? (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-500">Active filters:</span>
            {filters.machines?.map(machine => (
              <span key={machine} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {machine}
              </span>
            ))}
            {filters.departments?.map(dept => (
              <span key={dept} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {dept}
              </span>
            ))}
            {filters.shifts?.map(shift => (
              <span key={shift} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {shift}
              </span>
            ))}
            {filters.metrics?.map(metric => (
              <span key={metric} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {metric}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showExportMenu || showExportOptions) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowExportMenu(false);
            setShowExportOptions(false);
          }}
        />
      )}
    </Card>
  );
};

export default AnalyticsFilters;
