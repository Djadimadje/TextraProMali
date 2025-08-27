"""
Allocation app serializers for TexPro AI
Data serialization for workforce and material allocation
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from allocation.models import WorkforceAllocation, MaterialAllocation, AllocationSummary
from allocation.services import check_workforce_conflicts

User = get_user_model()


class WorkforceAllocationSerializer(serializers.ModelSerializer):
    """Serializer for WorkforceAllocation model"""
    
    # Read-only computed fields
    user_name = serializers.CharField(source='user.username', read_only=True)
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)
    allocated_by_name = serializers.CharField(source='allocated_by.username', read_only=True)
    duration_days = serializers.ReadOnlyField()
    role_display = serializers.CharField(source='get_role_assigned_display', read_only=True)
    
    class Meta:
        model = WorkforceAllocation
        fields = [
            'id', 'batch', 'user', 'role_assigned', 'allocated_by',
            'start_date', 'end_date', 'created_at', 'updated_at',
            # Computed fields
            'user_name', 'batch_number', 'allocated_by_name', 
            'duration_days', 'role_display'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Cross-field validation"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        # Validate date range
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                'start_date': 'Start date cannot be after end date.'
            })
        
        # Check for conflicts during creation
        if not self.instance:  # Only for new allocations
            user = data.get('user')
            batch = data.get('batch')
            
            if user and batch:
                conflicts = check_workforce_conflicts(user, batch, start_date, end_date)
                
                if not conflicts['can_proceed']:
                    raise serializers.ValidationError({
                        'user': 'User is already allocated to this batch.'
                    })
                
                # Add warnings for date conflicts to context
                if conflicts['has_conflicts']:
                    self.context['allocation_warnings'] = conflicts['conflicts']
        
        # Validate user role compatibility
        user = data.get('user')
        role_assigned = data.get('role_assigned')
        
        if user and role_assigned:
            user_role = getattr(user, 'role', None)
            
            # Role compatibility check
            role_compatibility = {
                'operator': ['technician', 'operator'],
                'maintenance': ['technician', 'maintenance'],
                'qc': ['inspector', 'qc'],
                'supervisor': ['supervisor'],
                'assistant': ['technician', 'assistant']
            }
            
            compatible_roles = role_compatibility.get(role_assigned, [])
            if user_role not in compatible_roles and user_role != 'admin':
                raise serializers.ValidationError({
                    'role_assigned': f'User role "{user_role}" is not compatible with assigned role "{role_assigned}".'
                })
        
        return data
    
    def create(self, validated_data):
        """Create workforce allocation with automatic allocated_by"""
        if not validated_data.get('allocated_by'):
            validated_data['allocated_by'] = self.context['request'].user
        
        return super().create(validated_data)


class MaterialAllocationSerializer(serializers.ModelSerializer):
    """Serializer for MaterialAllocation model"""
    
    # Read-only computed fields
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)
    allocated_by_name = serializers.CharField(source='allocated_by.username', read_only=True)
    total_cost = serializers.ReadOnlyField()
    unit_display = serializers.CharField(source='get_unit_display', read_only=True)
    
    class Meta:
        model = MaterialAllocation
        fields = [
            'id', 'batch', 'material_name', 'quantity', 'unit',
            'allocated_by', 'cost_per_unit', 'supplier', 'created_at', 'updated_at',
            # Computed fields
            'batch_number', 'allocated_by_name', 'total_cost', 'unit_display'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_quantity(self, value):
        """Validate quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value
    
    def validate_cost_per_unit(self, value):
        """Validate cost per unit is non-negative"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Cost per unit cannot be negative.")
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        # Ensure material name is not empty
        material_name = data.get('material_name', '').strip()
        if not material_name:
            raise serializers.ValidationError({
                'material_name': 'Material name cannot be empty.'
            })
        data['material_name'] = material_name
        
        return data
    
    def create(self, validated_data):
        """Create material allocation with automatic allocated_by"""
        if not validated_data.get('allocated_by'):
            validated_data['allocated_by'] = self.context['request'].user
        
        return super().create(validated_data)


class AllocationSummarySerializer(serializers.ModelSerializer):
    """Serializer for AllocationSummary model"""
    
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)
    batch_product_type = serializers.CharField(source='batch.product_type', read_only=True)
    
    class Meta:
        model = AllocationSummary
        fields = [
            'id', 'batch', 'total_workforce', 'total_material_cost',
            'material_count', 'last_updated',
            # Computed fields
            'batch_number', 'batch_product_type'
        ]
        read_only_fields = ['id', 'last_updated']


class WorkforceAllocationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for workforce allocation lists"""
    
    user_name = serializers.CharField(source='user.username', read_only=True)
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)
    role_display = serializers.CharField(source='get_role_assigned_display', read_only=True)
    
    class Meta:
        model = WorkforceAllocation
        fields = [
            'id', 'batch_number', 'user_name', 'role_display',
            'start_date', 'end_date', 'created_at'
        ]


class MaterialAllocationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for material allocation lists"""
    
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)
    total_cost = serializers.ReadOnlyField()
    
    class Meta:
        model = MaterialAllocation
        fields = [
            'id', 'batch_number', 'material_name', 'quantity',
            'unit', 'total_cost', 'created_at'
        ]


class AllocationReportSerializer(serializers.Serializer):
    """Serializer for allocation reports"""
    
    batch_id = serializers.UUIDField()
    include_details = serializers.BooleanField(default=True)
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    
    def validate(self, data):
        """Validate date range"""
        date_from = data.get('date_from')
        date_to = data.get('date_to')
        
        if date_from and date_to and date_from > date_to:
            raise serializers.ValidationError({
                'date_from': 'Start date cannot be after end date.'
            })
        
        return data


class BatchAllocationSummarySerializer(serializers.Serializer):
    """Serializer for batch allocation summary data"""
    
    workforce_count = serializers.IntegerField()
    material_count = serializers.IntegerField()
    total_cost = serializers.DecimalField(max_digits=12, decimal_places=2)
    efficiency_score = serializers.FloatField()
    
    workforce_breakdown = serializers.DictField()
    material_breakdown = serializers.DictField()
    cost_breakdown = serializers.DictField()
