/**
 * Analytics Service for TexPro AI
 * Handles analytics data retrieval and KPI calculations
 */

import { BASE_URL } from '../lib/constants';

// Analytics interfaces
export interface ProductionAnalytics {
  total_batches: number;
  status_breakdown: {
    completed: number;
    in_progress: number;
    delayed: number;
    other: number;
  };
  percentages: {
    completed: number;
    in_progress: number;
    delayed: number;
  };
  average_duration_days: number;
  recent_activity: {
    batches_last_30_days: number;
  };
  daily_output: number;
  weekly_output: number;
  efficiency: number;
  quality_score: number;
}

export interface MachineAnalytics {
  total_machines: number;
  status_breakdown: {
    operational: number;
    under_maintenance: number;
    offline: number;
    other: number;
  };
  percentages: {
    operational: number;
    under_maintenance: number;
    offline: number;
  };
  utilization_rate: number;
  average_downtime_hours: number;
}

export interface QualityAnalytics {
  total_checks: number;
  status_breakdown: {
    approved: number;
    rejected: number;
    pending: number;
  };
  percentages: {
    approved: number;
    rejected: number;
    pending: number;
  };
  ai_accuracy: number;
  checks_today: number;
  defect_categories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

export interface MaintenanceAnalytics {
  total_logs: number;
  status_breakdown: {
    scheduled: number;
    in_progress: number;
    completed: number;
    overdue: number;
  };
  average_resolution_hours: number;
  preventive_vs_corrective: {
    preventive: number;
    corrective: number;
  };
  cost_analysis: {
    total_cost: number;
    avg_cost_per_maintenance: number;
  };
}

export interface AllocationAnalytics {
  workforce_stats: {
    total_allocations: number;
    unique_workers: number;
    utilization_rate: number;
    role_breakdown: Array<{
      role: string;
      count: number;
      percentage: number;
    }>;
  };
  material_stats: {
    total_allocations: number;
    unique_materials: number;
    total_cost: number;
    cost_breakdown: Array<{
      material: string;
      cost: number;
      percentage: number;
    }>;
  };
}

export interface DashboardKPI {
  title: string;
  value: number;
  unit: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  target: number;
  current: number;
}

export interface RecentActivity {
  id: number;
  type: 'maintenance' | 'quality' | 'production' | 'user' | 'alert';
  message: string;
  user: string;
  time: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

export interface DashboardStats {
  machines: {
    total: number;
    operational: number;
    offline: number;
    maintenance: number;
  };
  quality: {
    approval_rate: number;
    defect_rate: number;
    ai_accuracy: number;
    checks_today: number;
  };
  production: {
    daily_target: number;
    daily_output: number;
    weekly_output: number;
    efficiency: number;
    quality_score: number;
  };
  maintenance: {
    scheduled: number;
    completed: number;
    overdue: number;
    pending: number;
    in_progress: number;
  };
}

// Legacy interface for backward compatibility
export interface AnalyticsData {
  production: {
    daily: number;
    weekly: number;
    monthly: number;
    efficiency: number;
    trend: { date: string; value: number; }[];
  };
  quality: {
    passRate: number;
    defectRate: number;
    avgScore: number;
    trend: { date: string; passRate: number; }[];
  };
  machines: {
    uptime: number;
    utilization: number;
    mtbf: number;
    mttr: number;
  };
  costs: {
    operational: number;
    maintenance: number;
    materials: number;
    labor: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AnalyticsFilters {
  date_range?: {
    start: string;
    end: string;
  };
  machine_type?: string;
  department?: string;
  status?: string;
}

class AnalyticsService {
  private baseUrl = `${BASE_URL}/analytics`;

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }

    try {
      const data = await response.json();
      
      // Handle backend response format
      if (data.success !== undefined) {
        return data;
      }
      
      // Direct data response
      return {
        success: true,
        data,
      };
    } catch (err) {
      return {
        success: false,
        error: 'Failed to parse response JSON',
      };
    }
  }

  // Production Analytics
  async getProductionAnalytics(filters?: AnalyticsFilters | {
    dateRange?: { start: string; end: string };
    machineId?: string;
    start_date?: string;
    end_date?: string;
    department?: string;
  }): Promise<ApiResponse<ProductionAnalytics> | any> {
    try {
      const url = new URL(`${this.baseUrl}/production/`);
      
      if (filters) {
        // Handle both new and legacy filter formats
        if ('date_range' in filters && filters.date_range) {
          url.searchParams.append('start_date', filters.date_range.start);
          url.searchParams.append('end_date', filters.date_range.end);
        } else if ('dateRange' in filters && filters.dateRange) {
          url.searchParams.append('start_date', filters.dateRange.start);
          url.searchParams.append('end_date', filters.dateRange.end);
        }
        
        // Handle direct date parameters
        if ('start_date' in filters && filters.start_date) {
          url.searchParams.append('start_date', filters.start_date);
        }
        if ('end_date' in filters && filters.end_date) {
          url.searchParams.append('end_date', filters.end_date);
        }
        
        // Handle other filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== 'date_range' && key !== 'dateRange') {
            if (typeof value === 'string') {
              url.searchParams.append(key, value);
            }
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      // For legacy compatibility, return direct response for old calls
      if (!response.ok) {
        throw new Error(`Failed to fetch production analytics: ${response.statusText}`);
      }

      const data = await response.json();
      return this.handleResponse<ProductionAnalytics>(response).then(() => ({ success: true, data }));
    } catch (err) {
      if (err instanceof Error && err.message.includes('Failed to fetch production analytics')) {
        throw err; // Re-throw for legacy compatibility
      }
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch production analytics',
      };
    }
  }

