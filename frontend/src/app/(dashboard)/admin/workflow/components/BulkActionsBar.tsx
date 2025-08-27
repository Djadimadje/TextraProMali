'use client';

import React, { useState } from 'react';
import { Check, X, Play, Pause } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkStatusUpdate: (status: string) => void;
  onClearSelection: () => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onBulkStatusUpdate,
  onClearSelection
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const statusActions = [
    { value: 'in_progress', label: 'Start Batches', icon: Play, color: 'text-blue-600' },
    { value: 'completed', label: 'Complete Batches', icon: Check, color: 'text-green-600' },
    { value: 'cancelled', label: 'Cancel Batches', icon: X, color: 'text-red-600' }
  ];

  const handleStatusUpdate = (status: string) => {
    onBulkStatusUpdate(status);
    setShowDropdown(false);
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-purple-900">
            {selectedCount} batch{selectedCount !== 1 ? 'es' : ''} selected
          </span>
          
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
            >
              Update Status
            </button>
            
            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-40">
                {statusActions.map(action => (
                  <button
                    key={action.value}
                    onClick={() => handleStatusUpdate(action.value)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClearSelection}
          className="text-sm text-purple-600 hover:text-purple-800"
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;
