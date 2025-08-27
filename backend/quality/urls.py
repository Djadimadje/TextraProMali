"""
Quality app URLs for TexPro AI
API endpoints for quality control operations
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from quality.views import (
    QualityCheckViewSet,
    QualityStandardViewSet, 
    QualityMetricsViewSet,
    QualityReportView,
)

app_name = 'quality'

# Create router for ViewSets
router = DefaultRouter()
router.register(r'checks', QualityCheckViewSet, basename='quality-checks')
router.register(r'standards', QualityStandardViewSet, basename='quality-standards')
router.register(r'metrics', QualityMetricsViewSet, basename='quality-metrics')
router.register(r'reports', QualityReportView, basename='quality-reports')

urlpatterns = [
    # Include all router URLs
    path('', include(router.urls)),
]
