"""
Workflow app configuration for TexPro AI
Production workflow and batch management
"""
from django.apps import AppConfig


class WorkflowConfig(AppConfig):
    """Configuration for the workflow app"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'workflow'
    verbose_name = 'Production Workflow'
    
    def ready(self):
        """Initialize app when ready"""
        # Import signal handlers if any
        # import workflow.signals
