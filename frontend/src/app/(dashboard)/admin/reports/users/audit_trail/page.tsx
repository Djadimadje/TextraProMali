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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../../../components/ui/select';
import { Input } from '../../../../../../../components/ui/input';
import { 
  Shield, 
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  Plus,
  Clock,
  User,
  Search,
  Download
} from 'lucide-react';

const AuditTrailPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Demo data for audit trail
  const auditData = {
    summary: {
      total_actions: 156,
      actions_today: 23,
      unique_users_active: 8,
      critical_actions: 12
    },
    audit_trail: [
      {
        timestamp: '2025-08-25T10:30:15Z',
        user: 'admin1',
        user_name: 'Administrator',
        action: 'CREATE',
        resource: 'Machine',
        details: 'Created new machine: Loom-45',
        ip_address: '192.168.1.100',
        success: true
      },
      {
        timestamp: '2025-08-25T10:25:42Z',
        user: 'supervisor1',
        user_name: 'Production Supervisor',
        action: 'UPDATE',
        resource: 'Quality Report',
        details: 'Updated quality metrics for batch QR-2025-001',
        ip_address: '192.168.1.105',
        success: true
      },
      {
        timestamp: '2025-08-25T10:20:33Z',
        user: 'analyst1',
        user_name: 'Quality Analyst 1',
        action: 'DELETE',
        resource: 'Maintenance Log',
        details: 'Deleted duplicate maintenance record ML-2025-089',
        ip_address: '192.168.1.108',
        success: true
      },
      {
        timestamp: '2025-08-25T10:15:18Z',
        user: 'inspector2',
        user_name: 'Inspector 2',
        action: 'VIEW',
        resource: 'Production Report',
        details: 'Accessed production dashboard for Zone A',
        ip_address: '192.168.1.112',
        success: true
      },
      {
        timestamp: '2025-08-25T10:10:55Z',
        user: 'analyst2',
        user_name: 'Quality Analyst 2',
        action: 'EXPORT',
        resource: 'Analytics Data',
        details: 'Exported monthly analytics report (analytics_2025_08.csv)',
        ip_address: '192.168.1.110',
        success: true
      },
      {
        timestamp: '2025-08-25T10:05:21Z',
        user: 'admin1',
        user_name: 'Administrator',
        action: 'LOGIN',
        resource: 'System',
        details: 'User login successful',
        ip_address: '192.168.1.100',
        success: true
      },
      {
        timestamp: '2025-08-25T09:58:44Z',
        user: 'inspector1',
        user_name: 'Inspector 1',
        action: 'UPDATE',
        resource: 'User Profile',
        details: 'Updated personal information and contact details',
        ip_address: '192.168.1.115',
        success: true
      },
      {
        timestamp: '2025-08-25T09:45:12Z',
        user: 'supervisor1',
        user_name: 'Production Supervisor',
        action: 'CREATE',
        resource: 'Allocation',
        details: 'Created new resource allocation for Project P-2025-08',
        ip_address: '192.168.1.105',
        success: true
      },
      {
        timestamp: '2025-08-25T09:40:37Z',
        user: 'analyst3',
        user_name: 'Quality Analyst 3',
        action: 'LOGIN',
        resource: 'System',
        details: 'Failed login attempt - invalid credentials',
        ip_address: '192.168.1.120',
        success: false
      },
      {
        timestamp: '2025-08-25T09:35:29Z',
        user: 'inspector3',
        user_name: 'Inspector 3',
        action: 'VIEW',
        resource: 'Machine Status',
        details: 'Accessed machine monitoring dashboard',
        ip_address: '192.168.1.118',
        success: true
      }
    ]
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      setTimeout(() => setLoading(false), 1000);
    }
  }, [authLoading, user, isAuthenticated]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <Plus className="h-4 w-4 text-green-600" />;
      case 'UPDATE': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'DELETE': return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'VIEW': return <Eye className="h-4 w-4 text-gray-600" />;
      case 'EXPORT': return <Download className="h-4 w-4 text-purple-600" />;
      case 'LOGIN': return <User className="h-4 w-4 text-orange-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE': return { variant: 'success' as const, color: 'green' };
      case 'UPDATE': return { variant: 'info' as const, color: 'blue' };
      case 'DELETE': return { variant: 'danger' as const, color: 'red' };
      case 'VIEW': return { variant: 'default' as const, color: 'gray' };
      case 'EXPORT': return { variant: 'warning' as const, color: 'purple' };
      case 'LOGIN': return { variant: 'warning' as const, color: 'orange' };
      default: return { variant: 'default' as const, color: 'gray' };
    }
  };

  const filteredAuditData = auditData.audit_trail.filter(entry => {
    const matchesAction = actionFilter === 'all' || entry.action === actionFilter;
    const matchesUser = userFilter === 'all' || entry.user === userFilter;
    const matchesSearch = searchTerm === '' || 
      entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesAction && matchesUser && matchesSearch;
  });

  const uniqueUsers = Array.from(new Set(auditData.audit_trail.map(entry => entry.user)));

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' = 'excel') => {
    try {
      setLoading(true);
      
      // Prepare data for export
      const exportData = filteredAuditData.map(entry => ({
        timestamp: formatTime(entry.timestamp),
        user_name: entry.user_name,
        username: entry.user,
        action: entry.action,
        resource: entry.resource,
        details: entry.details,
        ip_address: entry.ip_address,
        status: entry.success ? 'Success' : 'Failed'
      }));

      const headers = {
        timestamp: 'Timestamp',
        user_name: 'User Name',
        username: 'Username',
        action: 'Action',
        resource: 'Resource',
        details: 'Details',
        ip_address: 'IP Address',
        status: 'Status'
      };

      const options = {
        filename: `audit_trail_${new Date().toISOString().split('T')[0]}`,
        title: 'Audit Trail Report',
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
            <p className="mt-4 text-gray-600">Loading audit trail...</p>
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
          title="Audit Trail Report"
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
                  <h1 className="text-2xl font-bold text-gray-900">🔍 Audit Trail Report</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Complete system activity log with user actions, timestamps, and security events
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

            {/* Audit Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Actions</p>
                      <p className="text-2xl font-bold">{auditData.summary.total_actions}</p>
                    </div>
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Actions Today</p>
                      <p className="text-2xl font-bold">{auditData.summary.actions_today}</p>
                    </div>
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold">{auditData.summary.unique_users_active}</p>
                    </div>
                    <User className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Critical Actions</p>
                      <p className="text-2xl font-bold">{auditData.summary.critical_actions}</p>
                    </div>
                    <Shield className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Action
                    </label>
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Actions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="CREATE">Create</SelectItem>
                        <SelectItem value="UPDATE">Update</SelectItem>
                        <SelectItem value="DELETE">Delete</SelectItem>
                        <SelectItem value="VIEW">View</SelectItem>
                        <SelectItem value="EXPORT">Export</SelectItem>
                        <SelectItem value="LOGIN">Login</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by User
                    </label>
                    <Select value={userFilter} onValueChange={setUserFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Users" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        {uniqueUsers.map(userId => (
                          <SelectItem key={userId} value={userId}>{userId}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search Details
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search actions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      onClick={() => {
                        setActionFilter('all');
                        setUserFilter('all');
                        setSearchTerm('');
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Trail */}
            <Card>
              <CardHeader>
                <CardTitle>System Activity Log ({filteredAuditData.length} entries)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Timestamp</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Resource</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Details</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">IP Address</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAuditData.map((entry, index) => {
                        const actionBadge = getActionBadge(entry.action);
                        return (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="h-3 w-3" />
                                <span className="text-xs">{formatTime(entry.timestamp)}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{entry.user_name}</div>
                                <div className="text-gray-500 text-xs">@{entry.user}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {getActionIcon(entry.action)}
                                <Badge variant={actionBadge.variant}>
                                  {entry.action}
                                </Badge>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-gray-900">{entry.resource}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="max-w-xs truncate text-gray-600" title={entry.details}>
                                {entry.details}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{entry.ip_address}</code>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={entry.success ? 'success' : 'danger'}>
                                {entry.success ? '✓ Success' : '✗ Failed'}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
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

export default AuditTrailPage;
