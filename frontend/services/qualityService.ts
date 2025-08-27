/**
 * Quality Service for TexPro AI
 * Handles quality control API operations
 */

import { BASE_URL } from '../lib/constants';

// Types matching backend models
export interface QualityCheck {
  id: string;
  batch: {
    id: string;
    batch_code: string;
    product_type: string;
    status: string;
  };
  inspector: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  image: string;
  defect_detected: boolean;
  defect_type: string | null;
  severity: 'low' | 'medium' | 'high';
  comments: string;
  status: 'pending' | 'approved' | 'rejected';
  ai_analysis_requested: boolean;
  ai_analysis_result: any;
  ai_confidence_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface QualityCheckCreateData {
  batch: string; // This will be the batch_code, we'll resolve to UUID
  image: File;
  defect_detected: boolean;
  defect_type?: string;
  severity?: 'low' | 'medium' | 'high';
  comments?: string;
  ai_analysis_requested?: boolean;
}

export interface QualityCheckUpdateData {
  defect_detected?: boolean;
  defect_type?: string;
  severity?: 'low' | 'medium' | 'high';
  comments?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface QualityFilters {
  batch?: string;
  inspector?: string;
  defect_detected?: boolean;
  defect_type?: string;
  severity?: string;
  status?: string;
  ai_analysis_requested?: boolean;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export interface QualityStats {
  total_checks: number;
  defects_found: number;
  defect_rate: number;
  approval_rate: number;
  status_breakdown: Array<{ status: string; count: number }>;
  severity_breakdown: Array<{ severity: string; count: number }>;
  defect_type_breakdown: Array<{ defect_type: string; count: number }>;
  generated_at: string;
}

export interface DashboardData {
  total_checks_today: number;
  total_checks_week: number;
  defect_rate_today: number;
  defect_rate_week: number;
  quality_score_trend: any[];
  defect_types_breakdown: any[];
  recent_checks: QualityCheck[];
  top_inspectors: any[];
  alerts: Array<{
    type: string;
    message: string;
    batch_id: string;
    quality_check_id: string;
    created_at: string;
  }>;
}

export interface QualityStandard {
  id: string;
  product_type: string;
  max_defects_per_batch: number;
  critical_defect_tolerance: number;
  quality_threshold: number;
  thread_count_min?: number;
  thread_count_max?: number;
  weight_tolerance: number;
  color_fastness_grade: string;
  created_at: string;
  updated_at: string;
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

class QualityService {
  public baseUrl = `${BASE_URL}/quality`;

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Create authenticated headers for API requests
   */
  private createAuthHeaders(includeContentType: boolean = true): HeadersInit {
    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Create headers for form data uploads
   */
  private createFormDataHeaders(): HeadersInit {
    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Get all quality checks with filtering and pagination
   */
  async getQualityChecks(filters: QualityFilters = {}): Promise<ApiResponse<PaginatedResponse<QualityCheck>>> {
    console.log('Getting quality checks...');
    console.log('Token available:', !!this.getAuthToken());
    console.log('Base URL:', this.baseUrl);
    
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = `${this.baseUrl}/checks/${queryString ? `?${queryString}` : ''}`;
    console.log('Full URL:', url);
    
    try {
      const response = await fetch(url, {
        headers: this.createAuthHeaders(),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Quality checks response:', data);

      return {
        success: true,
        message: 'Quality checks retrieved successfully',
        data: data.results ? data : { results: data, count: data.length, next: null, previous: null }
      };
    } catch (error) {
      console.error('Failed to fetch quality checks:', error);
      throw error;
    }
  }

  /**
   * Get quality statistics
   */
  async getQualityStats(): Promise<ApiResponse<QualityStats>> {
    const response = await fetch(`${this.baseUrl}/checks/statistics/`, {
      headers: this.createAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch quality statistics: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: 'Quality statistics retrieved successfully',
      data
    };
  }

  /**
   * Get dashboard data
   */
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    const response = await fetch(`${this.baseUrl}/checks/dashboard/`, {
      headers: this.createAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch dashboard data: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: 'Dashboard data retrieved successfully',
      data
    };
  }

  /**
   * Create a new quality check
   */
  async createQualityCheck(data: QualityCheckCreateData): Promise<ApiResponse<QualityCheck>> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Use batch_code_input field for batch lookup
      formData.append('batch_code_input', data.batch); // This is the batch_code
      formData.append('image', data.image);
      formData.append('defect_detected', data.defect_detected.toString());
      // Don't set inspector manually - let the backend set it to current user
      
      if (data.defect_type) formData.append('defect_type', data.defect_type);
      if (data.severity) formData.append('severity', data.severity);
      if (data.comments) formData.append('comments', data.comments);
      if (data.ai_analysis_requested !== undefined) {
        formData.append('ai_analysis_requested', data.ai_analysis_requested.toString());
      }

      const response = await fetch(`${this.baseUrl}/checks/`, {
        method: 'POST',
        headers: this.createFormDataHeaders(),
        body: formData,
      });

      console.log('Create quality check response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Create quality check error:', errorData);
        
        // Handle specific error cases
        if (response.status === 400) {
          if (errorData.batch_code_input) {
            throw new Error(`Batch not found: ${errorData.batch_code_input[0] || 'Invalid batch code'}`);
          }
          if (errorData.batch) {
            throw new Error('Invalid batch. Please verify the batch exists.');
          }
          if (errorData.inspector) {
            throw new Error(`Inspector validation error: ${errorData.inspector[0] || 'Invalid inspector'}`);
          }
          if (errorData.image) {
            throw new Error(`Image error: ${errorData.image[0] || 'Invalid image'}`);
          }
          
          // Generic validation errors
          const firstError = Object.values(errorData).flat()[0];
          throw new Error(typeof firstError === 'string' ? firstError : 'Invalid data provided');
        }
        
        throw new Error(errorData.message || `Failed to create quality check: ${response.statusText}`);
      }

      const responseData = await response.json();
      return {
        success: true,
        message: 'Quality check created successfully',
        data: responseData
      };
    } catch (error) {
      console.error('Create quality check error:', error);
      throw error;
    }
  }

  /**
   * Upload image for quality analysis
   */
  async uploadImageForAnalysis(formData: FormData): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseUrl}/checks/upload-analysis/`, {
      method: 'POST',
      headers: this.createFormDataHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to upload image: ${response.statusText}`);
    }

    const responseData = await response.json();
    return {
      success: true,
      message: 'Image analyzed successfully',
      data: responseData
    };
  }

  /**
   * Create a new quality standard
   */
  async createQualityStandard(data: any): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseUrl}/standards/`, {
      method: 'POST',
      headers: this.createAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create quality standard: ${response.statusText}`);
    }

    const responseData = await response.json();
    return {
      success: true,
      message: 'Quality standard created successfully',
      data: responseData
    };
  }

  /**
   * Update a quality standard
   */
  async updateQualityStandard(id: number, data: any): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseUrl}/standards/${id}/`, {
      method: 'PUT',
      headers: this.createAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update quality standard: ${response.statusText}`);
    }

    const responseData = await response.json();
    return {
      success: true,
      message: 'Quality standard updated successfully',
      data: responseData
    };
  }

  /**
   * Get quality standards
   */
  async getQualityStandards(): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseUrl}/standards/`, {
      headers: this.createAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch quality standards: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: 'Quality standards retrieved successfully',
      data: data.results ? data : { results: data || [] }
    };
  }

  /**
   * Delete a quality standard
   */
  async deleteQualityStandard(id: number): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseUrl}/standards/${id}/`, {
      method: 'DELETE',
      headers: this.createAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete quality standard: ${response.statusText}`);
    }

    return {
      success: true,
      message: 'Quality standard deleted successfully',
      data: null
    };
  }

  /**
   * Helper methods for UI
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDefectType(defectType: string): string {
    return defectType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  }
}

// Export singleton instance
export const qualityService = new QualityService();
export default qualityService;
