// Settings Service - System configuration and user preferences
import { BASE_URL } from '../lib/constants';

export interface SystemSettings {
  id: string;
  category: string;
  key: string;
  value: any;
  description: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  isEditable: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en';
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
}

class SettingsService {
  private baseUrl = `${BASE_URL}/settings`;

  async getSystemSettings(category?: string): Promise<SystemSettings[]> {
    const token = localStorage.getItem('token');
    const params = category ? new URLSearchParams({ category }) : '';
    
    const response = await fetch(`${this.baseUrl}/system/?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch system settings: ${response.statusText}`);
    }

    return response.json();
  }

  async updateSystemSetting(id: string, value: any): Promise<SystemSettings> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/system/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update system setting: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserPreferences(): Promise<UserPreferences> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/preferences/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user preferences: ${response.statusText}`);
    }

    return response.json();
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/preferences/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user preferences: ${response.statusText}`);
    }

    return response.json();
  }

  async backupDatabase(): Promise<{ backupId: string; status: string; }> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/backup/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to create backup: ${response.statusText}`);
    }

    return response.json();
  }
}

export const settingsService = new SettingsService();
