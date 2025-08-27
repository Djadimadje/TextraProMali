"""
Reports app permissions for TexPro AI
Access control for report generation and export
"""

from rest_framework import permissions


class ReportsPermission(permissions.BasePermission):
    """
    Permission class for reports endpoints
    
    Access levels:
    - Admin: Full access to all reports
    - Supervisor: Workflow, machines, maintenance reports
    - Analyst: Analytics reports only
    - Inspector & Technician: No export access (read-only)
    """
    
    def has_permission(self, request, view):
        """Check if user has permission to access reports"""
        
        # Must be authenticated and active
        if not (request.user and request.user.is_authenticated):
            return False
        
        if getattr(request.user, 'status', None) != 'active':
            return False
        
        # Get user role and report type from view
        user_role = getattr(request.user, 'role', None)
        
        # Extract report type from view name or URL
        view_name = getattr(view, '__class__').__name__.lower()
        
        # Admin has full access
        if user_role == 'admin':
            return True
        
        # Supervisor can access workflow, machines, maintenance
        if user_role == 'supervisor':
            allowed_reports = ['workflow', 'machines', 'maintenance']
            return any(report_type in view_name for report_type in allowed_reports)
        
        # Analyst can access analytics reports only
        if user_role == 'analyst':
            return 'analytics' in view_name
        
        # Inspector & Technician have no export access
        return False


class WorkflowReportsPermission(permissions.BasePermission):
    """Permission for workflow reports (Admin, Supervisor)"""
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if getattr(request.user, 'status', None) != 'active':
            return False
        
        user_role = getattr(request.user, 'role', None)
        return user_role in ['admin', 'supervisor']


class MachineReportsPermission(permissions.BasePermission):
    """Permission for machine reports (Admin, Supervisor)"""
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if getattr(request.user, 'status', None) != 'active':
            return False
        
        user_role = getattr(request.user, 'role', None)
        return user_role in ['admin', 'supervisor']


class MaintenanceReportsPermission(permissions.BasePermission):
    """Permission for maintenance reports (Admin, Supervisor)"""
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if getattr(request.user, 'status', None) != 'active':
            return False
        
        user_role = getattr(request.user, 'role', None)
        return user_role in ['admin', 'supervisor']


class QualityReportsPermission(permissions.BasePermission):
    """Permission for quality reports (Admin only for now)"""
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if getattr(request.user, 'status', None) != 'active':
            return False
        
        user_role = getattr(request.user, 'role', None)
        return user_role == 'admin'


class AllocationReportsPermission(permissions.BasePermission):
    """Permission for allocation reports (Admin only for now)"""
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if getattr(request.user, 'status', None) != 'active':
            return False
        
        user_role = getattr(request.user, 'role', None)
        return user_role == 'admin'


class AnalyticsReportsPermission(permissions.BasePermission):
    """Permission for analytics reports (Admin, Analyst)"""
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if getattr(request.user, 'status', None) != 'active':
            return False
        
        user_role = getattr(request.user, 'role', None)
        return user_role in ['admin', 'analyst']
