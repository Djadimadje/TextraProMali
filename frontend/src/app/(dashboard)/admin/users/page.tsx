'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useActivityTracker } from '../../../../hooks/useActivityTracker';
import AdminSidebar from '../../../../../components/layout/AdminSidebar';
import Header from '../../../../../components/layout/Header';
import UserStatsCards from './components/UserStatsCards';
import SearchAndFilters from './components/SearchAndFilters';
import UserTable from './components/UserTable';
import UserFormModal from './components/UserFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ExportModal from './components/ExportModal';
import SupervisorAssignModal from './components/SupervisorAssignModal';
import { userService, User, UserStats as ApiUserStats } from '../../../../../services/userService';

interface UserStats extends ApiUserStats {
  new_users_this_month: number;
}

const UserManagementPage: React.FC = () => {
  useActivityTracker();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (user && user.role !== 'admin') {
        router.push(`/${user.role}`);
        return;
      }
      if (user && user.role === 'admin') {
        loadUserData();
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build filters object
      const filters = {
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        department: departmentFilter || undefined,
        ordering: '-date_joined',
        page_size: 100 // Get all users for now
      };

      // Load users and stats
      const [usersResponse, statsResponse] = await Promise.all([
        userService.getUsers(filters),
        userService.getUserStats()
      ]);

      if (usersResponse.success) {
        setUsers(usersResponse.data.results);
      } else {
        throw new Error(usersResponse.message || 'Failed to load users');
      }

      if (statsResponse.success) {
        // Map backend stats to frontend expected format
        const mappedStats: UserStats = {
          ...statsResponse.data,
          new_users_this_month: statsResponse.data.recent_logins // Using recent_logins as proxy
        };
        setUserStats(mappedStats);
      } else {
        throw new Error(statsResponse.message || 'Failed to load user stats');
      }

    } catch (err: any) {
      console.error('Error loading user data:', err);
      setError(`Error loading user data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowCreateModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const handleUserSaved = async (savedUser: User) => {
    try {
      if (selectedUser) {
        // Update existing user
        const updateData = {
          username: savedUser.username,
          email: savedUser.email,
          first_name: savedUser.first_name,
          last_name: savedUser.last_name,
          role: savedUser.role,
          department: savedUser.department,
          employee_id: savedUser.employee_id,
          phone_number: savedUser.phone_number,
          status: savedUser.status
        };
        
        const response = await userService.updateUser(selectedUser.id, updateData);
        if (response.success) {
          // Update local state
          setUsers(prev => prev.map(u => u.id === selectedUser.id ? response.data : u));
        } else {
          throw new Error(response.message || 'Failed to update user');
        }
      } else {
        // Create new user - extract only the fields needed for API
        const createData = {
          username: savedUser.username,
          email: savedUser.email,
          first_name: savedUser.first_name,
          last_name: savedUser.last_name,
          password: (savedUser as any).password,
          confirm_password: (savedUser as any).confirm_password,
          role: savedUser.role,
          // Note: Supervisor assignment removed - will be handled in allocation system
          // Only include optional fields if they have values (avoid empty strings for unique fields)
          ...(savedUser.employee_id && { employee_id: savedUser.employee_id }),
          ...(savedUser.department && { department: savedUser.department }),
          ...(savedUser.phone_number && { phone_number: savedUser.phone_number }),
          ...(savedUser.site_location && { site_location: savedUser.site_location }),
          ...(savedUser.bio && { bio: savedUser.bio })
        };
        
        console.log('Creating user with data:', createData);
        const response = await userService.createUser(createData);
        console.log('User creation response:', response);
        
        if (response.success) {
          console.log('User created successfully:', response.data);
          
          // Close modal immediately
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedUser(null);
          
          // Reload data to get the fresh user with auto-generated fields (employee_id, etc.)
          console.log('Reloading user data to reflect new user...');
          await loadUserData();
          console.log('User data reloaded successfully');
          
        } else {
          throw new Error(response.message || 'Failed to create user');
        }
      }

    } catch (err: any) {
      console.error('Error saving user:', err);
      
      // Extract detailed error information
      let errorMessage = 'Unknown error occurred';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.errors) {
          // Format validation errors
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          errorMessage = `Validation errors:\n${errorMessages}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = JSON.stringify(errorData, null, 2);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`Error saving user: ${errorMessage}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      try {
        const response = await userService.deleteUser(selectedUser.id);
        if (response.success) {
          // Remove from local state
          setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
          setShowDeleteConfirm(false);
          setSelectedUser(null);
          
          // Reload data to get fresh stats
          await loadUserData();
        } else {
          throw new Error(response.message || 'Failed to delete user');
        }
      } catch (err: any) {
        console.error('Error deleting user:', err);
        alert(`Error deleting user: ${err.message || 'Unknown error'}`);
      }
    }
  };

  // Reload data when filters change
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadUserData();
    }
  }, [searchTerm, roleFilter, statusFilter, departmentFilter, user]);

  const handleExportUsers = () => {
    setShowExportModal(true);
  };

  const handleRefresh = async () => {
    console.log('Refreshing user data...');
    await loadUserData();
    console.log('User data refreshed successfully');
  };

  const handleAssignSupervisor = (user: User) => {
    setSelectedUser(user);
    setShowSupervisorModal(true);
  };

  const handleSupervisorAssign = async (userId: string, supervisorId: string) => {
    try {
      const response = await userService.updateUser(userId, { supervisor: supervisorId });
      if (response.success) {
        // Update local state
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, supervisor: supervisorId } : u
        ));
        // Reload data to get fresh info
        await loadUserData();
      } else {
        throw new Error(response.message || 'Failed to assign supervisor');
      }
    } catch (err: any) {
      console.error('Error assigning supervisor:', err);
      alert(`Error assigning supervisor: ${err.message || 'Unknown error'}`);
    }
  };

  const departments = Array.from(new Set(users.map(u => u.department).filter(Boolean))) as string[];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-[240px]">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage user accounts, roles, and permissions.</p>
              </div>
            </div>

            {/* Stats Cards */}
            {userStats && <UserStatsCards stats={userStats} />}
            
            {/* Search and Filters */}
            <SearchAndFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              departmentFilter={departmentFilter}
              setDepartmentFilter={setDepartmentFilter}
              onExportUsers={handleExportUsers}
              onAddUser={handleAddUser}
              onRefresh={handleRefresh}
              departments={departments}
            />
            
            {/* User Table */}
            <UserTable 
              users={users}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              onAssignSupervisor={handleAssignSupervisor}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleUserSaved}
        user={null}
        users={users}
      />

      <UserFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUserSaved}
        user={selectedUser}
        users={users}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        user={selectedUser}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        users={users}
      />

      <SupervisorAssignModal
        isOpen={showSupervisorModal}
        onClose={() => setShowSupervisorModal(false)}
        onAssign={handleSupervisorAssign}
        user={selectedUser}
        users={users}
      />
    </div>
  );
};

export default UserManagementPage;
