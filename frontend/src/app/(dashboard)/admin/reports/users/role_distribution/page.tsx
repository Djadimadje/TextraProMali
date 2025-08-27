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
  Users, 
  ArrowLeft,
  PieChart,
  BarChart3,
  Download
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

const RoleDistributionPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Demo data for role distribution
  const roleData = [
    { role: 'Inspector', count: 5, percentage: 35.7, color: COLORS[0] },
    { role: 'Analyst', count: 4, percentage: 28.6, color: COLORS[1] },
    { role: 'Supervisor', count: 3, percentage: 21.4, color: COLORS[2] },
    { role: 'Admin', count: 2, percentage: 14.3, color: COLORS[3] }
  ];

  const totalUsers = roleData.reduce((sum, item) => sum + item.count, 0);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      // Simulate loading
      setTimeout(() => setLoading(false), 1000);
    }
  }, [authLoading, user, isAuthenticated]);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' = 'excel') => {
    try {
      setLoading(true);
      
      // Prepare data for export
      const exportData = roleData.map(role => ({
        role: role.role,
        count: role.count,
        percentage: `${role.percentage}%`,
        total_users: 14
      }));

      const headers = {
        role: 'Role',
        count: 'User Count',
        percentage: 'Percentage',
        total_users: 'Total Users'
      };

      const options = {
        filename: `role_distribution_${new Date().toISOString().split('T')[0]}`,
        title: 'Role Distribution Report',
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
            <p className="mt-4 text-gray-600">Loading role distribution...</p>
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
          title="Role Distribution Report"
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
                  <h1 className="text-2xl font-bold text-gray-900">📊 Role Distribution Report</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Breakdown of users by role across the CMDT system
                  </p>
                </div>
                
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

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {roleData.map((role, index) => (
                <Card key={role.role}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{role.role}s</p>
                        <p className="text-2xl font-bold">{role.count}</p>
                        <p className="text-xs text-gray-500">{role.percentage}% of total</p>
                      </div>
                      <div 
                        className="w-4 h-8 rounded"
                        style={{ backgroundColor: role.color }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Role Distribution (Pie Chart)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={roleData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ role, percentage }) => `${role}: ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {roleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Role Distribution (Bar Chart)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={roleData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="role" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Table */}
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">User Count</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Percentage</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Responsibilities</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <Badge variant="danger">Admin</Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">2 users</td>
                        <td className="py-3 px-4">14.3%</td>
                        <td className="py-3 px-4 text-gray-600">System administration, user management, full access</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <Badge variant="warning">Supervisor</Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">3 users</td>
                        <td className="py-3 px-4">21.4%</td>
                        <td className="py-3 px-4 text-gray-600">Production oversight, staff management, reporting</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <Badge variant="info">Analyst</Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">4 users</td>
                        <td className="py-3 px-4">28.6%</td>
                        <td className="py-3 px-4 text-gray-600">Data analysis, quality metrics, performance tracking</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <Badge variant="success">Inspector</Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">5 users</td>
                        <td className="py-3 px-4">35.7%</td>
                        <td className="py-3 px-4 text-gray-600">Quality inspection, defect detection, process monitoring</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-200 bg-gray-50">
                        <td className="py-3 px-4 font-medium">Total</td>
                        <td className="py-3 px-4 font-medium">{totalUsers} users</td>
                        <td className="py-3 px-4 font-medium">100%</td>
                        <td className="py-3 px-4"></td>
                      </tr>
                    </tfoot>
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

export default RoleDistributionPage;
