"""
Notification permissions for TexPro AI
Role-based access control for notification operations
"""

from rest_framework import permissions


class NotificationPermission(permissions.BasePermission):
    """
    Permission class for notification operations
    
    Rules:
    - Admin: Full access to all notifications (create, read, update, delete)
    - All authenticated users: Can view and manage their own notifications
    - Only admins can create notifications for other users
    - Users can only mark their own notifications as read/unread
    """
    
    def has_permission(self, request, view):
        """
        Check if user has permission to access the view
        """
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin has full access
        if request.user.role == 'admin':
            return True
        
        # For creating notifications, only admins allowed
        if view.action == 'create':
            return request.user.role == 'admin'
        
        # All authenticated users can view their own notifications
        return True
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user has permission to access specific notification
        """
        # Admin can access any notification
        if request.user.role == 'admin':
            return True
        
        # Users can only access their own notifications
        if hasattr(obj, 'recipient'):
            return obj.recipient == request.user
        
        return False


class NotificationPreferencePermission(permissions.BasePermission):
    """
    Permission class for notification preference operations
    
    Rules:
    - Users can only view and modify their own preferences
    - Admin can view all preferences but not modify others'
    """
    
    def has_permission(self, request, view):
        """
        Check if user has permission to access notification preferences
        """
        # Must be authenticated
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user has permission to access specific preference
        """
        # Users can only access their own preferences
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class SystemNotificationPermission(permissions.BasePermission):
    """
    Permission class for system notification operations
    
    Rules:
    - Only admins can access system notification features
    - System notifications are for broadcasting to multiple users
    """
    
    def has_permission(self, request, view):
        """
        Check if user has permission to access system notifications
        """
        # Must be authenticated admin
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )


class NotificationFilterPermission(permissions.BasePermission):
    """
    Permission class for notification filtering operations
    
    Rules:
    - All authenticated users can filter their own notifications
    - Admins can filter notifications for specific users
    """
    
    def has_permission(self, request, view):
        """
        Check if user has permission to filter notifications
        """
        # Must be authenticated
        return request.user and request.user.is_authenticated
