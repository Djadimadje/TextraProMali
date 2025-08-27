
/**
 * Workflow Service for TexPro AI
 * Handles batch workflow API operations - Updated to match backend structure
 */

import { BASE_URL } from '../lib/constants';

// Types matching backend models
export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
}

export interface BatchWorkflow {
  id: string;
  batch_code: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  status_display: string;
  start_date?: string;
  end_date?: string;
  supervisor: string; // User ID
  supervisor_name: string;
  supervisor_details: User;
  created_at: string;
  updated_at: string;
  is_overdue: boolean;
  duration_days?: number;
  days_remaining?: number;
  progress_percentage?: number;
  can_edit?: boolean;
  can_delete?: boolean;
}

export interface BatchWorkflowCreateData {
  batch_code: string;
  description?: string;
  supervisor?: string;
  start_date?: string;
  end_date?: string;
}

export interface BatchWorkflowUpdateData {
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  supervisor?: string;
}

export interface BatchWorkflowStats {
  total_batches: number;
  active_batches: number;
  overdue_batches: number;
  by_status: Record<string, number>;
  by_supervisor: Record<string, number>;
}

export interface BatchWorkflowFilters {
  status?: string;
  supervisor?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class WorkflowService {
  public baseUrl = `${BASE_URL}/workflow`;

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Create authenticated headers for API requests
   */
  private createAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Get all batch workflows with filtering and pagination
   */
  async getBatchWorkflows(filters: BatchWorkflowFilters = {}): Promise<ApiResponse<PaginatedResponse<BatchWorkflow>>> {
    const token = this.getAuthToken();
    console.log('Making API call to workflow batches...');
    console.log('Token available:', !!token);
    console.log('Base URL:', this.baseUrl);
    
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `${this.baseUrl}/batches/${queryString ? `?${queryString}` : ''}`;
    console.log('Full URL:', url);
    
    try {
      const response = await fetch(url, {
        headers: this.createAuthHeaders(),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        throw new Error(`Failed to fetch batch workflows: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  /**
   * Get a specific batch workflow by ID
   */
  async getBatchWorkflow(id: string): Promise<ApiResponse<BatchWorkflow>> {
    const response = await fetch(`${this.baseUrl}/batches/${id}/`, {
      headers: this.createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch batch workflow: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new batch workflow
   */
  async createBatchWorkflow(data: BatchWorkflowCreateData): Promise<ApiResponse<BatchWorkflow>> {
    const response = await fetch(`${this.baseUrl}/batches/`, {
      method: 'POST',
      headers: this.createAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create batch workflow: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update an existing batch workflow
   */
  async updateBatchWorkflow(id: string, data: BatchWorkflowUpdateData): Promise<ApiResponse<BatchWorkflow>> {
    const response = await fetch(`${this.baseUrl}/batches/${id}/`, {
      method: 'PATCH',
      headers: this.createAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update batch workflow: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete a batch workflow
   */
  async deleteBatchWorkflow(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/batches/${id}/`, {
      method: 'DELETE',
      headers: this.createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete batch workflow: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Start a batch workflow
   */
  async startBatchWorkflow(id: string, startDate?: string): Promise<ApiResponse<BatchWorkflow>> {
    const response = await fetch(`${this.baseUrl}/batches/${id}/start/`, {
      method: 'POST',
      headers: this.createAuthHeaders(),
      body: JSON.stringify({
        start_date: startDate
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start batch workflow: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Complete a batch workflow
   */
  async completeBatchWorkflow(id: string, completionDate?: string): Promise<ApiResponse<BatchWorkflow>> {
    const response = await fetch(`${this.baseUrl}/batches/${id}/complete/`, {
      method: 'POST',
      headers: this.createAuthHeaders(),
      body: JSON.stringify({
        completion_date: completionDate
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to complete batch workflow: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Cancel a batch workflow
   */
  async cancelBatchWorkflow(id: string, reason?: string): Promise<ApiResponse<BatchWorkflow>> {
    const response = await fetch(`${this.baseUrl}/batches/${id}/cancel/`, {
      method: 'POST',
      headers: this.createAuthHeaders(),
      body: JSON.stringify({
        reason
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel batch workflow: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Bulk update batch workflow statuses
   */
  async bulkUpdateStatus(batchIds: string[], status: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseUrl}/batches/bulk_update_status/`, {
      method: 'POST',
      headers: this.createAuthHeaders(),
      body: JSON.stringify({
        batch_ids: batchIds,
        status
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to bulk update statuses: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get batches assigned to current user
   */
  async getMyBatches(filters: BatchWorkflowFilters = {}): Promise<ApiResponse<PaginatedResponse<BatchWorkflow>>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `${this.baseUrl}/batches/my_batches/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: this.createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch my batches: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats(): Promise<ApiResponse<BatchWorkflowStats>> {
    const response = await fetch(`${this.baseUrl}/stats/overview/`, {
      headers: this.createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workflow stats: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get dashboard data for current user
   */
  async getDashboardData(): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseUrl}/stats/dashboard/`, {
      headers: this.createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get supervisors for dropdown selection
   */
  async getSupervisors(): Promise<User[]> {
    try {
      const response = await fetch(`${BASE_URL}/users/users/?role=supervisor&status=active`, {
        headers: this.createAuthHeaders(),
      });
      
      if (!response.ok) throw new Error('Failed to fetch supervisors');
      
      const data = await response.json();
      return data.data?.results || data.results || [];
    } catch (error) {
      console.error('Failed to fetch supervisors:', error);
      return [];
    }
  }

  /**
   * Helper methods for UI
   */
  getStatusColor(status: string): string {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      delayed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.pending;
  }

  getStatusIcon(status: string): string {
    const statusIcons = {
      pending: '⏳',
      in_progress: '🔄',
      completed: '✅',
      delayed: '⚠️',
      cancelled: '❌'
    };
    return statusIcons[status as keyof typeof statusIcons] || '📋';
  }

  getPriorityColor(isOverdue: boolean, daysRemaining?: number): string {
    if (isOverdue) return 'text-red-600';
    if (daysRemaining !== undefined && daysRemaining <= 3) return 'text-orange-600';
    if (daysRemaining !== undefined && daysRemaining <= 7) return 'text-yellow-600';
    return 'text-green-600';
  }

  formatDuration(days?: number): string {
    if (!days) return 'Not set';
    if (days === 1) return '1 day';
    return `${days} days`;
  }

  formatProgress(percentage?: number): string {
    if (percentage === undefined) return 'Not started';
    return `${Math.round(percentage)}%`;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  }

  /**
   * Validate batch workflow data
   */
  validateBatchWorkflow(data: BatchWorkflowCreateData | BatchWorkflowUpdateData): string[] {
    const errors: string[] = [];

    if ('batch_code' in data) {
      if (!data.batch_code?.trim()) {
        errors.push('Batch code is required');
      } else if (data.batch_code.length < 3) {
        errors.push('Batch code must be at least 3 characters');
      }
    }

    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      
      if (startDate >= endDate) {
        errors.push('End date must be after start date');
      }
    }

    return errors;
  }
}

export const workflowService = new WorkflowService();
