'use client';
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { MachineFilters as ApiMachineFilters } from '@/types/api';
import machineService from '../../src/services/machineService';
import { 
  Activity, 
  Cpu, 
  Gauge, 
  Thermometer, 
  Zap, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Machine page filters interface
interface MachinePageFilters {
  machineTypes: string[];
  departments: string[];
  statusFilter: 'all' | 'running' | 'maintenance' | 'idle' | 'error';
  timeRange: '1h' | '8h' | '24h' | '7d' | '30d';
  sortBy: 'name' | 'efficiency' | 'uptime' | 'alerts';
  sortOrder: 'asc' | 'desc';
}

interface MachineMetric {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'maintenance' | 'idle' | 'error';
  efficiency: number;
  uptime: number;
  temperature: number;
  power_consumption: number;
  speed: number;
  last_maintenance: string;
  next_maintenance: string;
  alerts: number;
  production_rate: number;
  quality_score: number;
}

interface MachineMetricsGridProps {
  filters: MachinePageFilters;
}

const MachineMetricsGrid: React.FC<MachineMetricsGridProps> = ({ filters }) => {
  const [machines, setMachines] = useState<MachineMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMachine, setExpandedMachine] = useState<string | null>(null);

  useEffect(() => {
    loadMachineMetrics();
  }, [filters]);

  useEffect(() => {
    const handleRefresh = () => {
      loadMachineMetrics();
    };
    
    window.addEventListener('machinesRefresh', handleRefresh);
    return () => window.removeEventListener('machinesRefresh', handleRefresh);
  }, []);

  const loadMachineMetrics = async () => {
    setLoading(true);
    
    try {
      // Convert page filters to API filters
      let operationalStatus: string | undefined;
      if (filters.statusFilter !== 'all') {
        // Map component statusFilter to API operational_status
        switch (filters.statusFilter) {
          case 'running':
            operationalStatus = 'running';
            break;
          case 'maintenance':
            operationalStatus = 'maintenance';
            break;
          case 'idle':
            operationalStatus = 'idle';
            break;
          case 'error':
            operationalStatus = 'breakdown'; // Map error to breakdown
            break;
        }
      }

      const apiFilters: ApiMachineFilters = {
        operational_status: operationalStatus,
        machine_type: filters.machineTypes.length > 0 ? filters.machineTypes.join(',') : undefined,
      };

      // Get real machine data
      const machinesResponse = await machineService.getMachines(apiFilters);
      const realMachines = machinesResponse.results || [];

      // Transform API machine data to component format
      const transformedMachines: MachineMetric[] = realMachines.map(machine => {
        // Map operational_status to component status
        let componentStatus: 'active' | 'maintenance' | 'idle' | 'error';
        switch (machine.operational_status) {
          case 'running':
            componentStatus = 'active';
            break;
          case 'maintenance':
            componentStatus = 'maintenance';
            break;
          case 'idle':
            componentStatus = 'idle';
            break;
          case 'breakdown':
          case 'offline':
            componentStatus = 'error';
            break;
          default:
            componentStatus = 'idle';
        }

        // Get machine type as string
        const machineType = typeof machine.machine_type === 'object' 
          ? machine.machine_type.name 
          : machine.machine_type?.toString() || 'Unknown';

        return {
          id: machine.id,
          name: machine.name,
          type: machineType,
          status: componentStatus,
          efficiency: 85, // Default value since not in API
          uptime: Math.round((machine.total_operating_hours / (machine.total_operating_hours + machine.hours_since_maintenance)) * 100) || 90,
          temperature: 70, // Default value since not in API
          power_consumption: machine.rated_power || 200,
          speed: machine.rated_capacity || 1000,
          last_maintenance: machine.last_maintenance_date || '2024-01-15',
          next_maintenance: machine.next_maintenance_date || '2024-02-15',
          alerts: 0, // Default value since not in API
          production_rate: machine.rated_capacity || 800,
          quality_score: 95 // Default value since not in API
        };
      });

      // Apply local filtering and sorting that the API doesn't support
      let filteredMachines = transformedMachines;

      // Department filtering (client-side for now)
      if (filters.departments.length > 0) {
        filteredMachines = filteredMachines.filter(machine => 
          filters.departments.some(dept => machine.name.toLowerCase().includes(dept.toLowerCase()))
        );
      }

      // Apply sorting
      filteredMachines.sort((a, b) => {
        const getValue = (machine: MachineMetric, field: string) => {
          switch (field) {
            case 'name': return machine.name;
            case 'efficiency': return machine.efficiency;
            case 'uptime': return machine.uptime;
            case 'alerts': return machine.alerts;
            case 'status': return machine.status;
            default: return machine.name;
          }
        };

        const aVal = getValue(a, filters.sortBy);
        const bVal = getValue(b, filters.sortBy);

        if (filters.sortOrder === 'desc') {
          return aVal > bVal ? -1 : 1;
        }
        return aVal < bVal ? -1 : 1;
      });

      setMachines(filteredMachines);
    } catch (error) {
      console.error('Error loading machine metrics:', error);
      // Fallback to empty array if API fails
      setMachines([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      active: <CheckCircle className="text-green-600" size={16} />,
      maintenance: <AlertTriangle className="text-yellow-600" size={16} />,
      idle: <Activity className="text-gray-600" size={16} />,
      error: <AlertTriangle className="text-red-600" size={16} />
    };
    return icons[status as keyof typeof icons] || <Activity className="text-gray-600" size={16} />;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'success' as const,
      maintenance: 'warning' as const,
      idle: 'default' as const,
      error: 'danger' as const
    };
    return variants[status as keyof typeof variants] || 'default';
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTemperatureStatus = (temp: number, machineType: string) => {
    // Different temperature thresholds for different machine types
    const thresholds = {
      'Welding': { normal: 200, warning: 250, critical: 300 },
      'Assembly': { normal: 80, warning: 100, critical: 120 },
      'Machining': { normal: 85, warning: 105, critical: 125 },
      'default': { normal: 70, warning: 85, critical: 100 }
    };

    const threshold = thresholds[machineType as keyof typeof thresholds] || thresholds.default;
    
    if (temp > threshold.critical) return { color: 'text-red-600', status: 'Critical' };
    if (temp > threshold.warning) return { color: 'text-yellow-600', status: 'Warning' };
    return { color: 'text-green-600', status: 'Normal' };
  };

  const formatLastMaintenance = (date: string) => {
    const daysDiff = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 3600 * 24));
    return `${daysDiff} days ago`;
  };

  const formatNextMaintenance = (date: string) => {
    const daysDiff = Math.floor((new Date(date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return `${daysDiff} days`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} variant="elevated" padding="lg">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-3 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Machine Metrics</h2>
          <p className="text-gray-600 mt-1">
            Detailed performance metrics for {machines.length} machines
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" size="sm">
            <Activity size={12} />
            {machines.filter(m => m.status === 'active').length} Active
          </Badge>
        </div>
      </div>

      {/* Machine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {machines.map((machine) => {
          const tempStatus = getTemperatureStatus(machine.temperature, machine.type);
          const isExpanded = expandedMachine === machine.id;
          
          return (
            <Card 
              key={machine.id} 
              variant="elevated" 
              padding="lg"
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setExpandedMachine(isExpanded ? null : machine.id)}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{machine.name}</h3>
                  <p className="text-sm text-gray-600">{machine.id} • {machine.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  {machine.alerts > 0 && (
                    <Badge variant="warning" size="sm">
                      {machine.alerts}
                    </Badge>
                  )}
                  <Badge variant={getStatusBadge(machine.status)} size="sm">
                    {getStatusIcon(machine.status)}
                    {machine.status}
                  </Badge>
                </div>
              </div>

              {/* Primary Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="text-blue-600" size={16} />
                    <span className="text-sm text-gray-600">Efficiency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${getEfficiencyColor(machine.efficiency)}`}>
                      {machine.efficiency}%
                    </span>
                  </div>
                  <ProgressBar 
                    value={machine.efficiency} 
                    size="sm" 
                    variant={machine.efficiency >= 90 ? 'success' : machine.efficiency >= 75 ? 'warning' : 'danger'}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="text-green-600" size={16} />
                    <span className="text-sm text-gray-600">Uptime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">
                      {machine.uptime}%
                    </span>
                  </div>
                  <ProgressBar 
                    value={machine.uptime} 
                    size="sm" 
                    variant={machine.uptime >= 95 ? 'success' : machine.uptime >= 85 ? 'warning' : 'danger'}
                  />
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Thermometer className={tempStatus.color} size={16} />
                  <div>
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="font-medium">{machine.temperature}°C</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Zap className="text-yellow-600" size={16} />
                  <div>
                    <p className="text-sm text-gray-600">Power</p>
                    <p className="font-medium">{machine.power_consumption} kW</p>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t pt-4 space-y-4">
                  {/* Performance Details */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Performance Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Speed:</span>
                        <span className="font-medium ml-2">{machine.speed.toLocaleString()} RPM</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Production:</span>
                        <span className="font-medium ml-2">{machine.production_rate} units/hr</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Quality Score:</span>
                        <span className="font-medium ml-2">{machine.quality_score}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Alerts:</span>
                        <span className={`font-medium ml-2 ${machine.alerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {machine.alerts}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Schedule */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Maintenance Schedule</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Last Service:</span>
                        <span className="font-medium ml-2">{formatLastMaintenance(machine.last_maintenance)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Next Service:</span>
                        <span className={`font-medium ml-2 ${formatNextMaintenance(machine.next_maintenance).includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                          {formatNextMaintenance(machine.next_maintenance)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Temperature Status */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Temperature Status</h4>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={tempStatus.status === 'Critical' ? 'danger' : tempStatus.status === 'Warning' ? 'warning' : 'success'} 
                        size="sm"
                      >
                        {tempStatus.status}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Operating within {tempStatus.status.toLowerCase()} range
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Expand Indicator */}
              <div className="mt-4 pt-2 border-t border-gray-100">
                <div className="flex justify-center">
                  <span className="text-xs text-gray-400">
                    {isExpanded ? 'Click to collapse' : 'Click for details'}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {machines.length === 0 && (
        <Card variant="elevated" padding="lg" className="text-center">
          <div className="flex flex-col items-center gap-4">
            <Activity className="text-gray-400" size={48} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Machines Found</h3>
              <p className="text-gray-600">
                No machines match your current filter criteria. Try adjusting your filters.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MachineMetricsGrid;
