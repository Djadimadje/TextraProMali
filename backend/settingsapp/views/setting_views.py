"""
Settings views for TexPro AI
API endpoints for system configuration management
"""

from django.db.models import Q, Count
from django.utils import timezone
from django.http import HttpResponse
from datetime import timedelta

from rest_framework import status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView

from ..models import SystemSetting
from ..serializers import (
    SystemSettingSerializer,
    SystemSettingCreateSerializer,
    SystemSettingUpdateSerializer,
    SystemSettingListSerializer,
    SettingValueSerializer,
    SettingsExportSerializer,
    SettingsImportSerializer,
    SettingsCategorySerializer,
    SettingsStatsSerializer,
    BulkSettingsUpdateSerializer,
    SettingsSearchSerializer,
)
from ..services import SettingsService
from ..permissions import SettingsPermission


class SystemSettingViewSet(ModelViewSet):
    """
    ViewSet for managing system settings
    Admin-only access for configuration management
    """
    
    queryset = SystemSetting.objects.all()
    permission_classes = [permissions.IsAuthenticated, SettingsPermission]
    lookup_field = 'key'
    lookup_value_regex = '[^/]+'  # Allow dots and other chars in key
    
    filterset_fields = ['key']
    search_fields = ['key', 'value', 'description']
    ordering_fields = ['key', 'updated_at', 'created_at']
    ordering = ['key']
    
    def get_serializer_class(self):
        """
        Return appropriate serializer based on action
        """
        if self.action == 'list':
            return SystemSettingListSerializer
        elif self.action == 'create':
            return SystemSettingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return SystemSettingUpdateSerializer
        return SystemSettingSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Create a new system setting
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create the setting
        setting = SystemSetting.objects.create(**serializer.validated_data)
        
        # Clear cache
        SettingsService.clear_cache()
        
        response_serializer = SystemSettingSerializer(setting)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        """
        Update an existing system setting
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Update the setting
        serializer.save()
        
        # Clear cache
        SettingsService.clear_cache()
        
        response_serializer = SystemSettingSerializer(instance)
        return Response(response_serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a system setting
        """
        instance = self.get_object()
        key = instance.key
        
        # Delete the setting
        instance.delete()
        
        # Clear cache
        SettingsService.clear_cache()
        
        return Response({
            'message': f'Setting "{key}" deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['get'])
    def value(self, request, key=None):
        """
        Get setting value with optional type conversion
        """
        setting = self.get_object()
        as_type = request.query_params.get('as_type', 'string')
        
        serializer = SettingValueSerializer(data={
            'value': setting.value,
            'as_type': as_type
        })
        serializer.is_valid(raise_exception=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """
        Get settings grouped by category
        """
        categories = {}
        
        # Group settings by category (first part before underscore)
        for setting in SystemSetting.objects.all():
            category = setting.key.split('_')[0] if '_' in setting.key else 'general'
            
            if category not in categories:
                categories[category] = []
            
            categories[category].append(setting)
        
        # Serialize each category
        category_data = []
        for category, settings in categories.items():
            serializer = SystemSettingListSerializer(settings, many=True)
            category_data.append({
                'category': category,
                'settings': serializer.data,
                'count': len(settings)
            })
        
        return Response(category_data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get settings statistics
        """
        total_settings = SystemSetting.objects.count()
        
        # Group by categories
        categories = {}
        for setting in SystemSetting.objects.all():
            category = setting.key.split('_')[0] if '_' in setting.key else 'general'
            categories[category] = categories.get(category, 0) + 1
        
        # Recent updates (last 24 hours)
        recent_cutoff = timezone.now() - timedelta(hours=24)
        recent_updates = SystemSetting.objects.filter(
            updated_at__gte=recent_cutoff
        ).count()
        
        # Last update time
        last_setting = SystemSetting.objects.order_by('-updated_at').first()
        last_update = last_setting.updated_at if last_setting else None
        
        stats_data = {
            'total_settings': total_settings,
            'categories': categories,
            'recent_updates': recent_updates,
            'last_update': last_update,
        }
        
        serializer = SettingsStatsSerializer(stats_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def search(self, request):
        """
        Search settings with advanced filters
        """
        serializer = SettingsSearchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        filters = serializer.validated_data
        queryset = SystemSetting.objects.all()
        
        # Apply filters
        if 'query' in filters:
            query = filters['query']
            queryset = queryset.filter(
                Q(key__icontains=query) |
                Q(value__icontains=query) |
                Q(description__icontains=query)
            )
        
        if 'category' in filters:
            category = filters['category']
            queryset = queryset.filter(key__startswith=category)
        
        if 'updated_since' in filters:
            updated_since = filters['updated_since']
            queryset = queryset.filter(updated_at__gte=updated_since)
        
        # Serialize results
        settings_serializer = SystemSettingListSerializer(queryset, many=True)
        
        return Response({
            'results': settings_serializer.data,
            'count': queryset.count()
        })
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """
        Update multiple settings at once
        """
        serializer = BulkSettingsUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        settings_data = serializer.validated_data['settings']
        updated_count = 0
        created_count = 0
        errors = []
        
        for setting_data in settings_data:
            key = setting_data['key'].lower()
            value = str(setting_data['value'])
            description = setting_data.get('description')
            
            try:
                setting, created = SystemSetting.objects.update_or_create(
                    key=key,
                    defaults={
                        'value': value,
                        'description': description
                    }
                )
                
                if created:
                    created_count += 1
                else:
                    updated_count += 1
                    
            except Exception as e:
                errors.append(f"Error updating {key}: {str(e)}")
        
        # Clear cache
        SettingsService.clear_cache()
        
        return Response({
            'message': f'Bulk update completed',
            'updated': updated_count,
            'created': created_count,
            'errors': errors
        })
    
    @action(detail=False, methods=['post'])
    def initialize_defaults(self, request):
        """
        Initialize system with default settings
        """
        created_count = SettingsService.initialize_defaults()
        
        return Response({
            'message': f'Initialized {created_count} default settings',
            'created': created_count
        })


class SettingsExportView(APIView):
    """
    View for exporting settings
    """
    
    permission_classes = [permissions.IsAuthenticated, SettingsPermission]
    
    def post(self, request):
        """
        Export settings in specified format
        """
        serializer = SettingsExportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        export_format = serializer.validated_data['format']
        include_descriptions = serializer.validated_data['include_descriptions']
        include_timestamps = serializer.validated_data['include_timestamps']
        
        if export_format == 'json':
            return self._export_json(include_descriptions, include_timestamps)
        elif export_format == 'csv':
            return self._export_csv(include_descriptions, include_timestamps)
    
    def _export_json(self, include_descriptions, include_timestamps):
        """
        Export settings as JSON
        """
        settings_data = []
        
        for setting in SystemSetting.objects.all():
            data = {
                'key': setting.key,
                'value': setting.value,
            }
            
            if include_descriptions:
                data['description'] = setting.description
            
            if include_timestamps:
                data['created_at'] = setting.created_at.isoformat()
                data['updated_at'] = setting.updated_at.isoformat()
            
            settings_data.append(data)
        
        response = HttpResponse(
            SettingsService.export_settings(),
            content_type='application/json'
        )
        response['Content-Disposition'] = 'attachment; filename="texPro_settings.json"'
        return response
    
    def _export_csv(self, include_descriptions, include_timestamps):
        """
        Export settings as CSV
        """
        import csv
        from io import StringIO
        
        output = StringIO()
        writer = csv.writer(output)
        
        # Write header
        header = ['key', 'value']
        if include_descriptions:
            header.append('description')
        if include_timestamps:
            header.extend(['created_at', 'updated_at'])
        
        writer.writerow(header)
        
        # Write data
        for setting in SystemSetting.objects.all():
            row = [setting.key, setting.value]
            
            if include_descriptions:
                row.append(setting.description or '')
            
            if include_timestamps:
                row.extend([
                    setting.created_at.isoformat(),
                    setting.updated_at.isoformat()
                ])
            
            writer.writerow(row)
        
        response = HttpResponse(
            output.getvalue(),
            content_type='text/csv'
        )
        response['Content-Disposition'] = 'attachment; filename="texPro_settings.csv"'
        return response


class SettingsImportView(APIView):
    """
    View for importing settings
    """
    
    permission_classes = [permissions.IsAuthenticated, SettingsPermission]
    
    def post(self, request):
        """
        Import settings from JSON data
        """
        serializer = SettingsImportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        settings_data = serializer.validated_data['settings_data']
        overwrite = serializer.validated_data['overwrite_existing']
        
        try:
            stats = SettingsService.import_settings(settings_data, overwrite)
            
            return Response({
                'message': 'Settings imported successfully',
                'stats': stats
            })
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class SettingsCacheView(APIView):
    """
    View for managing settings cache
    """
    
    permission_classes = [permissions.IsAuthenticated, SettingsPermission]
    
    def delete(self, request):
        """
        Clear settings cache
        """
        SettingsService.clear_cache()
        
        return Response({
            'message': 'Settings cache cleared successfully'
        })
