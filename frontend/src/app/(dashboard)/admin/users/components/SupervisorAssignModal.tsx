import React, { useState } from 'react';
import Button from '../../../../../../components/ui/Button';
import { X, UserCheck } from 'lucide-react';
import { User } from '../../../../../../services/userService';

interface SupervisorAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userId: string, supervisorId: string) => void;
  user: User | null;
  users: User[];
}

const SupervisorAssignModal: React.FC<SupervisorAssignModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  user,
  users
}) => {
  const [selectedSupervisor, setSelectedSupervisor] = useState('');

  const availableSupervisors = users.filter(u => 
    (u.role === 'admin' || u.role === 'supervisor') && 
    u.status === 'active' && 
    u.id !== user?.id
  );

  const handleAssign = () => {
    if (user && selectedSupervisor) {
      onAssign(user.id, selectedSupervisor);
      onClose();
      setSelectedSupervisor('');
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <UserCheck size={20} />
            Assign Supervisor
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-gray-900">User</h3>
            <p className="text-sm text-gray-600">
              {user.first_name} {user.last_name} ({user.role})
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Supervisor <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Choose a supervisor...</option>
              {availableSupervisors.map(supervisor => (
                <option key={supervisor.id} value={supervisor.id}>
                  {supervisor.first_name} {supervisor.last_name} ({supervisor.role})
                  {supervisor.employee_id && ` - ${supervisor.employee_id}`}
                </option>
              ))}
            </select>
            {availableSupervisors.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                No available supervisors found. Please ensure there are active admin or supervisor users.
              </p>
            )}
          </div>

          {user.supervisor && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Current Supervisor:</strong> {
                  users.find(u => u.id === user.supervisor)?.first_name || 'Unknown'
                } {
                  users.find(u => u.id === user.supervisor)?.last_name || ''
                }
              </p>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleAssign} 
            disabled={!selectedSupervisor || availableSupervisors.length === 0}
            className="flex-1"
          >
            Assign Supervisor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupervisorAssignModal;
