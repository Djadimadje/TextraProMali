'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../../../../../../components/ui/Button';
import { Machine } from '../../../../../../services/machineService';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  machine: Machine | null;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  machine
}) => {
  if (!isOpen || !machine) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Delete Machine
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this machine? This action cannot be undone.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm">
              <div className="font-medium text-gray-900">{machine.machine_id}</div>
              <div className="text-gray-600">{machine.name}</div>
              <div className="text-gray-500 text-xs mt-1">
                Type: {typeof machine.machine_type === 'object' 
                  ? machine.machine_type.name 
                  : 'Unknown Type'}
              </div>
              {machine.building && (
                <div className="text-gray-500 text-xs">
                  Location: {machine.building}
                  {machine.floor && ` - ${machine.floor}`}
                </div>
              )}
            </div>
          </div>

          {machine.operational_status === 'running' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  Warning: This machine is currently running. Consider stopping it before deletion.
                </span>
              </div>
            </div>
          )}

          {machine.primary_operator && typeof machine.primary_operator === 'object' && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Note:</strong> This machine is assigned to{' '}
                {machine.primary_operator.first_name} {machine.primary_operator.last_name}.
                The operator assignment will be removed.
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose} 
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="danger" 
            onClick={handleConfirm} 
            className="flex-1"
          >
            Delete Machine
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
