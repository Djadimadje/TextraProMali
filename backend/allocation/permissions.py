"""
Allocation app permissions for TexPro AI
Role-based access control for workforce and material allocation
"""

from rest_framework import permissions


class AllocationPermission(permissions.BasePermission):
    """
    Custom permission for allocation operations
    
    Permissions by role:
    - Admin: Full access (CRUD)
    - Supervisor: Can allocate/update workforce & materials
    - Technician, Inspector, Analyst: Read-only
    """
    
    def has_permission(self, request, view):
        """Check if user has permission to access allocation endpoints"""
        
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        
        # Admin has full access
        if user_role == 'admin':
            return True
        
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return user_role in ['supervisor', 'technician', 'inspector', 'analyst', 'admin']
        
        # Write permissions only for supervisors and admins
        if request.method in ['POST', 'PUT', 'PATCH']:
            return user_role in ['supervisor', 'admin']
        
        # Delete permissions only for admins
        if request.method == 'DELETE':
            return user_role == 'admin'
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """Check permissions for specific allocation objects"""
        
        user_role = getattr(request.user, 'role', None)
        
        # Admin has full access to all objects
        if user_role == 'admin':
            return True
        
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return user_role in ['supervisor', 'technician', 'inspector', 'analyst', 'admin']
        
        # Supervisors can modify allocations
        if request.method in ['PUT', 'PATCH']:
            return user_role == 'supervisor'
        
        # Only admins can delete
        if request.method == 'DELETE':
            return user_role == 'admin'
        
        return False


class CanAllocateWorkforce(permissions.BasePermission):
    """Permission to allocate workforce to batches"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        return user_role in ['supervisor', 'admin']


class CanAllocateMaterials(permissions.BasePermission):
    """Permission to allocate materials to batches"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        return user_role in ['supervisor', 'admin']
