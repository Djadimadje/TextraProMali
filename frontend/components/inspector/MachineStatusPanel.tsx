'use client';
import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { 
  Cog, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Activity,
  Wrench,
  Clock
} from 'lucide-react';

interface MachineStatusData {
  total: number;
  operational: number;
  maintenance: number;
  offline: number;
}

interface MachineStatusPanelProps {
  data?: MachineStatusData;
  loading: boolean;
}

const MachineStatusPanel: React.FC<MachineStatusPanelProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
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
        <div className="text-center py-6 text-gray-500">
          <Cog className="mx-auto mb-2" size={32} />
          <p>Machine status not available</p>
        </div>
      </Card>
    );
  }

  // Mock detailed machine data
  const machines = [
    {
      id: 'M001',
      name: 'Loom A1',
      status: 'operational',
      efficiency: 96.8,
      lastInspection: '2h ago',
      qualityImpact: 'high'
    },
    {
      id: 'M002',
      name: 'Spinning Unit B2',
      status: 'operational',
      efficiency: 94.2,
      lastInspection: '4h ago',
      qualityImpact: 'medium'
    },
    {
      id: 'M003',
      name: 'Dyeing Machine C1',
      status: 'maintenance',
      efficiency: 0,
      lastInspection: '1d ago',
      qualityImpact: 'high'
    },
    {
      id: 'M004',
      name: 'Quality Scanner D1',
      status: 'operational',
      efficiency: 99.1,
      lastInspection: '1h ago',
      qualityImpact: 'critical'
    },
    {
      id: 'M005',
      name: 'Cutting Unit E1',
      status: 'offline',
      efficiency: 0,
      lastInspection: '6h ago',
      qualityImpact: 'medium'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-yellow-600" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'offline':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getQualityImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const statusSummary = [
    {
      label: 'Operational',
      value: data.operational,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: CheckCircle
    },
    {
      label: 'Maintenance',
      value: data.maintenance,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: Wrench
    },
    {
      label: 'Offline',
      value: data.offline,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: XCircle
    }
  ];

  const operationalPercentage = (data.operational / data.total) * 100;

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Machine Status</h3>
          <p className="text-sm text-gray-600 mt-1">Quality-critical equipment</p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {statusSummary.map((status, index) => {
          const IconComponent = status.icon;
          return (
            <div key={index} className="text-center">
              <div className={`p-3 rounded-lg ${status.bgColor} mb-2`}>
                <IconComponent className={`w-6 h-6 mx-auto ${status.color}`} />
              </div>
              <div className={`text-xl font-bold ${status.color}`}>
                {status.value}
              </div>
              <div className="text-xs text-gray-600">{status.label}</div>
            </div>
          );
        })}
      </div>

      {/* Overall Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Operational</span>
          <span className="text-sm font-bold text-gray-900">
            {operationalPercentage.toFixed(1)}%
          </span>
        </div>
        <ProgressBar
          value={operationalPercentage}
          variant={operationalPercentage >= 80 ? 'success' : operationalPercentage >= 60 ? 'warning' : 'danger'}
          className="h-2"
        />
      </div>

      {/* Machine List */}
      <div className="space-y-3">
        {machines.slice(0, 5).map((machine) => (
          <div
            key={machine.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-orange-200 hover:bg-orange-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {getStatusIcon(machine.status)}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {machine.name}
                  </h4>
                  <Badge 
                    variant={getStatusColor(machine.status) as any} 
                    size="sm"
                  >
                    {machine.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {machine.efficiency}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {machine.lastInspection}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge 
                variant={getQualityImpactColor(machine.qualityImpact) as any} 
                size="sm"
              >
                {machine.qualityImpact}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MachineStatusPanel;
