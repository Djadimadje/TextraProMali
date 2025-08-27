'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Package, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  Check,
  Loader2
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { 
  allocationService, 
  WorkforceAllocationCreateData, 
  MaterialAllocationCreateData,
  ConflictCheckResult
} from '../../services/allocationService';

interface AllocationFormProps {
  type: 'workforce' | 'material';
  onClose: () => void;
  editData?: any; // For future edit functionality
}

interface BatchOption {
  id: string;
  batch_number: string;
  product_type: string;
  current_stage: string;
}

interface UserOption {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
}

const AllocationForm: React.FC<AllocationFormProps> = ({
  type,
  onClose,
  editData
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<ConflictCheckResult | null>(null);

  // Data options
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);

  // Form data
  const [workforceData, setWorkforceData] = useState<WorkforceAllocationCreateData>({
    batch: '',
    user: '',
    role_assigned: '',
    start_date: '',
    end_date: ''
  });

  const [materialData, setMaterialData] = useState<MaterialAllocationCreateData>({
    batch: '',
    material_name: '',
    quantity: 0,
    unit: 'kg',
    cost_per_unit: 0,
    supplier: ''
  });

  const roleChoices = allocationService.getWorkforceRoleChoices();
  const unitChoices = allocationService.getMaterialUnitChoices();

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoading(true);
      
      // Load batches - assuming we have a workflow service
      // For now, we'll use mock data since we don't have batch endpoints
      setBatches([
        { id: '1', batch_number: 'B-2025-001', product_type: 'Cotton Fabric', current_stage: 'weaving' },
        { id: '2', batch_number: 'B-2025-002', product_type: 'Polyester Blend', current_stage: 'dyeing' },
        { id: '3', batch_number: 'B-2025-003', product_type: 'Silk Fabric', current_stage: 'finishing' },
        { id: '4', batch_number: 'B-2025-004', product_type: 'Denim Fabric', current_stage: 'cutting' },
        { id: '5', batch_number: 'B-2025-005', product_type: 'Linen Blend', current_stage: 'quality_check' }
      ]);

      // Load users - in a real app, you'd fetch from a users endpoint
      setUsers([
        { id: '1', username: 'john_doe', first_name: 'John', last_name: 'Doe', role: 'operator' },
        { id: '2', username: 'jane_smith', first_name: 'Jane', last_name: 'Smith', role: 'supervisor' },
        { id: '3', username: 'mike_wilson', first_name: 'Mike', last_name: 'Wilson', role: 'maintenance' },
        { id: '4', username: 'sarah_jones', first_name: 'Sarah', last_name: 'Jones', role: 'qc' },
        { id: '5', username: 'david_brown', first_name: 'David', last_name: 'Brown', role: 'operator' },
        { id: '6', username: 'lisa_garcia', first_name: 'Lisa', last_name: 'Garcia', role: 'assistant' },
        { id: '7', username: 'tom_martinez', first_name: 'Tom', last_name: 'Martinez', role: 'supervisor' },
        { id: '8', username: 'amy_taylor', first_name: 'Amy', last_name: 'Taylor', role: 'qc' }
      ]);

    } catch (err) {
      console.error('Failed to load form data:', err);
      setError('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkforceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workforceData.batch || !workforceData.user) {
      setError('Please select both batch and user');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await allocationService.createWorkforceAllocation(workforceData);
      
      if (response.success) {
        onClose();
      } else {
        setError(response.message || 'Failed to create workforce allocation');
      }
    } catch (err) {
      console.error('Error creating workforce allocation:', err);
      setError('Failed to create workforce allocation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!materialData.batch || !materialData.material_name || materialData.quantity <= 0) {
      setError('Please fill in all required fields with valid values');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await allocationService.createMaterialAllocation(materialData);
      
      if (response.success) {
        onClose();
      } else {
        setError(response.message || 'Failed to create material allocation');
      }
    } catch (err) {
      console.error('Error creating material allocation:', err);
      setError('Failed to create material allocation');
    } finally {
      setSubmitting(false);
    }
  };

  const renderWorkforceForm = () => (
    <form id="workforce-form" onSubmit={handleWorkforceSubmit} className="space-y-6">
      {/* Batch Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Production Batch *
        </label>
        <select
          value={workforceData.batch}
          onChange={(e) => setWorkforceData({ ...workforceData, batch: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select a batch...</option>
          {batches.map(batch => (
            <option key={batch.id} value={batch.id}>
              {batch.batch_number} - {batch.product_type} ({batch.current_stage})
            </option>
          ))}
        </select>
      </div>

      {/* User Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Staff Member *
        </label>
        <select
          value={workforceData.user}
          onChange={(e) => setWorkforceData({ ...workforceData, user: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select a staff member...</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.first_name} {user.last_name} (@{user.username}) - {user.role}
            </option>
          ))}
        </select>
      </div>

      {/* Role Assignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assigned Role
        </label>
        <select
          value={workforceData.role_assigned}
          onChange={(e) => setWorkforceData({ ...workforceData, role_assigned: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select role...</option>
          {roleChoices.map(role => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={workforceData.start_date}
            onChange={(e) => setWorkforceData({ ...workforceData, start_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={workforceData.end_date}
            onChange={(e) => setWorkforceData({ ...workforceData, end_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </form>
  );

  const renderMaterialForm = () => (
    <form id="material-form" onSubmit={handleMaterialSubmit} className="space-y-6">
      {/* Batch Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Production Batch *
        </label>
        <select
          value={materialData.batch}
          onChange={(e) => setMaterialData({ ...materialData, batch: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          required
        >
          <option value="">Select a batch...</option>
          {batches.map(batch => (
            <option key={batch.id} value={batch.id}>
              {batch.batch_number} - {batch.product_type} ({batch.current_stage})
            </option>
          ))}
        </select>
      </div>

      {/* Material Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Material Name *
        </label>
        <input
          type="text"
          value={materialData.material_name}
          onChange={(e) => setMaterialData({ ...materialData, material_name: e.target.value })}
          placeholder="e.g., Cotton Yarn, Dye, Chemical"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>

      {/* Quantity and Unit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity *
          </label>
          <input
            type="number"
            value={materialData.quantity}
            onChange={(e) => setMaterialData({ ...materialData, quantity: parseFloat(e.target.value) || 0 })}
            min="0"
            step="0.001"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit *
          </label>
          <select
            value={materialData.unit}
            onChange={(e) => setMaterialData({ ...materialData, unit: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          >
            {unitChoices.map(unit => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cost per Unit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cost per Unit ($)
        </label>
        <input
          type="number"
          value={materialData.cost_per_unit}
          onChange={(e) => setMaterialData({ ...materialData, cost_per_unit: parseFloat(e.target.value) || 0 })}
          min="0"
          step="0.01"
          placeholder="0.00"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Supplier */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Supplier
        </label>
        <input
          type="text"
          value={materialData.supplier}
          onChange={(e) => setMaterialData({ ...materialData, supplier: e.target.value })}
          placeholder="Supplier name or company"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card padding="lg" className="w-full max-w-md">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading form data...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card padding="none" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            {type === 'workforce' ? (
              <>
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                Allocate Staff
              </>
            ) : (
              <>
                <Package className="h-5 w-5 text-green-600 mr-2" />
                Allocate Material
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {conflicts && conflicts.has_conflicts && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Conflicts Detected</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    {conflicts.conflicts.map((conflict, index) => (
                      <p key={index}>{conflict.message}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {type === 'workforce' ? renderWorkforceForm() : renderMaterialForm()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            form={type === 'workforce' ? 'workforce-form' : 'material-form'}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Create Allocation
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AllocationForm;
