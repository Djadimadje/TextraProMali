"""
Notification serializers for TexPro AI
API serialization for notification data
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

from ..models import Notification, NotificationPreference

User = get_user_model()


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model
    """
    
    recipient_name = serializers.CharField(
        source='recipient.get_full_name',
        read_only=True
    )
    
    sent_by_name = serializers.CharField(
        source='sent_by.get_full_name',
        read_only=True
    )
    
    age_in_days = serializers.ReadOnlyField()
    is_recent = serializers.ReadOnlyField()
    priority_color = serializers.ReadOnlyField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'recipient_name',
            'title',
            'message',
            'type',
            'priority',
            'is_read',
            'read_at',
            'created_at',
            'related_object_type',
            'related_object_id',
            'sent_by',
            'sent_by_name',
            'age_in_days',
            'is_recent',
            'priority_color',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'read_at',
            'recipient_name',
            'sent_by_name',
            'age_in_days',
            'is_recent',
            'priority_color',
        ]
    
    def validate(self, data):
        """
        Validate notification data
        """
        # Ensure recipient is provided for new notifications
        if not self.instance and not data.get('recipient'):
            raise serializers.ValidationError(
                "Recipient is required for new notifications."
            )
        
        return data


class NotificationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating notifications (admin use)
    """
    
    recipient_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False,
        help_text="List of user IDs to send notification to"
    )
    
    send_to_all = serializers.BooleanField(
        write_only=True,
        default=False,
        help_text="Send notification to all active users"
    )
    
    send_to_role = serializers.CharField(
        write_only=True,
        required=False,
        help_text="Send notification to users with specific role"
    )
    
    class Meta:
        model = Notification
        fields = [
            'title',
            'message',
            'type',
            'priority',
            'recipient_ids',
            'send_to_all',
            'send_to_role',
        ]
    
    def validate(self, data):
        """
        Validate notification creation data
        """
        recipient_ids = data.get('recipient_ids', [])
        send_to_all = data.get('send_to_all', False)
        send_to_role = data.get('send_to_role')
        
        # Must specify at least one recipient method
        if not recipient_ids and not send_to_all and not send_to_role:
            raise serializers.ValidationError(
                "Must specify recipient_ids, send_to_all=True, or send_to_role."
            )
        
        # Validate role if specified
        if send_to_role:
            valid_roles = ['admin', 'supervisor', 'inspector', 'technician', 'analyst']
            if send_to_role not in valid_roles:
                raise serializers.ValidationError(
                    f"Invalid role. Must be one of: {', '.join(valid_roles)}"
                )
        
        # Validate recipient IDs exist
        if recipient_ids:
            existing_users = User.objects.filter(
                id__in=recipient_ids,
                is_active=True
            ).count()
            if existing_users != len(recipient_ids):
                raise serializers.ValidationError(
                    "Some recipient IDs are invalid or belong to inactive users."
                )
        
        return data


class NotificationListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing notifications
    """
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'type',
            'priority',
            'is_read',
            'created_at',
            'priority_color',
            'is_recent',
        ]


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer for NotificationPreference model
    """
    
    class Meta:
        model = NotificationPreference
        fields = [
            'user',
            'email_workflow',
            'email_machine',
            'email_maintenance',
            'email_quality',
            'email_allocation',
            'email_system',
            'app_workflow',
            'app_machine',
            'app_maintenance',
            'app_quality',
            'app_allocation',
            'app_system',
            'digest_frequency',
            'quiet_hours_start',
            'quiet_hours_end',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def validate(self, data):
        """
        Validate notification preferences
        """
        quiet_start = data.get('quiet_hours_start')
        quiet_end = data.get('quiet_hours_end')
        
        # If one quiet hour is set, both must be set
        if (quiet_start and not quiet_end) or (quiet_end and not quiet_start):
            raise serializers.ValidationError(
                "Both quiet_hours_start and quiet_hours_end must be set together."
            )
        
        return data


class NotificationStatsSerializer(serializers.Serializer):
    """
    Serializer for notification statistics
    """
    
    total_notifications = serializers.IntegerField()
    unread_notifications = serializers.IntegerField()
    read_notifications = serializers.IntegerField()
    
    # By type
    workflow_count = serializers.IntegerField()
    machine_count = serializers.IntegerField()
    maintenance_count = serializers.IntegerField()
    quality_count = serializers.IntegerField()
    allocation_count = serializers.IntegerField()
    system_count = serializers.IntegerField()
    
    # By priority
    low_priority_count = serializers.IntegerField()
    normal_priority_count = serializers.IntegerField()
    high_priority_count = serializers.IntegerField()
    critical_priority_count = serializers.IntegerField()
    
    # Recent activity
    recent_notifications = serializers.IntegerField()
    
    class Meta:
        fields = [
            'total_notifications',
            'unread_notifications',
            'read_notifications',
            'workflow_count',
            'machine_count',
            'maintenance_count',
            'quality_count',
            'allocation_count',
            'system_count',
            'low_priority_count',
            'normal_priority_count',
            'high_priority_count',
            'critical_priority_count',
            'recent_notifications',
        ]


class BulkMarkReadSerializer(serializers.Serializer):
    """
    Serializer for bulk marking notifications as read
    """
    
    notification_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        help_text="List of notification IDs to mark as read"
    )
    
    mark_all = serializers.BooleanField(
        default=False,
        help_text="Mark all notifications as read"
    )
    
    def validate(self, data):
        """
        Validate bulk mark read data
        """
        notification_ids = data.get('notification_ids', [])
        mark_all = data.get('mark_all', False)
        
        if not notification_ids and not mark_all:
            raise serializers.ValidationError(
                "Must specify notification_ids or mark_all=True."
            )
        
        return data


class NotificationFilterSerializer(serializers.Serializer):
    """
    Serializer for notification filtering parameters
    """
    
    TYPE_CHOICES = [
        ('workflow', 'Workflow'),
        ('machine', 'Machine'),
        ('maintenance', 'Maintenance'),
        ('quality', 'Quality'),
        ('allocation', 'Allocation'),
        ('system', 'System'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    is_read = serializers.BooleanField(
        required=False,
        help_text="Filter by read status"
    )
    
    type = serializers.ChoiceField(
        choices=TYPE_CHOICES,
        required=False,
        help_text="Filter by notification type"
    )
    
    priority = serializers.ChoiceField(
        choices=PRIORITY_CHOICES,
        required=False,
        help_text="Filter by priority level"
    )
    
    days_back = serializers.IntegerField(
        min_value=1,
        max_value=365,
        required=False,
        help_text="Number of days back to include"
    )
    
    search = serializers.CharField(
        max_length=255,
        required=False,
        help_text="Search in title and message"
    )
