"""
Health check views for TexPro AI system monitoring
"""
import os
from django.http import JsonResponse
from django.db import connection
from django.conf import settings
from datetime import datetime


def health_check(request):
    """
    Basic health check endpoint
    Returns: 200 OK if system is running
    """
    return JsonResponse({
        'status': 'healthy',
        'service': 'TexPro AI Backend',
        'version': settings.TEXPROAI_SETTINGS['VERSION'],
        'timestamp': datetime.now().isoformat(),
    })


def detailed_health_check(request):
    """
    Detailed health check with database and file system status
    """
    health_data = {
        'status': 'healthy',
        'service': 'TexPro AI Backend',
        'version': settings.TEXPROAI_SETTINGS['VERSION'],
        'timestamp': datetime.now().isoformat(),
        'checks': {}
    }
    
    # Database connectivity check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_data['checks']['database'] = 'healthy'
    except Exception as e:
        health_data['checks']['database'] = f'unhealthy: {str(e)}'
        health_data['status'] = 'unhealthy'
    
    # Media directory check
    try:
        media_path = settings.MEDIA_ROOT
        if os.path.exists(media_path) and os.access(media_path, os.W_OK):
            health_data['checks']['media_storage'] = 'healthy'
        else:
            health_data['checks']['media_storage'] = 'unhealthy: media directory not accessible'
            health_data['status'] = 'degraded'
    except Exception as e:
        health_data['checks']['media_storage'] = f'unhealthy: {str(e)}'
        health_data['status'] = 'unhealthy'
    
    # Logs directory check
    try:
        logs_path = settings.BASE_DIR / 'logs'
        if os.path.exists(logs_path) and os.access(logs_path, os.W_OK):
            health_data['checks']['logging'] = 'healthy'
        else:
            health_data['checks']['logging'] = 'unhealthy: logs directory not accessible'
            health_data['status'] = 'degraded'
    except Exception as e:
        health_data['checks']['logging'] = f'unhealthy: {str(e)}'
        health_data['status'] = 'unhealthy'
    
    status_code = 200 if health_data['status'] == 'healthy' else 503
    return JsonResponse(health_data, status=status_code)
