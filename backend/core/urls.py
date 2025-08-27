"""
URL configuration for TexPro AI - Textile Manufacturing Optimization System
CMDT (Compagnie Malienne pour le Développement des Textiles)

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

# API Version 1 URLs
api_v1_urlpatterns = [
    path('auth/', include('users.urls.auth')),
    path('users/', include('users.urls.management')),
    path('workflow/', include('workflow.urls')),
    path('machines/', include('machines.urls')),
    path('maintenance/', include('maintenance.urls')),
    path('quality/', include('quality.urls')),
    path('allocation/', include('allocation.urls')),
    path('analytics/', include('analytics.urls')),
    path('reports/', include('reports.urls')),
    path('notifications/', include('notifications.urls')),
    path('settings/', include('settingsapp.urls')),
]

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # API versioning
    path('api/v1/', include((api_v1_urlpatterns, 'v1'), namespace='v1')),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Health check endpoint
    path('health/', include('core.health_urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
