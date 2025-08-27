"""
Analytics app permissions for TexPro AI
Access control for analytics and KPI endpoints
"""

from rest_framework import permissions


class AnalyticsPermission(permissions.BasePermission):
    """
    Permission class for analytics endpoints
    
    Access levels:
    - Admin: Full access to all analytics
    - Supervisor: Full access to all analytics  
    - Analyst: Full access to all analytics
    - Technician & Inspector: Read-only access to analytics
    - Others: No access
    """
    
    def has_permission(self, request, view):
        """Check if user has permission to access analytics"""
        
        # Must be authenticated and active
        if not (request.user and request.user.is_authenticated):
            return False
        
        if getattr(request.user, 'status', None) != 'active':
            return False
        
        # Get user role
        user_role = getattr(request.user, 'role', None)
        
        # Analytics access based on role
        analytics_roles = ['admin', 'supervisor', 'analyst', 'technician', 'inspector']
        
        if user_role not in analytics_roles:
            return False
        
        # All analytics endpoints are read-only, so no further restrictions needed
        return True
    
    def has_object_permission(self, request, view, obj):
        """Object-level permissions (not needed for analytics as they're aggregated data)"""
        return self.has_permission(request, view)


class AdminAnalyticsPermission(permissions.BasePermission):
    """
    Permission class for admin-only analytics endpoints
    (if any special admin analytics are added later)
    """
    
    def has_permission(self, request, view):
        """Check if user is admin for admin-specific analytics"""
        
        if not (request.user and request.user.is_authenticated):
            return False
        
        if getattr(request.user, 'status', None) != 'active':
            return False
        
        # Only admin and supervisor can access admin analytics
        user_role = getattr(request.user, 'role', None)
        return user_role in ['admin', 'supervisor']
