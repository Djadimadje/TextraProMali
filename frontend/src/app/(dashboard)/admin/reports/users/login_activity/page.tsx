'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../../contexts/AuthContext';
import AdminSidebar from '../../../../../../../components/layout/AdminSidebar';
import Header from '../../../../../../../components/layout/Header';
import { exportService } from '../../../../../../../services/exportService';
import Button from '../../../../../../../components/ui/Button';
import Card from '../../../../../../../components/ui/Card';
import CardContent from '../../../../../../../components/ui/CardContent';
import { CardHeader, CardTitle } from '../../../../../../../components/ui/CardComponents';
import Badge from '../../../../../../../components/ui/Badge';
import { 
  Activity, 
  ArrowLeft,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  Download
} from 'lucide-react';

const LoginActivityPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  // Demo data for login activity
  const activityData = {
    summary: {
      total_logins_today: 8,
      unique_users_today: 6,
      total_logins_week: 45,
      unique_users_week: 12,
      average_session_duration: "2h 15m"
    },
    recent_activity: [
      { user: 'admin1', name: 'Administrator', role: 'admin', login_time: '2025-08-25T10:30:00Z', status: 'active' },
      { user: 'supervisor1', name: 'Production Supervisor', role: 'supervisor', login_time: '2025-08-25T09:15:00Z', status: 'active' },
      { user: 'analyst2', name: 'Quality Analyst 2', role: 'analyst', login_time: '2025-08-25T08:45:00Z', status: 'active' },
      { user: 'inspector3', name: 'Inspector 3', role: 'inspector', login_time: '2025-08-25T08:30:00Z', status: 'offline' },
      { user: 'inspector1', name: 'Inspector 1', role: 'inspector', login_time: '2025-08-25T07:20:00Z', status: 'offline' },
    ],
    inactive_users: [
      { user: 'analyst3', name: 'Quality Analyst 3', role: 'analyst', last_login: '2025-08-20T14:30:00Z', days_inactive: 5 },
      { user: 'inspector4', name: 'Inspector 4', role: 'inspector', last_login: '2025-08-18T16:45:00Z', days_inactive: 7 },
    ]
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      setTimeout(() => setLoading(false), 1000);
    }
  }, [authLoading, user, isAuthenticated]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' = 'excel') => {
    try {
      setLoading(true);
      
      // Prepare data for export
      const exportData = [
        ...activityData.recent_activity.map(activity => ({
          type: 'Recent Login',
          user_name: activity.name,
          username: activity.user,
          role: activity.role,
          login_time: formatTime(activity.login_time),
          status: activity.status,
          date: formatDate(activity.login_time)
        })),
        ...activityData.inactive_users.map(user => ({
          type: 'Inactive User',
          user_name: user.name,
          username: user.user,
          role: user.role,
          login_time: formatDate(user.last_login),
          status: 'inactive',
          date: `${user.days_inactive} days ago`
        }))
      ];

      const headers = {
        type: 'Activity Type',
        user_name: 'Full Name',
        username: 'Username',
        role: 'Role',
        login_time: 'Login Time',
        status: 'Status',
        date: 'Date/Days Ago'
      };

      const options = {
        filename: `login_activity_${new Date().toISOString().split('T')[0]}`,
        title: 'Login Activity Report',
        headers
      };

      if (format === 'excel') {
        await exportService.exportToExcel(exportData, options);
      } else if (format === 'csv') {
        exportService.exportToCSV(exportData, options);
      } else if (format === 'pdf') {
        await exportService.exportToPDF(exportData, options);
      }
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center ml-[240px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading login activity...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col items-center justify-center ml-[240px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access user reports.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-[240px]">
        <Header 
          userRole="admin"
          title="Login Activity Report"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <button 
                      onClick={() => window.location.href = '/admin/reports'}
                      className="inline-flex items-center text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to Reports
                    </button>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">📈 Login Activity Report</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    User login patterns, session activity, and system usage analytics
                  </p>
                </div>
                
                {/* Export Actions */}
                <div className="flex space-x-3">
                  <Button
                    onClick={() => handleExport('excel')}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                  <Button
                    onClick={() => handleExport('pdf')}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Logins Today</p>
                      <p className="text-2xl font-bold">{activityData.summary.total_logins_today}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Users Today</p>
                      <p className="text-2xl font-bold">{activityData.summary.unique_users_today}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Weekly Logins</p>
                      <p className="text-2xl font-bold">{activityData.summary.total_logins_week}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Weekly Active Users</p>
                      <p className="text-2xl font-bold">{activityData.summary.unique_users_week}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Session</p>
                      <p className="text-2xl font-bold">{activityData.summary.average_session_duration}</p>
                    </div>
                    <Clock className="h-8 w-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Recent Login Activity (Today)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Login Time</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityData.recent_activity.map((activity, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{activity.name}</div>
                              <div className="text-gray-500 text-xs">@{activity.user}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={
                              activity.role === 'admin' ? 'danger' :
                              activity.role === 'supervisor' ? 'warning' :
                              activity.role === 'analyst' ? 'info' : 'success'
                            }>
                              {activity.role.charAt(0).toUpperCase() + activity.role.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="h-3 w-3" />
                              {formatTime(activity.login_time)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={activity.status === 'active' ? 'success' : 'default'}>
                              {activity.status === 'active' ? '🟢 Online' : '⚫ Offline'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Inactive Users */}
            <Card>
              <CardHeader>
                <CardTitle>Inactive Users (Haven't logged in recently)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Last Login</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Days Inactive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityData.inactive_users.map((user, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-gray-500 text-xs">@{user.user}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={user.role === 'analyst' ? 'info' : 'success'}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="h-3 w-3" />
                              {formatDate(user.last_login)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="warning">
                              {user.days_inactive} days ago
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginActivityPage;
