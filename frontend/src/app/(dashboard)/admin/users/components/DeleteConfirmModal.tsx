import React from 'react';
import Button from '../../../../../../components/ui/Button';

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  employee_id?: string;
  department?: string;
  phone_number?: string;
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  user,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Delete User</h2>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete <strong>{user.first_name} {user.last_name}</strong>? 
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            className="flex-1"
          >
            Delete User
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
