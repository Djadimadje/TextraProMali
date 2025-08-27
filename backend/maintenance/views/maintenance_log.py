"""
MaintenanceLog views for TexPro AI
Handles maintenance log operations with role-based permissions
"""
from django.db import models
from django.utils import timezone
from django.db.models import Q, Count, Avg, Sum
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from maintenance.models import MaintenanceLog
from maintenance.serializers import (
    MaintenanceLogSerializer,
    MaintenanceLogDetailSerializer,
    MaintenanceLogCreateSerializer,
    MaintenanceLogUpdateSerializer,
    MaintenanceStatusUpdateSerializer,
    MaintenanceStatsSerializer,
    PredictiveMaintenanceSerializer
)
from maintenance.services import PredictiveMaintenanceService
from maintenance.permissions import (
    MaintenancePermission,
    CanViewMaintenanceStats,
    CanBulkUpdateMaintenance,
    CanViewPredictiveMaintenance
)
from machines.models import Machine



class MaintenanceLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet for maintenance log operations
    """
    queryset = MaintenanceLog.objects.select_related(
        'machine', 'machine__machine_type', 'technician'
    ).order_by('-created_at')
    permission_classes = [MaintenancePermission]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return MaintenanceLogCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return MaintenanceLogUpdateSerializer
        elif self.action == 'retrieve':
            return MaintenanceLogDetailSerializer
        else:
            return MaintenanceLogSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = self.queryset
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by priority
        priority_filter = self.request.query_params.get('priority')
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)
        
        # Filter by machine
        machine_id = self.request.query_params.get('machine')
        if machine_id:
            queryset = queryset.filter(machine_id=machine_id)
        
        # Filter by technician
        technician_id = self.request.query_params.get('technician')
        if technician_id:
            queryset = queryset.filter(technician_id=technician_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        # Filter overdue maintenance
        overdue = self.request.query_params.get('overdue')
        if overdue and overdue.lower() == 'true':
            today = timezone.now().date()
            queryset = queryset.filter(
                Q(next_due_date__lt=today) & ~Q(status='completed')
            )
        
        # Search in issue_reported and action_taken
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(issue_reported__icontains=search) |
                Q(action_taken__icontains=search) |
                Q(machine__name__icontains=search) |
                Q(technician__first_name__icontains=search) |
                Q(technician__last_name__icontains=search)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        """Create maintenance log"""
        # Set the technician to current user if not specified
        if not serializer.validated_data.get('technician'):
            serializer.save(technician=self.request.user)
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark maintenance as completed"""
        maintenance_log = self.get_object()
        
        if maintenance_log.status == 'completed':
            return Response(
                {'error': 'Maintenance is already completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        action_taken = request.data.get('action_taken', '')
        if not action_taken:
            return Response(
                {'error': 'Action taken is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        maintenance_log.status = 'completed'
        maintenance_log.action_taken = action_taken
        maintenance_log.resolved_at = timezone.now()
        maintenance_log.downtime_hours = request.data.get('downtime_hours')
        maintenance_log.cost = request.data.get('cost')
        maintenance_log.parts_replaced = request.data.get('parts_replaced', '')
        maintenance_log.notes = request.data.get('notes', '')
        maintenance_log.save()
        
        serializer = self.get_serializer(maintenance_log)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def recommendations(self, request, pk=None):
        """Get maintenance recommendations for this log's machine"""
        maintenance_log = self.get_object()
        recommendations = PredictiveMaintenanceService.get_maintenance_recommendations(
            maintenance_log.machine
        )
        return Response(recommendations)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue maintenance logs"""
        today = timezone.now().date()
        overdue_logs = self.get_queryset().filter(
            Q(next_due_date__lt=today) & ~Q(status='completed')
        )
        
        page = self.paginate_queryset(overdue_logs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(overdue_logs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_machine(self, request):
        """Get maintenance logs grouped by machine"""
        machine_logs = self.get_queryset().values(
            'machine__id', 'machine__name'
        ).annotate(
            total_logs=Count('id'),
            pending_logs=Count('id', filter=Q(status='pending')),
            in_progress_logs=Count('id', filter=Q(status='in_progress')),
            completed_logs=Count('id', filter=Q(status='completed')),
            avg_resolution_time=Avg(
                models.F('resolved_at') - models.F('created_at'),
                filter=Q(status='completed')
            )
        ).order_by('machine__name')
        
        return Response(machine_logs)


class MaintenanceStatsView(APIView):
    """
    View for maintenance statistics
    """
    permission_classes = [CanViewMaintenanceStats]
    
    def get(self, request):
        """Get maintenance statistics"""
        # Basic counts
        total_logs = MaintenanceLog.objects.count()
        pending_count = MaintenanceLog.objects.filter(status='pending').count()
        in_progress_count = MaintenanceLog.objects.filter(status='in_progress').count()
        completed_count = MaintenanceLog.objects.filter(status='completed').count()
        
        # Overdue count
        today = timezone.now().date()
        overdue_count = MaintenanceLog.objects.filter(
            Q(next_due_date__lt=today) & ~Q(status='completed')
        ).count()
        
        # Average resolution time (completed logs only)
        completed_logs = MaintenanceLog.objects.filter(
            status='completed',
            resolved_at__isnull=False
        )
        
        avg_resolution_time = None
        if completed_logs.exists():
            resolution_times = completed_logs.annotate(
                resolution_time=models.F('resolved_at') - models.F('created_at')
            ).aggregate(
                avg_time=Avg('resolution_time')
            )
            
            if resolution_times['avg_time']:
                avg_resolution_time = resolution_times['avg_time'].total_seconds() / 3600
        
        # Average downtime
        avg_downtime = MaintenanceLog.objects.filter(
            downtime_hours__isnull=False
        ).aggregate(
            avg_downtime=Avg('downtime_hours')
        )['avg_downtime']
        
        # Total cost
        total_cost = MaintenanceLog.objects.filter(
            cost__isnull=False
        ).aggregate(
            total_cost=Sum('cost')
        )['total_cost'] or 0
        
        # Stats by status
        stats_by_status = list(
            MaintenanceLog.objects.values('status').annotate(
                count=Count('id')
            ).order_by('status')
        )
        
        # Stats by priority
        stats_by_priority = list(
            MaintenanceLog.objects.values('priority').annotate(
                count=Count('id')
            ).order_by('priority')
        )
        
        # Stats by machine type
        stats_by_machine_type = list(
            MaintenanceLog.objects.select_related('machine__machine_type').values(
                'machine__machine_type__name'
            ).annotate(
                count=Count('id')
            ).order_by('machine__machine_type__name')
        )
        
        stats_data = {
            'total_maintenance_logs': total_logs,
            'pending_count': pending_count,
            'in_progress_count': in_progress_count,
            'completed_count': completed_count,
            'overdue_count': overdue_count,
            'average_resolution_time_hours': avg_resolution_time,
            'average_downtime_hours': avg_downtime,
            'total_maintenance_cost': total_cost,
            'stats_by_status': stats_by_status,
            'stats_by_priority': stats_by_priority,
            'stats_by_machine_type': stats_by_machine_type
        }
        
        serializer = MaintenanceStatsSerializer(stats_data)
        return Response(serializer.data)


class BulkMaintenanceStatusUpdateView(APIView):
    """
    View for bulk maintenance status updates
    """
    permission_classes = [CanBulkUpdateMaintenance]
    
    def post(self, request):
        """Bulk update maintenance log statuses"""
        serializer = MaintenanceStatusUpdateSerializer(data=request.data)
        if serializer.is_valid():
            maintenance_ids = serializer.validated_data['maintenance_ids']
            new_status = serializer.validated_data['status']
            notes = serializer.validated_data.get('notes', '')
            
            # Update maintenance logs
            updated_count = MaintenanceLog.objects.filter(
                id__in=maintenance_ids
            ).update(
                status=new_status,
                notes=notes if notes else models.F('notes'),
                updated_at=timezone.now()
            )
            
            return Response({
                'success': True,
                'updated_count': updated_count,
                'message': f'Successfully updated {updated_count} maintenance logs'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PredictiveMaintenanceView(APIView):
    """
    View for predictive maintenance data
    """
    permission_classes = [CanViewPredictiveMaintenance]
    
    def get(self, request, machine_id=None):
        """Get predictive maintenance data for all machines or specific machine"""
        if machine_id:
            # Get prediction for specific machine
            try:
                machine = Machine.objects.get(id=machine_id)
            except Machine.DoesNotExist:
                return Response({'error': 'Machine not found'}, status=status.HTTP_404_NOT_FOUND)
            
            next_due_date = PredictiveMaintenanceService.predict_next_due(machine)
            urgency = PredictiveMaintenanceService.calculate_urgency(machine)
            patterns = PredictiveMaintenanceService.analyze_failure_patterns(machine)
            recommendations = PredictiveMaintenanceService.get_maintenance_recommendations(machine)
            
            days_until_due = None
            if next_due_date:
                days_until_due = (next_due_date - timezone.now().date()).days
            
            prediction_data = {
                'machine_id': str(machine.id),
                'machine_name': machine.name,
                'next_due_date': next_due_date,
                'urgency': urgency,
                'days_until_due': days_until_due,
                'patterns': patterns,
                'recommendations': recommendations
            }
            
            return Response(prediction_data)
        
        # Get predictions for all operational machines
        machines = Machine.objects.filter(operational_status__in=['running', 'idle'])
        predictions = []
        
        for machine in machines:
            next_due_date = PredictiveMaintenanceService.predict_next_due(machine)
            urgency = PredictiveMaintenanceService.calculate_urgency(machine)
            patterns = PredictiveMaintenanceService.analyze_failure_patterns(machine)
            recommendations = PredictiveMaintenanceService.get_maintenance_recommendations(machine)
            
            days_until_due = None
            if next_due_date:
                days_until_due = (next_due_date - timezone.now().date()).days
            
            prediction_data = {
                'machine_id': str(machine.id),
                'machine_name': machine.name,
                'next_due_date': next_due_date,
                'urgency': urgency,
                'days_until_due': days_until_due,
                'patterns': patterns,
                'recommendations': recommendations
            }
            
            predictions.append(prediction_data)
        
        # Sort by urgency and days until due
        urgency_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
        predictions.sort(
            key=lambda x: (
                urgency_order.get(x['urgency'], 4),
                x['days_until_due'] if x['days_until_due'] is not None else 999
            )
        )
        
        serializer = PredictiveMaintenanceSerializer(predictions, many=True)
        return Response(serializer.data)
