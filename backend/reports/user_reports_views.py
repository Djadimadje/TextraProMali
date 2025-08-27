"""
User Reports Views - Performance and Activity Reports
TexPro AI - Textile Manufacturing Optimization System
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta, datetime
from django.http import HttpResponse
import io
import json

from reports.permissions import AnalyticsReportsPermission
from users.models import User

User = get_user_model()


class UserDirectoryReportView(APIView):
    """
    User Directory Report - List of all users
    GET /api/v1/reports/users/directory/
    
    Query Parameters:
    - role: Filter by user role
    - status: Filter by user status
    - search: Search by name, email, or username
    """
    
    permission_classes = [AnalyticsReportsPermission]  # Admin only
    
    def get(self, request):
        """Get user directory report"""
        try:
            queryset = User.objects.all()
            
            # Apply filters
            role = request.GET.get('role')
            if role:
                queryset = queryset.filter(role=role)
            
            status_filter = request.GET.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            search = request.GET.get('search')
            if search:
                queryset = queryset.filter(
                    Q(first_name__icontains=search) |
                    Q(last_name__icontains=search) |
                    Q(username__icontains=search) |
                    Q(email__icontains=search)
                )
            
            users_data = []
            for user in queryset.order_by('last_name', 'first_name'):
                users_data.append({
                    'id': user.id,
                    'username': user.username,
                    'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                    'email': user.email,
                    'role': user.get_role_display(),
                    'status': user.get_status_display(),
                    'last_login': user.last_login.isoformat() if user.last_login else None,
                    'date_joined': user.date_joined.isoformat(),
                    'is_active': user.is_active,
                    'phone_number': getattr(user, 'phone_number', ''),
                    'department': getattr(user, 'department', ''),
                })
            
            return Response({
                'success': True,
                'data': {
                    'users': users_data,
                    'total_count': len(users_data),
                    'filters': {
                        'role': role,
                        'status': status_filter,
                        'search': search
                    }
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to generate user directory report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RoleDistributionReportView(APIView):
    """
    Role Distribution Report - Breakdown of user counts by role
    GET /api/v1/reports/users/roles/
    """
    
    permission_classes = [AnalyticsReportsPermission]  # Admin only
    
    def get(self, request):
        """Get role distribution report"""
        try:
            # Get role distribution
            role_distribution = User.objects.values('role').annotate(
                count=Count('id')
            ).order_by('role')
            
            # Get status distribution by role
            status_by_role = {}
            for role_choice in User.Role.choices:
                role_code = role_choice[0]
                status_dist = User.objects.filter(role=role_code).values('status').annotate(
                    count=Count('id')
                )
                status_by_role[role_code] = {
                    'total': User.objects.filter(role=role_code).count(),
                    'by_status': {item['status']: item['count'] for item in status_dist}
                }
            
            # Calculate percentages
            total_users = User.objects.count()
            role_data = []
            for item in role_distribution:
                role_code = item['role']
                count = item['count']
                percentage = (count / total_users * 100) if total_users > 0 else 0
                
                role_data.append({
                    'role': role_code,
                    'role_display': dict(User.Role.choices)[role_code],
                    'count': count,
                    'percentage': round(percentage, 1),
                    'status_breakdown': status_by_role.get(role_code, {})
                })
            
            return Response({
                'success': True,
                'data': {
                    'role_distribution': role_data,
                    'total_users': total_users,
                    'summary': {
                        'most_common_role': max(role_data, key=lambda x: x['count']) if role_data else None,
                        'active_users': User.objects.filter(is_active=True).count(),
                        'inactive_users': User.objects.filter(is_active=False).count(),
                    }
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to generate role distribution report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginActivityReportView(APIView):
    """
    Login Activity Report - User login patterns and activity
    GET /api/v1/reports/users/activity/
    
    Query Parameters:
    - days: Number of days to look back (default: 30)
    - role: Filter by user role
    """
    
    permission_classes = [AnalyticsReportsPermission]  # Admin only
    
    def get(self, request):
        """Get login activity report"""
        try:
            days = int(request.GET.get('days', 30))
            role_filter = request.GET.get('role')
            
            # Calculate date ranges
            now = timezone.now()
            cutoff_date = now - timedelta(days=days)
            inactive_cutoff = now - timedelta(days=30)  # 30 days for inactive users
            
            queryset = User.objects.all()
            if role_filter:
                queryset = queryset.filter(role=role_filter)
            
            # Recent logins (within specified days)
            recent_logins = queryset.filter(
                last_login__gte=cutoff_date
            ).order_by('-last_login')
            
            # Inactive users (no login in 30 days)
            inactive_users = queryset.filter(
                Q(last_login__lt=inactive_cutoff) | Q(last_login__isnull=True)
            ).order_by('last_login')
            
            # Never logged in
            never_logged_in = queryset.filter(last_login__isnull=True)
            
            # Activity summary
            activity_data = {
                'recent_logins': [],
                'inactive_users': [],
                'never_logged_in': [],
                'summary': {
                    'total_users': queryset.count(),
                    'active_in_period': recent_logins.count(),
                    'inactive_users': inactive_users.count(),
                    'never_logged_in': never_logged_in.count(),
                    'activity_rate': 0
                }
            }
            
            # Calculate activity rate
            if queryset.count() > 0:
                activity_data['summary']['activity_rate'] = round(
                    (recent_logins.count() / queryset.count()) * 100, 1
                )
            
            # Recent logins data
            for user in recent_logins[:50]:  # Limit to 50 recent
                activity_data['recent_logins'].append({
                    'id': user.id,
                    'username': user.username,
                    'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                    'role': user.get_role_display(),
                    'last_login': user.last_login.isoformat() if user.last_login else None,
                    'days_since_login': (now - user.last_login).days if user.last_login else None
                })
            
            # Inactive users data
            for user in inactive_users[:50]:  # Limit to 50
                days_since = (now - user.last_login).days if user.last_login else None
                activity_data['inactive_users'].append({
                    'id': user.id,
                    'username': user.username,
                    'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                    'role': user.get_role_display(),
                    'last_login': user.last_login.isoformat() if user.last_login else None,
                    'days_since_login': days_since,
                    'status': user.get_status_display()
                })
            
            # Never logged in users
            for user in never_logged_in[:50]:  # Limit to 50
                activity_data['never_logged_in'].append({
                    'id': user.id,
                    'username': user.username,
                    'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                    'role': user.get_role_display(),
                    'date_joined': user.date_joined.isoformat(),
                    'days_since_creation': (now - user.date_joined).days,
                    'status': user.get_status_display()
                })
            
            return Response({
                'success': True,
                'data': activity_data,
                'filters': {
                    'days': days,
                    'role': role_filter
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to generate login activity report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserPerformanceReportView(APIView):
    """
    User Performance Report - Role-based performance metrics
    GET /api/v1/reports/users/performance/
    
    Query Parameters:
    - role: Filter by specific role
    - start_date: Start date for performance period
    - end_date: End date for performance period
    """
    
    permission_classes = [AnalyticsReportsPermission]  # Admin only
    
    def get(self, request):
        """Get user performance report"""
        try:
            role_filter = request.GET.get('role')
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            
            # Parse dates
            if start_date:
                start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            else:
                start_date = timezone.now() - timedelta(days=30)
            
            if end_date:
                end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            else:
                end_date = timezone.now()
            
            queryset = User.objects.all()
            if role_filter:
                queryset = queryset.filter(role=role_filter)
            
            performance_data = {
                'supervisors': [],
                'technicians': [],
                'inspectors': [],
                'analysts': [],
                'summary': {
                    'total_users_evaluated': 0,
                    'performance_period': {
                        'start': start_date.isoformat(),
                        'end': end_date.isoformat()
                    }
                }
            }
            
            # Supervisors - Workflow management performance
            supervisors = queryset.filter(role=User.Role.SUPERVISOR)
            for supervisor in supervisors:
                try:
                    # Try to get workflow-related metrics
                    workflows_managed = 0
                    # This would need to be implemented based on actual workflow models
                    # workflows_managed = BatchWorkflow.objects.filter(
                    #     supervisor=supervisor,
                    #     created_at__range=[start_date, end_date]
                    # ).count()
                    
                    performance_data['supervisors'].append({
                        'id': supervisor.id,
                        'name': f"{supervisor.first_name} {supervisor.last_name}".strip(),
                        'username': supervisor.username,
                        'workflows_managed': workflows_managed,
                        'last_active': supervisor.last_login.isoformat() if supervisor.last_login else None
                    })
                except Exception:
                    # Fallback if models not available
                    performance_data['supervisors'].append({
                        'id': supervisor.id,
                        'name': f"{supervisor.first_name} {supervisor.last_name}".strip(),
                        'username': supervisor.username,
                        'workflows_managed': 0,
                        'last_active': supervisor.last_login.isoformat() if supervisor.last_login else None
                    })
            
            # Technicians - Maintenance tasks performance
            technicians = queryset.filter(role=User.Role.TECHNICIAN)
            for technician in technicians:
                try:
                    # Try to get maintenance-related metrics
                    tasks_completed = 0
                    # tasks_completed = MaintenanceLog.objects.filter(
                    #     technician=technician,
                    #     created_at__range=[start_date, end_date],
                    #     status='completed'
                    # ).count()
                    
                    performance_data['technicians'].append({
                        'id': technician.id,
                        'name': f"{technician.first_name} {technician.last_name}".strip(),
                        'username': technician.username,
                        'tasks_completed': tasks_completed,
                        'last_active': technician.last_login.isoformat() if technician.last_login else None
                    })
                except Exception:
                    performance_data['technicians'].append({
                        'id': technician.id,
                        'name': f"{technician.first_name} {technician.last_name}".strip(),
                        'username': technician.username,
                        'tasks_completed': 0,
                        'last_active': technician.last_login.isoformat() if technician.last_login else None
                    })
            
            # Inspectors - Quality inspection performance
            inspectors = queryset.filter(role=User.Role.INSPECTOR)
            for inspector in inspectors:
                try:
                    # Try to get quality check metrics
                    inspections_done = 0
                    defects_detected = 0
                    # inspections_done = QualityCheck.objects.filter(
                    #     inspector=inspector,
                    #     created_at__range=[start_date, end_date]
                    # ).count()
                    # defects_detected = QualityCheck.objects.filter(
                    #     inspector=inspector,
                    #     created_at__range=[start_date, end_date],
                    #     status='rejected'
                    # ).count()
                    
                    detection_rate = 0
                    if inspections_done > 0:
                        detection_rate = (defects_detected / inspections_done) * 100
                    
                    performance_data['inspectors'].append({
                        'id': inspector.id,
                        'name': f"{inspector.first_name} {inspector.last_name}".strip(),
                        'username': inspector.username,
                        'inspections_done': inspections_done,
                        'defects_detected': defects_detected,
                        'detection_rate': round(detection_rate, 1),
                        'last_active': inspector.last_login.isoformat() if inspector.last_login else None
                    })
                except Exception:
                    performance_data['inspectors'].append({
                        'id': inspector.id,
                        'name': f"{inspector.first_name} {inspector.last_name}".strip(),
                        'username': inspector.username,
                        'inspections_done': 0,
                        'defects_detected': 0,
                        'detection_rate': 0,
                        'last_active': inspector.last_login.isoformat() if inspector.last_login else None
                    })
            
            # Analysts - Reports and analytics access
            analysts = queryset.filter(role=User.Role.ANALYST)
            for analyst in analysts:
                performance_data['analysts'].append({
                    'id': analyst.id,
                    'name': f"{analyst.first_name} {analyst.last_name}".strip(),
                    'username': analyst.username,
                    'reports_generated': 0,  # Would need to track this
                    'analytics_accessed': 0,  # Would need to track this
                    'last_active': analyst.last_login.isoformat() if analyst.last_login else None
                })
            
            performance_data['summary']['total_users_evaluated'] = (
                len(performance_data['supervisors']) +
                len(performance_data['technicians']) +
                len(performance_data['inspectors']) +
                len(performance_data['analysts'])
            )
            
            return Response({
                'success': True,
                'data': performance_data,
                'filters': {
                    'role': role_filter,
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to generate user performance report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserAuditTrailView(APIView):
    """
    User Audit Trail - Account creation, modification, and deletion history
    GET /api/v1/reports/users/audit/
    
    Query Parameters:
    - start_date: Start date for audit period
    - end_date: End date for audit period
    - action: Filter by action type (created, modified, deleted)
    """
    
    permission_classes = [AnalyticsReportsPermission]  # Admin only
    
    def get(self, request):
        """Get user audit trail report"""
        try:
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            action_filter = request.GET.get('action')
            
            # Parse dates
            if start_date:
                start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            else:
                start_date = timezone.now() - timedelta(days=30)
            
            if end_date:
                end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            else:
                end_date = timezone.now()
            
            # For now, we'll provide basic audit information
            # In a full implementation, you'd want a separate audit log model
            audit_data = {
                'user_creations': [],
                'recent_modifications': [],
                'summary': {
                    'period': {
                        'start': start_date.isoformat(),
                        'end': end_date.isoformat()
                    },
                    'users_created': 0,
                    'users_modified': 0,
                    'total_events': 0
                }
            }
            
            # Users created in period
            new_users = User.objects.filter(
                date_joined__range=[start_date, end_date]
            ).order_by('-date_joined')
            
            for user in new_users:
                audit_data['user_creations'].append({
                    'id': user.id,
                    'username': user.username,
                    'name': f"{user.first_name} {user.last_name}".strip(),
                    'role': user.get_role_display(),
                    'created_at': user.date_joined.isoformat(),
                    'created_by': 'system',  # Would need to track this
                    'status': user.get_status_display()
                })
            
            # Users with recent last login (proxy for modifications)
            recently_active = User.objects.filter(
                last_login__range=[start_date, end_date]
            ).exclude(
                id__in=[u.id for u in new_users]
            ).order_by('-last_login')[:50]
            
            for user in recently_active:
                audit_data['recent_modifications'].append({
                    'id': user.id,
                    'username': user.username,
                    'name': f"{user.first_name} {user.last_name}".strip(),
                    'role': user.get_role_display(),
                    'last_login': user.last_login.isoformat() if user.last_login else None,
                    'action': 'login',
                    'status': user.get_status_display()
                })
            
            audit_data['summary']['users_created'] = len(audit_data['user_creations'])
            audit_data['summary']['users_modified'] = len(audit_data['recent_modifications'])
            audit_data['summary']['total_events'] = (
                audit_data['summary']['users_created'] +
                audit_data['summary']['users_modified']
            )
            
            return Response({
                'success': True,
                'data': audit_data,
                'filters': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'action': action_filter
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to generate user audit trail: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
