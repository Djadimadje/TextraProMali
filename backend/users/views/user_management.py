"""
User management views for TexPro AI
Admin-only user CRUD operations
"""
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from ..models import User
from ..serializers import (
    UserListSerializer,
    UserDetailSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    UserPasswordResetSerializer
)
from ..permissions import IsAdmin, IsSupervisor
import logging

logger = logging.getLogger('texproai.users')


class UserViewSet(ModelViewSet):
    """
    Admin-only User Management ViewSet
    
    GET /api/v1/users/ - List all users
    POST /api/v1/users/ - Create new user
    GET /api/v1/users/{id}/ - Get user details
    PUT /api/v1/users/{id}/ - Update user
    DELETE /api/v1/users/{id}/ - Delete user
    """
    queryset = User.objects.all()
    permission_classes = [IsAdmin]

    def get_permissions(self):
        """Allow supervisors to create users, keep admin-only for other actions"""
        # Allow supervisors to create users and to list users (read-only view)
        if self.action in ('create', 'list'):
            return [IsSupervisor()]
        return [IsAdmin()]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return UserListSerializer
        elif self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        else:
            return UserDetailSerializer
    
    def get_queryset(self):
        """
        Filter and search users
        """
        queryset = User.objects.all().select_related('supervisor', 'created_by')
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(employee_id__icontains=search)
            )
        
        # Filter by role
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by department
        department = self.request.query_params.get('department')
        if department:
            queryset = queryset.filter(department__icontains=department)
        
        # Filter by site
        site = self.request.query_params.get('site')
        if site:
            queryset = queryset.filter(site_location__icontains=site)
        
        # Filter by supervisor
        supervisor_id = self.request.query_params.get('supervisor')
        if supervisor_id:
            queryset = queryset.filter(supervisor_id=supervisor_id)
        
        # Ordering
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering:
            queryset = queryset.order_by(ordering)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """List users with pagination and filtering"""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            
            # Pagination
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                response_data = self.get_paginated_response(serializer.data)
                
                return Response({
                    'success': True,
                    'message': 'Users retrieved successfully',
                    'data': response_data.data
                }, status=status.HTTP_200_OK)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'success': True,
                'message': 'Users retrieved successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"User list error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve users'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def create(self, request, *args, **kwargs):
        """Create new user"""
        try:
            # Log the incoming request data for debugging
            logger.info(f"User creation request from {request.user.username}")
            logger.info(f"Request data: {request.data}")
            
            serializer = self.get_serializer(data=request.data)
            
            if serializer.is_valid():
                user = serializer.save()
                logger.info(f"User created successfully: {user.username}")

                # Return user details
                detail_serializer = UserDetailSerializer(user, context={'request': request})

                return Response({
                    'success': True,
                    'message': 'User created successfully',
                    'data': detail_serializer.data
                }, status=status.HTTP_201_CREATED)
            
            # Log validation errors for debugging
            logger.warning(f"User creation validation failed: {serializer.errors}")
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.exception("User creation error")
            return Response({
                'success': False,
                'message': 'Failed to create user',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def retrieve(self, request, *args, **kwargs):
        """Get user details"""
        try:
            user = self.get_object()
            serializer = self.get_serializer(user)
            
            return Response({
                'success': True,
                'message': 'User details retrieved successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"User retrieve error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve user details'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def update(self, request, *args, **kwargs):
        """Update user"""
        try:
            user = self.get_object()
            
            # Prevent self-modification of critical fields
            if user == request.user:
                restricted_fields = ['role', 'status', 'is_active']
                for field in restricted_fields:
                    if field in request.data:
                        return Response({
                            'success': False,
                            'message': f'You cannot modify your own {field}'
                        }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = self.get_serializer(user, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                
                # Return updated user details
                detail_serializer = UserDetailSerializer(user, context={'request': request})
                
                return Response({
                    'success': True,
                    'message': 'User updated successfully',
                    'data': detail_serializer.data
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"User update error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to update user'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def destroy(self, request, *args, **kwargs):
        """Delete user (soft delete by deactivating)"""
        try:
            user = self.get_object()
            
            # Prevent self-deletion
            if user == request.user:
                return Response({
                    'success': False,
                    'message': 'You cannot delete your own account'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user has subordinates
            if user.get_subordinates().exists():
                return Response({
                    'success': False,
                    'message': 'Cannot delete user with active subordinates. Reassign them first.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Soft delete: deactivate user instead of hard delete
            user.status = User.Status.INACTIVE
            user.is_active = False
            user.save()
            
            logger.info(f"User deactivated: {user.username} by {request.user}")
            
            return Response({
                'success': True,
                'message': 'User deactivated successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"User deletion error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to delete user'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a user account"""
        try:
            user = self.get_object()
            
            if user.status == User.Status.ACTIVE:
                return Response({
                    'success': False,
                    'message': 'User is already active'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.status = User.Status.ACTIVE
            user.is_active = True
            user.save()
            
            logger.info(f"User activated: {user.username} by {request.user}")
            
            return Response({
                'success': True,
                'message': 'User activated successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"User activation error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to activate user'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a user account"""
        try:
            user = self.get_object()
            
            # Prevent self-deactivation
            if user == request.user:
                return Response({
                    'success': False,
                    'message': 'You cannot deactivate your own account'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.status = User.Status.INACTIVE
            user.is_active = False
            user.save()
            
            logger.info(f"User deactivated: {user.username} by {request.user}")
            
            return Response({
                'success': True,
                'message': 'User deactivated successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"User deactivation error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to deactivate user'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Admin reset user password"""
        try:
            user = self.get_object()
            
            serializer = UserPasswordResetSerializer(
                data=request.data,
                context={'user': user, 'request': request}
            )
            
            if serializer.is_valid():
                serializer.save()
                
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
            logger.error(f"Password reset error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to reset password'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def unlock_account(self, request, pk=None):
        """Unlock a locked user account"""
        try:
            user = self.get_object()
            
            if not user.is_account_locked:
                return Response({
                    'success': False,
                    'message': 'Account is not locked'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.reset_login_attempts()
            
            logger.info(f"Account unlocked: {user.username} by {request.user}")
            
            return Response({
                'success': True,
                'message': 'Account unlocked successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Account unlock error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to unlock account'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserStatsView(APIView):
    """
    GET /api/v1/users/stats/
    Get user statistics for admin dashboard
    """
    permission_classes = [IsAdmin]
    
    def get(self, request):
        try:
            stats = {
                'total_users': User.objects.count(),
                'active_users': User.objects.filter(status=User.Status.ACTIVE).count(),
                'pending_users': User.objects.filter(status=User.Status.PENDING).count(),
                'inactive_users': User.objects.filter(status=User.Status.INACTIVE).count(),
                'locked_users': User.objects.filter(
                    locked_until__gt=timezone.now()
                ).count(),
                'by_role': {},
                'by_department': {},
                'by_site': {},
                'recent_logins': User.objects.filter(
                    last_login__gte=timezone.now() - timezone.timedelta(days=7)
                ).count(),
            }
            
            # Users by role
            for role_choice in User.Role.choices:
                role_value, role_label = role_choice
                stats['by_role'][role_value] = User.objects.filter(role=role_value).count()
            
            # Users by department (top 5)
            departments = User.objects.exclude(department='').values_list(
                'department', flat=True
            ).distinct()[:5]
            for dept in departments:
                stats['by_department'][dept] = User.objects.filter(department=dept).count()
            
            # Users by site (top 5)
            sites = User.objects.exclude(site_location='').values_list(
                'site_location', flat=True
            ).distinct()[:5]
            for site in sites:
                stats['by_site'][site] = User.objects.filter(site_location=site).count()
            
            return Response({
                'success': True,
                'message': 'User statistics retrieved successfully',
                'data': stats
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"User stats error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to retrieve user statistics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
