// Notifications Service - Managing system notifications
import { BASE_URL } from '../lib/constants';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

class NotificationsService {
  private baseUrl = `${BASE_URL}/notifications`;

  async getNotifications(filters?: {
    isRead?: boolean;
    type?: string;
    priority?: string;
    limit?: number;
  }): Promise<Notification[]> {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    return response.json();
  }

  async markAsRead(notificationId: string): Promise<void> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/${notificationId}/read/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to mark notification as read: ${response.statusText}`);
    }
  }

  async markAllAsRead(): Promise<void> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/mark-all-read/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/${notificationId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete notification: ${response.statusText}`);
    }
  }
}

export const notificationsService = new NotificationsService();
