"""
Admin configuration for machines app
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

from machines.models import Machine, MachineType


@admin.register(MachineType)
class MachineTypeAdmin(admin.ModelAdmin):
    """
    Admin interface for MachineType model
    """
    list_display = [
        'name', 'manufacturer', 'typical_power_consumption',
        'typical_production_rate', 'production_unit',
        'recommended_maintenance_interval_hours', 'machines_count'
    ]
    list_filter = [
        'manufacturer',
        'typical_power_consumption',
        'recommended_maintenance_interval_hours'
    ]
    search_fields = ['name', 'description', 'manufacturer']
    ordering = ['name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'manufacturer')
        }),
        ('Performance Specifications', {
            'fields': (
                'typical_power_consumption',
                'typical_production_rate',
                'production_unit'
            )
        }),
        ('Maintenance', {
            'fields': (
                'recommended_maintenance_interval_hours',
                'recommended_maintenance_interval_days'
            )
        }),
    )
    
    def machines_count(self, obj):
        """Display count of machines of this type"""
        count = obj.machines.count()
        if count > 0:
            url = reverse('admin:machines_machine_changelist')
            return format_html(
                '<a href="{}?machine_type__id__exact={}">{} machines</a>',
                url, obj.id, count
            )
        return '0 machines'
    machines_count.short_description = 'Machines'


@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    """
    Admin interface for Machine model
    """
    list_display = [
        'machine_id', 'name', 'machine_type', 'operational_status',
        'site_code', 'building', 'maintenance_status_display',
        'total_operating_hours', 'is_operational'
    ]
    list_filter = [
        'operational_status',
        'machine_type',
        'site_code',
        'building',
        'status',
        'installation_date',
        'last_maintenance_date'
    ]
    search_fields = [
        'machine_id', 'name', 'machine_type__name',
        'manufacturer', 'model_number', 'serial_number',
        'site_code', 'building', 'location_details'
    ]
    ordering = ['machine_id']
    date_hierarchy = 'installation_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'machine_id', 'name', 'machine_type',
                'status'
            )
        }),
        ('Physical Details', {
            'fields': (
                'manufacturer', 'model_number', 'serial_number',
                'installation_date'
            )
        }),
        ('Location', {
            'fields': (
                'site_code', 'building', 'floor',
                'location_details'
            )
        }),
        ('Operational Status', {
            'fields': (
                'operational_status', 'primary_operator'
            )
        }),
        ('Performance Metrics', {
            'fields': (
                'total_operating_hours', 'hours_since_maintenance',
                'rated_power', 'rated_capacity', 'capacity_unit'
            )
        }),
        ('Maintenance', {
            'fields': (
                'last_maintenance_date', 'next_maintenance_date'
            )
        }),
        ('Additional Information', {
            'fields': (
                'notes', 'warranty_expiry', 'purchase_cost'
            ),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = [
        'created_at', 'updated_at', 'created_by', 'updated_by'
    ]
    
    def maintenance_status_display(self, obj):
        """Display maintenance status with color coding"""
        urgency = obj.maintenance_urgency
        
        if urgency == 'critical':
            color = 'red'
            icon = '🔴'
        elif urgency == 'urgent':
            color = 'orange'
            icon = '🟠'
        elif urgency == 'due_soon':
            color = 'yellow'
            icon = '🟡'
        else:
            color = 'green'
            icon = '🟢'
        
        return format_html(
            '<span style="color: {};">{} {}</span>',
            color, icon, obj.maintenance_status_description()
        )
    maintenance_status_display.short_description = 'Maintenance Status'
    
    def is_operational(self, obj):
        """Display operational status with icon"""
        if obj.is_operational:
            return format_html('✅ Yes')
        else:
            return format_html('❌ No')
    is_operational.short_description = 'Operational'
    is_operational.boolean = True
    
    actions = [
        'mark_for_maintenance',
        'mark_operational',
        'mark_offline',
        'reset_maintenance_hours'
    ]
    
    def mark_for_maintenance(self, request, queryset):
        """Mark selected machines for maintenance"""
        updated = 0
        for machine in queryset:
            if machine.mark_for_maintenance():
                updated += 1
        
        self.message_user(
            request,
            f'{updated} machines marked for maintenance.'
        )
    mark_for_maintenance.short_description = 'Mark selected machines for maintenance'
    
    def mark_operational(self, request, queryset):
        """Mark selected machines as operational"""
        updated = queryset.update(operational_status='idle')
        self.message_user(
            request,
            f'{updated} machines marked as operational.'
        )
    mark_operational.short_description = 'Mark selected machines as operational'
    
    def mark_offline(self, request, queryset):
        """Mark selected machines as offline"""
        updated = queryset.update(operational_status='offline')
        self.message_user(
            request,
            f'{updated} machines marked as offline.'
        )
    mark_offline.short_description = 'Mark selected machines as offline'
    
    def reset_maintenance_hours(self, request, queryset):
        """Reset maintenance hours for selected machines"""
        updated = 0
        for machine in queryset:
            machine.reset_maintenance_hours()
            updated += 1
        
        self.message_user(
            request,
            f'Reset maintenance hours for {updated} machines.'
        )
    reset_maintenance_hours.short_description = 'Reset maintenance hours for selected machines'
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related(
            'machine_type', 'primary_operator'
        )
