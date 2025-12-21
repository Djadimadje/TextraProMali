"""
User management serializers for TexPro AI
Admin-only user CRUD operations
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from ..models import User
import logging

logger = logging.getLogger('texproai.users')


class UserBasicSerializer(serializers.ModelSerializer):
    """
    Basic user serializer for foreign key relationships
    Minimal fields for lightweight references
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    display_name = serializers.CharField(source='get_display_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'display_name', 'role', 'employee_id'
        ]
        read_only_fields = ['id', 'full_name', 'display_name']


class UserListSerializer(serializers.ModelSerializer):
    """
    Serializer for user list (GET /api/v1/users/)
    Lightweight serializer for listing users
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    avatar_url = serializers.SerializerMethodField()
    supervisor_name = serializers.CharField(source='supervisor.get_display_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_display_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'status', 'employee_id', 'department', 'site_location',
            'avatar_url', 'supervisor_name', 'created_by_name',
            'last_login', 'last_activity', 'created_at', 'is_active'
        ]
        read_only_fields = [
            'id', 'last_login', 'last_activity', 'created_at',
            'full_name', 'avatar_url', 'supervisor_name', 'created_by_name'
        ]
    
    def get_avatar_url(self, obj):
        """Get avatar URL"""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
        return None


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for user detail (GET /api/v1/users/{id}/)
    Complete user information
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    display_name = serializers.CharField(source='get_display_name', read_only=True)
    avatar_url = serializers.SerializerMethodField()
    supervisor_info = serializers.SerializerMethodField()
    created_by_info = serializers.SerializerMethodField()
    subordinates_count = serializers.SerializerMethodField()
    account_stats = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'display_name', 'role', 'status',
            'employee_id', 'phone_number', 'department', 'site_location',
            'avatar_url', 'bio', 'supervisor_info', 'created_by_info',
            'subordinates_count', 'account_stats',
            'is_active', 'last_login', 'last_activity',
            'created_at', 'updated_at', 'date_joined'
        ]
        read_only_fields = [
            'id', 'username', 'last_login', 'last_activity',
            'created_at', 'updated_at', 'date_joined',
            'full_name', 'display_name', 'avatar_url',
            'supervisor_info', 'created_by_info', 'subordinates_count', 'account_stats'
        ]
    
    def get_avatar_url(self, obj):
        """Get avatar URL"""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
        return None
    
    def get_supervisor_info(self, obj):
        """Get supervisor information"""
        if obj.supervisor:
            return {
                'id': obj.supervisor.id,
                'name': obj.supervisor.get_display_name(),
                'username': obj.supervisor.username,
                'role': obj.supervisor.role
            }
        return None
    
    def get_created_by_info(self, obj):
        """Get creator information"""
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'name': obj.created_by.get_display_name(),
                'username': obj.created_by.username,
                'role': obj.created_by.role
            }
        return None
    
    def get_subordinates_count(self, obj):
        """Get count of subordinates"""
        return obj.get_subordinates().count()
    
    def get_account_stats(self, obj):
        """Get account statistics"""
        return {
            'login_attempts': obj.login_attempts,
            'is_locked': obj.is_account_locked,
            'locked_until': obj.locked_until,
            'password_changed_at': obj.password_changed_at,
            'days_since_password_change': (
                (timezone.now() - obj.password_changed_at).days 
                if obj.password_changed_at else None
            )
        }


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users (POST /api/v1/users/)
    Admin-only operation
    """
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            # 'username' removed from required input fields, will be auto-generated
            'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name', 'role', 'status',
            'employee_id', 'phone_number', 'department', 'site_location',
            'supervisor', 'bio'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'username': {'required': False, 'read_only': True},
        }
    
    def validate_username(self, value):
        # Allow blank username, will be auto-generated
        return value
    
    def validate_email(self, value):
        """Validate email"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists')
        return value.lower()
    
    def validate_employee_id(self, value):
        """Validate employee ID"""
        if value and User.objects.filter(employee_id=value.upper()).exists():
            raise serializers.ValidationError('Employee ID already exists')
        return value
    
    def validate_password(self, value):
        """Validate password strength"""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value
    
    def validate_supervisor(self, value):
        """Validate supervisor selection"""
        if value:
            if not value.can_supervise:
                raise serializers.ValidationError(
                    'Supervisor must be an Admin or Supervisor role'
                )
            if not value.is_active_user:
                raise serializers.ValidationError('Supervisor must be an active user')
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        # Check password confirmation
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        
        # Note: Supervisor assignment is now optional during creation
        # It will be handled later through the allocation system
        return attrs
    
    def create(self, validated_data):
        """Create new user"""
        # Remove confirm_password from validated_data
        validated_data.pop('confirm_password', None)
        
        # Extract password
        password = validated_data.pop('password')
        
        # Auto-generate employee_id if not provided
        if not validated_data.get('employee_id'):
            validated_data['employee_id'] = self._generate_employee_id(validated_data.get('role'))
        
        # Auto-generate username
        validated_data['username'] = self._generate_username(validated_data)
        
        # Set created_by to current user
        validated_data['created_by'] = self.context['request'].user
        
        # Create user
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
        logger.info(f"User created: {user.username} (Employee ID: {user.employee_id}) by {self.context['request'].user}")
        return user
    
    def _generate_employee_id(self, role):
        """Generate unique employee ID based on role"""
        # Role prefixes
        role_prefixes = {
            User.Role.ADMIN: 'AD',
            User.Role.SUPERVISOR: 'SV', 
            User.Role.TECHNICIAN: 'TC',
            User.Role.INSPECTOR: 'IN',
            User.Role.ANALYST: 'AN'
        }
        
        prefix = role_prefixes.get(role, 'TC')  # Default to technician
        
        # Find the highest existing employee ID for this role
        existing_ids = User.objects.filter(
            employee_id__startswith=prefix
        ).values_list('employee_id', flat=True)
        
        # Extract numbers and find the next available
        numbers = []
        for emp_id in existing_ids:
            try:
                number = int(emp_id[2:])  # Remove prefix and convert to int
                numbers.append(number)
            except (ValueError, IndexError):
                continue
        
        # Get next number (start from 1001 for each role)
        next_number = max(numbers) + 1 if numbers else 1001
        
        return f"{prefix}{next_number:04d}"
    
    def _generate_username(self, validated_data):
        """Generate a unique username based on first/last name or employee_id"""
        base = (validated_data.get('first_name', '')[:1] + validated_data.get('last_name', '')).lower()
        base = ''.join(filter(str.isalnum, base))
        if not base:
            base = validated_data.get('employee_id', 'user').lower()
        username = base
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{counter}"
            counter += 1
        return username


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating users (PUT /api/v1/users/{id}/)
    Admin-only operation
    """
    
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'role', 'status',
            'employee_id', 'phone_number', 'department', 'site_location',
            'supervisor', 'bio', 'is_active'
        ]
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if self.instance and self.instance.email == value:
            return value
        
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists')
        return value.lower()
    
    def validate_employee_id(self, value):
        """Validate employee ID uniqueness"""
        if self.instance and self.instance.employee_id == value:
            return value
        
        if value and User.objects.filter(employee_id=value.upper()).exists():
            raise serializers.ValidationError('Employee ID already exists')
        return value
    
    def validate_supervisor(self, value):
        """Validate supervisor selection"""
        if value:
            if not value.can_supervise:
                raise serializers.ValidationError(
                    'Supervisor must be an Admin or Supervisor role'
                )
            if not value.is_active_user:
                raise serializers.ValidationError('Supervisor must be an active user')
            
            # Prevent circular supervision
            if value == self.instance:
                raise serializers.ValidationError('User cannot supervise themselves')
        
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        role = attrs.get('role', self.instance.role)
        supervisor = attrs.get('supervisor', self.instance.supervisor)
        
        # Admin users don't need supervisors
        if role == User.Role.ADMIN and supervisor:
            raise serializers.ValidationError(
                "Admin users should not have supervisors"
            )
        
        # Non-admin users need supervisors
        if role != User.Role.ADMIN and not supervisor:
            raise serializers.ValidationError(
                f"{role.title()} users must have a supervisor"
            )
        
        return attrs
    
    def update(self, instance, validated_data):
        """Update user"""
        # Track what changed
        changes = []
        for field, new_value in validated_data.items():
            old_value = getattr(instance, field)
            if old_value != new_value:
                changes.append(f"{field}: {old_value} -> {new_value}")
        
        # Update user
        user = super().update(instance, validated_data)
        
        if changes:
            logger.info(
                f"User updated: {user.username} by {self.context['request'].user}. "
                f"Changes: {', '.join(changes)}"
            )
        
        return user


class UserPasswordResetSerializer(serializers.Serializer):
    """
    Serializer for admin to reset user password
    """
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)
    notify_user = serializers.BooleanField(default=True)
    
    def validate_new_password(self, value):
        """Validate password strength"""
        try:
            # Get user from context for validation
            user = self.context.get('user')
            validate_password(value, user)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def save(self):
        """Reset user password"""
        user = self.context['user']
        admin = self.context['request'].user
        
        user.set_password(self.validated_data['new_password'])
        user.save()
        
        # Reset login attempts
        user.reset_login_attempts()
        
        logger.info(f"Password reset by admin: {user.username} by {admin.username}")
        
        # For MVP: Log password to console if notify_user is True
        if self.validated_data.get('notify_user', True):
            print("\n" + "="*60)
            print("🔑 PASSWORD RESET NOTIFICATION (Console Simulation)")
            print("="*60)
            print(f"User: {user.get_display_name()} ({user.username})")
            print(f"Email: {user.email}")
            print(f"Temporary Password: {self.validated_data['new_password']}")
            print(f"Reset by: {admin.get_display_name()}")
            print("Please change your password after logging in.")
            print("="*60 + "\n")
        
        return user
