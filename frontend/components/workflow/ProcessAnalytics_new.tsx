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

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'success';
    if (efficiency >= 80) return 'warning';
    return 'danger';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} padding="lg" className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
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

  const totalStages = analytics.stages.length;
  const avgEfficiency = totalStages > 0 
    ? Math.round(analytics.stages.reduce((sum, stage) => sum + stage.efficiency_score, 0) / totalStages)
    : 0;
  const totalBatches = analytics.stages.reduce((sum, stage) => sum + stage.batch_count, 0);
  const avgDuration = totalStages > 0
    ? Math.round((analytics.stages.reduce((sum, stage) => sum + stage.avg_duration, 0) / totalStages) * 10) / 10
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="lg" className="text-center">
          <Activity className="mx-auto mb-2 text-blue-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{totalStages}</div>
          <div className="text-sm text-gray-600">Process Stages</div>
        </Card>

        <Card padding="lg" className="text-center">
          <Target className="mx-auto mb-2 text-green-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{avgEfficiency}%</div>
          <div className="text-sm text-gray-600">Avg Efficiency</div>
        </Card>

        <Card padding="lg" className="text-center">
          <Clock className="mx-auto mb-2 text-purple-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{avgDuration}d</div>
          <div className="text-sm text-gray-600">Avg Duration</div>
        </Card>

        <Card padding="lg" className="text-center">
          <BarChart3 className="mx-auto mb-2 text-orange-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{totalBatches}</div>
          <div className="text-sm text-gray-600">Total Batches</div>
        </Card>
      </div>

      {/* Stage Performance Analysis */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Stage Performance Analysis</h3>
          <PieChart className="text-blue-600" size={20} />
        </div>

        <div className="space-y-4">
          {analytics.stages.map((stage, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{stage.name}</h4>
                <Badge variant={getEfficiencyColor(stage.efficiency_score)} size="sm">
                  {stage.efficiency_score}% Efficiency
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                <div>
                  <p className="text-gray-500">Avg Duration</p>
                  <p className="font-medium">{stage.avg_duration.toFixed(1)}d</p>
                </div>
                <div>
                  <p className="text-gray-500">Range</p>
                  <p className="font-medium">{stage.min_duration.toFixed(1)}d - {stage.max_duration.toFixed(1)}d</p>
                </div>
                <div>
                  <p className="text-gray-500">Batches</p>
                  <p className="font-medium">{stage.batch_count}</p>
                </div>
                <div>
                  <p className="text-gray-500">Performance</p>
                  <div className="flex items-center">
                    {stage.efficiency_score >= 80 ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={stage.efficiency_score >= 80 ? 'text-green-600' : 'text-red-600'}>
                      {stage.efficiency_score >= 80 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Efficiency Progress Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Efficiency Score</span>
                  <span>{stage.efficiency_score}%</span>
                </div>
                <ProgressBar 
                  value={stage.efficiency_score} 
                  variant={getEfficiencyColor(stage.efficiency_score)}
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Optimization Suggestions */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Optimization Suggestions</h3>
            <Zap className="text-yellow-600" size={20} />
          </div>

          <div className="space-y-4">
            {analytics.optimization_suggestions.length > 0 ? (
              analytics.optimization_suggestions.map((suggestion, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(suggestion.priority)} size="sm">
                        {suggestion.priority.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500 capitalize">{suggestion.type}</span>
                    </div>
                    {suggestion.priority === 'high' && (
                      <AlertCircle className="text-red-500" size={16} />
                    )}
                  </div>
                  
                  <p className="text-gray-900 mb-2">{suggestion.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <ArrowUpRight className="text-green-500" size={14} />
                      <span className="text-green-600 font-medium">
                        +{suggestion.potential_improvement}% improvement
                      </span>
                    </div>
                    <div className="text-gray-500">
                      Priority: {suggestion.priority}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto mb-2 text-green-500" size={32} />
                <p className="text-gray-600">No optimization suggestions at this time</p>
                <p className="text-sm text-gray-500">All processes are running efficiently</p>
              </div>
            )}
          </div>
        </Card>

        {/* Performance Summary */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
            <TrendingUp className="text-green-600" size={20} />
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Overall Process Health</span>
                <Badge variant={avgEfficiency >= 85 ? 'success' : avgEfficiency >= 75 ? 'warning' : 'danger'}>
                  {avgEfficiency >= 85 ? 'Excellent' : avgEfficiency >= 75 ? 'Good' : 'Needs Attention'}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-blue-900">{avgEfficiency}%</div>
              <div className="text-sm text-blue-700">Average efficiency across all stages</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-900">{avgDuration}d</div>
                <div className="text-sm text-green-700">Avg Cycle Time</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-900">{totalBatches}</div>
                <div className="text-sm text-purple-700">Total Throughput</div>
              </div>
            </div>

            {/* Top Performing Stage */}
            {analytics.stages.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span className="text-sm font-medium text-green-900">Best Performing Stage</span>
                </div>
                {(() => {
                  const bestStage = analytics.stages.reduce((best, stage) => 
                    stage.efficiency_score > best.efficiency_score ? stage : best
                  );
                  return (
                    <div>
                      <div className="font-medium text-green-900">{bestStage.name}</div>
                      <div className="text-sm text-green-700">{bestStage.efficiency_score}% efficiency</div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Needs Attention */}
            {analytics.stages.some(stage => stage.efficiency_score < 80) && (
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="text-orange-600" size={16} />
                  <span className="text-sm font-medium text-orange-900">Needs Attention</span>
                </div>
                {(() => {
                  const needsAttention = analytics.stages.filter(stage => stage.efficiency_score < 80);
                  return (
                    <div className="space-y-1">
                      {needsAttention.slice(0, 2).map((stage, index) => (
                        <div key={index} className="text-sm text-orange-700">
                          {stage.name}: {stage.efficiency_score}% efficiency
                        </div>
                      ))}
                      {needsAttention.length > 2 && (
                        <div className="text-sm text-orange-600">
                          +{needsAttention.length - 2} more stages
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <BarChart3 className="text-blue-600 mb-2" size={20} />
            <div className="text-sm font-medium text-gray-900">Export Analytics</div>
            <div className="text-xs text-gray-600">Download detailed report</div>
          </button>
          
          <button className="p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <AlertCircle className="text-orange-600 mb-2" size={20} />
            <div className="text-sm font-medium text-gray-900">View Bottlenecks</div>
            <div className="text-xs text-gray-600">Identify process delays</div>
          </button>
          
          <button 
            onClick={loadAnalytics}
            className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <RefreshCw className="text-green-600 mb-2" size={20} />
            <div className="text-sm font-medium text-gray-900">Refresh Data</div>
            <div className="text-xs text-gray-600">Update analytics</div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ProcessAnalytics;
