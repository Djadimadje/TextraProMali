'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, User, AlertCircle } from 'lucide-react';
import { BatchWorkflow, BatchWorkflowCreateData, BatchWorkflowUpdateData, workflowService, User as UserType } from '../../../../../../services/workflowService';

interface BatchWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  batch: BatchWorkflow | null;
}

const BatchWorkflowModal: React.FC<BatchWorkflowModalProps> = ({
  isOpen,
  onClose,
  onSave,
  batch
}) => {
  const [formData, setFormData] = useState<BatchWorkflowCreateData>({
    batch_code: '',
    description: '',
    supervisor: '',
    start_date: '',
    end_date: ''
  });

  const [supervisors, setSupervisors] = useState<UserType[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isEditMode = !!batch;

  useEffect(() => {
    if (isOpen) {
      loadSupervisors();
      if (batch) {
        // Populate form with existing batch data
        setFormData({
          batch_code: batch.batch_code,
          description: batch.description || '',
          supervisor: batch.supervisor,
          start_date: batch.start_date ? batch.start_date.slice(0, 16) : '', // Format for datetime-local
          end_date: batch.end_date ? batch.end_date.slice(0, 16) : ''
        });
      } else {
        // Reset form for new batch
        setFormData({
          batch_code: '',
          description: '',
          supervisor: '',
          start_date: '',
          end_date: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, batch]);

  const loadSupervisors = async () => {
    try {
      const supervisorList = await workflowService.getSupervisors();
      setSupervisors(supervisorList);
    } catch (error) {
      console.error('Failed to load supervisors:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const validationErrors = workflowService.validateBatchWorkflow(formData);
    const newErrors: Record<string, string> = {};

    // Convert array of errors to object
    validationErrors.forEach(error => {
      if (error.includes('Batch code')) {
        newErrors.batch_code = error;
      } else if (error.includes('End date')) {
        newErrors.end_date = error;
      }
    });

    // Additional validations
    if (!formData.batch_code.trim()) {
      newErrors.batch_code = 'Batch code is required';
    }

    if (!formData.supervisor) {
      newErrors.supervisor = 'Supervisor is required';
    }

    // Date validation
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (startDate >= endDate) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && batch) {
        // Update existing batch
        const updateData: BatchWorkflowUpdateData = {
          description: formData.description,
          supervisor: formData.supervisor,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined
        };
        
        await workflowService.updateBatchWorkflow(batch.id, updateData);
      } else {
        // Create new batch
        await workflowService.createBatchWorkflow(formData);
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save batch:', error);
      setErrors({ submit: 'Failed to save batch workflow. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const generateBatchCode = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const generatedCode = `BATCH-${year}${month}${day}-${random}`;
    setFormData(prev => ({ ...prev, batch_code: generatedCode }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Batch Workflow' : 'Create New Batch Workflow'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Batch Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Code *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="batch_code"
                value={formData.batch_code}
                onChange={handleInputChange}
                disabled={isEditMode} // Can't change batch code when editing
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.batch_code ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode ? 'bg-gray-100' : ''}`}
                placeholder="e.g., BATCH-240824-001"
              />
              {!isEditMode && (
                <button
                  type="button"
                  onClick={generateBatchCode}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Generate
                </button>
              )}
            </div>
            {errors.batch_code && (
              <p className="mt-1 text-sm text-red-600">{errors.batch_code}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe the batch workflow..."
            />
          </div>

          {/* Supervisor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supervisor *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                name="supervisor"
                value={formData.supervisor}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.supervisor ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a supervisor</option>
                {supervisors.map(supervisor => (
                  <option key={supervisor.id} value={supervisor.id}>
                    {supervisor.first_name} {supervisor.last_name} ({supervisor.username})
                  </option>
                ))}
              </select>
            </div>
            {errors.supervisor && (
              <p className="mt-1 text-sm text-red-600">{errors.supervisor}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.end_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Status Info for Edit Mode */}
          {isEditMode && batch && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Current Status</h4>
              <div className="flex items-center gap-4 text-sm">
                <span className={`px-2 py-1 rounded-full border ${workflowService.getStatusColor(batch.status)}`}>
                  {workflowService.getStatusIcon(batch.status)} {batch.status_display}
                </span>
                <span className="text-gray-600">
                  Progress: {workflowService.formatProgress(batch.progress_percentage)}
                </span>
                {batch.is_overdue && (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Overdue
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Calendar size={16} />
                  {isEditMode ? 'Update Batch' : 'Create Batch'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchWorkflowModal;
