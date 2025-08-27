"""
Machine statistics serializers for TexPro AI
Handles serialization of machine statistics and analytics data
"""
from rest_framework import serializers
from machines.models import Machine, MachineType


class MachineStatsSerializer(serializers.Serializer):
    """
    Serializer for machine statistics
    """
    total_machines = serializers.IntegerField(read_only=True)
    operational_machines = serializers.IntegerField(read_only=True)
    maintenance_machines = serializers.IntegerField(read_only=True)
    offline_machines = serializers.IntegerField(read_only=True)
    breakdown_machines = serializers.IntegerField(read_only=True)
    
    machines_by_status = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    
    machines_by_type = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    
    machines_by_location = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    
    maintenance_due_soon = serializers.IntegerField(read_only=True)
    maintenance_overdue = serializers.IntegerField(read_only=True)
    
    average_efficiency = serializers.FloatField(read_only=True)
    total_operating_hours = serializers.FloatField(read_only=True)


class MachineTypeStatsSerializer(serializers.Serializer):
    """
    Serializer for machine type statistics
    """
    machine_type = serializers.CharField(read_only=True)
    total_count = serializers.IntegerField(read_only=True)
    operational_count = serializers.IntegerField(read_only=True)
    maintenance_count = serializers.IntegerField(read_only=True)
    offline_count = serializers.IntegerField(read_only=True)
    breakdown_count = serializers.IntegerField(read_only=True)
    
    average_operating_hours = serializers.FloatField(read_only=True)
    average_efficiency = serializers.FloatField(read_only=True)
    
    maintenance_due_count = serializers.IntegerField(read_only=True)
    maintenance_overdue_count = serializers.IntegerField(read_only=True)


class LocationStatsSerializer(serializers.Serializer):
    """
    Serializer for location-based machine statistics
    """
    site_code = serializers.CharField(read_only=True)
    building = serializers.CharField(read_only=True)
    total_machines = serializers.IntegerField(read_only=True)
    operational_machines = serializers.IntegerField(read_only=True)
    maintenance_machines = serializers.IntegerField(read_only=True)
    offline_machines = serializers.IntegerField(read_only=True)
    breakdown_machines = serializers.IntegerField(read_only=True)
    
    average_efficiency = serializers.FloatField(read_only=True)
    total_operating_hours = serializers.FloatField(read_only=True)


class MaintenanceAnalyticsSerializer(serializers.Serializer):
    """
    Serializer for maintenance analytics
    """
    machines_due_today = serializers.IntegerField(read_only=True)
    machines_due_this_week = serializers.IntegerField(read_only=True)
    machines_due_this_month = serializers.IntegerField(read_only=True)
    machines_overdue = serializers.IntegerField(read_only=True)
    
    critical_machines = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    
    upcoming_maintenance = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    
    maintenance_by_type = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )


class EfficiencyAnalyticsSerializer(serializers.Serializer):
    """
    Serializer for efficiency analytics
    """
    overall_efficiency = serializers.FloatField(read_only=True)
    efficiency_by_type = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    efficiency_by_location = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    
    top_performing_machines = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    
    underperforming_machines = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )


class UtilizationAnalyticsSerializer(serializers.Serializer):
    """
    Serializer for machine utilization analytics
    """
    total_available_hours = serializers.FloatField(read_only=True)
    total_operating_hours = serializers.FloatField(read_only=True)
    overall_utilization_rate = serializers.FloatField(read_only=True)
    
    utilization_by_type = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    
    utilization_by_location = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    
    most_utilized_machines = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
    
    least_utilized_machines = serializers.ListField(
        child=serializers.DictField(),
        read_only=True
    )
