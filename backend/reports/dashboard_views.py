"""
Comprehensive Reports Dashboard Views
TexPro AI - Textile Manufacturing Optimization System
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Count, Avg, Sum, Q
from django.utils import timezone
from datetime import timedelta, datetime

from reports.permissions import (
    WorkflowReportsPermission, MachineReportsPermission,
    MaintenanceReportsPermission, QualityReportsPermission,
    AllocationReportsPermission, AnalyticsReportsPermission
)

User = get_user_model()


class ReportsDashboardView(APIView):
    """
    Reports Dashboard - Overview of all available reports
    GET /api/v1/reports/dashboard/
    """
    
    permission_classes = [AnalyticsReportsPermission]  # Admin access required
    
    def get(self, request):
        """Get reports dashboard overview"""
        try:
            # Get current user's role for permission-based filtering
            user = request.user
            user_role = user.role if hasattr(user, 'role') else 'admin'
            
            # System Reports (based on user permissions)
            system_reports = {
                'production': {
                    'title': 'Production Reports',
                    'description': 'Batches, workflow completion, delays',
                    'available': user_role in ['admin', 'supervisor'],
                    'formats': ['pdf', 'excel'],
                    'endpoints': {
                        'pdf': '/api/v1/reports/workflow/pdf/',
                        'excel': '/api/v1/reports/workflow/excel/'
                    },
                    'last_generated': None,  # Would track this in production
                    'filters': ['date_range', 'status', 'product_type', 'batch_number']
                },
                'machines': {
                    'title': 'Machine Reports',
                    'description': 'Uptime, downtime, predictive maintenance logs',
                    'available': user_role in ['admin', 'supervisor'],
                    'formats': ['pdf', 'excel'],
                    'endpoints': {
                        'pdf': '/api/v1/reports/machines/pdf/',
                        'excel': '/api/v1/reports/machines/excel/'
                    },
                    'last_generated': None,
                    'filters': ['status', 'machine_type', 'location']
                },
                'quality': {
                    'title': 'Quality Reports',
                    'description': 'Defects detected, defect rates, inspector performance',
                    'available': user_role == 'admin',
                    'formats': ['pdf', 'excel'],
                    'endpoints': {
                        'pdf': '/api/v1/reports/quality/pdf/',
                        'excel': '/api/v1/reports/quality/excel/'
                    },
                    'last_generated': None,
                    'filters': ['date_range', 'status', 'inspector', 'defect_type']
                },
                'maintenance': {
                    'title': 'Maintenance Reports',
                    'description': 'Scheduled vs unscheduled repairs, costs',
                    'available': user_role in ['admin', 'supervisor'],
                    'formats': ['pdf', 'excel'],
                    'endpoints': {
                        'pdf': '/api/v1/reports/maintenance/pdf/',
                        'excel': '/api/v1/reports/maintenance/excel/'
                    },
                    'last_generated': None,
                    'filters': ['date_range', 'priority', 'status', 'maintenance_type']
                },
                'allocation': {
                    'title': 'Resource Allocation Reports',
                    'description': 'Staff assigned, material usage, efficiency',
                    'available': user_role == 'admin',
                    'formats': ['pdf', 'excel'],
                    'endpoints': {
                        'pdf': '/api/v1/reports/allocation/pdf/',
                        'excel': '/api/v1/reports/allocation/excel/'
                    },
                    'last_generated': None,
                    'filters': ['date_range', 'role', 'material_type', 'batch']
                },
                'analytics': {
                    'title': 'Analytics Summary Reports',
                    'description': 'High-level KPIs (efficiency %, defect %, cost trends)',
                    'available': user_role in ['admin', 'analyst'],
                    'formats': ['pdf', 'excel'],
                    'endpoints': {
                        'pdf': '/api/v1/reports/analytics/pdf/',
                        'excel': '/api/v1/reports/analytics/excel/'
                    },
                    'last_generated': None,
                    'filters': ['date_range', 'kpi_type']
                }
            }
            
            # User Reports (Admin only)
            user_reports = {
                'directory': {
                    'title': 'User Directory Report',
                    'description': 'List of all users: Name, Role, Status, Last Login, Created On',
                    'available': user_role == 'admin',
                    'formats': ['json', 'csv', 'excel'],
                    'endpoints': {
                        'json': '/api/v1/reports/users/directory/',
                        'export': '/api/v1/reports/users/directory/export/'
                    },
                    'filters': ['role', 'status', 'search']
                },
                'role_distribution': {
                    'title': 'Role Distribution Report',
                    'description': 'Breakdown of user counts by role',
                    'available': user_role == 'admin',
                    'formats': ['json', 'chart'],
                    'endpoints': {
                        'json': '/api/v1/reports/users/roles/',
                    },
                    'filters': []
                },
                'login_activity': {
                    'title': 'Login Activity Report',
                    'description': 'Who logged in, inactive users, login patterns',
                    'available': user_role == 'admin',
                    'formats': ['json', 'csv'],
                    'endpoints': {
                        'json': '/api/v1/reports/users/activity/',
                    },
                    'filters': ['days', 'role']
                },
                'performance': {
                    'title': 'User Performance Report',
                    'description': 'Role-based performance metrics and KPIs',
                    'available': user_role == 'admin',
                    'formats': ['json', 'pdf'],
                    'endpoints': {
                        'json': '/api/v1/reports/users/performance/',
                    },
                    'filters': ['role', 'start_date', 'end_date']
                },
                'audit_trail': {
                    'title': 'User Audit Trail',
                    'description': 'Account creation, modification, deletion history',
                    'available': user_role == 'admin',
                    'formats': ['json', 'csv'],
                    'endpoints': {
                        'json': '/api/v1/reports/users/audit/',
                    },
                    'filters': ['start_date', 'end_date', 'action']
                }
            }
            
            # Get quick stats for dashboard
            try:
                dashboard_stats = {
                    'system_stats': {
                        'total_users': User.objects.count(),
                        'active_users': User.objects.filter(is_active=True).count(),
                        'total_machines': 0,  # Would get from machines app
                        'total_batches': 0,   # Would get from workflow app
                    },
                    'recent_activity': {
                        'reports_generated_today': 0,  # Would track this
                        'last_report_time': None,
                        'most_popular_report': 'production',  # Would track this
                    },
                    'user_activity': {
                        'logins_today': User.objects.filter(
                            last_login__date=timezone.now().date()
                        ).count() if timezone.now() else 0,
                        'new_users_this_week': User.objects.filter(
                            date_joined__gte=timezone.now() - timedelta(days=7)
                        ).count(),
                    }
                }
            except Exception as e:
                dashboard_stats = {
                    'system_stats': {'error': str(e)},
                    'recent_activity': {'error': str(e)},
                    'user_activity': {'error': str(e)}
                }
            
            # Filter reports based on user permissions
            available_system_reports = {
                k: v for k, v in system_reports.items() if v['available']
            }
            available_user_reports = {
                k: v for k, v in user_reports.items() if v['available']
            }
            
            return Response({
                'success': True,
                'data': {
                    'system_reports': available_system_reports,
                    'user_reports': available_user_reports,
                    'dashboard_stats': dashboard_stats,
                    'user_permissions': {
                        'role': user_role,
                        'can_view_system_reports': user_role in ['admin', 'supervisor', 'analyst'],
                        'can_view_user_reports': user_role == 'admin',
                        'can_export': True
                    }
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to load reports dashboard: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReportsMetaView(APIView):
    """
    Reports Metadata - Available filters, export formats, etc.
    GET /api/v1/reports/meta/
    """
    
    permission_classes = [AnalyticsReportsPermission]
    
    def get(self, request):
        """Get reports metadata"""
        try:
            metadata = {
                'date_ranges': [
                    {'value': 'today', 'label': 'Today'},
                    {'value': 'yesterday', 'label': 'Yesterday'},
                    {'value': 'last_7_days', 'label': 'Last 7 days'},
                    {'value': 'last_30_days', 'label': 'Last 30 days'},
                    {'value': 'last_quarter', 'label': 'Last 3 months'},
                    {'value': 'last_year', 'label': 'Last year'},
                    {'value': 'custom', 'label': 'Custom range'}
                ],
                'export_formats': [
                    {'value': 'pdf', 'label': 'PDF Document', 'icon': 'file-pdf'},
                    {'value': 'excel', 'label': 'Excel Spreadsheet', 'icon': 'file-excel'},
                    {'value': 'csv', 'label': 'CSV Data', 'icon': 'file-csv'},
                    {'value': 'json', 'label': 'JSON Data', 'icon': 'file-json'}
                ],
                'user_roles': [
                    {'value': 'admin', 'label': 'Administrator'},
                    {'value': 'supervisor', 'label': 'Supervisor'},
                    {'value': 'technician', 'label': 'Technician'},
                    {'value': 'inspector', 'label': 'Quality Inspector'},
                    {'value': 'analyst', 'label': 'Data Analyst'}
                ],
                'user_statuses': [
                    {'value': 'active', 'label': 'Active'},
                    {'value': 'inactive', 'label': 'Inactive'},
                    {'value': 'suspended', 'label': 'Suspended'},
                    {'value': 'pending', 'label': 'Pending Activation'}
                ],
                'report_categories': [
                    {
                        'id': 'system',
                        'label': 'System Reports',
                        'description': 'Production, machines, quality, maintenance, allocation',
                        'icon': 'settings'
                    },
                    {
                        'id': 'user',
                        'label': 'User Reports',
                        'description': 'User activity, performance, roles, audit trails',
                        'icon': 'users'
                    }
                ]
            }
            
            return Response({
                'success': True,
                'data': metadata
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to load reports metadata: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
