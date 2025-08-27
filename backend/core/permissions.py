"""
Custom permissions for TexPro AI
Role-based access control
"""
from rest_framework import permissions


class RoleBasedPermission(permissions.BasePermission):
    """
    Custom permission class based on user roles
    """
    
    def has_permission(self, request, view):
        """
        Check if user has permission based on role
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Get user role
        user_role = getattr(request.user, 'role', None)
        
        # Admin has access to everything
        if user_role == 'admin':
            return True
        
        # Supervisor can read and update most things
        if user_role == 'supervisor':
            return request.method in ['GET', 'POST', 'PUT', 'PATCH']
        
        # Operators can only read
        if user_role in ['operator', 'technician']:
            return request.method in ['GET']
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """
        Check object-level permissions
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        
        # Admin has access to everything
        if user_role == 'admin':
            return True
        
        # Check if object has site_code and user has access
        if hasattr(obj, 'site_code') and hasattr(request.user, 'site_code'):
            if obj.site_code != request.user.site_code:
                return False
        
        # Supervisor can read and update
        if user_role == 'supervisor':
            return request.method in ['GET', 'POST', 'PUT', 'PATCH']
        
        # Operators can only read
        if user_role in ['operator', 'technician']:
            return request.method in ['GET']
        
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission for admin-only write access, read-only for others
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return getattr(request.user, 'role', None) == 'admin'


class IsSupervisorOrReadOnly(permissions.BasePermission):
    """
    Permission for supervisor+ write access, read-only for others
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        user_role = getattr(request.user, 'role', None)
        return user_role in ['admin', 'supervisor']
