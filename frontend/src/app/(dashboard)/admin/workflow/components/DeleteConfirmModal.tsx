'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { BatchWorkflow, workflowService } from '../../../../../../services/workflowService';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  batch: BatchWorkflow | null;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  batch
}) => {
  if (!isOpen || !batch) return null;

  const cannotDelete = batch.status === 'in_progress' || batch.status === 'completed';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Delete Batch Workflow</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-900">
                {cannotDelete ? 'Cannot Delete Active Batch' : 'Confirm Deletion'}
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                {cannotDelete 
                  ? 'This batch cannot be deleted because it is currently in progress or completed.'
                  : 'This action cannot be undone. All workflow data will be permanently removed.'
                }
              </p>
            </div>
          </div>

          {/* Batch Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Batch Code:</span>
                <span className="ml-2 text-gray-900">{batch.batch_code}</span>
              </div>
              
              {batch.description && (
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <span className="ml-2 text-gray-900">{batch.description}</span>
                </div>
              )}
              
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs border ${workflowService.getStatusColor(batch.status)}`}>
                  {workflowService.getStatusIcon(batch.status)} {batch.status_display}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Supervisor:</span>
                <span className="ml-2 text-gray-900">{batch.supervisor_name}</span>
              </div>
              
              {batch.progress_percentage !== undefined && (
                <div>
                  <span className="font-medium text-gray-700">Progress:</span>
                  <span className="ml-2 text-gray-900">
                    {workflowService.formatProgress(batch.progress_percentage)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {cannotDelete && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Suggestion:</strong> Consider canceling the batch instead of deleting it to maintain audit trail.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          
          {!cannotDelete && (
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <AlertTriangle size={16} />
              Delete Batch
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
