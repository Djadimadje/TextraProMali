/**
 * Allocation Service for TexPro AI
 * Handles resource allocation API operations
 */

import { BASE_URL } from '../lib/constants';

// Types matching backend models
export interface WorkforceAllocation {
  id: string;
  batch: string;
  user: string;
  role_assigned: 'operator' | 'maintenance' | 'qc' | 'supervisor' | 'assistant';
  allocated_by: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields
  user_name: string;
  batch_number: string;
  allocated_by_name: string;
  duration_days: number | null;
  role_display: string;
}

export interface MaterialAllocation {
  id: string;
  batch: string;
  material_name: string;
  quantity: number;
  unit: 'kg' | 'meters' | 'liters' | 'pieces' | 'rolls' | 'tons';
  allocated_by: string;
  cost_per_unit: number | null;
  supplier: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  batch_number: string;
  allocated_by_name: string;
  total_cost: number | null;
  unit_display: string;
}

export interface AllocationSummary {
  id: string;
  batch: string;
  total_workforce: number;
  total_material_cost: number;
  material_count: number;
  last_updated: string;
  // Computed fields
  batch_number: string;
  batch_product_type: string;
}

export interface WorkforceAllocationCreateData {
  batch: string;
  user: string;
  role_assigned?: string;
  start_date?: string;
  end_date?: string;
}

export interface MaterialAllocationCreateData {
  batch: string;
  material_name: string;
  quantity: number;
  unit: string;
  cost_per_unit?: number;
  supplier?: string;
}

export interface AllocationConflict {
  type: 'same_batch' | 'date_overlap';
  message: string;
  allocation_id: string;
  role?: string;
  conflicting_dates?: string;
}

export interface ConflictCheckResult {
  has_conflicts: boolean;
  conflicts: AllocationConflict[];
  can_proceed: boolean;
}

export interface AllocationStats {
  total_allocations: number;
  unique_workers: number;
  unique_batches: number;
  average_duration_days: number;
  role_breakdown: Array<{ role_assigned: string; count: number }>;
  allocations_with_dates: number;
}

export interface MaterialStats {
  total_allocations: number;
  unique_materials: number;
  unique_batches: number;
  material_breakdown: Array<{ 
    material_name: string; 
    count: number; 
    total_quantity: number; 
  }>;
}

export interface AllocationReport {
  batch_info: {
    batch_number: string;
    product_type: string;
    current_stage: string;
    created_at: string;
  };
  workforce_summary: {
    total_workers: number;
    by_role: Record<string, Array<{
      user: string;
      start_date: string | null;
      end_date: string | null;
      duration_days: number | null;
      allocated_by: string | null;
    }>>;
    estimated_cost: number;
  };
  material_summary: {
    total_materials: number;
    total_cost: number;
    by_type: Record<string, {
      total_quantity: number;
      unit: string;
      allocations: Array<{
        quantity: number;
        cost_per_unit: number | null;
        total_cost: number | null;
        supplier: string;
        allocated_by: string | null;
        created_at: string;
      }>;
      total_cost: number;
    }>;
  };
  allocation_efficiency: {
    workforce_utilization: {
      utilization_rate: number;
      average_duration: number;
      total_allocations: number;
    };
    material_efficiency: {
      supplier_diversity: number;
      average_cost_per_allocation: number;
      total_allocations: number;
      costed_allocations: number;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class AllocationService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          data: null as any,
          message: data.detail || data.message || 'API request failed',
          errors: data.errors || data
        };
      }

