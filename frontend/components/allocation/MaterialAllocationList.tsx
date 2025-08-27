'use client';

import React, { useState } from 'react';
import { formatCurrency } from '../../lib/formatters';
import { 
  Package, 
  DollarSign, 
  Truck, 
  Edit2, 
  Trash2, 
  Search,
  Download
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { MaterialAllocation, allocationService } from '../../services/allocationService';

interface MaterialAllocationListProps {
  allocations: MaterialAllocation[];
  onRefresh: () => void;
  loading: boolean;
}

const MaterialAllocationList: React.FC<MaterialAllocationListProps> = ({
  allocations,
  onRefresh,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const unitChoices = allocationService.getMaterialUnitChoices();

  const filteredAllocations = allocations.filter(allocation => {
    const matchesSearch = 
      allocation.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allocation.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (allocation.supplier && allocation.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesUnit = unitFilter === 'all' || allocation.unit === unitFilter;
    
    return matchesSearch && matchesUnit;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getUnitBadgeColor = (unit: string): "success" | "info" | "warning" | "danger" | "default" => {
    switch (unit) {
      case 'kg': return 'success';
      case 'meters': return 'info';
      case 'liters': return 'warning';
      case 'pieces': return 'info';
      case 'rolls': return 'default';
      case 'tons': return 'danger';
      default: return 'default';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material allocation?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await allocationService.deleteMaterialAllocation(id);
      
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

  const exportMaterialData = () => {
    // This would integrate with the export service
    console.log('Exporting material allocation data...');
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
              <Package className="h-5 w-5 text-green-600 mr-2" />
              Material Allocations
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
                placeholder="Search materials, batch, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            {/* Unit Filter */}
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Units</option>
              {unitChoices.map(unit => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
            
            {/* Export Button */}
            <Button variant="secondary" size="sm" onClick={exportMaterialData}>
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
                  Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocated By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {allocation.material_name}
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
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {allocation.quantity.toLocaleString()}
                        </span>
                        <Badge variant={getUnitBadgeColor(allocation.unit)}>
                          {allocation.unit}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {allocation.cost_per_unit && (
                          <div>
                            <div className="font-medium">
                              {formatCurrency(allocation.total_cost || 0)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatCurrency(allocation.cost_per_unit || 0)} per {allocation.unit}
                            </div>
                          </div>
                        )}
                        {!allocation.cost_per_unit && (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 mr-2" />
                        {allocation.supplier || 'Not specified'}
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
                          className="text-green-600 hover:text-green-900"
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
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Package className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        No material allocations found
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {searchTerm || unitFilter !== 'all' 
                          ? 'Try adjusting your search or filter criteria.'
                          : 'Get started by creating your first material allocation.'
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

      {/* Summary Card */}
      {filteredAllocations.length > 0 && (
        <Card padding="lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Allocations</p>
                  <p className="text-lg font-bold text-gray-900">
                    {filteredAllocations.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cost</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      filteredAllocations.reduce((sum, allocation) => 
                        sum + (allocation.total_cost || 0), 0
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Materials</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Set(filteredAllocations.map(a => a.material_name)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MaterialAllocationList;
