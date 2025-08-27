"""
Workflow permissions for TexPro AI
Role-based access control for batch workflow management
"""
from rest_framework import permissions
from users.permissions import IsAdmin, IsSupervisor


class IsAdminOrSupervisor(permissions.BasePermission):
    """
    Permission class for admin and supervisor access
    """
    
    def has_permission(self, request, view):
        """Check if user is admin or supervisor"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.role in ['admin', 'supervisor']


class CanManageBatch(permissions.BasePermission):
    """
    Permission class for batch management
    - Admin: Full access to all batches
    - Supervisor: Can manage their own batches
    - Others: Read-only access
    """
    
    def has_permission(self, request, view):
        """Check basic permission for the view"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        # All authenticated users can view
        if request.method in permissions.READONLY_METHODS:
            return True
        
        # Only admin and supervisor can modify
        return request.user.role in ['admin', 'supervisor']
    
    def has_object_permission(self, request, view, obj):
        """Check permission for specific batch object"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Read permission for all authenticated users
        if request.method in permissions.READONLY_METHODS:
            return True
        
        # Admin has full access
        if request.user.role == 'admin':
            return True
        
        # Supervisor can only manage their own batches
        if request.user.role == 'supervisor':
            return obj.supervisor == request.user
        
        # Others have no write access
        return False


class CanCreateBatch(permissions.BasePermission):
    """
    Permission class for batch creation
    Only admin and supervisor can create batches
    """
    
    def has_permission(self, request, view):
        """Check if user can create batches"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.role in ['admin', 'supervisor']


class CanDeleteBatch(permissions.BasePermission):
    """
    Permission class for batch deletion
    Only admin can delete batches
    """
    
    def has_permission(self, request, view):
        """Check if user can delete batches"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.role == 'admin'
    
    def has_object_permission(self, request, view, obj):
        """Check permission for specific batch deletion"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Only admin can delete
        return request.user.role == 'admin'


class BatchWorkflowPermissions:
    """
    Centralized permission management for batch workflows
    """
    
    @staticmethod
    def get_create_permissions():
        """Get permissions for creating batches"""
        return [permissions.IsAuthenticated, CanCreateBatch]
    
    @staticmethod
    def get_list_permissions():
        """Get permissions for listing batches"""
        return [permissions.IsAuthenticated]
    
    @staticmethod
    def get_detail_permissions():
        """Get permissions for batch details"""
        return [permissions.IsAuthenticated, CanManageBatch]
    
    @staticmethod
    def get_update_permissions():
        """Get permissions for updating batches"""
        return [permissions.IsAuthenticated, CanManageBatch]
    
    @staticmethod
    def get_delete_permissions():
        """Get permissions for deleting batches"""
        return [permissions.IsAuthenticated, CanDeleteBatch]
    
    @staticmethod
    def can_view_batch(user, batch):
        """Check if user can view specific batch"""
        if not user or not user.is_authenticated:
            return False
        
        # All authenticated users can view
        return True
    
    @staticmethod
    def can_edit_batch(user, batch):
        """Check if user can edit specific batch"""
        if not user or not user.is_authenticated:
            return False
        
        # Admin can edit all
        if user.role == 'admin':
            return True
        
        # Supervisor can edit their own batches
        if user.role == 'supervisor':
            return batch.supervisor == user
        
        return False
    
    @staticmethod
    def can_delete_batch(user, batch):
        """Check if user can delete specific batch"""
        if not user or not user.is_authenticated:
            return False
        
        # Only admin can delete
        return user.role == 'admin'
    
    @staticmethod
    def filter_batches_for_user(queryset, user):
        """
        Filter batches based on user role and permissions
        """
        if not user or not user.is_authenticated:
            return queryset.none()
        
        # Admin can see all batches
        if user.role == 'admin':
            return queryset
        
        # For other roles, no filtering needed - all can view all batches
        # but with different permissions for editing
        return queryset
    
    @staticmethod
    def get_supervisor_choices_for_user(user):
        """
        Get available supervisor choices based on user role
        """
        from users.models import User
        
        if not user or not user.is_authenticated:
            return User.objects.none()
        
        # Admin can assign any supervisor
        if user.role == 'admin':
            return User.objects.filter(role__in=['supervisor', 'admin'])
        
        # Supervisor can only assign themselves
        if user.role == 'supervisor':
            return User.objects.filter(id=user.id)
        
        # Others cannot create batches
        return User.objects.none()
