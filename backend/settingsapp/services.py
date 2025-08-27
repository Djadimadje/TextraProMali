"""
Settings services for TexPro AI
Business logic for system configuration management
"""

from django.core.cache import cache
from .models import SystemSetting


class SettingsService:
    """
    Service for managing system settings
    """
    
    CACHE_PREFIX = 'setting_'
    CACHE_TIMEOUT = 300  # 5 minutes
    
    @staticmethod
    def get_setting(key, default=None, as_type=None):
        """
        Get setting value with optional type conversion and caching
        
        Args:
            key: Setting key
            default: Default value if setting not found
            as_type: Type to convert to ('int', 'float', 'bool', 'json', 'list')
        
        Returns:
            Setting value converted to specified type or default
        """
        # Try cache first
        cache_key = f"{SettingsService.CACHE_PREFIX}{key.lower()}"
        cached_value = cache.get(cache_key)
        
        if cached_value is not None:
            setting_value = cached_value
        else:
            # Get from database
            try:
                setting = SystemSetting.objects.get(key=key.lower())
                setting_value = setting.value
                # Cache the value
                cache.set(cache_key, setting_value, SettingsService.CACHE_TIMEOUT)
            except SystemSetting.DoesNotExist:
                return default
        
        # Convert to requested type
        if as_type and setting_value is not None:
            return SettingsService._convert_value(setting_value, as_type, default)
        
        return setting_value
    
    @staticmethod
    def set_setting(key, value, description=None):
        """
        Set or update setting value
        
        Args:
            key: Setting key
            value: Setting value
            description: Setting description
        
        Returns:
            SystemSetting instance
        """
        setting = SystemSetting.set_setting_value(key, value, description)
        
        # Clear cache
        cache_key = f"{SettingsService.CACHE_PREFIX}{key.lower()}"
        cache.delete(cache_key)
        
        return setting
    
    @staticmethod
    def delete_setting(key):
        """
        Delete setting by key
        
        Args:
            key: Setting key to delete
        
        Returns:
            bool: True if deleted, False if not found
        """
        try:
            setting = SystemSetting.objects.get(key=key.lower())
            setting.delete()
            
            # Clear cache
            cache_key = f"{SettingsService.CACHE_PREFIX}{key.lower()}"
            cache.delete(cache_key)
            
            return True
        except SystemSetting.DoesNotExist:
            return False
    
    @staticmethod
    def _convert_value(value, as_type, default=None):
        """
        Convert string value to specified type
        """
        try:
            if as_type == 'int':
                return int(value)
            elif as_type == 'float':
                return float(value)
            elif as_type == 'bool':
                return value.lower() in ('true', '1', 'yes', 'on')
            elif as_type == 'json':
                import json
                return json.loads(value)
            elif as_type == 'list':
                return [item.strip() for item in value.split(',') if item.strip()]
            else:
                return value
        except (ValueError, TypeError, AttributeError):
            return default
    
    @staticmethod
    def get_maintenance_settings():
        """
        Get all maintenance-related settings
        """
        return {
            'interval_days': SettingsService.get_setting('maintenance_interval_days', 30, 'int'),
            'warning_days': SettingsService.get_setting('maintenance_warning_days', 7, 'int'),
            'overdue_hours': SettingsService.get_setting('maintenance_overdue_hours', 24, 'int'),
        }
    
    @staticmethod
    def get_quality_settings():
        """
        Get all quality-related settings
        """
        return {
            'max_defect_rate': SettingsService.get_setting('max_defect_rate', 0.05, 'float'),
            'check_interval_batches': SettingsService.get_setting('quality_check_interval_batches', 10, 'int'),
            'critical_defect_rate': SettingsService.get_setting('critical_defect_rate', 0.02, 'float'),
        }
    
    @staticmethod
    def get_workflow_settings():
        """
        Get all workflow-related settings
        """
        return {
            'max_batch_duration_hours': SettingsService.get_setting('max_batch_duration_hours', 48, 'int'),
            'delay_warning_hours': SettingsService.get_setting('batch_delay_warning_hours', 6, 'int'),
            'max_concurrent_batches': SettingsService.get_setting('max_concurrent_batches', 20, 'int'),
        }
    
    @staticmethod
    def get_machine_settings():
        """
        Get all machine-related settings
        """
        return {
            'efficiency_threshold': SettingsService.get_setting('machine_efficiency_threshold', 0.85, 'float'),
            'downtime_alert_minutes': SettingsService.get_setting('machine_downtime_alert_minutes', 30, 'int'),
            'temperature_max_celsius': SettingsService.get_setting('machine_temperature_max_celsius', 80, 'int'),
        }
    
    @staticmethod
    def get_allocation_settings():
        """
        Get all allocation-related settings
        """
        return {
            'max_worker_overtime_hours': SettingsService.get_setting('max_worker_overtime_hours', 10, 'int'),
            'conflict_check': SettingsService.get_setting('allocation_conflict_check', True, 'bool'),
            'utilization_target': SettingsService.get_setting('resource_utilization_target', 0.90, 'float'),
        }
    
    @staticmethod
    def get_notification_settings():
        """
        Get all notification-related settings
        """
        return {
            'retention_days': SettingsService.get_setting('notification_retention_days', 90, 'int'),
            'email_enabled': SettingsService.get_setting('email_notification_enabled', True, 'bool'),
            'sms_critical': SettingsService.get_setting('critical_notification_sms', False, 'bool'),
        }
    
    @staticmethod
    def get_system_settings():
        """
        Get all system-related settings
        """
        return {
            'timezone': SettingsService.get_setting('system_timezone', 'Africa/Bamako'),
            'currency': SettingsService.get_setting('currency', 'XOF'),
            'language': SettingsService.get_setting('language', 'fr'),
            'backup_retention_days': SettingsService.get_setting('backup_retention_days', 30, 'int'),
        }
    
    @staticmethod
    def get_performance_settings():
        """
        Get all performance-related settings
        """
        return {
            'analytics_cache_duration': SettingsService.get_setting('analytics_cache_duration_minutes', 5, 'int'),
            'api_rate_limit': SettingsService.get_setting('api_rate_limit_per_minute', 100, 'int'),
            'max_export_records': SettingsService.get_setting('max_export_records', 10000, 'int'),
        }
    
    @staticmethod
    def initialize_defaults():
        """
        Initialize system with default settings
        """
        return SystemSetting.initialize_default_settings()
    
    @staticmethod
    def clear_cache():
        """
        Clear all settings from cache
        """
        # Get all setting keys from database
        keys = SystemSetting.objects.values_list('key', flat=True)
        
        for key in keys:
            cache_key = f"{SettingsService.CACHE_PREFIX}{key}"
            cache.delete(cache_key)
    
    @staticmethod
    def get_all_settings():
        """
        Get all settings as dictionary
        """
        settings = {}
        for setting in SystemSetting.objects.all():
            settings[setting.key] = {
                'value': setting.value,
                'description': setting.description,
                'updated_at': setting.updated_at
            }
        return settings
    
    @staticmethod
    def export_settings():
        """
        Export settings for backup or migration
        """
        import json
        from django.core.serializers.json import DjangoJSONEncoder
        
        settings_data = []
        for setting in SystemSetting.objects.all():
            settings_data.append({
                'key': setting.key,
                'value': setting.value,
                'description': setting.description,
                'created_at': setting.created_at,
                'updated_at': setting.updated_at,
            })
        
        return json.dumps(settings_data, cls=DjangoJSONEncoder, indent=2)
    
    @staticmethod
    def import_settings(settings_json, overwrite=False):
        """
        Import settings from JSON
        
        Args:
            settings_json: JSON string with settings data
            overwrite: Whether to overwrite existing settings
        
        Returns:
            dict: Import statistics
        """
        import json
        
        try:
            settings_data = json.loads(settings_json)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {e}")
        
        stats = {'created': 0, 'updated': 0, 'skipped': 0}
        
        for setting_data in settings_data:
            key = setting_data.get('key')
            value = setting_data.get('value')
            description = setting_data.get('description')
            
            if not key or value is None:
                stats['skipped'] += 1
                continue
            
            try:
                existing = SystemSetting.objects.get(key=key)
                if overwrite:
                    existing.value = value
                    existing.description = description
                    existing.save()
                    stats['updated'] += 1
                else:
                    stats['skipped'] += 1
            except SystemSetting.DoesNotExist:
                SystemSetting.objects.create(
                    key=key,
                    value=value,
                    description=description
                )
                stats['created'] += 1
        
        # Clear cache after import
        SettingsService.clear_cache()
        
        return stats


# Convenience functions for other apps
def get_setting(key, default=None, as_type=None):
    """
    Convenience function for getting settings
    
    Usage:
        from settingsapp.services import get_setting
        
        # Get as string
        timezone = get_setting('system_timezone', 'UTC')
        
        # Get as integer
        interval = get_setting('maintenance_interval_days', 30, 'int')
        
        # Get as boolean
        enabled = get_setting('email_notification_enabled', True, 'bool')
    """
    return SettingsService.get_setting(key, default, as_type)


def set_setting(key, value, description=None):
    """
    Convenience function for setting values
    """
    return SettingsService.set_setting(key, value, description)
