"""
Quality app serializers for TexPro AI
Data serialization for quality control operations
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from quality.models import QualityCheck, QualityStandard, QualityMetrics
from quality.services import analyze_quality_image
import os

User = get_user_model()


class QualityCheckSerializer(serializers.ModelSerializer):
    """Serializer for QualityCheck model with AI integration"""
    
    # Read-only computed fields
    defect_summary = serializers.ReadOnlyField()
    batch_info = serializers.ReadOnlyField()
    inspector_name = serializers.CharField(source='inspector.username', read_only=True)
    batch_code = serializers.CharField(source='batch.batch_code', read_only=True)
    
    # Custom field to allow batch lookup by batch_code
    batch_code_input = serializers.CharField(write_only=True, required=False, help_text="Batch code for batch lookup")
    
    # Image URL for frontend display
    image_url = serializers.SerializerMethodField()
from quality.services import analyze_quality_image
import os

User = get_user_model()


class QualityCheckSerializer(serializers.ModelSerializer):
    """Serializer for QualityCheck model with AI integration"""
    
    # Read-only computed fields
    defect_summary = serializers.ReadOnlyField()
    batch_info = serializers.ReadOnlyField()
    inspector_name = serializers.CharField(source='inspector.username', read_only=True)
    batch_code = serializers.CharField(source='batch.batch_code', read_only=True)
    
    # Custom field to allow batch lookup by batch_code
    batch_code_input = serializers.CharField(write_only=True, required=False, help_text="Batch code for batch lookup")
    
    # Image URL for frontend display
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = QualityCheck
        fields = [
            'id', 'batch', 'batch_code_input', 'inspector', 'image', 'image_url',
            'defect_detected', 'defect_type', 'severity', 'comments', 'status',
            'ai_analysis_requested', 'ai_analysis_result', 'ai_confidence_score',
            'created_at', 'updated_at',
            # Computed fields
            'defect_summary', 'batch_info', 'inspector_name', 'batch_code'
        ]
        read_only_fields = [
            'id', 'ai_analysis_result', 'ai_confidence_score', 
            'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'batch': {'required': False},  # Make batch not required since we use batch_code_input
            'inspector': {'required': False}  # Make inspector not required since it's set in perform_create
        }
    
    def get_image_url(self, obj):
        """Get full URL for uploaded image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def validate_image(self, value):
        """Validate uploaded image"""
        if value:
            # Check file size (max 10MB)
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("Image file too large. Maximum size is 10MB.")
            
            # Check file format
            valid_formats = ['JPEG', 'JPG', 'PNG', 'WEBP']
            if hasattr(value, 'image'):
                try:
                    from PIL import Image
                    img = Image.open(value)
                    if img.format not in valid_formats:
                        raise serializers.ValidationError(
                            f"Invalid image format. Supported formats: {', '.join(valid_formats)}"
                        )
                except Exception:
                    raise serializers.ValidationError("Invalid image file.")
        
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        # Handle batch lookup by batch_code if provided
        batch_code_input = data.pop('batch_code_input', None)
        
        # Ensure either batch or batch_code_input is provided
        if not data.get('batch') and not batch_code_input:
            raise serializers.ValidationError({
                'batch': 'Either batch ID or batch_code_input must be provided.'
            })
        
        # If batch_code_input is provided, lookup the batch
        if batch_code_input:
            from workflow.models import BatchWorkflow
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Looking for batch with code: {batch_code_input}")
            
            try:
                # Strip any whitespace and ensure case-insensitive search
                batch_code_clean = batch_code_input.strip()
                batch = BatchWorkflow.objects.get(batch_code__iexact=batch_code_clean)
                data['batch'] = batch
                logger.info(f"Found batch: {batch.id} with code: {batch.batch_code}")
            except BatchWorkflow.DoesNotExist:
                # Debug: List available batch codes
                available_batches = list(BatchWorkflow.objects.values_list('batch_code', flat=True)[:10])
                logger.error(f"Batch not found. Looking for: '{batch_code_input}'. Available: {available_batches}")
                raise serializers.ValidationError({
                    'batch_code_input': f'No batch found with code: {batch_code_input}. Available batches: {", ".join(available_batches[:5])}'
                })
        
        # If defect detected, require defect type and appropriate severity
        if data.get('defect_detected', False):
            if not data.get('defect_type'):
                raise serializers.ValidationError({
                    'defect_type': 'Defect type is required when defect is detected.'
                })
        
        # If no defect detected, clear defect-related fields
        if not data.get('defect_detected', False):
            data['defect_type'] = None
        
        return data
    
    def create(self, validated_data):
        """Create quality check with AI analysis"""
        quality_check = super().create(validated_data)
        
        # Trigger AI analysis if requested and image is provided
        if quality_check.ai_analysis_requested and quality_check.image:
            try:
                image_path = quality_check.image.path
                ai_result = analyze_quality_image(image_path)
                
                quality_check.ai_analysis_result = ai_result
                quality_check.ai_confidence_score = ai_result.get('confidence', 0.0)
                quality_check.save(update_fields=['ai_analysis_result', 'ai_confidence_score'])
                
            except Exception as e:
                # Log error but don't fail the creation
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"AI analysis failed for quality check {quality_check.id}: {e}")
        
        return quality_check


class QualityCheckListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for quality check lists"""
    
    inspector_name = serializers.CharField(source='inspector.username', read_only=True)
    batch_code = serializers.CharField(source='batch.batch_code', read_only=True)
    defect_summary = serializers.ReadOnlyField()
    image_thumbnail = serializers.SerializerMethodField()
    
    class Meta:
        model = QualityCheck
        fields = [
            'id', 'batch_code', 'inspector_name', 'defect_detected',
            'defect_type', 'severity', 'status', 'created_at',
            'defect_summary', 'image_thumbnail'
        ]
    
    def get_image_thumbnail(self, obj):
        """Get thumbnail URL (placeholder for now)"""
        if obj.image:
            # Future: Generate actual thumbnails
            return self.get_image_url(obj)
        return None
    
    def get_image_url(self, obj):
        """Get full URL for uploaded image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class QualityStandardSerializer(serializers.ModelSerializer):
    """Serializer for quality standards"""
    
    product_type_display = serializers.CharField(source='get_product_type_display', read_only=True)
    
    class Meta:
        model = QualityStandard
        fields = [
            'id', 'product_type', 'product_type_display',
            'max_defects_per_batch', 'critical_defect_tolerance', 'quality_threshold',
            'thread_count_min', 'thread_count_max', 'weight_tolerance', 'color_fastness_grade',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_quality_threshold(self, value):
        """Validate quality threshold is between 0 and 1"""
        if not 0.0 <= value <= 1.0:
            raise serializers.ValidationError("Quality threshold must be between 0.0 and 1.0")
        return value
    
    def validate(self, data):
        """Cross-field validation for thread counts"""
        thread_min = data.get('thread_count_min')
        thread_max = data.get('thread_count_max')
        
        if thread_min and thread_max and thread_min > thread_max:
            raise serializers.ValidationError({
                'thread_count_min': 'Minimum thread count cannot be greater than maximum.'
            })
        
        return data


class QualityMetricsSerializer(serializers.ModelSerializer):
    """Serializer for quality metrics and reporting"""
    
    class Meta:
        model = QualityMetrics
        fields = [
            'id', 'date', 'total_checks', 'defects_found', 'batches_approved', 'batches_rejected',
            'overall_quality_score', 'defect_rate', 'approval_rate', 'ai_accuracy', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_date(self, value):
        """Validate date is not in the future"""
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError("Metrics date cannot be in the future.")
        return value


class QualityReportSerializer(serializers.Serializer):
    """Serializer for quality reports and analytics"""
    
    batch_id = serializers.UUIDField()
    include_images = serializers.BooleanField(default=False)
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


class InspectorSerializer(serializers.ModelSerializer):
    """Serializer for inspector user details"""
    
    quality_checks_count = serializers.SerializerMethodField()
    recent_checks = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'quality_checks_count', 'recent_checks'
        ]
        read_only_fields = ['id', 'username', 'email']
    
    def get_quality_checks_count(self, obj):
        """Get total number of quality checks by this inspector"""
        return obj.quality_checks.count()
    
    def get_recent_checks(self, obj):
        """Get recent quality checks by this inspector"""
        recent = obj.quality_checks.order_by('-created_at')[:5]
        return QualityCheckListSerializer(recent, many=True, context=self.context).data


class DefectTypeSerializer(serializers.Serializer):
    """Serializer for defect type statistics"""
    
    defect_type = serializers.CharField()
    count = serializers.IntegerField()
    percentage = serializers.FloatField()
    severity_breakdown = serializers.DictField()


class QualityDashboardSerializer(serializers.Serializer):
    """Serializer for quality dashboard data"""
    
    total_checks_today = serializers.IntegerField()
    total_checks_week = serializers.IntegerField()
    defect_rate_today = serializers.FloatField()
    defect_rate_week = serializers.FloatField()
    
    quality_score_trend = serializers.ListField(
        child=serializers.DictField()
    )
    
    defect_types_breakdown = DefectTypeSerializer(many=True)
    
    recent_checks = QualityCheckListSerializer(many=True)
    
    top_inspectors = InspectorSerializer(many=True)
    
    alerts = serializers.ListField(
        child=serializers.DictField()
    )
