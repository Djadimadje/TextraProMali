'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../../contexts/AuthContext';
import AdminSidebar from '../../../../../../../components/layout/AdminSidebar';
import Header from '../../../../../../../components/layout/Header';
import { reportsService, UserDirectoryData } from '../../../../../../../services/reportsService';
import { exportService } from '../../../../../../../services/exportService';
import Button from '../../../../../../../components/ui/Button';
import Card from '../../../../../../../components/ui/Card';
import CardContent from '../../../../../../../components/ui/CardContent';
import { CardHeader, CardTitle, CardDescription } from '../../../../../../../components/ui/CardComponents';
import Badge from '../../../../../../../components/ui/Badge';
import { Input } from '../../../../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../../../components/ui/select';
import { 
  Users, 
  Download, 
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  Mail,
  UserCheck,
  Clock
} from 'lucide-react';

const UserDirectoryPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserDirectoryData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadUserDirectory();
    }
  }, [authLoading, user, isAuthenticated]);

  const loadUserDirectory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reportsService.getUserDirectory({
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined
      });
      
      if (response.success && response.data) {
        setUserData(response.data);
      } else {
        // Fallback data for demo
        setUserData({
          users: [
            {
              id: 1,
              username: 'admin1',
              name: 'Administrator',
              email: 'admin@cmdt.com',
              role: 'admin',
              status: 'active',
              last_login: '2025-08-25T10:30:00Z',
              date_joined: '2024-01-15T09:00:00Z',
              is_active: true,
              phone_number: '+1-555-0101',
              department: 'Administration'
            },
            {
              id: 2,
              username: 'supervisor1',
              name: 'Production Supervisor',
              email: 'supervisor@cmdt.com',
              role: 'supervisor',
              status: 'active',
              last_login: '2025-08-24T16:45:00Z',
              date_joined: '2024-02-01T09:00:00Z',
              is_active: true,
              phone_number: '+1-555-0102',
              department: 'Production'
            },
            {
              id: 3,
              username: 'analyst1',
              name: 'Quality Analyst',
              email: 'analyst@cmdt.com',
              role: 'analyst',
              status: 'active',
              last_login: '2025-08-23T14:20:00Z',
              date_joined: '2024-03-10T09:00:00Z',
              is_active: true,
              phone_number: '+1-555-0103',
              department: 'Quality Control'
            },
            {
              id: 4,
              username: 'inspector1',
              name: 'Quality Inspector',
              email: 'inspector@cmdt.com',
              role: 'inspector',
              status: 'active',
              last_login: '2025-08-22T11:15:00Z',
              date_joined: '2024-04-05T09:00:00Z',
              is_active: true,
              phone_number: '+1-555-0104',
              department: 'Quality Control'
            }
          ],
          total_count: 14,
          filters: {
            role: roleFilter === 'all' ? undefined : roleFilter,
            status: statusFilter === 'all' ? undefined : statusFilter,
            search: searchTerm || undefined
          }
        });
        setError(response.error || 'Using demo data - API connection issue');
      }
    } catch (err) {
      console.error('User directory loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' = 'excel') => {
    try {
      if (!userData?.users || userData.users.length === 0) {
        alert('No user data available to export');
        return;
      }

      setLoading(true);
      
      // Prepare data for export
      const exportData = filteredUsers.map(user => ({
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        department: user.department,
        phone_number: user.phone_number,
        date_joined: formatDate(user.date_joined),
        last_login: user.last_login ? formatDate(user.last_login) : 'Never',
        days_with_company: getDaysSinceJoined(user.date_joined),
        is_active: user.is_active ? 'Yes' : 'No'
      }));

      const headers = {
        name: 'Full Name',
        username: 'Username',
        email: 'Email Address',
        role: 'Role',
        status: 'Status',
        department: 'Department',
        phone_number: 'Phone Number',
        date_joined: 'Date Joined',
        last_login: 'Last Login',
        days_with_company: 'Days with Company',
        is_active: 'Active Status'
      };

      const options = {
        filename: `user_directory_${new Date().toISOString().split('T')[0]}`,
        title: 'User Directory Report',
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'supervisor': return 'warning';
      case 'analyst': return 'info';
      case 'inspector': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysSinceJoined = (dateString: string) => {
    const joinDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredUsers = userData?.users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center ml-[240px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading user directory...</p>
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
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Login
            </button>
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
          title="User Directory Report"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Error Banner */}
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="text-yellow-800 font-semibold">⚠️ API Connection Issue</h3>
                <p className="text-yellow-700 mt-1">{error}</p>
                <Button 
                  onClick={loadUserDirectory} 
                  className="mt-3"
                  variant="outline"
                  size="sm"
                >
                  Retry Connection
                </Button>
              </div>
            )}

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
                  <h1 className="text-2xl font-bold text-gray-900">👥 User Directory Report</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Complete list of all system users with roles, status, and activity information
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

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">{userData?.total_count || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold">{userData?.users.filter(u => u.is_active).length || 0}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Admins</p>
                      <p className="text-2xl font-bold">{userData?.users.filter(u => u.role === 'admin').length || 0}</p>
                    </div>
                    <Badge variant="danger">{userData?.users.filter(u => u.role === 'admin').length || 0}</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Supervisors</p>
                      <p className="text-2xl font-bold">{userData?.users.filter(u => u.role === 'supervisor').length || 0}</p>
                    </div>
                    <Badge variant="warning">{userData?.users.filter(u => u.role === 'supervisor').length || 0}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Search Users</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, username, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="analyst">Analyst</SelectItem>
                        <SelectItem value="inspector">Inspector</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={loadUserDirectory}
                      className="w-full"
                      variant="outline"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>User Directory ({filteredUsers.length} users)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Last Login</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Joined</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Days with Company</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-gray-500 text-xs">@{user.username}</div>
                              <div className="text-gray-500 text-xs flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={user.status === 'active' ? 'success' : 'default'}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="h-3 w-3" />
                              {user.last_login ? (
                                <span>
                                  {formatDate(user.last_login)}
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({Math.floor((new Date().getTime() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24))} days ago)
                                  </span>
                                </span>
                              ) : (
                                'Never'
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="h-3 w-3" />
                              {formatDate(user.date_joined)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-600">
                              {getDaysSinceJoined(user.date_joined)} days
                            </span>
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

export default UserDirectoryPage;
