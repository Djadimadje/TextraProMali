// Maintenance Service - Managing machine maintenance and repairs
import { BASE_URL } from '../lib/constants';

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'routine';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  machineId: string;
  machineName: string;
  assignedTechnician: string;
  technicianName: string;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  parts: MaintenancePart[];
  checklist: MaintenanceCheckItem[];
  notes?: string;
  cost?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenancePart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitCost: number;
  supplier?: string;
  isReplaced: boolean;
}

export interface MaintenanceCheckItem {
  id: string;
  description: string;
  isCompleted: boolean;
  result?: 'pass' | 'fail' | 'warning';
  notes?: string;
  completedAt?: string;
}

export interface MaintenanceSchedule {
  id: string;
  machineId: string;
  machineName: string;
  taskType: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  intervalDays: number;
  lastPerformed?: string;
  nextDue: string;
  estimatedDuration: number;
  isActive: boolean;
  checklist: string[];
}

export interface MaintenanceHistory {
  id: string;
  machineId: string;
  taskId: string;
  taskTitle: string;
  type: string;
  completedAt: string;
  technician: string;
  duration: number;
  cost: number;
  partsUsed: number;
  outcome: 'successful' | 'partial' | 'failed';
  notes?: string;
}

class MaintenanceService {
  private baseUrl = `${BASE_URL}/maintenance`;

  // Task Management
  async getTasks(filters?: {
    status?: string;
    type?: string;
    priority?: string;
    machineId?: string;
    technicianId?: string;
    dateRange?: { start: string; end: string };
  }): Promise<MaintenanceTask[]> {
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

    const response = await fetch(`${this.baseUrl}/tasks/?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch maintenance tasks: ${response.statusText}`);
    }

    return response.json();
  }

  async getTaskById(id: string): Promise<MaintenanceTask> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/tasks/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch maintenance task: ${response.statusText}`);
    }

    return response.json();
  }

  async createTask(task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceTask> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/tasks/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error(`Failed to create maintenance task: ${response.statusText}`);
    }

    return response.json();
  }

  async updateTask(id: string, updates: Partial<MaintenanceTask>): Promise<MaintenanceTask> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/tasks/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update maintenance task: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteTask(id: string): Promise<void> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/tasks/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete maintenance task: ${response.statusText}`);
    }
  }

  async startTask(id: string): Promise<MaintenanceTask> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/tasks/${id}/start/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to start maintenance task: ${response.statusText}`);
    }

    return response.json();
  }

  async completeTask(id: string, completionData: {
    notes?: string;
    partsUsed: MaintenancePart[];
    checklistResults: MaintenanceCheckItem[];
    outcome: 'successful' | 'partial' | 'failed';
  }): Promise<MaintenanceTask> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/tasks/${id}/complete/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(completionData),
    });

    if (!response.ok) {
      throw new Error(`Failed to complete maintenance task: ${response.statusText}`);
    }

    return response.json();
  }

  // Schedule Management
  async getSchedules(machineId?: string): Promise<MaintenanceSchedule[]> {
    const token = localStorage.getItem('token');
    const params = machineId ? new URLSearchParams({ machine_id: machineId }) : '';
    
    const response = await fetch(`${this.baseUrl}/schedules/?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch maintenance schedules: ${response.statusText}`);
    }

    return response.json();
  }

  async createSchedule(schedule: Omit<MaintenanceSchedule, 'id'>): Promise<MaintenanceSchedule> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/schedules/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schedule),
    });

    if (!response.ok) {
      throw new Error(`Failed to create maintenance schedule: ${response.statusText}`);
    }

    return response.json();
  }

  async updateSchedule(id: string, updates: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/schedules/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update maintenance schedule: ${response.statusText}`);
    }

    return response.json();
  }

  // History & Analytics
  async getHistory(filters?: {
    machineId?: string;
    dateRange?: { start: string; end: string };
    type?: string;
  }): Promise<MaintenanceHistory[]> {
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

    const response = await fetch(`${this.baseUrl}/history/?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch maintenance history: ${response.statusText}`);
    }

    return response.json();
  }

  async getAnalytics(filters?: {
    dateRange?: { start: string; end: string };
    machineId?: string;
  }): Promise<{
    totalTasks: number;
    completedTasks: number;
    averageDuration: number;
    totalCost: number;
    mttr: number; // Mean Time To Repair
    mtbf: number; // Mean Time Between Failures
    tasksByType: { type: string; count: number; }[];
    costByMonth: { month: string; cost: number; }[];
    efficiencyTrend: { date: string; efficiency: number; }[];
  }> {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    
    if (filters?.dateRange) {
      params.append('start_date', filters.dateRange.start);
      params.append('end_date', filters.dateRange.end);
    }
    if (filters?.machineId) {
      params.append('machine_id', filters.machineId);
    }

    const response = await fetch(`${this.baseUrl}/analytics/?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch maintenance analytics: ${response.statusText}`);
    }

    return response.json();
  }

  // Technician Management
  async getTechnicianWorkload(technicianId: string, dateRange?: { start: string; end: string }): Promise<{
    activeTasks: number;
    scheduledTasks: number;
    hoursAllocated: number;
    efficiency: number;
    tasks: MaintenanceTask[];
  }> {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    
    if (dateRange) {
      params.append('start_date', dateRange.start);
      params.append('end_date', dateRange.end);
    }

    const response = await fetch(`${this.baseUrl}/technicians/${technicianId}/workload/?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch technician workload: ${response.statusText}`);
    }

    return response.json();
  }
}

export const maintenanceService = new MaintenanceService();
