"""
Settings permissions for TexPro AI
Role-based access control for system configuration
"""

from rest_framework import permissions


class SettingsPermission(permissions.BasePermission):
    """
    Permission class for settings operations
    
    Rules:
    - Only Admin users can access settings
    - All settings operations require admin role
    - No other roles have access to configuration
    """
    
    def has_permission(self, request, view):
        """
        Check if user has permission to access settings
        """
        # Must be authenticated admin
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user has permission to access specific setting
        """
        # Only admin can access any setting
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )


class SettingsReadOnlyPermission(permissions.BasePermission):
    """
    Permission class for read-only settings access
    
    Rules:
    - Admin: Full access (read/write)
    - Supervisor: Read-only access for operational settings
    - Other roles: No access
    """
    
    def has_permission(self, request, view):
        """
        Check if user has permission to access settings
        """
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin has full access
        if request.user.role == 'admin':
            return True
        
        # Supervisor has read-only access
        if request.user.role == 'supervisor' and request.method in permissions.SAFE_METHODS:
            return True
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user has permission to access specific setting
        """
        # Admin can access any setting
        if request.user.role == 'admin':
            return True
        
        # Supervisor can read operational settings
        if request.user.role == 'supervisor' and request.method in permissions.SAFE_METHODS:
            # Allow access to operational settings only
            operational_prefixes = [
                'maintenance_',
                'machine_',
                'workflow_',
                'quality_',
                'allocation_'
            ]
            return any(obj.key.startswith(prefix) for prefix in operational_prefixes)
        
        return False
