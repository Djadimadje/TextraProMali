'use client';
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import apiService from '../../src/services/api';
import { AnalyticsFilters } from '../../src/app/(dashboard)/analyst/analytics/page';
import { Workflow, Clock, TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';

interface WorkflowData {
  process_overview: {
    total_batches: number;
    completed_batches: number;
    in_progress_batches: number;
    average_cycle_time: number;
    on_time_delivery: number;
    bottlenecks_identified: number;
  };
  process_stages: Array<{
    stage_id: string;
    stage_name: string;
    order: number;
    average_time: number;
    efficiency: number;
    bottleneck_risk: 'high' | 'medium' | 'low';
    current_batches: number;
    completion_rate: number;
  }>;
  bottleneck_analysis: Array<{
    stage: string;
    impact: 'high' | 'medium' | 'low';
    delay_time: number;
    affected_batches: number;
    recommendation: string;
  }>;
  optimization_opportunities: Array<{
    area: string;
    potential_improvement: number;
    effort_required: 'low' | 'medium' | 'high';
    roi_estimate: number;
    description: string;
  }>;
}

interface WorkflowAnalyticsProps {
  filters: AnalyticsFilters;
}

const WorkflowAnalytics: React.FC<WorkflowAnalyticsProps> = ({ filters }) => {
  const [data, setData] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'stages' | 'bottlenecks' | 'optimization'>('overview');

  useEffect(() => {
    loadWorkflowData();
  }, [filters]);

  useEffect(() => {
    const handleRefresh = () => {
      loadWorkflowData();
    };
    
    window.addEventListener('analyticsRefresh', handleRefresh);
    return () => window.removeEventListener('analyticsRefresh', handleRefresh);
  }, []);

  const loadWorkflowData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock workflow data
    const mockData: WorkflowData = {
      process_overview: {
        total_batches: 89,
        completed_batches: 76,
        in_progress_batches: 13,
        average_cycle_time: 4.2,
        on_time_delivery: 94.8,
        bottlenecks_identified: 2
      },
      process_stages: [
        {
          stage_id: 'ginning',
          stage_name: 'Cotton Ginning',
          order: 1,
          average_time: 0.8,
          efficiency: 95.2,
          bottleneck_risk: 'low',
          current_batches: 3,
          completion_rate: 98.4
        },
        {
          stage_id: 'cleaning',
          stage_name: 'Cleaning & Sorting',
          order: 2,
          average_time: 0.6,
          efficiency: 92.7,
          bottleneck_risk: 'medium',
          current_batches: 2,
          completion_rate: 96.8
        },
        {
          stage_id: 'carding',
          stage_name: 'Carding Process',
          order: 3,
          average_time: 1.2,
          efficiency: 88.3,
          bottleneck_risk: 'high',
          current_batches: 4,
          completion_rate: 94.2
        },
        {
          stage_id: 'spinning',
          stage_name: 'Spinning',
          order: 4,
          average_time: 1.1,
          efficiency: 91.5,
          bottleneck_risk: 'medium',
          current_batches: 3,
          completion_rate: 97.1
        },
        {
          stage_id: 'weaving',
          stage_name: 'Weaving',
          order: 5,
          average_time: 0.9,
          efficiency: 89.6,
          bottleneck_risk: 'low',
          current_batches: 1,
          completion_rate: 95.7
        }
      ],
      bottleneck_analysis: [
        {
          stage: 'Carding Process',
          impact: 'high',
          delay_time: 1.8,
          affected_batches: 12,
          recommendation: 'Increase machine capacity or add parallel processing line'
        },
        {
          stage: 'Cleaning & Sorting',
          impact: 'medium',
          delay_time: 0.4,
          affected_batches: 6,
          recommendation: 'Optimize sorting algorithms and staff allocation'
        }
      ],
      optimization_opportunities: [
        {
          area: 'Carding Process Automation',
          potential_improvement: 18,
          effort_required: 'high',
          roi_estimate: 245000,
          description: 'Implement automated carding system to reduce processing time by 18%'
        },
        {
          area: 'Predictive Maintenance',
          potential_improvement: 12,
          effort_required: 'medium',
          roi_estimate: 156000,
          description: 'Deploy IoT sensors for predictive maintenance to reduce downtime'
        },
        {
          area: 'Workflow Optimization',
          potential_improvement: 8,
          effort_required: 'low',
          roi_estimate: 89000,
          description: 'Optimize batch scheduling and resource allocation algorithms'
        }
      ]
    };
    
    setData(mockData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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

  const getRiskColor = (risk: string) => {
    const colors = {
      high: 'danger' as const,
      medium: 'warning' as const,
      low: 'success' as const
    };
    return colors[risk as keyof typeof colors] || 'default';
  };

  const getEffortColor = (effort: string) => {
    const colors = {
      high: 'danger' as const,
      medium: 'warning' as const,
      low: 'success' as const
    };
    return colors[effort as keyof typeof colors] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Analytics</h1>
          <p className="text-gray-600 mt-1">
            Process optimization and bottleneck analysis for textile production workflow
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Workflow className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Batches</p>
              <p className="text-xl font-bold text-gray-900">
                {data.process_overview.total_batches}
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
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900">
                {data.process_overview.completed_batches}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-xl font-bold text-gray-900">
                {data.process_overview.in_progress_batches}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cycle Time</p>
              <p className="text-xl font-bold text-gray-900">
                {data.process_overview.average_cycle_time}h
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">On-Time</p>
              <p className="text-xl font-bold text-gray-900">
                {data.process_overview.on_time_delivery}%
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
              <p className="text-sm text-gray-600">Bottlenecks</p>
              <p className="text-xl font-bold text-gray-900">
                {data.process_overview.bottlenecks_identified}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* View Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'stages', label: 'Process Stages', icon: '🔄' },
            { id: 'bottlenecks', label: 'Bottleneck Analysis', icon: '🚧' },
            { id: 'optimization', label: 'Optimization', icon: '⚡' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content based on active view */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Process Flow Visualization */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔄 Process Flow Overview
            </h3>
            <div className="space-y-4">
              {data.process_stages.map((stage, index) => (
                <div key={stage.stage_id} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      stage.bottleneck_risk === 'high' ? 'bg-red-500' :
                      stage.bottleneck_risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}>
                      {stage.order}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-900">{stage.stage_name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRiskColor(stage.bottleneck_risk)} size="sm">
                          {stage.bottleneck_risk} risk
                        </Badge>
                        <span className="text-sm text-gray-500">{stage.average_time}h</span>
                      </div>
                    </div>
                    <ProgressBar
                      value={stage.efficiency}
                      variant={stage.efficiency >= 90 ? 'success' : 'warning'}
                      size="sm"
                      showLabel
                      label={`${stage.efficiency}% efficiency • ${stage.current_batches} active`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Performance Summary */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📈 Performance Summary
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Completion Rate</span>
                  <span className="text-sm text-gray-500">
                    {Math.round((data.process_overview.completed_batches / data.process_overview.total_batches) * 100)}%
                  </span>
                </div>
                <ProgressBar
                  value={(data.process_overview.completed_batches / data.process_overview.total_batches) * 100}
                  variant="success"
                  size="md"
                  showLabel
                  label={`${data.process_overview.completed_batches} of ${data.process_overview.total_batches} batches`}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">On-Time Delivery</span>
                  <span className="text-sm text-gray-500">{data.process_overview.on_time_delivery}%</span>
                </div>
                <ProgressBar
                  value={data.process_overview.on_time_delivery}
                  variant={data.process_overview.on_time_delivery >= 90 ? 'success' : 'warning'}
                  size="md"
                  showLabel
                  label="Meeting delivery schedules"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-green-50 border-l-4 border-green-400">
                    <p className="text-sm font-medium text-green-900">Efficiency Gain</p>
                    <p className="text-xs text-green-700">
                      Average cycle time reduced by 0.3 hours compared to last month
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400">
                    <p className="text-sm font-medium text-yellow-900">Attention Needed</p>
                    <p className="text-xs text-yellow-700">
                      Carding process showing signs of bottleneck formation
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                    <p className="text-sm font-medium text-blue-900">Optimization Opportunity</p>
                    <p className="text-xs text-blue-700">
                      18% improvement possible with process automation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeView === 'stages' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.process_stages.map((stage) => (
            <Card key={stage.stage_id} variant="elevated" padding="lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {stage.stage_name}
                  </h3>
                  <p className="text-sm text-gray-600">Stage {stage.order}</p>
                </div>
                <Badge variant={getRiskColor(stage.bottleneck_risk)} size="sm">
                  {stage.bottleneck_risk} risk
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stage.average_time}h</p>
                  <p className="text-xs text-gray-600">Avg Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stage.current_batches}</p>
                  <p className="text-xs text-gray-600">Active Batches</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Efficiency</span>
                    <span className="text-sm text-gray-600">{stage.efficiency}%</span>
                  </div>
                  <ProgressBar
                    value={stage.efficiency}
                    variant={stage.efficiency >= 90 ? 'success' : 'warning'}
                    size="sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="text-sm text-gray-600">{stage.completion_rate}%</span>
                  </div>
                  <ProgressBar
                    value={stage.completion_rate}
                    variant="success"
                    size="sm"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeView === 'bottlenecks' && (
        <div className="space-y-6">
          {data.bottleneck_analysis.map((bottleneck, index) => (
            <Card key={index} variant="elevated" padding="lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {bottleneck.stage}
                  </h3>
                  <p className="text-sm text-gray-600">Bottleneck Analysis</p>
                </div>
                <Badge variant={getRiskColor(bottleneck.impact)} size="sm">
                  {bottleneck.impact} impact
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-900">{bottleneck.delay_time}h</p>
                  <p className="text-sm text-red-700">Average Delay</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-900">{bottleneck.affected_batches}</p>
                  <p className="text-sm text-yellow-700">Affected Batches</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-900">
                    {Math.round((bottleneck.affected_batches / data.process_overview.total_batches) * 100)}%
                  </p>
                  <p className="text-sm text-blue-700">Impact on Total</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400">
                <h4 className="font-medium text-blue-900 mb-2">💡 Recommendation</h4>
                <p className="text-sm text-blue-700">{bottleneck.recommendation}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeView === 'optimization' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {data.optimization_opportunities.map((opportunity, index) => (
            <Card key={index} variant="elevated" padding="lg">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {opportunity.area}
                </h3>
                <p className="text-sm text-gray-600">{opportunity.description}</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-900">
                      +{opportunity.potential_improvement}%
                    </p>
                    <p className="text-xs text-green-700">Improvement</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-900">
                      ${opportunity.roi_estimate.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-700">ROI Estimate</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Effort Required</span>
                    <Badge variant={getEffortColor(opportunity.effort_required)} size="sm">
                      {opportunity.effort_required}
                    </Badge>
                  </div>
                  <ProgressBar
                    value={opportunity.effort_required === 'low' ? 30 : opportunity.effort_required === 'medium' ? 60 : 90}
                    variant={opportunity.effort_required === 'low' ? 'success' : opportunity.effort_required === 'medium' ? 'warning' : 'danger'}
                    size="sm"
                    showLabel
                    label={`${opportunity.effort_required} effort implementation`}
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      ROI Timeframe: {opportunity.effort_required === 'low' ? '3-6' : opportunity.effort_required === 'medium' ? '6-12' : '12-18'} months
                    </p>
                    <Badge 
                      variant={opportunity.roi_estimate > 200000 ? 'success' : opportunity.roi_estimate > 100000 ? 'warning' : 'default'} 
                      size="sm"
                    >
                      {opportunity.roi_estimate > 200000 ? 'High Priority' : opportunity.roi_estimate > 100000 ? 'Medium Priority' : 'Low Priority'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowAnalytics;
