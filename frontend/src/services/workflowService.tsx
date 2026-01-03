import api from './api';
import {
  BatchWorkflow,
  BatchFilters,
  PaginatedResponse,
  APIError,
  User,
} from '../types/api';
import React from 'react';
import { Play, CheckCircle, Pause, AlertTriangle, Square } from 'lucide-react';

// Re-export types for consumers that import from this service file
export type { BatchWorkflow, User };

// Convenience types used by modals/components
export type BatchWorkflowCreateData = {
  batch_code: string;
  description?: string;
  supervisor?: string;
  start_date?: string;
  end_date?: string;
};

export type BatchWorkflowUpdateData = Partial<BatchWorkflowCreateData>;

class WorkflowService {
  // Batch Management
  async getBatches(filters?: BatchFilters): Promise<PaginatedResponse<BatchWorkflow>> {
    try {
      return await api.getBatchWorkflows(filters);
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }
  }

  // Backwards-compatible alias for older callers
  async getBatchWorkflows(filters?: BatchFilters): Promise<PaginatedResponse<BatchWorkflow>> {
    return this.getBatches(filters);
  }

  async getBatchById(id: string): Promise<BatchWorkflow> {
    try {
      return await api.getBatchById(id);
    } catch (error) {
      console.error('Error fetching batch:', error);
      throw error;
    }
  }

  async createBatch(batchData: Partial<BatchWorkflow>): Promise<BatchWorkflow> {
    try {
      return await api.createBatch(batchData);
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  }

  async updateBatch(id: string, batchData: Partial<BatchWorkflow>): Promise<BatchWorkflow> {
    try {
      return await api.updateBatch(id, batchData);
    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  }

  async deleteBatch(id: string): Promise<void> {
    try {
      await api.deleteBatch(id);
    } catch (error) {
      console.error('Error deleting batch:', error);
      throw error;
    }
  }

  // Batch Actions
  async startBatch(id: string, startDate?: string): Promise<BatchWorkflow> {
    try {
      return await api.startBatch(id, startDate);
    } catch (error) {
      console.error('Error starting batch:', error);
      throw error;
    }
  }

  async completeBatch(id: string, completionDate?: string): Promise<BatchWorkflow> {
    try {
      return await api.completeBatch(id, completionDate);
    } catch (error) {
      console.error('Error completing batch:', error);
      throw error;
    }
  }

  async cancelBatch(id: string, reason?: string): Promise<BatchWorkflow> {
    try {
      return await api.cancelBatch(id, reason);
    } catch (error) {
      console.error('Error canceling batch:', error);
      throw error;
    }
  }

  // Statistics and Analytics
  async getWorkflowStats(): Promise<any> {
    try {
      const stats = await api.getWorkflowStats();
      return stats;
    } catch (error) {
      console.error('Error fetching workflow stats:', error);
      return {
        total_batches: 0,
        active_batches: 0,
        completed_batches: 0,
        delayed_batches: 0,
        cancelled_batches: 0,
        avg_completion_time: 0,
        on_time_delivery_rate: 0,
        current_efficiency: 0,
      };
    }
  }

  async getWorkflowDashboard(): Promise<any> {
    try {
      return await api.getWorkflowDashboard();
    } catch (error) {
      console.error('Error fetching workflow dashboard:', error);
      throw error;
    }
  }

  async getProcessAnalytics(): Promise<any> {
    try {
      const analytics = await api.getWorkflowAnalytics();
      if (analytics && analytics.stages) return analytics;
      const dashboard = await this.getWorkflowDashboard();
      return dashboard || {};
    } catch (error) {
      console.error('Error fetching process analytics:', error);
      throw error;
    }
  }

  async getBottleneckAnalysis(): Promise<any> {
    try {
      const dashboard = await this.getWorkflowDashboard();
      return dashboard?.bottlenecks || [];
    } catch (error) {
      console.error('Error fetching bottleneck analysis:', error);
      throw error;
    }
  }

  async getMyBatches(): Promise<BatchWorkflow[]> {
    try {
      return await api.getMyBatches();
    } catch (error) {
      console.error('Error fetching my batches:', error);
      throw error;
    }
  }

  // Get supervisors for dropdown selection
  async getSupervisors(): Promise<User[]> {
    try {
      const users = await api.getUsers({ role: 'supervisor', status: 'active' });
      return (users && (users.results || (users as any).data || users)) as any;
    } catch (error: any) {
      console.error('Failed to fetch supervisors', error);

      // If the backend forbids listing users for non-admins (403),
      // fall back to returning the current user (useful for supervisors creating their own batches).
      if (error?.response?.status === 403) {
        try {
          if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
              const currentUser = JSON.parse(userStr) as User;
              return [currentUser];
            }
          }
        } catch (parseErr) {
          console.error('Failed to parse current user from localStorage', parseErr);
        }
      }

      return [];
    }
  }

  // Backwards-compatible wrappers
  async createBatchWorkflow(data: BatchWorkflowCreateData): Promise<BatchWorkflow> {
    // Normalize dates to YYYY-MM-DD (backend expects date-only strings)
    const payload: any = { ...data };
    if (payload.start_date) {
      // handle datetime-local (YYYY-MM-DDTHH:MM) or other ISO formats
      payload.start_date = String(payload.start_date).split('T')[0];
    }
    if (payload.end_date) {
      payload.end_date = String(payload.end_date).split('T')[0];
    }

    return this.createBatch(payload as Partial<BatchWorkflow>);
  }

  async updateBatchWorkflow(id: string, data: BatchWorkflowUpdateData): Promise<BatchWorkflow> {
    return this.updateBatch(id, data as Partial<BatchWorkflow>);
  }

  // Simple client-side validation helper used by modal
  validateBatchWorkflow(data: BatchWorkflowCreateData): string[] {
    const errors: string[] = [];
    if (!data.batch_code || !data.batch_code.trim()) errors.push('Batch code is required');
    if (data.start_date && data.end_date) {
      const s = new Date(data.start_date);
      const e = new Date(data.end_date);
      if (s >= e) errors.push('End date must be after start date');
    }
    return errors;
  }

  // UI helpers: return classname string and icon element
  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'delayed':
        return 'text-orange-600 bg-orange-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getStatusIcon(status: string): React.ReactElement {
    switch (status) {
      case 'in_progress': return <Play className="w-4 h-4 text-blue-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Square className="w-4 h-4 text-gray-600" />;
    }
  }

  // Utility methods
  formatDuration(days?: number): string {
    if (!days) return 'N/A';
    if (days < 1) return `${Math.round(days * 24)}h`;
    return `${Math.round(days)}d`;
  }

  formatDate(date?: string | null): string {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return String(date);
      return d.toLocaleDateString();
    } catch (err) {
      return String(date);
    }
  }

  formatProgress(progress?: number | null): string {
    if (progress === null || progress === undefined) return 'N/A';
    // Ensure numeric and clamp between 0 and 100
    const p = Math.max(0, Math.min(100, Number(progress) || 0));
    return `${Math.round(p)}%`;
  }

  calculateProgress(batch: BatchWorkflow): number {
    if (batch.progress_percentage !== undefined) return batch.progress_percentage;
    switch (batch.status) {
      case 'pending': return 0;
      case 'in_progress': return 50;
      case 'completed': return 100;
      case 'cancelled': return 0;
      case 'delayed': return 25;
      default: return 0;
    }
  }
}

export const workflowService = new WorkflowService();

export default workflowService;
