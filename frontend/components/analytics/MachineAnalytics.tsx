'use client';
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import apiService from '../../src/services/api';
import { AnalyticsFilters } from '../../src/app/(dashboard)/analyst/analytics/page';
import { Settings, Activity, AlertTriangle, CheckCircle, Wrench, Zap } from 'lucide-react';

interface MachineData {
  fleet_overview: {
    total_machines: number;
    active_machines: number;
    maintenance_needed: number;
    average_utilization: number;
    total_alerts: number;
  };
  machine_details: Array<{
    machine_id: string;
    machine_name: string;
    type: string;
    status: 'running' | 'maintenance' | 'idle' | 'error';
    utilization: number;
    efficiency: number;
    uptime: number;
    temperature: number;
    vibration: number;
    last_maintenance: string;
    next_maintenance: string;
    alerts: number;
  }>;
  performance_trends: {
    utilization_trend: 'up' | 'down' | 'stable';
    efficiency_trend: 'up' | 'down' | 'stable';
    maintenance_cost: number;
    energy_consumption: number;
  };
}

interface MachineAnalyticsProps {
  filters: AnalyticsFilters;
}

const MachineAnalytics: React.FC<MachineAnalyticsProps> = ({ filters }) => {
  const [data, setData] = useState<MachineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  useEffect(() => {
    loadMachineData();
  }, [filters]);

  useEffect(() => {
    const handleRefresh = () => {
      loadMachineData();
    };
    
    window.addEventListener('analyticsRefresh', handleRefresh);
    return () => window.removeEventListener('analyticsRefresh', handleRefresh);
  }, []);

  const loadMachineData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock machine data
    const mockData: MachineData = {
      fleet_overview: {
        total_machines: 8,
        active_machines: 7,
        maintenance_needed: 1,
        average_utilization: 87.3,
        total_alerts: 3
      },
      machine_details: [
        {
          machine_id: 'GM01',
          machine_name: 'Ginning Machine 1',
          type: 'Ginning',
          status: 'running',
          utilization: 92.3,
          efficiency: 94.7,
          uptime: 96.5,
          temperature: 68.2,
          vibration: 2.1,
          last_maintenance: '2024-08-15',
          next_maintenance: '2024-09-15',
          alerts: 0
        },
        {
          machine_id: 'GM02',
          machine_name: 'Ginning Machine 2',
          type: 'Ginning',
          status: 'maintenance',
          utilization: 0,
          efficiency: 0,
          uptime: 87.3,
          temperature: 0,
          vibration: 0,
          last_maintenance: '2024-08-20',
          next_maintenance: '2024-08-26',
          alerts: 2
        },
        {
          machine_id: 'CM01',
          machine_name: 'Carding Machine 1',
          type: 'Carding',
          status: 'running',
          utilization: 89.7,
          efficiency: 91.8,
          uptime: 98.1,
          temperature: 72.5,
          vibration: 1.8,
          last_maintenance: '2024-08-10',
          next_maintenance: '2024-09-10',
          alerts: 0
        },
        {
          machine_id: 'CM02',
          machine_name: 'Carding Machine 2',
          type: 'Carding',
          status: 'running',
          utilization: 85.4,
          efficiency: 88.9,
          uptime: 94.7,
          temperature: 71.8,
          vibration: 2.3,
          last_maintenance: '2024-08-12',
          next_maintenance: '2024-09-12',
          alerts: 1
        },
        {
          machine_id: 'SM01',
          machine_name: 'Spinning Machine 1',
          type: 'Spinning',
          status: 'running',
          utilization: 91.2,
          efficiency: 93.4,
          uptime: 97.2,
          temperature: 69.9,
          vibration: 1.9,
          last_maintenance: '2024-08-18',
          next_maintenance: '2024-09-18',
          alerts: 0
        },
        {
          machine_id: 'SM02',
          machine_name: 'Spinning Machine 2',
          type: 'Spinning',
          status: 'running',
          utilization: 88.6,
          efficiency: 90.1,
          uptime: 95.8,
          temperature: 70.3,
          vibration: 2.0,
          last_maintenance: '2024-08-16',
          next_maintenance: '2024-09-16',
          alerts: 0
        },
        {
          machine_id: 'WL01',
          machine_name: 'Weaving Loom 1',
          type: 'Weaving',
          status: 'running',
          utilization: 84.7,
          efficiency: 87.2,
          uptime: 93.4,
          temperature: 66.5,
          vibration: 2.5,
          last_maintenance: '2024-08-14',
          next_maintenance: '2024-09-14',
          alerts: 0
        },
        {
          machine_id: 'WL02',
          machine_name: 'Weaving Loom 2',
          type: 'Weaving',
          status: 'idle',
          utilization: 0,
          efficiency: 0,
          uptime: 99.1,
          temperature: 24.5,
          vibration: 0,
          last_maintenance: '2024-08-22',
          next_maintenance: '2024-09-22',
          alerts: 0
        }
      ],
      performance_trends: {
        utilization_trend: 'up',
        efficiency_trend: 'stable',
        maintenance_cost: 15420,
        energy_consumption: 2847.6
      }
    };
    
    setData(mockData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} variant="elevated" padding="lg">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      running: 'success' as const,
      maintenance: 'warning' as const,
      idle: 'default' as const,
      error: 'danger' as const
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      running: <CheckCircle size={16} />,
      maintenance: <Wrench size={16} />,
      idle: <Activity size={16} />,
      error: <AlertTriangle size={16} />
    };
    return icons[status as keyof typeof icons] || <Settings size={16} />;
  };

  const selectedMachineData = selectedMachine 
    ? data.machine_details.find(m => m.machine_id === selectedMachine)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Machine Analytics</h1>
          <p className="text-gray-600 mt-1">
            Real-time machine performance and predictive maintenance insights
          </p>
        </div>
      </div>

      {/* Fleet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Machines</p>
              <p className="text-xl font-bold text-gray-900">
                {data.fleet_overview.total_machines}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-xl font-bold text-gray-900">
                {data.fleet_overview.active_machines}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Wrench className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Maintenance</p>
              <p className="text-xl font-bold text-gray-900">
                {data.fleet_overview.maintenance_needed}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Utilization</p>
              <p className="text-xl font-bold text-gray-900">
                {data.fleet_overview.average_utilization}%
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-xl font-bold text-gray-900">
                {data.fleet_overview.total_alerts}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine List */}
        <div className="lg:col-span-2">
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🏭 Machine Fleet Status
            </h3>
            <div className="space-y-3">
              {data.machine_details.map((machine) => (
                <div 
                  key={machine.machine_id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMachine === machine.machine_id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMachine(machine.machine_id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{machine.machine_name}</h4>
                      <p className="text-sm text-gray-600">{machine.type} • ID: {machine.machine_id}</p>
                    </div>
                    <Badge variant={getStatusColor(machine.status)} size="sm">
                      {getStatusIcon(machine.status)}
                      {machine.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Utilization</p>
                      <p className="font-semibold text-gray-900">{machine.utilization}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Efficiency</p>
                      <p className="font-semibold text-gray-900">{machine.efficiency}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Uptime</p>
                      <p className="font-semibold text-gray-900">{machine.uptime}%</p>
                    </div>
                  </div>

                  {machine.status === 'running' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        <div>Temperature: {machine.temperature}°C</div>
                        <div>Vibration: {machine.vibration} Hz</div>
                      </div>
                    </div>
                  )}

                  {machine.alerts > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      ⚠️ {machine.alerts} active alert{machine.alerts > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Machine Details */}
        <div>
          {selectedMachineData ? (
            <Card variant="elevated" padding="lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedMachineData.machine_name}
                  </h3>
                  <p className="text-sm text-gray-600">Detailed Analytics</p>
                </div>
                <Badge variant={getStatusColor(selectedMachineData.status)} size="sm">
                  {getStatusIcon(selectedMachineData.status)}
                  {selectedMachineData.status}
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Performance Metrics */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Utilization</span>
                        <span className="text-sm text-gray-600">{selectedMachineData.utilization}%</span>
                      </div>
                      <ProgressBar
                        value={selectedMachineData.utilization}
                        variant={selectedMachineData.utilization >= 85 ? 'success' : 'warning'}
                        size="sm"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Efficiency</span>
                        <span className="text-sm text-gray-600">{selectedMachineData.efficiency}%</span>
                      </div>
                      <ProgressBar
                        value={selectedMachineData.efficiency}
                        variant={selectedMachineData.efficiency >= 90 ? 'success' : 'warning'}
                        size="sm"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Uptime</span>
                        <span className="text-sm text-gray-600">{selectedMachineData.uptime}%</span>
                      </div>
                      <ProgressBar
                        value={selectedMachineData.uptime}
                        variant={selectedMachineData.uptime >= 95 ? 'success' : 'warning'}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Sensor Data */}
                {selectedMachineData.status === 'running' && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Live Sensor Data</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg text-center">
                        <p className="text-lg font-bold text-blue-900">
                          {selectedMachineData.temperature}°C
                        </p>
                        <p className="text-xs text-blue-700">Temperature</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg text-center">
                        <p className="text-lg font-bold text-purple-900">
                          {selectedMachineData.vibration} Hz
                        </p>
                        <p className="text-xs text-purple-700">Vibration</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Maintenance Schedule */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Maintenance Schedule</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Maintenance:</span>
                      <span className="text-gray-900">{selectedMachineData.last_maintenance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Maintenance:</span>
                      <span className="text-gray-900">{selectedMachineData.next_maintenance}</span>
                    </div>
                  </div>
                  
                  {selectedMachineData.next_maintenance && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                      📅 Scheduled maintenance in {Math.ceil((new Date(selectedMachineData.next_maintenance).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  )}
                </div>

                {/* Alerts */}
                {selectedMachineData.alerts > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Active Alerts</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm font-medium text-yellow-900">Vibration Alert</p>
                        <p className="text-xs text-yellow-700">Vibration levels slightly elevated</p>
                      </div>
                      {selectedMachineData.alerts > 1 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm font-medium text-red-900">Maintenance Due</p>
                          <p className="text-xs text-red-700">Scheduled maintenance overdue</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card variant="elevated" padding="lg">
              <div className="text-center py-8">
                <Settings className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Machine
                </h3>
                <p className="text-gray-600">
                  Click on a machine from the list to view detailed analytics and sensor data.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Performance Trends */}
      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Fleet Performance Trends
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Zap className="text-green-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-green-900">
              {data.fleet_overview.average_utilization}%
            </p>
            <p className="text-sm text-green-700">Average Utilization</p>
            <p className="text-xs text-green-600 mt-1">
              {data.performance_trends.utilization_trend === 'up' ? '↗️ Improving' : '➡️ Stable'}
            </p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Activity className="text-blue-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-blue-900">91.2%</p>
            <p className="text-sm text-blue-700">Fleet Efficiency</p>
            <p className="text-xs text-blue-600 mt-1">
              {data.performance_trends.efficiency_trend === 'stable' ? '➡️ Stable' : '↗️ Improving'}
            </p>
          </div>

          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Wrench className="text-yellow-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-yellow-900">
              ${data.performance_trends.maintenance_cost.toLocaleString()}
            </p>
            <p className="text-sm text-yellow-700">Maintenance Cost</p>
            <p className="text-xs text-yellow-600 mt-1">This month</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Zap className="text-purple-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {data.performance_trends.energy_consumption.toLocaleString()}
            </p>
            <p className="text-sm text-purple-700">kWh Consumed</p>
            <p className="text-xs text-purple-600 mt-1">Today</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MachineAnalytics;
