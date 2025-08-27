"""
Machines app configuration
"""
from django.apps import AppConfig


class MachinesConfig(AppConfig):
    """
    Configuration for machines app
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'machines'
    verbose_name = 'Machine Management'
    
    def ready(self):
        """
        App initialization
        """
        # Import models to apply monkey patches
        try:
            from machines.models import machine_extensions
        except ImportError:
            pass
