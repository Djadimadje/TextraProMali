'use client';
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { ReportFilters } from '../../src/app/(dashboard)/analyst/reports/page';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Target,
  Clock,
  Users,
  Zap,
  Calendar,
  Download
} from 'lucide-react';

interface ProductionData {
  summary: {
    total_output: number;
    average_efficiency: number;
    target_achievement: number;
    operating_hours: number;
    units_per_hour: number;
  };
  by_line: {
    line_id: string;
    line_name: string;
    output: number;
    efficiency: number;
    uptime: number;
    target: number;
  }[];
  by_shift: {
    shift: string;
    output: number;
    efficiency: number;
    hours: number;
  }[];
  trends: {
    daily_output: { date: string; output: number; target: number }[];
    efficiency_trend: { date: string; efficiency: number }[];
  };
  top_performers: {
    line_name: string;
    metric: string;
    value: number;
    improvement: number;
  }[];
}

interface ProductionReportsProps {
  filters: ReportFilters;
  loading: boolean;
  data?: any;
}

const ProductionReports: React.FC<ProductionReportsProps> = ({ filters, loading, data: backendData }) => {
  const [data, setData] = useState<ProductionData | null>(null);
  const [selectedView, setSelectedView] = useState<'summary' | 'lines' | 'shifts' | 'trends'>('summary');

  useEffect(() => {
    if (backendData) {
      console.log('Using backend data for ProductionReports:', backendData);
      // Use backend data - for now just use mock data structure
      loadProductionData();
    } else {
      loadProductionData();
    }
  }, [filters, backendData]);

  useEffect(() => {
    const handleRefresh = () => {
      loadProductionData();
    };
    
    window.addEventListener('reportsRefresh', handleRefresh);
    return () => window.removeEventListener('reportsRefresh', handleRefresh);
  }, []);

  const loadProductionData = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock production data
    const mockData: ProductionData = {
      summary: {
        total_output: 125400,
        average_efficiency: 89.2,
        target_achievement: 94.7,
        operating_hours: 720,
        units_per_hour: 174.2
      },
      by_line: [
        {
          line_id: 'L001',
          line_name: 'Production Line A',
          output: 45200,
          efficiency: 94.2,
          uptime: 98.5,
          target: 48000
        },
        {
          line_id: 'L002',
          line_name: 'Production Line B',
          output: 38600,
          efficiency: 87.1,
          uptime: 95.2,
          target: 42000
        },
        {
          line_id: 'L003',
          line_name: 'Assembly Line C',
          output: 28400,
          efficiency: 91.7,
          uptime: 97.8,
          target: 30000
        },
        {
          line_id: 'L004',
          line_name: 'Packaging Line D',
          output: 13200,
          efficiency: 82.5,
          uptime: 89.3,
          target: 16000
        }
      ],
      by_shift: [
        { shift: 'Day', output: 52000, efficiency: 91.5, hours: 240 },
        { shift: 'Night', output: 48200, efficiency: 88.2, hours: 240 },
        { shift: 'Weekend', output: 25200, efficiency: 84.7, hours: 240 }
      ],
      trends: {
        daily_output: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          output: Math.floor(Math.random() * 2000) + 3500,
          target: 4200
        })),
        efficiency_trend: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          efficiency: Math.random() * 15 + 80
        }))
      },
      top_performers: [
        { line_name: 'Production Line A', metric: 'Efficiency', value: 94.2, improvement: 2.8 },
        { line_name: 'Assembly Line C', metric: 'Uptime', value: 97.8, improvement: 1.5 },
        { line_name: 'Production Line B', metric: 'Output Rate', value: 161.2, improvement: 8.3 }
      ]
    };

    setData(mockData);
  };

  const getDateRangeLabel = () => {
    if (filters.timeRange === 'custom') {
      return `${filters.dateFrom} to ${filters.dateTo}`;
    }
    const labels = {
      '1d': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days'
    };
    return labels[filters.timeRange] || 'Last 7 Days';
  };

  const exportData = () => {
    console.log('Exporting production data...', { filters, data });
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} variant="elevated" padding="lg">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Production Reports</h2>
          <p className="text-gray-600 mt-1">
            Production performance analysis for {getDateRangeLabel().toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Production Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <BarChart3 className="text-blue-600" size={20} />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Output</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">
              {data.summary.total_output.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">units</span>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-100">
              <Activity className="text-green-600" size={20} />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Avg Efficiency</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">
              {data.summary.average_efficiency}%
            </span>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-100">
              <Target className="text-purple-600" size={20} />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Target Achievement</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">
              {data.summary.target_achievement}%
            </span>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Operating Hours</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">
              {data.summary.operating_hours.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">hrs</span>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-100">
              <Zap className="text-red-600" size={20} />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Units/Hour</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">
              {data.summary.units_per_hour}
            </span>
          </div>
        </Card>
      </div>

      {/* View Selector */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'summary', label: 'Summary' },
          { key: 'lines', label: 'By Production Line' },
          { key: 'shifts', label: 'By Shift' },
          { key: 'trends', label: 'Trends' }
        ].map(view => (
          <button
            key={view.key}
            onClick={() => setSelectedView(view.key as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === view.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Content based on selected view */}
      {selectedView === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
            <div className="space-y-4">
              {data.top_performers.map((performer, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{performer.line_name}</h4>
                    <p className="text-sm text-gray-600">{performer.metric}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{performer.value}%</p>
                    <p className="text-sm text-green-600">+{performer.improvement}%</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Shift Performance */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shift Performance</h3>
            <div className="space-y-4">
              {data.by_shift.map((shift, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{shift.shift} Shift</span>
                    <span className="text-sm text-gray-600">{shift.efficiency}% efficiency</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Output: </span>
                      <span className="font-medium">{shift.output.toLocaleString()} units</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Hours: </span>
                      <span className="font-medium">{shift.hours}h</span>
                    </div>
                  </div>
                  <ProgressBar 
                    value={shift.efficiency}
                    variant={shift.efficiency >= 90 ? 'success' : 
                           shift.efficiency >= 80 ? 'warning' : 'danger'}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {selectedView === 'lines' && (
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Production Line Analysis</h3>
          <div className="space-y-6">
            {data.by_line.map((line) => (
              <div key={line.line_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{line.line_name}</h4>
                    <p className="text-sm text-gray-600">{line.line_id}</p>
                  </div>
                  <Badge 
                    variant={line.efficiency >= 90 ? 'success' : line.efficiency >= 80 ? 'warning' : 'danger'} 
                    size="sm"
                  >
                    {line.efficiency}% Efficiency
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Output</p>
                    <p className="text-xl font-bold text-gray-900">{line.output.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">units</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Target</p>
                    <p className="text-xl font-bold text-gray-900">{line.target.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">units</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Efficiency</p>
                    <p className="text-xl font-bold text-gray-900">{line.efficiency}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Uptime</p>
                    <p className="text-xl font-bold text-gray-900">{line.uptime}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Target Achievement</span>
                    <span className="font-medium">
                      {((line.output / line.target) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar 
                    value={(line.output / line.target) * 100}
                    variant={(line.output / line.target) * 100 >= 95 ? 'success' : 
                           (line.output / line.target) * 100 >= 85 ? 'warning' : 'danger'}
                    size="md"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {selectedView === 'shifts' && (
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Shift Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.by_shift.map((shift, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{shift.shift} Shift</h4>
                  <p className="text-sm text-gray-600">{shift.hours} hours</p>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{shift.output.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Units Produced</p>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{shift.efficiency}%</p>
                    <p className="text-sm text-gray-600">Efficiency</p>
                    <ProgressBar 
                      value={shift.efficiency}
                      variant={shift.efficiency >= 90 ? 'success' : 
                             shift.efficiency >= 80 ? 'warning' : 'danger'}
                      size="md"
                    />
                  </div>

                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {Math.round(shift.output / shift.hours)}
                    </p>
                    <p className="text-sm text-gray-600">Units per Hour</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {selectedView === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Output Trend */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Output Trend</h3>
            <div className="h-64 bg-gray-50 rounded-lg p-4">
              <div className="h-full flex items-end justify-between gap-1">
                {data.trends.daily_output.slice(-15).map((point, index) => {
                  const height = (point.output / Math.max(...data.trends.daily_output.map(p => p.output))) * 100;
                  const targetHeight = (point.target / Math.max(...data.trends.daily_output.map(p => p.output))) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group relative">
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                        {point.date}: {point.output} units
                      </div>
                      
                      {/* Target line */}
                      <div 
                        className="w-full border-t-2 border-dashed border-red-400 absolute"
                        style={{ bottom: `${targetHeight}%` }}
                      />
                      
                      {/* Actual output bar */}
                      <div 
                        className="w-full bg-blue-500 rounded-t transition-all duration-300"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                      />
                      
                      <span className="text-xs text-gray-600 mt-1 rotate-45 origin-left">
                        {point.date.split('-')[2]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-center mt-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Actual Output</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 border-t-2 border-dashed border-red-400"></div>
                <span>Target</span>
              </div>
            </div>
          </Card>

          {/* Efficiency Trend */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Trend</h3>
            <div className="h-64 bg-gray-50 rounded-lg p-4">
              <div className="h-full flex items-end justify-between gap-1">
                {data.trends.efficiency_trend.slice(-15).map((point, index) => {
                  const height = (point.efficiency / 100) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group relative">
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                        {point.date}: {point.efficiency.toFixed(1)}%
                      </div>
                      
                      <div 
                        className="w-full bg-green-500 rounded-t transition-all duration-300"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                      />
                      
                      <span className="text-xs text-gray-600 mt-1 rotate-45 origin-left">
                        {point.date.split('-')[2]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-center mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Daily Efficiency %</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductionReports;
