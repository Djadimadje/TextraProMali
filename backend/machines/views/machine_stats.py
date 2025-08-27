"""
Machine statistics and analytics views for TexPro AI
Handles machine performance analytics and reporting
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg, Sum, Q
from django.utils import timezone
from datetime import date, timedelta

from machines.models import Machine, MachineType
from machines.serializers import (
    MachineStatsSerializer,
    MachineTypeStatsSerializer,
    LocationStatsSerializer,
    MaintenanceAnalyticsSerializer,
    EfficiencyAnalyticsSerializer,
    UtilizationAnalyticsSerializer
)


class MachineStatsView(APIView):
    """
    General machine statistics
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get overall machine statistics
        """
        user = request.user
        machines_queryset = Machine.objects.all()
        
        # Filter by site if user is not admin
        if hasattr(user, 'user_type') and user.user_type != 'admin':
            if hasattr(user, 'site_code') and user.site_code:
                machines_queryset = machines_queryset.filter(site_code=user.site_code)
        
        # Basic counts
        total_machines = machines_queryset.count()
        operational_machines = machines_queryset.filter(
            operational_status__in=['running', 'idle']
        ).count()
        maintenance_machines = machines_queryset.filter(
            operational_status='maintenance'
        ).count()
        offline_machines = machines_queryset.filter(
            operational_status='offline'
        ).count()
        breakdown_machines = machines_queryset.filter(
            operational_status='breakdown'
        ).count()
        
        # Statistics by status
        machines_by_status = list(
            machines_queryset.values('operational_status')
            .annotate(count=Count('id'))
            .order_by('operational_status')
        )
        
        # Statistics by type
        machines_by_type = list(
            machines_queryset.values('machine_type__name')
            .annotate(count=Count('id'))
            .order_by('machine_type__name')
        )
        
        # Statistics by location
        machines_by_location = list(
            machines_queryset.exclude(site_code='')
            .values('site_code', 'building')
            .annotate(count=Count('id'))
            .order_by('site_code', 'building')
        )
        
        # Maintenance statistics
        maintenance_due_soon = 0
        maintenance_overdue = 0
        
        for machine in machines_queryset:
            if machine.needs_maintenance:
                if machine.maintenance_urgency in ['urgent', 'critical']:
                    maintenance_overdue += 1
                elif machine.maintenance_urgency == 'due_soon':
                    maintenance_due_soon += 1
        
        # Performance metrics
        total_operating_hours = machines_queryset.aggregate(
            total=Sum('total_operating_hours')
        )['total'] or 0
        
        # Calculate average efficiency
        efficiency_sum = 0
        efficiency_count = 0
        for machine in machines_queryset:
            efficiency = machine.get_efficiency_rating()
            if efficiency:
                efficiency_sum += efficiency
                efficiency_count += 1
        
        average_efficiency = efficiency_sum / efficiency_count if efficiency_count > 0 else 0
        
        stats_data = {
            'total_machines': total_machines,
            'operational_machines': operational_machines,
            'maintenance_machines': maintenance_machines,
            'offline_machines': offline_machines,
            'breakdown_machines': breakdown_machines,
            'machines_by_status': machines_by_status,
            'machines_by_type': machines_by_type,
            'machines_by_location': machines_by_location,
            'maintenance_due_soon': maintenance_due_soon,
            'maintenance_overdue': maintenance_overdue,
            'average_efficiency': round(average_efficiency, 2),
            'total_operating_hours': total_operating_hours,
        }
        
        serializer = MachineStatsSerializer(data=stats_data)
        serializer.is_valid()
        return Response(serializer.data)


class MachineAnalyticsView(APIView):
    """
    Detailed machine analytics by type and location
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get detailed analytics grouped by type and location
        """
        user = request.user
        machines_queryset = Machine.objects.select_related('machine_type').all()
        
        # Filter by site if user is not admin
        if hasattr(user, 'user_type') and user.user_type != 'admin':
            if hasattr(user, 'site_code') and user.site_code:
                machines_queryset = machines_queryset.filter(site_code=user.site_code)
        
        # Analytics by machine type
        machine_types = MachineType.objects.all()
        type_analytics = []
        
        for machine_type in machine_types:
            type_machines = machines_queryset.filter(machine_type=machine_type)
            
            if type_machines.exists():
                # Count by status
                operational_count = type_machines.filter(
                    operational_status__in=['running', 'idle']
                ).count()
                maintenance_count = type_machines.filter(
                    operational_status='maintenance'
                ).count()
                offline_count = type_machines.filter(
                    operational_status='offline'
                ).count()
                breakdown_count = type_machines.filter(
                    operational_status='breakdown'
                ).count()
                
                # Maintenance statistics
                maintenance_due_count = 0
                maintenance_overdue_count = 0
                
                for machine in type_machines:
                    if machine.needs_maintenance:
                        if machine.maintenance_urgency in ['urgent', 'critical']:
                            maintenance_overdue_count += 1
                        else:
                            maintenance_due_count += 1
                
                # Performance metrics
                avg_operating_hours = type_machines.aggregate(
                    avg=Avg('total_operating_hours')
                )['avg'] or 0
                
                efficiency_sum = 0
                efficiency_count = 0
                for machine in type_machines:
                    efficiency = machine.get_efficiency_rating()
                    if efficiency:
                        efficiency_sum += efficiency
                        efficiency_count += 1
                
                avg_efficiency = efficiency_sum / efficiency_count if efficiency_count > 0 else 0
                
                type_analytics.append({
                    'machine_type': machine_type.name,
                    'total_count': type_machines.count(),
                    'operational_count': operational_count,
                    'maintenance_count': maintenance_count,
                    'offline_count': offline_count,
                    'breakdown_count': breakdown_count,
                    'average_operating_hours': round(avg_operating_hours, 2),
                    'average_efficiency': round(avg_efficiency, 2),
                    'maintenance_due_count': maintenance_due_count,
                    'maintenance_overdue_count': maintenance_overdue_count,
                })
        
        # Analytics by location
        locations = machines_queryset.values('site_code', 'building').distinct()
        location_analytics = []
        
        for location in locations:
            site_code = location['site_code']
            building = location['building']
            
            location_machines = machines_queryset.filter(
                site_code=site_code,
                building=building
            )
            
            if location_machines.exists():
                # Count by status
                operational_count = location_machines.filter(
                    operational_status__in=['running', 'idle']
                ).count()
                maintenance_count = location_machines.filter(
                    operational_status='maintenance'
                ).count()
                offline_count = location_machines.filter(
                    operational_status='offline'
                ).count()
                breakdown_count = location_machines.filter(
                    operational_status='breakdown'
                ).count()
                
                # Performance metrics
                total_operating_hours = location_machines.aggregate(
                    total=Sum('total_operating_hours')
                )['total'] or 0
                
                efficiency_sum = 0
                efficiency_count = 0
                for machine in location_machines:
                    efficiency = machine.get_efficiency_rating()
                    if efficiency:
                        efficiency_sum += efficiency
                        efficiency_count += 1
                
                avg_efficiency = efficiency_sum / efficiency_count if efficiency_count > 0 else 0
                
                location_analytics.append({
                    'site_code': site_code,
                    'building': building or 'Unknown',
                    'total_machines': location_machines.count(),
                    'operational_machines': operational_count,
                    'maintenance_machines': maintenance_count,
                    'offline_machines': offline_count,
                    'breakdown_machines': breakdown_count,
                    'average_efficiency': round(avg_efficiency, 2),
                    'total_operating_hours': total_operating_hours,
                })
        
        return Response({
            'type_analytics': type_analytics,
            'location_analytics': location_analytics,
        })


class MaintenanceAnalyticsView(APIView):
    """
    Maintenance-focused analytics
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get maintenance analytics and forecasting
        """
        user = request.user
        machines_queryset = Machine.objects.select_related('machine_type').all()
        
        # Filter by site if user is not admin
        if hasattr(user, 'user_type') and user.user_type != 'admin':
            if hasattr(user, 'site_code') and user.site_code:
                machines_queryset = machines_queryset.filter(site_code=user.site_code)
        
        today = date.today()
        
        # Maintenance due analysis
        machines_due_today = 0
        machines_due_this_week = 0
        machines_due_this_month = 0
        machines_overdue = 0
        
        critical_machines = []
        upcoming_maintenance = []
        
        for machine in machines_queryset:
            urgency = machine.maintenance_urgency
            
            if urgency == 'critical':
                machines_overdue += 1
                critical_machines.append({
                    'machine_id': machine.machine_id,
                    'name': machine.name,
                    'type': machine.machine_type.name,
                    'hours_since_maintenance': machine.hours_since_maintenance,
                    'urgency': urgency,
                    'location': f"{machine.site_code} - {machine.building or 'Unknown'}"
                })
            elif urgency == 'urgent':
                machines_due_today += 1
                upcoming_maintenance.append({
                    'machine_id': machine.machine_id,
                    'name': machine.name,
                    'type': machine.machine_type.name,
                    'estimated_days': machine.days_until_maintenance(),
                    'urgency': urgency,
                    'location': f"{machine.site_code} - {machine.building or 'Unknown'}"
                })
            elif urgency == 'due_soon':
                days_until = machine.days_until_maintenance()
                if days_until is not None:
                    if days_until <= 7:
                        machines_due_this_week += 1
                    if days_until <= 30:
                        machines_due_this_month += 1
                
                upcoming_maintenance.append({
                    'machine_id': machine.machine_id,
                    'name': machine.name,
                    'type': machine.machine_type.name,
                    'estimated_days': days_until,
                    'urgency': urgency,
                    'location': f"{machine.site_code} - {machine.building or 'Unknown'}"
                })
        
        # Maintenance by machine type
        maintenance_by_type = []
        machine_types = MachineType.objects.all()
        
        for machine_type in machine_types:
            type_machines = machines_queryset.filter(machine_type=machine_type)
            due_count = 0
            overdue_count = 0
            
            for machine in type_machines:
                if machine.needs_maintenance:
                    if machine.maintenance_urgency in ['urgent', 'critical']:
                        overdue_count += 1
                    else:
                        due_count += 1
            
            if type_machines.exists():
                maintenance_by_type.append({
                    'machine_type': machine_type.name,
                    'total_machines': type_machines.count(),
                    'maintenance_due': due_count,
                    'maintenance_overdue': overdue_count,
                    'maintenance_rate': round(
                        ((due_count + overdue_count) / type_machines.count()) * 100, 2
                    )
                })
        
        analytics_data = {
            'machines_due_today': machines_due_today,
            'machines_due_this_week': machines_due_this_week,
            'machines_due_this_month': machines_due_this_month,
            'machines_overdue': machines_overdue,
            'critical_machines': critical_machines[:10],  # Limit to top 10
            'upcoming_maintenance': sorted(
                upcoming_maintenance,
                key=lambda x: x['estimated_days'] or 999
            )[:20],  # Limit to top 20
            'maintenance_by_type': maintenance_by_type,
        }
        
        serializer = MaintenanceAnalyticsSerializer(data=analytics_data)
        serializer.is_valid()
        return Response(serializer.data)


class EfficiencyAnalyticsView(APIView):
    """
    Machine efficiency analytics
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get efficiency analytics across machines, types, and locations
        """
        user = request.user
        machines_queryset = Machine.objects.select_related('machine_type').all()
        
        # Filter by site if user is not admin
        if hasattr(user, 'user_type') and user.user_type != 'admin':
            if hasattr(user, 'site_code') and user.site_code:
                machines_queryset = machines_queryset.filter(site_code=user.site_code)
        
        # Overall efficiency
        efficiency_sum = 0
        efficiency_count = 0
        
        for machine in machines_queryset:
            efficiency = machine.get_efficiency_rating()
            if efficiency:
                efficiency_sum += efficiency
                efficiency_count += 1
        
        overall_efficiency = efficiency_sum / efficiency_count if efficiency_count > 0 else 0
        
        # Efficiency by type
        efficiency_by_type = []
        machine_types = MachineType.objects.all()
        
        for machine_type in machine_types:
            type_machines = machines_queryset.filter(machine_type=machine_type)
            type_efficiency_sum = 0
            type_efficiency_count = 0
            
            for machine in type_machines:
                efficiency = machine.get_efficiency_rating()
                if efficiency:
                    type_efficiency_sum += efficiency
                    type_efficiency_count += 1
            
            if type_efficiency_count > 0:
                avg_efficiency = type_efficiency_sum / type_efficiency_count
                efficiency_by_type.append({
                    'machine_type': machine_type.name,
                    'average_efficiency': round(avg_efficiency, 2),
                    'machine_count': type_machines.count(),
                })
        
        # Efficiency by location
        efficiency_by_location = []
        locations = machines_queryset.values('site_code', 'building').distinct()
        
        for location in locations:
            location_machines = machines_queryset.filter(
                site_code=location['site_code'],
                building=location['building']
            )
            
            location_efficiency_sum = 0
            location_efficiency_count = 0
            
            for machine in location_machines:
                efficiency = machine.get_efficiency_rating()
                if efficiency:
                    location_efficiency_sum += efficiency
                    location_efficiency_count += 1
            
            if location_efficiency_count > 0:
                avg_efficiency = location_efficiency_sum / location_efficiency_count
                efficiency_by_location.append({
                    'site_code': location['site_code'],
                    'building': location['building'] or 'Unknown',
                    'average_efficiency': round(avg_efficiency, 2),
                    'machine_count': location_machines.count(),
                })
        
        # Top performing machines
        machine_efficiencies = []
        for machine in machines_queryset:
            efficiency = machine.get_efficiency_rating()
            if efficiency:
                machine_efficiencies.append({
                    'machine_id': machine.machine_id,
                    'name': machine.name,
                    'type': machine.machine_type.name,
                    'efficiency': efficiency,
                    'location': f"{machine.site_code} - {machine.building or 'Unknown'}"
                })
        
        # Sort by efficiency
        machine_efficiencies.sort(key=lambda x: x['efficiency'], reverse=True)
        
        top_performing = machine_efficiencies[:10]
        underperforming = [m for m in machine_efficiencies if m['efficiency'] < 70][-10:]
        
        analytics_data = {
            'overall_efficiency': round(overall_efficiency, 2),
            'efficiency_by_type': efficiency_by_type,
            'efficiency_by_location': efficiency_by_location,
            'top_performing_machines': top_performing,
            'underperforming_machines': underperforming,
        }
        
        serializer = EfficiencyAnalyticsSerializer(data=analytics_data)
        serializer.is_valid()
        return Response(serializer.data)


class UtilizationAnalyticsView(APIView):
    """
    Machine utilization analytics
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get utilization analytics showing how machines are being used
        """
        user = request.user
        machines_queryset = Machine.objects.select_related('machine_type').all()
        
        # Filter by site if user is not admin
        if hasattr(user, 'user_type') and user.user_type != 'admin':
            if hasattr(user, 'site_code') and user.site_code:
                machines_queryset = machines_queryset.filter(site_code=user.site_code)
        
        # Calculate utilization based on installation date and operating hours
        # Assuming 8 hours per day, 6 days per week operation
        hours_per_week = 48
        weeks_per_year = 50  # Account for maintenance and holidays
        
        total_available_hours = 0
        total_operating_hours = machines_queryset.aggregate(
            total=Sum('total_operating_hours')
        )['total'] or 0
        
        # Calculate total available hours based on installation dates
        today = date.today()
        for machine in machines_queryset:
            if machine.installation_date:
                weeks_since_installation = (today - machine.installation_date).days / 7
                available_hours = weeks_since_installation * hours_per_week
                total_available_hours += available_hours
        
        overall_utilization_rate = 0
        if total_available_hours > 0:
            overall_utilization_rate = (total_operating_hours / total_available_hours) * 100
        
        # Utilization by type
        utilization_by_type = []
        machine_types = MachineType.objects.all()
        
        for machine_type in machine_types:
            type_machines = machines_queryset.filter(machine_type=machine_type)
            type_operating_hours = type_machines.aggregate(
                total=Sum('total_operating_hours')
            )['total'] or 0
            
            type_available_hours = 0
            for machine in type_machines:
                if machine.installation_date:
                    weeks_since_installation = (today - machine.installation_date).days / 7
                    available_hours = weeks_since_installation * hours_per_week
                    type_available_hours += available_hours
            
            type_utilization = 0
            if type_available_hours > 0:
                type_utilization = (type_operating_hours / type_available_hours) * 100
            
            if type_machines.exists():
                utilization_by_type.append({
                    'machine_type': machine_type.name,
                    'total_machines': type_machines.count(),
                    'operating_hours': type_operating_hours,
                    'available_hours': round(type_available_hours, 2),
                    'utilization_rate': round(type_utilization, 2),
                })
        
        # Most and least utilized machines
        machine_utilizations = []
        for machine in machines_queryset:
            if machine.installation_date and machine.total_operating_hours > 0:
                weeks_since_installation = (today - machine.installation_date).days / 7
                available_hours = weeks_since_installation * hours_per_week
                
                if available_hours > 0:
                    utilization_rate = (machine.total_operating_hours / available_hours) * 100
                    machine_utilizations.append({
                        'machine_id': machine.machine_id,
                        'name': machine.name,
                        'type': machine.machine_type.name,
                        'operating_hours': machine.total_operating_hours,
                        'available_hours': round(available_hours, 2),
                        'utilization_rate': round(utilization_rate, 2),
                        'location': f"{machine.site_code} - {machine.building or 'Unknown'}"
                    })
        
        # Sort by utilization rate
        machine_utilizations.sort(key=lambda x: x['utilization_rate'], reverse=True)
        
        most_utilized = machine_utilizations[:10]
        least_utilized = machine_utilizations[-10:]
        
        analytics_data = {
            'total_available_hours': round(total_available_hours, 2),
            'total_operating_hours': total_operating_hours,
            'overall_utilization_rate': round(overall_utilization_rate, 2),
            'utilization_by_type': utilization_by_type,
            'utilization_by_location': [],  # Could be implemented similar to type
            'most_utilized_machines': most_utilized,
            'least_utilized_machines': least_utilized,
        }
        
        serializer = UtilizationAnalyticsSerializer(data=analytics_data)
        serializer.is_valid()
        return Response(serializer.data)
