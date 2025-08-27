"""
Authentication URLs for TexPro AI
/api/v1/auth/ endpoints
"""
from django.urls import path
from ..views.auth import (
    LoginView,
    LogoutView,
    RefreshTokenView,
    MeView,
    ChangePasswordView,
    ForgotPasswordView,
    ResetPasswordView,
    validate_reset_token,
)

app_name = 'auth'

urlpatterns = [
    # Authentication endpoints
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshTokenView.as_view(), name='token-refresh'),
    path('me/', MeView.as_view(), name='me'),
    
    # Password management
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('validate-reset-token/', validate_reset_token, name='validate-reset-token'),
]
