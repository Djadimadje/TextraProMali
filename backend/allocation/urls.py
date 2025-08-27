"""
Allocation app URLs - Resource allocation management
TexPro AI - Textile Manufacturing Optimization System
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from allocation.views import (
    WorkforceAllocationViewSet,
    MaterialAllocationViewSet,
    AllocationReportViewSet
)

# DRF Router for API endpoints
router = DefaultRouter()
router.register(r'workforce', WorkforceAllocationViewSet, basename='workforce-allocation')
router.register(r'materials', MaterialAllocationViewSet, basename='material-allocation')
router.register(r'reports', AllocationReportViewSet, basename='allocation-reports')

urlpatterns = [
    path('api/v1/allocation/', include(router.urls)),
]
