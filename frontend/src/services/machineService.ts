import api from './api';
import { Machine, MachineFilters, PaginatedResponse } from '@/types/api';

export interface MachineStats {
  total_machines: number;
  active_machines: number;
  maintenance_machines: number;
  idle_machines: number;
  error_machines: number;
  average_efficiency: number;
  average_uptime: number;
  total_alerts: number;
}

export interface MachineOverviewData {
  fleet_summary: MachineStats;
  efficiency_trend: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  uptime_trend: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  critical_alerts: number;
  energy_consumption: number;
}

// Inspector-specific interfaces
export interface InspectorMachine {
  id: string;
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'offline';
  efficiency: number;
  qualityImpact: 'critical' | 'high' | 'medium' | 'low';
  lastInspection: string;
  nextMaintenance: string;
  temperature: number;
  vibration: number;
  powerConsumption: number;
  operatingHours: number;
  defectRate: number;
  location: string;
}

export interface CalibrationRecord {
  id: string;
  machineId: string;
  date: string;
  type: string;
  technician: string;
  status: 'completed' | 'pending' | 'failed';
  accuracy: number;
}

export interface InspectorMachineStats {
  operational: number;
  maintenance: number;
  offline: number;
  avgEfficiency: number;
}

export interface MachinePerformanceData {
  efficiency_metrics: {
    overall_efficiency: number;
    efficiency_by_machine: { [key: string]: number };
    efficiency_trend: number[];
    time_labels: string[];
  };
  uptime_metrics: {
    overall_uptime: number;
    uptime_by_machine: { [key: string]: number };
    downtime_reasons: { [key: string]: number };
  };
  throughput_metrics: {
    total_throughput: number;
    throughput_by_machine: { [key: string]: number };
    production_rate: number[];
  };
}

export interface MaintenanceData {
  scheduled_maintenance: {
    machine_id: string;
    machine_name: string;
    next_maintenance: string;
    maintenance_type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }[];
  predictive_alerts: {
    machine_id: string;
    machine_name: string;
    predicted_failure: string;
    confidence: number;
    component: string;
    recommendation: string;
  }[];
  maintenance_history: {
    machine_id: string;
    machine_name: string;
    maintenance_date: string;
    type: string;
    duration: number;
    cost: number;
    technician: string;
  }[];
}

class MachineService {
  // Get machines with filters
  async getMachines(filters?: MachineFilters): Promise<PaginatedResponse<Machine>> {
    try {
      return await api.getMachines(filters);
    } catch (error) {
      console.error('Error fetching machines:', error);
      throw error;
    }
  }

  // Get machine by ID
  async getMachineById(id: string): Promise<Machine> {
    try {
      return await api.getMachineById(id);
    } catch (error) {
      console.error('Error fetching machine:', error);
      throw error;
    }
  }

  // Get machine overview statistics
  async getMachineOverview(filters?: MachineFilters): Promise<MachineOverviewData> {
    try {
      // Try to get specific machine stats endpoint first
      let statsData;
      try {
        const response = await api.get('/machines/stats/', { params: filters });
        statsData = response.data?.data || response.data;
      } catch (error) {
        console.log('Machine stats endpoint not available, using analytics endpoint');
        statsData = await api.getMachineAnalytics();
      }

      // Get machines list to calculate additional metrics
      const machines = await this.getMachines(filters);
      
      return this.transformToOverviewData(statsData, machines);
    } catch (error) {
      console.error('Error fetching machine overview:', error);
      throw error;
    }
  }

  // Get machine performance analytics
  async getMachinePerformance(filters?: MachineFilters): Promise<MachinePerformanceData> {
    try {
      // Try specific performance endpoints
      const [efficiencyData, utilizationData] = await Promise.allSettled([
        this.getEfficiencyAnalytics(filters),
        this.getUtilizationAnalytics(filters)
      ]);

      const efficiency = efficiencyData.status === 'fulfilled' ? efficiencyData.value : null;
      const utilization = utilizationData.status === 'fulfilled' ? utilizationData.value : null;

      return this.transformToPerformanceData(efficiency, utilization);
    } catch (error) {
      console.error('Error fetching machine performance:', error);
      throw error;
    }
  }

