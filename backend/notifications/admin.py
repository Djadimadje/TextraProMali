"""
Notification admin configuration for TexPro AI
Django admin interface for notification management
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

from .models import Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """
    Admin interface for Notification model
    """
    
    list_display = [
        'title',
        'recipient_display',
        'type',
        'priority_display',
        'is_read',
        'created_at',
        'sent_by_display',
    ]
    
    list_filter = [
        'type',
        'priority',
        'is_read',
        'created_at',
    ]
    
    search_fields = [
        'title',
        'message',
        'recipient__username',
        'recipient__email',
        'sent_by__username',
    ]
    
    readonly_fields = [
        'id',
        'created_at',
        'read_at',
        'age_in_days',
        'is_recent',
    ]
    
    fieldsets = (
        ('Notification Details', {
            'fields': (
                'id',
                'title',
                'message',
                'type',
                'priority',
            )
        }),
        ('Recipients and Status', {
            'fields': (
                'recipient',
                'is_read',
                'read_at',
                'sent_by',
            )
        }),
        ('Related Object', {
            'fields': (
                'related_object_type',
                'related_object_id',
            ),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'age_in_days',
                'is_recent',
            ),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    def recipient_display(self, obj):
        """Display recipient with link to user admin"""
        if obj.recipient:
            url = reverse('admin:users_user_change', args=[obj.recipient.pk])
            return format_html(
                '<a href="{}">{}</a>',
                url,
                obj.recipient.get_full_name() or obj.recipient.username
            )
        return '-'
    recipient_display.short_description = 'Recipient'
    
    def sent_by_display(self, obj):
        """Display sender with link to user admin"""
        if obj.sent_by:
            url = reverse('admin:users_user_change', args=[obj.sent_by.pk])
            return format_html(
                '<a href="{}">{}</a>',
                url,
                obj.sent_by.get_full_name() or obj.sent_by.username
            )
        return 'System'
    sent_by_display.short_description = 'Sent By'
    
    def priority_display(self, obj):
        """Display priority with color coding"""
        colors = {
            'low': '#28a745',      # Green
            'normal': '#007bff',   # Blue
            'high': '#ffc107',     # Yellow
            'critical': '#dc3545'  # Red
        }
        color = colors.get(obj.priority, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_priority_display()
        )
    priority_display.short_description = 'Priority'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related(
            'recipient',
            'sent_by'
        )
    
    actions = ['mark_as_read', 'mark_as_unread', 'delete_notifications']
    
    def mark_as_read(self, request, queryset):
        """Admin action to mark notifications as read"""
        count = 0
        for notification in queryset.filter(is_read=False):
            notification.mark_as_read()
            count += 1
        
        self.message_user(
            request,
            f'{count} notifications marked as read.'
        )
    mark_as_read.short_description = 'Mark selected notifications as read'
    
    def mark_as_unread(self, request, queryset):
        """Admin action to mark notifications as unread"""
        count = 0
        for notification in queryset.filter(is_read=True):
            notification.mark_as_unread()
            count += 1
        
        self.message_user(
            request,
            f'{count} notifications marked as unread.'
        )
    mark_as_unread.short_description = 'Mark selected notifications as unread'
    
    def delete_notifications(self, request, queryset):
        """Admin action to delete notifications"""
        count = queryset.count()
        queryset.delete()
        
        self.message_user(
            request,
            f'{count} notifications deleted.'
        )
    delete_notifications.short_description = 'Delete selected notifications'


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    """
    Admin interface for NotificationPreference model
    """
    
    list_display = [
        'user_display',
        'digest_frequency',
        'email_enabled',
        'app_enabled',
        'quiet_hours_display',
        'updated_at',
    ]
    
    list_filter = [
        'digest_frequency',
        'email_workflow',
        'email_machine',
        'email_maintenance',
        'email_quality',
        'email_allocation',
        'email_system',
        'updated_at',
    ]
    
    search_fields = [
        'user__username',
        'user__email',
        'user__first_name',
        'user__last_name',
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Email Notifications', {
            'fields': (
                'email_workflow',
                'email_machine',
                'email_maintenance',
                'email_quality',
                'email_allocation',
                'email_system',
            )
        }),
        ('In-App Notifications', {
            'fields': (
                'app_workflow',
                'app_machine',
                'app_maintenance',
                'app_quality',
                'app_allocation',
                'app_system',
            )
        }),
        ('Notification Settings', {
            'fields': (
                'digest_frequency',
                'quiet_hours_start',
                'quiet_hours_end',
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['user__username']
    
    def user_display(self, obj):
        """Display user with link to user admin"""
        if obj.user:
            url = reverse('admin:users_user_change', args=[obj.user.pk])
            return format_html(
                '<a href="{}">{}</a>',
                url,
                obj.user.get_full_name() or obj.user.username
            )
        return '-'
    user_display.short_description = 'User'
    
    def email_enabled(self, obj):
        """Show if any email notifications are enabled"""
        enabled = any([
            obj.email_workflow,
            obj.email_machine,
            obj.email_maintenance,
            obj.email_quality,
            obj.email_allocation,
            obj.email_system,
        ])
        return format_html(
            '<span style="color: {};">●</span>',
            '#28a745' if enabled else '#dc3545'
        )
    email_enabled.short_description = 'Email'
    
    def app_enabled(self, obj):
        """Show if any app notifications are enabled"""
        enabled = any([
            obj.app_workflow,
            obj.app_machine,
            obj.app_maintenance,
            obj.app_quality,
            obj.app_allocation,
            obj.app_system,
        ])
        return format_html(
            '<span style="color: {};">●</span>',
            '#28a745' if enabled else '#dc3545'
        )
    app_enabled.short_description = 'In-App'
    
    def quiet_hours_display(self, obj):
        """Display quiet hours range"""
        if obj.quiet_hours_start and obj.quiet_hours_end:
            return f"{obj.quiet_hours_start} - {obj.quiet_hours_end}"
        return 'Not set'
    quiet_hours_display.short_description = 'Quiet Hours'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related('user')
