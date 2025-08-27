'use client';
import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Settings, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { maintenanceService } from '../../services/maintenanceApiService';

interface Machine {
  id: string;
  name: string;
  machine_id: string;
  machine_type: {
    name: string;
  };
  site_code: string;
  building?: string;
}

interface Technician {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editTask?: any;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editTask
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  
  const [formData, setFormData] = useState<{
    machine: string;
    technician: string;
    issue_reported: string;
    maintenance_type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    next_due_date: string;
    notes: string;
  }>({
    machine: '',
    technician: '',
    issue_reported: '',
    maintenance_type: 'routine',
    priority: 'medium',
    next_due_date: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadMachines();
      loadTechnicians();
      
      if (editTask) {
        setFormData({
          machine: editTask.machine || '',
          technician: editTask.technician || '',
          issue_reported: editTask.issue_reported || '',
          maintenance_type: editTask.maintenance_type || 'routine',
          priority: editTask.priority || 'medium',
          next_due_date: editTask.next_due_date || '',
          notes: editTask.notes || ''
        });
      }
    }
  }, [isOpen, editTask]);

  const loadMachines = async () => {
    try {
      // Load machines from API
      const response = await fetch('/api/v1/machines/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const machinesList = data.results || data;
        setMachines(machinesList);
      } else {
        console.error('Failed to fetch machines');
        setMachines([]);
      }
    } catch (err) {
      console.error('Failed to load machines:', err);
      setMachines([]);
    }
  };

  const loadTechnicians = async () => {
    try {
      // Load technicians from users API
      const response = await fetch('/api/v1/users/?role=technician', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const techniciansList = data.results || data;
        setTechnicians(techniciansList.filter((user: any) => 
          user.role === 'technician' || user.role === 'supervisor'
        ));
      } else {
        console.error('Failed to fetch technicians');
        setTechnicians([]);
      }
    } catch (err) {
      console.error('Failed to load technicians:', err);
      setTechnicians([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editTask) {
        await maintenanceService.updateMaintenanceLog(editTask.id, formData);
      } else {
        await maintenanceService.createMaintenanceLog(formData);
      }
      
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        machine: '',
        technician: '',
        issue_reported: '',
        maintenance_type: 'routine',
        priority: 'medium',
        next_due_date: '',
        notes: ''
      });
    } catch (err: any) {
      console.error('Failed to save maintenance task:', err);
      setError(err.message || 'Failed to save maintenance task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editTask ? 'Edit Maintenance Task' : 'Schedule New Maintenance'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Machine Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Settings className="h-4 w-4 inline mr-1" />
                Select Machine *
              </label>
              <select
                required
                value={formData.machine}
                onChange={(e) => setFormData(prev => ({ ...prev, machine: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a machine...</option>
                {machines.map((machine) => (
                  <option key={machine.id} value={machine.id}>
                    {machine.name} ({machine.machine_id}) - {machine.site_code}
                  </option>
                ))}
              </select>
            </div>

            {/* Technician Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Assign Technician *
              </label>
              <select
                required
                value={formData.technician}
                onChange={(e) => setFormData(prev => ({ ...prev, technician: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a technician...</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.first_name} {tech.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Maintenance Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Type *
              </label>
              <select
                required
                value={formData.maintenance_type}
                onChange={(e) => setFormData(prev => ({ ...prev, maintenance_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="routine">Routine Maintenance</option>
                <option value="repair">Repair</option>
                <option value="predictive">Predictive Check</option>
                <option value="emergency">Emergency Repair</option>
                <option value="upgrade">Upgrade/Modification</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'critical' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Schedule Date */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Schedule Date/Time
              </label>
              <input
                type="datetime-local"
                value={formData.next_due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, next_due_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty for immediate scheduling
              </p>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Description / Work Required *
            </label>
            <textarea
              required
              rows={4}
              value={formData.issue_reported}
              onChange={(e) => setFormData(prev => ({ ...prev, issue_reported: e.target.value }))}
              placeholder="Describe the maintenance work required, issues reported, or routine maintenance to be performed..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes, special instructions, or context for the technician..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : editTask ? 'Update Task' : 'Schedule Maintenance'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;
