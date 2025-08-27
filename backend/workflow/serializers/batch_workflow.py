"""
BatchWorkflow serializers for TexPro AI
Handles serialization for batch workflow management
"""
from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.utils import timezone
from users.models import User
from users.serializers import UserBasicSerializer
from ..models import BatchWorkflow
from ..permissions import BatchWorkflowPermissions


class SupervisorChoiceField(serializers.PrimaryKeyRelatedField):
    """
    Custom field for supervisor selection based on user permissions
    """
    
    def get_queryset(self):
        """Filter supervisor choices based on current user"""
        request = self.context.get('request')
        if request and request.user:
            return BatchWorkflowPermissions.get_supervisor_choices_for_user(request.user)
        return User.objects.none()


class BatchWorkflowBaseSerializer(serializers.ModelSerializer):
    """
    Base serializer for BatchWorkflow with common fields
    """
    supervisor_name = serializers.CharField(
        source='supervisor.get_display_name', 
        read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    is_overdue = serializers.BooleanField(read_only=True)
    duration_days = serializers.IntegerField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = BatchWorkflow
        fields = [
            'id', 'batch_code', 'description', 'status', 'status_display',
            'start_date', 'end_date', 'supervisor', 'supervisor_name',
            'created_at', 'updated_at', 'is_overdue', 'duration_days',
            'days_remaining', 'progress_percentage'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BatchWorkflowListSerializer(BatchWorkflowBaseSerializer):
    """
    Serializer for batch workflow list view
    Optimized for listing with minimal data
    """
    supervisor_details = UserBasicSerializer(source='supervisor', read_only=True)
    
    class Meta(BatchWorkflowBaseSerializer.Meta):
        fields = [
            'id', 'batch_code', 'description', 'status', 'status_display',
            'start_date', 'end_date', 'supervisor', 'supervisor_name',
            'supervisor_details', 'created_at', 'updated_at', 'is_overdue',
            'days_remaining', 'progress_percentage'
        ]


class BatchWorkflowDetailSerializer(BatchWorkflowBaseSerializer):
    """
    Serializer for detailed batch workflow view
    Includes all fields and related data
    """
    supervisor_details = UserBasicSerializer(source='supervisor', read_only=True)
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    
    class Meta(BatchWorkflowBaseSerializer.Meta):
        fields = BatchWorkflowBaseSerializer.Meta.fields + [
            'supervisor_details', 'can_edit', 'can_delete'
        ]
    
    def get_can_edit(self, obj):
        """Check if current user can edit this batch"""
        request = self.context.get('request')
        if request and request.user:
            return BatchWorkflowPermissions.can_edit_batch(request.user, obj)
        return False
    
    def get_can_delete(self, obj):
        """Check if current user can delete this batch"""
        request = self.context.get('request')
        if request and request.user:
            return BatchWorkflowPermissions.can_delete_batch(request.user, obj)
        return False


class BatchWorkflowCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new batch workflows
    """
    supervisor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role__in=['supervisor', 'admin'], status='active'),
        required=False  # Make it optional, will auto-assign if not provided
    )
    
    class Meta:
        model = BatchWorkflow
        fields = [
            'batch_code', 'description', 'supervisor',
            'start_date', 'end_date'
        ]
    
    def validate_batch_code(self, value):
        """Validate batch code is unique and properly formatted"""
        if not value or not value.strip():
            raise serializers.ValidationError('Batch code cannot be empty')
        
        value = value.strip().upper()  # Normalize to uppercase
        
        # Check uniqueness
        if BatchWorkflow.objects.filter(batch_code=value).exists():
            raise serializers.ValidationError('Batch code already exists')
        
        return value
    
    def validate_supervisor(self, value):
        """Validate supervisor assignment"""
        if not value:
            raise serializers.ValidationError('Supervisor is required')
        
        if value.role not in ['supervisor', 'admin']:
            raise serializers.ValidationError('Assigned user must be a supervisor or admin')
        
        if value.status != 'active':
            raise serializers.ValidationError('Supervisor must be an active user')
        
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError({
                    'end_date': 'End date cannot be before start date'
                })
        
        # Auto-assign supervisor if user is admin/supervisor and no supervisor specified
        request = self.context.get('request')
        if request and request.user:
            if not attrs.get('supervisor'):
                if request.user.role in ['admin', 'supervisor']:
                    attrs['supervisor'] = request.user
                else:
                    raise serializers.ValidationError({
                        'supervisor': 'Supervisor must be specified or you must be a supervisor/admin'
                    })
        
        return attrs
    
    def create(self, validated_data):
        """Create batch workflow with business logic"""
        # Import here to avoid circular imports
        from ..services import BatchWorkflowService
        
        return BatchWorkflowService.create_batch(
            batch_code=validated_data['batch_code'],
            supervisor=validated_data['supervisor'],
            description=validated_data.get('description'),
            start_date=validated_data.get('start_date'),
            end_date=validated_data.get('end_date')
        )


class BatchWorkflowUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating batch workflows
    """
    supervisor = SupervisorChoiceField(required=False)
    
    class Meta:
        model = BatchWorkflow
        fields = [
            'description', 'status', 'start_date', 'end_date', 'supervisor'
        ]
    
    def validate_status(self, value):
        """Validate status transitions"""
        if self.instance:
            old_status = self.instance.status
            if not self.instance._is_valid_status_transition(old_status, value):
                raise serializers.ValidationError(
                    f'Invalid status transition from {old_status} to {value}'
                )
        
        return value
    
    def validate_supervisor(self, value):
        """Validate supervisor assignment"""
        if value:
            if value.role not in ['supervisor', 'admin']:
                raise serializers.ValidationError('Assigned user must be a supervisor or admin')
            
            if value.status != 'active':
                raise serializers.ValidationError('Supervisor must be an active user')
        
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        start_date = attrs.get('start_date', self.instance.start_date if self.instance else None)
        end_date = attrs.get('end_date', self.instance.end_date if self.instance else None)
        
        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError({
                    'end_date': 'End date cannot be before start date'
                })
        
        return attrs
    
    def update(self, instance, validated_data):
        """Update with permission checks"""
        request = self.context.get('request')
        
        # Check if user can edit this batch
        if request and request.user:
            if not BatchWorkflowPermissions.can_edit_batch(request.user, instance):
                raise serializers.ValidationError(
                    'You do not have permission to edit this batch'
                )
        
        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class BatchWorkflowSerializer(BatchWorkflowBaseSerializer):
    """
    General purpose serializer for batch workflows
    Used for standard CRUD operations
    """
    supervisor = SupervisorChoiceField(required=False)
    supervisor_details = UserBasicSerializer(source='supervisor', read_only=True)
    
    class Meta(BatchWorkflowBaseSerializer.Meta):
        fields = BatchWorkflowBaseSerializer.Meta.fields + ['supervisor_details']
    
    def validate_batch_code(self, value):
        """Validate batch code uniqueness on update"""
        if not value or not value.strip():
            raise serializers.ValidationError('Batch code cannot be empty')
        
        value = value.strip().upper()
        
        # Check uniqueness (exclude current instance if updating)
        queryset = BatchWorkflow.objects.filter(batch_code=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError('Batch code already exists')
        
        return value


class BatchWorkflowStatsSerializer(serializers.Serializer):
    """
    Serializer for batch workflow statistics
    """
    total_batches = serializers.IntegerField()
    active_batches = serializers.IntegerField()
    overdue_batches = serializers.IntegerField()
    by_status = serializers.DictField()
    by_supervisor = serializers.DictField()


class BatchWorkflowBulkUpdateSerializer(serializers.Serializer):
    """
    Serializer for bulk status updates
    """
    batch_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        max_length=100
    )
    status = serializers.ChoiceField(choices=BatchWorkflow.STATUS_CHOICES)
    
    def validate_batch_ids(self, value):
        """Validate that all batch IDs exist"""
        existing_ids = set(
            BatchWorkflow.objects.filter(id__in=value).values_list('id', flat=True)
        )
        
        missing_ids = set(value) - existing_ids
        if missing_ids:
            raise serializers.ValidationError(
                f'Batch IDs not found: {list(missing_ids)}'
            )
        
        return value
