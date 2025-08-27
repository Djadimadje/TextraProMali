'use client';
import React, { useState } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Archive,
  MoreVertical,
  Eye,
  EyeOff,
  Trash2,
  Star,
  Reply,
  Forward,
  ExternalLink,
  Filter,
  Search
} from 'lucide-react';

interface NotificationListProps {
  filters: any;
  refreshData: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'unread' | 'read' | 'archived';
  timestamp: string;
  source: string;
  department: string;
  isStarred: boolean;
  hasActions: boolean;
  actionUrl?: string;
  attachments?: number;
  relatedItems?: string[];
}

const NotificationList: React.FC<NotificationListProps> = ({ filters, refreshData }) => {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'timestamp' | 'priority' | 'category'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);

  // Mock data - replace with actual API call
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Production Line A Efficiency Alert',
      message: 'Production efficiency has dropped below 85% threshold. Current efficiency: 82.3%. Immediate attention required to prevent further decline.',
      category: 'alerts',
      priority: 'critical',
      status: 'unread',
      timestamp: '2025-08-25T14:30:00Z',
      source: 'Machine Sensors',
      department: 'Production Line A',
      isStarred: true,
      hasActions: true,
      actionUrl: '/dashboard/analyst/machines',
      attachments: 2,
      relatedItems: ['Machine-A1', 'Operator-001']
    },
    {
      id: '2',
      title: 'Daily Quality Report Generated',
      message: 'Quality control report for August 25, 2025 has been generated and is ready for review. Overall quality score: 94.2%.',
      category: 'reports',
      priority: 'medium',
      status: 'unread',
      timestamp: '2025-08-25T13:15:00Z',
      source: 'Scheduled Tasks',
      department: 'Quality Control',
      isStarred: false,
      hasActions: true,
      actionUrl: '/dashboard/analyst/reports',
      attachments: 1,
      relatedItems: ['QC-Report-082525']
    },
    {
      id: '3',
      title: 'Scheduled Maintenance Reminder',
      message: 'Maintenance for Production Line B is scheduled for tomorrow at 6:00 AM. Estimated duration: 4 hours. Please ensure proper preparation.',
      category: 'maintenance',
      priority: 'high',
      status: 'read',
      timestamp: '2025-08-25T12:00:00Z',
      source: 'Workflow Engine',
      department: 'Maintenance',
      isStarred: false,
      hasActions: true,
      actionUrl: '/dashboard/analyst/maintenance',
      relatedItems: ['Line-B', 'Maint-Schedule-001']
    },
    {
      id: '4',
      title: 'System Backup Completed',
      message: 'Daily system backup has been completed successfully. All data has been secured. Backup size: 2.3 GB.',
      category: 'system',
      priority: 'low',
      status: 'read',
      timestamp: '2025-08-25T11:30:00Z',
      source: 'System Alerts',
      department: 'Engineering',
      isStarred: false,
      hasActions: false
    },
    {
      id: '5',
      title: 'Quality Control Inspection Failed',
      message: 'Batch #457 failed quality inspection. Defect rate: 8.2%. Immediate review and corrective action required.',
      category: 'quality',
      priority: 'high',
      status: 'unread',
      timestamp: '2025-08-25T10:45:00Z',
      source: 'Manual Reports',
      department: 'Quality Control',
      isStarred: true,
      hasActions: true,
      actionUrl: '/dashboard/analyst/quality',
      relatedItems: ['Batch-457', 'Inspector-003']
    },
    {
      id: '6',
      title: 'Production Target Achievement',
      message: 'Production Line A has achieved 105% of daily target. Excellent performance! Total units produced: 1,260.',
      category: 'production',
      priority: 'low',
      status: 'read',
      timestamp: '2025-08-25T09:20:00Z',
      source: 'Machine Sensors',
      department: 'Production Line A',
      isStarred: false,
      hasActions: false
    },
    {
      id: '7',
      title: 'Workflow Optimization Suggestion',
      message: 'AI analysis suggests optimizing material flow in Station 3 could improve efficiency by 12%. Review recommended changes.',
      category: 'alerts',
      priority: 'medium',
      status: 'unread',
      timestamp: '2025-08-25T08:15:00Z',
      source: 'Integration APIs',
      department: 'Planning',
      isStarred: false,
      hasActions: true,
      actionUrl: '/dashboard/analyst/workflow',
      relatedItems: ['Station-3', 'AI-Analysis-001']
    },
    {
      id: '8',
      title: 'Safety Inspection Completed',
      message: 'Monthly safety inspection has been completed. All safety protocols are in compliance. No violations found.',
      category: 'reports',
      priority: 'low',
      status: 'archived',
      timestamp: '2025-08-25T07:00:00Z',
      source: 'Manual Reports',
      department: 'Safety',
      isStarred: false,
      hasActions: false
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'alerts': return <AlertTriangle size={16} />;
      case 'reports': return <CheckCircle size={16} />;
      case 'maintenance': return <Clock size={16} />;
      case 'quality': return <Star size={16} />;
      case 'production': return <Bell size={16} />;
      case 'system': return <Archive size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    setExpandedNotification(expandedNotification === notificationId ? null : notificationId);
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    setSelectedNotifications(
      selectedNotifications.length === notifications.length ? [] : notifications.map(n => n.id)
    );
  };

  const markAsRead = (notificationIds: string[]) => {
    // API call to mark notifications as read
    console.log('Mark as read:', notificationIds);
  };

  const markAsUnread = (notificationIds: string[]) => {
    // API call to mark notifications as unread
    console.log('Mark as unread:', notificationIds);
  };

  const archiveNotifications = (notificationIds: string[]) => {
    // API call to archive notifications
    console.log('Archive:', notificationIds);
  };

  const deleteNotifications = (notificationIds: string[]) => {
    // API call to delete notifications
    console.log('Delete:', notificationIds);
  };

  const toggleStar = (notificationId: string) => {
    // API call to toggle star
    console.log('Toggle star:', notificationId);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'timestamp':
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  return (
    <div className="space-y-4">
      {/* Search and Sort Controls */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="timestamp">Sort by Time</option>
              <option value="priority">Sort by Priority</option>
              <option value="category">Sort by Category</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
            </span>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => markAsRead(selectedNotifications)}
                variant="secondary"
                size="sm"
              >
                <Eye className="mr-2" size={16} />
                Mark Read
              </Button>
              <Button
                onClick={() => markAsUnread(selectedNotifications)}
                variant="secondary"
                size="sm"
              >
                <EyeOff className="mr-2" size={16} />
                Mark Unread
              </Button>
              <Button
                onClick={() => archiveNotifications(selectedNotifications)}
                variant="secondary"
                size="sm"
              >
                <Archive className="mr-2" size={16} />
                Archive
              </Button>
              <Button
                onClick={() => deleteNotifications(selectedNotifications)}
                variant="secondary"
                size="sm"
              >
                <Trash2 className="mr-2" size={16} />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-2">
        {/* Select All */}
        <Card padding="sm">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedNotifications.length === notifications.length}
              onChange={handleSelectAll}
              className="rounded border-gray-300"
            />
            <span className="text-gray-600">Select all notifications</span>
          </label>
        </Card>

        {sortedNotifications.map(notification => (
          <Card
            key={notification.id}
            padding="lg"
            className={`transition-all cursor-pointer ${
              notification.status === 'unread' 
                ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                : notification.status === 'archived'
                ? 'bg-gray-50 opacity-75'
                : 'hover:bg-gray-50'
            } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => handleSelectNotification(notification.id)}
                  className="mt-1 rounded border-gray-300"
                  onClick={(e) => e.stopPropagation()}
                />
                
                <button
                  onClick={() => toggleStar(notification.id)}
                  className={`mt-1 ${notification.isStarred ? 'text-yellow-500' : 'text-gray-300'}`}
                  title={notification.isStarred ? 'Remove star' : 'Add star'}
                >
                  <Star size={16} fill={notification.isStarred ? 'currentColor' : 'none'} />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getCategoryIcon(notification.category)}
                        <h3 
                          className={`text-sm font-medium cursor-pointer ${
                            notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                          }`}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          {notification.title}
                        </h3>
                        <Badge variant={getPriorityColor(notification.priority)} size="sm">
                          {notification.priority}
                        </Badge>
                      </div>
                      
                      <p className={`text-sm ${
                        notification.status === 'unread' ? 'text-gray-800' : 'text-gray-600'
                      } ${expandedNotification === notification.id ? '' : 'line-clamp-2'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{formatTimestamp(notification.timestamp)}</span>
                        <span>{notification.source}</span>
                        <span>{notification.department}</span>
                        {notification.attachments && (
                          <span>📎 {notification.attachments}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {notification.hasActions && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => notification.actionUrl && window.open(notification.actionUrl, '_blank')}
                        >
                          <ExternalLink className="mr-2" size={14} />
                          View
                        </Button>
                      )}
                      
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>

                  {expandedNotification === notification.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Details</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Category: <Badge variant="default" size="sm">{notification.category}</Badge></div>
                            <div>Source: {notification.source}</div>
                            <div>Department: {notification.department}</div>
                            <div>Status: <Badge variant={notification.status === 'unread' ? 'warning' : 'success'} size="sm">{notification.status}</Badge></div>
                          </div>
                        </div>
                        
                        {notification.relatedItems && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Related Items</h4>
                            <div className="space-y-1">
                              {notification.relatedItems.map((item, index) => (
                                <Badge key={index} variant="info" size="sm">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <Button variant="secondary" size="sm">
                          <Reply className="mr-2" size={14} />
                          Reply
                        </Button>
                        <Button variant="secondary" size="sm">
                          <Forward className="mr-2" size={14} />
                          Forward
                        </Button>
                        <Button variant="secondary" size="sm">
                          <Archive className="mr-2" size={14} />
                          Archive
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center py-4">
        <Button variant="secondary">
          Load More Notifications
        </Button>
      </div>
    </div>
  );
};

export default NotificationList;
