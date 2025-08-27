'use client';
import React, { useState } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { 
  Settings, 
  Bell, 
  Mail,
  Phone,
  Smartphone,
  Monitor,
  Users,
  Clock,
  Filter,
  Volume2,
  VolumeX,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Calendar,
  Globe,
  Shield,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit,
  Copy,
  User,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface NotificationSettingsProps {
  filters: any;
  refreshData: () => void;
}

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'dashboard' | 'webhook';
  enabled: boolean;
  priority: 'all' | 'high' | 'critical';
  schedule: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    days: string[];
  };
  settings: {
    [key: string]: any;
  };
}

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: {
    category: string[];
    severity: string[];
    department: string[];
    keywords: string[];
  };
  actions: {
    channels: string[];
    escalation: boolean;
    escalationTime: number;
    assignees: string[];
  };
  frequency: {
    type: 'immediate' | 'batched' | 'digest';
    interval?: number;
    maxPerHour?: number;
  };
}

interface UserPreference {
  category: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  dashboard: boolean;
  priority: 'all' | 'high' | 'critical';
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ filters, refreshData }) => {
  const [activeTab, setActiveTab] = useState<'channels' | 'rules' | 'preferences' | 'teams'>('channels');
  const [editingChannel, setEditingChannel] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);

  // Mock data - replace with actual API calls
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'email-primary',
      name: 'Primary Email',
      type: 'email',
      enabled: true,
      priority: 'all',
      schedule: {
        enabled: false,
        startTime: '09:00',
        endTime: '18:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      settings: {
        address: 'admin@textpro.com',
        format: 'html',
        includeAttachments: true
      }
    },
    {
      id: 'sms-emergency',
      name: 'Emergency SMS',
      type: 'sms',
      enabled: true,
      priority: 'critical',
      schedule: {
        enabled: false,
        startTime: '00:00',
        endTime: '23:59',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      settings: {
        number: '+1234567890',
        provider: 'twilio'
      }
    },
    {
      id: 'push-mobile',
      name: 'Mobile Push',
      type: 'push',
      enabled: true,
      priority: 'high',
      schedule: {
        enabled: true,
        startTime: '08:00',
        endTime: '20:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      settings: {
        sound: 'default',
        vibration: true,
        badge: true
      }
    },
    {
      id: 'webhook-slack',
      name: 'Slack Integration',
      type: 'webhook',
      enabled: true,
      priority: 'all',
      schedule: {
        enabled: false,
        startTime: '09:00',
        endTime: '18:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      settings: {
        url: 'https://hooks.slack.com/services/...',
        channel: '#alerts',
        username: 'TextPro Bot'
      }
    }
  ]);

  const [rules, setRules] = useState<NotificationRule[]>([
    {
      id: 'rule-critical',
      name: 'Critical Alerts',
      description: 'All critical alerts require immediate notification across all channels',
      enabled: true,
      conditions: {
        category: [],
        severity: ['critical'],
        department: [],
        keywords: []
      },
      actions: {
        channels: ['email-primary', 'sms-emergency', 'push-mobile', 'webhook-slack'],
        escalation: true,
        escalationTime: 15,
        assignees: ['john.smith@textpro.com', 'sarah.johnson@textpro.com']
      },
      frequency: {
        type: 'immediate'
      }
    },
    {
      id: 'rule-production',
      name: 'Production Issues',
      description: 'Production-related alerts during business hours',
      enabled: true,
      conditions: {
        category: ['Equipment Failure', 'Quality Issue'],
        severity: ['high', 'medium'],
        department: ['Production Line A', 'Production Line B'],
        keywords: ['production', 'line', 'equipment']
      },
      actions: {
        channels: ['email-primary', 'push-mobile'],
        escalation: false,
        escalationTime: 30,
        assignees: ['production.manager@textpro.com']
      },
      frequency: {
        type: 'batched',
        interval: 15,
        maxPerHour: 4
      }
    },
    {
      id: 'rule-maintenance',
      name: 'Maintenance Notifications',
      description: 'Scheduled maintenance reminders and updates',
      enabled: true,
      conditions: {
        category: ['Maintenance'],
        severity: ['medium', 'low'],
        department: ['Maintenance'],
        keywords: ['scheduled', 'maintenance', 'preventive']
      },
      actions: {
        channels: ['email-primary'],
        escalation: false,
        escalationTime: 60,
        assignees: ['maintenance.team@textpro.com']
      },
      frequency: {
        type: 'digest',
        interval: 60
      }
    }
  ]);

  const [userPreferences, setUserPreferences] = useState<UserPreference[]>([
    {
      category: 'Equipment Failure',
      email: true,
      sms: true,
      push: true,
      dashboard: true,
      priority: 'all'
    },
    {
      category: 'Quality Issue',
      email: true,
      sms: false,
      push: true,
      dashboard: true,
      priority: 'high'
    },
    {
      category: 'Maintenance',
      email: true,
      sms: false,
      push: false,
      dashboard: true,
      priority: 'high'
    },
    {
      category: 'Sensor Issue',
      email: true,
      sms: false,
      push: true,
      dashboard: true,
      priority: 'all'
    },
    {
      category: 'Network',
      email: false,
      sms: false,
      push: false,
      dashboard: true,
      priority: 'critical'
    }
  ]);

  const channelIcons = {
    email: Mail,
    sms: Phone,
    push: Smartphone,
    dashboard: Monitor,
    webhook: Globe
  };

  const getChannelIcon = (type: string) => {
    const IconComponent = channelIcons[type as keyof typeof channelIcons] || Bell;
    return <IconComponent size={20} />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'all': return 'success';
      default: return 'default';
    }
  };

  const toggleChannel = (channelId: string) => {
    setChannels(channels.map(channel =>
      channel.id === channelId
        ? { ...channel, enabled: !channel.enabled }
        : channel
    ));
  };

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(rule =>
      rule.id === ruleId
        ? { ...rule, enabled: !rule.enabled }
        : rule
    ));
  };

  const updateUserPreference = (category: string, field: string, value: any) => {
    setUserPreferences(userPreferences.map(pref =>
      pref.category === category
        ? { ...pref, [field]: value }
        : pref
    ));
  };

  const saveSettings = () => {
    console.log('Saving notification settings...');
    // API call to save settings
  };

  const resetSettings = () => {
    console.log('Resetting notification settings...');
    // Reset to default values
  };

  const testChannel = (channelId: string) => {
    console.log('Testing channel:', channelId);
    // Send test notification
  };

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <Card padding="lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure how and when you receive notifications
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={resetSettings} variant="secondary" size="sm">
              <RotateCcw className="mr-2" size={16} />
              Reset
            </Button>
            <Button onClick={saveSettings} variant="primary" size="sm">
              <Save className="mr-2" size={16} />
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* Settings Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'channels', label: 'Channels', icon: Bell },
              { key: 'rules', label: 'Rules', icon: Filter },
              { key: 'preferences', label: 'Preferences', icon: User },
              { key: 'teams', label: 'Teams', icon: Users }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Channels Tab */}
          {activeTab === 'channels' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Notification Channels</h3>
                <Button onClick={() => setShowAddChannel(true)} variant="primary" size="sm">
                  <Plus className="mr-2" size={16} />
                  Add Channel
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channels.map(channel => (
                  <Card key={channel.id} variant="elevated" padding="lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${channel.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {getChannelIcon(channel.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{channel.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getPriorityColor(channel.priority)} size="sm">
                              {channel.priority}
                            </Badge>
                            <span className="text-sm text-gray-500 capitalize">{channel.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleChannel(channel.id)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            channel.enabled ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              channel.enabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      {channel.type === 'email' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{channel.settings.address}</span>
                        </div>
                      )}
                      
                      {channel.type === 'sms' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Number:</span>
                          <span className="font-medium">{channel.settings.number}</span>
                        </div>
                      )}
                      
                      {channel.type === 'webhook' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Channel:</span>
                          <span className="font-medium">{channel.settings.channel}</span>
                        </div>
                      )}

                      {channel.schedule.enabled && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Schedule:</span>
                          <span className="font-medium">
                            {channel.schedule.startTime} - {channel.schedule.endTime}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                      <Button onClick={() => testChannel(channel.id)} variant="secondary" size="sm">
                        <Zap className="mr-2" size={14} />
                        Test
                      </Button>
                      <Button onClick={() => setEditingChannel(channel.id)} variant="secondary" size="sm">
                        <Edit className="mr-2" size={14} />
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Copy className="mr-2" size={14} />
                        Duplicate
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Notification Rules</h3>
                <Button onClick={() => setShowAddRule(true)} variant="primary" size="sm">
                  <Plus className="mr-2" size={16} />
                  Add Rule
                </Button>
              </div>

              <div className="space-y-4">
                {rules.map(rule => (
                  <Card key={rule.id} variant="elevated" padding="lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{rule.name}</h4>
                          <Badge variant={rule.enabled ? 'success' : 'default'} size="sm">
                            {rule.enabled ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{rule.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            rule.enabled ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              rule.enabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Conditions</h5>
                        <div className="space-y-1">
                          {rule.conditions.severity.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">Severity:</span>
                              {rule.conditions.severity.map(s => (
                                <Badge key={s} variant={getPriorityColor(s)} size="sm">{s}</Badge>
                              ))}
                            </div>
                          )}
                          {rule.conditions.category.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">Category:</span>
                              {rule.conditions.category.map(c => (
                                <Badge key={c} variant="info" size="sm">{c}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Channels</h5>
                        <div className="space-y-1">
                          {rule.actions.channels.map(channelId => {
                            const channel = channels.find(c => c.id === channelId);
                            return channel ? (
                              <div key={channelId} className="flex items-center gap-2">
                                {getChannelIcon(channel.type)}
                                <span className="text-gray-600">{channel.name}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Frequency</h5>
                        <div className="text-gray-600">
                          <div className="capitalize">{rule.frequency.type}</div>
                          {rule.frequency.interval && (
                            <div className="text-xs">Every {rule.frequency.interval}m</div>
                          )}
                          {rule.frequency.maxPerHour && (
                            <div className="text-xs">Max {rule.frequency.maxPerHour}/hour</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                      <Button onClick={() => setEditingRule(rule.id)} variant="secondary" size="sm">
                        <Edit className="mr-2" size={14} />
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Copy className="mr-2" size={14} />
                        Duplicate
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Trash2 className="mr-2" size={14} />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Personal Preferences</h3>

              <Card variant="elevated" padding="lg">
                <h4 className="font-medium text-gray-900 mb-4">Category Preferences</h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-medium text-gray-900">Category</th>
                        <th className="text-center py-2 font-medium text-gray-900">Email</th>
                        <th className="text-center py-2 font-medium text-gray-900">SMS</th>
                        <th className="text-center py-2 font-medium text-gray-900">Push</th>
                        <th className="text-center py-2 font-medium text-gray-900">Dashboard</th>
                        <th className="text-center py-2 font-medium text-gray-900">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userPreferences.map(pref => (
                        <tr key={pref.category} className="border-b border-gray-100">
                          <td className="py-3 font-medium text-gray-900">{pref.category}</td>
                          <td className="py-3 text-center">
                            <input
                              type="checkbox"
                              checked={pref.email}
                              onChange={(e) => updateUserPreference(pref.category, 'email', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-3 text-center">
                            <input
                              type="checkbox"
                              checked={pref.sms}
                              onChange={(e) => updateUserPreference(pref.category, 'sms', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-3 text-center">
                            <input
                              type="checkbox"
                              checked={pref.push}
                              onChange={(e) => updateUserPreference(pref.category, 'push', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-3 text-center">
                            <input
                              type="checkbox"
                              checked={pref.dashboard}
                              onChange={(e) => updateUserPreference(pref.category, 'dashboard', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-3 text-center">
                            <select
                              value={pref.priority}
                              onChange={(e) => updateUserPreference(pref.category, 'priority', e.target.value)}
                              className="rounded border-gray-300 text-sm"
                            >
                              <option value="all">All</option>
                              <option value="high">High+</option>
                              <option value="critical">Critical</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card variant="elevated" padding="lg">
                <h4 className="font-medium text-gray-900 mb-4">Global Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-900">Do Not Disturb</label>
                        <p className="text-sm text-gray-600">Pause all non-critical notifications</p>
                      </div>
                      <button className="w-12 h-6 bg-gray-300 rounded-full">
                        <div className="w-5 h-5 bg-white rounded-full shadow translate-x-0.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-900">Sound Notifications</label>
                        <p className="text-sm text-gray-600">Play sound for new notifications</p>
                      </div>
                      <button className="w-12 h-6 bg-blue-600 rounded-full">
                        <div className="w-5 h-5 bg-white rounded-full shadow translate-x-6" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-900">Desktop Notifications</label>
                        <p className="text-sm text-gray-600">Show browser notifications</p>
                      </div>
                      <button className="w-12 h-6 bg-blue-600 rounded-full">
                        <div className="w-5 h-5 bg-white rounded-full shadow translate-x-6" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">Quiet Hours</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          defaultValue="22:00"
                          className="border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                        <span className="text-gray-600">to</span>
                        <input
                          type="time"
                          defaultValue="08:00"
                          className="border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-gray-900 mb-2">Notification Frequency</label>
                      <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                        <option>Immediate</option>
                        <option>Every 5 minutes</option>
                        <option>Every 15 minutes</option>
                        <option>Every hour</option>
                        <option>Daily digest</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-gray-900 mb-2">Max Notifications per Hour</label>
                      <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                        <option>Unlimited</option>
                        <option>20</option>
                        <option>10</option>
                        <option>5</option>
                        <option>3</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Team Notification Settings</h3>

              <Card variant="elevated" padding="lg">
                <h4 className="font-medium text-gray-900 mb-4">Escalation Matrix</h4>
                
                <div className="space-y-4">
                  {[
                    { level: 1, role: 'Team Lead', time: '15 minutes', members: ['John Smith', 'Sarah Johnson'] },
                    { level: 2, role: 'Department Manager', time: '30 minutes', members: ['Mike Wilson'] },
                    { level: 3, role: 'Operations Director', time: '60 minutes', members: ['Lisa Anderson'] }
                  ].map(escalation => (
                    <div key={escalation.level} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {escalation.level}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{escalation.role}</div>
                          <div className="text-sm text-gray-600">After {escalation.time}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {escalation.members.map((member, index) => (
                          <Badge key={index} variant="info" size="sm">
                            <UserCheck className="mr-1" size={12} />
                            {member}
                          </Badge>
                        ))}
                        <Button variant="secondary" size="sm">
                          <Edit className="mr-2" size={14} />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card variant="elevated" padding="lg">
                <h4 className="font-medium text-gray-900 mb-4">On-Call Schedule</h4>
                
                <div className="space-y-4">
                  {[
                    { day: 'Monday', primary: 'John Smith', backup: 'Sarah Johnson' },
                    { day: 'Tuesday', primary: 'Sarah Johnson', backup: 'Mike Wilson' },
                    { day: 'Wednesday', primary: 'Mike Wilson', backup: 'John Smith' },
                    { day: 'Thursday', primary: 'John Smith', backup: 'Sarah Johnson' },
                    { day: 'Friday', primary: 'Sarah Johnson', backup: 'Mike Wilson' },
                    { day: 'Saturday', primary: 'Mike Wilson', backup: 'John Smith' },
                    { day: 'Sunday', primary: 'John Smith', backup: 'Sarah Johnson' }
                  ].map(schedule => (
                    <div key={schedule.day} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                      <div className="font-medium text-gray-900 w-24">{schedule.day}</div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Primary:</span>
                          <Badge variant="success" size="sm">
                            <User className="mr-1" size={12} />
                            {schedule.primary}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Backup:</span>
                          <Badge variant="info" size="sm">
                            <User className="mr-1" size={12} />
                            {schedule.backup}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NotificationSettings;
