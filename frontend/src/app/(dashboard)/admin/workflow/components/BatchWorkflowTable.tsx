'use client';

import React from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { BatchWorkflow, workflowService } from '../../../../../../services/workflowService';

interface BatchWorkflowTableProps {
  batches: BatchWorkflow[];
  onEditBatch: (batch: BatchWorkflow) => void;
  onDeleteBatch: (batch: BatchWorkflow) => void;
  onStartBatch: (batchId: string) => void;
  onCompleteBatch: (batchId: string) => void;
  onCancelBatch: (batchId: string) => void;
  selectedBatches: string[];
  onBatchSelect: (batchId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const BatchWorkflowTable: React.FC<BatchWorkflowTableProps> = ({
  batches,
  onEditBatch,
  onDeleteBatch,
  onStartBatch,
  onCompleteBatch,
  onCancelBatch,
  selectedBatches,
  onBatchSelect,
  onSelectAll,
  currentPage,
  totalPages,
  totalCount,
  onPageChange
}) => {
  const getStatusBadge = (status: string) => {
    const color = workflowService.getStatusColor(status);
    const icon = workflowService.getStatusIcon(status);
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
        <span className="mr-1">{icon}</span>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getProgressBar = (percentage?: number) => {
    if (percentage === undefined) return null;
    
    const color = percentage < 30 ? 'bg-red-500' : 
                 percentage < 70 ? 'bg-yellow-500' : 'bg-green-500';
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const getDaysRemainingColor = (daysRemaining?: number, isOverdue?: boolean) => {
    if (isOverdue) return 'text-red-600 font-medium';
    if (daysRemaining !== undefined && daysRemaining <= 3) return 'text-orange-600';
    if (daysRemaining !== undefined && daysRemaining <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getActionButtons = (batch: BatchWorkflow) => {
    const buttons = [];

    // Status-specific actions
    if (batch.status === 'pending' && batch.can_edit) {
      buttons.push(
        <button
          key="start"
          onClick={() => onStartBatch(batch.id)}
          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
          title="Start Batch"
        >
          <Play className="h-4 w-4" />
        </button>
      );
    }

    if ((batch.status === 'in_progress' || batch.status === 'delayed') && batch.can_edit) {
      buttons.push(
        <button
          key="complete"
          onClick={() => onCompleteBatch(batch.id)}
          className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
          title="Complete Batch"
        >
          <CheckCircle className="h-4 w-4" />
        </button>
      );
    }

    // Common actions
    buttons.push(
      <button
        key="view"
        onClick={() => {/* TODO: Implement view details */}}
        className="text-purple-600 hover:text-purple-900 p-1 rounded-md hover:bg-purple-50"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
    );

    if (batch.can_edit) {
      buttons.push(
        <button
          key="edit"
          onClick={() => onEditBatch(batch)}
          className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-50"
          title="Edit Batch"
        >
          <Edit className="h-4 w-4" />
        </button>
      );
    }

    if (batch.status !== 'completed' && batch.can_edit) {
      buttons.push(
        <button
          key="cancel"
          onClick={() => onCancelBatch(batch.id)}
          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
          title="Cancel Batch"
        >
          <XCircle className="h-4 w-4" />
        </button>
      );
    }

    if (batch.can_delete) {
      buttons.push(
        <button
          key="delete"
          onClick={() => onDeleteBatch(batch)}
          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
          title="Delete Batch"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      );
    }

    return buttons;
  };

  if (batches.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No batch workflows found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first production batch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedBatches.length === batches.length && batches.length > 0}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status & Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supervisor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timeline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {batches.map((batch) => (
              <tr key={batch.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedBatches.includes(batch.id)}
                    onChange={(e) => onBatchSelect(batch.id, e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {batch.batch_code}
                    </div>
                    {batch.description && (
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {batch.description}
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      Created {workflowService.formatDate(batch.created_at)}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(batch.status)}
                    {batch.is_overdue && (
                      <div className="flex items-center text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Overdue
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <div className="flex flex-col">
                      <span className="text-gray-900">
                        {batch.supervisor_name}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {batch.supervisor_details?.role || 'Supervisor'}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col text-sm gap-1">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      Start: {workflowService.formatDate(batch.start_date)}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      End: {workflowService.formatDate(batch.end_date)}
                    </div>
                    {batch.days_remaining !== undefined && (
                      <div className={`text-xs ${getDaysRemainingColor(batch.days_remaining, batch.is_overdue)}`}>
                        {batch.is_overdue 
                          ? `${Math.abs(batch.days_remaining)} days overdue`
                          : `${batch.days_remaining} days remaining`
                        }
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-900">
                      {workflowService.formatProgress(batch.progress_percentage)}
                    </div>
                    {getProgressBar(batch.progress_percentage)}
                    {batch.duration_days && (
                      <div className="text-xs text-gray-500">
                        Duration: {workflowService.formatDuration(batch.duration_days)}
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-1">
                    {getActionButtons(batch)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount} results
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchWorkflowTable;
