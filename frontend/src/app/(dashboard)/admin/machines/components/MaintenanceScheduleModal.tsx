'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, AlertTriangle } from 'lucide-react';
import Button from '../../../../../../components/ui/Button';
import { Machine } from '../../../../../../services/machineService';

interface MaintenanceScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (machineId: string, scheduleData: MaintenanceScheduleData) => void;
  machine: Machine | null;
}

interface MaintenanceScheduleData {
  scheduled_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  maintenance_type: 'routine' | 'preventive' | 'corrective' | 'emergency';
  estimated_duration: number; // in hours
  description: string;
  assigned_technician?: string;
}

const MaintenanceScheduleModal: React.FC<MaintenanceScheduleModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
  machine
}) => {
  const [formData, setFormData] = useState<MaintenanceScheduleData>({
    scheduled_date: '',
    priority: 'medium',
    maintenance_type: 'routine',
    estimated_duration: 4,
    description: '',
    assigned_technician: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen && machine) {
      // Set default values based on machine condition
      const priority = machine.maintenance_urgency === 'critical' ? 'critical' :
                      machine.maintenance_urgency === 'urgent' ? 'high' :
                      machine.maintenance_urgency === 'due_soon' ? 'medium' : 'low';
      
      const maintenanceType = machine.operational_status === 'breakdown' ? 'emergency' :
                             machine.needs_maintenance ? 'preventive' : 'routine';

      setFormData({
        scheduled_date: '',
        priority,
        maintenance_type: maintenanceType,
        estimated_duration: 4,
        description: machine.needs_maintenance 
          ? `Scheduled maintenance for ${machine.machine_id} - ${machine.name}`
          : '',
        assigned_technician: ''
      });
      setErrors({});
    }
  }, [isOpen, machine]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimated_duration' ? parseFloat(value) : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.scheduled_date) {
      newErrors.scheduled_date = 'Scheduled date is required';
    } else {
      const selectedDate = new Date(formData.scheduled_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.scheduled_date = 'Scheduled date cannot be in the past';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.estimated_duration <= 0) {
      newErrors.estimated_duration = 'Duration must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!machine || !validateForm()) {
      return;
    }

    onSchedule(machine.id, formData);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen || !machine) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Schedule Maintenance</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Machine Information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{machine.machine_id}</h3>
              <p className="text-sm text-gray-600">{machine.name}</p>
              <p className="text-xs text-gray-500">
                {typeof machine.machine_type === 'object' ? machine.machine_type.name : 'Unknown Type'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Operating Hours</div>
              <div className="font-medium">{machine.total_operating_hours}h total</div>
              <div className="text-sm text-gray-500">
                {machine.hours_since_maintenance}h since maintenance
              </div>
            </div>
          </div>
          
          {machine.needs_maintenance && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">This machine is due for maintenance</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Schedule Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date *
              </label>
              <input
                type="datetime-local"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.scheduled_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.scheduled_date && (
                <p className="mt-1 text-sm text-red-600">{errors.scheduled_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (hours) *
              </label>
              <input
                type="number"
                name="estimated_duration"
                value={formData.estimated_duration}
                onChange={handleInputChange}
                min="0.5"
                step="0.5"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.estimated_duration ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.estimated_duration && (
                <p className="mt-1 text-sm text-red-600">{errors.estimated_duration}</p>
              )}
            </div>
          </div>

          {/* Priority and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <div className={`mt-1 px-2 py-1 rounded text-xs border ${getPriorityColor(formData.priority)}`}>
                {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Type
              </label>
              <select
                name="maintenance_type"
                value={formData.maintenance_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="routine">Routine Maintenance</option>
                <option value="preventive">Preventive Maintenance</option>
                <option value="corrective">Corrective Maintenance</option>
                <option value="emergency">Emergency Repair</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe the maintenance work to be performed..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Maintenance Recommendations */}
          {typeof machine.machine_type === 'object' && machine.machine_type.recommended_maintenance_interval_hours && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Maintenance Guidelines</h4>
              <div className="text-sm text-blue-800">
                <p>Recommended interval: {machine.machine_type.recommended_maintenance_interval_hours} hours</p>
                <p>Hours since last maintenance: {machine.hours_since_maintenance}</p>
                {machine.hours_since_maintenance >= machine.machine_type.recommended_maintenance_interval_hours && (
                  <p className="font-medium text-blue-900 mt-1">⚠ Maintenance interval exceeded</p>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1 flex items-center justify-center gap-2">
              <Calendar size={16} />
              Schedule Maintenance
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceScheduleModal;
