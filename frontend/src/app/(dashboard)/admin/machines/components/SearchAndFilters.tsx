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
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search machines by ID, name, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white min-w-[140px]"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Machine Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white min-w-[140px]"
          >
            <option value="">All Types</option>
            {machineTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white min-w-[140px]"
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          {/* Operator Filter */}
          <select
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white min-w-[140px]"
          >
            <option value="">All Operators</option>
            {operators.map(operator => (
              <option key={operator} value={operator}>
                {operator}
              </option>
            ))}
          </select>
        </div>

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

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Search: "{searchTerm}"
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Status: {statusOptions.find(opt => opt.value === statusFilter)?.label}
            </span>
          )}
          {typeFilter && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Type: {typeFilter}
            </span>
          )}
          {locationFilter && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Location: {locationFilter}
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
