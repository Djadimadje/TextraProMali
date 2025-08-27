"""
MaintenanceLog serializers for TexPro AI
Handles serialization of maintenance log data
"""
from rest_framework import serializers
from django.utils import timezone

from maintenance.models import MaintenanceLog
from maintenance.services import PredictiveMaintenanceService
from machines.serializers import MachineSerializer
from users.serializers import UserBasicSerializer


class MaintenanceLogSerializer(serializers.ModelSerializer):
    """
    Basic maintenance log serializer for list views
    """
    machine_info = serializers.SerializerMethodField()
    technician_name = serializers.CharField(source='technician.get_full_name', read_only=True)
    duration_hours = serializers.FloatField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_since_reported = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = MaintenanceLog
        fields = [
            'id', 'machine', 'technician', 'technician_name',
            'issue_reported', 'action_taken', 'status', 'priority',
            'reported_at', 'resolved_at', 'next_due_date',
            'downtime_hours', 'cost', 'machine_info',
            'duration_hours', 'is_overdue', 'days_since_reported',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'reported_at', 'technician_name', 'machine_info',
            'duration_hours', 'is_overdue', 'days_since_reported',
            'created_at', 'updated_at'
        ]
    
    def get_machine_info(self, obj):
        """Get machine information"""
        return obj.machine_info


class MaintenanceLogDetailSerializer(MaintenanceLogSerializer):
    """
    Detailed maintenance log serializer with full information
    """
    machine_detail = MachineSerializer(source='machine', read_only=True)
    technician_detail = UserBasicSerializer(source='technician', read_only=True)
    maintenance_recommendations = serializers.SerializerMethodField()
    
    class Meta(MaintenanceLogSerializer.Meta):
        fields = MaintenanceLogSerializer.Meta.fields + [
            'machine_detail', 'technician_detail', 'parts_replaced', 'notes',
            'maintenance_recommendations'
        ]
        read_only_fields = MaintenanceLogSerializer.Meta.read_only_fields + [
            'machine_detail', 'technician_detail', 'maintenance_recommendations'
        ]
    
    def get_maintenance_recommendations(self, obj):
        """Get maintenance recommendations for the machine"""
        return PredictiveMaintenanceService.get_maintenance_recommendations(obj.machine)


class MaintenanceLogCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating maintenance logs
    """
    next_due_date = serializers.DateField(read_only=True)
    
    class Meta:
        model = MaintenanceLog
        fields = [
            'id', 'machine', 'technician', 'issue_reported', 'priority',
            'next_due_date'
        ]
        read_only_fields = ['id', 'next_due_date']
    
    def validate_machine(self, value):
        """Validate machine selection"""
        if not value:
            raise serializers.ValidationError("Machine is required")
        return value
    
    def validate_technician(self, value):
        """Validate technician selection"""
        if not value:
            raise serializers.ValidationError("Technician is required")
        
        # Check if user has technician role
        if value.role != 'technician':
            raise serializers.ValidationError("Selected user must have technician role")
        
        return value
    
    def validate_issue_reported(self, value):
        """Validate issue description"""
        if not value or not value.strip():
            raise serializers.ValidationError("Issue description cannot be empty")
        
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Issue description must be at least 10 characters")
        
        return value.strip()
    
    def create(self, validated_data):
        """Create maintenance log and predict next due date"""
        machine = validated_data['machine']
        
        # Create the maintenance log
        maintenance_log = MaintenanceLog.objects.create(**validated_data)
        
        # Predict next due date using AI service
        next_due_date = PredictiveMaintenanceService.predict_next_due(machine)
        maintenance_log.next_due_date = next_due_date
        maintenance_log.save(update_fields=['next_due_date'])
        
        return maintenance_log


class MaintenanceLogUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating maintenance logs
    """
    resolved_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = MaintenanceLog
        fields = [
            'action_taken', 'status', 'priority', 'downtime_hours',
            'cost', 'parts_replaced', 'notes', 'resolved_at'
        ]
    
    def validate_action_taken(self, value):
        """Validate action taken"""
        status = self.initial_data.get('status', self.instance.status)
        
        if status == 'completed' and (not value or not value.strip()):
            raise serializers.ValidationError(
                "Action taken is required when marking maintenance as completed"
            )
        
        if value:
            return value.strip()
        return value
    
    def validate_status(self, value):
        """Validate status transitions"""
        if not self.instance:
            return value
        
        current_status = self.instance.status
        
        # Define valid status transitions
        valid_transitions = {
            'pending': ['in_progress', 'completed'],
            'in_progress': ['completed'],
            'completed': []  # Cannot change from completed
        }
        
        if current_status == 'completed' and value != 'completed':
            raise serializers.ValidationError(
                "Cannot change status from completed to another status"
            )
        
        if value not in valid_transitions.get(current_status, []) and value != current_status:
            raise serializers.ValidationError(
                f"Cannot change status from {current_status} to {value}"
            )
        
        return value
    
    def validate_downtime_hours(self, value):
        """Validate downtime hours"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Downtime hours cannot be negative")
        return value
    
    def validate_cost(self, value):
        """Validate maintenance cost"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Cost cannot be negative")
        return value
    
    def update(self, instance, validated_data):
        """Update maintenance log with auto-resolution handling"""
        new_status = validated_data.get('status', instance.status)
        
        # Auto-set resolved_at when status changes to completed
        if new_status == 'completed' and instance.status != 'completed':
            validated_data['resolved_at'] = timezone.now()
        
        # Update the instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class MaintenanceStatusUpdateSerializer(serializers.Serializer):
    """
    Serializer for bulk status updates
    """
    maintenance_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        help_text="List of maintenance log IDs to update"
    )
    
    status = serializers.ChoiceField(
        choices=MaintenanceLog.STATUS_CHOICES,
        help_text="New status to apply"
    )
    
    notes = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=True,
        help_text="Optional notes for the status change"
    )
    
    def validate_maintenance_ids(self, value):
        """Validate maintenance IDs exist"""
        existing_ids = MaintenanceLog.objects.filter(
            id__in=value
        ).values_list('id', flat=True)
        
        missing_ids = set(value) - set(existing_ids)
        if missing_ids:
            raise serializers.ValidationError(
                f"Maintenance logs not found: {list(missing_ids)}"
            )
        
        return value


class MaintenanceStatsSerializer(serializers.Serializer):
    """
    Serializer for maintenance statistics
    """
    total_maintenance_logs = serializers.IntegerField(read_only=True)
    pending_count = serializers.IntegerField(read_only=True)
    in_progress_count = serializers.IntegerField(read_only=True)
    completed_count = serializers.IntegerField(read_only=True)
    overdue_count = serializers.IntegerField(read_only=True)
    
    average_resolution_time_hours = serializers.FloatField(read_only=True)
    average_downtime_hours = serializers.FloatField(read_only=True)
    total_maintenance_cost = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    stats_by_status = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    
    stats_by_priority = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    
    stats_by_machine_type = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )


class PredictiveMaintenanceSerializer(serializers.Serializer):
    """
    Serializer for predictive maintenance data
    """
    machine_id = serializers.CharField(read_only=True)
    machine_name = serializers.CharField(read_only=True)
    next_due_date = serializers.DateField(read_only=True)
    urgency = serializers.CharField(read_only=True)
    days_until_due = serializers.IntegerField(read_only=True)
    
    patterns = serializers.DictField(read_only=True)
    recommendations = serializers.ListField(
        child=serializers.CharField(),
        read_only=True
    )
