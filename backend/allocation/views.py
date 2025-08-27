"""
Allocation app views for TexPro AI
API endpoints for workforce and material allocation
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Sum, Q

from allocation.models import WorkforceAllocation, MaterialAllocation, AllocationSummary
from allocation.serializers import (
    WorkforceAllocationSerializer, WorkforceAllocationListSerializer,
    MaterialAllocationSerializer, MaterialAllocationListSerializer,
    AllocationSummarySerializer, AllocationReportSerializer
)
from allocation.permissions import AllocationPermission
from allocation.services import (
    get_batch_allocation_report, check_workforce_conflicts,
    update_allocation_summary
)


class WorkforceAllocationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for workforce allocation operations
    
    Endpoints:
    - POST /api/v1/allocation/workforce/ → Assign workforce (Supervisor/Admin only)
    - GET /api/v1/allocation/workforce/ → List all workforce allocations
    - GET /api/v1/allocation/workforce/{id}/ → Retrieve details
    - PUT /api/v1/allocation/workforce/{id}/ → Update allocation (Supervisor/Admin only)
    - DELETE /api/v1/allocation/workforce/{id}/ → Delete allocation (Admin only)
    """
    
    queryset = WorkforceAllocation.objects.select_related('batch', 'user', 'allocated_by').all()
    permission_classes = [AllocationPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    # Filtering options
    filterset_fields = [
        'batch', 'user', 'role_assigned', 'allocated_by',
        'start_date', 'end_date'
    ]
    
    # Search options
    search_fields = [
        'batch__batch_number', 'user__username', 'role_assigned',
        'user__first_name', 'user__last_name'
    ]
    
    # Ordering options
    ordering_fields = ['created_at', 'start_date', 'end_date', 'role_assigned']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return WorkforceAllocationListSerializer
        return WorkforceAllocationSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by batch
        batch_id = self.request.query_params.get('batch')
        if batch_id:
            queryset = queryset.filter(batch_id=batch_id)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(
                Q(start_date__gte=date_from) | Q(start_date__isnull=True)
            )
        if date_to:
            queryset = queryset.filter(
                Q(end_date__lte=date_to) | Q(end_date__isnull=True)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        """Set allocated_by to current user"""
        serializer.save(allocated_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def check_conflicts(self, request, pk=None):
        """Check for workforce allocation conflicts"""
        allocation = self.get_object()
        
        conflicts = check_workforce_conflicts(
            allocation.user,
            allocation.batch,
            allocation.start_date,
            allocation.end_date,
            exclude_id=allocation.id
        )
        
        return Response(conflicts)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get workforce allocation statistics"""
        queryset = self.get_queryset()
        
        # Basic statistics
        total_allocations = queryset.count()
        unique_workers = queryset.values('user').distinct().count()
        unique_batches = queryset.values('batch').distinct().count()
        
        # Role breakdown
        role_counts = queryset.values('role_assigned').annotate(count=Count('id'))
        
        # Duration statistics
        allocations_with_duration = queryset.exclude(
            Q(start_date__isnull=True) | Q(end_date__isnull=True)
        )
        
        avg_duration = 0
        if allocations_with_duration.exists():
            durations = [a.duration_days for a in allocations_with_duration if a.duration_days]
            if durations:
                avg_duration = sum(durations) / len(durations)
        
        return Response({
            'total_allocations': total_allocations,
            'unique_workers': unique_workers,
            'unique_batches': unique_batches,
            'average_duration_days': round(avg_duration, 1),
            'role_breakdown': list(role_counts),
            'allocations_with_dates': allocations_with_duration.count()
        })


class MaterialAllocationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for material allocation operations
    
    Endpoints:
    - POST /api/v1/allocation/materials/ → Allocate material (Supervisor/Admin only)
    - GET /api/v1/allocation/materials/ → List all material allocations
    - GET /api/v1/allocation/materials/{id}/ → Retrieve details
    - PUT /api/v1/allocation/materials/{id}/ → Update allocation (Supervisor/Admin only)
    - DELETE /api/v1/allocation/materials/{id}/ → Delete allocation (Admin only)
    """
    
    queryset = MaterialAllocation.objects.select_related('batch', 'allocated_by').all()
    permission_classes = [AllocationPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    # Filtering options
    filterset_fields = [
        'batch', 'material_name', 'unit', 'allocated_by', 'supplier'
    ]
    
    # Search options
    search_fields = [
        'batch__batch_number', 'material_name', 'supplier'
    ]
    
    # Ordering options
    ordering_fields = ['created_at', 'material_name', 'quantity', 'cost_per_unit']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return MaterialAllocationListSerializer
        return MaterialAllocationSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by batch
        batch_id = self.request.query_params.get('batch')
        if batch_id:
            queryset = queryset.filter(batch_id=batch_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """Set allocated_by to current user and update summary"""
        allocation = serializer.save(allocated_by=self.request.user)
        update_allocation_summary(allocation.batch)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get material allocation statistics"""
        queryset = self.get_queryset()
        
        # Basic statistics
        total_allocations = queryset.count()
        unique_materials = queryset.values('material_name').distinct().count()
        unique_batches = queryset.values('batch').distinct().count()
        
        # Material breakdown
        material_counts = queryset.values('material_name').annotate(
            count=Count('id'),
            total_quantity=Sum('quantity')
        )
        
        return Response({
            'total_allocations': total_allocations,
            'unique_materials': unique_materials,
            'unique_batches': unique_batches,
            'material_breakdown': list(material_counts)
        })


class AllocationReportViewSet(viewsets.GenericViewSet):
    """ViewSet for allocation reports and analytics"""
    
    permission_classes = [AllocationPermission]
    
    @action(detail=False, methods=['post'])
    def batch_report(self, request):
        """Generate comprehensive allocation report for a batch"""
        serializer = AllocationReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        batch_id = serializer.validated_data['batch_id']
        
        try:
            from workflow.models import BatchWorkflow
            batch = BatchWorkflow.objects.get(id=batch_id)
            
            report = get_batch_allocation_report(batch)
            return Response(report)
            
        except BatchWorkflow.DoesNotExist:
            return Response(
                {'error': 'Batch not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Report generation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
