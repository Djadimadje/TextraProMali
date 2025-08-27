import React from 'react';
import { Search, Plus, Download, Filter, RotateCcw } from 'lucide-react';
import Button from '../../../../../../components/ui/Button';

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (department: string) => void;
  onExportUsers: () => void;
  onAddUser: () => void;
  onRefresh: () => void;
  departments: string[];
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter,
  onExportUsers,
  onAddUser,
  onRefresh,
  departments
}) => {
  return (
    <div className="space-y-4">
      {/* Header with title and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={onRefresh}
            variant="outline"
            className="flex items-center gap-2"
            title="Refresh user list"
          >
            <RotateCcw size={16} />
            Refresh
          </Button>
          <Button
            onClick={onExportUsers}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </Button>
          <Button
            onClick={onAddUser}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add User
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search users by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="supervisor">Supervisor</option>
              <option value="technician">Technician</option>
              <option value="inspector">Inspector</option>
              <option value="analyst">Analyst</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilters;
