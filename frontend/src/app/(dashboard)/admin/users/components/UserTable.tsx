import React from 'react';
import Card from '../../../../../../components/ui/Card';
import Badge from '../../../../../../components/ui/Badge';
import { Edit3, Trash2, UserCheck } from 'lucide-react';
import { User } from '../../../../../../services/userService';

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onAssignSupervisor: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEditUser, onDeleteUser, onAssignSupervisor }) => {
  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      supervisor: 'bg-blue-100 text-blue-800',
      technician: 'bg-green-100 text-green-800',
      inspector: 'bg-orange-100 text-orange-800',
      analyst: 'bg-indigo-100 text-indigo-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleDisplayName = (role: string) => {
    const names: Record<string, string> = {
      admin: 'Administrator', supervisor: 'Supervisor', technician: 'Technician',
      inspector: 'Inspector', analyst: 'Analyst'
    };
    return names[role] || role;
  };

  return (
    <Card variant="elevated" padding="none">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-medium text-sm">
                        {user.first_name[0]}{user.last_name[0]}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {user.employee_id || 'Pending'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="default" className={getRoleBadgeColor(user.role)}>
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {((user as any).supervisor_name) ? (
                      (user as any).supervisor_name
                    ) : user.supervisor ? (
                      (() => {
                        const supervisor = users.find(u => u.id === user.supervisor);
                        return supervisor 
                          ? `${supervisor.first_name} ${supervisor.last_name}` 
                          : 'Unknown';
                      })()
                    ) : (
                      <span className="text-gray-400 italic">Not assigned</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {user.department || 'Not specified'}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                    {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => onAssignSupervisor(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                        title="Assign Supervisor"
                      >
                        <UserCheck size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => onEditUser(user)}
                      className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                      title="Edit User"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteUser(user)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default UserTable;
