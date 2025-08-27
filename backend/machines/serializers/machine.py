"""
Machine serializers for TexPro AI
Handles serialization of machine and machine type data
"""
from rest_framework import serializers
from machines.models import Machine, MachineType
from users.serializers import UserBasicSerializer


class MachineTypeSerializer(serializers.ModelSerializer):
    """
    Serializer for MachineType model
    """
    machines_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MachineType
        fields = [
            'id', 'name', 'description', 'manufacturer',
            'typical_power_consumption', 'typical_production_rate', 'production_unit',
            'recommended_maintenance_interval_hours', 'recommended_maintenance_interval_days',
            'machines_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'machines_count']
    
    def get_machines_count(self, obj):
        """Get count of machines of this type"""
        return obj.machines.count()


class MachineSerializer(serializers.ModelSerializer):
    """
    Basic machine serializer for list views
    """
    machine_type_name = serializers.CharField(source='machine_type.name', read_only=True)
    primary_operator_name = serializers.CharField(source='primary_operator.get_full_name', read_only=True)
    maintenance_urgency = serializers.CharField(read_only=True)
    is_operational = serializers.BooleanField(read_only=True)
    needs_maintenance = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Machine
        fields = [
            'id', 'machine_id', 'name', 'machine_type', 'machine_type_name',
            'operational_status', 'site_code', 'building', 'floor',
            'total_operating_hours', 'hours_since_maintenance',
            'last_maintenance_date', 'next_maintenance_date',
            'primary_operator', 'primary_operator_name',
            'maintenance_urgency', 'is_operational', 'needs_maintenance',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'machine_type_name', 'primary_operator_name',
            'maintenance_urgency', 'is_operational', 'needs_maintenance',
            'created_at', 'updated_at'
        ]
    
    def validate_machine_id(self, value):
        """Validate machine ID format"""
        # machine_id is optional - will be auto-generated if not provided
        if not value:
            return value
        
        # Convert to uppercase
        value = value.strip().upper()
        
        # Check for uniqueness
        instance_id = getattr(self.instance, 'id', None)
        if Machine.objects.filter(machine_id=value).exclude(id=instance_id).exists():
            raise serializers.ValidationError("Machine with this ID already exists")
        
        return value
    
    def validate_total_operating_hours(self, value):
        """Validate operating hours"""
        if value < 0:
            raise serializers.ValidationError("Operating hours cannot be negative")
        return value
    
    def validate_hours_since_maintenance(self, value):
        """Validate maintenance hours"""
        if value < 0:
            raise serializers.ValidationError("Hours since maintenance cannot be negative")
        return value


class MachineDetailSerializer(MachineSerializer):
    """
    Detailed machine serializer with full information
    """
    machine_type_detail = MachineTypeSerializer(source='machine_type', read_only=True)
    primary_operator_detail = UserBasicSerializer(source='primary_operator', read_only=True)
    maintenance_status_description = serializers.SerializerMethodField()
    days_until_maintenance = serializers.SerializerMethodField()
    is_maintenance_overdue = serializers.SerializerMethodField()
    efficiency_rating = serializers.SerializerMethodField()
    
    class Meta(MachineSerializer.Meta):
        fields = MachineSerializer.Meta.fields + [
            'manufacturer', 'model_number', 'serial_number', 'installation_date',
            'location_details', 'rated_power', 'rated_capacity', 'capacity_unit',
            'notes', 'warranty_expiry', 'purchase_cost', 'status',
            'machine_type_detail', 'primary_operator_detail',
            'maintenance_status_description', 'days_until_maintenance',
            'is_maintenance_overdue', 'efficiency_rating'
        ]
        read_only_fields = MachineSerializer.Meta.read_only_fields + [
            'machine_type_detail', 'primary_operator_detail',
            'maintenance_status_description', 'days_until_maintenance',
            'is_maintenance_overdue', 'efficiency_rating'
        ]
    
    def get_maintenance_status_description(self, obj):
        """Get maintenance status description"""
        return obj.maintenance_status_description()
    
    def get_days_until_maintenance(self, obj):
        """Get days until maintenance"""
        return obj.days_until_maintenance()
    
    def get_is_maintenance_overdue(self, obj):
        """Check if maintenance is overdue"""
        return obj.is_maintenance_overdue
    
    def get_efficiency_rating(self, obj):
        """Get machine efficiency rating"""
        return obj.get_efficiency_rating()


class MachineStatusUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating machine operational status
    """
    operational_status = serializers.ChoiceField(
        choices=Machine.OperationalStatus.choices,
        required=True
    )
    reason = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=True,
        help_text="Reason for status change"
    )
    
    def validate(self, data):
        """Validate status update"""
        status = data.get('operational_status')
        reason = data.get('reason', '')
        
        # Require reason for certain status changes
        if status in ['breakdown', 'offline', 'maintenance'] and not reason.strip():
            raise serializers.ValidationError({
                'reason': f'Reason is required when setting status to {status}'
            })
        
        return data


class MachineMaintenanceSerializer(serializers.Serializer):
    """
    Serializer for recording machine maintenance
    """
    maintenance_type = serializers.ChoiceField(
        choices=[
            ('scheduled', 'Scheduled Maintenance'),
            ('emergency', 'Emergency Repair'),
            ('preventive', 'Preventive Maintenance'),
            ('inspection', 'Inspection Only'),
        ],
        required=True
    )
    
    description = serializers.CharField(
        max_length=1000,
        required=True,
        help_text="Description of maintenance performed"
    )
    
    hours_spent = serializers.FloatField(
        min_value=0,
        required=False,
        default=0,
        help_text="Hours spent on maintenance"
    )
    
    parts_replaced = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=True,
        help_text="Parts that were replaced"
    )
    
    cost = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        min_value=0,
        help_text="Cost of maintenance in CFA francs"
    )
    
    performed_by = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True,
        help_text="Person who performed the maintenance"
    )
    
    def validate_description(self, value):
        """Validate maintenance description"""
        if not value.strip():
            raise serializers.ValidationError("Maintenance description cannot be empty")
        return value.strip()


class MachineOperatingHoursSerializer(serializers.Serializer):
    """
    Serializer for updating machine operating hours
    """
    additional_hours = serializers.FloatField(
        min_value=0,
        max_value=24,
        required=True,
        help_text="Additional operating hours to add"
    )
    
    date = serializers.DateField(
        required=False,
        help_text="Date for the operating hours (defaults to today)"
    )
    
    notes = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=True,
        help_text="Notes about the operating session"
    )
    
    def validate_additional_hours(self, value):
        """Validate additional hours"""
        if value <= 0:
            raise serializers.ValidationError("Additional hours must be greater than 0")
        if value > 24:
            raise serializers.ValidationError("Additional hours cannot exceed 24 per day")
        return value