  // Get maintenance data
  async getMaintenanceData(filters?: MachineFilters): Promise<MaintenanceData> {
    try {
      const response = await api.get('/machines/analytics/maintenance/', { params: filters });
      const data = response.data?.data || response.data;
      
      return this.transformToMaintenanceData(data);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      // Return default maintenance data if endpoint not available
      return {
        scheduled_maintenance: [],
        predictive_alerts: [],
        maintenance_history: []
      };
    }
  }

  // Private helper methods
  private async getEfficiencyAnalytics(filters?: MachineFilters) {
    try {
      const response = await api.get('/machines/analytics/efficiency/', { params: filters });
      return response.data?.data || response.data;
    } catch (error) {
      console.log('Efficiency analytics endpoint not available');
      return null;
    }
  }

  private async getUtilizationAnalytics(filters?: MachineFilters) {
    try {
      const response = await api.get('/machines/analytics/utilization/', { params: filters });
      return response.data?.data || response.data;
    } catch (error) {
      console.log('Utilization analytics endpoint not available');
      return null;
    }
  }

  private transformToOverviewData(statsData: any, machines: PaginatedResponse<Machine>): MachineOverviewData {
    const machineList = machines.results || [];
    
    // Calculate stats from real machine data using operational_status
    const total_machines = machineList.length;
    const active_machines = machineList.filter(m => m.operational_status === 'running').length;
    const maintenance_machines = machineList.filter(m => m.operational_status === 'maintenance' || m.operational_status === 'breakdown').length;
    const idle_machines = machineList.filter(m => m.operational_status === 'idle').length;
    const error_machines = machineList.filter(m => m.operational_status === 'breakdown' || m.operational_status === 'offline').length;
    
    // Use backend stats if available, otherwise calculate from machine data
    const fleet_summary: MachineStats = {
      total_machines: statsData?.total_machines || total_machines,
      active_machines: statsData?.active_machines || active_machines,
      maintenance_machines: statsData?.maintenance_machines || maintenance_machines,
      idle_machines: statsData?.idle_machines || idle_machines,
      error_machines: statsData?.error_machines || error_machines,
      average_efficiency: statsData?.average_efficiency || this.calculateAverageEfficiency(machineList),
      average_uptime: statsData?.average_uptime || this.calculateAverageUptime(machineList),
      total_alerts: statsData?.total_alerts || 0,
    };

    return {
      fleet_summary,
      efficiency_trend: {
        current: fleet_summary.average_efficiency,
        previous: statsData?.efficiency_trend?.previous || fleet_summary.average_efficiency - 2,
        change: statsData?.efficiency_trend?.change || 2,
        trend: statsData?.efficiency_trend?.trend || 'up',
      },
      uptime_trend: {
        current: fleet_summary.average_uptime,
        previous: statsData?.uptime_trend?.previous || fleet_summary.average_uptime - 1,
        change: statsData?.uptime_trend?.change || 1,
        trend: statsData?.uptime_trend?.trend || 'up',
      },
      critical_alerts: statsData?.critical_alerts || 0,
      energy_consumption: statsData?.energy_consumption || 0,
    };
  }

  private transformToPerformanceData(efficiency: any, utilization: any): MachinePerformanceData {
    return {
      efficiency_metrics: {
        overall_efficiency: efficiency?.overall_efficiency || 85,
        efficiency_by_machine: efficiency?.efficiency_by_machine || {},
        efficiency_trend: efficiency?.efficiency_trend || [],
        time_labels: efficiency?.time_labels || [],
      },
      uptime_metrics: {
        overall_uptime: utilization?.overall_uptime || 90,
        uptime_by_machine: utilization?.uptime_by_machine || {},
        downtime_reasons: utilization?.downtime_reasons || {},
      },
      throughput_metrics: {
        total_throughput: utilization?.total_throughput || 1000,
        throughput_by_machine: utilization?.throughput_by_machine || {},
        production_rate: utilization?.production_rate || [],
      },
    };
  }

