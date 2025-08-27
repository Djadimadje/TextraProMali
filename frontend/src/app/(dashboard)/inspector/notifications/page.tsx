'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import InspectorSidebar from '../../../../../components/layout/InspectorSidebar';
import Header from '../../../../../components/layout/Header';
import Card from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import Badge from '../../../../../components/ui/Badge';
import { 
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Settings,
  Filter,
  X,
  Eye,
  Archive,
  Search,
  Plus,
  Target,
  Zap,
  Wrench,
  TrendingUp,
  Mail,
  BellRing,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'quality_alert' | 'inspection_reminder' | 'machine_status' | 'deadline' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  relatedEntity?: {
    type: 'batch' | 'machine' | 'inspection';
    id: string;
    name: string;
  };
  source: string;
}

interface NotificationSettings {
  qualityAlerts: boolean;
  inspectionReminders: boolean;
  machineStatus: boolean;
  deadlineAlerts: boolean;
  systemUpdates: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
  browserNotifications: boolean;
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'reminders' | 'alerts' | 'settings'>('inbox');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    qualityAlerts: true,
    inspectionReminders: true,
    machineStatus: true,
    deadlineAlerts: true,
    systemUpdates: false,
    emailNotifications: true,
    soundEnabled: true,
    browserNotifications: true
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    
    // Mock notifications data
    const mockNotifications: Notification[] = [
      {
        id: 'N001',
        type: 'quality_alert',
        priority: 'critical',
        title: 'Critical Quality Issue Detected',
        message: 'Machine M001 showing defect rate above 5% threshold. Immediate inspection required.',
        timestamp: '2025-08-25T14:30:00Z',
        read: false,
        actionRequired: true,
        relatedEntity: { type: 'machine', id: 'M001', name: 'Loom A1' },
        source: 'Quality Control System'
      },
      {
        id: 'N002',
        type: 'inspection_reminder',
        priority: 'high',
        title: 'Monthly Inspection Due',
        message: 'Monthly quality inspection for Batch B-2024-003 is due in 2 hours.',
        timestamp: '2025-08-25T14:15:00Z',
        read: false,
        actionRequired: true,
        relatedEntity: { type: 'batch', id: 'B-2024-003', name: 'Cotton Fabric Batch' },
        source: 'Inspection Scheduler'
      },
      {
        id: 'N003',
        type: 'machine_status',
        priority: 'medium',
        title: 'Machine Maintenance Completed',
        message: 'Machine M003 maintenance has been completed and is ready for inspection.',
        timestamp: '2025-08-25T13:45:00Z',
        read: true,
        actionRequired: false,
        relatedEntity: { type: 'machine', id: 'M003', name: 'Dyeing Machine C1' },
        source: 'Maintenance Team'
      },
      {
        id: 'N004',
        type: 'deadline',
        priority: 'high',
        title: 'Inspection Report Deadline',
        message: 'Quality report for batch BAT-2025-0342 must be submitted by end of day.',
        timestamp: '2025-08-25T13:30:00Z',
        read: false,
        actionRequired: true,
        relatedEntity: { type: 'batch', id: 'BAT-2025-0342', name: 'Blended Fabric' },
        source: 'Quality Management'
      },
      {
        id: 'N005',
        type: 'system',
        priority: 'low',
        title: 'AI Model Updated',
        message: 'Quality detection model v2.1 has been deployed with improved accuracy.',
        timestamp: '2025-08-25T12:00:00Z',
        read: true,
        actionRequired: false,
        source: 'System Administrator'
      },
      {
        id: 'N006',
        type: 'quality_alert',
        priority: 'medium',
        title: 'Pattern Anomaly Detected',
        message: 'Unusual defect pattern detected in textile batch T-2024-045. Review recommended.',
        timestamp: '2025-08-25T11:30:00Z',
        read: false,
        actionRequired: true,
        relatedEntity: { type: 'batch', id: 'T-2024-045', name: 'Printed Fabric' },
        source: 'AI Analysis System'
      }
    ];

