"""
Machine views for TexPro AI
Handles machine and machine type CRUD operations and management
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Avg
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from machines.models import Machine, MachineType, MachineManager
from machines.serializers import (
    MachineSerializer,
    MachineDetailSerializer,
    MachineTypeSerializer,
    MachineStatusUpdateSerializer,
    MachineMaintenanceSerializer,
    MachineOperatingHoursSerializer
)
from core.permissions import RoleBasedPermission
from core.pagination import StandardResultsSetPagination
from core.filters import BaseFilterSet


class MachineTypeFilterSet(BaseFilterSet):
    """
    Filter set for MachineType model
    """
    class Meta:
        model = MachineType
        fields = {
            'name': ['icontains', 'exact'],
            'manufacturer': ['icontains', 'exact'],
            'typical_power_consumption': ['gte', 'lte'],
            'typical_production_rate': ['gte', 'lte'],
            'recommended_maintenance_interval_hours': ['gte', 'lte'],
            'recommended_maintenance_interval_days': ['gte', 'lte'],
        }


class MachineFilterSet(BaseFilterSet):
    """
    Filter set for Machine model
    """
    class Meta:
        model = Machine
        fields = {
            'machine_id': ['icontains', 'exact'],
            'name': ['icontains', 'exact'],
            'machine_type': ['exact'],
            'machine_type__name': ['icontains', 'exact'],
            'operational_status': ['exact', 'in'],
            'site_code': ['exact', 'icontains'],
            'building': ['icontains', 'exact'],
            'floor': ['icontains', 'exact'],
            'manufacturer': ['icontains', 'exact'],
            'model_number': ['icontains', 'exact'],
            'primary_operator': ['exact'],
            'installation_date': ['gte', 'lte', 'exact'],
            'last_maintenance_date': ['gte', 'lte', 'exact'],
            'next_maintenance_date': ['gte', 'lte', 'exact'],
            'total_operating_hours': ['gte', 'lte'],
            'hours_since_maintenance': ['gte', 'lte'],
            'status': ['exact'],
        }


class MachineTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing machine types
    """
    queryset = MachineType.objects.all()
    serializer_class = MachineTypeSerializer
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = MachineTypeFilterSet
    search_fields = ['name', 'description', 'manufacturer']
    ordering_fields = ['name', 'manufacturer', 'created_at']
    ordering = ['name']
    
    def get_permissions(self):
        """
        Set permissions based on action
        """
        if self.action in ['list', 'retrieve']:
            # All authenticated users can view
            permission_classes = [IsAuthenticated]
        else:
            # Only admin and supervisor can modify
            permission_classes = [IsAuthenticated, RoleBasedPermission]
        
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['get'])
    def machines(self, request, pk=None):
        """
        Get all machines of this type
        """
        machine_type = self.get_object()
        machines = machine_type.machines.all()
        
        # Apply filtering
        operational_status = request.query_params.get('operational_status')
        if operational_status:
            machines = machines.filter(operational_status=operational_status)
        
        site_code = request.query_params.get('site_code')
        if site_code:
            machines = machines.filter(site_code__icontains=site_code)
        
        serializer = MachineSerializer(machines, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """
        Get statistics for this machine type
        """
        machine_type = self.get_object()
        machines = machine_type.machines.all()
        
        stats = {
            'total_machines': machines.count(),
            'operational_machines': machines.filter(
                operational_status__in=['running', 'idle']
            ).count(),
            'maintenance_machines': machines.filter(
                operational_status='maintenance'
            ).count(),
            'offline_machines': machines.filter(
                operational_status='offline'
            ).count(),
            'breakdown_machines': machines.filter(
                operational_status='breakdown'
            ).count(),
            'average_operating_hours': machines.aggregate(
                avg_hours=models.Avg('total_operating_hours')
            )['avg_hours'] or 0,
        }
        
        return Response(stats)


class MachineViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing machines
    """
    queryset = Machine.objects.select_related(
        'machine_type', 'primary_operator'
    ).all()
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = MachineFilterSet
    search_fields = [
        'machine_id', 'name', 'machine_type__name',
        'manufacturer', 'model_number', 'serial_number',
        'building', 'location_details'
    ]
    ordering_fields = [
        'machine_id', 'name', 'operational_status',
        'total_operating_hours', 'hours_since_maintenance',
        'last_maintenance_date', 'next_maintenance_date',
        'created_at'
    ]
    ordering = ['machine_id']
    
    def get_serializer_class(self):
        """
        Return appropriate serializer based on action
        """
        if self.action == 'retrieve':
            return MachineDetailSerializer
        return MachineSerializer
    
    def get_permissions(self):
        """
        Set permissions based on action
        """
        if self.action in ['list', 'retrieve']:
            # All authenticated users can view
            permission_classes = [IsAuthenticated]
        else:
            # Only admin and supervisor can modify
            permission_classes = [IsAuthenticated, RoleBasedPermission]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter queryset based on user permissions and query parameters
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        # Filter by site if user is not admin
        if hasattr(user, 'user_type') and user.user_type != 'admin':
            if hasattr(user, 'site_code') and user.site_code:
                queryset = queryset.filter(site_code=user.site_code)
        
        # Additional filtering based on query parameters
        operational_status = self.request.query_params.get('operational_status')
        if operational_status:
            queryset = queryset.filter(operational_status=operational_status)
        
        maintenance_due = self.request.query_params.get('maintenance_due')
        if maintenance_due == 'true':
            # Get machines that need maintenance
            maintenance_machines = []
            for machine in queryset:
                if machine.needs_maintenance or machine.maintenance_urgency in ['urgent', 'critical']:
                    maintenance_machines.append(machine.id)
            queryset = queryset.filter(id__in=maintenance_machines)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def operational(self, request):
        """
        Get all operational machines
        """
        machines = self.get_queryset().filter(
            operational_status__in=['running', 'idle']
        )
        
        page = self.paginate_queryset(machines)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(machines, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def maintenance_due(self, request):
        """
        Get machines that need maintenance
        """
        machines = Machine.get_maintenance_due_soon()
        
        page = self.paginate_queryset(machines)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(machines, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue_maintenance(self, request):
        """
        Get machines with overdue maintenance
        """
        machines = Machine.get_overdue_machines()
        
        page = self.paginate_queryset(machines)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(machines, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_location(self, request):
        """
        Get machines grouped by location
        """
        location = request.query_params.get('location')
        if not location:
            return Response(
                {'error': 'Location parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        machines = Machine.get_machines_by_location(location)
        
        page = self.paginate_queryset(machines)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(machines, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """
        Get machines by type
        """
        machine_type = request.query_params.get('type')
        if not machine_type:
            return Response(
                {'error': 'Type parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        machines = Machine.get_machines_by_type(machine_type)
        
        page = self.paginate_queryset(machines)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(machines, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update machine operational status
        """
        machine = self.get_object()
        serializer = MachineStatusUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            new_status = serializer.validated_data['operational_status']
            reason = serializer.validated_data.get('reason', '')
            
            # Update status based on the new value
            old_status = machine.operational_status
            machine.operational_status = new_status
            
            # Add note about status change
            status_note = f"{timezone.now().date()}: Status changed from {old_status} to {new_status}"
            if reason:
                status_note += f" - {reason}"
            
            current_notes = machine.notes or ''
            machine.notes = f"{current_notes}\n{status_note}".strip()
            
            machine.save(update_fields=['operational_status', 'notes', 'updated_at'])
            
            return Response({
                'message': 'Machine status updated successfully',
                'old_status': old_status,
                'new_status': new_status,
                'machine': MachineDetailSerializer(machine).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def record_maintenance(self, request, pk=None):
        """
        Record maintenance for the machine
        """
        machine = self.get_object()
        serializer = MachineMaintenanceSerializer(data=request.data)
        
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Record maintenance
            maintenance_note = (
                f"{timezone.now().date()}: {data['maintenance_type']} - "
                f"{data['description']}"
            )
            
            if data.get('parts_replaced'):
                maintenance_note += f" | Parts: {data['parts_replaced']}"
            
            if data.get('cost'):
                maintenance_note += f" | Cost: {data['cost']} CFA"
            
            if data.get('performed_by'):
                maintenance_note += f" | By: {data['performed_by']}"
            
            # Complete maintenance (this will reset hours and update status)
            machine.complete_maintenance(
                hours_spent=data.get('hours_spent', 0),
                notes=maintenance_note
            )
            
            return Response({
                'message': 'Maintenance recorded successfully',
                'machine': MachineDetailSerializer(machine).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def update_hours(self, request, pk=None):
        """
        Update machine operating hours
        """
        machine = self.get_object()
        serializer = MachineOperatingHoursSerializer(data=request.data)
        
        if serializer.is_valid():
            additional_hours = serializer.validated_data['additional_hours']
            notes = serializer.validated_data.get('notes', '')
            
            # Update operating hours
            machine.update_operating_hours(additional_hours)
            
            # Add note if provided
            if notes:
                current_notes = machine.notes or ''
                hours_note = f"{timezone.now().date()}: +{additional_hours} hours - {notes}"
                machine.notes = f"{current_notes}\n{hours_note}".strip()
                machine.save(update_fields=['notes', 'updated_at'])
            
            return Response({
                'message': f'Added {additional_hours} operating hours',
                'total_hours': machine.total_operating_hours,
                'hours_since_maintenance': machine.hours_since_maintenance,
                'machine': MachineDetailSerializer(machine).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MachineStatusUpdateView(APIView):
    """
    Bulk update machine statuses
    """
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    
    def post(self, request):
        """
        Bulk update multiple machine statuses
        """
        machine_ids = request.data.get('machine_ids', [])
        new_status = request.data.get('operational_status')
        reason = request.data.get('reason', '')
        
        if not machine_ids or not new_status:
            return Response(
                {'error': 'machine_ids and operational_status are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate status
        valid_statuses = [choice[0] for choice in Machine.OperationalStatus.choices]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update machines
        machines = Machine.objects.filter(id__in=machine_ids)
        updated_count = 0
        
        for machine in machines:
            old_status = machine.operational_status
            machine.operational_status = new_status
            
            # Add note
            status_note = f"{timezone.now().date()}: Bulk status change from {old_status} to {new_status}"
            if reason:
                status_note += f" - {reason}"
            
            current_notes = machine.notes or ''
            machine.notes = f"{current_notes}\n{status_note}".strip()
            
            machine.save(update_fields=['operational_status', 'notes', 'updated_at'])
            updated_count += 1
        
        return Response({
            'message': f'Updated status for {updated_count} machines',
            'updated_count': updated_count,
            'new_status': new_status
        })


class MachineMaintenanceView(APIView):
    """
    Machine maintenance management
    """
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    
    def post(self, request):
        """
        Mark machines for maintenance
        """
        machine_ids = request.data.get('machine_ids', [])
        reason = request.data.get('reason', 'Scheduled maintenance')
        
        if not machine_ids:
            return Response(
                {'error': 'machine_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        machines = Machine.objects.filter(id__in=machine_ids)
        marked_count = 0
        
        for machine in machines:
            if machine.mark_for_maintenance():
                # Add maintenance note
                maintenance_note = f"{timezone.now().date()}: Marked for maintenance - {reason}"
                current_notes = machine.notes or ''
                machine.notes = f"{current_notes}\n{maintenance_note}".strip()
                machine.save(update_fields=['notes', 'updated_at'])
                marked_count += 1
        
        return Response({
            'message': f'Marked {marked_count} machines for maintenance',
            'marked_count': marked_count
        })


class MachineOperatingHoursView(APIView):
    """
    Bulk update machine operating hours
    """
    permission_classes = [IsAuthenticated, RoleBasedPermission]
    
    def post(self, request):
        """
        Bulk update operating hours for multiple machines
        """
        updates = request.data.get('updates', [])
        
        if not updates:
            return Response(
                {'error': 'updates array is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated_count = 0
        errors = []
        
        for update in updates:
            machine_id = update.get('machine_id')
            additional_hours = update.get('additional_hours')
            
            if not machine_id or additional_hours is None:
                errors.append(f'Missing machine_id or additional_hours in update')
                continue
            
            try:
                machine = Machine.objects.get(id=machine_id)
                machine.update_operating_hours(additional_hours)
                updated_count += 1
            except Machine.DoesNotExist:
                errors.append(f'Machine with id {machine_id} not found')
            except Exception as e:
                errors.append(f'Error updating machine {machine_id}: {str(e)}')
        
        response_data = {
            'message': f'Updated {updated_count} machines',
            'updated_count': updated_count
        }
        
        if errors:
            response_data['errors'] = errors
        
        return Response(response_data)
