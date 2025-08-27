"""
Settings admin configuration for TexPro AI
Django admin interface for system configuration management
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

from .models import SystemSetting


@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    """
    Admin interface for SystemSetting model
    """
    
    list_display = [
        'key',
        'value_preview',
        'category',
        'description_preview',
        'updated_at',
    ]
    
    list_filter = [
        'created_at',
        'updated_at',
    ]
    
    search_fields = [
        'key',
        'value',
        'description',
    ]
    
    readonly_fields = [
        'id',
        'created_at',
        'updated_at',
        'category',
    ]
    
    fieldsets = (
        ('Setting Details', {
            'fields': (
                'id',
                'key',
                'value',
                'description',
            )
        }),
        ('Metadata', {
            'fields': (
                'category',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['key']
    date_hierarchy = 'updated_at'
    
    def value_preview(self, obj):
        """
        Display truncated value with formatting
        """
        if len(obj.value) > 50:
            preview = f"{obj.value[:50]}..."
        else:
            preview = obj.value
        
        # Format different value types
        if obj.value.lower() in ('true', 'false'):
            color = '#28a745' if obj.value.lower() == 'true' else '#dc3545'
            return format_html(
                '<span style="color: {}; font-weight: bold;">{}</span>',
                color,
                preview
            )
        elif obj.value.isdigit():
            return format_html(
                '<span style="color: #007bff; font-weight: bold;">{}</span>',
                preview
            )
        else:
            return preview
    
    value_preview.short_description = 'Value'
    
    def description_preview(self, obj):
        """
        Display truncated description
        """
        if obj.description:
            if len(obj.description) > 60:
                return f"{obj.description[:60]}..."
            return obj.description
        return '-'
    
    description_preview.short_description = 'Description'
    
    def category(self, obj):
        """
        Display setting category based on key prefix
        """
        if '_' in obj.key:
            category = obj.key.split('_')[0]
            return category.title()
        return 'General'
    
    category.short_description = 'Category'
    
    def get_queryset(self, request):
        """
        Optimize queryset
        """
        return super().get_queryset(request)
    
    actions = ['reset_to_default', 'export_settings']
    
    def reset_to_default(self, request, queryset):
        """
        Admin action to reset settings to default values
        """
        defaults = SystemSetting.get_default_settings()
        reset_count = 0
        
        for setting in queryset:
            if setting.key in defaults:
                default_config = defaults[setting.key]
                setting.value = default_config['value']
                setting.description = default_config['description']
                setting.save()
                reset_count += 1
        
        self.message_user(
            request,
            f'{reset_count} settings reset to default values.'
        )
    
    reset_to_default.short_description = 'Reset selected settings to default values'
    
    def export_settings(self, request, queryset):
        """
        Admin action to export selected settings
        """
        from django.http import JsonResponse
        import json
        
        settings_data = []
        for setting in queryset:
            settings_data.append({
                'key': setting.key,
                'value': setting.value,
                'description': setting.description,
            })
        
        response = JsonResponse(settings_data, safe=False)
        response['Content-Disposition'] = 'attachment; filename="settings_export.json"'
        return response
    
    export_settings.short_description = 'Export selected settings as JSON'
    
    def has_add_permission(self, request):
        """
        Only admin users can add settings
        """
        return request.user.is_superuser or (
            hasattr(request.user, 'role') and request.user.role == 'admin'
        )
    
    def has_change_permission(self, request, obj=None):
        """
        Only admin users can change settings
        """
        return request.user.is_superuser or (
            hasattr(request.user, 'role') and request.user.role == 'admin'
        )
    
    def has_delete_permission(self, request, obj=None):
        """
        Only admin users can delete settings
        """
        return request.user.is_superuser or (
            hasattr(request.user, 'role') and request.user.role == 'admin'
        )
    
    def save_model(self, request, obj, form, change):
        """
        Custom save to clear cache when settings are modified
        """
        super().save_model(request, obj, form, change)
        
        # Clear cache when settings are modified via admin
        from .services import SettingsService
        SettingsService.clear_cache()
