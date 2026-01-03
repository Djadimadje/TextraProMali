"""
Quality app permissions for TexPro AI
Role-based access control for quality control operations
"""

from rest_framework import permissions


class QualityPermission(permissions.BasePermission):
    """
    Custom permission for quality control operations
    
    Permissions by role:
    - Admin: Full access (CRUD)
    - Inspector: Can upload & update checks
    - Supervisor: Read-only access  
    - Technician: Read-only access
    - Analyst: Read-only access
    """
    
    def has_permission(self, request, view):
        """Check if user has permission to access quality endpoints"""
        
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superuser has full access
        if request.user.is_superuser:
            return True
        
        # Check user role
        user_role = getattr(request.user, 'role', None)
        
        # Debug: Log user role for troubleshooting
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Quality permission check - User: {request.user.username}, Role: {user_role}, Is_superuser: {request.user.is_superuser}, Method: {request.method}")
        
        # Admin has full access
        if user_role == 'admin':
            return True
        
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return user_role in ['inspector', 'supervisor', 'technician', 'analyst', 'admin']
        
        # Write permissions only for inspectors and admins
        if request.method in ['POST', 'PUT', 'PATCH']:
            return user_role in ['inspector', 'admin', 'supervisor']
        
        # Delete permissions only for admins
        if request.method == 'DELETE':
            return user_role == 'admin'
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """Check permissions for specific quality check objects"""
        
        user_role = getattr(request.user, 'role', None)
        
        # Admin has full access to all objects
        if user_role == 'admin':
            return True
        
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return user_role in ['inspector', 'supervisor', 'technician', 'analyst', 'admin']
        
        # Inspectors can only modify their own quality checks
        if request.method in ['PUT', 'PATCH']:
            if user_role == 'inspector':
                return obj.inspector == request.user
            return False
        
        # Only admins can delete
        if request.method == 'DELETE':
            return user_role == 'admin'
        
        return False


class InspectorOnlyPermission(permissions.BasePermission):
    """Permission that allows only inspectors and admins"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        return user_role in ['inspector', 'admin']


class ReadOnlyForNonInspectors(permissions.BasePermission):
    """
    Read-only permission for supervisors, technicians, and analysts
    Full access for inspectors and admins
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        
        # All roles can read
        if request.method in permissions.SAFE_METHODS:
            return user_role in ['inspector', 'supervisor', 'technician', 'analyst', 'admin']
        
        # Only inspectors and admins can write
        return user_role in ['inspector', 'admin']


class CanUploadImages(permissions.BasePermission):
    """Permission to upload quality control images"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        
        # Only inspectors and admins can upload images
        if request.method == 'POST' and 'image' in request.FILES:
            return user_role in ['inspector', 'admin', 'supervisor']
        
        return True  # Allow other operations to be handled by other permissions


class CanModifyQualityStatus(permissions.BasePermission):
    """Permission to modify quality check status (approve/reject)"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        
        # Check if request is trying to modify status
        if request.method in ['PUT', 'PATCH']:
            if 'status' in request.data:
                # Only inspectors and admins can change status
                return user_role in ['inspector', 'admin']
        
        return True  # Allow other operations


class QualityReportAccess(permissions.BasePermission):
    """Permission for accessing quality reports and analytics"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        
        # All authenticated users can view reports
        return user_role in ['inspector', 'supervisor', 'technician', 'analyst', 'admin']


# Legacy permissions for backwards compatibility
class CanManageQuality(QualityPermission):
    """Legacy permission - use QualityPermission instead"""
    pass


class CanUploadPhotos(CanUploadImages):
    """Legacy permission - use CanUploadImages instead"""
    pass


class IsQualityInspector(InspectorOnlyPermission):
    """Legacy permission - use InspectorOnlyPermission instead"""
    pass
