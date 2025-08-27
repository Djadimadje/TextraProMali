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
  TrendingUp, 
  ArrowLeft,
  Users,
  Award,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download
} from 'lucide-react';

const UserPerformancePage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  // Demo data for user performance
  const performanceData = {
    summary: {
      total_users: 14,
      active_performers: 12,
      high_performers: 5,
      avg_productivity_score: 87.3,
      completion_rate: 94.2
    },
    user_performance: [
      { 
        user: 'admin1', 
        name: 'Administrator', 
        role: 'admin', 
        productivity_score: 96,
        tasks_completed: 45,
        avg_response_time: '2.3 min',
        accuracy_rate: 98.5,
        last_activity: '2025-08-25T10:30:00Z',
        performance_trend: 'up'
      },
      { 
        user: 'supervisor1', 
        name: 'Production Supervisor', 
        role: 'supervisor', 
        productivity_score: 94,
        tasks_completed: 38,
        avg_response_time: '3.1 min',
        accuracy_rate: 96.2,
        last_activity: '2025-08-25T09:15:00Z',
        performance_trend: 'up'
      },
      { 
        user: 'analyst1', 
        name: 'Quality Analyst 1', 
        role: 'analyst', 
        productivity_score: 92,
        tasks_completed: 52,
        avg_response_time: '4.2 min',
        accuracy_rate: 97.8,
        last_activity: '2025-08-25T08:45:00Z',
        performance_trend: 'stable'
      },
      { 
        user: 'analyst2', 
        name: 'Quality Analyst 2', 
        role: 'analyst', 
        productivity_score: 89,
        tasks_completed: 48,
        avg_response_time: '4.8 min',
        accuracy_rate: 95.1,
        last_activity: '2025-08-25T08:30:00Z',
        performance_trend: 'up'
      },
      { 
        user: 'inspector1', 
        name: 'Inspector 1', 
        role: 'inspector', 
        productivity_score: 91,
        tasks_completed: 67,
        avg_response_time: '3.5 min',
        accuracy_rate: 96.9,
        last_activity: '2025-08-25T07:20:00Z',
        performance_trend: 'stable'
      },
      { 
        user: 'inspector2', 
        name: 'Inspector 2', 
        role: 'inspector', 
        productivity_score: 85,
        tasks_completed: 61,
        avg_response_time: '5.2 min',
        accuracy_rate: 93.4,
        last_activity: '2025-08-24T16:45:00Z',
        performance_trend: 'down'
      },
      { 
        user: 'inspector3', 
        name: 'Inspector 3', 
        role: 'inspector', 
        productivity_score: 88,
        tasks_completed: 59,
        avg_response_time: '4.6 min',
        accuracy_rate: 94.7,
        last_activity: '2025-08-24T15:30:00Z',
        performance_trend: 'stable'
      },
      { 
        user: 'analyst3', 
        name: 'Quality Analyst 3', 
        role: 'analyst', 
        productivity_score: 76,
        tasks_completed: 23,
        avg_response_time: '8.1 min',
        accuracy_rate: 89.2,
        last_activity: '2025-08-20T14:30:00Z',
        performance_trend: 'down'
      }
    ]
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      setTimeout(() => setLoading(false), 1000);
    }
  }, [authLoading, user, isAuthenticated]);

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return { variant: 'success' as const, label: 'Excellent' };
    if (score >= 80) return { variant: 'info' as const, label: 'Good' };
    if (score >= 70) return { variant: 'warning' as const, label: 'Average' };
    return { variant: 'danger' as const, label: 'Needs Improvement' };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
      default: return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' = 'excel') => {
    try {
      setLoading(true);
      
      // Prepare data for export
      const exportData = performanceData.user_performance.map(userPerf => ({
        user_name: userPerf.name,
        username: userPerf.user,
        role: userPerf.role,
        productivity_score: `${userPerf.productivity_score}%`,
        tasks_completed: userPerf.tasks_completed,
        avg_response_time: userPerf.avg_response_time,
        accuracy_rate: `${userPerf.accuracy_rate}%`,
        performance_trend: userPerf.performance_trend,
        last_activity: new Date(userPerf.last_activity).toLocaleDateString()
      }));

      const headers = {
        user_name: 'Full Name',
        username: 'Username',
        role: 'Role',
        productivity_score: 'Productivity Score',
        tasks_completed: 'Tasks Completed',
        avg_response_time: 'Avg Response Time',
        accuracy_rate: 'Accuracy Rate',
        performance_trend: 'Performance Trend',
        last_activity: 'Last Activity'
      };

      const options = {
        filename: `user_performance_${new Date().toISOString().split('T')[0]}`,
        title: 'User Performance Report',
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
            <p className="mt-4 text-gray-600">Loading user performance data...</p>
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
          title="User Performance Report"
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
                  <h1 className="text-2xl font-bold text-gray-900">🎯 User Performance Report</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Individual user productivity metrics, task completion rates, and performance analytics
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

            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">{performanceData.summary.total_users}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Performers</p>
                      <p className="text-2xl font-bold">{performanceData.summary.active_performers}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">High Performers</p>
                      <p className="text-2xl font-bold">{performanceData.summary.high_performers}</p>
                    </div>
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Productivity</p>
                      <p className="text-2xl font-bold">{performanceData.summary.avg_productivity_score}%</p>
                    </div>
                    <Target className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                      <p className="text-2xl font-bold">{performanceData.summary.completion_rate}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Individual User Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Performance Score</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Tasks Completed</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Response Time</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Accuracy Rate</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceData.user_performance.map((userPerf, index) => {
                        const perfBadge = getPerformanceBadge(userPerf.productivity_score);
                        return (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{userPerf.name}</div>
                                <div className="text-gray-500 text-xs">@{userPerf.user}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={
                                userPerf.role === 'admin' ? 'danger' :
                                userPerf.role === 'supervisor' ? 'warning' :
                                userPerf.role === 'analyst' ? 'info' : 'success'
                              }>
                                {userPerf.role.charAt(0).toUpperCase() + userPerf.role.slice(1)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-gray-900">{userPerf.productivity_score}%</div>
                                <Badge variant={perfBadge.variant}>
                                  {perfBadge.label}
                                </Badge>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="font-medium">{userPerf.tasks_completed}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-500" />
                                <span>{userPerf.avg_response_time}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">{userPerf.accuracy_rate}%</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                {getTrendIcon(userPerf.performance_trend)}
                                <span className="text-xs text-gray-600 capitalize">{userPerf.performance_trend}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>🏆 Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performanceData.user_performance
                      .filter(user => user.productivity_score >= 90)
                      .sort((a, b) => b.productivity_score - a.productivity_score)
                      .map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <Award className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-600">{user.role}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">{user.productivity_score}%</div>
                            <div className="text-xs text-gray-500">{user.tasks_completed} tasks</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>⚠️ Needs Attention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performanceData.user_performance
                      .filter(user => user.productivity_score < 80 || user.performance_trend === 'down')
                      .map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-600">{user.role}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-yellow-600">{user.productivity_score}%</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              {getTrendIcon(user.performance_trend)}
                              {user.performance_trend}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserPerformancePage;
