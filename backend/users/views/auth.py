"""
Authentication views for TexPro AI
JWT login, logout, refresh, password reset functionality
"""
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from django.contrib.auth import logout
from django.utils import timezone
from django.utils.timezone import make_aware
import datetime
from ..serializers import (
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer
)
from ..models import User, PasswordResetToken
import logging

logger = logging.getLogger('texproai.auth')


class LoginView(TokenObtainPairView):
    """
    POST /api/v1/auth/login/
    User login with JWT tokens
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            
            if response.status_code == 200:
                # Extract user info from response
                user_data = response.data.get('user', {})
                username = user_data.get('username')
                
                logger.info(f"Successful login: {username}")
                
                return Response({
                    'success': True,
                    'message': 'Login successful',
                    'data': response.data
                }, status=status.HTTP_200_OK)
            
            return response
            
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Login failed',
                'errors': ['Invalid credentials']
            }, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/
    Logout user and blacklist refresh token
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Get refresh token from request
            refresh_token = request.data.get('refresh')
            
            if not refresh_token:
                return Response({
                    'success': False,
                    'message': 'Refresh token is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Blacklist the refresh token
            try:
                token = RefreshToken(refresh_token)
                # Use the proper blacklist method
                BlacklistedToken.objects.get_or_create(token=OutstandingToken.objects.get(token=refresh_token))
            except (TokenError, OutstandingToken.DoesNotExist) as e:
                # If token doesn't exist in outstanding tokens, create it and blacklist
                try:
                    token = RefreshToken(refresh_token)
                    outstanding_token, created = OutstandingToken.objects.get_or_create(
                        token=refresh_token,
                        defaults={
                            'user': request.user,
                            'jti': token['jti'],
                            'created_at': timezone.now(),
                            'expires_at': make_aware(datetime.datetime.fromtimestamp(token['exp']))
                        }
                    )
                    BlacklistedToken.objects.get_or_create(token=outstanding_token)
                except Exception as inner_e:
                    logger.warning(f"Could not blacklist token: {str(inner_e)}")
                    pass  # Continue with logout even if blacklisting fails
            except Exception as e:
                logger.warning(f"Token blacklist error: {str(e)}")
                pass  # Continue with logout even if blacklisting fails
            
            # Log the logout
            logger.info(f"User logged out: {request.user.username}")
            
            return Response({
                'success': True,
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Logout failed'
            }, status=status.HTTP_400_BAD_REQUEST)


class RefreshTokenView(TokenRefreshView):
    """
    POST /api/v1/auth/refresh/
    Refresh access token using refresh token
    """
    
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            
            if response.status_code == 200:
                return Response({
                    'success': True,
                    'message': 'Token refreshed successfully',
                    'data': response.data
                }, status=status.HTTP_200_OK)
            
            return response
            
        except InvalidToken as e:
            return Response({
                'success': False,
                'message': 'Invalid or expired refresh token',
                'errors': [str(e)]
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.error(f"Token refresh error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Token refresh failed'
            }, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """
    GET /api/v1/auth/me/
    Get current user profile information
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # Update last activity
            request.user.update_last_activity()
            
            serializer = UserProfileSerializer(request.user, context={'request': request})
            
            return Response({
                'success': True,
                'message': 'User profile retrieved successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Profile retrieval error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve profile'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        """
        Update current user profile (limited fields)
        """
        try:
            # Allow users to update only certain fields
            allowed_fields = [
                'first_name', 'last_name', 'email', 'phone_number', 
                'bio', 'avatar'
            ]
            
            # Filter request data to allowed fields
            update_data = {
                key: value for key, value in request.data.items() 
                if key in allowed_fields
            }
            
            serializer = UserProfileSerializer(
                request.user, 
                data=update_data, 
                partial=True,
                context={'request': request}
            )
            
            if serializer.is_valid():
                serializer.save()
                
                logger.info(f"Profile updated: {request.user.username}")
                
                return Response({
                    'success': True,
                    'message': 'Profile updated successfully',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Profile update error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to update profile'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChangePasswordView(APIView):
    """
    POST /api/v1/auth/change-password/
    Change password for authenticated user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            serializer = ChangePasswordSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                serializer.save()
                
                return Response({
                    'success': True,
                    'message': 'Password changed successfully'
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Password change error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to change password'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ForgotPasswordView(APIView):
    """
    POST /api/v1/auth/forgot-password/
    Request password reset link
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            serializer = ForgotPasswordSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                reset_token = serializer.save()
                
                # Always return success for security (don't reveal if email exists)
                return Response({
                    'success': True,
                    'message': 'If the email exists, a password reset link has been sent'
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Forgot password error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to process request'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResetPasswordView(APIView):
    """
    POST /api/v1/auth/reset-password/
    Reset password using token
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            serializer = ResetPasswordSerializer(data=request.data)
            
            if serializer.is_valid():
                user = serializer.save()
                
                return Response({
                    'success': True,
                    'message': 'Password reset successfully'
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Reset password error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to reset password'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def validate_reset_token(request):
    """
    GET /api/v1/auth/validate-token/?token=xxx
    Validate if reset token is valid (for frontend)
    """
    try:
        token = request.GET.get('token')
        
        if not token:
            return Response({
                'success': False,
                'message': 'Token parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
            
            if reset_token.is_valid:
                return Response({
                    'success': True,
                    'message': 'Token is valid',
                    'data': {
                        'email': reset_token.email,
                        'expires_at': reset_token.expires_at
                    }
                }, status=status.HTTP_200_OK)
            else:
                error_msg = 'Token has expired' if reset_token.is_expired else 'Token has been used'
                return Response({
                    'success': False,
                    'message': error_msg
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except PasswordResetToken.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Token validation error: {str(e)}")
        return Response({
            'success': False,
            'message': 'Failed to validate token'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
