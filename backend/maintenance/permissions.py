"""
Maintenance permissions for TexPro AI
Defines role-based permissions for maintenance operations
"""
from rest_framework import permissions


class MaintenancePermission(permissions.BasePermission):
    """
    Custom permission for maintenance operations
    
    Permissions by role:
    - Admin: Full access (CRUD)
    - Technician: Create, read, update maintenance logs
    - Supervisor: Read all, approve maintenance actions
    - Inspector: Read all for quality checks
    - Analyst: Read all for reporting and analytics
    """
    
    def has_permission(self, request, view):
        """Check if user has permission for the action"""
        if not request.user.is_authenticated:
            return False
        
        user_role = request.user.role
        
        # Admin has full access
        if user_role == 'admin':
            return True
        
        # Technicians can create, read, and update
        if user_role == 'technician':
            return request.method in ['GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'OPTIONS']
        
        # Supervisors, inspectors, and analysts can read
        if user_role in ['supervisor', 'inspector', 'analyst']:
            return request.method in ['GET', 'HEAD', 'OPTIONS']
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """Check object-level permissions"""
        if not request.user.is_authenticated:
            return False
        
        user_role = request.user.role
        
        # Admin has full access to all objects
        if user_role == 'admin':
            return True
        
        # Technicians can read/update any maintenance log
        # (technicians work as a team on all maintenance tasks)
        if user_role == 'technician':
            return request.method in ['GET', 'PUT', 'PATCH', 'HEAD', 'OPTIONS']
        
        # Others can only read
        if user_role in ['supervisor', 'inspector', 'analyst']:
            return request.method in ['GET', 'HEAD', 'OPTIONS']
        
        return False


class CanCreateMaintenance(permissions.BasePermission):
    """Permission to create maintenance logs"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in ['admin', 'technician']
        )


class CanUpdateMaintenance(permissions.BasePermission):
    """Permission to update maintenance logs"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in ['admin', 'technician']
        )


class CanViewMaintenanceStats(permissions.BasePermission):
    """Permission to view maintenance statistics"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in ['admin', 'supervisor', 'inspector', 'analyst']
        )


class CanBulkUpdateMaintenance(permissions.BasePermission):
    """Permission for bulk maintenance operations"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in ['admin', 'technician']
        )


class CanViewPredictiveMaintenance(permissions.BasePermission):
    """Permission to view predictive maintenance data"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in ['admin', 'supervisor', 'technician', 'analyst']
        )
