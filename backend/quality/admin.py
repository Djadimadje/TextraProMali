"""
Quality app admin configuration for TexPro AI
Admin interface for quality control management
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from quality.models import QualityCheck, QualityStandard, QualityMetrics


@admin.register(QualityCheck)
class QualityCheckAdmin(admin.ModelAdmin):
    """Admin interface for QualityCheck model"""
    
    list_display = [
        'id', 'batch_link', 'inspector_link', 'defect_status',
        'severity_display', 'status_display', 'image_preview', 'created_at'
    ]
    
    list_filter = [
        'defect_detected', 'severity', 'status', 'defect_type',
        'ai_analysis_requested', 'created_at', 'inspector'
    ]
    
    search_fields = [
        'batch__batch_code', 'inspector__username', 'comments',
        'defect_type', 'batch__product_type'
    ]
    
    readonly_fields = [
        'id', 'ai_analysis_result', 'ai_confidence_score', 
        'created_at', 'updated_at', 'image_preview_large'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'batch', 'inspector', 'created_at', 'updated_at')
        }),
        ('Quality Assessment', {
            'fields': ('image', 'image_preview_large', 'defect_detected', 'defect_type', 'severity', 'comments')
        }),
        ('Status & Approval', {
            'fields': ('status',)
        }),
        ('AI Analysis', {
            'fields': ('ai_analysis_requested', 'ai_analysis_result', 'ai_confidence_score'),
            'classes': ('collapse',)
        }),
    )
    
    def batch_link(self, obj):
        """Link to batch admin page"""
        url = reverse('admin:workflow_batchworkflow_change', args=[obj.batch.id])
        return format_html('<a href="{}">{}</a>', url, obj.batch.batch_code)
    batch_link.short_description = 'Batch'
    
    def inspector_link(self, obj):
        """Link to inspector admin page"""
        url = reverse('admin:users_user_change', args=[obj.inspector.id])
        return format_html('<a href="{}">{}</a>', url, obj.inspector.username)
    inspector_link.short_description = 'Inspector'
    
    def defect_status(self, obj):
        """Display defect status with emoji"""
        if obj.defect_detected:
            return format_html('<span style="color: red;">🔍 Defect Found</span>')
        return format_html('<span style="color: green;">✨ Clean</span>')
    defect_status.short_description = 'Defect Status'
    
    def severity_display(self, obj):
        """Display severity with colored indicator"""
        if not obj.defect_detected:
            return '-'
        
        colors = {
            'low': '#28a745',
            'medium': '#ffc107', 
            'high': '#dc3545'
        }
        color = colors.get(obj.severity, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_severity_display()
        )
    severity_display.short_description = 'Severity'
    
    def status_display(self, obj):
        """Display status with colored indicator"""
        colors = {
            'pending': '#ffc107',
            'approved': '#28a745',
            'rejected': '#dc3545'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_display.short_description = 'Status'
    
    def image_preview(self, obj):
        """Small image preview for list view"""
        if obj.image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return 'No Image'
    image_preview.short_description = 'Preview'
    
    def image_preview_large(self, obj):
        """Large image preview for detail view"""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 300px; border-radius: 8px;" />',
                obj.image.url
            )
        return 'No Image'
    image_preview_large.short_description = 'Image Preview'


@admin.register(QualityStandard)
class QualityStandardAdmin(admin.ModelAdmin):
    """Admin interface for QualityStandard model"""
    
    list_display = [
        'product_type', 'max_defects_per_batch', 'critical_defect_tolerance',
        'quality_threshold', 'thread_count_range', 'created_at'
    ]
    
    list_filter = ['product_type', 'created_at']
    
    search_fields = ['product_type']
    
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Product Information', {
            'fields': ('id', 'product_type', 'created_at', 'updated_at')
        }),
        ('Quality Thresholds', {
            'fields': ('max_defects_per_batch', 'critical_defect_tolerance', 'quality_threshold')
        }),
        ('Technical Specifications', {
            'fields': ('thread_count_min', 'thread_count_max', 'weight_tolerance', 'color_fastness_grade')
        }),
    )
    
    def thread_count_range(self, obj):
        """Display thread count range"""
        if obj.thread_count_min and obj.thread_count_max:
            return f"{obj.thread_count_min} - {obj.thread_count_max}"
        elif obj.thread_count_min:
            return f"≥ {obj.thread_count_min}"
        elif obj.thread_count_max:
            return f"≤ {obj.thread_count_max}"
        return 'Not specified'
    thread_count_range.short_description = 'Thread Count Range'


@admin.register(QualityMetrics)
class QualityMetricsAdmin(admin.ModelAdmin):
    """Admin interface for QualityMetrics model"""
    
    list_display = [
        'date', 'total_checks', 'defects_found', 'defect_rate_display',
        'approval_rate_display', 'quality_score_display', 'created_at'
    ]
    
    list_filter = ['date', 'created_at']
    
    search_fields = ['date']
    
    readonly_fields = ['id', 'created_at']
    
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Date Information', {
            'fields': ('id', 'date', 'created_at')
        }),
        ('Daily Statistics', {
            'fields': ('total_checks', 'defects_found', 'batches_approved', 'batches_rejected')
        }),
        ('Quality Metrics', {
            'fields': ('overall_quality_score', 'defect_rate', 'approval_rate', 'ai_accuracy')
        }),
    )
    
    def defect_rate_display(self, obj):
        """Display defect rate with percentage"""
        return f"{obj.defect_rate:.1f}%"
    defect_rate_display.short_description = 'Defect Rate'
    
    def approval_rate_display(self, obj):
        """Display approval rate with percentage"""
        return f"{obj.approval_rate:.1f}%"
    approval_rate_display.short_description = 'Approval Rate'
    
    def quality_score_display(self, obj):
        """Display quality score with color coding"""
        score = obj.overall_quality_score
        if score >= 0.95:
            color = '#28a745'  # Green
        elif score >= 0.85:
            color = '#ffc107'  # Yellow
        else:
            color = '#dc3545'  # Red
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.3f}</span>',
            color, score
        )
    quality_score_display.short_description = 'Quality Score'


# Customize admin site headers
admin.site.site_header = "TexPro AI - Quality Control Admin"
admin.site.site_title = "TexPro AI Quality Admin"
admin.site.index_title = "Quality Control Management"
