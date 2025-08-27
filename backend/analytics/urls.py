"""
Analytics app URLs - Performance analytics and KPIs
TexPro AI - Textile Manufacturing Optimization System
"""

from django.urls import path
from analytics.views import (
    ProductionAnalyticsView,
    MachineAnalyticsView,
    MaintenanceAnalyticsView,
    QualityAnalyticsView,
    AllocationAnalyticsView,
    FinancialAnalyticsView,
    DashboardSummaryView,
    AnalyticsHealthView,
    # Export views
    ProductionExportView,
    MachineExportView,
    QualityExportView,
    MaintenanceExportView,
    AllocationExportView,
    # Function-based view alternatives
    production_analytics_fbv,
    machine_analytics_fbv
)

# URL patterns for analytics endpoints
# Note: These will be prefixed with /api/v1/analytics/ from core/urls.py
urlpatterns = [
    # Main analytics endpoints (Class-based views)
    path('production/', ProductionAnalyticsView.as_view(), name='production-analytics'),
    path('machines/', MachineAnalyticsView.as_view(), name='machine-analytics'),
    path('maintenance/', MaintenanceAnalyticsView.as_view(), name='maintenance-analytics'),
    path('quality/', QualityAnalyticsView.as_view(), name='quality-analytics'),
    path('allocation/', AllocationAnalyticsView.as_view(), name='allocation-analytics'),
    path('financial/', FinancialAnalyticsView.as_view(), name='financial-analytics'),
    
    # Dashboard and summary endpoints
    path('dashboard/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('dashboard-stats/', DashboardSummaryView.as_view(), name='dashboard-stats'),  # Frontend compatibility
    path('kpis/', DashboardSummaryView.as_view(), name='system-kpis'),  # Frontend compatibility
    path('activities/', DashboardSummaryView.as_view(), name='recent-activities'),  # Frontend compatibility
    path('health/', AnalyticsHealthView.as_view(), name='analytics-health'),
    
    # Export endpoints
    path('production/export/', ProductionExportView.as_view(), name='production-export'),
    path('machines/export/', MachineExportView.as_view(), name='machine-export'),
    path('maintenance/export/', MaintenanceExportView.as_view(), name='maintenance-export'),
    path('quality/export/', QualityExportView.as_view(), name='quality-export'),
    path('allocation/export/', AllocationExportView.as_view(), name='allocation-export'),
    
    # Alternative function-based endpoints (optional)
    path('production/fbv/', production_analytics_fbv, name='production-analytics-fbv'),
    path('machines/fbv/', machine_analytics_fbv, name='machine-analytics-fbv'),
]
