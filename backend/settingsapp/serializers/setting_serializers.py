"""
Settings serializers for TexPro AI
API serialization for system configuration data
"""

from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError

from ..models import SystemSetting


class SystemSettingSerializer(serializers.ModelSerializer):
    """
    Serializer for SystemSetting model
    """
    
    # Add computed fields
    value_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemSetting
        fields = [
            'id',
            'key',
            'value',
            'value_preview',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_value_preview(self, obj):
        """
        Get a preview of the value (truncated for long values)
        """
        if len(obj.value) > 100:
            return f"{obj.value[:100]}..."
        return obj.value
    
    def validate_key(self, value):
        """
        Validate setting key format
        """
        if not value:
            raise serializers.ValidationError("Key cannot be empty.")
        
        # Convert to lowercase
        value = value.lower()
        
        # Check format
        if not value.replace('_', '').replace('.', '').replace('-', '').isalnum():
            raise serializers.ValidationError(
                "Key must contain only alphanumeric characters, underscores, dots, and hyphens."
            )
        
        return value
    
    def validate_value(self, value):
        """
        Validate setting value
        """
        if value is None or value == '':
            raise serializers.ValidationError("Value cannot be empty.")
        
        return str(value)


class SystemSettingCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating system settings
    """
    
    class Meta:
        model = SystemSetting
        fields = ['key', 'value', 'description']
    
    def validate_key(self, value):
        """
        Validate setting key format and uniqueness
        """
        if not value:
            raise serializers.ValidationError("Key cannot be empty.")
        
        # Convert to lowercase
        value = value.lower()
        
        # Check format
        if not value.replace('_', '').replace('.', '').replace('-', '').isalnum():
            raise serializers.ValidationError(
                "Key must contain only alphanumeric characters, underscores, dots, and hyphens."
            )
        
        # Check uniqueness
        if SystemSetting.objects.filter(key=value).exists():
            raise serializers.ValidationError(f"Setting with key '{value}' already exists.")
        
        return value
    
    def validate_value(self, value):
        """
        Validate setting value
        """
        if value is None or value == '':
            raise serializers.ValidationError("Value cannot be empty.")
        
        return str(value)


class SystemSettingUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating system settings
    """
    
    class Meta:
        model = SystemSetting
        fields = ['value', 'description']
    
    def validate_value(self, value):
        """
        Validate setting value
        """
        if value is None or value == '':
            raise serializers.ValidationError("Value cannot be empty.")
        
        return str(value)


class SystemSettingListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing settings
    """
    
    value_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemSetting
        fields = [
            'id',
            'key',
            'value_preview',
            'description',
            'updated_at',
        ]
    
    def get_value_preview(self, obj):
        """
        Get a preview of the value (truncated for long values)
        """
        if len(obj.value) > 50:
            return f"{obj.value[:50]}..."
        return obj.value


class SettingValueSerializer(serializers.Serializer):
    """
    Serializer for setting values with type conversion
    """
    
    value = serializers.CharField()
    as_type = serializers.ChoiceField(
        choices=['string', 'int', 'float', 'bool', 'json', 'list'],
        default='string',
        required=False
    )
    
    def to_representation(self, instance):
        """
        Convert value based on as_type parameter
        """
        data = super().to_representation(instance)
        value = data['value']
        as_type = data.get('as_type', 'string')
        
        try:
            if as_type == 'int':
                data['converted_value'] = int(value)
            elif as_type == 'float':
                data['converted_value'] = float(value)
            elif as_type == 'bool':
                data['converted_value'] = value.lower() in ('true', '1', 'yes', 'on')
            elif as_type == 'json':
                import json
                data['converted_value'] = json.loads(value)
            elif as_type == 'list':
                data['converted_value'] = [item.strip() for item in value.split(',') if item.strip()]
            else:
                data['converted_value'] = value
        except (ValueError, TypeError, AttributeError):
            data['converted_value'] = None
            data['conversion_error'] = f"Could not convert '{value}' to {as_type}"
        
        return data


class SettingsExportSerializer(serializers.Serializer):
    """
    Serializer for settings export
    """
    
    format = serializers.ChoiceField(
        choices=['json', 'csv'],
        default='json'
    )
    
    include_descriptions = serializers.BooleanField(default=True)
    include_timestamps = serializers.BooleanField(default=False)


class SettingsImportSerializer(serializers.Serializer):
    """
    Serializer for settings import
    """
    
    settings_data = serializers.CharField(
        help_text="JSON string containing settings to import"
    )
    
    overwrite_existing = serializers.BooleanField(
        default=False,
        help_text="Whether to overwrite existing settings"
    )
    
    def validate_settings_data(self, value):
        """
        Validate JSON format
        """
        try:
            import json
            data = json.loads(value)
            
            if not isinstance(data, list):
                raise serializers.ValidationError("Settings data must be a JSON array.")
            
            for item in data:
                if not isinstance(item, dict):
                    raise serializers.ValidationError("Each setting must be a JSON object.")
                
                if 'key' not in item or 'value' not in item:
                    raise serializers.ValidationError("Each setting must have 'key' and 'value' fields.")
            
            return value
        except json.JSONDecodeError as e:
            raise serializers.ValidationError(f"Invalid JSON format: {e}")


class SettingsCategorySerializer(serializers.Serializer):
    """
    Serializer for grouped settings by category
    """
    
    category = serializers.CharField()
    settings = SystemSettingListSerializer(many=True)
    count = serializers.IntegerField()


class SettingsStatsSerializer(serializers.Serializer):
    """
    Serializer for settings statistics
    """
    
    total_settings = serializers.IntegerField()
    categories = serializers.DictField()
    recent_updates = serializers.IntegerField()
    last_update = serializers.DateTimeField(allow_null=True)


class BulkSettingsUpdateSerializer(serializers.Serializer):
    """
    Serializer for bulk settings updates
    """
    
    settings = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of settings to update with key and value"
    )
    
    def validate_settings(self, value):
        """
        Validate bulk settings data
        """
        if not value:
            raise serializers.ValidationError("Settings list cannot be empty.")
        
        for setting in value:
            if not isinstance(setting, dict):
                raise serializers.ValidationError("Each setting must be a dictionary.")
            
            if 'key' not in setting:
                raise serializers.ValidationError("Each setting must have a 'key' field.")
            
            if 'value' not in setting:
                raise serializers.ValidationError("Each setting must have a 'value' field.")
            
            # Validate key format
            key = setting['key']
            if not key.replace('_', '').replace('.', '').replace('-', '').isalnum():
                raise serializers.ValidationError(
                    f"Invalid key format: {key}. Must contain only alphanumeric characters, underscores, dots, and hyphens."
                )
        
        return value


class SettingsSearchSerializer(serializers.Serializer):
    """
    Serializer for settings search parameters
    """
    
    query = serializers.CharField(
        max_length=255,
        required=False,
        help_text="Search term for key, value, or description"
    )
    
    category = serializers.CharField(
        max_length=50,
        required=False,
        help_text="Filter by category prefix (e.g., 'maintenance', 'quality')"
    )
    
    updated_since = serializers.DateTimeField(
        required=False,
        help_text="Filter settings updated since this date"
    )
