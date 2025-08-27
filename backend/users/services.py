"""
Business logic services for TexPro AI users app
Textile Manufacturing Optimization System
"""

import secrets
import string
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from django.contrib.auth import get_user_model, authenticate
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from .models import PasswordResetToken

User = get_user_model()


class AuthService:
    """
    Service class for authentication operations
    """
    
    @staticmethod
    def authenticate_user(email: str, password: str) -> Optional[User]:
        """
        Authenticate user with email and password
        """
        try:
            user = User.objects.get(email=email, is_active=True)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            pass
        return None
    
    @staticmethod
    def generate_tokens(user: User) -> Dict[str, str]:
        """
        Generate JWT tokens for user
        """
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    
    @staticmethod
    def blacklist_token(refresh_token: str) -> bool:
        """
        Blacklist a refresh token
        """
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return True
        except Exception:
            return False


class UserService:
    """
    Service class for user management operations
    """
    
    @staticmethod
    def create_user(user_data: Dict[str, Any]) -> User:
        """
        Create a new user with validation
        """
        with transaction.atomic():
            # Generate temporary password if not provided
            if 'password' not in user_data:
                user_data['password'] = UserService._generate_temporary_password()
            
            # Create user
            user = User.objects.create_user(
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', ''),
                role=user_data.get('role', 'technician'),
                phone=user_data.get('phone', ''),
                department=user_data.get('department', ''),
            )
            
            return user
    
    @staticmethod
    def update_user(user: User, user_data: Dict[str, Any]) -> User:
        """
        Update user with validation
        """
        with transaction.atomic():
            # Update allowed fields
            allowed_fields = [
                'first_name', 'last_name', 'phone', 
                'department', 'role', 'is_active'
            ]
            
            for field in allowed_fields:
                if field in user_data:
                    setattr(user, field, user_data[field])
            
            user.full_clean()
            user.save()
            
            return user
    
    @staticmethod
    def change_password(user: User, old_password: str, new_password: str) -> bool:
        """
        Change user password with validation
        """
        if not user.check_password(old_password):
            raise ValidationError("Current password is incorrect")
        
        user.set_password(new_password)
        user.save()
        return True
    
    @staticmethod
    def get_user_stats() -> Dict[str, Any]:
        """
        Get user statistics for dashboard
        """
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        
        # Count users by role
        role_counts = {}
        for role_choice in User.ROLE_CHOICES:
            role = role_choice[0]
            count = User.objects.filter(role=role).count()
            role_counts[role] = count
        
        return {
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': total_users - active_users,
            'role_distribution': role_counts,
            'recent_signups': User.objects.filter(
                date_joined__gte=timezone.now() - timedelta(days=30)
            ).count()
        }
    
    @staticmethod
    def get_users_by_role(role: str) -> List[User]:
        """
        Get all users with a specific role
        """
        return User.objects.filter(role=role, is_active=True)
    
    @staticmethod
    def deactivate_user(user: User) -> User:
        """
        Deactivate user (soft delete)
        """
        user.is_active = False
        user.save()
        return user
    
    @staticmethod
    def activate_user(user: User) -> User:
        """
        Activate user
        """
        user.is_active = True
        user.save()
        return user
    
    @staticmethod
    def _generate_temporary_password(length: int = 12) -> str:
        """
        Generate a secure temporary password
        """
        characters = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(secrets.choice(characters) for _ in range(length))


class PasswordResetService:
    """
    Service class for password reset operations
    """
    
    @staticmethod
    def initiate_password_reset(email: str) -> Optional[PasswordResetToken]:
        """
        Initiate password reset process
        """
        try:
            user = User.objects.get(email=email, is_active=True)
            
            # Invalidate existing tokens
            PasswordResetToken.objects.filter(user=user).delete()
            
            # Create new reset token
            reset_token = PasswordResetToken.objects.create(user=user)
            
            # In a real application, send email here
            # For MVP, we'll just log the token (simulation)
            print(f"Password reset token for {email}: {reset_token.token}")
            
            return reset_token
            
        except User.DoesNotExist:
            # Don't reveal if email exists or not
            return None
    
    @staticmethod
    def validate_reset_token(token: str) -> Optional[PasswordResetToken]:
        """
        Validate password reset token
        """
        try:
            reset_token = PasswordResetToken.objects.get(
                token=token,
                is_used=False
            )
            
            if reset_token.is_expired():
                return None
                
            return reset_token
            
        except PasswordResetToken.DoesNotExist:
            return None
    
    @staticmethod
    def reset_password(token: str, new_password: str) -> bool:
        """
        Reset password using token
        """
        reset_token = PasswordResetService.validate_reset_token(token)
        
        if not reset_token:
            return False
        
        with transaction.atomic():
            # Update password
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            # Mark token as used
            reset_token.is_used = True
            reset_token.used_at = timezone.now()
            reset_token.save()
            
            return True
    
    @staticmethod
    def cleanup_expired_tokens():
        """
        Clean up expired password reset tokens
        """
        expired_tokens = PasswordResetToken.objects.filter(
            created_at__lt=timezone.now() - timedelta(hours=24)
        )
        count = expired_tokens.count()
        expired_tokens.delete()
        return count


class NotificationService:
    """
    Service class for handling notifications (MVP simulation)
    """
    
    @staticmethod
    def send_password_reset_email(user: User, reset_token: str) -> bool:
        """
        Simulate sending password reset email
        In production, this would integrate with email service
        """
        # For MVP, just log the action
        print(f"[EMAIL SIMULATION] Password reset email sent to {user.email}")
        print(f"Reset token: {reset_token}")
        return True
    
    @staticmethod
    def send_welcome_email(user: User, temporary_password: str = None) -> bool:
        """
        Simulate sending welcome email to new user
        """
        print(f"[EMAIL SIMULATION] Welcome email sent to {user.email}")
        if temporary_password:
            print(f"Temporary password: {temporary_password}")
        return True
    
    @staticmethod
    def send_account_status_email(user: User, status: str) -> bool:
        """
        Simulate sending account status change email
        """
        print(f"[EMAIL SIMULATION] Account {status} notification sent to {user.email}")
        return True


class SecurityService:
    """
    Service class for security-related operations
    """
    
    @staticmethod
    def log_user_activity(user: User, action: str, details: str = None):
        """
        Log user activity for audit purposes
        In production, this would integrate with logging service
        """
        timestamp = timezone.now().isoformat()
        print(f"[AUDIT LOG] {timestamp} - User: {user.email} - Action: {action}")
        if details:
            print(f"Details: {details}")
    
    @staticmethod
    def check_password_strength(password: str) -> Dict[str, Any]:
        """
        Check password strength and return feedback
        """
        issues = []
        score = 0
        
        if len(password) >= 8:
            score += 1
        else:
            issues.append("Password must be at least 8 characters long")
        
        if any(c.isupper() for c in password):
            score += 1
        else:
            issues.append("Password must contain at least one uppercase letter")
        
        if any(c.islower() for c in password):
            score += 1
        else:
            issues.append("Password must contain at least one lowercase letter")
        
        if any(c.isdigit() for c in password):
            score += 1
        else:
            issues.append("Password must contain at least one number")
        
        if any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            score += 1
        else:
            issues.append("Password must contain at least one special character")
        
        strength_levels = {
            0: "Very Weak",
            1: "Weak", 
            2: "Fair",
            3: "Good",
            4: "Strong",
            5: "Very Strong"
        }
        
        return {
            'score': score,
            'strength': strength_levels[score],
            'is_strong': score >= 4,
            'issues': issues
        }
