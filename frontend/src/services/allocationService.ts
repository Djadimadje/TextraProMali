import api from './api';

// Minimal exported types used by admin pages
export interface WorkforceAllocation {
  id: string;
  batch?: any;
  user?: any;
  role_assigned?: string;
  start_date?: string;
  end_date?: string;
}

export interface MaterialAllocation {
  id: string;
  batch?: any;
  material_name?: string;
  quantity?: number;
  unit?: string;
}

export interface AllocationStats {
  total_allocations?: number;
  average_workforce_per_batch?: number;
  active_workforce?: number;
}

export interface MaterialStats {
  total_allocations?: number;
  total_material_cost_xof?: number;
}

export interface AllocationService {
  getAllocationAnalytics: () => Promise<any>;
  getWorkforceAllocations: (params?: any) => Promise<any>;
  getMaterialAllocations: (params?: any) => Promise<any>;
  getWorkforceAllocationsList: (params?: any) => Promise<WorkforceAllocation[]>;
  getMaterialAllocationsList: (params?: any) => Promise<MaterialAllocation[]>;
  getWorkforceStats: () => Promise<any>;
  getMaterialStats: () => Promise<any>;
}

class AllocationService {
  async getAllocationAnalytics(): Promise<any> {
    try {
      return await api.getAllocationAnalytics();
    } catch (err) {
      console.error('Failed to fetch allocation analytics', err);
      throw err;
    }
  }

  // Admin-facing raw response (keeps `{ success, data, message }` shape)
  async getWorkforceAllocations(params?: any): Promise<any> {
    try {
      const resp = await api.get('/allocation/workforce/', { params });
      return resp.data;
    } catch (err) {
      console.error('Failed to fetch workforce allocations (raw)', err);
      throw err;
    }
  }

  // Admin-facing raw response
  async getMaterialAllocations(params?: any): Promise<any> {
    try {
      const resp = await api.get('/allocation/materials/', { params });
      return resp.data;
    } catch (err) {
      console.error('Failed to fetch material allocations (raw)', err);
      throw err;
    }
  }

  // Convenience list-oriented helpers for pages that expect arrays
  async getWorkforceAllocationsList(params?: any): Promise<WorkforceAllocation[]> {
    try {
      const resp = await api.get('/allocation/workforce/', { params });
      const data = resp.data;
      if (data?.success && data.data) return data.data.results || data.data;
      if (Array.isArray(data)) return data;
      if (data?.results) return data.results;
      return [] as WorkforceAllocation[];
    } catch (err) {
      console.error('Failed to fetch workforce allocations (list)', err);
      return [] as WorkforceAllocation[];
    }
  }

  async getMaterialAllocationsList(params?: any): Promise<MaterialAllocation[]> {
    try {
      const resp = await api.get('/allocation/materials/', { params });
      const data = resp.data;
      if (data?.success && data.data) return data.data.results || data.data;
      if (Array.isArray(data)) return data;
      if (data?.results) return data.results;
      return [] as MaterialAllocation[];
    } catch (err) {
      console.error('Failed to fetch material allocations (list)', err);
      return [] as MaterialAllocation[];
    }
  }

  async getWorkforceStats(): Promise<any> {
    try {
      const resp = await api.get('/allocation/workforce/statistics/');
      return resp.data;
    } catch (err) {
      console.error('Failed to fetch workforce stats', err);
      throw err;
    }
  }

  async getMaterialStats(): Promise<any> {
    try {
      const resp = await api.get('/allocation/materials/statistics/');
      return resp.data;
    } catch (err) {
      console.error('Failed to fetch material stats', err);
      throw err;
    }
  }
}

export const allocationService: AllocationService = new AllocationService() as unknown as AllocationService;
export default allocationService;