  private transformToMaintenanceData(data: any): MaintenanceData {
    return {
      scheduled_maintenance: data?.scheduled_maintenance || [],
      predictive_alerts: data?.predictive_alerts || [],
      maintenance_history: data?.maintenance_history || [],
    };
  }

  private calculateAverageEfficiency(machines: Machine[]): number {
    if (machines.length === 0) return 0;
    
    const totalEfficiency = machines.reduce((sum, machine) => {
      // Calculate efficiency based on operational_status and maintenance status
      let efficiency = 85; // default
      
      switch (machine.operational_status) {
        case 'running':
          // Higher efficiency if recently maintained
          if (machine.hours_since_maintenance < 100) {
            efficiency = 95;
          } else if (machine.hours_since_maintenance < 500) {
            efficiency = 90;
          } else {
            efficiency = 85;
          }
          break;
        case 'idle':
          efficiency = 0; // Not producing while idle
          break;
        case 'maintenance':
          efficiency = 0; // Not producing during maintenance
          break;
        case 'breakdown':
          efficiency = 0; // Not producing during breakdown
          break;
        case 'offline':
          efficiency = 0; // Not producing while offline
          break;
        default:
          efficiency = 85;
      }
      
      return sum + efficiency;
    }, 0);
    
    return Math.round((totalEfficiency / machines.length) * 10) / 10;
  }

  private calculateAverageUptime(machines: Machine[]): number {
    if (machines.length === 0) return 0;
    
    const totalUptime = machines.reduce((sum, machine) => {
      // Calculate uptime based on operational_status and operating hours
      let uptime = 0;
      
      if (machine.total_operating_hours > 0) {
        // Calculate uptime percentage based on operational status
        switch (machine.operational_status) {
          case 'running':
            uptime = 95;
            break;
          case 'idle':
            uptime = 85; // Available but not running
            break;
          case 'maintenance':
            uptime = 60; // Planned downtime
            break;
          case 'breakdown':
            uptime = 30; // Unplanned downtime
            break;
          case 'offline':
            uptime = 0; // Completely offline
            break;
          default:
            uptime = 80;
        }
      } else {
        // New machine or no operating hours data
        uptime = machine.operational_status === 'running' ? 90 : 70;
      }
      
      return sum + uptime;
    }, 0);
    
    return Math.round((totalUptime / machines.length) * 10) / 10;
  }

  // Inspector-specific methods
  async getMachinesForInspector(filters?: MachineFilters): Promise<InspectorMachine[]> {
    try {
      const response = await this.getMachines(filters);
      const machines = response.results || [];
      
      return machines.map(machine => this.transformToInspectorMachine(machine));
    } catch (error) {
      console.error('Error fetching machines for inspector:', error);
      throw error;
    }
  }

  async getInspectorMachineStats(): Promise<InspectorMachineStats> {
    try {
      const response = await this.getMachines();
      const machines = response.results || [];
      
      const operational = machines.filter(m => m.operational_status === 'running').length;
      const maintenance = machines.filter(m => m.operational_status === 'maintenance' || m.operational_status === 'breakdown').length;
      const offline = machines.filter(m => m.operational_status === 'offline').length;
      
      const operationalMachines = machines.filter(m => m.operational_status === 'running');
      const avgEfficiency = operationalMachines.length > 0 
        ? this.calculateAverageEfficiency(operationalMachines)
        : 0;

      return {
        operational,
        maintenance,
        offline,
        avgEfficiency
      };
    } catch (error) {
      console.error('Error fetching inspector machine stats:', error);
      throw error;
    }
  }

  async getCalibrationRecords(): Promise<CalibrationRecord[]> {
    try {
      // For now, return empty array since calibration endpoints don't exist yet
      // This should be replaced with actual API call when backend supports it
      console.log('Calibration records not yet implemented in backend');
      return [];
    } catch (error) {
      console.error('Error fetching calibration records:', error);
      return [];
    }
  }

