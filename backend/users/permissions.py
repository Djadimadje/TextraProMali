"""
Custom permissions for TexPro AI
Textile Manufacturing Optimization System
"""

from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """
    Permission for Admin role only
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )


class IsSupervisor(BasePermission):
    """
    Permission for Supervisor role and above (Admin, Supervisor)
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'supervisor']
        )


class IsTechnician(BasePermission):
    """
    Permission for Technician role and above (Admin, Supervisor, Technician)
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'supervisor', 'technician']
        )


class IsInspector(BasePermission):
    """
    Permission for Inspector role and above (Admin, Supervisor, Inspector)
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'supervisor', 'inspector']
        )


class IsAnalyst(BasePermission):
    """
    Permission for Analyst role and above (Admin, Supervisor, Analyst)
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'supervisor', 'analyst']
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Permission for resource owner or admin
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Admin can access all objects
        if request.user.role == 'admin':
            return True
        
        # Check if object has user attribute (for user-owned resources)
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Check if object is the user themselves
        if hasattr(obj, 'id') and hasattr(request.user, 'id'):
            return obj.id == request.user.id
            
        return False


class IsReadOnlyOrAdmin(BasePermission):
    """
    Permission for read-only access or admin full access
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
            
        # Admin has full access
        if request.user.role == 'admin':
            return True
            
        # Others have read-only access
        return request.method in ['GET', 'HEAD', 'OPTIONS']


class CanManageUsers(BasePermission):
    """
    Permission to manage users (Admin only)
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )


class CanManageWorkflow(BasePermission):
    """
    Permission to manage workflow (Admin, Supervisor)
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'supervisor']
        )


class CanManageMachines(BasePermission):
    """
    Permission to manage machines (Admin, Supervisor, Technician)
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'supervisor', 'technician']
        )


class CanManageQuality(BasePermission):
    """
    Permission to manage quality (Admin, Supervisor, Inspector)
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'supervisor', 'inspector']
        )


class CanViewReports(BasePermission):
    """
    Permission to view reports (All authenticated users)
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class CanManageReports(BasePermission):
    """
    Permission to manage reports (Admin, Supervisor, Analyst)
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'supervisor', 'analyst']
        )
