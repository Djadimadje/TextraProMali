"""
Custom filters for TexPro AI
Base filter classes and utilities
"""
import django_filters
from django.db import models


class BaseFilterSet(django_filters.FilterSet):
    """
    Base filter set with common functionality
    """
    
    class Meta:
        abstract = True
    
    @property
    def qs(self):
        """Override to add common filtering logic"""
        parent = super().qs
        user = getattr(self.request, 'user', None)
        
        # Filter by site if user is not admin
        if user and hasattr(user, 'user_type') and user.user_type != 'admin':
            if hasattr(user, 'site_code') and hasattr(parent.model, 'site_code'):
                parent = parent.filter(site_code=user.site_code)
        
        return parent


class CharInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    """Filter for multiple character values"""
    pass


class NumberInFilter(django_filters.BaseInFilter, django_filters.NumberFilter):
    """Filter for multiple number values"""
    pass


class DateRangeFilter(django_filters.FilterSet):
    """
    Date range filter mixin
    """
    date_from = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        abstract = True
