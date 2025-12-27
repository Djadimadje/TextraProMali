"""
Notification signals for TexPro AI
Automatic notification triggers for various app events
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from .services import NotificationService

User = get_user_model()


# Import models to set up signals
try:
    from workflow.models import BatchWorkflow
    from machines.models import Machine
    from maintenance.models import MaintenanceLog
    from quality.models import QualityCheck
    from allocation.models import WorkforceAllocation, MaterialAllocation
except ImportError:
    # Models might not be available during migrations
    BatchWorkflow = None
    Machine = None
    MaintenanceLog = None
    QualityCheck = None
    WorkforceAllocation = None
    MaterialAllocation = None


@receiver(post_save, sender=BatchWorkflow)
def batch_workflow_notification(sender, instance, created, **kwargs):
    """
    Send notifications for batch workflow events
    """
    if not created:
        # Check for status changes
        if hasattr(instance, '_state') and instance._state.adding:
            return
        
        # Get the previous instance to compare status
        try:
            previous = BatchWorkflow.objects.get(pk=instance.pk)
            if hasattr(previous, 'status') and previous.status != instance.status:
                # Status changed
                event_type = instance.status.lower()
                NotificationService.create_workflow_notification(
                    batch=instance,
                    event_type=event_type,
                    user=getattr(instance, '_updated_by', None)
                )
        except BatchWorkflow.DoesNotExist:
            pass
    else:
        # New batch created
        NotificationService.create_workflow_notification(
            batch=instance,
            event_type='started',
            user=instance.supervisor
        )


@receiver(post_save, sender=Machine)
def machine_notification(sender, instance, created, **kwargs):
    """
    Send notifications for machine events
    """
    if not created:
        # Check for status changes indicating breakdown
        if instance.status == 'broken':
            NotificationService.create_machine_notification(
                machine=instance,
                event_type='breakdown',
                user=getattr(instance, '_updated_by', None)
            )
        elif instance.status == 'operational':
            # Check if it was previously broken
            try:
                previous = Machine.objects.get(pk=instance.pk)
                if hasattr(previous, 'status') and previous.status == 'broken':
                    NotificationService.create_machine_notification(
                        machine=instance,
                        event_type='back_online',
                        user=getattr(instance, '_updated_by', None)
                    )
            except Machine.DoesNotExist:
                pass


@receiver(post_save, sender=MaintenanceLog)
def maintenance_notification(sender, instance, created, **kwargs):
    """
    Send notifications for maintenance events
    """
    if created:
        # New maintenance scheduled
        NotificationService.create_maintenance_notification(
            maintenance_log=instance,
            event_type='scheduled',
            user=getattr(instance, 'performed_by', None) or getattr(instance, 'technician', None)
        )
    else:
        # Check for completion
        if instance.status == 'completed':
            NotificationService.create_maintenance_notification(
                maintenance_log=instance,
                event_type='completed',
                user=getattr(instance, 'performed_by', None) or getattr(instance, 'technician', None)
            )


@receiver(post_save, sender=QualityCheck)
def quality_notification(sender, instance, created, **kwargs):
    """
    Send notifications for quality check events
    """
    if not created and instance.status:
        if instance.status == 'failed':
            NotificationService.create_quality_notification(
                quality_check=instance,
                event_type='failed',
                user=instance.inspector
            )
        elif instance.status == 'passed':
            NotificationService.create_quality_notification(
                quality_check=instance,
                event_type='passed',
                user=instance.inspector
            )


@receiver(post_save, sender=WorkforceAllocation)
def workforce_allocation_notification(sender, instance, created, **kwargs):
    """
    Send notifications for workforce allocation events
    """
    if created:
        NotificationService.create_allocation_notification(
            allocation=instance,
            event_type='created',
            user=instance.allocated_by
        )
    else:
        # Check for conflicts
        if hasattr(instance, 'has_conflict') and instance.has_conflict():
            NotificationService.create_allocation_notification(
                allocation=instance,
                event_type='conflict',
                user=getattr(instance, '_updated_by', None)
            )


@receiver(post_save, sender=MaterialAllocation)
def material_allocation_notification(sender, instance, created, **kwargs):
    """
    Send notifications for material allocation events
    """
    if created:
        NotificationService.create_allocation_notification(
            allocation=instance,
            event_type='created',
            user=instance.allocated_by
        )
    else:
        # Check for conflicts
        if hasattr(instance, 'has_conflict') and instance.has_conflict():
            NotificationService.create_allocation_notification(
                allocation=instance,
                event_type='conflict',
                user=getattr(instance, '_updated_by', None)
            )


@receiver(post_save, sender=User)
def user_welcome_notification(sender, instance, created, **kwargs):
    """
    Send welcome notification to new users
    """
    if created and instance.is_active:
        NotificationService.create_notification(
            recipient=instance,
            title="Welcome to TexPro AI",
            message=f"Welcome to TexPro AI, {instance.get_full_name() or instance.username}! "
                   f"Your account has been created successfully. "
                   f"You can now access the textile manufacturing optimization system.",
            notification_type='system',
            priority='normal'
        )


# Custom notification triggers that can be called manually
def trigger_maintenance_due_notifications():
    """
    Check for machines that are due for maintenance and send notifications
    This can be called from a scheduled task
    """
    if not Machine:
        return
    
    from django.utils import timezone
    from datetime import timedelta
    
    # Find machines due for maintenance (example logic)
    due_date = timezone.now() + timedelta(days=7)  # 7 days from now
    
    machines_due = Machine.objects.filter(
        status='operational',
        last_maintenance__lt=timezone.now() - timedelta(days=30)  # 30 days since last maintenance
    )
    
    for machine in machines_due:
        NotificationService.create_machine_notification(
            machine=machine,
            event_type='maintenance_due'
        )


def trigger_overdue_maintenance_notifications():
    """
    Check for overdue maintenance and send critical notifications
    """
    if not MaintenanceLog:
        return
    
    from django.utils import timezone
    from datetime import timedelta
    
    # Find overdue maintenance
    overdue_cutoff = timezone.now() - timedelta(hours=24)  # 24 hours overdue
    
    overdue_maintenance = MaintenanceLog.objects.filter(
        status='scheduled',
        scheduled_date__lt=overdue_cutoff
    )
    
    for maintenance in overdue_maintenance:
        NotificationService.create_maintenance_notification(
            maintenance_log=maintenance,
            event_type='overdue'
        )


def trigger_batch_delay_notifications():
    """
    Check for delayed batches and send notifications
    """
    if not BatchWorkflow:
        return
    
    from django.utils import timezone
    from datetime import timedelta
    
    # Find potentially delayed batches
    delay_cutoff = timezone.now() - timedelta(hours=2)  # 2 hours past expected
    
    delayed_batches = BatchWorkflow.objects.filter(
        status='in_progress',
        expected_completion__lt=delay_cutoff
    )
    
    for batch in delayed_batches:
        NotificationService.create_workflow_notification(
            batch=batch,
            event_type='delayed'
        )
