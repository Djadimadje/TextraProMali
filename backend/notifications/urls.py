"""
Notification URLs for TexPro AI
API endpoints for notification management
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    NotificationViewSet,
    NotificationPreferenceViewSet,
    NotificationFilterView,
    SystemNotificationView,
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'preferences', NotificationPreferenceViewSet, basename='notification-preference')

# Define URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Additional views
    path('filter/', NotificationFilterView.as_view(), name='notification-filter'),
    path('system/', SystemNotificationView.as_view(), name='system-notification'),
]

app_name = 'notifications'
