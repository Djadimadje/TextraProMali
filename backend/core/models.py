"""
Base models for TexPro AI system
Common fields and functionality shared across all apps
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class BaseModel(models.Model):
    """
    Abstract base model with common fields
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(app_label)s_%(class)s_created"
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(app_label)s_%(class)s_updated"
    )
    
    class Meta:
        abstract = True


class TimestampedModel(models.Model):
    """
    Abstract model with only timestamp fields
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class SiteSpecificModel(BaseModel):
    """
    Abstract model for site-specific data
    """
    site_code = models.CharField(
        max_length=10,
        help_text='CMDT site/factory code'
    )
    
    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['site_code']),
        ]


class StatusModel(BaseModel):
    """
    Abstract model with status tracking
    """
    class Status(models.TextChoices):
        ACTIVE = 'active', _('Active')
        INACTIVE = 'inactive', _('Inactive')
        PENDING = 'pending', _('Pending')
        ARCHIVED = 'archived', _('Archived')
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    
    class Meta:
        abstract = True
