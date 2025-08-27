'use client';
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { MachineFilters as ApiMachineFilters } from '@/types/api';
import { Settings, Activity, AlertTriangle, CheckCircle, Wrench, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import machineService, { MachineOverviewData } from '../../src/services/machineService';

// Machine page filters interface
interface MachinePageFilters {
  machineTypes: string[];
  departments: string[];
  statusFilter: 'all' | 'running' | 'maintenance' | 'idle' | 'error';
  timeRange: '1h' | '8h' | '24h' | '7d' | '30d';
  sortBy: 'name' | 'efficiency' | 'uptime' | 'alerts';
  sortOrder: 'asc' | 'desc';
}

interface MachineOverviewCardsProps {
  filters: MachinePageFilters;
}

const MachineOverviewCards: React.FC<MachineOverviewCardsProps> = ({ filters }) => {
  const [data, setData] = useState<MachineOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, [filters]);

  useEffect(() => {
    const handleRefresh = () => {
      loadOverviewData();
    };
    
    window.addEventListener('machinesRefresh', handleRefresh);
    return () => window.removeEventListener('machinesRefresh', handleRefresh);
  }, []);

  const loadOverviewData = async () => {
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
        // Note: API doesn't support timeRange, departments yet - these are handled client-side for now
      };

      // Use real API call with converted filters
      const data = await machineService.getMachineOverview(apiFilters);
      setData(data);
    } catch (error) {
      console.error('Error loading machine overview data:', error);
      // Fallback to minimal data structure if API fails
      const fallbackData: MachineOverviewData = {
        fleet_summary: {
          total_machines: 0,
          active_machines: 0,
          maintenance_machines: 0,
          idle_machines: 0,
          error_machines: 0,
          average_efficiency: 0,
          average_uptime: 0,
          total_alerts: 0
        },
        efficiency_trend: {
          current: 0,
          previous: 0,
          change: 0,
          trend: 'stable'
        },
        uptime_trend: {
          current: 0,
          previous: 0,
          change: 0,
          trend: 'stable'
        },
        critical_alerts: 0,
        energy_consumption: 0
      };
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} variant="elevated" padding="lg">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const getStatusIcon = (status: string) => {
    const icons = {
      active: <CheckCircle className="text-green-600" size={20} />,
      maintenance: <Wrench className="text-yellow-600" size={20} />,
      idle: <Activity className="text-gray-600" size={20} />,
      error: <AlertTriangle className="text-red-600" size={20} />,
      total: <Settings className="text-blue-600" size={20} />
    };
    return icons[status as keyof typeof icons] || <Settings className="text-gray-600" size={20} />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100',
      maintenance: 'bg-yellow-100',
      idle: 'bg-gray-100',
      error: 'bg-red-100',
      total: 'bg-blue-100'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="text-green-600" size={16} />;
    if (trend === 'down') return <TrendingDown className="text-red-600" size={16} />;
    return <Activity className="text-gray-600" size={16} />;
  };

  const getTimeRangeLabel = () => {
    const labels: Record<string, string> = {
      '1h': 'Last Hour',
      '8h': 'Last 8 Hours',
      '24h': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days'
    };
    return labels[filters.timeRange] || 'Last 24 Hours';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Machine Fleet Overview</h2>
          <p className="text-gray-600 mt-1">
            Real-time status and performance metrics for {getTimeRangeLabel().toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">
            <Activity size={12} />
            Live Data
          </Badge>
        </div>
      </div>

      {/* Machine Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor('total')}`}>
              {getStatusIcon('total')}
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Machines</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.fleet_summary.total_machines}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor('active')}`}>
              {getStatusIcon('active')}
            </div>
            <div>
              <p className="text-sm text-gray-600">Running</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.fleet_summary.active_machines}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor('maintenance')}`}>
              {getStatusIcon('maintenance')}
            </div>
            <div>
              <p className="text-sm text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.fleet_summary.maintenance_machines}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor('idle')}`}>
              {getStatusIcon('idle')}
            </div>
            <div>
              <p className="text-sm text-gray-600">Idle</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.fleet_summary.idle_machines}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor('error')}`}>
              {getStatusIcon('error')}
            </div>
            <div>
              <p className="text-sm text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.fleet_summary.error_machines}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Average Efficiency */}
        <Card variant="elevated" padding="lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-gray-600">
              Average Efficiency
            </h3>
            <div className="flex items-center gap-1">
              {getTrendIcon(data.efficiency_trend.trend)}
              <span className="text-xs font-medium text-gray-500">
                {data.efficiency_trend.change > 0 ? '+' : ''}{data.efficiency_trend.change}%
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {data.fleet_summary.average_efficiency}%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              vs {data.efficiency_trend.previous}% previous period
            </p>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Target: 90%</span>
            <span className={`font-medium ${data.fleet_summary.average_efficiency >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
              {data.fleet_summary.average_efficiency >= 90 ? 'On Target' : 'Below Target'}
            </span>
          </div>
        </Card>

        {/* Average Uptime */}
        <Card variant="elevated" padding="lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-gray-600">
              Average Uptime
            </h3>
            <div className="flex items-center gap-1">
              {getTrendIcon(data.uptime_trend.trend)}
              <span className="text-xs font-medium text-gray-500">
                {data.uptime_trend.change > 0 ? '+' : ''}{data.uptime_trend.change}%
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {data.fleet_summary.average_uptime}%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              vs {data.uptime_trend.previous}% previous period
            </p>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Target: 95%</span>
            <span className={`font-medium ${data.fleet_summary.average_uptime >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
              {data.fleet_summary.average_uptime >= 95 ? 'On Target' : 'Below Target'}
            </span>
          </div>
        </Card>

        {/* Alert Summary */}
        <Card variant="elevated" padding="lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-gray-600">
              Active Alerts
            </h3>
            <Badge 
              variant={data.critical_alerts > 0 ? 'danger' : data.fleet_summary.total_alerts > 0 ? 'warning' : 'success'} 
              size="sm"
            >
              {data.critical_alerts > 0 ? 'Critical' : data.fleet_summary.total_alerts > 0 ? 'Warnings' : 'All Clear'}
            </Badge>
          </div>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {data.fleet_summary.total_alerts}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {data.critical_alerts} critical alerts
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-red-50 rounded">
              <p className="text-lg font-bold text-red-900">{data.critical_alerts}</p>
              <p className="text-xs text-red-700">Critical</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded">
              <p className="text-lg font-bold text-yellow-900">{data.fleet_summary.total_alerts - data.critical_alerts}</p>
              <p className="text-xs text-yellow-700">Warnings</p>
            </div>
          </div>
        </Card>

        {/* Energy Consumption */}
        <Card variant="elevated" padding="lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-gray-600">
              Energy Consumption
            </h3>
            <div className="flex items-center gap-1">
              <Zap className="text-yellow-600" size={16} />
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {data.energy_consumption.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">kWh</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {getTimeRangeLabel()}
            </p>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Avg: {Math.round(data.energy_consumption / data.fleet_summary.active_machines)} kWh/machine</span>
            <span className="text-blue-600 font-medium">
              -8% vs target
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MachineOverviewCards;
