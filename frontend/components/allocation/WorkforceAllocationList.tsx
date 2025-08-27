'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Edit2, 
  Trash2, 
  Search,
  Download
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { WorkforceAllocation, allocationService } from '../../services/allocationService';

interface WorkforceAllocationListProps {
  allocations: WorkforceAllocation[];
  onRefresh: () => void;
  loading: boolean;
}

const WorkforceAllocationList: React.FC<WorkforceAllocationListProps> = ({
  allocations,
  onRefresh,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const roleChoices = allocationService.getWorkforceRoleChoices();

  const filteredAllocations = allocations.filter(allocation => {
    const matchesSearch = 
      allocation.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allocation.batch_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || allocation.role_assigned === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string): "success" | "warning" | "info" | "danger" | "default" => {
    switch (role) {
      case 'supervisor': return 'success';
      case 'operator': return 'info';
      case 'maintenance': return 'warning';
      case 'qc': return 'info';
      case 'assistant': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workforce allocation?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await allocationService.deleteWorkforceAllocation(id);
      
      if (response.success) {
        onRefresh();
      } else {
        alert(`Failed to delete allocation: ${response.message}`);
      }
    } catch (error) {
      console.error('Error deleting allocation:', error);
      alert('Failed to delete allocation. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const exportWorkforceData = () => {
    // This would integrate with the export service
    console.log('Exporting workforce allocation data...');
  };

  if (loading) {
    return (
      <Card padding="lg">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              Staff Allocations
            </h2>
            <p className="text-sm text-gray-500">
              {filteredAllocations.length} of {allocations.length} allocations
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff or batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              {roleChoices.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            
            {/* Export Button */}
            <Button variant="secondary" size="sm" onClick={exportWorkforceData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Allocations List */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocated By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Allocated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAllocations.length > 0 ? (
                filteredAllocations.map((allocation) => (
                  <tr key={allocation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {allocation.user_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {allocation.batch_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getRoleBadgeColor(allocation.role_assigned)}>
                        {allocation.role_display}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <div>
                          <div>{formatDate(allocation.start_date)} - {formatDate(allocation.end_date)}</div>
                          {allocation.duration_days && (
                            <div className="text-xs text-gray-400">
                              {allocation.duration_days} days
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allocation.allocated_by_name || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(allocation.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit allocation"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(allocation.id)}
                          disabled={deletingId === allocation.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Delete allocation"
                        >
                          {deletingId === allocation.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        No workforce allocations found
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {searchTerm || roleFilter !== 'all' 
                          ? 'Try adjusting your search or filter criteria.'
                          : 'Get started by creating your first workforce allocation.'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default WorkforceAllocationList;
