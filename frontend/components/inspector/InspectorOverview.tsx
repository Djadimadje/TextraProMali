'use client';
import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Target
} from 'lucide-react';

interface InspectorOverviewProps {
  data: any;
  loading: boolean;
}

const InspectorOverview: React.FC<InspectorOverviewProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} variant="elevated" padding="lg">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated" padding="lg">
          <div className="text-center text-gray-500">
            <AlertTriangle className="mx-auto mb-2" size={24} />
            <p>No data available</p>
          </div>
        </Card>
      </div>
    );
  }

  const overviewCards = [
    {
      title: 'Today\'s Inspections',
      value: data.todayInspections.completed,
      unit: 'completed',
      subtitle: `${data.todayInspections.pending} pending`,
      icon: CheckCircle,
      color: 'green',
      progress: {
        value: (data.todayInspections.completed / (data.todayInspections.completed + data.todayInspections.pending)) * 100,
        variant: 'success' as const
      },
      trend: {
        value: '+12%',
        type: 'positive' as const,
        label: 'vs yesterday'
      }
    },
    {
      title: 'Pass Rate',
      value: data.qualityMetrics.passRate,
      unit: '%',
      subtitle: `${data.todayInspections.failed} failed today`,
      icon: Target,
      color: 'blue',
      progress: {
        value: data.qualityMetrics.passRate,
        variant: data.qualityMetrics.passRate >= 90 ? 'success' as const : 'warning' as const
      },
      trend: {
        value: '+2.3%',
        type: 'positive' as const,
        label: 'this week'
      }
    },
    {
      title: 'Defect Rate',
      value: data.qualityMetrics.defectRate,
      unit: '%',
      subtitle: 'Target: <5%',
      icon: XCircle,
      color: 'red',
      progress: {
        value: data.qualityMetrics.defectRate,
        variant: data.qualityMetrics.defectRate <= 5 ? 'success' as const : 'danger' as const
      },
      trend: {
        value: '-0.5%',
        type: 'positive' as const,
        label: 'improvement'
      }
    },
    {
      title: 'AI Accuracy',
      value: data.qualityMetrics.aiAccuracy,
      unit: '%',
      subtitle: 'System reliability',
      icon: Activity,
      color: 'purple',
      progress: {
        value: data.qualityMetrics.aiAccuracy,
        variant: 'success' as const
      },
      trend: {
        value: '+1.2%',
        type: 'positive' as const,
        label: 'this month'
      }
    }
  ];

  const getIconColor = (color: string) => {
    const colors = {
      green: 'text-green-600',
      blue: 'text-blue-600',
      red: 'text-red-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600'
    };
    return colors[color as keyof typeof colors] || 'text-gray-600';
  };

  const getBgColor = (color: string) => {
    const colors = {
      green: 'bg-green-100',
      blue: 'bg-blue-100',
      red: 'bg-red-100',
      purple: 'bg-purple-100',
      orange: 'bg-orange-100'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100';
  };

  const getTrendIcon = (type: string) => {
    return type === 'positive' ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (type: string) => {
    return type === 'positive' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {overviewCards.map((card, index) => {
        const IconComponent = card.icon;
        const TrendIcon = getTrendIcon(card.trend.type);
        
        return (
          <Card key={index} variant="elevated" padding="lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {typeof card.value === 'number' ? card.value.toFixed(1) : card.value}
                  </span>
                  <span className="text-sm text-gray-500">{card.unit}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
              </div>
              
              <div className={`p-3 rounded-full ${getBgColor(card.color)}`}>
                <IconComponent className={`w-6 h-6 ${getIconColor(card.color)}`} />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <ProgressBar 
                value={card.progress.value} 
                variant={card.progress.variant}
                className="h-2"
              />
            </div>

            {/* Trend */}
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1 text-sm ${getTrendColor(card.trend.type)}`}>
                <TrendIcon className="w-4 h-4" />
                <span className="font-medium">{card.trend.value}</span>
              </div>
              <span className="text-xs text-gray-500">{card.trend.label}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default InspectorOverview;
