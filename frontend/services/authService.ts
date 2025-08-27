/**
 * Authentication Service for TexPro AI
 * Handles all authentication-related API calls
 */

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    employeeId?: string;
    department?: string;
  };
  token: string;
  refreshToken: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  employeeId?: string;
  department?: string;
}

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  }

  private getHeaders(includeAuth = false) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/logout/`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      console.warn('Logout request failed, but continuing with local cleanup');
    }

    // Clear local storage regardless of API response
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  async refreshToken(): Promise<{ token: string }> {
    const refreshToken = localStorage.getItem('texproai_refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  }

  async getProfile(): Promise<LoginResponse['user']> {
    const response = await fetch(`${this.baseUrl}/auth/profile/`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  }

  async updateProfile(data: Partial<LoginResponse['user']>): Promise<LoginResponse['user']> {
    const response = await fetch(`${this.baseUrl}/auth/profile/`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Profile update failed');
    }

    return response.json();
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/change-password/`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password change failed');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/forgot-password/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset request failed');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/reset-password/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        token,
        newPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset failed');
    }
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register/`, {
      method: 'POST',
      headers: this.getHeaders(true), // Requires admin authentication
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  isTokenValid(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      // Basic check - in a real app, you'd validate the JWT properly
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  getStoredUser(): LoginResponse['user'] | null {
    const userData = localStorage.getItem('texproai_user_data');
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
