'use client';
import React from 'react';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  Activity,
  Award,
  AlertTriangle
} from 'lucide-react';

interface QualityMetricsData {
  passRate: number;
  defectRate: number;
  aiAccuracy: number;
  avgScore: number;
}

interface QualityMetricsProps {
  data?: QualityMetricsData;
  loading: boolean;
}

const QualityMetrics: React.FC<QualityMetricsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="mx-auto mb-3" size={48} />
          <p>Quality metrics data not available</p>
        </div>
      </Card>
    );
  }

  const metrics = [
    {
      label: 'Pass Rate',
      value: data.passRate,
      unit: '%',
      target: 95,
      icon: CheckCircle,
      color: 'green',
      trend: {
        value: 2.3,
        direction: 'up' as const,
        label: 'vs last week'
      },
      description: 'Percentage of inspections passed'
    },
    {
      label: 'Defect Rate',
      value: data.defectRate,
      unit: '%',
      target: 5,
      icon: XCircle,
      color: 'red',
      trend: {
        value: -0.8,
        direction: 'down' as const,
        label: 'improvement'
      },
      description: 'Percentage of defects found',
      isReversed: true // Lower is better
    },
    {
      label: 'AI Accuracy',
      value: data.aiAccuracy,
      unit: '%',
      target: 90,
      icon: Activity,
      color: 'blue',
      trend: {
        value: 1.2,
        direction: 'up' as const,
        label: 'this month'
      },
      description: 'AI detection accuracy rate'
    },
    {
      label: 'Average Score',
      value: data.avgScore,
      unit: '/100',
      target: 90,
      icon: Award,
      color: 'purple',
      trend: {
        value: 1.7,
        direction: 'up' as const,
        label: 'quality improvement'
      },
      description: 'Overall quality assessment score'
    }
  ];

  const getProgressVariant = (value: number, target: number, isReversed: boolean = false) => {
    if (isReversed) {
      return value <= target ? 'success' : value <= target * 1.5 ? 'warning' : 'danger';
    } else {
      return value >= target ? 'success' : value >= target * 0.8 ? 'warning' : 'danger';
    }
  };

  const getIconColor = (color: string) => {
    const colors = {
      green: 'text-green-600',
      red: 'text-red-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600'
    };
    return colors[color as keyof typeof colors] || 'text-gray-600';
  };

  const getBgColor = (color: string) => {
    const colors = {
      green: 'bg-green-100',
      red: 'bg-red-100',
      blue: 'bg-blue-100',
      purple: 'bg-purple-100'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100';
  };

  const getTrendIcon = (direction: string) => {
    return direction === 'up' ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (direction: string, isReversed: boolean = false) => {
    const isPositive = isReversed ? direction === 'down' : direction === 'up';
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card variant="elevated" padding="lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quality Metrics</h3>
        <p className="text-sm text-gray-600 mt-1">Real-time inspection performance indicators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const TrendIcon = getTrendIcon(metric.trend.direction);
          const progressVariant = getProgressVariant(metric.value, metric.target, metric.isReversed);
          
          return (
            <div key={index} className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getBgColor(metric.color)}`}>
                    <IconComponent className={`w-5 h-5 ${getIconColor(metric.color)}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{metric.label}</h4>
                    <p className="text-xs text-gray-500">{metric.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.value.toFixed(1)}{metric.unit}
                  </div>
                  <div className="text-xs text-gray-500">
                    Target: {metric.target}{metric.unit}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className={`font-medium ${
                    progressVariant === 'success' ? 'text-green-600' :
                    progressVariant === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {progressVariant === 'success' ? 'Target Met' :
                     progressVariant === 'warning' ? 'Near Target' : 'Below Target'}
                  </span>
                </div>
                
                <ProgressBar
                  value={metric.isReversed ? 
                    Math.max(0, 100 - (metric.value / metric.target) * 100) :
                    Math.min(100, (metric.value / metric.target) * 100)
                  }
                  variant={progressVariant}
                  className="h-2"
                />
              </div>

              {/* Trend */}
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1 text-sm ${getTrendColor(metric.trend.direction, metric.isReversed)}`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="font-medium">
                    {metric.trend.direction === 'up' ? '+' : ''}{metric.trend.value}%
                  </span>
                </div>
                <span className="text-xs text-gray-500">{metric.trend.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Overall Performance</h4>
            <p className="text-sm text-gray-600">Quality inspection effectiveness</p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {((data.passRate + data.aiAccuracy + data.avgScore - data.defectRate) / 3).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Combined Score</div>
          </div>
        </div>
        
        <div className="mt-3">
          <ProgressBar
            value={((data.passRate + data.aiAccuracy + data.avgScore - data.defectRate) / 3)}
            variant={
              ((data.passRate + data.aiAccuracy + data.avgScore - data.defectRate) / 3) >= 90 ? 'success' :
              ((data.passRate + data.aiAccuracy + data.avgScore - data.defectRate) / 3) >= 80 ? 'warning' : 'danger'
            }
            className="h-3"
          />
        </div>
      </div>
    </Card>
  );
};

export default QualityMetrics;
