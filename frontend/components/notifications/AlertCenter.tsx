'use client';
import React, { useState } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  RefreshCw,
  Settings,
  Bell,
  Zap,
  TrendingUp,
  Activity,
  Eye,
  Phone,
  Mail
} from 'lucide-react';

interface AlertCenterProps {
  filters: any;
  refreshData: () => void;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'acknowledged' | 'resolved' | 'escalated';
  category: string;
  source: string;
  department: string;
  triggeredAt: string;
  lastUpdated: string;
  assignedTo?: string;
  responseTime?: number;
  resolutionTime?: number;
  affectedSystems: string[];
  metrics: {
    impact: number;
    urgency: number;
    probability: number;
  };
  actions: {
    id: string;
    title: string;
    type: 'automatic' | 'manual';
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    estimatedTime?: number;
  }[];
  escalationLevel: number;
  notifications: {
    email: boolean;
    sms: boolean;
    dashboard: boolean;
  };
}

const AlertCenter: React.FC<AlertCenterProps> = ({ filters, refreshData }) => {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [alertFilter, setAlertFilter] = useState<'all' | 'active' | 'critical'>('active');

  // Mock data - replace with actual API call
  const alerts: Alert[] = [
    {
      id: 'alert-001',
      title: 'Production Line A Critical Failure',
      description: 'Production Line A has experienced a critical failure in the main conveyor system. Production has stopped and immediate maintenance is required.',
      severity: 'critical',
      status: 'active',
      category: 'Equipment Failure',
      source: 'Machine Sensors',
      department: 'Production Line A',
      triggeredAt: '2025-08-25T14:35:00Z',
      lastUpdated: '2025-08-25T14:37:00Z',
      assignedTo: 'John Smith',
      affectedSystems: ['Conveyor-A1', 'Control-System-A', 'Safety-Interlock-A'],
      metrics: {
        impact: 95,
        urgency: 100,
        probability: 90
      },
      actions: [
        {
          id: 'action-001',
          title: 'Emergency Stop Activated',
          type: 'automatic',
          status: 'completed'
        },
        {
          id: 'action-002',
          title: 'Maintenance Team Dispatched',
          type: 'automatic',
          status: 'in-progress',
          estimatedTime: 15
        },
        {
          id: 'action-003',
          title: 'Root Cause Analysis',
          type: 'manual',
          status: 'pending',
          estimatedTime: 60
        }
      ],
      escalationLevel: 2,
      notifications: {
        email: true,
        sms: true,
        dashboard: true
      }
    },
    {
      id: 'alert-002',
      title: 'Quality Control Threshold Exceeded',
      description: 'Quality control metrics have exceeded acceptable thresholds. Defect rate is currently at 12.3%, above the 10% limit.',
      severity: 'high',
      status: 'acknowledged',
      category: 'Quality Issue',
      source: 'Quality Sensors',
      department: 'Quality Control',
      triggeredAt: '2025-08-25T13:20:00Z',
      lastUpdated: '2025-08-25T13:45:00Z',
      assignedTo: 'Sarah Johnson',
      responseTime: 25,
      affectedSystems: ['QC-Station-1', 'QC-Station-2'],
      metrics: {
        impact: 75,
        urgency: 80,
        probability: 85
      },
      actions: [
        {
          id: 'action-004',
          title: 'Quality Inspector Notified',
          type: 'automatic',
          status: 'completed'
        },
        {
          id: 'action-005',
          title: 'Batch Isolation',
          type: 'manual',
          status: 'in-progress',
          estimatedTime: 30
        },
        {
          id: 'action-006',
          title: 'Quality Review Meeting',
          type: 'manual',
          status: 'pending',
          estimatedTime: 120
        }
      ],
      escalationLevel: 1,
      notifications: {
        email: true,
        sms: false,
        dashboard: true
      }
    },
    {
      id: 'alert-003',
      title: 'Scheduled Maintenance Overdue',
      description: 'Scheduled maintenance for Production Line B is overdue by 3 hours. Equipment performance may be affected.',
      severity: 'medium',
      status: 'escalated',
      category: 'Maintenance',
      source: 'Workflow Engine',
      department: 'Maintenance',
      triggeredAt: '2025-08-25T11:00:00Z',
      lastUpdated: '2025-08-25T14:00:00Z',
      assignedTo: 'Mike Wilson',
      responseTime: 45,
      affectedSystems: ['Line-B-Main', 'Line-B-Control'],
      metrics: {
        impact: 60,
        urgency: 70,
        probability: 95
      },
      actions: [
        {
          id: 'action-007',
          title: 'Maintenance Rescheduled',
          type: 'manual',
          status: 'in-progress',
          estimatedTime: 240
        },
        {
          id: 'action-008',
          title: 'Resource Allocation',
          type: 'manual',
          status: 'pending',
          estimatedTime: 60
        }
      ],
      escalationLevel: 2,
      notifications: {
        email: true,
        sms: true,
        dashboard: true
      }
    },
    {
      id: 'alert-004',
      title: 'Temperature Sensor Malfunction',
      description: 'Temperature sensor in Zone 3 is reporting inconsistent readings. May affect product quality if not addressed.',
      severity: 'medium',
      status: 'active',
      category: 'Sensor Issue',
      source: 'Environmental Monitoring',
      department: 'Engineering',
      triggeredAt: '2025-08-25T12:15:00Z',
      lastUpdated: '2025-08-25T12:15:00Z',
      affectedSystems: ['Temp-Sensor-Z3', 'HVAC-Zone-3'],
      metrics: {
        impact: 45,
        urgency: 60,
        probability: 80
      },
      actions: [
        {
          id: 'action-009',
          title: 'Sensor Diagnostic',
          type: 'automatic',
          status: 'completed'
        },
        {
          id: 'action-010',
          title: 'Technician Assignment',
          type: 'manual',
          status: 'pending',
          estimatedTime: 90
        }
      ],
      escalationLevel: 0,
      notifications: {
        email: true,
        sms: false,
        dashboard: true
      }
    },
    {
      id: 'alert-005',
      title: 'Network Connectivity Issue Resolved',
      description: 'Network connectivity issue between production systems has been resolved. All systems are now operating normally.',
      severity: 'low',
      status: 'resolved',
      category: 'Network',
      source: 'Network Monitoring',
      department: 'IT',
      triggeredAt: '2025-08-25T09:30:00Z',
      lastUpdated: '2025-08-25T10:15:00Z',
      assignedTo: 'Tech Support',
      responseTime: 15,
      resolutionTime: 45,
      affectedSystems: ['Network-Switch-1', 'Firewall-A'],
      metrics: {
        impact: 30,
        urgency: 40,
        probability: 70
      },
      actions: [
        {
          id: 'action-011',
          title: 'Network Restart',
          type: 'automatic',
          status: 'completed'
        },
        {
          id: 'action-012',
          title: 'Connectivity Test',
          type: 'automatic',
          status: 'completed'
        }
      ],
      escalationLevel: 0,
      notifications: {
        email: true,
        sms: false,
        dashboard: true
      }
    }
  ];

  const alertStats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    highPriority: alerts.filter(a => a.severity === 'high').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    averageResponseTime: 28,
    averageResolutionTime: 85,
    escalationRate: 15.2
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'danger';
      case 'acknowledged': return 'warning';
      case 'resolved': return 'success';
      case 'escalated': return 'danger';
      default: return 'default';
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'failed': return 'danger';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    console.log('Acknowledge alert:', alertId);
  };

  const resolveAlert = (alertId: string) => {
    console.log('Resolve alert:', alertId);
  };

  const escalateAlert = (alertId: string) => {
    console.log('Escalate alert:', alertId);
  };

  const filteredAlerts = alerts.filter(alert => {
    // Apply alert filter
    switch (alertFilter) {
      case 'active':
        if (!(alert.status === 'active' || alert.status === 'acknowledged')) return false;
        break;
      case 'critical':
        if (alert.severity !== 'critical') return false;
        break;
    }
    
    // Apply external filters from props if needed
    // This uses the filters parameter to avoid TypeScript warning
    if (filters) {
      // Future: Add more sophisticated filtering based on the filters prop
    }
    
    return true;
  });

  const selectedAlertData = selectedAlert ? alerts.find(a => a.id === selectedAlert) : null;

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card padding="lg" className="text-center">
          <AlertTriangle className="mx-auto mb-2 text-red-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{alertStats.total}</div>
          <div className="text-sm text-gray-600">Total Alerts</div>
        </Card>

        <Card padding="lg" className="text-center">
          <Activity className="mx-auto mb-2 text-orange-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{alertStats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </Card>

        <Card padding="lg" className="text-center">
          <Zap className="mx-auto mb-2 text-red-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{alertStats.critical}</div>
          <div className="text-sm text-gray-600">Critical</div>
        </Card>

        <Card padding="lg" className="text-center">
          <Eye className="mx-auto mb-2 text-yellow-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{alertStats.acknowledged}</div>
          <div className="text-sm text-gray-600">Acknowledged</div>
        </Card>

        <Card padding="lg" className="text-center">
          <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{alertStats.resolved}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </Card>

        <Card padding="lg" className="text-center">
          <Clock className="mx-auto mb-2 text-blue-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{alertStats.averageResponseTime}m</div>
          <div className="text-sm text-gray-600">Avg Response</div>
        </Card>
      </div>

      {/* Alert Filters */}
      <Card padding="lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter alerts:</span>
            <div className="flex gap-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'active', label: 'Active' },
                { key: 'critical', label: 'Critical' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setAlertFilter(filter.key as any)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    alertFilter === filter.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={refreshData} variant="secondary" size="sm">
            <RefreshCw className="mr-2" size={16} />
            Refresh
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              onClick={(e: React.MouseEvent) => {
                // Only select alert if not clicking on buttons
                if (!(e.target as HTMLElement).closest('button')) {
                  setSelectedAlert(alert.id);
                }
              }}
              className="cursor-pointer"
            >
              <Card
                padding="lg"
                className={`transition-all ${
                  selectedAlert === alert.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(alert.severity)} size="sm">
                          {alert.severity}
                        </Badge>
                        <Badge variant={getStatusColor(alert.status)} size="sm">
                          {alert.status}
                        </Badge>
                        {alert.escalationLevel > 0 && (
                          <Badge variant="danger" size="sm">
                            Level {alert.escalationLevel}
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{alert.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{alert.source}</span>
                        <span>{alert.department}</span>
                        <span>{formatTimestamp(alert.triggeredAt)}</span>
                        {alert.assignedTo && <span>Assigned to {alert.assignedTo}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {alert.notifications.email && <Mail className="text-blue-500" size={14} />}
                      {alert.notifications.sms && <Phone className="text-green-500" size={14} />}
                      {alert.notifications.dashboard && <Bell className="text-orange-500" size={14} />}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-bold text-gray-900">{alert.metrics.impact}%</div>
                      <div className="text-xs text-gray-600">Impact</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-bold text-gray-900">{alert.metrics.urgency}%</div>
                      <div className="text-xs text-gray-600">Urgency</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-bold text-gray-900">{alert.metrics.probability}%</div>
                      <div className="text-xs text-gray-600">Probability</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.status === 'active' && (
                      <Button
                        onClick={() => acknowledgeAlert(alert.id)}
                        variant="secondary"
                        size="sm"
                      >
                        <Eye className="mr-2" size={14} />
                        Acknowledge
                      </Button>
                    )}
                    
                    {(alert.status === 'active' || alert.status === 'acknowledged') && (
                      <Button
                        onClick={() => resolveAlert(alert.id)}
                        variant="primary"
                        size="sm"
                      >
                        <CheckCircle className="mr-2" size={14} />
                        Resolve
                      </Button>
                    )}
                    
                    {alert.status !== 'escalated' && alert.status !== 'resolved' && (
                      <Button
                        onClick={() => escalateAlert(alert.id)}
                        variant="secondary"
                        size="sm"
                      >
                        <TrendingUp className="mr-2" size={14} />
                        Escalate
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Alert Details */}
        <div className="space-y-4">
          {selectedAlertData ? (
            <>
              <Card variant="elevated" padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Triggered:</span>
                        <span>{formatTimestamp(selectedAlertData.triggeredAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span>{formatTimestamp(selectedAlertData.lastUpdated)}</span>
                      </div>
                      {selectedAlertData.responseTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Response Time:</span>
                          <span>{selectedAlertData.responseTime}m</span>
                        </div>
                      )}
                      {selectedAlertData.resolutionTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Resolution Time:</span>
                          <span>{selectedAlertData.resolutionTime}m</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Affected Systems</h4>
                    <div className="space-y-1">
                      {selectedAlertData.affectedSystems.map((system, index) => (
                        <Badge key={index} variant="info" size="sm">
                          {system}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Risk Assessment</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Impact</span>
                          <span>{selectedAlertData.metrics.impact}%</span>
                        </div>
                        <ProgressBar value={selectedAlertData.metrics.impact} variant="danger" className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Urgency</span>
                          <span>{selectedAlertData.metrics.urgency}%</span>
                        </div>
                        <ProgressBar value={selectedAlertData.metrics.urgency} variant="warning" className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Probability</span>
                          <span>{selectedAlertData.metrics.probability}%</span>
                        </div>
                        <ProgressBar value={selectedAlertData.metrics.probability} variant="success" className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                
                <div className="space-y-3">
                  {selectedAlertData.actions.map(action => (
                    <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{action.title}</span>
                          <Badge variant={getActionStatusColor(action.status)} size="sm">
                            {action.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          {action.type} • {action.estimatedTime && `${action.estimatedTime}m estimated`}
                        </div>
                      </div>
                      
                      {action.status === 'in-progress' && (
                        <div className="ml-4">
                          <div className="animate-spin">
                            <Settings size={16} className="text-blue-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card variant="elevated" padding="lg">
              <div className="text-center text-gray-500">
                <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select an alert to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertCenter;
