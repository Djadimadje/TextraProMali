"""
Authentication serializers for TexPro AI
JWT login, logout, refresh, password reset functionality
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.conf import settings
from ..models import User, PasswordResetToken
import logging

logger = logging.getLogger('texproai.auth')


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer with additional user info
    """
    
    def validate(self, attrs):
        # Get username/password
        username = attrs.get('username')
        password = attrs.get('password')
        
        # Try to get user
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            logger.warning(f"Login attempt with non-existent username: {username}")
            raise serializers.ValidationError('Invalid credentials')
        
        # Check if account is locked
        if user.is_account_locked:
            logger.warning(f"Login attempt on locked account: {username}")
            raise serializers.ValidationError(
                'Account is temporarily locked due to multiple failed login attempts. '
                'Please try again later.'
            )
        
        # Check if account is active
        if not user.is_active_user:
            logger.warning(f"Login attempt on inactive account: {username}")
            raise serializers.ValidationError('Account is not active')
        
        # Authenticate user
        user = authenticate(username=username, password=password)
        if not user:
            # Increment failed login attempts
            try:
                user_obj = User.objects.get(username=username)
                user_obj.increment_login_attempts()
            except User.DoesNotExist:
                pass
            
            logger.warning(f"Failed login attempt for: {username}")
            raise serializers.ValidationError('Invalid credentials')
        
        # Reset login attempts on successful login
        user.reset_login_attempts()
        user.update_last_activity()
        
        # Get tokens
        refresh = self.get_token(user)
        
        logger.info(f"Successful login: {user.username}")
        
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'employee_id': user.employee_id,
                'department': user.department,
                'site_location': user.site_location,
                'avatar': user.avatar.url if user.avatar else None,
                'last_login': user.last_login,
            }
        }
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['role'] = user.role
        token['employee_id'] = user.employee_id
        token['is_admin'] = user.is_admin
        
        return token


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile info (GET /api/v1/auth/me/)
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    display_name = serializers.CharField(source='get_display_name', read_only=True)
    avatar_url = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'display_name', 'role', 'status',
            'employee_id', 'phone_number', 'department', 'site_location',
            'avatar_url', 'bio', 'last_login', 'last_activity',
            'created_at', 'permissions'
        ]
        read_only_fields = ['id', 'username', 'last_login', 'created_at']
    
    def get_avatar_url(self, obj):
        """Get avatar URL"""
        if obj.avatar:
            return self.context['request'].build_absolute_uri(obj.avatar.url)
        return None
    
    def get_permissions(self, obj):
        """Get user permissions based on role"""
        return {
            'can_manage_users': obj.can_manage_users,
            'can_supervise': obj.can_supervise,
            'can_access_admin_apis': obj.can_access_admin_apis,
            'is_admin': obj.is_admin,
            'is_supervisor': obj.is_supervisor,
            'is_technician': obj.is_technician,
            'is_inspector': obj.is_inspector,
            'is_analyst': obj.is_analyst,
        }


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing password (authenticated users)
    """
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)
    
    def validate_current_password(self, value):
        """Validate current password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect')
        return value
    
    def validate_new_password(self, value):
        """Validate new password strength"""
        try:
            validate_password(value, self.context['request'].user)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("New passwords don't match")
        
        if attrs['current_password'] == attrs['new_password']:
            raise serializers.ValidationError("New password must be different from current password")
        
        return attrs
    
    def save(self):
        """Change user password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        
        logger.info(f"Password changed for user: {user.username}")
        return user


class ForgotPasswordSerializer(serializers.Serializer):
    """
    Serializer for forgot password request
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Validate email exists"""
        try:
            user = User.objects.get(email=value, is_active=True)
            if not user.is_active_user:
                raise serializers.ValidationError('Account is not active')
        except User.DoesNotExist:
            # Don't reveal if email exists or not for security
            pass
        return value
    
    def save(self):
        """Create password reset token and send email"""
        email = self.validated_data['email']
        
        try:
            user = User.objects.get(email=email, is_active=True)
            if user.is_active_user:
                # Create reset token
                reset_token = PasswordResetToken.create_token(
                    user=user,
                    email=email,
                    request=self.context.get('request')
                )
                
                # For MVP: Log reset link to console (simulate email)
                reset_url = reset_token.get_reset_url()
                print("\n" + "="*60)
                print("🔐 PASSWORD RESET EMAIL (Console Simulation)")
                print("="*60)
                print(f"To: {email}")
                print(f"User: {user.get_display_name()}")
                print(f"Reset Link: {reset_url}")
                print(f"Token: {reset_token.token}")
                print(f"Expires: {reset_token.expires_at}")
                print("="*60 + "\n")
                
                logger.info(f"Password reset requested for: {email}")
                return reset_token
                
        except User.DoesNotExist:
            # Log the attempt but don't reveal user doesn't exist
            logger.warning(f"Password reset requested for non-existent email: {email}")
        
        return None


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer for password reset with token
    """
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)
    
    def validate_token(self, value):
        """Validate reset token"""
        try:
            reset_token = PasswordResetToken.objects.get(token=value)
            if not reset_token.is_valid:
                if reset_token.is_expired:
                    raise serializers.ValidationError('Reset token has expired')
                elif reset_token.is_used:
                    raise serializers.ValidationError('Reset token has already been used')
            
            self.reset_token = reset_token
            return value
            
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError('Invalid reset token')
    
    def validate_new_password(self, value):
        """Validate new password strength"""
        try:
            # Get user from token for password validation context
            if hasattr(self, 'reset_token'):
                validate_password(value, self.reset_token.user)
            else:
                validate_password(value)
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
        user = self.reset_token.user
        user.set_password(self.validated_data['new_password'])
        user.save()
        
        # Mark token as used
        self.reset_token.mark_as_used()
        
        logger.info(f"Password reset completed for user: {user.username}")
        return user
