'use client';

import React from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  RefreshCw,
  Building,
  Cog
} from 'lucide-react';
import Button from '../../../../../../components/ui/Button';

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;
  operatorFilter: string;
  setOperatorFilter: (operator: string) => void;
  onExportMachines: () => void;
  onAddMachine: () => void;
  onRefresh: () => void;
  machineTypes: string[];
  locations: string[];
  operators: string[];
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  locationFilter,
  setLocationFilter,
  operatorFilter,
  setOperatorFilter,
  onExportMachines,
  onAddMachine,
  onRefresh,
  machineTypes,
  locations,
  operators
}) => {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'running', label: 'Running' },
    { value: 'idle', label: 'Idle' },
    { value: 'maintenance', label: 'Under Maintenance' },
    { value: 'breakdown', label: 'Breakdown' },
    { value: 'offline', label: 'Offline' }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setLocationFilter('');
    setOperatorFilter('');
  };

  const hasActiveFilters = searchTerm || statusFilter || typeFilter || locationFilter || operatorFilter;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row items-center gap-4">
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white min-w-[160px]"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Operator Filter */}
        <select
          value={operatorFilter}
          onChange={(e) => setOperatorFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white min-w-[200px]"
        >
          <option value="">All Operators</option>
          {operators.map(operator => (
            <option key={operator} value={operator}>
              {operator}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="secondary"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Clear
            </Button>
          )}

          {/* Refresh */}
          <Button
            variant="secondary"
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </Button>

          {/* Export */}
          <Button
            variant="secondary"
            onClick={onExportMachines}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </Button>

          {/* Add Machine */}
          <Button
            variant="primary"
            onClick={onAddMachine}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Machine
          </Button>
        </div>
      </div>

      {/* Active Filters Display (status & operator only) */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {statusFilter && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Status: {statusOptions.find(opt => opt.value === statusFilter)?.label}
            </span>
          )}
          {operatorFilter && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Operator: {operatorFilter}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;
