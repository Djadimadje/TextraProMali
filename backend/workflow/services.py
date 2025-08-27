"""
Workflow services for TexPro AI
Business logic for batch workflow management
"""
import logging
from datetime import date
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import BatchWorkflow
from users.models import User

logger = logging.getLogger('texproai.workflow')


class BatchWorkflowService:
    """
    Service class for batch workflow business logic
    Handles complex operations and business rules
    """
    
    @staticmethod
    def create_batch(batch_code, supervisor, description=None, start_date=None, end_date=None):
        """
        Create a new batch workflow with validation
        """
        try:
            with transaction.atomic():
                # Validate supervisor
                if not supervisor or supervisor.role not in ['supervisor', 'admin']:
                    raise ValidationError('Supervisor must have supervisor or admin role')
                
                # Create batch
                batch = BatchWorkflow.objects.create(
                    batch_code=batch_code,
                    description=description,
                    supervisor=supervisor,
                    start_date=start_date,
                    end_date=end_date,
                    status='pending'
                )
                
                logger.info(f"Created batch workflow: {batch_code} assigned to {supervisor.username}")
                return batch
                
        except Exception as e:
            logger.error(f"Failed to create batch {batch_code}: {str(e)}")
            raise
    
    @staticmethod
    def update_batch_status(batch_id, new_status, user=None):
        """
        Update batch status with validation and logging
        """
        try:
            with transaction.atomic():
                batch = BatchWorkflow.objects.select_for_update().get(id=batch_id)
                old_status = batch.status
                
                # Validate status transition
                if not batch._is_valid_status_transition(old_status, new_status):
                    raise ValidationError(f'Invalid status transition from {old_status} to {new_status}')
                
                batch.status = new_status
                batch.save(update_fields=['status', 'updated_at'])
                
                logger.info(
                    f"Batch {batch.batch_code} status changed from {old_status} to {new_status}"
                    f"{f' by {user.username}' if user else ''}"
                )
                
                return batch
                
        except BatchWorkflow.DoesNotExist:
            logger.error(f"Batch {batch_id} not found for status update")
            raise ValidationError('Batch not found')
        except Exception as e:
            logger.error(f"Failed to update batch {batch_id} status: {str(e)}")
            raise
    
    @staticmethod
    def auto_update_delayed_batches():
        """
        Automatically mark overdue batches as delayed
        This should be run periodically (e.g., daily cron job)
        """
        try:
            overdue_batches = BatchWorkflow.get_overdue_batches()
            updated_count = 0
            
            for batch in overdue_batches:
                try:
                    batch.mark_as_delayed()
                    updated_count += 1
                    logger.info(f"Marked batch {batch.batch_code} as delayed (overdue)")
                except Exception as e:
                    logger.error(f"Failed to mark batch {batch.batch_code} as delayed: {str(e)}")
            
            logger.info(f"Auto-updated {updated_count} overdue batches to delayed status")
            return updated_count
            
        except Exception as e:
            logger.error(f"Failed to auto-update delayed batches: {str(e)}")
            raise
    
    @staticmethod
    def start_batch_workflow(batch_id, start_date=None, user=None):
        """
        Start a batch workflow
        """
        try:
            with transaction.atomic():
                batch = BatchWorkflow.objects.select_for_update().get(id=batch_id)
                
                if batch.status != 'pending':
                    raise ValidationError('Can only start pending batch workflows')
                
                batch.start_workflow(start_date)
                
                logger.info(
                    f"Started batch workflow {batch.batch_code}"
                    f"{f' by {user.username}' if user else ''}"
                )
                
                return batch
                
        except BatchWorkflow.DoesNotExist:
            logger.error(f"Batch {batch_id} not found for starting")
            raise ValidationError('Batch not found')
        except Exception as e:
            logger.error(f"Failed to start batch {batch_id}: {str(e)}")
            raise
    
    @staticmethod
    def complete_batch_workflow(batch_id, completion_date=None, user=None):
        """
        Complete a batch workflow
        """
        try:
            with transaction.atomic():
                batch = BatchWorkflow.objects.select_for_update().get(id=batch_id)
                
                if batch.status not in ['in_progress', 'delayed']:
                    raise ValidationError('Can only complete in-progress or delayed batch workflows')
                
                batch.complete_workflow(completion_date)
                
                logger.info(
                    f"Completed batch workflow {batch.batch_code}"
                    f"{f' by {user.username}' if user else ''}"
                )
                
                return batch
                
        except BatchWorkflow.DoesNotExist:
            logger.error(f"Batch {batch_id} not found for completion")
            raise ValidationError('Batch not found')
        except Exception as e:
            logger.error(f"Failed to complete batch {batch_id}: {str(e)}")
            raise
    
    @staticmethod
    def cancel_batch_workflow(batch_id, reason=None, user=None):
        """
        Cancel a batch workflow
        """
        try:
            with transaction.atomic():
                batch = BatchWorkflow.objects.select_for_update().get(id=batch_id)
                
                if batch.status == 'completed':
                    raise ValidationError('Cannot cancel completed batch workflows')
                
                batch.cancel_workflow(reason)
                
                logger.info(
                    f"Cancelled batch workflow {batch.batch_code}"
                    f"{f' by {user.username}' if user else ''}"
                    f"{f' - Reason: {reason}' if reason else ''}"
                )
                
                return batch
                
        except BatchWorkflow.DoesNotExist:
            logger.error(f"Batch {batch_id} not found for cancellation")
            raise ValidationError('Batch not found')
        except Exception as e:
            logger.error(f"Failed to cancel batch {batch_id}: {str(e)}")
            raise
    
    @staticmethod
    def get_batch_statistics():
        """
        Get comprehensive batch statistics
        """
        try:
            stats = {
                'total_batches': BatchWorkflow.objects.count(),
                'active_batches': BatchWorkflow.get_active_batches().count(),
                'overdue_batches': len(BatchWorkflow.get_overdue_batches()),
                'by_status': dict(BatchWorkflow.get_stats_by_status().values_list('status', 'count')),
                'by_supervisor': {},
            }
            
            # Get supervisor statistics
            from django.db.models import Count
            supervisor_stats = BatchWorkflow.objects.values(
                'supervisor__username',
                'supervisor__first_name',
                'supervisor__last_name'
            ).annotate(
                batch_count=Count('id')
            ).order_by('-batch_count')
            
            for stat in supervisor_stats:
                supervisor_name = (
                    f"{stat['supervisor__first_name']} {stat['supervisor__last_name']}".strip() 
                    or stat['supervisor__username']
                )
                stats['by_supervisor'][supervisor_name] = stat['batch_count']
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get batch statistics: {str(e)}")
            raise
    
    @staticmethod
    def get_supervisor_dashboard(supervisor):
        """
        Get dashboard data for a specific supervisor
        """
        try:
            supervisor_batches = BatchWorkflow.get_by_supervisor(supervisor)
            
            dashboard = {
                'total_batches': supervisor_batches.count(),
                'pending_batches': supervisor_batches.filter(status='pending').count(),
                'in_progress_batches': supervisor_batches.filter(status='in_progress').count(),
                'completed_batches': supervisor_batches.filter(status='completed').count(),
                'delayed_batches': supervisor_batches.filter(status='delayed').count(),
                'cancelled_batches': supervisor_batches.filter(status='cancelled').count(),
                'overdue_batches': len([b for b in supervisor_batches if b.is_overdue]),
                'recent_batches': list(supervisor_batches.order_by('-created_at')[:5].values(
                    'id', 'batch_code', 'status', 'created_at', 'end_date'
                )),
            }
            
            return dashboard
            
        except Exception as e:
            logger.error(f"Failed to get supervisor dashboard for {supervisor.username}: {str(e)}")
            raise
    
    @staticmethod
    def reassign_batch_supervisor(batch_id, new_supervisor, user=None):
        """
        Reassign a batch to a different supervisor
        """
        try:
            with transaction.atomic():
                batch = BatchWorkflow.objects.select_for_update().get(id=batch_id)
                old_supervisor = batch.supervisor
                
                # Validate new supervisor
                if not new_supervisor or new_supervisor.role not in ['supervisor', 'admin']:
                    raise ValidationError('New supervisor must have supervisor or admin role')
                
                batch.supervisor = new_supervisor
                batch.save(update_fields=['supervisor', 'updated_at'])
                
                logger.info(
                    f"Reassigned batch {batch.batch_code} from {old_supervisor.username} "
                    f"to {new_supervisor.username}"
                    f"{f' by {user.username}' if user else ''}"
                )
                
                return batch
                
        except BatchWorkflow.DoesNotExist:
            logger.error(f"Batch {batch_id} not found for reassignment")
            raise ValidationError('Batch not found')
        except Exception as e:
            logger.error(f"Failed to reassign batch {batch_id}: {str(e)}")
            raise
    
    @staticmethod
    def bulk_update_batch_status(batch_ids, new_status, user=None):
        """
        Bulk update status for multiple batches
        """
        updated_batches = []
        failed_batches = []
        
        for batch_id in batch_ids:
            try:
                batch = BatchWorkflowService.update_batch_status(batch_id, new_status, user)
                updated_batches.append(batch)
            except Exception as e:
                failed_batches.append({'batch_id': batch_id, 'error': str(e)})
        
        logger.info(
            f"Bulk status update: {len(updated_batches)} successful, "
            f"{len(failed_batches)} failed"
            f"{f' by {user.username}' if user else ''}"
        )
        
        return {
            'updated': updated_batches,
            'failed': failed_batches,
            'success_count': len(updated_batches),
            'failure_count': len(failed_batches)
        }