  // Machine Analytics
  async getMachineAnalytics(filters?: AnalyticsFilters): Promise<ApiResponse<MachineAnalytics>> {
    try {
      const url = new URL(`${this.baseUrl}/machines/`);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'date_range' && typeof value === 'object') {
              url.searchParams.append('start_date', value.start);
              url.searchParams.append('end_date', value.end);
            } else {
              url.searchParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<MachineAnalytics>(response);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch machine analytics',
      };
    }
  }

  // Quality Analytics
  async getQualityAnalytics(filters?: AnalyticsFilters): Promise<ApiResponse<QualityAnalytics>> {
    try {
      const url = new URL(`${this.baseUrl}/quality/`);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'date_range' && typeof value === 'object') {
              url.searchParams.append('start_date', value.start);
              url.searchParams.append('end_date', value.end);
            } else {
              url.searchParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<QualityAnalytics>(response);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch quality analytics',
      };
    }
  }

  // Maintenance Analytics
  async getMaintenanceAnalytics(filters?: AnalyticsFilters): Promise<ApiResponse<MaintenanceAnalytics>> {
    try {
      const url = new URL(`${this.baseUrl}/maintenance/`);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'date_range' && typeof value === 'object') {
              url.searchParams.append('start_date', value.start);
              url.searchParams.append('end_date', value.end);
            } else {
              url.searchParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<MaintenanceAnalytics>(response);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch maintenance analytics',
      };
    }
  }

  // Allocation Analytics
  async getAllocationAnalytics(filters?: AnalyticsFilters): Promise<ApiResponse<AllocationAnalytics>> {
    try {
      const url = new URL(`${this.baseUrl}/allocation/`);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'date_range' && typeof value === 'object') {
              url.searchParams.append('start_date', value.start);
              url.searchParams.append('end_date', value.end);
            } else {
              url.searchParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<AllocationAnalytics>(response);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch allocation analytics',
      };
    }
  }

  // Dashboard Summary
  async getDashboardSummary(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<any>(response);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch dashboard summary',
      };
    }
  }

  // Legacy method for backward compatibility
  async getDashboardData(filters?: {
    dateRange?: { start: string; end: string };
  }): Promise<AnalyticsData | ApiResponse<DashboardStats>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.dateRange) {
        params.append('start_date', filters.dateRange.start);
        params.append('end_date', filters.dateRange.end);
      }

      const response = await fetch(`${this.baseUrl}/dashboard/?${params}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics data: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Return data in legacy format for compatibility
      return data;
    } catch (err) {
      // For new API calls, return ApiResponse format
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch dashboard data',
      };
    }
  }

  // Dashboard Stats (for compatibility)
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard-stats/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<DashboardStats>(response);
      
      // If we get a direct response without the success wrapper, wrap it
      if (result.success && !result.data) {
        return {
          success: true,
          data: result as any,
        };
      }
      
      return result;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch dashboard stats',
      };
    }
  }

  // KPIs
  async getKPIs(): Promise<ApiResponse<DashboardKPI[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/kpis/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<DashboardKPI[]>(response);
      
      // If we get a direct array response, wrap it
      if (Array.isArray(result)) {
        return {
          success: true,
          data: result,
        };
      }
      
      return result;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch KPIs',
      };
    }
  }

  // Recent Activities
  async getRecentActivities(): Promise<ApiResponse<RecentActivity[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/activities/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<RecentActivity[]>(response);
      
      // If we get a direct array response, wrap it
      if (Array.isArray(result)) {
        return {
          success: true,
          data: result,
        };
      }
      
      return result;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch recent activities',
      };
    }
  }

  // Health Check
  async getHealthCheck(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/health/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<any>(response);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch health check',
      };
    }
  }

  // Export Methods
  async exportAnalyticsReport(
    type: 'production' | 'machine' | 'quality' | 'maintenance' | 'allocation',
    format: 'pdf' | 'excel' | 'csv' = 'excel',
    filters?: AnalyticsFilters
  ): Promise<Blob> {
    const url = new URL(`${this.baseUrl}/${type}/export/`);
    
    url.searchParams.append('format', format);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'date_range' && typeof value === 'object') {
            url.searchParams.append('start_date', value.start);
            url.searchParams.append('end_date', value.end);
          } else {
            url.searchParams.append(key, value.toString());
          }
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Utility methods
  getAnalyticsFilterOptions() {
    return {
      dateRanges: [
        { label: 'Today', value: 'today' },
        { label: 'Last 7 days', value: 'week' },
        { label: 'Last 30 days', value: 'month' },
        { label: 'Last 90 days', value: 'quarter' },
        { label: 'Custom', value: 'custom' },
      ],
      machineTypes: [
        { label: 'All Machines', value: '' },
        { label: 'Ginning', value: 'ginning' },
        { label: 'Spinning', value: 'spinning' },
        { label: 'Weaving', value: 'weaving' },
        { label: 'Dyeing', value: 'dyeing' },
      ],
      departments: [
        { label: 'All Departments', value: '' },
        { label: 'Production', value: 'production' },
        { label: 'Quality Control', value: 'quality' },
        { label: 'Maintenance', value: 'maintenance' },
      ],
    };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-ML', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  formatDuration(hours: number): string {
    if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours.toFixed(0)}h`;
  }
}

export const analyticsService = new AnalyticsService();