      return {
        success: true,
        data: data,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Workforce Allocation Methods
  async getWorkforceAllocations(params?: {
    batch?: string;
    user?: string;
    role_assigned?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<WorkforceAllocation>>> {
    const url = new URL(`${BASE_URL}/api/v1/allocation/workforce/`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<PaginatedResponse<WorkforceAllocation>>(response);
  }

  async getWorkforceAllocation(id: string): Promise<ApiResponse<WorkforceAllocation>> {
    const response = await fetch(`${BASE_URL}/api/v1/allocation/workforce/${id}/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<WorkforceAllocation>(response);
  }

  async createWorkforceAllocation(data: WorkforceAllocationCreateData): Promise<ApiResponse<WorkforceAllocation>> {
    const response = await fetch(`${BASE_URL}/api/v1/allocation/workforce/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<WorkforceAllocation>(response);
  }

  async updateWorkforceAllocation(id: string, data: Partial<WorkforceAllocationCreateData>): Promise<ApiResponse<WorkforceAllocation>> {
    const response = await fetch(`${BASE_URL}/api/v1/allocation/workforce/${id}/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<WorkforceAllocation>(response);
  }

  async deleteWorkforceAllocation(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${BASE_URL}/api/v1/allocation/workforce/${id}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<void>(response);
  }

  async checkWorkforceConflicts(id: string): Promise<ApiResponse<ConflictCheckResult>> {
    const response = await fetch(`${BASE_URL}/api/v1/allocation/workforce/${id}/check_conflicts/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<ConflictCheckResult>(response);
  }

  async getWorkforceStats(): Promise<ApiResponse<AllocationStats>> {
    const response = await fetch(`${BASE_URL}/api/v1/allocation/workforce/statistics/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<AllocationStats>(response);
  }

  // Material Allocation Methods
  async getMaterialAllocations(params?: {
    batch?: string;
    material_name?: string;
    unit?: string;
    supplier?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<MaterialAllocation>>> {
    const url = new URL(`${BASE_URL}/api/v1/allocation/materials/`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<PaginatedResponse<MaterialAllocation>>(response);
  }

  async getMaterialAllocation(id: string): Promise<ApiResponse<MaterialAllocation>> {
    const response = await fetch(`${BASE_URL}/api/v1/allocation/materials/${id}/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<MaterialAllocation>(response);
  }

  async createMaterialAllocation(data: MaterialAllocationCreateData): Promise<ApiResponse<MaterialAllocation>> {
    const response = await fetch(`${BASE_URL}/api/v1/allocation/materials/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<MaterialAllocation>(response);
  }

  async updateMaterialAllocation(id: string, data: Partial<MaterialAllocationCreateData>): Promise<ApiResponse<MaterialAllocation>> {
    const response = await fetch(`${BASE_URL}/api/v1/allocation/materials/${id}/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<MaterialAllocation>(response);
  }

  async deleteMaterialAllocation(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${BASE_URL}/api/v1/allocation/materials/${id}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<void>(response);
  }

  async getMaterialStats(): Promise<ApiResponse<MaterialStats>> {
    const response = await fetch(`${BASE_URL}/api/v1/allocation/materials/statistics/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<MaterialStats>(response);
  }

  // Report Methods
  async getBatchReport(batchId: string, params?: {
    include_details?: boolean;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<AllocationReport>> {
    const requestData = {
      batch_id: batchId,
      ...params
    };

    const response = await fetch(`${BASE_URL}/api/v1/allocation/reports/batch_report/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestData),
    });

    return this.handleResponse<AllocationReport>(response);
  }

  // Utility Methods
  getWorkforceRoleChoices() {
    return [
      { value: 'operator', label: 'Operator' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'qc', label: 'Quality Control' },
      { value: 'supervisor', label: 'Supervisor' },
      { value: 'assistant', label: 'Assistant' }
    ];
  }

  getMaterialUnitChoices() {
    return [
      { value: 'kg', label: 'Kilograms' },
      { value: 'meters', label: 'Meters' },
      { value: 'liters', label: 'Liters' },
      { value: 'pieces', label: 'Pieces' },
      { value: 'rolls', label: 'Rolls' },
      { value: 'tons', label: 'Tons' }
    ];
  }
}

export const allocationService = new AllocationService();
export default allocationService;
