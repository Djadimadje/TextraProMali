"""
Settings URLs for TexPro AI
API endpoints for system configuration management
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    SystemSettingViewSet,
    SettingsExportView,
    SettingsImportView,
    SettingsCacheView,
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'settings', SystemSettingViewSet, basename='system-setting')

# Define URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Additional views
    path('export/', SettingsExportView.as_view(), name='settings-export'),
    path('import/', SettingsImportView.as_view(), name='settings-import'),
    path('cache/', SettingsCacheView.as_view(), name='settings-cache'),
]

app_name = 'settingsapp'
