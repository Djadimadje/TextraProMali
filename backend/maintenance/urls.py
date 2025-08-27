"""
Maintenance URL Configuration
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from maintenance.views import (
    MaintenanceLogViewSet,
    MaintenanceStatsView,
    BulkMaintenanceStatusUpdateView,
    PredictiveMaintenanceView
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'logs', MaintenanceLogViewSet, basename='maintenance-logs')

app_name = 'maintenance'

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Additional maintenance endpoints
    path('stats/', MaintenanceStatsView.as_view(), name='maintenance-stats'),
    path('bulk-update/', BulkMaintenanceStatusUpdateView.as_view(), name='bulk-status-update'),
    path('predictions/', PredictiveMaintenanceView.as_view(), name='predictive-maintenance'),
    path('predictions/machine/<int:machine_id>/', 
         PredictiveMaintenanceView.as_view(), 
         name='machine-prediction'),
]
