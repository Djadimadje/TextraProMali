'use client';
import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  CheckCircle2,
  Bell,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'quality' | 'deadline' | 'maintenance' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  machineId?: string;
  inspectionId?: string;
  read: boolean;
  requiresAction: boolean;
}

interface InspectionAlertsProps {
  alerts?: Alert[];
  loading: boolean;
}

const InspectionAlerts: React.FC<InspectionAlertsProps> = ({ alerts, loading }) => {
  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Mock alerts data if not provided
  const mockAlerts: Alert[] = [
    {
      id: 'ALT001',
      type: 'quality',
      severity: 'critical',
      title: 'Quality Threshold Exceeded',
      description: 'Machine M001 showing defect rate above 5% threshold',
      timestamp: '5 minutes ago',
      machineId: 'M001',
      read: false,
      requiresAction: true
    },
    {
      id: 'ALT002',
      type: 'deadline',
      severity: 'high',
      title: 'Inspection Deadline Approaching',
      description: 'Monthly quality inspection for Batch B-2024-003 due in 2 hours',
      timestamp: '15 minutes ago',
      inspectionId: 'INS-2024-003',
      read: false,
      requiresAction: true
    },
    {
      id: 'ALT003',
      type: 'maintenance',
      severity: 'medium',
      title: 'Maintenance Window Available',
      description: 'Machine M003 scheduled for maintenance in quality zone',
      timestamp: '1 hour ago',
      machineId: 'M003',
      read: true,
      requiresAction: false
    },
    {
      id: 'ALT004',
      type: 'system',
      severity: 'low',
      title: 'AI Model Updated',
      description: 'Quality detection model v2.1 deployed successfully',
      timestamp: '2 hours ago',
      read: true,
      requiresAction: false
    },
    {
      id: 'ALT005',
      type: 'quality',
      severity: 'high',
      title: 'Pattern Anomaly Detected',
      description: 'Unusual defect pattern in textile batch T-2024-045',
      timestamp: '3 hours ago',
      inspectionId: 'INS-2024-045',
      read: false,
      requiresAction: true
    }
  ];

  const displayAlerts = alerts || mockAlerts;
  const unreadCount = displayAlerts.filter(alert => !alert.read).length;
  const actionRequiredCount = displayAlerts.filter(alert => alert.requiresAction).length;

  const getAlertIcon = (type: string, severity: string) => {
    if (severity === 'critical') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    
    switch (type) {
      case 'quality':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'deadline':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'maintenance':
        return <CheckCircle2 className="w-5 h-5 text-yellow-600" />;
      case 'system':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quality':
        return 'warning';
      case 'deadline':
        return 'info';
      case 'maintenance':
        return 'secondary';
      case 'system':
        return 'success';
      default:
        return 'default';
    }
  };

  if (!displayAlerts.length) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-6 text-gray-500">
          <Bell className="mx-auto mb-2" size={32} />
          <p>No active alerts</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Inspection Alerts</h3>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-gray-600">
              {unreadCount} unread
            </span>
            <span className="text-sm text-orange-600 font-medium">
              {actionRequiredCount} require action
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-xl font-bold text-red-600">
            {displayAlerts.filter(a => a.severity === 'critical').length}
          </div>
          <div className="text-xs text-gray-600">Critical</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-orange-600">
            {displayAlerts.filter(a => a.severity === 'high').length}
          </div>
          <div className="text-xs text-gray-600">High</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">
            {displayAlerts.filter(a => a.type === 'quality').length}
          </div>
          <div className="text-xs text-gray-600">Quality</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-600">
            {actionRequiredCount}
          </div>
          <div className="text-xs text-gray-600">Action Req.</div>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {displayAlerts.slice(0, 6).map((alert) => (
          <div
            key={alert.id}
            className={`p-4 border rounded-lg transition-all hover:shadow-sm ${
              !alert.read 
                ? 'border-orange-200 bg-orange-50' 
                : 'border-gray-200 bg-white hover:border-orange-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getAlertIcon(alert.type, alert.severity)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className={`font-medium text-sm leading-5 ${
                    !alert.read ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {alert.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge 
                      variant={getSeverityColor(alert.severity) as any} 
                      size="sm"
                    >
                      {alert.severity}
                    </Badge>
                    
                    <Badge 
                      variant={getTypeColor(alert.type) as any} 
                      size="sm"
                    >
                      {alert.type}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {alert.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {alert.timestamp}
                    </span>
                    
                    {alert.machineId && (
                      <span>Machine: {alert.machineId}</span>
                    )}
                    
                    {alert.inspectionId && (
                      <span>Inspection: {alert.inspectionId}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {alert.requiresAction && (
                      <Badge variant="warning" size="sm">
                        Action Required
                      </Badge>
                    )}
                    
                    {!alert.read && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default InspectionAlerts;
