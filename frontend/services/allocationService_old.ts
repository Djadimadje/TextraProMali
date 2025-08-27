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
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  efficiency: number;
  notes?: string;
  createdAt: string;
}

export interface TeamSchedule {
  id: string;
  teamId: string;
  teamName: string;
  shift: 'morning' | 'afternoon' | 'night';
  date: string;
  startTime: string;
  endTime: string;
  members: TeamMember[];
  allocations: ResourceAllocation[];
  status: 'scheduled' | 'active' | 'completed';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  skillLevel: number;
  availability: 'available' | 'busy' | 'unavailable';
}

class AllocationService {
  private baseUrl = `${BASE_URL}/allocation`;

  async getAllocations(filters?: {
    dateRange?: { start: string; end: string };
    machineId?: string;
    operatorId?: string;
    status?: string;
  }): Promise<ResourceAllocation[]> {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'dateRange' && typeof value === 'object' && 'start' in value && 'end' in value) {
            params.append('start_date', value.start);
            params.append('end_date', value.end);
          } else if (typeof value === 'string') {
            params.append(key, value);
          }
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/allocations/?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch allocations: ${response.statusText}`);
    }

    return response.json();
  }

  async createAllocation(allocation: Omit<ResourceAllocation, 'id' | 'createdAt'>): Promise<ResourceAllocation> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/allocations/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(allocation),
    });

    if (!response.ok) {
      throw new Error(`Failed to create allocation: ${response.statusText}`);
    }

    return response.json();
  }

  async getTeamSchedules(filters?: {
    date?: string;
    teamId?: string;
  }): Promise<TeamSchedule[]> {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          params.append(key, value);
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/schedules/?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch team schedules: ${response.statusText}`);
    }

    return response.json();
  }

  async optimizeAllocations(date: string, constraints?: {
    maxHours?: number;
    skillRequirements?: { [key: string]: string };
  }): Promise<{
    recommendations: ResourceAllocation[];
    efficiency: number;
    conflicts: string[];
  }> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/optimize/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, constraints }),
    });

    if (!response.ok) {
      throw new Error(`Failed to optimize allocations: ${response.statusText}`);
    }

    return response.json();
  }
}

export const allocationService = new AllocationService();