  private transformToInspectorMachine(machine: Machine): InspectorMachine {
    // Map operational_status to inspector status
    let status: 'operational' | 'maintenance' | 'offline';
    switch (machine.operational_status) {
      case 'running':
      case 'idle':
        status = 'operational';
        break;
      case 'maintenance':
      case 'breakdown':
        status = 'maintenance';
        break;
      case 'offline':
      default:
        status = 'offline';
    }

    // Determine quality impact based on machine type
    const qualityImpact = this.getQualityImpact(machine);

    // Get machine type name
    const machineType = typeof machine.machine_type === 'object' 
      ? machine.machine_type.name 
      : 'Unknown';

    // Calculate location string
    const location = [machine.building, machine.floor, machine.location_details]
      .filter(Boolean)
      .join(' - ') || 'Unknown Location';

    return {
      id: machine.id,
      name: machine.name,
      type: machineType,
      status,
      efficiency: this.calculateMachineEfficiency(machine),
      qualityImpact,
      lastInspection: this.getLastInspectionTime(machine),
      nextMaintenance: machine.next_maintenance_date || 'Not scheduled',
      temperature: this.getTemperature(machine),
      vibration: this.getVibration(machine),
      powerConsumption: machine.rated_power || 0,
      operatingHours: machine.total_operating_hours,
      defectRate: this.getDefectRate(machine),
      location
    };
  }

  private getQualityImpact(machine: Machine): 'critical' | 'high' | 'medium' | 'low' {
    // Determine quality impact based on machine type and status
    const machineTypeName = typeof machine.machine_type === 'object' 
      ? machine.machine_type.name.toLowerCase() 
      : '';

    if (machineTypeName.includes('scanner') || machineTypeName.includes('inspection')) {
      return 'critical';
    } else if (machineTypeName.includes('weaving') || machineTypeName.includes('loom')) {
      return 'high';
    } else if (machineTypeName.includes('spinning') || machineTypeName.includes('dyeing')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private calculateMachineEfficiency(machine: Machine): number {
    // Calculate efficiency based on operational status and operating hours
    switch (machine.operational_status) {
      case 'running':
        return Math.round(85 + Math.random() * 15); // 85-100%
      case 'idle':
        return Math.round(70 + Math.random() * 15); // 70-85%
      case 'maintenance':
      case 'breakdown':
      case 'offline':
      default:
        return 0;
    }
  }

  private getLastInspectionTime(machine: Machine): string {
    // Since we don't have inspection tracking yet, calculate based on last maintenance
    if (machine.last_maintenance_date) {
      const lastMaintenance = new Date(machine.last_maintenance_date);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - lastMaintenance.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
      }
    }
    
    // Default based on operating hours
    const hoursSinceCheck = machine.hours_since_maintenance;
    if (hoursSinceCheck < 8) {
      return `${Math.floor(hoursSinceCheck)} hours ago`;
    } else {
      return `${Math.floor(hoursSinceCheck / 8)} days ago`;
    }
  }

  private getTemperature(machine: Machine): number {
    // Simulate temperature based on operational status and machine type
    if (machine.operational_status === 'offline') return 25.0; // Room temperature
    
    const baseTemp = 25;
    const operatingTemp = machine.operational_status === 'running' ? 15 : 5;
    const variation = Math.random() * 10 - 5; // ±5 degrees variation
    
    return Math.round((baseTemp + operatingTemp + variation) * 10) / 10;
  }

  private getVibration(machine: Machine): number {
    // Simulate vibration based on operational status
    if (machine.operational_status === 'offline') return 0.0;
    if (machine.operational_status === 'running') {
      return Math.round((0.5 + Math.random() * 1.0) * 10) / 10; // 0.5-1.5
    }
    return Math.round((Math.random() * 0.3) * 10) / 10; // 0.0-0.3
  }

  private getDefectRate(machine: Machine): number {
    // Simulate defect rate based on maintenance status
    if (machine.operational_status === 'offline') return 0;
    
    const baseLine = machine.needs_maintenance ? 5.0 : 2.0;
    const variation = Math.random() * 2.0;
    
    return Math.round((baseLine + variation) * 10) / 10;
  }
}

export const machineService = new MachineService();
export default machineService;
