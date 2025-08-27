"""
URL configuration for machines app
Textile manufacturing equipment monitoring and management
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from machines.views import (
    MachineViewSet,
    MachineTypeViewSet,
    MachineMaintenanceView,
    MachineStatusUpdateView,
    MachineOperatingHoursView,
    MachineStatsView,
    MachineAnalyticsView,
    MaintenanceAnalyticsView,
    EfficiencyAnalyticsView,
    UtilizationAnalyticsView
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'machines', MachineViewSet, basename='machine')
router.register(r'machine-types', MachineTypeViewSet, basename='machinetype')

# URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Additional machine management endpoints
    path('maintenance/', MachineMaintenanceView.as_view(), name='machine-maintenance'),
    path('status-update/', MachineStatusUpdateView.as_view(), name='machine-status-update'),
    path('operating-hours/', MachineOperatingHoursView.as_view(), name='machine-operating-hours'),
    
    # Analytics and statistics endpoints
    path('stats/', MachineStatsView.as_view(), name='machine-stats'),
    path('analytics/', MachineAnalyticsView.as_view(), name='machine-analytics'),
    path('analytics/maintenance/', MaintenanceAnalyticsView.as_view(), name='maintenance-analytics'),
    path('analytics/efficiency/', EfficiencyAnalyticsView.as_view(), name='efficiency-analytics'),
    path('analytics/utilization/', UtilizationAnalyticsView.as_view(), name='utilization-analytics'),
]

# Add app name for reverse URL lookups
app_name = 'machines'
