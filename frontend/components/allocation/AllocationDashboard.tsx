'use client';

import React from 'react';
import { formatCurrency } from '../../lib/formatters';
import { 
  Users, 
  Package, 
  TrendingUp, 
  Clock, 
  UserCheck,
  DollarSign,
  Truck,
  BarChart3,
  Activity
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { AllocationStats, MaterialStats, WorkforceAllocation, MaterialAllocation } from '../../services/allocationService';

interface AllocationDashboardProps {
  workforceStats: AllocationStats | null;
  materialStats: MaterialStats | null;
  recentWorkforce: WorkforceAllocation[];
  recentMaterials: MaterialAllocation[];
  loading: boolean;
}

const AllocationDashboard: React.FC<AllocationDashboardProps> = ({
  workforceStats,
  materialStats,
  recentWorkforce,
  recentMaterials,
  loading
}) => {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} padding="lg">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Staff Allocated</p>
              <p className="text-2xl font-bold text-gray-900">
                {workforceStats?.total_allocations || 0}
              </p>
              <p className="text-sm text-blue-600">
                {workforceStats?.unique_workers || 0} unique workers
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Material Allocations</p>
              <p className="text-2xl font-bold text-gray-900">
                {materialStats?.total_allocations || 0}
              </p>
              <p className="text-sm text-green-600">
                {materialStats?.unique_materials || 0} material types
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Batches</p>
              <p className="text-2xl font-bold text-gray-900">
                {workforceStats?.unique_batches || 0}
              </p>
              <p className="text-sm text-purple-600">
                Production workflows
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {workforceStats?.average_duration_days || 0}
              </p>
              <p className="text-sm text-orange-600">
                days per allocation
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workforce Allocations */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <UserCheck className="h-5 w-5 text-blue-500 mr-2" />
              Recent Staff Allocations
            </h3>
            <span className="text-sm text-gray-500">Last 5 allocations</span>
          </div>
          
          <div className="space-y-4">
            {recentWorkforce.length > 0 ? (
              recentWorkforce.map((allocation) => (
                <div key={allocation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {allocation.user_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Batch {allocation.batch_number}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getRoleBadgeColor(allocation.role_assigned)}>
                      {allocation.role_display}
                    </Badge>
                    {allocation.duration_days && (
                      <span className="text-xs text-gray-500">
                        {allocation.duration_days}d
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No workforce allocations yet</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Material Allocations */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Truck className="h-5 w-5 text-green-500 mr-2" />
              Recent Material Allocations
            </h3>
            <span className="text-sm text-gray-500">Last 5 allocations</span>
          </div>
          
          <div className="space-y-4">
            {recentMaterials.length > 0 ? (
              recentMaterials.map((allocation) => (
                <div key={allocation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {allocation.material_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Batch {allocation.batch_number}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {allocation.quantity} {allocation.unit}
                    </p>
                    {allocation.total_cost && (
                      <p className="text-xs text-gray-500">
                        {formatCurrency(allocation.total_cost || 0)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No material allocations yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Role Breakdown */}
      {workforceStats?.role_breakdown && workforceStats.role_breakdown.length > 0 && (
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
            Staff Allocation by Role
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {workforceStats.role_breakdown.map((role) => (
              <div key={role.role_assigned} className="text-center">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {role.count}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {role.role_assigned}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Material Breakdown */}
      {materialStats?.material_breakdown && materialStats.material_breakdown.length > 0 && (
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <Package className="h-5 w-5 text-green-500 mr-2" />
            Material Allocation Summary
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materialStats.material_breakdown.map((material) => (
                  <tr key={material.material_name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {material.material_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {material.total_quantity.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AllocationDashboard;
