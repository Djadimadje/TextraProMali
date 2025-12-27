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
import { BASE_URL } from '../../lib/constants';

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
  const [dateErrors, setDateErrors] = useState<{ start?: string; end?: string }>({});

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
  
  // Frontend role compatibility mapping (mirror of backend)
  const roleCompatibility: Record<string, string[]> = {
    operator: ['technician', 'operator'],
    maintenance: ['technician', 'maintenance', 'inspector'],
    qc: ['inspector', 'qc'],
    supervisor: ['supervisor'],
    assistant: ['technician', 'assistant']
  };

  // Filter role choices based on selected user's role (if any)
  const filteredRoleChoices = React.useMemo(() => {
    if (!workforceData.user) return roleChoices;
    const selected = users.find(u => String(u.id) === String(workforceData.user));
    const userRole = selected?.role || '';

    // Admin can be assigned any role
    if (userRole === 'admin') return roleChoices;

    const filtered = roleChoices.filter(rc => {
      const compatible = roleCompatibility[rc.value as string] || [];
      return compatible.includes(userRole as string);
    });

    if (filtered.length === 0) {
      console.warn('AllocationForm: no compatible role choices for user role', userRole, '— falling back to full list');
      return roleChoices;
    }

    return filtered;
  }, [workforceData.user, users, roleChoices]);

  useEffect(() => {
    loadFormData();
  }, []);

  // Today's date in YYYY-MM-DD for `min` attributes and validation
  const todayISO = new Date().toISOString().slice(0, 10);
  const endMin = (workforceData.start_date && workforceData.start_date > todayISO) ? workforceData.start_date : todayISO;

  const loadFormData = async () => {
    try {
      setLoading(true);
      // Load batches from workflow API so we pass valid PKs (usually UUIDs)
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${BASE_URL}/workflow/batches/?page_size=100`, {
          method: 'GET',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        const json = await res.json().catch(() => null);
        if (json && json.success && json.data && json.data.results) {
          setBatches(json.data.results.map((b: any) => ({
            id: b.id,
            batch_number: b.batch_code,
            product_type: b.description || '',
            current_stage: b.status || ''
          })));
        } else {
          // fallback to empty list if API call fails
          setBatches([]);
        }
      } catch (err) {
        console.warn('Failed to load batches from API, falling back to empty list', err);
        setBatches([]);
      }

      // Load users from users API so we send valid PKs to the backend
      try {
        const token = localStorage.getItem('access_token');
        const resUsers = await fetch(`${BASE_URL}/users/?page_size=200`, {
          method: 'GET',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        const usersJson = await resUsers.json().catch(() => null);
        if (usersJson && usersJson.success && usersJson.data && usersJson.data.results) {
          setUsers(usersJson.data.results.map((u: any) => ({
            id: u.id,
            username: u.username,
            first_name: u.first_name || u.username,
            last_name: u.last_name || '',
            role: u.role || ''
          })));
        } else if (Array.isArray(usersJson)) {
          // some endpoints may return plain list
          setUsers(usersJson.map((u: any) => ({
            id: u.id,
            username: u.username,
            first_name: u.first_name || u.username,
            last_name: u.last_name || '',
            role: u.role || ''
          })));
        } else {
          // Fallback to small mock list if user API unavailable
          setUsers([
            { id: '1', username: 'john_doe', first_name: 'John', last_name: 'Doe', role: 'operator' },
            { id: '2', username: 'jane_smith', first_name: 'Jane', last_name: 'Smith', role: 'supervisor' }
          ]);
        }
      } catch (err) {
        console.warn('Failed to load users from API, using fallback mocks', err);
        setUsers([
          { id: '1', username: 'john_doe', first_name: 'John', last_name: 'Doe', role: 'operator' },
          { id: '2', username: 'jane_smith', first_name: 'Jane', last_name: 'Smith', role: 'supervisor' }
        ]);
      }

    } catch (err) {
      console.error('Failed to load form data:', err);
      setError('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkforceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    setDateErrors({});

    if (!workforceData.batch || !workforceData.user) {
      setError('Please select both batch and user');
      return;
    }

    // Client-side date validation and normalization
    const dateValidation = validateDates(workforceData.start_date, workforceData.end_date);
    if (!dateValidation.valid) {
      setDateErrors(dateValidation.errors);
      // Build a professional, user-friendly error message
      const msgs = Object.entries(dateValidation.errors).map(([k, v]) => `${k === 'start' ? 'Start date' : 'End date'}: ${v}`);
      setError(msgs.join(' | '));
      return;
    }

    // Normalize dates to YYYY-MM-DD (ensures consistent API payload)
    if (dateValidation.normalized.start) workforceData.start_date = dateValidation.normalized.start;
    if (dateValidation.normalized.end) workforceData.end_date = dateValidation.normalized.end;

    try {
      setSubmitting(true);
      setError(null);

      const response = await allocationService.createWorkforceAllocation(workforceData);

      if (response.success) {
        onClose();
      } else {
        // Show field errors if present
        if (response.errors) {
          const formatted = Object.entries(response.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
          setError(formatted);
        } else {
          setError(response.message || 'Failed to create workforce allocation');
        }
      }
    } catch (err) {
      console.error('Error creating workforce allocation:', err);
      setError('Failed to create workforce allocation');
    } finally {
      setSubmitting(false);
    }
  };

  // Validate date inputs (accept loose input, normalize to YYYY-MM-DD)
  function validateDates(startRaw?: string, endRaw?: string) {
    const errors: { start?: string; end?: string } = {};
    const normalized: { start?: string; end?: string } = {};

    const isoDate = (v: string | undefined) => {
      if (!v) return undefined;
      // If already matches YYYY-MM-DD, accept
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
      // Try parsing with Date — if invalid, return undefined
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return undefined;
      // Convert to local YYYY-MM-DD
      return d.toISOString().slice(0, 10);
    };

    if (startRaw) {
      const s = isoDate(startRaw);
      if (!s) {
        errors.start = 'Date has wrong format. Use YYYY-MM-DD (e.g., 2025-12-31).';
      } else {
        normalized.start = s;
        // Prevent past start dates
        if (s < todayISO) {
          errors.start = 'Start date cannot be in the past.';
        }
      }
    }

    if (endRaw) {
      const e = isoDate(endRaw);
      if (!e) {
        errors.end = 'Date has wrong format. Use YYYY-MM-DD (e.g., 2025-12-31).';
      } else {
        normalized.end = e;
        // Prevent past end dates
        if (e < todayISO) {
          errors.end = 'End date cannot be in the past.';
        }
      }
    }

    // If both provided and valid, check ordering
    if (!errors.start && !errors.end && normalized.start && normalized.end) {
      if (normalized.start > normalized.end) {
        errors.start = 'Start date cannot be after end date.';
        errors.end = 'End date cannot be before start date.';
      }
    }

    return { valid: Object.keys(errors).length === 0, errors, normalized };
  }

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
        if (response.errors) {
          const formatted = Object.entries(response.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
          setError(formatted);
        } else {
          setError(response.message || 'Failed to create material allocation');
        }
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
          {filteredRoleChoices.map(role => (
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
            min={todayISO}
            className={`w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${dateErrors.start ? 'border-red-500' : 'border border-gray-300'}`}
            aria-invalid={!!dateErrors.start}
            aria-describedby={dateErrors.start ? 'start-date-error' : undefined}
          />
          {dateErrors.start && (
            <p id="start-date-error" className="mt-1 text-sm text-red-600">{dateErrors.start}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={workforceData.end_date}
            onChange={(e) => {
              const val = e.target.value < endMin ? endMin : e.target.value;
              setWorkforceData({ ...workforceData, end_date: val });
            }}
            min={endMin}
            className={`w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${dateErrors.end ? 'border-red-500' : 'border border-gray-300'}`}
            aria-invalid={!!dateErrors.end}
            aria-describedby={dateErrors.end ? 'end-date-error' : undefined}
          />
          {dateErrors.end && (
            <p id="end-date-error" className="mt-1 text-sm text-red-600">{dateErrors.end}</p>
          )}
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
      <Card padding="none" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
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
