"""
Users app URL configuration
TexPro AI - Textile Manufacturing Optimization System
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'users'

# DRF Router for ViewSets
router = DefaultRouter()
router.register(r'manage', views.UserViewSet, basename='user-manage')

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/refresh/', views.RefreshTokenView.as_view(), name='token-refresh'),
    path('auth/me/', views.MeView.as_view(), name='me'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('auth/forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),
    path('auth/validate-reset-token/', views.validate_reset_token, name='validate-reset-token'),
    
    # User management endpoints (admin only)
    path('stats/', views.UserStatsView.as_view(), name='user-stats'),
    
    # Include router URLs
    path('', include(router.urls)),
]
