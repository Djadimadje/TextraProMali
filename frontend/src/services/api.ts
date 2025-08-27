/**
 * API service for TexPro AI
 * Handles all HTTP requests to Django backend
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  LoginRequest, 
  LoginResponse,
  AuthTokens,
  Machine,
  MachineFilters,
  MaintenanceLog,
  MaintenanceFilters,
  QualityCheck,
  QualityFilters,
  BatchWorkflow,
  BatchFilters,
  PaginatedResponse,
  DashboardStats,
  SystemKPI,
  Activity
} from '../types/api';

class APIService {
  private api: AxiosInstance;
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshAccessToken(refreshToken);
              
              // Handle different response structures
              const responseData = response.data as any;
              const newAccessToken = responseData?.access || responseData?.data?.access;
              if (newAccessToken) {
                this.setTokens({ 
                  access: newAccessToken, 
                  refresh: refreshToken 
                });
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return this.api(originalRequest);
              } else {
                throw new Error('No access token in refresh response');
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            this.clearTokens();
            // Redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  private setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Authentication API
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.api.post<any>('/auth/login/', credentials);
      console.log('Login response:', response.data); // Debug log
      
      // Handle the actual Django response structure
      let tokens: AuthTokens;
      let user: User;
      
      if (response.data.success && response.data.data) {
        // Django wrapped response: { success: true, data: { access, refresh, user } }
        const data = response.data.data;
        tokens = {
          access: data.access,
          refresh: data.refresh
        };
        user = data.user;
      } else if (response.data.access && response.data.refresh) {
        // Direct response: { access, refresh, user }
        tokens = {
          access: response.data.access,
          refresh: response.data.refresh
        };
        user = response.data.user;
      } else {
        throw new Error('Invalid login response structure');
      }
      
      this.setTokens(tokens);
      
      // Store user info
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return { user, tokens };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await this.api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<AxiosResponse<AuthTokens>> {
    try {
      const response = await this.api.post<any>('/auth/refresh/', { refresh: refreshToken });
      console.log('Refresh response:', response.data); // Debug log
      
      // Handle different response structures for refresh
      if (response.data.access) {
        return response;
      } else {
        throw new Error('Invalid refresh response structure');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/auth/me/');
    return response.data;
  }

  // User Management API
  async getUsers(params?: any): Promise<PaginatedResponse<User>> {
    const response = await this.api.get<{ success: boolean; data?: PaginatedResponse<User>; message?: string }>('/users/', { params });
    
    // Handle Django wrapped response format
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    } else if (response.data && !('success' in response.data)) {
      // Handle direct response (fallback)
      return response.data as PaginatedResponse<User>;
    } else {
      throw new Error('Invalid users response format');
    }
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.api.get<{ success: boolean; data?: User; message?: string }>(`/users/${id}/`);
    
    // Handle Django wrapped response format
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    } else if (response.data && !('success' in response.data)) {
      // Handle direct response (fallback)
      return response.data as User;
    } else {
      throw new Error('Invalid user response format');
    }
  }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      console.log('API: Creating user with data:', JSON.stringify(userData, null, 2)); // Debug log
      const response = await this.api.post<{ success: boolean; data?: User; message?: string }>('/users/', userData);
      
      console.log('API: Backend response:', JSON.stringify(response.data, null, 2)); // Debug log
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (response.data && !('success' in response.data)) {
        // Handle direct response (fallback)
        return response.data as User;
      } else {
        throw new Error('Invalid create user response format');
      }
    } catch (error: any) {
      console.error('API: Error creating user:', error.message);
      console.error('API: Full error object:', error);
      console.error('API: Error response status:', error.response?.status);
      console.error('API: Error response data:', JSON.stringify(error.response?.data, null, 2));
      
      // Log the specific validation errors if available
      if (error.response?.data?.errors) {
        console.error('API: Validation errors:', JSON.stringify(error.response.data.errors, null, 2));
      }
      
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await this.api.patch<{ success: boolean; data?: User; message?: string }>(`/users/${id}/`, userData);
    
    // Handle Django wrapped response format
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    } else if (response.data && !('success' in response.data)) {
      // Handle direct response (fallback)
      return response.data as User;
    } else {
      throw new Error('Invalid update user response format');
    }
  }

  async deleteUser(id: string): Promise<void> {
    const response = await this.api.delete<{ success: boolean; message?: string }>(`/users/${id}/`);
    
    // Check if deletion was successful
    if (response.data?.success === false) {
      throw new Error('Failed to delete user');
    }
  }

  // Machine Management API
  async getMachines(filters?: MachineFilters): Promise<PaginatedResponse<Machine>> {
    const response = await this.api.get<PaginatedResponse<Machine>>('/machines/machines/', { params: filters });
    return response.data;
  }

  async getMachineById(id: string): Promise<Machine> {
    const response = await this.api.get<Machine>(`/machines/machines/${id}/`);
    return response.data;
  }

  async createMachine(machineData: Partial<Machine>): Promise<Machine> {
    const response = await this.api.post<Machine>('/machines/machines/', machineData);
    return response.data;
  }

  async updateMachine(id: string, machineData: Partial<Machine>): Promise<Machine> {
    const response = await this.api.patch<Machine>(`/machines/machines/${id}/`, machineData);
    return response.data;
  }

  async deleteMachine(id: string): Promise<void> {
    await this.api.delete(`/machines/machines/${id}/`);
  }

  async getMachineTypes(): Promise<PaginatedResponse<any>> {
    const response = await this.api.get<PaginatedResponse<any>>('/machines/machine-types/');
    return response.data;
  }

  // Maintenance API
  async getMaintenanceLogs(filters?: MaintenanceFilters): Promise<PaginatedResponse<MaintenanceLog>> {
    const response = await this.api.get<PaginatedResponse<MaintenanceLog>>('/maintenance/', { params: filters });
    return response.data;
  }

  async getMaintenanceById(id: string): Promise<MaintenanceLog> {
    const response = await this.api.get<MaintenanceLog>(`/maintenance/${id}/`);
    return response.data;
  }

  async createMaintenance(maintenanceData: Partial<MaintenanceLog>): Promise<MaintenanceLog> {
    const response = await this.api.post<MaintenanceLog>('/maintenance/', maintenanceData);
    return response.data;
  }

  async updateMaintenance(id: string, maintenanceData: Partial<MaintenanceLog>): Promise<MaintenanceLog> {
    const response = await this.api.patch<MaintenanceLog>(`/maintenance/${id}/`, maintenanceData);
    return response.data;
  }

  // Quality Control API
  async getQualityChecks(filters?: QualityFilters): Promise<PaginatedResponse<QualityCheck>> {
    const response = await this.api.get<PaginatedResponse<QualityCheck>>('/quality/', { params: filters });
    return response.data;
  }

  async getQualityCheckById(id: string): Promise<QualityCheck> {
    const response = await this.api.get<QualityCheck>(`/quality/${id}/`);
    return response.data;
  }

  async createQualityCheck(formData: FormData): Promise<QualityCheck> {
    const response = await this.api.post<QualityCheck>('/quality/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateQualityCheck(id: string, qualityData: Partial<QualityCheck>): Promise<QualityCheck> {
    const response = await this.api.patch<QualityCheck>(`/quality/${id}/`, qualityData);
    return response.data;
  }

  // Batch Workflow API
  async getBatchWorkflows(filters?: BatchFilters): Promise<PaginatedResponse<BatchWorkflow>> {
    try {
      const response = await this.api.get<{ success: boolean; data?: PaginatedResponse<BatchWorkflow>; message?: string }>('/workflow/batches/', { params: filters });
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (response.data && !('success' in response.data)) {
        // Handle direct response (fallback)
        return response.data as PaginatedResponse<BatchWorkflow>;
      } else {
        throw new Error('Invalid workflow response format');
      }
    } catch (error) {
      console.error('Error fetching batch workflows:', error);
      throw error;
    }
  }

  async getBatchById(id: string): Promise<BatchWorkflow> {
    try {
      const response = await this.api.get<{ success: boolean; data?: BatchWorkflow; message?: string }>(`/workflow/batches/${id}/`);
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (response.data && !('success' in response.data)) {
        // Handle direct response (fallback)
        return response.data as BatchWorkflow;
      } else {
        throw new Error('Invalid batch response format');
      }
    } catch (error) {
      console.error('Error fetching batch:', error);
      throw error;
    }
  }

  async createBatch(batchData: Partial<BatchWorkflow>): Promise<BatchWorkflow> {
    try {
      const response = await this.api.post<{ success: boolean; data?: BatchWorkflow; message?: string }>('/workflow/batches/', batchData);
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (response.data && !('success' in response.data)) {
        // Handle direct response (fallback)
        return response.data as BatchWorkflow;
      } else {
        throw new Error('Invalid create batch response format');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  }

  async updateBatch(id: string, batchData: Partial<BatchWorkflow>): Promise<BatchWorkflow> {
    try {
      const response = await this.api.patch<{ success: boolean; data?: BatchWorkflow; message?: string }>(`/workflow/batches/${id}/`, batchData);
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (response.data && !('success' in response.data)) {
        // Handle direct response (fallback)
        return response.data as BatchWorkflow;
      } else {
        throw new Error('Invalid update batch response format');
      }
    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  }

  async deleteBatch(id: string): Promise<void> {
    try {
      await this.api.delete(`/workflow/batches/${id}/`);
    } catch (error) {
      console.error('Error deleting batch:', error);
      throw error;
    }
  }

  async startBatch(id: string, startDate?: string): Promise<BatchWorkflow> {
    try {
      const response = await this.api.post<{ success: boolean; data?: BatchWorkflow; message?: string }>(`/workflow/batches/${id}/start/`, {
        start_date: startDate
      });
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid start batch response format');
      }
    } catch (error) {
      console.error('Error starting batch:', error);
      throw error;
    }
  }

  async completeBatch(id: string, completionDate?: string): Promise<BatchWorkflow> {
    try {
      const response = await this.api.post<{ success: boolean; data?: BatchWorkflow; message?: string }>(`/workflow/batches/${id}/complete/`, {
        completion_date: completionDate
      });
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid complete batch response format');
      }
    } catch (error) {
      console.error('Error completing batch:', error);
      throw error;
    }
  }

  async cancelBatch(id: string, reason?: string): Promise<BatchWorkflow> {
    try {
      const response = await this.api.post<{ success: boolean; data?: BatchWorkflow; message?: string }>(`/workflow/batches/${id}/cancel/`, {
        reason: reason
      });
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else {
        throw new Error('Invalid cancel batch response format');
      }
    } catch (error) {
      console.error('Error canceling batch:', error);
      throw error;
    }
  }

  async getMyBatches(): Promise<BatchWorkflow[]> {
    try {
      const response = await this.api.get<{ success: boolean; data?: BatchWorkflow[]; message?: string }>('/workflow/batches/my_batches/');
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        // Handle direct response (fallback)
        return response.data;
      } else {
        throw new Error('Invalid my batches response format');
      }
    } catch (error) {
      console.error('Error fetching my batches:', error);
      throw error;
    }
  }

  async getWorkflowStats(): Promise<any> {
    try {
      const response = await this.api.get<{ success: boolean; data?: any; message?: string }>('/workflow/stats/overview/');
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (response.data && !('success' in response.data)) {
        // Handle direct response (fallback)
        return response.data;
      } else {
        throw new Error('Invalid workflow stats response format');
      }
    } catch (error) {
      console.error('Error fetching workflow stats:', error);
      throw error;
    }
  }

  async getWorkflowDashboard(): Promise<any> {
    try {
      const response = await this.api.get<{ success: boolean; data?: any; message?: string }>('/workflow/stats/dashboard/');
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (response.data && !('success' in response.data)) {
        // Handle direct response (fallback)
        return response.data;
      } else {
        throw new Error('Invalid workflow dashboard response format');
      }
    } catch (error) {
      console.error('Error fetching workflow dashboard:', error);
      throw error;
    }
  }

  // Analytics API
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.api.get<{ success: boolean; data?: DashboardStats; message?: string }>('/analytics/dashboard-stats/');
    
    // Handle Django wrapped response format
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    } else if (response.data && !('success' in response.data)) {
      // Handle direct response (fallback)
      return response.data as DashboardStats;
    } else {
      throw new Error('Invalid dashboard stats response format');
    }
  }

  async getSystemKPIs(): Promise<SystemKPI[]> {
    const response = await this.api.get<SystemKPI[] | { success: boolean; data?: SystemKPI[]; message?: string }>('/analytics/kpis/');
    
    // Handle both wrapped and direct response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data?.success && response.data?.data) {
      return response.data.data;
    } else {
      throw new Error('Invalid KPIs response format');
    }
  }

  async getRecentActivities(): Promise<Activity[]> {
    const response = await this.api.get<Activity[] | { success: boolean; data?: Activity[]; message?: string }>('/analytics/activities/');
    
    // Handle both wrapped and direct response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data?.success && response.data?.data) {
      return response.data.data;
    } else {
      throw new Error('Invalid activities response format');
    }
  }

  // Analyst-specific Analytics API methods
  async getAnalyticsMetrics(): Promise<any> {
    try {
      const response = await this.api.get<{ success: boolean; data?: any; message?: string }>('/analytics/dashboard/');
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (response.data && !('success' in response.data)) {
        // Handle direct response (fallback)
        return response.data;
      } else {
        throw new Error('Invalid analytics metrics response format');
      }
    } catch (error) {
      console.error('Error fetching analytics metrics:', error);
      throw error;
    }
  }

  async getRecentAnalyses(): Promise<any[]> {
    try {
      const response = await this.api.get<any[] | { success: boolean; data?: any[]; message?: string }>('/analytics/activities/');
      
      // Handle both wrapped and direct response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else {
        // Return empty array if no data
        return [];
      }
    } catch (error) {
      console.error('Error fetching recent analyses:', error);
      throw error;
    }
  }

  async getProductionAnalytics(): Promise<any> {
    try {
      const response = await this.api.get<{ success: boolean; data?: any; message?: string }>('/analytics/production/');
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (response.data && !('success' in response.data)) {
        // Handle direct response (fallback)
        return response.data;
      } else {
        throw new Error('Invalid production analytics response format');
      }
    } catch (error) {
      console.error('Error fetching production analytics:', error);
      throw error;
    }
  }

  async getQualityAnalytics(): Promise<any> {
    try {
      const response = await this.api.get<{ success: boolean; data?: any; message?: string }>('/analytics/quality/');
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (response.data && !('success' in response.data)) {
        // Handle direct response (fallback)
        return response.data;
      } else {
        throw new Error('Invalid quality analytics response format');
      }
    } catch (error) {
      console.error('Error fetching quality analytics:', error);
      throw error;
    }
  }

  async getMachineAnalytics(): Promise<any> {
    try {
      const response = await this.api.get<{ success: boolean; data?: any; message?: string }>('/analytics/machines/');
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (response.data && !('success' in response.data)) {
        // Handle direct response (fallback)
        return response.data;
      } else {
        throw new Error('Invalid machine analytics response format');
      }
    } catch (error) {
      console.error('Error fetching machine analytics:', error);
      throw error;
    }
  }

  async getWorkflowAnalytics(): Promise<any> {
    try {
      // Try to get workflow analytics from the dashboard endpoint
      const response = await this.api.get<{ success: boolean; data?: any; message?: string }>('/analytics/dashboard/');
      
      // Extract workflow-related data from the dashboard response
      if (response.data?.success && response.data?.data) {
        const data = response.data.data as any;
        return data.detailed_analytics?.workflow || {};
      } else if (response.data && !('success' in response.data)) {
        // Handle direct response (fallback)
        const data = response.data as any;
        return data.detailed_analytics?.workflow || {};
      } else {
        throw new Error('Invalid workflow analytics response format');
      }
    } catch (error) {
      console.error('Error fetching workflow analytics:', error);
      throw error;
    }
  }

  async getMaintenanceAnalytics(): Promise<any> {
    try {
      const response = await this.api.get<{ success: boolean; data?: any; message?: string }>('/analytics/maintenance/');
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (response.data && !('success' in response.data)) {
        // Handle direct response (fallback)
        return response.data;
      } else {
        throw new Error('Invalid maintenance analytics response format');
      }
    } catch (error) {
      console.error('Error fetching maintenance analytics:', error);
      throw error;
    }
  }

  async getAllocationAnalytics(): Promise<any> {
    try {
      const response = await this.api.get<{ success: boolean; data?: any; message?: string }>('/analytics/allocation/');
      
      // Handle Django wrapped response format
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else if (response.data && !('success' in response.data)) {
        // Handle direct response (fallback)
        return response.data;
      } else {
        throw new Error('Invalid allocation analytics response format');
      }
    } catch (error) {
      console.error('Error fetching allocation analytics:', error);
      throw error;
    }
  }

  // Reports API
  async generateReport(reportType: string, filters?: any): Promise<Blob> {
    const response = await this.api.post(`/reports/${reportType}/`, filters, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Reports Dashboard API
  async getReportsDashboard(): Promise<any> {
    try {
      console.log('Fetching reports dashboard from:', '/analytics/dashboard/');
      const response = await this.api.get<{ success: boolean; data?: any; message?: string }>('/analytics/dashboard/');
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        if (response.data.success && response.data.data) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch reports dashboard data');
        }
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching reports dashboard:', error);
      throw error;
    }
  }

  async getProductionReports(filters?: any): Promise<any> {
    try {
      console.log('Fetching production reports from:', '/analytics/production/', 'with filters:', filters);
      const response = await this.api.get<{ success: boolean; data?: any; message?: string }>('/analytics/production/', {
        params: filters
      });
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        if (response.data.success && response.data.data) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch production reports');
        }
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching production reports:', error);
      throw error;
    }
  }

  async getQualityReports(filters?: any): Promise<any> {
    try {
      const response = await this.api.get<{ success: boolean; data?: any; message?: string }>('/analytics/quality/', {
        params: filters
      });
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        if (response.data.success && response.data.data) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch quality reports');
        }
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching quality reports:', error);
      throw error;
    }
  }

  async getMaintenanceReports(filters?: any): Promise<any> {
    try {
      const response = await this.api.get<{ success: boolean; data?: any; message?: string }>('/analytics/maintenance/', {
        params: filters
      });
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        if (response.data.success && response.data.data) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch maintenance reports');
        }
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching maintenance reports:', error);
      throw error;
    }
  }

  async getFinancialReports(filters?: any): Promise<any> {
    try {
      console.log('Fetching financial reports from:', '/analytics/financial/', 'with filters:', filters);
      const response = await this.api.get<{ success: boolean; data?: any; message?: string }>('/analytics/financial/', {
        params: filters
      });
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        if (response.data.success && response.data.data) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Failed to fetch financial reports');
        }
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching financial reports:', error);
      throw error;
    }
  }

  // File upload helper
  async uploadFile(file: File, endpoint: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // Generic HTTP methods for external services
  async get(url: string, config?: any): Promise<AxiosResponse> {
    return this.api.get(url, config);
  }

  async post(url: string, data?: any, config?: any): Promise<AxiosResponse> {
    return this.api.post(url, data, config);
  }

  async put(url: string, data?: any, config?: any): Promise<AxiosResponse> {
    return this.api.put(url, data, config);
  }

  async patch(url: string, data?: any, config?: any): Promise<AxiosResponse> {
    return this.api.patch(url, data, config);
  }

  async delete(url: string, config?: any): Promise<AxiosResponse> {
    return this.api.delete(url, config);
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.api.get('/health/');
    return response.data;
  }
}

// Create singleton instance
const apiService = new APIService();
export default apiService;
