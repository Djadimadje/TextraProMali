"""
Workflow app URLs for TexPro AI
URL routing for batch workflow management
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BatchWorkflowViewSet, BatchWorkflowStatsView

# Create router and register viewsets
router = DefaultRouter()
router.register(r'batches', BatchWorkflowViewSet, basename='batch')
router.register(r'stats', BatchWorkflowStatsView, basename='stats')

app_name = 'workflow'

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Custom endpoints can be added here if needed
    # path('custom-endpoint/', views.custom_view, name='custom-endpoint'),
]

# URL patterns will be:
# /api/v1/workflow/batches/ - List/Create batches
# /api/v1/workflow/batches/{id}/ - Retrieve/Update/Delete specific batch
# /api/v1/workflow/batches/{id}/start/ - Start batch workflow
# /api/v1/workflow/batches/{id}/complete/ - Complete batch workflow  
# /api/v1/workflow/batches/{id}/cancel/ - Cancel batch workflow
# /api/v1/workflow/batches/bulk_update_status/ - Bulk status update
# /api/v1/workflow/batches/my_batches/ - Get user's assigned batches
# /api/v1/workflow/stats/overview/ - Get workflow statistics
# /api/v1/workflow/stats/dashboard/ - Get dashboard data
