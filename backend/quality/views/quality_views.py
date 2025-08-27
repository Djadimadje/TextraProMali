"""
Quality app views for TexPro AI
API endpoints for quality control operations
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta

from quality.models import QualityCheck, QualityStandard, QualityMetrics
from quality.serializers import (
    QualityCheckSerializer, QualityCheckListSerializer,
    QualityStandardSerializer, QualityMetricsSerializer,
    QualityDashboardSerializer, QualityReportSerializer
)
from quality.permissions import (
    QualityPermission, InspectorOnlyPermission, QualityReportAccess
)
from quality.services import generate_quality_report, calculate_batch_quality_score


class QualityCheckViewSet(viewsets.ModelViewSet):
    """
    ViewSet for quality control operations
    
    Endpoints:
    - POST /api/v1/quality/ → Upload new quality check (Inspector/Admin only)
    - GET /api/v1/quality/ → List all quality checks (All roles can view)
    - GET /api/v1/quality/{id}/ → Retrieve details (All roles can view)
    - PUT /api/v1/quality/{id}/ → Update status/defect info (Inspector/Admin only)
    - DELETE /api/v1/quality/{id}/ → Delete check (Admin only)
    """
    
    queryset = QualityCheck.objects.select_related('batch', 'inspector').all()
    permission_classes = [QualityPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    # Filtering options
    filterset_fields = [
        'batch', 'inspector', 'defect_detected', 'defect_type', 
        'severity', 'status', 'ai_analysis_requested'
    ]
    
    # Search options
    search_fields = [
        'batch__batch_code', 'inspector__username', 'comments',
        'defect_type', 'batch__product_type'
    ]
    
    # Ordering options
    ordering_fields = ['created_at', 'updated_at', 'severity', 'status']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return QualityCheckListSerializer
        return QualityCheckSerializer
    
    def perform_create(self, serializer):
        """Set inspector to current user"""
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Creating quality check with user: {self.request.user}, role: {getattr(self.request.user, 'role', 'No role')}")
        try:
            serializer.save(inspector=self.request.user)
            logger.info("Quality check created successfully")
        except Exception as e:
            logger.error(f"Error creating quality check: {e}")
            raise
    
    def get_queryset(self):
        """Filter queryset based on user role and permissions"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Inspectors can see all checks, but can only modify their own
        # This is handled in permissions, so return full queryset
        
        # Add any additional filtering based on query parameters
        batch_id = self.request.query_params.get('batch')
        if batch_id:
            queryset = queryset.filter(batch_id=batch_id)
        
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[InspectorOnlyPermission])
    def reanalyze(self, request, pk=None):
        """Trigger AI re-analysis for a quality check"""
        quality_check = self.get_object()
        
        if not quality_check.image:
            return Response(
                {'error': 'No image available for analysis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from quality.services import analyze_quality_image
            
            image_path = quality_check.image.path
            ai_result = analyze_quality_image(image_path)
            
            quality_check.ai_analysis_result = ai_result
            quality_check.ai_confidence_score = ai_result.get('confidence', 0.0)
            quality_check.save(update_fields=['ai_analysis_result', 'ai_confidence_score'])
            
            serializer = self.get_serializer(quality_check)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'Analysis failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get quality statistics"""
        queryset = self.get_queryset()
        
        # Basic statistics
        total_checks = queryset.count()
        defects_found = queryset.filter(defect_detected=True).count()
        
        # Status breakdown
        status_counts = queryset.values('status').annotate(count=Count('id'))
        
        # Severity breakdown (for defects only)
        severity_counts = queryset.filter(defect_detected=True).values('severity').annotate(count=Count('id'))
        
        # Defect type breakdown
        defect_type_counts = queryset.filter(defect_detected=True).values('defect_type').annotate(count=Count('id'))
        
        # Calculate rates
        defect_rate = (defects_found / total_checks * 100) if total_checks > 0 else 0
        
        approved_count = queryset.filter(status='approved').count()
        approval_rate = (approved_count / total_checks * 100) if total_checks > 0 else 0
        
        return Response({
            'total_checks': total_checks,
            'defects_found': defects_found,
            'defect_rate': round(defect_rate, 2),
            'approval_rate': round(approval_rate, 2),
            'status_breakdown': list(status_counts),
            'severity_breakdown': list(severity_counts),
            'defect_type_breakdown': list(defect_type_counts),
            'generated_at': timezone.now().isoformat()
        })
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get dashboard data for quality overview"""
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        
        # Today's statistics
        today_checks = self.get_queryset().filter(created_at__date=today)
        today_total = today_checks.count()
        today_defects = today_checks.filter(defect_detected=True).count()
        today_defect_rate = (today_defects / today_total * 100) if today_total > 0 else 0
        
        # This week's statistics
        week_checks = self.get_queryset().filter(created_at__date__gte=week_ago)
        week_total = week_checks.count()
        week_defects = week_checks.filter(defect_detected=True).count()
        week_defect_rate = (week_defects / week_total * 100) if week_total > 0 else 0
        
        # Recent checks
        recent_checks = self.get_queryset()[:10]
        recent_serializer = QualityCheckListSerializer(recent_checks, many=True, context={'request': request})
        
        # Quality alerts (high severity defects)
        alerts = []
        high_severity_defects = self.get_queryset().filter(
            severity='high', 
            defect_detected=True, 
            created_at__date__gte=week_ago
        )
        
        for defect in high_severity_defects:
            alerts.append({
                'type': 'high_severity_defect',
                'message': f'High severity {defect.defect_type} detected in batch {defect.batch.batch_code}',
                'batch_id': str(defect.batch.id),
                'quality_check_id': str(defect.id),
                'created_at': defect.created_at.isoformat()
            })
        
        dashboard_data = {
            'total_checks_today': today_total,
            'total_checks_week': week_total,
            'defect_rate_today': round(today_defect_rate, 2),
            'defect_rate_week': round(week_defect_rate, 2),
            'quality_score_trend': [],  # TODO: Implement quality score trend
            'defect_types_breakdown': [],  # TODO: Implement defect breakdown
            'recent_checks': recent_serializer.data,
            'top_inspectors': [],  # TODO: Implement top inspectors
            'alerts': alerts
        }
        
        return Response(dashboard_data)


class QualityStandardViewSet(viewsets.ModelViewSet):
    """ViewSet for quality standards management"""
    
    queryset = QualityStandard.objects.all()
    serializer_class = QualityStandardSerializer
    permission_classes = [QualityPermission]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['product_type']
    ordering = ['product_type']


class QualityMetricsViewSet(viewsets.ModelViewSet):
    """ViewSet for quality metrics and reporting"""
    
    queryset = QualityMetrics.objects.all()
    serializer_class = QualityMetricsSerializer
    permission_classes = [QualityReportAccess]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['date']
    ordering = ['-date']
    
    @action(detail=False, methods=['post'])
    def generate_daily_metrics(self, request):
        """Generate quality metrics for a specific date"""
        target_date = request.data.get('date')
        if not target_date:
            target_date = timezone.now().date()
        
        # Check if metrics already exist for this date
        existing_metrics, created = QualityMetrics.objects.get_or_create(
            date=target_date,
            defaults={
                'total_checks': 0,
                'defects_found': 0,
                'batches_approved': 0,
                'batches_rejected': 0,
                'overall_quality_score': 0.0,
                'defect_rate': 0.0,
                'approval_rate': 0.0,
            }
        )
        
        # Calculate metrics for the date
        day_checks = QualityCheck.objects.filter(created_at__date=target_date)
        
        total_checks = day_checks.count()
        defects_found = day_checks.filter(defect_detected=True).count()
        approved = day_checks.filter(status='approved').count()
        rejected = day_checks.filter(status='rejected').count()
        
        # Calculate rates
        defect_rate = (defects_found / total_checks * 100) if total_checks > 0 else 0
        approval_rate = (approved / total_checks * 100) if total_checks > 0 else 0
        
        # Simple quality score calculation
        base_score = 1.0
        defect_penalty = defect_rate / 100 * 0.7  # 70% penalty for defects
        quality_score = max(0.0, base_score - defect_penalty)
        
        # Update metrics
        existing_metrics.total_checks = total_checks
        existing_metrics.defects_found = defects_found
        existing_metrics.batches_approved = approved
        existing_metrics.batches_rejected = rejected
        existing_metrics.defect_rate = defect_rate
        existing_metrics.approval_rate = approval_rate
        existing_metrics.overall_quality_score = quality_score
        existing_metrics.save()
        
        serializer = self.get_serializer(existing_metrics)
        return Response({
            'metrics': serializer.data,
            'created': created,
            'message': 'Daily metrics generated successfully'
        })


class QualityReportView(viewsets.GenericViewSet):
    """ViewSet for generating quality reports"""
    
    permission_classes = [QualityReportAccess]
    
    @action(detail=False, methods=['post'])
    def batch_report(self, request):
        """Generate quality report for a specific batch"""
        serializer = QualityReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        batch_id = serializer.validated_data['batch_id']
        include_images = serializer.validated_data.get('include_images', False)
        
        try:
            report = generate_quality_report(str(batch_id), include_images)
            return Response(report)
            
        except Exception as e:
            return Response(
                {'error': f'Report generation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def batch_score(self, request):
        """Calculate quality score for a batch"""
        batch_id = request.data.get('batch_id')
        if not batch_id:
            return Response(
                {'error': 'batch_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            score_data = calculate_batch_quality_score(str(batch_id))
            return Response(score_data)
            
        except Exception as e:
            return Response(
                {'error': f'Score calculation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
