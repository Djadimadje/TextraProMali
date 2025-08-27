'use client';
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  Target,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
  RefreshCw
} from 'lucide-react';
import { workflowService, ProcessAnalytics as ProcessAnalyticsType } from '@/services/workflowService';

interface ProcessAnalyticsProps {
  filters: any;
}

const ProcessAnalytics: React.FC<ProcessAnalyticsProps> = ({ filters }) => {
  const [analytics, setAnalytics] = useState<ProcessAnalyticsType>({
    stages: [],
    optimization_suggestions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workflowService.getProcessAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading process analytics:', err);
      setError('Failed to load process analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  useEffect(() => {
    const handleRefresh = () => loadAnalytics();
    window.addEventListener('workflowRefresh', handleRefresh);
    return () => window.removeEventListener('workflowRefresh', handleRefresh);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} padding="lg" className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
        <button 
          onClick={loadAnalytics} 
          className="mt-3 text-red-600 hover:text-red-800 text-sm underline"
        >
          Try again
        </button>
      </div>
    );
  }
  const analyticsData = {
    overview: {
      totalProcesses: 145,
      activeProcesses: 24,
      completedToday: 156,
      avgProcessingTime: 2.4,
      efficiencyScore: 87.2,
      costSavings: 12500
    },
    performanceMetrics: [
      {
        name: 'Throughput',
        value: 245,
        unit: 'items/hour',
        target: 220,
        trend: 'up',
        change: '+11.4%',
        status: 'good'
      },
      {
        name: 'Cycle Time',
        value: 2.4,
        unit: 'hours',
        target: 2.0,
        trend: 'down',
        change: '-0.3h',
        status: 'warning'
      },
      {
        name: 'First Pass Yield',
        value: 94.2,
        unit: '%',
        target: 95.0,
        trend: 'up',
        change: '+1.8%',
        status: 'good'
      },
      {
        name: 'Resource Utilization',
        value: 89.7,
        unit: '%',
        target: 85.0,
        trend: 'up',
        change: '+4.2%',
        status: 'excellent'
      }
    ],
    processBreakdown: [
      { name: 'Production', processes: 45, efficiency: 92, utilization: 94 },
      { name: 'Quality Control', processes: 28, efficiency: 96, utilization: 87 },
      { name: 'Maintenance', processes: 18, efficiency: 78, utilization: 92 },
      { name: 'Logistics', processes: 32, efficiency: 84, utilization: 89 },
      { name: 'Planning', processes: 22, efficiency: 91, utilization: 76 }
    ],
    timeAnalysis: [
      { hour: '06:00', throughput: 180, efficiency: 85 },
      { hour: '07:00', throughput: 220, efficiency: 88 },
      { hour: '08:00', throughput: 245, efficiency: 90 },
      { hour: '09:00', throughput: 260, efficiency: 92 },
      { hour: '10:00', throughput: 255, efficiency: 91 },
      { hour: '11:00', throughput: 240, efficiency: 89 },
      { hour: '12:00', throughput: 200, efficiency: 85 },
      { hour: '13:00', throughput: 210, efficiency: 87 },
      { hour: '14:00', throughput: 250, efficiency: 91 },
      { hour: '15:00', throughput: 245, efficiency: 90 },
      { hour: '16:00', throughput: 230, efficiency: 88 },
      { hour: '17:00', throughput: 195, efficiency: 86 }
    ],
    bottlenecks: [
      {
        process: 'Quality Inspection - Line A',
        impact: 'high',
        delay: '15 min avg',
        frequency: '40%',
        rootCause: 'Manual verification required',
        suggestion: 'Implement automated inspection'
      },
      {
        process: 'Material Handling - Station 3',
        impact: 'medium',
        delay: '8 min avg',
        frequency: '25%',
        rootCause: 'Conveyor belt limitation',
        suggestion: 'Upgrade conveyor system'
      },
      {
        process: 'Setup Time - Line B',
        impact: 'medium',
        delay: '12 min avg',
        frequency: '30%',
        rootCause: 'Complex changeover process',
        suggestion: 'Standardize setup procedures'
      }
    ],
    trends: [
      {
        metric: 'Overall Efficiency',
        current: 87.2,
        previous: 84.6,
        trend: 'up',
        change: '+2.6%',
        forecast: 89.5
      },
      {
        metric: 'Average Cycle Time',
        current: 2.4,
        previous: 2.7,
        trend: 'down',
        change: '-11.1%',
        forecast: 2.1
      },
      {
        metric: 'Cost per Unit',
        current: 45.20,
        previous: 48.50,
        trend: 'down',
        change: '-6.8%',
        forecast: 43.80
      },
      {
        metric: 'Quality Score',
        current: 94.2,
        previous: 92.8,
        trend: 'up',
        change: '+1.5%',
        forecast: 95.1
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'danger';
      default: return 'default';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowUpRight className="text-green-600" size={16} />
    ) : (
      <ArrowDownRight className="text-red-600" size={16} />
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card padding="lg" className="text-center">
          <Activity className="mx-auto mb-2 text-blue-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalProcesses}</div>
          <div className="text-sm text-gray-600">Total Processes</div>
        </Card>

        <Card padding="lg" className="text-center">
          <Zap className="mx-auto mb-2 text-green-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.activeProcesses}</div>
          <div className="text-sm text-gray-600">Active Now</div>
        </Card>

        <Card padding="lg" className="text-center">
          <CheckCircle className="mx-auto mb-2 text-purple-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.completedToday}</div>
          <div className="text-sm text-gray-600">Completed Today</div>
        </Card>

        <Card padding="lg" className="text-center">
          <Clock className="mx-auto mb-2 text-orange-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.avgProcessingTime}h</div>
          <div className="text-sm text-gray-600">Avg Time</div>
        </Card>

        <Card padding="lg" className="text-center">
          <Target className="mx-auto mb-2 text-indigo-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.efficiencyScore}%</div>
          <div className="text-sm text-gray-600">Efficiency</div>
        </Card>

        <Card padding="lg" className="text-center">
          <TrendingUp className="mx-auto mb-2 text-green-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">${analyticsData.overview.costSavings.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Cost Savings</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
            <BarChart3 className="text-blue-600" size={20} />
          </div>

          <div className="space-y-4">
            {analyticsData.performanceMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(metric.status)} size="sm">
                      {metric.status}
                    </Badge>
                    {getTrendIcon(metric.trend)}
                    <span className="text-sm font-bold text-gray-900">
                      {metric.value} {metric.unit}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <ProgressBar 
                    value={(metric.value / metric.target) * 100} 
                    variant={metric.value >= metric.target ? 'success' : 'warning'}
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-gray-600">
                    Target: {metric.target} {metric.unit}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600">
                  Change: <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {metric.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Process Breakdown */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Process Breakdown</h3>
            <PieChart className="text-blue-600" size={20} />
          </div>

          <div className="space-y-3">
            {analyticsData.processBreakdown.map((process, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{process.name}</span>
                  <span className="text-sm text-gray-600">{process.processes} processes</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-600">Efficiency</span>
                      <span className="font-medium">{process.efficiency}%</span>
                    </div>
                    <ProgressBar 
                      value={process.efficiency} 
                      variant={process.efficiency >= 90 ? 'success' : process.efficiency >= 80 ? 'warning' : 'danger'}
                      className="h-1"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-600">Utilization</span>
                      <span className="font-medium">{process.utilization}%</span>
                    </div>
                    <ProgressBar 
                      value={process.utilization} 
                      variant={process.utilization >= 90 ? 'success' : process.utilization >= 80 ? 'warning' : 'danger'}
                      className="h-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Time Analysis Chart */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Hourly Performance Analysis</h3>
          <LineChart className="text-blue-600" size={20} />
        </div>

        <div className="grid grid-cols-12 gap-2 mb-4">
          {analyticsData.timeAnalysis.map((data, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-600 mb-1">{data.hour}</div>
              <div className="flex flex-col gap-1">
                <div 
                  className="bg-blue-600 rounded"
                  style={{ height: `${(data.throughput / 300) * 40}px` }}
                  title={`Throughput: ${data.throughput}`}
                />
                <div 
                  className="bg-green-600 rounded"
                  style={{ height: `${(data.efficiency / 100) * 20}px` }}
                  title={`Efficiency: ${data.efficiency}%`}
                />
              </div>
              <div className="text-xs text-gray-700 mt-1">{data.throughput}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>Throughput (items/hour)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Efficiency (%)</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bottlenecks Analysis */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Bottlenecks</h3>
            <AlertCircle className="text-orange-600" size={20} />
          </div>

          <div className="space-y-4">
            {analyticsData.bottlenecks.map((bottleneck, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{bottleneck.process}</h4>
                  <Badge variant={getImpactColor(bottleneck.impact)} size="sm">
                    {bottleneck.impact} impact
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Avg Delay:</span>
                    <span className="font-medium ml-1">{bottleneck.delay}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Frequency:</span>
                    <span className="font-medium ml-1">{bottleneck.frequency}</span>
                  </div>
                </div>
                
                <div className="text-sm mb-2">
                  <span className="text-gray-600">Root Cause:</span>
                  <span className="ml-1">{bottleneck.rootCause}</span>
                </div>
                
                <div className="text-sm p-2 bg-blue-50 rounded">
                  <span className="text-blue-800 font-medium">Suggestion:</span>
                  <span className="text-blue-700 ml-1">{bottleneck.suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Trends Analysis */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
            <TrendingUp className="text-green-600" size={20} />
          </div>

          <div className="space-y-4">
            {analyticsData.trends.map((trend, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{trend.metric}</h4>
                  {getTrendIcon(trend.trend)}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Current</div>
                    <div className="font-bold text-gray-900">{trend.current}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Previous</div>
                    <div className="font-medium text-gray-700">{trend.previous}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Forecast</div>
                    <div className="font-medium text-blue-600">{trend.forecast}</div>
                  </div>
                </div>
                
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">Change:</span>
                  <span className={`ml-1 font-medium ${
                    trend.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProcessAnalytics;
