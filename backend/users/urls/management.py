"""
User Management URLs for TexPro AI
/api/v1/users/ endpoints (Admin only)
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views.user_management import UserViewSet, UserStatsView

app_name = 'management'

# Router for User ViewSet
router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    # User statistics (Admin only)
    path('stats/', UserStatsView.as_view(), name='user-stats'),
    
    # User CRUD operations (Admin only)
    path('', include(router.urls)),
]
