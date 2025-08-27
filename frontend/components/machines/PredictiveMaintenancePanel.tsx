'use client';
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { MachineFilters } from '../../src/app/(dashboard)/analyst/machines/page';
import { 
  Wrench, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  Settings,
  Activity,
  Bell,
  Target,
  Zap
} from 'lucide-react';

interface MaintenanceAlert {
  id: string;
  machine_id: string;
  machine_name: string;
  alert_type: 'overdue' | 'due_soon' | 'scheduled' | 'urgent' | 'prediction';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  due_date: string;
  estimated_hours: number;
  cost_estimate: number;
  parts_required: string[];
  failure_risk: number; // 0-100
  predicted_failure_date?: string;
}

interface MaintenanceMetrics {
  total_machines: number;
  overdue_maintenance: number;
  due_this_week: number;
  scheduled_next_month: number;
  average_mtbf: number; // Mean Time Between Failures (hours)
  average_mttr: number; // Mean Time To Repair (hours)
  maintenance_cost_trend: 'up' | 'down' | 'stable';
  reliability_score: number; // 0-100
  predictive_accuracy: number; // 0-100
}

interface PredictiveMaintenancePanelProps {
  filters: MachineFilters;
}

const PredictiveMaintenancePanel: React.FC<PredictiveMaintenancePanelProps> = ({ filters }) => {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [metrics, setMetrics] = useState<MaintenanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'overdue' | 'due_soon' | 'prediction'>('all');

  useEffect(() => {
    loadMaintenanceData();
  }, [filters]);

  useEffect(() => {
    const handleRefresh = () => {
      loadMaintenanceData();
    };
    
    window.addEventListener('machinesRefresh', handleRefresh);
    return () => window.removeEventListener('machinesRefresh', handleRefresh);
  }, []);

  const loadMaintenanceData = async () => {
    setLoading(true);
    
    // Simulate API call with filters
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock maintenance alerts
    const mockAlerts: MaintenanceAlert[] = [
      {
        id: 'MA001',
        machine_id: 'M003',
        machine_name: 'Packaging Unit B',
        alert_type: 'overdue',
        priority: 'critical',
        description: 'Scheduled maintenance overdue - Belt replacement and lubrication',
        due_date: '2024-01-26',
        estimated_hours: 4,
        cost_estimate: 850,
        parts_required: ['Conveyor Belt', 'Lubricant', 'Belt Tensioner'],
        failure_risk: 85
      },
      {
        id: 'MA002',
        machine_id: 'M002',
        machine_name: 'CNC Mill #1',
        alert_type: 'due_soon',
        priority: 'high',
        description: 'Coolant system maintenance due in 2 days',
        due_date: '2024-01-31',
        estimated_hours: 2,
        cost_estimate: 320,
        parts_required: ['Coolant Filter', 'Coolant Fluid'],
        failure_risk: 45
      },
      {
        id: 'MA003',
        machine_id: 'M005',
        machine_name: 'Welding Robot #2',
        alert_type: 'prediction',
        priority: 'medium',
        description: 'Predictive model indicates welding tip replacement needed soon',
        due_date: '2024-02-05',
        predicted_failure_date: '2024-02-08',
        estimated_hours: 1.5,
        cost_estimate: 150,
        parts_required: ['Welding Tips', 'Contact Tips'],
        failure_risk: 35
      },
      {
        id: 'MA004',
        machine_id: 'M001',
        machine_name: 'Production Line A',
        alert_type: 'scheduled',
        priority: 'medium',
        description: 'Monthly calibration and inspection',
        due_date: '2024-02-15',
        estimated_hours: 3,
        cost_estimate: 200,
        parts_required: ['Calibration Kit'],
        failure_risk: 15
      },
      {
        id: 'MA005',
        machine_id: 'M004',
        machine_name: 'Quality Check Station',
        alert_type: 'prediction',
        priority: 'low',
        description: 'Sensor calibration recommended based on drift analysis',
        due_date: '2024-02-20',
        predicted_failure_date: '2024-03-01',
        estimated_hours: 1,
        cost_estimate: 75,
        parts_required: ['Calibration Certificate'],
        failure_risk: 20
      }
    ];

    // Mock maintenance metrics
    const mockMetrics: MaintenanceMetrics = {
      total_machines: 12,
      overdue_maintenance: 1,
      due_this_week: 1,
      scheduled_next_month: 3,
      average_mtbf: 720, // 30 days
      average_mttr: 4.2,
      maintenance_cost_trend: 'down',
      reliability_score: 92.5,
      predictive_accuracy: 87.3
    };

    setAlerts(mockAlerts);
    setMetrics(mockMetrics);
    setLoading(false);
  };

  const filteredAlerts = alerts.filter(alert => {
    if (selectedPriority !== 'all' && alert.priority !== selectedPriority) return false;
    if (selectedType !== 'all' && alert.alert_type !== selectedType) return false;
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    const variants = {
      critical: 'danger' as const,
      high: 'warning' as const,
      medium: 'info' as const,
      low: 'default' as const
    };
    return variants[priority as keyof typeof variants] || 'default';
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      overdue: 'danger' as const,
      due_soon: 'warning' as const,
      scheduled: 'info' as const,
      urgent: 'danger' as const,
      prediction: 'success' as const
    };
    return variants[type as keyof typeof variants] || 'default';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      overdue: <XCircle className="text-red-600" size={16} />,
      due_soon: <Clock className="text-yellow-600" size={16} />,
      scheduled: <Calendar className="text-blue-600" size={16} />,
      urgent: <AlertTriangle className="text-red-600" size={16} />,
      prediction: <TrendingUp className="text-green-600" size={16} />
    };
    return icons[type as keyof typeof icons];
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-red-600';
    if (risk >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskLevel = (risk: number) => {
    if (risk >= 70) return 'High Risk';
    if (risk >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  const formatDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="text-red-600" size={16} />;
    if (trend === 'down') return <TrendingDown className="text-green-600" size={16} />;
    return <Activity className="text-gray-600" size={16} />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
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
        <Card variant="elevated" padding="lg">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Predictive Maintenance</h2>
          <p className="text-gray-600 mt-1">
            AI-powered maintenance scheduling and failure prediction
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">
            <TrendingUp size={12} />
            {metrics.predictive_accuracy}% Accuracy
          </Badge>
        </div>
      </div>

      {/* Maintenance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overdue Maintenance */}
        <Card variant="elevated" padding="lg">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="text-red-600" size={20} />
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Overdue
              </h3>
            </div>
            {metrics.overdue_maintenance > 0 && (
              <Badge variant="danger" size="sm">
                <Bell size={12} />
                Alert
              </Badge>
            )}
          </div>
          
          <div className="mb-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {metrics.overdue_maintenance}
              </span>
              <span className="text-sm text-gray-500">machines</span>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Require immediate attention
          </p>
        </Card>

        {/* Due This Week */}
        <Card variant="elevated" padding="lg">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Due This Week
              </h3>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {metrics.due_this_week}
              </span>
              <span className="text-sm text-gray-500">machines</span>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Schedule maintenance soon
          </p>
        </Card>

        {/* MTBF */}
        <Card variant="elevated" padding="lg">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <Target className="text-blue-600" size={20} />
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Avg MTBF
              </h3>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {metrics.average_mtbf}
              </span>
              <span className="text-sm text-gray-500">hours</span>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Mean time between failures
          </p>
        </Card>

        {/* Reliability Score */}
        <Card variant="elevated" padding="lg">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <h3 className="text-sm font-medium text-gray-600">
                Reliability
              </h3>
            </div>
            {getTrendIcon(metrics.maintenance_cost_trend)}
          </div>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {metrics.reliability_score}%
              </span>
            </div>
          </div>

          <ProgressBar 
            value={metrics.reliability_score}
            variant={metrics.reliability_score >= 90 ? 'success' : 
                   metrics.reliability_score >= 75 ? 'warning' : 'danger'}
            size="sm"
          />
        </Card>
      </div>

      {/* Alerts and Filters */}
      <Card variant="elevated" padding="lg">
        <div className="space-y-6">
          {/* Header with Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Alerts</h3>
              <p className="text-sm text-gray-600 mt-1">
                {filteredAlerts.length} alerts requiring attention
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Priority Filter */}
              <div className="flex gap-1">
                {['all', 'critical', 'high', 'medium', 'low'].map(priority => (
                  <button
                    key={priority}
                    onClick={() => setSelectedPriority(priority as any)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      selectedPriority === priority
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* Type Filter */}
              <div className="flex gap-1">
                {['all', 'overdue', 'due_soon', 'prediction'].map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type as any)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      selectedType === type
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'due_soon' ? 'Due Soon' : 
                     type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.map(alert => (
              <div key={alert.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Alert Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 mt-1">
                        {getTypeIcon(alert.alert_type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{alert.machine_name}</h4>
                          <Badge variant={getPriorityBadge(alert.priority)} size="sm">
                            {alert.priority}
                          </Badge>
                          <Badge variant={getTypeBadge(alert.alert_type)} size="sm">
                            {alert.alert_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 mb-2">{alert.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Due Date:</span>
                            <span className={`font-medium ml-2 ${
                              alert.alert_type === 'overdue' ? 'text-red-600' : 'text-gray-900'
                            }`}>
                              {formatDaysUntilDue(alert.due_date)}
                            </span>
                          </div>
                          
                          <div>
                            <span className="text-gray-600">Est. Time:</span>
                            <span className="font-medium ml-2">{alert.estimated_hours}h</span>
                          </div>
                          
                          <div>
                            <span className="text-gray-600">Est. Cost:</span>
                            <span className="font-medium ml-2">${alert.cost_estimate}</span>
                          </div>
                        </div>

                        {alert.parts_required.length > 0 && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">Parts: </span>
                            <span className="text-sm text-gray-900">
                              {alert.parts_required.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div className="flex flex-col items-center lg:items-end gap-2">
                    <div className="text-center lg:text-right">
                      <p className="text-sm text-gray-600">Failure Risk</p>
                      <p className={`text-lg font-bold ${getRiskColor(alert.failure_risk)}`}>
                        {alert.failure_risk}%
                      </p>
                      <p className={`text-xs font-medium ${getRiskColor(alert.failure_risk)}`}>
                        {getRiskLevel(alert.failure_risk)}
                      </p>
                    </div>
                    
                    <ProgressBar 
                      value={alert.failure_risk}
                      variant={alert.failure_risk >= 70 ? 'danger' : 
                              alert.failure_risk >= 40 ? 'warning' : 'success'}
                      size="sm"
                    />

                    {alert.predicted_failure_date && (
                      <div className="text-center lg:text-right">
                        <p className="text-xs text-gray-600">Predicted Failure</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(alert.predicted_failure_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredAlerts.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts Found</h3>
                <p className="text-gray-600">
                  No maintenance alerts match your current filter criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PredictiveMaintenancePanel;
