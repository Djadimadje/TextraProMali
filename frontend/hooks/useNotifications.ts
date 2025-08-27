'use client';
import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  module?: string;
  actionUrl?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Sample notifications for development
  const sampleNotifications: Notification[] = [
    {
      id: '1',
      type: 'error',
      title: 'Machine Breakdown',
      message: 'Machine M-102 has stopped unexpectedly',
      timeAgo: '5 minutes ago',
      isRead: false,
      priority: 'critical',
      module: 'machines',
      actionUrl: '/machines/M-102'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Maintenance Due',
      message: 'Machine M-105 requires scheduled maintenance',
      timeAgo: '1 hour ago',
      isRead: false,
      priority: 'high',
      module: 'maintenance'
    },
    {
      id: '3',
      type: 'info',
      title: 'Quality Check Complete',
      message: 'Batch #B-2024-001 passed quality inspection',
      timeAgo: '2 hours ago',
      isRead: true,
      priority: 'medium',
      module: 'quality'
    },
    {
      id: '4',
      type: 'success',
      title: 'Production Target Met',
      message: 'Line 3 exceeded daily production target by 15%',
      timeAgo: '3 hours ago',
      isRead: true,
      priority: 'low',
      module: 'workflow'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchNotifications = async () => {
      setIsLoading(true);
      
      // TODO: Replace with actual API call
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        setNotifications(sampleNotifications);
        
        const unread = sampleNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const getNotificationsByType = (type: Notification['type']) => {
    return notifications.filter(notification => notification.type === type);
  };

  const getNotificationsByPriority = (priority: Notification['priority']) => {
    return notifications.filter(notification => notification.priority === priority);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.isRead);
  };

  const getCriticalNotifications = () => {
    return notifications.filter(notification => 
      notification.priority === 'critical' && !notification.isRead
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const iconMap = {
      info: '🔵',
      warning: '⚠️',
      error: '🔴',
      success: '✅'
    };
    return iconMap[type];
  };

  const getNotificationColor = (type: Notification['type']) => {
    const colorMap = {
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      success: 'bg-green-100 text-green-800 border-green-200'
    };
    return colorMap[type];
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    const colorMap = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colorMap[priority];
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    getNotificationsByType,
    getNotificationsByPriority,
    getUnreadNotifications,
    getCriticalNotifications,
    getNotificationIcon,
    getNotificationColor,
    getPriorityColor
  };
};
