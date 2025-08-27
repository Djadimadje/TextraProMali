'use client';
import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Filter, RefreshCw, Download, Settings, Search } from 'lucide-react';
import { MachineFilters as IMachineFilters } from '../../src/app/(dashboard)/analyst/machines/page';

interface MachineFiltersProps {
  filters: IMachineFilters;
  onFiltersChange: (filters: IMachineFilters) => void;
  onRefresh: () => void;
}

const MachineFilters: React.FC<MachineFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const machineTypeOptions = [
    'Ginning Machine',
    'Carding Machine',
    'Spinning Machine',
    'Weaving Loom',
    'Quality Scanner',
    'Packaging Unit'
  ];

  const departmentOptions = [
    'Ginning Department',
    'Carding Department',
    'Spinning Department',
    'Weaving Department',
    'Quality Control',
    'Packaging'
  ];

  const timeRangeOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '8h', label: 'Last 8 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'running', label: 'Running' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'idle', label: 'Idle' },
    { value: 'error', label: 'Error' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Machine Name' },
    { value: 'efficiency', label: 'Efficiency' },
    { value: 'uptime', label: 'Uptime' },
    { value: 'alerts', label: 'Alert Count' }
  ];

  const handleTimeRangeChange = (timeRange: IMachineFilters['timeRange']) => {
    onFiltersChange({ ...filters, timeRange });
  };

  const handleStatusChange = (statusFilter: IMachineFilters['statusFilter']) => {
    onFiltersChange({ ...filters, statusFilter });
  };

  const handleSortChange = (sortBy: IMachineFilters['sortBy']) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleSortOrderToggle = () => {
    const newOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onFiltersChange({ ...filters, sortOrder: newOrder });
  };

  const handleMultiSelectChange = (
    field: 'machineTypes' | 'departments',
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
      machineTypes: [],
      departments: [],
      statusFilter: 'all',
      timeRange: '24h',
      sortBy: 'efficiency',
      sortOrder: 'desc'
    });
    setSearchTerm('');
  };

  const exportData = () => {
    console.log('Exporting machine data with filters:', filters);
  };

  return (
    <Card variant="default" padding="lg" className="border-0 rounded-none">
      <div className="space-y-4">
        {/* Primary Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search machines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-48"
            />
          </div>

          {/* Time Range */}
          <select
            value={filters.timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value as IMachineFilters['timeRange'])}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.statusFilter}
            onChange={(e) => handleStatusChange(e.target.value as IMachineFilters['statusFilter'])}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as IMachineFilters['sortBy'])}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSortOrderToggle}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter size={16} />
              Advanced
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={exportData}
            >
              <Download size={16} />
              Export
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Machine Types Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Machine Types
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {machineTypeOptions.map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.machineTypes?.includes(type) || false}
                        onChange={(e) => handleMultiSelectChange('machineTypes', type, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type}</span>
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
        {(filters.machineTypes?.length || filters.departments?.length || searchTerm) ? (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-500">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Search: "{searchTerm}"
              </span>
            )}
            {filters.machineTypes?.map(type => (
              <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {type}
              </span>
            ))}
            {filters.departments?.map(dept => (
              <span key={dept} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {dept}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
};

export default MachineFilters;
