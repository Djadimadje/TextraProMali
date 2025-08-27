"""
BatchWorkflow views for TexPro AI
API views for batch workflow management
"""
import logging
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Q
from django.utils import timezone
from ..models import BatchWorkflow
from ..serializers import (
    BatchWorkflowSerializer,
    BatchWorkflowCreateSerializer,
    BatchWorkflowUpdateSerializer,
    BatchWorkflowDetailSerializer,
    BatchWorkflowListSerializer,
    BatchWorkflowStatsSerializer,
    BatchWorkflowBulkUpdateSerializer
)
from ..permissions import (
    CanManageBatch,
    CanCreateBatch,
    CanDeleteBatch,
    BatchWorkflowPermissions
)
from ..services import BatchWorkflowService

logger = logging.getLogger('texproai.workflow')


class BatchWorkflowPagination(PageNumberPagination):
    """Custom pagination for batch workflows"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class BatchWorkflowViewSet(viewsets.ModelViewSet):
    """
    ViewSet for batch workflow management
    
    Provides CRUD operations for batch workflows with role-based permissions:
    - Admin: Full access to all batches
    - Supervisor: Can create and manage their own batches, view all
    - Others: Read-only access to all batches
    """
    
    queryset = BatchWorkflow.objects.all()
    pagination_class = BatchWorkflowPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtering options
    filterset_fields = ['status', 'supervisor', 'start_date', 'end_date']
    search_fields = ['batch_code', 'description', 'supervisor__username']
    ordering_fields = ['created_at', 'updated_at', 'start_date', 'end_date', 'batch_code']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return BatchWorkflowListSerializer
        elif self.action == 'retrieve':
            return BatchWorkflowDetailSerializer
        elif self.action == 'create':
            return BatchWorkflowCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return BatchWorkflowUpdateSerializer
        elif self.action == 'bulk_update_status':
            return BatchWorkflowBulkUpdateSerializer
        return BatchWorkflowSerializer
    
    def get_permissions(self):
        """Return appropriate permissions based on action"""
        # Temporarily simplify permissions for debugging
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Filter queryset based on user permissions"""
        queryset = BatchWorkflow.objects.all()
        
        # Apply user-based filtering (currently all authenticated users can view all)
        if self.request.user.is_authenticated:
            queryset = BatchWorkflowPermissions.filter_batches_for_user(
                queryset, self.request.user
            )
        
        # Add prefetch for optimization
        queryset = queryset.select_related('supervisor').prefetch_related(
            'supervisor__profile'
        )
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """
        List batch workflows with filtering and pagination
        """
        try:
            # Run auto-update for delayed batches
            BatchWorkflowService.auto_update_delayed_batches()
            
            response = super().list(request, *args, **kwargs)
            
            # Add metadata to response
            response.data = {
                'success': True,
                'message': 'Batch workflows retrieved successfully',
                'data': response.data,
                'filters_applied': {
                    'status': request.query_params.get('status'),
                    'supervisor': request.query_params.get('supervisor'),
                    'search': request.query_params.get('search'),
                }
            }
            
            return response
            
        except Exception as e:
            logger.error(f"Failed to list batch workflows: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve batch workflows',
                'errors': [str(e)]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a specific batch workflow
        """
        try:
            response = super().retrieve(request, *args, **kwargs)
            
            response.data = {
                'success': True,
                'message': 'Batch workflow retrieved successfully',
                'data': response.data
            }
            
            return response
            
        except Exception as e:
            logger.error(f"Failed to retrieve batch workflow: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve batch workflow',
                'errors': [str(e)]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new batch workflow
        """
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            batch = serializer.save()
            
            logger.info(f"Created batch workflow {batch.batch_code} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Batch workflow created successfully',
                'data': BatchWorkflowDetailSerializer(batch, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to create batch workflow: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to create batch workflow',
                'errors': [str(e)]
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """
        Update a batch workflow
        """
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            
            batch = serializer.save()
            
            logger.info(f"Updated batch workflow {batch.batch_code} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Batch workflow updated successfully',
                'data': BatchWorkflowDetailSerializer(batch, context={'request': request}).data
            })
            
        except Exception as e:
            logger.error(f"Failed to update batch workflow: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to update batch workflow',
                'errors': [str(e)]
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a batch workflow (Admin only)
        """
        try:
            instance = self.get_object()
            batch_code = instance.batch_code
            
            instance.delete()
            
            logger.info(f"Deleted batch workflow {batch_code} by {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Batch workflow deleted successfully'
            }, status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            logger.error(f"Failed to delete batch workflow: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to delete batch workflow',
                'errors': [str(e)]
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, CanManageBatch])
    def start(self, request, pk=None):
        """
        Start a batch workflow
        """
        try:
            batch = self.get_object()
            start_date = request.data.get('start_date')
            
            updated_batch = BatchWorkflowService.start_batch_workflow(
                batch.id, start_date, request.user
            )
            
            return Response({
                'success': True,
                'message': 'Batch workflow started successfully',
                'data': BatchWorkflowDetailSerializer(updated_batch, context={'request': request}).data
            })
            
        except Exception as e:
            logger.error(f"Failed to start batch workflow: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to start batch workflow',
                'errors': [str(e)]
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, CanManageBatch])
    def complete(self, request, pk=None):
        """
        Complete a batch workflow
        """
        try:
            batch = self.get_object()
            completion_date = request.data.get('completion_date')
            
            updated_batch = BatchWorkflowService.complete_batch_workflow(
                batch.id, completion_date, request.user
            )
            
            return Response({
                'success': True,
                'message': 'Batch workflow completed successfully',
                'data': BatchWorkflowDetailSerializer(updated_batch, context={'request': request}).data
            })
            
        except Exception as e:
            logger.error(f"Failed to complete batch workflow: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to complete batch workflow',
                'errors': [str(e)]
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, CanManageBatch])
    def cancel(self, request, pk=None):
        """
        Cancel a batch workflow
        """
        try:
            batch = self.get_object()
            reason = request.data.get('reason')
            
            updated_batch = BatchWorkflowService.cancel_batch_workflow(
                batch.id, reason, request.user
            )
            
            return Response({
                'success': True,
                'message': 'Batch workflow cancelled successfully',
                'data': BatchWorkflowDetailSerializer(updated_batch, context={'request': request}).data
            })
            
        except Exception as e:
            logger.error(f"Failed to cancel batch workflow: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to cancel batch workflow',
                'errors': [str(e)]
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated, CanManageBatch])
    def bulk_update_status(self, request):
        """
        Bulk update status for multiple batch workflows
        """
        try:
            serializer = BatchWorkflowBulkUpdateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            result = BatchWorkflowService.bulk_update_batch_status(
                serializer.validated_data['batch_ids'],
                serializer.validated_data['status'],
                request.user
            )
            
            return Response({
                'success': True,
                'message': f'Bulk update completed: {result["success_count"]} successful, {result["failure_count"]} failed',
                'data': result
            })
            
        except Exception as e:
            logger.error(f"Failed to bulk update batch workflows: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to bulk update batch workflows',
                'errors': [str(e)]
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def my_batches(self, request):
        """
        Get batches assigned to the current user (if supervisor)
        """
        try:
            if request.user.role not in ['supervisor', 'admin']:
                return Response({
                    'success': False,
                    'message': 'Only supervisors and admins can view assigned batches'
                }, status=status.HTTP_403_FORBIDDEN)
            
            if request.user.role == 'supervisor':
                queryset = BatchWorkflow.get_by_supervisor(request.user)
            else:
                # Admin sees all batches
                queryset = self.get_queryset()
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = BatchWorkflowListSerializer(page, many=True, context={'request': request})
                return self.get_paginated_response({
                    'success': True,
                    'message': 'Assigned batches retrieved successfully',
                    'data': serializer.data
                })
            
            serializer = BatchWorkflowListSerializer(queryset, many=True, context={'request': request})
            return Response({
                'success': True,
                'message': 'Assigned batches retrieved successfully',
                'data': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Failed to retrieve assigned batches: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve assigned batches',
                'errors': [str(e)]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BatchWorkflowStatsView(viewsets.GenericViewSet):
    """
    ViewSet for batch workflow statistics
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """
        Get overview statistics for batch workflows
        """
        try:
            stats = BatchWorkflowService.get_batch_statistics()
            
            serializer = BatchWorkflowStatsSerializer(stats)
            
            return Response({
                'success': True,
                'message': 'Batch workflow statistics retrieved successfully',
                'data': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Failed to get batch workflow statistics: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve statistics',
                'errors': [str(e)]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Get dashboard data for current user (supervisor-specific)
        """
        try:
            if request.user.role == 'supervisor':
                dashboard_data = BatchWorkflowService.get_supervisor_dashboard(request.user)
            elif request.user.role == 'admin':
                # Admin gets overall statistics
                dashboard_data = BatchWorkflowService.get_batch_statistics()
            else:
                # Other roles get limited dashboard
                dashboard_data = {
                    'total_batches': BatchWorkflow.objects.count(),
                    'active_batches': BatchWorkflow.get_active_batches().count(),
                    'message': 'Limited dashboard for your role'
                }
            
            return Response({
                'success': True,
                'message': 'Dashboard data retrieved successfully',
                'data': dashboard_data
            })
            
        except Exception as e:
            logger.error(f"Failed to get dashboard data: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve dashboard data',
                'errors': [str(e)]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
