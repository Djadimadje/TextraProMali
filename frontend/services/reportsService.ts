/**
 * Reports Service - Comprehensive reporting system
 * TexPro AI - Textile Manufacturing Optimization System
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

// Types for Reports
export interface ReportFilter {
  start_date?: string;
  end_date?: string;
  date_range?: string;
  role?: string;
  status?: string;
  search?: string;
  machine_type?: string;
  location?: string;
  priority?: string;
  maintenance_type?: string;
  inspector?: string;
  defect_type?: string;
  material_type?: string;
  batch?: string;
  product_type?: string;
  batch_number?: string;
  kpi_type?: string;
  action?: string;
  days?: number;
}

export interface SystemReport {
  title: string;
  description: string;
  available: boolean;
  formats: string[];
  endpoints: {
    pdf?: string;
    excel?: string;
    json?: string;
  };
  last_generated?: string | null;
  filters: string[];
}

export interface UserReport {
  title: string;
  description: string;
  available: boolean;
  formats: string[];
  endpoints: {
    json?: string;
    export?: string;
  };
  filters: string[];
}

export interface ReportsDashboard {
  system_reports: Record<string, SystemReport>;
  user_reports: Record<string, UserReport>;
  dashboard_stats: {
    system_stats: {
      total_users: number;
      active_users: number;
      total_machines: number;
      total_batches: number;
    };
    recent_activity: {
      reports_generated_today: number;
      last_report_time: string | null;
      most_popular_report: string;
    };
    user_activity: {
      logins_today: number;
      new_users_this_week: number;
    };
  };
  user_permissions: {
    role: string;
    can_view_system_reports: boolean;
    can_view_user_reports: boolean;
    can_export: boolean;
  };
}

export interface UserDirectoryData {
  users: Array<{
    id: number;
    username: string;
    name: string;
    email: string;
    role: string;
    status: string;
    last_login: string | null;
    date_joined: string;
    is_active: boolean;
    phone_number: string;
    department: string;
  }>;
  total_count: number;
  filters: {
    role?: string;
    status?: string;
    search?: string;
  };
}

export interface RoleDistributionData {
  role_distribution: Array<{
    role: string;
    role_display: string;
    count: number;
    percentage: number;
    status_breakdown: {
      total: number;
      by_status: Record<string, number>;
    };
  }>;
  total_users: number;
  summary: {
    most_common_role: any;
    active_users: number;
    inactive_users: number;
  };
}

export interface LoginActivityData {
  recent_logins: Array<{
    id: number;
    username: string;
    name: string;
    role: string;
    last_login: string | null;
    days_since_login: number | null;
  }>;
  inactive_users: Array<{
    id: number;
    username: string;
    name: string;
    role: string;
    last_login: string | null;
    days_since_login: number | null;
    status: string;
  }>;
  never_logged_in: Array<{
    id: number;
    username: string;
    name: string;
    role: string;
    date_joined: string;
    days_since_creation: number;
    status: string;
  }>;
  summary: {
    total_users: number;
    active_in_period: number;
    inactive_users: number;
    never_logged_in: number;
    activity_rate: number;
  };
}

export interface UserPerformanceData {
  supervisors: Array<{
    id: number;
    name: string;
    username: string;
    workflows_managed: number;
    last_active: string | null;
  }>;
  technicians: Array<{
    id: number;
    name: string;
    username: string;
    tasks_completed: number;
    last_active: string | null;
  }>;
  inspectors: Array<{
    id: number;
    name: string;
    username: string;
    inspections_done: number;
    defects_detected: number;
    detection_rate: number;
    last_active: string | null;
  }>;
  analysts: Array<{
    id: number;
    name: string;
    username: string;
    reports_generated: number;
    analytics_accessed: number;
    last_active: string | null;
  }>;
  summary: {
    total_users_evaluated: number;
    performance_period: {
      start: string;
      end: string;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  filters?: ReportFilter;
}

class ReportsService {
  private baseUrl = `${BASE_URL}/reports`;
  
  // Client-side export service import for fallback when server Excel generation fails
  // import dynamically to avoid circular load issues in some bundlers
  private async loadExportService() {
    try {
      const mod = await import('./exportService');
      return mod.exportService;
    } catch (e) {
      console.warn('Failed to load exportService for client-side fallback:', e);
      return null;
    }
  }

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

    const data = await response.json();
    return data;
  }

  // Dashboard and Overview
  async getReportsDashboard(): Promise<ApiResponse<ReportsDashboard>> {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Reports Service: Using token:', token ? 'Token present' : 'No token');
      
      const response = await fetch(`${this.baseUrl}/dashboard/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      console.log('Reports Service: Response status:', response.status);
      
      return this.handleResponse<ReportsDashboard>(response);
    } catch (error) {
      console.error('Reports Service: Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reports dashboard',
      };
    }
  }

  async getReportsMeta(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/meta/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<any>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reports metadata',
      };
    }
  }

  // System Reports Export Methods
  async exportSystemReport(
    reportType: 'production' | 'machines' | 'maintenance' | 'quality' | 'allocation' | 'analytics',
    format: 'pdf' | 'excel',
    filters?: ReportFilter
  ): Promise<Blob> {
    const endpoint = reportType === 'production' ? 'workflow' : reportType;
    const url = new URL(`${this.baseUrl}/${endpoint}/${format}/`);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        ...(localStorage.getItem('access_token') && { 
          'Authorization': `Bearer ${localStorage.getItem('access_token')}` 
        }),
      },
    });

    if (!response.ok) {
      // Try to get response body for better error details
      let bodyText: string;
      try {
        bodyText = await response.text();
      } catch (e) {
        bodyText = '<unable to read response body>';
      }

      const msg = `Export failed: HTTP ${response.status} ${response.statusText} - ${bodyText}`;
      console.error('ReportsService.exportSystemReport error response:', msg);
      throw new Error(msg);
    }

    try {
      return await response.blob();
    } catch (err) {
      console.error('ReportsService.exportSystemReport failed to read blob:', err);
      throw err;
    }
  }

  /**
   * Try to export a system report via backend Excel/PDF endpoints.
   * If backend Excel generation fails (500) and `format==='excel'`, attempt to
   * fetch the JSON version and generate the Excel client-side as a fallback.
   * Returns a Blob when the backend provided a file; returns null when
   * the client-side fallback handled the download directly.
   */
  async exportSystemReportWithFallback(
    reportType: 'production' | 'machines' | 'maintenance' | 'quality' | 'allocation' | 'analytics',
    format: 'pdf' | 'excel',
    filters?: ReportFilter
  ): Promise<Blob | null> {
    try {
      // First attempt server-generated file
      const blob = await this.exportSystemReport(reportType, format, filters as any);
      return blob;
    } catch (err) {
      // If server Excel failed, try JSON + client-side export
      const isServerError = err instanceof Error && /HTTP 5\d{2}/.test(err.message || '');
      if (format === 'excel' && isServerError) {
        try {
          // Map report types to backend data endpoints (existing JSON APIs)
          const apiRoot = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
          const dataEndpointMap: Record<string, string> = {
            production: `${apiRoot}/workflow/batches/`,
            machines: `${apiRoot}/machines/machines/`,
            maintenance: `${apiRoot}/maintenance/`,
            quality: `${apiRoot}/quality/`,
            allocation: `${apiRoot}/allocation/`,
            analytics: `${apiRoot}/analytics/`
          };

          const dataUrlBase = dataEndpointMap[reportType];
          if (!dataUrlBase) throw new Error('No JSON fallback endpoint mapped for this report type');
          const url = new URL(dataUrlBase);
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                url.searchParams.append(key, value.toString());
              }
            });
          }

          const response = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getAuthHeaders()
          });

          if (!response.ok) {
            const bodyText = await response.text().catch(() => '<unable to read>');
            throw new Error(`JSON fallback failed: HTTP ${response.status} ${response.statusText} - ${bodyText}`);
          }

          const json = await response.json();

          // Determine data payload shape
          let data: any[] = [];
          if (Array.isArray(json)) {
            data = json;
          } else if (json && json.data) {
            data = Array.isArray(json.data) ? json.data : [json.data];
          } else if (json && typeof json === 'object') {
            // Attempt to find a top-level array
            const arr = Object.values(json).find(v => Array.isArray(v));
            data = arr || [];
          }

          if (!data || data.length === 0) {
            throw new Error('No data returned from JSON fallback to generate Excel client-side');
          }

          const exportSvc = await this.loadExportService();
          if (!exportSvc) throw new Error('Client export service unavailable for fallback export');

          // Try to generate Excel client-side and let exportService handle download/fallbacks
          await exportSvc.exportData(data, 'excel', { filename: `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx` });

          // Indicate fallback handled download; caller should not attempt its own download
          return null;
        } catch (fallbackErr) {
          console.error('ReportsService: JSON fallback failed:', fallbackErr);
          // Re-throw original error to surface original server message
          throw err;
        }
      }

      // Not a handled case; rethrow
      throw err;
    }
  }

  // User Reports Methods
  async getUserDirectory(filters?: ReportFilter): Promise<ApiResponse<UserDirectoryData>> {
    try {
      const url = new URL(`${this.baseUrl}/users/directory/`);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<UserDirectoryData>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user directory',
      };
    }
  }

  async getRoleDistribution(): Promise<ApiResponse<RoleDistributionData>> {
    try {
      const response = await fetch(`${this.baseUrl}/users/roles/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<RoleDistributionData>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch role distribution',
      };
    }
  }

  async getLoginActivity(filters?: ReportFilter): Promise<ApiResponse<LoginActivityData>> {
    try {
      const url = new URL(`${this.baseUrl}/users/activity/`);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<LoginActivityData>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch login activity',
      };
    }
  }

  async getUserPerformance(filters?: ReportFilter): Promise<ApiResponse<UserPerformanceData>> {
    try {
      const url = new URL(`${this.baseUrl}/users/performance/`);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<UserPerformanceData>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user performance',
      };
    }
  }

  async getUserAuditTrail(filters?: ReportFilter): Promise<ApiResponse<any>> {
    try {
      const url = new URL(`${this.baseUrl}/users/audit/`);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<any>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch audit trail',
      };
    }
  }

  // Health Check
  async getReportsHealth(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/health/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<any>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check reports health',
      };
    }
  }

  // Utility Methods
  getFilterOptions() {
    return {
      dateRanges: [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'Last 7 days', value: 'last_7_days' },
        { label: 'Last 30 days', value: 'last_30_days' },
        { label: 'Last 3 months', value: 'last_quarter' },
        { label: 'Last year', value: 'last_year' },
        { label: 'Custom', value: 'custom' },
      ],
      userRoles: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Supervisor', value: 'supervisor' },
        { label: 'Technician', value: 'technician' },
        { label: 'Quality Inspector', value: 'inspector' },
        { label: 'Data Analyst', value: 'analyst' },
      ],
      userStatuses: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Pending', value: 'pending' },
      ],
      exportFormats: [
        { label: 'PDF Document', value: 'pdf', icon: '📄' },
        { label: 'Excel Spreadsheet', value: 'excel', icon: '📊' },
        { label: 'CSV Data', value: 'csv', icon: '📋' },
      ],
    };
  }
}

export const reportsService = new ReportsService();
