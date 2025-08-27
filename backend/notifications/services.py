"""
Notification services for TexPro AI
Business logic for creating and managing notifications
"""

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from .models import Notification, NotificationPreference

User = get_user_model()


class NotificationService:
    """
    Service for managing notifications across the system
    """
    
    @staticmethod
    def create_notification(
        recipient,
        title,
        message,
        notification_type='system',
        priority='normal',
        related_object_type=None,
        related_object_id=None,
        sent_by=None
    ):
        """
        Create a new notification
        
        Args:
            recipient: User to receive notification
            title: Notification title
            message: Notification message
            notification_type: Type of notification
            priority: Priority level
            related_object_type: Type of related object
            related_object_id: ID of related object
            sent_by: User who sent the notification
        
        Returns:
            Notification instance
        """
        # Get or create notification preferences for user
        preferences, created = NotificationPreference.objects.get_or_create(
            user=recipient
        )
        
        # Check if user wants this type of notification
        if not preferences.should_send_app_notification(notification_type):
            return None
        
        # Check quiet hours
        if preferences.is_quiet_hours() and priority not in ['high', 'critical']:
            return None
        
        notification = Notification.objects.create(
            recipient=recipient,
            title=title,
            message=message,
            type=notification_type,
            priority=priority,
            related_object_type=related_object_type,
            related_object_id=related_object_id,
            sent_by=sent_by
        )
        
        # Send email if enabled and configured
        if preferences.should_send_email(notification_type):
            NotificationService.send_email_notification(notification)
        
        return notification
    
    @staticmethod
    def send_email_notification(notification):
        """
        Send email notification if email settings are configured
        """
        if not getattr(settings, 'EMAIL_HOST', None):
            return False
        
        try:
            # Create email context
            context = {
                'notification': notification,
                'site_name': 'TexPro AI',
                'site_url': getattr(settings, 'SITE_URL', 'http://localhost:3000'),
            }
            
            # Render email templates
            html_message = render_to_string('notifications/notification_email.html', context)
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject=f"[TexPro AI] {notification.title}",
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[notification.recipient.email],
                html_message=html_message,
                fail_silently=True,
            )
            return True
        except Exception:
            return False
    
    @staticmethod
    def create_workflow_notification(batch, event_type, user=None):
        """
        Create workflow-related notifications
        
        Args:
            batch: BatchWorkflow instance
            event_type: Type of workflow event
            user: User who triggered the event
        """
        # Get relevant users based on event type
        recipients = NotificationService._get_workflow_recipients(batch, event_type)
        
        # Create notification content
        title, message, priority = NotificationService._get_workflow_content(
            batch, event_type, user
        )
        
        # Create notifications for each recipient
        notifications = []
        for recipient in recipients:
            notification = NotificationService.create_notification(
                recipient=recipient,
                title=title,
                message=message,
                notification_type='workflow',
                priority=priority,
                related_object_type='batch',
                related_object_id=batch.id,
                sent_by=user
            )
            if notification:
                notifications.append(notification)
        
        return notifications
    
    @staticmethod
    def create_machine_notification(machine, event_type, user=None):
        """
        Create machine-related notifications
        """
        recipients = NotificationService._get_machine_recipients(machine, event_type)
        title, message, priority = NotificationService._get_machine_content(
            machine, event_type, user
        )
        
        notifications = []
        for recipient in recipients:
            notification = NotificationService.create_notification(
                recipient=recipient,
                title=title,
                message=message,
                notification_type='machine',
                priority=priority,
                related_object_type='machine',
                related_object_id=machine.id,
                sent_by=user
            )
            if notification:
                notifications.append(notification)
        
        return notifications
    
    @staticmethod
    def create_maintenance_notification(maintenance_log, event_type, user=None):
        """
        Create maintenance-related notifications
        """
        recipients = NotificationService._get_maintenance_recipients(
            maintenance_log, event_type
        )
        title, message, priority = NotificationService._get_maintenance_content(
            maintenance_log, event_type, user
        )
        
        notifications = []
        for recipient in recipients:
            notification = NotificationService.create_notification(
                recipient=recipient,
                title=title,
                message=message,
                notification_type='maintenance',
                priority=priority,
                related_object_type='maintenance_log',
                related_object_id=maintenance_log.id,
                sent_by=user
            )
            if notification:
                notifications.append(notification)
        
        return notifications
    
    @staticmethod
    def create_quality_notification(quality_check, event_type, user=None):
        """
        Create quality-related notifications
        """
        recipients = NotificationService._get_quality_recipients(quality_check, event_type)
        title, message, priority = NotificationService._get_quality_content(
            quality_check, event_type, user
        )
        
        notifications = []
        for recipient in recipients:
            notification = NotificationService.create_notification(
                recipient=recipient,
                title=title,
                message=message,
                notification_type='quality',
                priority=priority,
                related_object_type='quality_check',
                related_object_id=quality_check.id,
                sent_by=user
            )
            if notification:
                notifications.append(notification)
        
        return notifications
    
    @staticmethod
    def create_allocation_notification(allocation, event_type, user=None):
        """
        Create allocation-related notifications
        """
        recipients = NotificationService._get_allocation_recipients(allocation, event_type)
        title, message, priority = NotificationService._get_allocation_content(
            allocation, event_type, user
        )
        
        notifications = []
        for recipient in recipients:
            notification = NotificationService.create_notification(
                recipient=recipient,
                title=title,
                message=message,
                notification_type='allocation',
                priority=priority,
                related_object_type=type(allocation).__name__.lower(),
                related_object_id=allocation.id,
                sent_by=user
            )
            if notification:
                notifications.append(notification)
        
        return notifications
    
    @staticmethod
    def broadcast_notification(title, message, user_filter=None, priority='normal', sent_by=None):
        """
        Send notification to multiple users
        
        Args:
            title: Notification title
            message: Notification message
            user_filter: Q object to filter users, None for all users
            priority: Notification priority
            sent_by: User who sent the notification
        """
        users = User.objects.filter(is_active=True)
        if user_filter:
            users = users.filter(user_filter)
        
        notifications = []
        for user in users:
            notification = NotificationService.create_notification(
                recipient=user,
                title=title,
                message=message,
                notification_type='system',
                priority=priority,
                sent_by=sent_by
            )
            if notification:
                notifications.append(notification)
        
        return notifications
    
    # Helper methods for getting recipients
    @staticmethod
    def _get_workflow_recipients(batch, event_type):
        """Get users who should receive workflow notifications"""
        recipients = set()
        
        # Always notify supervisors and admins
        recipients.update(
            User.objects.filter(
                role__in=['admin', 'supervisor'],
                is_active=True
            )
        )
        
        # Add batch creator
        if batch.created_by:
            recipients.add(batch.created_by)
        
        # Add quality inspectors for quality-related events
        if event_type in ['quality_failed', 'quality_passed']:
            recipients.update(
                User.objects.filter(
                    role='inspector',
                    is_active=True
                )
            )
        
        return list(recipients)
    
    @staticmethod
    def _get_machine_recipients(machine, event_type):
        """Get users who should receive machine notifications"""
        recipients = set()
        
        # Notify supervisors, admins, and technicians
        recipients.update(
            User.objects.filter(
                role__in=['admin', 'supervisor', 'technician'],
                is_active=True
            )
        )
        
        return list(recipients)
    
    @staticmethod
    def _get_maintenance_recipients(maintenance_log, event_type):
        """Get users who should receive maintenance notifications"""
        recipients = set()
        
        # Notify supervisors, admins, and technicians
        recipients.update(
            User.objects.filter(
                role__in=['admin', 'supervisor', 'technician'],
                is_active=True
            )
        )
        
        return list(recipients)
    
    @staticmethod
    def _get_quality_recipients(quality_check, event_type):
        """Get users who should receive quality notifications"""
        recipients = set()
        
        # Notify supervisors, admins, and inspectors
        recipients.update(
            User.objects.filter(
                role__in=['admin', 'supervisor', 'inspector'],
                is_active=True
            )
        )
        
        return list(recipients)
    
    @staticmethod
    def _get_allocation_recipients(allocation, event_type):
        """Get users who should receive allocation notifications"""
        recipients = set()
        
        # Notify supervisors and admins
        recipients.update(
            User.objects.filter(
                role__in=['admin', 'supervisor'],
                is_active=True
            )
        )
        
        return list(recipients)
    
    # Helper methods for getting notification content
    @staticmethod
    def _get_workflow_content(batch, event_type, user):
        """Get notification content for workflow events"""
        content_map = {
            'started': {
                'title': f"Batch {batch.batch_number} Started",
                'message': f"Production batch {batch.batch_number} for {batch.product_type} has been started.",
                'priority': 'normal'
            },
            'completed': {
                'title': f"Batch {batch.batch_number} Completed",
                'message': f"Production batch {batch.batch_number} has been completed successfully.",
                'priority': 'normal'
            },
            'delayed': {
                'title': f"Batch {batch.batch_number} Delayed",
                'message': f"Production batch {batch.batch_number} is experiencing delays.",
                'priority': 'high'
            },
            'cancelled': {
                'title': f"Batch {batch.batch_number} Cancelled",
                'message': f"Production batch {batch.batch_number} has been cancelled.",
                'priority': 'high'
            },
        }
        
        content = content_map.get(event_type, {
            'title': f"Batch {batch.batch_number} Update",
            'message': f"Batch {batch.batch_number} has been updated.",
            'priority': 'normal'
        })
        
        return content['title'], content['message'], content['priority']
    
    @staticmethod
    def _get_machine_content(machine, event_type, user):
        """Get notification content for machine events"""
        content_map = {
            'breakdown': {
                'title': f"Machine {machine.name} Breakdown",
                'message': f"Machine {machine.name} has broken down and requires attention.",
                'priority': 'critical'
            },
            'maintenance_due': {
                'title': f"Maintenance Due: {machine.name}",
                'message': f"Machine {machine.name} is due for scheduled maintenance.",
                'priority': 'high'
            },
            'back_online': {
                'title': f"Machine {machine.name} Back Online",
                'message': f"Machine {machine.name} has been repaired and is back online.",
                'priority': 'normal'
            },
        }
        
        content = content_map.get(event_type, {
            'title': f"Machine {machine.name} Update",
            'message': f"Machine {machine.name} has been updated.",
            'priority': 'normal'
        })
        
        return content['title'], content['message'], content['priority']
    
    @staticmethod
    def _get_maintenance_content(maintenance_log, event_type, user):
        """Get notification content for maintenance events"""
        machine_name = maintenance_log.machine.name if maintenance_log.machine else "Unknown"
        
        content_map = {
            'scheduled': {
                'title': f"Maintenance Scheduled: {machine_name}",
                'message': f"Maintenance has been scheduled for {machine_name}.",
                'priority': 'normal'
            },
            'completed': {
                'title': f"Maintenance Completed: {machine_name}",
                'message': f"Maintenance for {machine_name} has been completed.",
                'priority': 'normal'
            },
            'overdue': {
                'title': f"Maintenance Overdue: {machine_name}",
                'message': f"Scheduled maintenance for {machine_name} is overdue.",
                'priority': 'high'
            },
        }
        
        content = content_map.get(event_type, {
            'title': f"Maintenance Update: {machine_name}",
            'message': f"Maintenance log for {machine_name} has been updated.",
            'priority': 'normal'
        })
        
        return content['title'], content['message'], content['priority']
    
    @staticmethod
    def _get_quality_content(quality_check, event_type, user):
        """Get notification content for quality events"""
        content_map = {
            'failed': {
                'title': f"Quality Check Failed",
                'message': f"Quality check has failed and requires attention.",
                'priority': 'high'
            },
            'passed': {
                'title': f"Quality Check Passed",
                'message': f"Quality check has passed successfully.",
                'priority': 'normal'
            },
            'review_needed': {
                'title': f"Quality Review Needed",
                'message': f"Quality check requires supervisor review.",
                'priority': 'normal'
            },
        }
        
        content = content_map.get(event_type, {
            'title': f"Quality Update",
            'message': f"Quality check has been updated.",
            'priority': 'normal'
        })
        
        return content['title'], content['message'], content['priority']
    
    @staticmethod
    def _get_allocation_content(allocation, event_type, user):
        """Get notification content for allocation events"""
        allocation_type = type(allocation).__name__.replace('Allocation', '').lower()
        
        content_map = {
            'created': {
                'title': f"{allocation_type.title()} Allocation Created",
                'message': f"New {allocation_type} allocation has been created.",
                'priority': 'normal'
            },
            'conflict': {
                'title': f"{allocation_type.title()} Allocation Conflict",
                'message': f"Conflict detected in {allocation_type} allocation.",
                'priority': 'high'
            },
            'completed': {
                'title': f"{allocation_type.title()} Allocation Completed",
                'message': f"{allocation_type.title()} allocation has been completed.",
                'priority': 'normal'
            },
        }
        
        content = content_map.get(event_type, {
            'title': f"{allocation_type.title()} Allocation Update",
            'message': f"{allocation_type.title()} allocation has been updated.",
            'priority': 'normal'
        })
        
        return content['title'], content['message'], content['priority']