    setNotifications(mockNotifications);
    setLoading(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quality_alert': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'inspection_reminder': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'machine_status': return <Wrench className="w-5 h-5 text-yellow-600" />;
      case 'deadline': return <Calendar className="w-5 h-5 text-red-600" />;
      case 'system': return <Zap className="w-5 h-5 text-green-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filterType !== 'all' && notification.type !== filterType) return false;
    if (filterPriority !== 'all' && notification.priority !== filterPriority) return false;
    if (showUnreadOnly && notification.read) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (!user || user.role !== 'inspector') {
    return <div>Access denied.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <InspectorSidebar />
        
        <main className="flex-1 ml-64">
          <Header title="Notifications" />
          
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">
                  Stay updated with quality alerts, inspection reminders, and system updates
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Bell className="w-4 h-4" />
                  <span>{unreadCount} unread</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <Target className="w-4 h-4" />
                  <span>{actionRequiredCount} require action</span>
                </div>
                <Button variant="secondary" size="sm" onClick={markAllAsRead}>
                  <CheckCircle className="mr-2" size={16} />
                  Mark All Read
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { key: 'inbox', label: 'Inbox', icon: Mail },
                  { key: 'reminders', label: 'Reminders', icon: Clock },
                  { key: 'alerts', label: 'Quality Alerts', icon: AlertTriangle },
                  { key: 'settings', label: 'Settings', icon: Settings }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === key
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                    {key === 'inbox' && unreadCount > 0 && (
                      <Badge variant="danger" size="sm">{unreadCount}</Badge>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Inbox Tab */}
            {activeTab === 'inbox' && (
              <div className="space-y-6">
                {/* Filters */}
                <Card padding="lg">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>
                    
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="quality_alert">Quality Alerts</option>
                      <option value="inspection_reminder">Inspection Reminders</option>
                      <option value="machine_status">Machine Status</option>
                      <option value="deadline">Deadlines</option>
                      <option value="system">System Updates</option>
                    </select>

                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Priorities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={showUnreadOnly}
                        onChange={(e) => setShowUnreadOnly(e.target.checked)}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      Unread only
                    </label>
                  </div>
                </Card>

                {/* Notifications List */}
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      padding="lg"
                      className={`transition-all hover:shadow-md ${
                        !notification.read ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </h3>
                                <Badge variant={getPriorityColor(notification.priority) as any} size="sm">
                                  {notification.priority}
                                </Badge>
                                {notification.actionRequired && (
                                  <Badge variant="warning" size="sm">Action Required</Badge>
                                )}
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{formatTimestamp(notification.timestamp)}</span>
                                <span>From: {notification.source}</span>
                                {notification.relatedEntity && (
                                  <span>
                                    Related: {notification.relatedEntity.name} ({notification.relatedEntity.type})
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {notification.actionRequired && (
                            <div className="flex gap-2 pt-3 border-t border-gray-200">
                              <Button variant="primary" size="sm">
                                Take Action
                              </Button>
                              <Button variant="secondary" size="sm">
                                View Details
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}

                  {filteredNotifications.length === 0 && (
                    <Card padding="lg">
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">No notifications found</p>
                        <p>You're all caught up!</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'qualityAlerts', label: 'Quality Alerts', description: 'Get notified about quality issues and defects' },
                          { key: 'inspectionReminders', label: 'Inspection Reminders', description: 'Reminders for scheduled inspections' },
                          { key: 'machineStatus', label: 'Machine Status Updates', description: 'Updates about machine maintenance and status' },
                          { key: 'deadlineAlerts', label: 'Deadline Alerts', description: 'Notifications about approaching deadlines' },
                          { key: 'systemUpdates', label: 'System Updates', description: 'Information about system changes and updates' }
                        ].map(({ key, label, description }) => (
                          <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200">
                            <div>
                              <div className="font-medium text-gray-900">{label}</div>
                              <div className="text-sm text-gray-600">{description}</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings[key as keyof NotificationSettings] as boolean}
                                onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Preferences</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                          { key: 'soundEnabled', label: 'Sound Notifications', description: 'Play sound for new notifications' },
                          { key: 'browserNotifications', label: 'Browser Notifications', description: 'Show browser push notifications' }
                        ].map(({ key, label, description }) => (
                          <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200">
                            <div>
                              <div className="font-medium text-gray-900">{label}</div>
                              <div className="text-sm text-gray-600">{description}</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings[key as keyof NotificationSettings] as boolean}
                                onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="secondary">
                      Reset to Defaults
                    </Button>
                    <Button variant="primary">
                      Save Settings
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
