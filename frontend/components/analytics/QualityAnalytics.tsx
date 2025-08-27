'use client';
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import apiService from '../../src/services/api';
import { AnalyticsFilters } from '../../src/app/(dashboard)/analyst/analytics/page';
import { CheckCircle, AlertTriangle, XCircle, Eye, Camera, Zap } from 'lucide-react';

interface QualityData {
  overall_metrics: {
    average_score: number;
    pass_rate: number;
    defect_rate: number;
    ai_accuracy: number;
    inspection_count: number;
  };
  defect_categories: Array<{
    category: string;
    count: number;
    percentage: number;
    severity: 'high' | 'medium' | 'low';
  }>;
  ai_performance: {
    detection_accuracy: number;
    false_positives: number;
    false_negatives: number;
    processing_speed: number;
  };
  inspector_performance: Array<{
    inspector_id: string;
    inspector_name: string;
    inspections: number;
    accuracy: number;
    efficiency: number;
  }>;
}

interface QualityAnalyticsProps {
  filters: AnalyticsFilters;
}

const QualityAnalytics: React.FC<QualityAnalyticsProps> = ({ filters }) => {
  const [data, setData] = useState<QualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'defects' | 'ai' | 'inspectors'>('overview');

  useEffect(() => {
    loadQualityData();
  }, [filters]);

  useEffect(() => {
    const handleRefresh = () => {
      loadQualityData();
    };
    
    window.addEventListener('analyticsRefresh', handleRefresh);
    return () => window.removeEventListener('analyticsRefresh', handleRefresh);
  }, []);

  const loadQualityData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock quality data
    const mockData: QualityData = {
      overall_metrics: {
        average_score: 96.8,
        pass_rate: 98.2,
        defect_rate: 1.8,
        ai_accuracy: 94.3,
        inspection_count: 2847
      },
      defect_categories: [
        { category: 'Surface Defects', count: 23, percentage: 35.4, severity: 'medium' },
        { category: 'Color Variations', count: 18, percentage: 27.7, severity: 'low' },
        { category: 'Texture Irregularities', count: 15, percentage: 23.1, severity: 'high' },
        { category: 'Contamination', count: 9, percentage: 13.8, severity: 'high' }
      ],
      ai_performance: {
        detection_accuracy: 94.3,
        false_positives: 3.2,
        false_negatives: 2.5,
        processing_speed: 1.2
      },
      inspector_performance: [
        { inspector_id: 'INS001', inspector_name: 'Sarah Johnson', inspections: 487, accuracy: 97.8, efficiency: 92.3 },
        { inspector_id: 'INS002', inspector_name: 'Michael Chen', inspections: 523, accuracy: 96.4, efficiency: 94.1 },
        { inspector_id: 'INS003', inspector_name: 'Emily Rodriguez', inspections: 445, accuracy: 98.2, efficiency: 89.7 }
      ]
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

  const getSeverityColor = (severity: string) => {
    const colors = {
      high: 'danger' as const,
      medium: 'warning' as const,
      low: 'success' as const
    };
    return colors[severity as keyof typeof colors] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quality Analytics</h1>
          <p className="text-gray-600 mt-1">
            AI-powered quality assessment and inspection analytics
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Quality Score</p>
              <p className="text-xl font-bold text-gray-900">
                {data.overall_metrics.average_score}%
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pass Rate</p>
              <p className="text-xl font-bold text-gray-900">
                {data.overall_metrics.pass_rate}%
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Camera className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">AI Accuracy</p>
              <p className="text-xl font-bold text-gray-900">
                {data.ai_performance.detection_accuracy}%
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Defect Rate</p>
              <p className="text-xl font-bold text-gray-900">
                {data.overall_metrics.defect_rate}%
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
            { id: 'defects', label: 'Defect Analysis', icon: '🔍' },
            { id: 'ai', label: 'AI Performance', icon: '🤖' },
            { id: 'inspectors', label: 'Inspector Performance', icon: '👥' }
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
          {/* Quality Trends */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📈 Quality Performance Trends
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Quality Score</span>
                  <span className="text-sm text-gray-500">{data.overall_metrics.average_score}%</span>
                </div>
                <ProgressBar
                  value={data.overall_metrics.average_score}
                  variant="success"
                  size="md"
                  showLabel
                  label="Excellent quality maintained"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Pass Rate</span>
                  <span className="text-sm text-gray-500">{data.overall_metrics.pass_rate}%</span>
                </div>
                <ProgressBar
                  value={data.overall_metrics.pass_rate}
                  variant="success"
                  size="md"
                  showLabel
                  label={`${data.overall_metrics.inspection_count} items inspected`}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">AI Detection Accuracy</span>
                  <span className="text-sm text-gray-500">{data.ai_performance.detection_accuracy}%</span>
                </div>
                <ProgressBar
                  value={data.ai_performance.detection_accuracy}
                  variant={data.ai_performance.detection_accuracy >= 90 ? 'success' : 'warning'}
                  size="md"
                  showLabel
                  label="AI model performance"
                />
              </div>
            </div>
          </Card>

          {/* Quality Distribution */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎯 Quality Distribution
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {data.overall_metrics.pass_rate}%
                  </p>
                  <p className="text-sm text-green-700">Passed</p>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="text-yellow-600" size={24} />
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">
                    {(data.overall_metrics.defect_rate * 0.6).toFixed(1)}%
                  </p>
                  <p className="text-sm text-yellow-700">Minor Issues</p>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <XCircle className="text-red-600" size={24} />
                  </div>
                  <p className="text-2xl font-bold text-red-900">
                    {(data.overall_metrics.defect_rate * 0.4).toFixed(1)}%
                  </p>
                  <p className="text-sm text-red-700">Major Defects</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Quality Insights</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Quality score improved by 2.3% this week</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">AI accuracy increased by 1.8% with latest model</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700">Processing speed optimized to {data.ai_performance.processing_speed}s per item</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeView === 'defects' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Defect Categories */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔍 Defect Categories Analysis
            </h3>
            <div className="space-y-4">
              {data.defect_categories.map((category, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{category.category}</h4>
                    <Badge variant={getSeverityColor(category.severity)} size="sm">
                      {category.severity}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{category.count} occurrences</span>
                    <span>{category.percentage}% of total defects</span>
                  </div>
                  
                  <ProgressBar
                    value={category.percentage}
                    variant={category.severity === 'high' ? 'danger' : category.severity === 'medium' ? 'warning' : 'success'}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Defect Trends */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Defect Trends & Actions
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border-l-4 border-red-400">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-red-900">High Priority</h4>
                  <Badge variant="danger" size="sm">Action Required</Badge>
                </div>
                <p className="text-sm text-red-700 mb-2">
                  Texture irregularities increased by 15% in the last 48 hours
                </p>
                <p className="text-xs text-red-600">
                  Recommended: Check carding machine calibration
                </p>
              </div>

              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-yellow-900">Medium Priority</h4>
                  <Badge variant="warning" size="sm">Monitor</Badge>
                </div>
                <p className="text-sm text-yellow-700 mb-2">
                  Surface defects stable but above target threshold
                </p>
                <p className="text-xs text-yellow-600">
                  Recommended: Increase inspection frequency
                </p>
              </div>

              <div className="p-4 bg-green-50 border-l-4 border-green-400">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-green-900">Improving</h4>
                  <Badge variant="success" size="sm">Good</Badge>
                </div>
                <p className="text-sm text-green-700 mb-2">
                  Color variations decreased by 22% this week
                </p>
                <p className="text-xs text-green-600">
                  Continue current quality protocols
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeView === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Performance Metrics */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🤖 AI Model Performance
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="text-blue-600" size={24} />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {data.ai_performance.detection_accuracy}%
                  </p>
                  <p className="text-sm text-blue-700">Detection Accuracy</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {data.ai_performance.processing_speed}s
                  </p>
                  <p className="text-sm text-green-700">Processing Speed</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">False Positives</span>
                    <span className="text-sm text-gray-600">{data.ai_performance.false_positives}%</span>
                  </div>
                  <ProgressBar
                    value={100 - data.ai_performance.false_positives}
                    variant="success"
                    size="sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">False Negatives</span>
                    <span className="text-sm text-gray-600">{data.ai_performance.false_negatives}%</span>
                  </div>
                  <ProgressBar
                    value={100 - data.ai_performance.false_negatives}
                    variant="success"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* AI Model Status */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ⚙️ Model Status & Updates
            </h3>
            <div className="space-y-4">
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-600" size={16} />
                  <span className="font-medium text-green-900">Model Health: Excellent</span>
                </div>
                <p className="text-sm text-green-700">
                  Current model version 2.3.1 running optimally
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Last Training</span>
                  <span className="text-sm text-gray-500">3 days ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Training Data Size</span>
                  <span className="text-sm text-gray-500">847K samples</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Model Confidence</span>
                  <span className="text-sm text-gray-500">97.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Next Update</span>
                  <span className="text-sm text-gray-500">In 4 days</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Recent Improvements</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Enhanced texture defect detection (+3.2% accuracy)</li>
                  <li>• Reduced processing time by 0.3 seconds</li>
                  <li>• Improved edge case handling</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeView === 'inspectors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {data.inspector_performance.map((inspector) => (
            <Card key={inspector.inspector_id} variant="elevated" padding="lg">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {inspector.inspector_name}
                </h3>
                <p className="text-sm text-gray-600">ID: {inspector.inspector_id}</p>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{inspector.inspections}</p>
                  <p className="text-sm text-gray-600">Inspections Completed</p>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Accuracy</span>
                    <span className="text-sm text-gray-600">{inspector.accuracy}%</span>
                  </div>
                  <ProgressBar
                    value={inspector.accuracy}
                    variant={inspector.accuracy >= 95 ? 'success' : 'warning'}
                    size="sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Efficiency</span>
                    <span className="text-sm text-gray-600">{inspector.efficiency}%</span>
                  </div>
                  <ProgressBar
                    value={inspector.efficiency}
                    variant={inspector.efficiency >= 90 ? 'success' : 'warning'}
                    size="sm"
                  />
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <Badge 
                    variant={inspector.accuracy >= 97 ? 'success' : inspector.accuracy >= 95 ? 'warning' : 'default'} 
                    size="sm"
                    className="w-full justify-center"
                  >
                    {inspector.accuracy >= 97 ? 'Top Performer' : inspector.accuracy >= 95 ? 'Good Performance' : 'Needs Training'}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QualityAnalytics;
