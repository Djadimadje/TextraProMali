"""
Notification views for TexPro AI
API endpoints for notification management
"""

from django.db.models import Q, Count, Case, When
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta

from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView

from ..models import Notification, NotificationPreference
from ..serializers import (
    NotificationSerializer,
    NotificationCreateSerializer,
    NotificationListSerializer,
    NotificationPreferenceSerializer,
    NotificationStatsSerializer,
    BulkMarkReadSerializer,
    NotificationFilterSerializer,
)
from ..services import NotificationService
from ..permissions import NotificationPermission

User = get_user_model()


class NotificationViewSet(ModelViewSet):
    """
    ViewSet for managing notifications
    """
    
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated, NotificationPermission]
    filterset_fields = ['type', 'priority', 'is_read']
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'priority', 'is_read']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Return notifications for the current user
        """
        user = self.request.user
        
        # Admins can see all notifications with recipient filter
        if user.role == 'admin':
            recipient_id = self.request.query_params.get('recipient')
            if recipient_id:
                return Notification.objects.filter(recipient_id=recipient_id)
            return Notification.objects.all()
        
        # Regular users see only their own notifications
        return Notification.objects.filter(recipient=user)
    
    def get_serializer_class(self):
        """
        Return appropriate serializer based on action
        """
        if self.action == 'list':
            return NotificationListSerializer
        elif self.action == 'create':
            return NotificationCreateSerializer
        return NotificationSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Create and send notifications (admin only)
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        title = data['title']
        message = data['message']
        notification_type = data.get('type', 'system')
        priority = data.get('priority', 'normal')
        
        # Determine recipients
        recipients = []
        
        if data.get('send_to_all'):
            recipients = User.objects.filter(is_active=True)
        elif data.get('send_to_role'):
            recipients = User.objects.filter(
                role=data['send_to_role'],
                is_active=True
            )
        elif data.get('recipient_ids'):
            recipients = User.objects.filter(
                id__in=data['recipient_ids'],
                is_active=True
            )
        
        # Create notifications
        created_notifications = []
        for recipient in recipients:
            notification = NotificationService.create_notification(
                recipient=recipient,
                title=title,
                message=message,
                notification_type=notification_type,
                priority=priority,
                sent_by=request.user
            )
            if notification:
                created_notifications.append(notification)
        
        # Return response
        return Response({
            'message': f'Notifications sent to {len(created_notifications)} users',
            'count': len(created_notifications)
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        Mark a notification as read
        """
        notification = self.get_object()
        notification.mark_as_read()
        
        return Response({
            'message': 'Notification marked as read',
            'is_read': notification.is_read,
            'read_at': notification.read_at
        })
    
    @action(detail=True, methods=['post'])
    def mark_unread(self, request, pk=None):
        """
        Mark a notification as unread
        """
        notification = self.get_object()
        notification.mark_as_unread()
        
        return Response({
            'message': 'Notification marked as unread',
            'is_read': notification.is_read
        })
    
    @action(detail=False, methods=['post'])
    def bulk_mark_read(self, request):
        """
        Mark multiple notifications as read
        """
        serializer = BulkMarkReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        user = request.user
        
        if data.get('mark_all'):
            # Mark all user's notifications as read
            count = Notification.mark_all_as_read(user)
        else:
            # Mark specific notifications as read
            notification_ids = data['notification_ids']
            notifications = self.get_queryset().filter(
                id__in=notification_ids,
                is_read=False
            )
            
            count = 0
            for notification in notifications:
                notification.mark_as_read()
                count += 1
        
        return Response({
            'message': f'Marked {count} notifications as read',
            'count': count
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get notification statistics for the current user
        """
        user = request.user
        queryset = self.get_queryset()
        
        # Basic counts
        total = queryset.count()
        unread = queryset.filter(is_read=False).count()
        read = total - unread
        
        # By type
        type_counts = queryset.aggregate(
            workflow_count=Count(Case(When(type='workflow', then=1))),
            machine_count=Count(Case(When(type='machine', then=1))),
            maintenance_count=Count(Case(When(type='maintenance', then=1))),
            quality_count=Count(Case(When(type='quality', then=1))),
            allocation_count=Count(Case(When(type='allocation', then=1))),
            system_count=Count(Case(When(type='system', then=1))),
        )
        
        # By priority
        priority_counts = queryset.aggregate(
            low_priority_count=Count(Case(When(priority='low', then=1))),
            normal_priority_count=Count(Case(When(priority='normal', then=1))),
            high_priority_count=Count(Case(When(priority='high', then=1))),
            critical_priority_count=Count(Case(When(priority='critical', then=1))),
        )
        
        # Recent notifications (last 24 hours)
        recent_cutoff = timezone.now() - timedelta(hours=24)
        recent = queryset.filter(created_at__gte=recent_cutoff).count()
        
        stats_data = {
            'total_notifications': total,
            'unread_notifications': unread,
            'read_notifications': read,
            'recent_notifications': recent,
            **type_counts,
            **priority_counts,
        }
        
        serializer = NotificationStatsSerializer(stats_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """
        Get count of unread notifications
        """
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get recent notifications (last 24 hours)
        """
        recent_cutoff = timezone.now() - timedelta(hours=24)
        recent_notifications = self.get_queryset().filter(
            created_at__gte=recent_cutoff
        )[:10]
        
        serializer = NotificationListSerializer(recent_notifications, many=True)
        return Response(serializer.data)


class NotificationPreferenceViewSet(ModelViewSet):
    """
    ViewSet for managing notification preferences
    """
    
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Return preferences for the current user
        """
        return NotificationPreference.objects.filter(user=self.request.user)
    
    def get_object(self):
        """
        Get or create notification preferences for the current user
        """
        preference, created = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preference
    
    def list(self, request, *args, **kwargs):
        """
        Return user's notification preferences
        """
        preference = self.get_object()
        serializer = self.get_serializer(preference)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """
        Update user's notification preferences
        """
        preference = self.get_object()
        serializer = self.get_serializer(
            preference,
            data=request.data,
            partial=kwargs.get('partial', False)
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Partially update user's notification preferences
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class NotificationFilterView(APIView):
    """
    View for advanced notification filtering
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Filter notifications based on criteria
        """
        serializer = NotificationFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        filters = serializer.validated_data
        user = request.user
        
        # Start with user's notifications
        queryset = Notification.objects.filter(recipient=user)
        
        # Apply filters
        if 'is_read' in filters:
            queryset = queryset.filter(is_read=filters['is_read'])
        
        if 'type' in filters:
            queryset = queryset.filter(type=filters['type'])
        
        if 'priority' in filters:
            queryset = queryset.filter(priority=filters['priority'])
        
        if 'days_back' in filters:
            cutoff_date = timezone.now() - timedelta(days=filters['days_back'])
            queryset = queryset.filter(created_at__gte=cutoff_date)
        
        if 'search' in filters:
            search_term = filters['search']
            queryset = queryset.filter(
                Q(title__icontains=search_term) |
                Q(message__icontains=search_term)
            )
        
        # Order by creation date (newest first)
        queryset = queryset.order_by('-created_at')
        
        # Paginate results
        page_size = min(int(request.query_params.get('page_size', 20)), 100)
        page = int(request.query_params.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = queryset.count()
        notifications = queryset[start:end]
        
        serializer = NotificationListSerializer(notifications, many=True)
        
        return Response({
            'results': serializer.data,
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        })


class SystemNotificationView(APIView):
    """
    View for system-wide notification operations (admin only)
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Get system notification statistics
        """
        # Check admin permission
        if request.user.role != 'admin':
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # System-wide statistics
        total_notifications = Notification.objects.count()
        total_users = User.objects.filter(is_active=True).count()
        
        # Recent activity (last 24 hours)
        recent_cutoff = timezone.now() - timedelta(hours=24)
        recent_notifications = Notification.objects.filter(
            created_at__gte=recent_cutoff
        ).count()
        
        # By type
        type_stats = Notification.objects.values('type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # By priority
        priority_stats = Notification.objects.values('priority').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Unread notifications per user
        unread_stats = User.objects.filter(is_active=True).annotate(
            unread_count=Count(
                'notifications',
                filter=Q(notifications__is_read=False)
            )
        ).values('username', 'unread_count').order_by('-unread_count')[:10]
        
        return Response({
            'total_notifications': total_notifications,
            'total_users': total_users,
            'recent_notifications': recent_notifications,
            'type_stats': type_stats,
            'priority_stats': priority_stats,
            'top_unread_users': unread_stats,
        })
    
    def post(self, request):
        """
        Send system-wide notification
        """
        # Check admin permission
        if request.user.role != 'admin':
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = NotificationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        # Use NotificationService to broadcast
        notifications = NotificationService.broadcast_notification(
            title=data['title'],
            message=data['message'],
            priority=data.get('priority', 'normal'),
            sent_by=request.user
        )
        
        return Response({
            'message': f'System notification sent to {len(notifications)} users',
            'count': len(notifications)
        }, status=status.HTTP_201_CREATED)
