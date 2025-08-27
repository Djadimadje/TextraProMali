'use client';
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { MachineFilters } from '../../src/app/(dashboard)/analyst/machines/page';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Gauge, 
  Clock,
  ThermometerSun,
  Target,
  AlertTriangle
} from 'lucide-react';

interface PerformanceData {
  machine_id: string;
  machine_name: string;
  hourly_data: {
    time: string;
    efficiency: number;
    production_rate: number;
    power_consumption: number;
    temperature: number;
  }[];
  daily_summary: {
    avg_efficiency: number;
    peak_efficiency: number;
    total_production: number;
    total_energy: number;
    uptime_hours: number;
    downtime_hours: number;
  };
  trends: {
    efficiency_trend: 'up' | 'down' | 'stable';
    production_trend: 'up' | 'down' | 'stable';
    energy_trend: 'up' | 'down' | 'stable';
  };
}

interface MachinePerformanceChartsProps {
  filters: MachineFilters;
}

const MachinePerformanceCharts: React.FC<MachinePerformanceChartsProps> = ({ filters }) => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'efficiency' | 'production' | 'power' | 'temperature'>('efficiency');
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  useEffect(() => {
    loadPerformanceData();
  }, [filters]);

  useEffect(() => {
    const handleRefresh = () => {
      loadPerformanceData();
    };
    
    window.addEventListener('machinesRefresh', handleRefresh);
    return () => window.removeEventListener('machinesRefresh', handleRefresh);
  }, []);

  const loadPerformanceData = async () => {
    setLoading(true);
    
    // Simulate API call with filters
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Generate mock hourly data for the last 24 hours
    const generateHourlyData = (machineId: string) => {
      const data = [];
      const now = new Date();
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const baseEfficiency = machineId === 'M001' ? 94 : machineId === 'M002' ? 87 : 89;
        const variation = (Math.random() - 0.5) * 10;
        
        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          efficiency: Math.max(60, Math.min(100, baseEfficiency + variation)),
          production_rate: Math.max(100, Math.random() * 900 + 200),
          power_consumption: Math.max(50, Math.random() * 400 + 150),
          temperature: Math.max(20, Math.random() * 180 + 25)
        });
      }
      return data;
    };
    
    // Mock data for multiple machines
    const mockData: PerformanceData[] = [
      {
        machine_id: 'M001',
        machine_name: 'Production Line A',
        hourly_data: generateHourlyData('M001'),
        daily_summary: {
          avg_efficiency: 94.2,
          peak_efficiency: 98.1,
          total_production: 20400,
          total_energy: 5898.4,
          uptime_hours: 23.6,
          downtime_hours: 0.4
        },
        trends: {
          efficiency_trend: 'up',
          production_trend: 'up',
          energy_trend: 'down'
        }
      },
      {
        machine_id: 'M002',
        machine_name: 'CNC Mill #1',
        hourly_data: generateHourlyData('M002'),
        daily_summary: {
          avg_efficiency: 87.1,
          peak_efficiency: 92.5,
          total_production: 7680,
          total_energy: 7497.6,
          uptime_hours: 22.8,
          downtime_hours: 1.2
        },
        trends: {
          efficiency_trend: 'stable',
          production_trend: 'down',
          energy_trend: 'up'
        }
      },
      {
        machine_id: 'M004',
        machine_name: 'Quality Check Station',
        hourly_data: generateHourlyData('M004'),
        daily_summary: {
          avg_efficiency: 91.7,
          peak_efficiency: 96.8,
          total_production: 10080,
          total_energy: 2044.8,
          uptime_hours: 23.5,
          downtime_hours: 0.5
        },
        trends: {
          efficiency_trend: 'up',
          production_trend: 'stable',
          energy_trend: 'stable'
        }
      }
    ];

    // Filter data based on current filters
    let filteredData = mockData;
    
    if (filters.statusFilter !== 'all') {
      // Only show active machines for performance data
      filteredData = filteredData.filter(() => filters.statusFilter === 'all' || filters.statusFilter === 'running');
    }

    setPerformanceData(filteredData);
    if (filteredData.length > 0 && !selectedMachine) {
      setSelectedMachine(filteredData[0].machine_id);
    }
    setLoading(false);
  };

  const getSelectedMachineData = () => {
    return performanceData.find(m => m.machine_id === selectedMachine) || performanceData[0];
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="text-green-600" size={16} />;
    if (trend === 'down') return <TrendingDown className="text-red-600" size={16} />;
    return <Activity className="text-gray-600" size={16} />;
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getMetricIcon = (metric: string) => {
    const icons = {
      efficiency: <Gauge className="text-blue-600" size={20} />,
      production: <BarChart3 className="text-green-600" size={20} />,
      power: <Zap className="text-yellow-600" size={20} />,
      temperature: <ThermometerSun className="text-red-600" size={20} />
    };
    return icons[metric as keyof typeof icons];
  };

  const formatMetricValue = (value: number, metric: string) => {
    switch (metric) {
      case 'efficiency':
        return `${value.toFixed(1)}%`;
      case 'production':
        return `${Math.round(value)} units`;
      case 'power':
        return `${value.toFixed(1)} kW`;
      case 'temperature':
        return `${value.toFixed(1)}°C`;
      default:
        return value.toString();
    }
  };

  const getTimeRangeLabel = () => {
    const labels = {
      '1h': 'Last Hour',
      '8h': 'Last 8 Hours', 
      '24h': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days'
    };
    return labels[filters.timeRange];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card variant="elevated" padding="lg">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} variant="elevated" padding="lg">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const selectedMachineData = getSelectedMachineData();
  
  if (!selectedMachineData) {
    return (
      <Card variant="elevated" padding="lg" className="text-center">
        <div className="flex flex-col items-center gap-4">
          <BarChart3 className="text-gray-400" size={48} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Performance Data</h3>
            <p className="text-gray-600">
              No machines available for performance analysis with current filters.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Machine Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Performance Analytics</h2>
          <p className="text-gray-600 mt-1">
            Detailed performance metrics and trends for {getTimeRangeLabel().toLowerCase()}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Machine Selector */}
          <div className="flex flex-wrap gap-2">
            {performanceData.map(machine => (
              <button
                key={machine.machine_id}
                onClick={() => setSelectedMachine(machine.machine_id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedMachine === machine.machine_id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {machine.machine_name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <Card variant="elevated" padding="lg">
        <div className="space-y-4">
          {/* Chart Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedMachineData.machine_name} Performance
              </h3>
              <p className="text-sm text-gray-600">
                Hourly metrics for the last 24 hours
              </p>
            </div>
            
            {/* Metric Selector */}
            <div className="flex gap-2">
              {[
                { key: 'efficiency', label: 'Efficiency', color: 'bg-blue-100 text-blue-700' },
                { key: 'production', label: 'Production', color: 'bg-green-100 text-green-700' },
                { key: 'power', label: 'Power', color: 'bg-yellow-100 text-yellow-700' },
                { key: 'temperature', label: 'Temperature', color: 'bg-red-100 text-red-700' }
              ].map(metric => (
                <button
                  key={metric.key}
                  onClick={() => setSelectedMetric(metric.key as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMetric === metric.key
                      ? metric.color
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {metric.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Visualization (Mock Bar Chart) */}
          <div className="h-64 bg-gray-50 rounded-lg p-4">
            <div className="h-full flex items-end justify-between gap-1">
              {selectedMachineData.hourly_data.slice(-12).map((dataPoint, index) => {
                const getMetricValue = (metric: string) => {
                  switch (metric) {
                    case 'efficiency': return dataPoint.efficiency;
                    case 'production': return dataPoint.production_rate;
                    case 'power': return dataPoint.power_consumption;
                    case 'temperature': return dataPoint.temperature;
                    default: return 0;
                  }
                };
                
                const value = getMetricValue(selectedMetric);
                const maxValue = selectedMetric === 'efficiency' ? 100 : 
                               selectedMetric === 'production' ? 1000 :
                               selectedMetric === 'power' ? 500 : 200;
                const height = (value / maxValue) * 100;
                
                return (
                  <div 
                    key={index} 
                    className="flex-1 flex flex-col items-center group relative"
                    style={{ maxWidth: '6%' }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                      {dataPoint.time}: {formatMetricValue(value, selectedMetric)}
                    </div>
                    
                    {/* Bar */}
                    <div 
                      className={`w-full rounded-t transition-all duration-300 ${
                        selectedMetric === 'efficiency' ? 'bg-blue-500' :
                        selectedMetric === 'production' ? 'bg-green-500' :
                        selectedMetric === 'power' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                    
                    {/* Time Label */}
                    <span className="text-xs text-gray-600 mt-1 rotate-45 origin-left">
                      {dataPoint.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className={`w-3 h-3 rounded ${
                selectedMetric === 'efficiency' ? 'bg-blue-500' :
                selectedMetric === 'production' ? 'bg-green-500' :
                selectedMetric === 'power' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span>
                {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} - Last 12 Hours
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Average Efficiency */}
        <Card variant="elevated" padding="lg">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              {getMetricIcon('efficiency')}
              <h3 className="text-sm font-medium text-gray-600">
                Average Efficiency
              </h3>
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(selectedMachineData.trends.efficiency_trend)}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {selectedMachineData.daily_summary.avg_efficiency}%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Peak: {selectedMachineData.daily_summary.peak_efficiency}%
            </p>
          </div>

          <ProgressBar 
            value={selectedMachineData.daily_summary.avg_efficiency}
            variant={selectedMachineData.daily_summary.avg_efficiency >= 90 ? 'success' : 
                    selectedMachineData.daily_summary.avg_efficiency >= 75 ? 'warning' : 'danger'}
            size="sm"
          />
        </Card>

        {/* Total Production */}
        <Card variant="elevated" padding="lg">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              {getMetricIcon('production')}
              <h3 className="text-sm font-medium text-gray-600">
                Total Production
              </h3>
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(selectedMachineData.trends.production_trend)}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {selectedMachineData.daily_summary.total_production.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Units produced today
            </p>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Target: 20,000</span>
            <span className={`font-medium ${
              selectedMachineData.daily_summary.total_production >= 20000 ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {selectedMachineData.daily_summary.total_production >= 20000 ? 'On Target' : 'Below Target'}
            </span>
          </div>
        </Card>

        {/* Energy Consumption */}
        <Card variant="elevated" padding="lg">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              {getMetricIcon('power')}
              <h3 className="text-sm font-medium text-gray-600">
                Energy Used
              </h3>
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(selectedMachineData.trends.energy_trend)}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {selectedMachineData.daily_summary.total_energy.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">kWh</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Energy consumed today
            </p>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Efficiency per unit</span>
            <span className="font-medium text-blue-600">
              {(selectedMachineData.daily_summary.total_energy / selectedMachineData.daily_summary.total_production * 1000).toFixed(1)}Wh
            </span>
          </div>
        </Card>

        {/* Uptime Analysis */}
        <Card variant="elevated" padding="lg">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Clock className="text-purple-600" size={20} />
              <h3 className="text-sm font-medium text-gray-600">
                Uptime Today
              </h3>
            </div>
            <Badge variant={selectedMachineData.daily_summary.uptime_hours >= 23 ? 'success' : 'warning'} size="sm">
              {selectedMachineData.daily_summary.uptime_hours >= 23 ? 'Excellent' : 'Good'}
            </Badge>
          </div>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {selectedMachineData.daily_summary.uptime_hours}
              </span>
              <span className="text-sm text-gray-500">hours</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {selectedMachineData.daily_summary.downtime_hours}h downtime
            </p>
          </div>

          <ProgressBar 
            value={(selectedMachineData.daily_summary.uptime_hours / 24) * 100}
            variant={(selectedMachineData.daily_summary.uptime_hours / 24) * 100 >= 95 ? 'success' : 
                   (selectedMachineData.daily_summary.uptime_hours / 24) * 100 >= 85 ? 'warning' : 'danger'}
            size="sm"
          />
        </Card>
      </div>
    </div>
  );
};

export default MachinePerformanceCharts;
