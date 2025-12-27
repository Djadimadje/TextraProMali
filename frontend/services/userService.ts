import apiService from '../src/services/api';
import { User, PaginatedResponse } from '../src/types/api';

export type { User } from '../src/types/api';

export interface UserStats {
  total_users: number;
  active_users: number;
  pending_users: number;
  inactive_users: number;
  locked_users: number;
  by_role: Record<string, number>;
  by_department: Record<string, number>;
  by_site: Record<string, number>;
  recent_logins: number;
}

export interface UserListResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: User[];
  };
}

export interface UserDetailResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface UserStatsResponse {
  success: boolean;
  message: string;
  data: UserStats;
}

export interface UserCreateData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'supervisor' | 'technician' | 'inspector' | 'analyst';
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  department?: string;
  employee_id?: string; // Optional, format: AB1234 (2 letters + 4-6 digits)
  phone_number?: string; // Mali format: +223XXXXXXXX
  site_location?: string;
  supervisor?: string; // User ID of supervisor
  bio?: string;
  password: string;
  confirm_password: string;
}

export interface UserUpdateData {
  username?: string; // Note: username is read-only in backend
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'supervisor' | 'technician' | 'inspector' | 'analyst';
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  department?: string;
  employee_id?: string; // Optional, format: AB1234 (2 letters + 4-6 digits)
  phone_number?: string; // Mali format: +223XXXXXXXX
  site_location?: string;
  supervisor?: string; // User ID of supervisor
  bio?: string;
  is_active?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  department?: string;
  site?: string;
  supervisor?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

class UserService {
  async getUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    try {
      // Use the real API service
      const response = await apiService.getUsers(filters);
      
      return {
        success: true,
        message: 'Users retrieved successfully',
        data: {
          count: response.count,
          next: response.next || null,
          previous: response.previous || null,
          results: response.results
        }
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<UserDetailResponse> {
    try {
      const user = await apiService.getUserById(id);
      return {
        success: true,
        message: 'User retrieved successfully',
        data: user
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async createUser(userData: UserCreateData): Promise<UserDetailResponse> {
    try {
      const user = await apiService.createUser(userData);
      return {
        success: true,
        message: 'User created successfully',
        data: user
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: UserUpdateData): Promise<UserDetailResponse> {
    try {
      const user = await apiService.updateUser(id, userData);
      return {
        success: true,
        message: 'User updated successfully',
        data: user
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await apiService.deleteUser(id);
      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async activateUser(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await apiService.updateUser(id, { status: 'active' });
      return {
        success: true,
        message: 'User activated successfully'
      };
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }

  async deactivateUser(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await apiService.updateUser(id, { status: 'inactive' });
      return {
        success: true,
        message: 'User deactivated successfully'
      };
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  async resetUserPassword(id: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // This would need to be implemented in the backend API
      // For now, return a placeholder response
      return {
        success: true,
        message: 'Password reset functionality needs to be implemented in the backend API'
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  async unlockUserAccount(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await apiService.updateUser(id, { status: 'active' });
      return {
        success: true,
        message: 'Account unlocked successfully'
      };
    } catch (error) {
      console.error('Error unlocking account:', error);
      throw error;
    }
  }

  async getUserStats(): Promise<UserStatsResponse> {
    try {
      // Get all users and calculate stats
      const users = await this.getUsers();
      const userList = users.data.results;

      const stats: UserStats = {
        // Use server-side total count for accuracy (handles pagination)
        total_users: users.data.count,
        active_users: userList.filter(u => u.status === 'active').length,
        pending_users: userList.filter(u => u.status === 'pending').length,
        inactive_users: userList.filter(u => u.status === 'inactive').length,
        locked_users: userList.filter(u => u.status === 'suspended').length,
        by_role: {
          admin: userList.filter(u => u.role === 'admin').length,
          supervisor: userList.filter(u => u.role === 'supervisor').length,
          technician: userList.filter(u => u.role === 'technician').length,
          inspector: userList.filter(u => u.role === 'inspector').length,
          analyst: userList.filter(u => u.role === 'analyst').length
        },
        by_department: userList.reduce((acc, user) => {
          if (user.department) {
            acc[user.department] = (acc[user.department] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>),
        by_site: userList.reduce((acc, user) => {
          if (user.site_location) {
            acc[user.site_location] = (acc[user.site_location] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>),
        recent_logins: userList.filter(u => u.last_activity).length
      };

      return {
        success: true,
        message: 'User statistics retrieved successfully',
        data: stats
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Helper methods for role display
  getRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
      'admin': 'Administrator',
      'supervisor': 'Supervisor',
      'technician': 'Technician',
      'inspector': 'Inspector',
      'analyst': 'Analyst'
    };
    return roleMap[role] || role;
  }

  getRoleBadgeColor(role: string): string {
    const colorMap: Record<string, string> = {
      'admin': 'bg-red-100 text-red-800',
      'supervisor': 'bg-blue-100 text-blue-800',
      'technician': 'bg-green-100 text-green-800',
      'inspector': 'bg-yellow-100 text-yellow-800',
      'analyst': 'bg-purple-100 text-purple-800'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  }

  getStatusDisplayName(status: string): string {
    const statusMap: Record<string, string> = {
      'active': 'Active',
      'inactive': 'Inactive', 
      'pending': 'Pending',
      'locked': 'Locked'
    };
    return statusMap[status] || status;
  }

  getStatusBadgeColor(status: string): string {
    const colorMap: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'locked': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }
}

export const userService = new UserService();
