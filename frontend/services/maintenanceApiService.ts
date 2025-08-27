/**
 * Maintenance Service for TexPro AI
 * Handles maintenance log API operations matching the backend structure
 */

import { BASE_URL } from '../lib/constants';

// Types matching backend models
export interface MaintenanceLog {
  id: string;
  machine: string;
  technician: string;
  technician_name: string;
  issue_reported: string;
  action_taken?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reported_at: string;
  resolved_at?: string;
  next_due_date?: string;
  downtime_hours?: number;
  cost?: number;
  parts_replaced?: string;
  notes?: string;
  machine_info: {
    machine_id: string;
    name: string;
    type: string;
    location: string;
  };
  duration_hours?: number;
  is_overdue: boolean;
  days_since_reported: number;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceStats {
  total_maintenance_logs: number;
  pending_count: number;
  in_progress_count: number;
  completed_count: number;
  overdue_count: number;
  average_resolution_time_hours?: number;
  average_downtime_hours?: number;
  total_maintenance_cost: number;
  stats_by_status: Array<{ status: string; count: number }>;
  stats_by_priority: Array<{ priority: string; count: number }>;
  stats_by_machine_type: Array<{ machine__machine_type__name: string; count: number }>;
}

export interface MaintenanceCreateData {
  machine: string;
  technician: string;
  issue_reported: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface MaintenanceUpdateData {
  action_taken?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  downtime_hours?: number;
  cost?: number;
  parts_replaced?: string;
  notes?: string;
}

export interface MaintenanceFilters {
  status?: string;
  priority?: string;
  machine?: string;
  technician?: string;
  start_date?: string;
  end_date?: string;
  overdue?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface PredictiveMaintenance {
  machine_id: string;
  machine_name: string;
  next_due_date?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  days_until_due?: number;
  patterns: any;
  recommendations: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  results?: T[];
  count?: number;
  next?: string;
  previous?: string;
}

class MaintenanceServiceClass {
  private baseUrl = `${BASE_URL}/maintenance`;

  private createHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private createFormDataHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  // Maintenance Log Operations
  async getMaintenanceLogs(filters?: MaintenanceFilters): Promise<ApiResponse<MaintenanceLog[]>> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/logs/?${params}`, {
        method: 'GET',
        headers: this.createHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch maintenance logs: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.results || data,
        count: data.count,
        next: data.next,
        previous: data.previous
      };
    } catch (error) {
      console.error('Get maintenance logs error:', error);
      throw error;
    }
  }

  async getMaintenanceLog(id: string): Promise<ApiResponse<MaintenanceLog>> {
    try {
      const response = await fetch(`${this.baseUrl}/logs/${id}/`, {
        method: 'GET',
        headers: this.createHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch maintenance log: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Get maintenance log error:', error);
      throw error;
    }
  }

  async createMaintenanceLog(data: MaintenanceCreateData): Promise<ApiResponse<MaintenanceLog>> {
    try {
      const response = await fetch(`${this.baseUrl}/logs/`, {
        method: 'POST',
        headers: this.createHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create maintenance log: ${response.statusText}`);
      }

      const responseData = await response.json();
      return {
        success: true,
        message: 'Maintenance log created successfully',
        data: responseData
      };
    } catch (error) {
      console.error('Create maintenance log error:', error);
      throw error;
    }
  }

  async updateMaintenanceLog(id: string, data: MaintenanceUpdateData): Promise<ApiResponse<MaintenanceLog>> {
    try {
      const response = await fetch(`${this.baseUrl}/logs/${id}/`, {
        method: 'PATCH',
        headers: this.createHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update maintenance log: ${response.statusText}`);
      }

      const responseData = await response.json();
      return {
        success: true,
        message: 'Maintenance log updated successfully',
        data: responseData
      };
    } catch (error) {
      console.error('Update maintenance log error:', error);
      throw error;
    }
  }

  async deleteMaintenanceLog(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/logs/${id}/`, {
        method: 'DELETE',
        headers: this.createHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete maintenance log: ${response.statusText}`);
      }

      return {
        success: true,
        message: 'Maintenance log deleted successfully'
      };
    } catch (error) {
      console.error('Delete maintenance log error:', error);
      throw error;
    }
  }

  // Status Management
  async markCompleted(id: string, data: {
    action_taken: string;
    downtime_hours?: number;
    cost?: number;
    parts_replaced?: string;
    notes?: string;
  }): Promise<ApiResponse<MaintenanceLog>> {
    try {
      const response = await fetch(`${this.baseUrl}/logs/${id}/mark_completed/`, {
        method: 'POST',
        headers: this.createHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to mark maintenance as completed: ${response.statusText}`);
      }

      const responseData = await response.json();
      return {
        success: true,
        message: 'Maintenance marked as completed',
        data: responseData
      };
    } catch (error) {
      console.error('Mark completed error:', error);
      throw error;
    }
  }

  // Statistics
  async getMaintenanceStats(): Promise<ApiResponse<MaintenanceStats>> {
    try {
      const response = await fetch(`${this.baseUrl}/stats/`, {
        method: 'GET',
        headers: this.createHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch maintenance stats: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Get maintenance stats error:', error);
      throw error;
    }
  }

  // Overdue Maintenance
  async getOverdueMaintenance(): Promise<ApiResponse<MaintenanceLog[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/logs/overdue/`, {
        method: 'GET',
        headers: this.createHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch overdue maintenance: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.results || data
      };
    } catch (error) {
      console.error('Get overdue maintenance error:', error);
      throw error;
    }
  }

  // Maintenance by Machine
  async getMaintenanceByMachine(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/logs/by_machine/`, {
        method: 'GET',
        headers: this.createHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch maintenance by machine: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Get maintenance by machine error:', error);
      throw error;
    }
  }

  // Predictive Maintenance
  async getPredictiveMaintenance(machineId?: string): Promise<ApiResponse<PredictiveMaintenance[]>> {
    try {
      const url = machineId 
        ? `${this.baseUrl}/predictions/machine/${machineId}/`
        : `${this.baseUrl}/predictions/`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.createHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch predictive maintenance: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: Array.isArray(data) ? data : [data]
      };
    } catch (error) {
      console.error('Get predictive maintenance error:', error);
      throw error;
    }
  }

  // Bulk Operations
  async bulkUpdateStatus(maintenanceIds: string[], status: string, notes?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/bulk-update/`, {
        method: 'POST',
        headers: this.createHeaders(),
        body: JSON.stringify({
          maintenance_ids: maintenanceIds,
          status: status,
          notes: notes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to bulk update: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Bulk update error:', error);
      throw error;
    }
  }

  // Recommendations
  async getMaintenanceRecommendations(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/logs/${id}/recommendations/`, {
        method: 'GET',
        headers: this.createHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Get recommendations error:', error);
      throw error;
    }
  }
}

export const maintenanceService = new MaintenanceServiceClass();
