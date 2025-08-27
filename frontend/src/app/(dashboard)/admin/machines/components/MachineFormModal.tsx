'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../../../../components/ui/Button';
import { Machine, MachineType, MachineCreateData, MachineUpdateData } from '../../../../../../services/machineService';

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface MachineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (machineData: MachineCreateData | MachineUpdateData) => void;
  machine: Machine | null;
  machineTypes: MachineType[];
  operators: User[];
}

const MachineFormModal: React.FC<MachineFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  machine,
  machineTypes,
  operators
}) => {
  const [formData, setFormData] = useState<MachineCreateData>({
    name: '',
    machine_type: '',
    manufacturer: '',
    model_number: '',
    serial_number: '',
    installation_date: '',
    building: '',
    floor: '',
    location_details: '',
    operational_status: 'offline',
    rated_power: undefined,
    rated_capacity: undefined,
    capacity_unit: '',
    primary_operator: '',
    notes: '',
    warranty_expiry: '',
    purchase_cost: '',
    site_code: 'BAM001' // Default site code
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (machine) {
        console.log('=== FORM DATA SETUP ===');
        console.log('Machine object received for editing:', machine);
        console.log('Machine type structure:', machine.machine_type);
        
        // machine_type can be either an object with id or just the id number
        const machineTypeId = typeof machine.machine_type === 'object' 
          ? machine.machine_type?.id 
          : machine.machine_type;
        
        console.log('Extracted machine type ID:', machineTypeId);
        console.log('Machine type ID type:', typeof machineTypeId);
        
        const formDataToSet = {
          machine_id: machine.machine_id,
          name: machine.name,
          machine_type: String(machineTypeId || ''),
          manufacturer: machine.manufacturer || '',
          model_number: machine.model_number || '',
          serial_number: machine.serial_number || '',
          installation_date: machine.installation_date || '',
          building: machine.building || '',
          floor: machine.floor || '',
          location_details: machine.location_details || '',
          operational_status: machine.operational_status,
          rated_power: machine.rated_power,
          rated_capacity: machine.rated_capacity,
          capacity_unit: machine.capacity_unit || '',
          primary_operator: typeof machine.primary_operator === 'object' 
            ? machine.primary_operator?.id || '' 
            : machine.primary_operator || '',
          notes: machine.notes || '',
          warranty_expiry: machine.warranty_expiry || '',
          purchase_cost: machine.purchase_cost || '',
          site_code: machine.site_code
        };
        
        console.log('Form data being set:', formDataToSet);
        console.log('Available machine types:', machineTypes);
        console.log('Machine type 30 exists in options:', machineTypes.find(t => String(t.id) === '30'));
        setFormData(formDataToSet);
      } else {
        // Create mode - reset form
        setFormData({
          name: '',
          machine_type: '',
          manufacturer: '',
          model_number: '',
          serial_number: '',
          installation_date: '',
          building: '',
          floor: '',
          location_details: '',
          operational_status: 'offline',
          rated_power: undefined,
          rated_capacity: undefined,
          capacity_unit: '',
          primary_operator: '',
          notes: '',
          warranty_expiry: '',
          purchase_cost: '',
          site_code: 'BAM001'
        });
      }
      setErrors({});
    }
  }, [isOpen, machine]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rated_power' || name === 'rated_capacity' 
        ? (value === '' ? undefined : parseFloat(value))
        : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Only validate machine_id for edit mode (when machine exists)
    if (machine && formData.machine_id && !formData.machine_id.trim()) {
      newErrors.machine_id = 'Machine ID is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Machine name is required';
    }
    if (!formData.machine_type) {
      newErrors.machine_type = 'Machine type is required';
    }
    if (!formData.site_code.trim()) {
      newErrors.site_code = 'Site code is required';
    }

    // Validate machine ID format (should be uppercase) - only if machine_id exists
    if (formData.machine_id && !/^[A-Z0-9-]+$/.test(formData.machine_id)) {
      newErrors.machine_id = 'Machine ID should contain only uppercase letters, numbers, and hyphens';
    }

    // Validate numeric fields
    if (formData.rated_power !== undefined && formData.rated_power < 0) {
      newErrors.rated_power = 'Rated power cannot be negative';
    }
    if (formData.rated_capacity !== undefined && formData.rated_capacity < 0) {
      newErrors.rated_capacity = 'Rated capacity cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create clean data object, removing empty strings for optional fields
      const cleanData = { ...formData };
      
      // Remove machine_id if it's undefined (for new machines)
      if (!machine && !cleanData.machine_id) {
        delete (cleanData as any).machine_id;
      }
      
      // Convert empty strings to undefined for optional fields
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key as keyof typeof cleanData] === '') {
          if (!['name', 'machine_type', 'site_code', 'operational_status'].includes(key)) {
            (cleanData as any)[key] = undefined;
          }
        }
      });

      console.log('Form data being sent:', cleanData);
      console.log('Is edit mode:', !!machine);

      onSave(cleanData);
    } catch (error) {
      console.error('Error saving machine:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {machine ? 'Edit Machine' : 'Add New Machine'}
            </h2>
            {!machine && (
              <p className="text-sm text-gray-600 mt-1">
                Machine ID will be auto-generated
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Only show Machine ID field for editing existing machines */}
            {machine && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Machine ID *
                </label>
                <input
                  type="text"
                  name="machine_id"
                  value={formData.machine_id || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.machine_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., LOOM-001"
                  disabled={!!machine} // Disable editing machine ID for existing machines
                />
                {errors.machine_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.machine_id}</p>
                )}
              </div>
            )}

            <div className={!machine ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Machine Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Cotton Weaving Loom Unit 1"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Machine Type *
              </label>
              <select
                name="machine_type"
                value={formData.machine_type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.machine_type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select machine type</option>
                {machineTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.machine_type && (
                <p className="mt-1 text-sm text-red-600">{errors.machine_type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operational Status
              </label>
              <select
                name="operational_status"
                value={formData.operational_status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="running">Running</option>
                <option value="idle">Idle</option>
                <option value="maintenance">Under Maintenance</option>
                <option value="breakdown">Breakdown</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          {/* Continue in next part due to length... */}
          
          {/* Equipment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., TextileTech Corp"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Number
              </label>
              <input
                type="text"
                name="model_number"
                value={formData.model_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., TT-2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serial Number
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., SN123456789"
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Code *
              </label>
              <input
                type="text"
                name="site_code"
                value={formData.site_code}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.site_code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., BAM001"
              />
              {errors.site_code && (
                <p className="mt-1 text-sm text-red-600">{errors.site_code}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building
              </label>
              <input
                type="text"
                name="building"
                value={formData.building}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Production Hall A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Floor
              </label>
              <input
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Ground Floor"
              />
            </div>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rated Power (kW)
              </label>
              <input
                type="number"
                name="rated_power"
                value={formData.rated_power || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.rated_power ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 15.5"
                step="0.1"
                min="0"
              />
              {errors.rated_power && (
                <p className="mt-1 text-sm text-red-600">{errors.rated_power}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rated Capacity
              </label>
              <input
                type="number"
                name="rated_capacity"
                value={formData.rated_capacity || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.rated_capacity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 100"
                step="0.1"
                min="0"
              />
              {errors.rated_capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.rated_capacity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity Unit
              </label>
              <input
                type="text"
                name="capacity_unit"
                value={formData.capacity_unit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., kg/hr, m/hr"
              />
            </div>
          </div>

          {/* Assignment and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Operator
              </label>
              <select
                name="primary_operator"
                value={formData.primary_operator}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select operator</option>
                {operators.filter(op => ['technician', 'supervisor'].includes(op.role)).map(operator => (
                  <option key={operator.id} value={operator.id}>
                    {operator.first_name} {operator.last_name} ({operator.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Installation Date
              </label>
              <input
                type="date"
                name="installation_date"
                value={formData.installation_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warranty Expiry
              </label>
              <input
                type="date"
                name="warranty_expiry"
                value={formData.warranty_expiry}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Cost (CFA)
              </label>
              <input
                type="text"
                name="purchase_cost"
                value={formData.purchase_cost}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 5000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Details
              </label>
              <input
                type="text"
                name="location_details"
                value={formData.location_details}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Near main entrance, Row 3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Additional notes about the machine..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : machine ? 'Update Machine' : 'Create Machine'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MachineFormModal;
