"""
Django admin configuration for allocation app
"""

from django.contrib import admin
from django.utils.html import format_html
from allocation.models import WorkforceAllocation, MaterialAllocation, AllocationSummary


@admin.register(WorkforceAllocation)
class WorkforceAllocationAdmin(admin.ModelAdmin):
    """Admin interface for WorkforceAllocation"""
    
    list_display = [
        'batch', 'user', 'role_assigned', 'start_date', 
        'end_date', 'duration_display', 'allocated_by', 'created_at'
    ]
    
    list_filter = [
        'role_assigned', 'allocated_by', 'created_at', 
        'start_date', 'end_date'
    ]
    
    search_fields = [
        'batch__batch_number', 'user__username', 
        'user__first_name', 'user__last_name'
    ]
    
    readonly_fields = ['id', 'created_at', 'updated_at', 'duration_display']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('batch', 'user', 'role_assigned')
        }),
        ('Timeline', {
            'fields': ('start_date', 'end_date', 'duration_display')
        }),
        ('Metadata', {
            'fields': ('allocated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def duration_display(self, obj):
        """Display duration in a formatted way"""
        if obj.duration_days:
            days = obj.duration_days
            if days == 1:
                return "1 day"
            elif days < 7:
                return f"{days} days"
            elif days < 30:
                weeks = days // 7
                remaining_days = days % 7
                if remaining_days == 0:
                    return f"{weeks} week{'s' if weeks > 1 else ''}"
                else:
                    return f"{weeks}w {remaining_days}d"
            else:
                return f"{days} days"
        return "No duration"
    
    duration_display.short_description = "Duration"


@admin.register(MaterialAllocation)
class MaterialAllocationAdmin(admin.ModelAdmin):
    """Admin interface for MaterialAllocation"""
    
    list_display = [
        'batch', 'material_name', 'quantity', 'unit', 
        'cost_display', 'supplier', 'allocated_by', 'created_at'
    ]
    
    list_filter = [
        'unit', 'allocated_by', 'created_at', 'supplier'
    ]
    
    search_fields = [
        'batch__batch_number', 'material_name', 'supplier'
    ]
    
    readonly_fields = ['id', 'created_at', 'updated_at', 'cost_display']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('batch', 'material_name', 'supplier')
        }),
        ('Quantity & Cost', {
            'fields': ('quantity', 'unit', 'cost_per_unit', 'cost_display')
        }),
        ('Metadata', {
            'fields': ('allocated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def cost_display(self, obj):
        """Display total cost with currency"""
        if obj.total_cost:
            return format_html(
                '<strong>{:,.0f} XOF</strong>',
                obj.total_cost
            )
        return "No cost data"
    
    cost_display.short_description = "Total Cost"


@admin.register(AllocationSummary)
class AllocationSummaryAdmin(admin.ModelAdmin):
    """Admin interface for AllocationSummary"""
    
    list_display = [
        'batch', 'total_workforce', 'material_count', 
        'cost_display', 'last_updated'
    ]
    
    list_filter = ['last_updated']
    
    search_fields = ['batch__batch_number']
    
    readonly_fields = [
        'id', 'batch', 'total_workforce', 'total_material_cost',
        'material_count', 'last_updated', 'cost_display'
    ]
    
    fieldsets = (
        ('Batch Summary', {
            'fields': ('batch', 'last_updated')
        }),
        ('Statistics', {
            'fields': ('total_workforce', 'material_count', 'total_material_cost', 'cost_display')
        }),
    )
    
    def cost_display(self, obj):
        """Display total cost with currency"""
        if obj.total_material_cost:
            return format_html(
                '<strong>{:,.0f} XOF</strong>',
                obj.total_material_cost
            )
        return "0 XOF"
    
    cost_display.short_description = "Total Material Cost"
    
    def has_add_permission(self, request):
        """Disable manual creation of summaries"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Disable manual deletion of summaries"""
        return False
