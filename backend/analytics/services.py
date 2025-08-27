"""
Analytics services for TexPro AI
Data aggregation and KPI calculation services
"""

from django.db.models import Count, Avg, Sum, Q, F
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal


def get_financial_analytics():
    """
    Calculate financial KPIs from various apps
    """
    try:
        from workflow.models import BatchWorkflow
        from machines.models import Machine
        from maintenance.models import MaintenanceLog
        from quality.models import QualityCheck
        
        # Basic financial calculations
        total_batches = BatchWorkflow.objects.count()
        completed_batches = BatchWorkflow.objects.filter(status='completed').count()
        
        # Estimated costs (mock calculations based on real data)
        # In a real system, these would come from actual cost tracking
        
        # Production costs (estimated per batch)
        avg_batch_cost = Decimal('1500.00')  # Base cost per batch
        total_production_cost = total_batches * avg_batch_cost
        
        # Machine operation costs
        total_machines = Machine.objects.count()
        avg_machine_daily_cost = Decimal('200.00')  # Daily operation cost per machine
        days_in_period = 30  # Last 30 days
        total_machine_costs = total_machines * avg_machine_daily_cost * days_in_period
        
        # Maintenance costs
        maintenance_logs = MaintenanceLog.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        )
        
        # Estimated maintenance costs
        maintenance_cost_per_log = Decimal('500.00')
        total_maintenance_cost = maintenance_logs.count() * maintenance_cost_per_log
        
        # Quality-related costs (rework, waste)
        failed_quality_checks = QualityCheck.objects.filter(
            status='failed',
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        quality_cost_per_failure = Decimal('300.00')
        total_quality_cost = failed_quality_checks * quality_cost_per_failure
        
        # Revenue estimation (based on completed batches)
        avg_batch_revenue = Decimal('2200.00')  # Revenue per completed batch
        total_revenue = completed_batches * avg_batch_revenue
        
        # Calculate totals and ratios
        total_costs = total_production_cost + total_machine_costs + total_maintenance_cost + total_quality_cost
        net_profit = total_revenue - total_costs
        profit_margin = (net_profit / total_revenue * 100) if total_revenue > 0 else 0
        roi = (net_profit / total_costs * 100) if total_costs > 0 else 0
        
        # Cost breakdown
        cost_breakdown = {
            'production': float(total_production_cost),
            'machine_operations': float(total_machine_costs),
            'maintenance': float(total_maintenance_cost),
            'quality_issues': float(total_quality_cost),
        }
        
        # Monthly trends (simplified)
        monthly_trends = []
        for i in range(6):  # Last 6 months
            month_start = timezone.now().date().replace(day=1) - timedelta(days=30*i)
            month_batches = BatchWorkflow.objects.filter(
                created_at__gte=month_start,
                created_at__lt=month_start + timedelta(days=30),
                status='completed'
            ).count()
            
            month_revenue = month_batches * avg_batch_revenue
            month_costs = month_batches * avg_batch_cost
            month_profit = month_revenue - month_costs
            
            monthly_trends.append({
                'month': month_start.strftime('%Y-%m'),
                'revenue': float(month_revenue),
                'costs': float(month_costs),
                'profit': float(month_profit),
                'batches': month_batches
            })
        
        monthly_trends.reverse()  # Most recent first
        
        return {
            'overview': {
                'total_revenue': float(total_revenue),
                'total_costs': float(total_costs),
                'net_profit': float(net_profit),
                'profit_margin': round(float(profit_margin), 2),
                'roi': round(float(roi), 2),
                'total_batches': total_batches,
                'completed_batches': completed_batches
            },
            'cost_breakdown': cost_breakdown,
            'monthly_trends': monthly_trends,
            'kpis': {
                'cost_per_batch': float(total_costs / total_batches) if total_batches > 0 else 0,
                'revenue_per_batch': float(total_revenue / completed_batches) if completed_batches > 0 else 0,
                'maintenance_cost_ratio': round((float(total_maintenance_cost) / float(total_costs)) * 100, 2) if total_costs > 0 else 0,
                'quality_cost_ratio': round((float(total_quality_cost) / float(total_costs)) * 100, 2) if total_costs > 0 else 0
            },
            'summary': {
                'status': 'profitable' if net_profit > 0 else 'loss',
                'trend': 'improving' if roi > 15 else 'declining',
                'efficiency_score': min(100, max(0, round(float(roi), 0)))
            }
        }
        
    except Exception as e:
        print(f"Error in get_financial_analytics: {str(e)}")
        return {
            'overview': {
                'total_revenue': 0,
                'total_costs': 0,
                'net_profit': 0,
                'profit_margin': 0,
                'roi': 0,
                'total_batches': 0,
                'completed_batches': 0
            },
            'cost_breakdown': {
                'production': 0,
                'machine_operations': 0,
                'maintenance': 0,
                'quality_issues': 0
            },
            'monthly_trends': [],
            'kpis': {
                'cost_per_batch': 0,
                'revenue_per_batch': 0,
                'maintenance_cost_ratio': 0,
                'quality_cost_ratio': 0
            },
            'summary': {
                'status': 'no_data',
                'trend': 'stable',
                'efficiency_score': 0
            }
        }


def get_production_analytics():
    """
    Calculate production KPIs from workflow app
    """
    try:
        from workflow.models import BatchWorkflow
        
        # Basic counts
        total_batches = BatchWorkflow.objects.count()
        
        # Status breakdown
        status_counts = BatchWorkflow.objects.values('status').annotate(count=Count('id'))
        status_breakdown = {item['status']: item['count'] for item in status_counts}
        
        # Calculate status percentages
        completed_count = status_breakdown.get('completed', 0)
        in_progress_count = status_breakdown.get('in_progress', 0)
        delayed_count = status_breakdown.get('delayed', 0)
        
        # Calculate average batch duration for completed batches
        completed_batches = BatchWorkflow.objects.filter(
            status='completed',
            start_date__isnull=False,
            end_date__isnull=False
        )
        
        avg_duration_days = 0
        if completed_batches.exists():
            durations = []
            for batch in completed_batches:
                if batch.start_date and batch.end_date:
                    duration = (batch.end_date - batch.start_date).days
                    durations.append(duration)
            
            if durations:
                avg_duration_days = sum(durations) / len(durations)
        
        # Recent activity (last 30 days)
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        recent_batches = BatchWorkflow.objects.filter(
            created_at__date__gte=thirty_days_ago
        ).count()
        
        return {
            'total_batches': total_batches,
            'status_breakdown': {
                'completed': completed_count,
                'in_progress': in_progress_count,
                'delayed': delayed_count,
                'other': total_batches - completed_count - in_progress_count - delayed_count
            },
            'percentages': {
                'completed': round((completed_count / total_batches * 100), 1) if total_batches > 0 else 0,
                'in_progress': round((in_progress_count / total_batches * 100), 1) if total_batches > 0 else 0,
                'delayed': round((delayed_count / total_batches * 100), 1) if total_batches > 0 else 0
            },
            'average_duration_days': round(avg_duration_days, 1),
            'recent_activity': {
                'batches_last_30_days': recent_batches
            }
        }
        
    except Exception as e:
        return {
            'error': f'Unable to fetch production analytics: {str(e)}',
            'total_batches': 0,
            'status_breakdown': {},
            'percentages': {},
            'average_duration_days': 0,
            'recent_activity': {}
        }


def get_machine_analytics():
    """
    Calculate machine KPIs from machines app
    """
    try:
        from machines.models import Machine
        
        # Basic counts
        total_machines = Machine.objects.count()
        
        # Status breakdown
        status_counts = Machine.objects.values('status').annotate(count=Count('id'))
        status_breakdown = {item['status']: item['count'] for item in status_counts}
        
        operational_count = status_breakdown.get('operational', 0)
        maintenance_count = status_breakdown.get('under_maintenance', 0)
        offline_count = status_breakdown.get('offline', 0)
        
        # Calculate average downtime from maintenance records
        try:
            from maintenance.models import MaintenanceLog
            
            # Get recent completed maintenance records
            completed_maintenance = MaintenanceLog.objects.filter(
                status='resolved',
                start_date__isnull=False,
                completion_date__isnull=False
            )
            
            avg_downtime_hours = 0
            if completed_maintenance.exists():
                downtimes = []
                for log in completed_maintenance:
                    if log.start_date and log.completion_date:
                        downtime = (log.completion_date - log.start_date).total_seconds() / 3600
                        downtimes.append(downtime)
                
                if downtimes:
                    avg_downtime_hours = sum(downtimes) / len(downtimes)
            
        except:
            avg_downtime_hours = 0
        
        # Machine utilization
        utilization_rate = round((operational_count / total_machines * 100), 1) if total_machines > 0 else 0
        
        return {
            'total_machines': total_machines,
            'status_breakdown': {
                'operational': operational_count,
                'under_maintenance': maintenance_count,
                'offline': offline_count,
                'other': total_machines - operational_count - maintenance_count - offline_count
            },
            'percentages': {
                'operational': round((operational_count / total_machines * 100), 1) if total_machines > 0 else 0,
                'under_maintenance': round((maintenance_count / total_machines * 100), 1) if total_machines > 0 else 0,
                'offline': round((offline_count / total_machines * 100), 1) if total_machines > 0 else 0
            },
            'utilization_rate': utilization_rate,
            'average_downtime_hours': round(avg_downtime_hours, 1)
        }
        
    except Exception as e:
        return {
            'error': f'Unable to fetch machine analytics: {str(e)}',
            'total_machines': 0,
            'status_breakdown': {},
            'percentages': {},
            'utilization_rate': 0,
            'average_downtime_hours': 0
        }


def get_maintenance_analytics():
    """
    Calculate maintenance KPIs from maintenance app
    """
    try:
        from maintenance.models import MaintenanceLog
        
        # Basic counts
        total_logs = MaintenanceLog.objects.count()
        
        # Status breakdown
        status_counts = MaintenanceLog.objects.values('status').annotate(count=Count('id'))
        status_breakdown = {item['status']: item['count'] for item in status_counts}
        
        open_count = status_breakdown.get('pending', 0) + status_breakdown.get('in_progress', 0)
        resolved_count = status_breakdown.get('resolved', 0)
        
        # Calculate average resolution time
        resolved_logs = MaintenanceLog.objects.filter(
            status='resolved',
            start_date__isnull=False,
            completion_date__isnull=False
        )
        
        avg_resolution_hours = 0
        if resolved_logs.exists():
            resolution_times = []
            for log in resolved_logs:
                if log.start_date and log.completion_date:
                    resolution_time = (log.completion_date - log.start_date).total_seconds() / 3600
                    resolution_times.append(resolution_time)
            
            if resolution_times:
                avg_resolution_hours = sum(resolution_times) / len(resolution_times)
        
        # Next maintenance due (scheduled for next 30 days)
        thirty_days_ahead = timezone.now().date() + timedelta(days=30)
        upcoming_maintenance = MaintenanceLog.objects.filter(
            status='scheduled',
            scheduled_date__lte=thirty_days_ahead,
            scheduled_date__gte=timezone.now().date()
        ).count()
        
        # Overdue maintenance
        overdue_maintenance = MaintenanceLog.objects.filter(
            status='scheduled',
            scheduled_date__lt=timezone.now().date()
        ).count()
        
        return {
            'total_maintenance_logs': total_logs,
            'status_breakdown': {
                'open': open_count,
                'resolved': resolved_count,
                'scheduled': status_breakdown.get('scheduled', 0)
            },
            'percentages': {
                'resolved': round((resolved_count / total_logs * 100), 1) if total_logs > 0 else 0,
                'open': round((open_count / total_logs * 100), 1) if total_logs > 0 else 0
            },
            'average_resolution_hours': round(avg_resolution_hours, 1),
            'upcoming_maintenance': {
                'next_30_days': upcoming_maintenance,
                'overdue': overdue_maintenance
            }
        }
        
    except Exception as e:
        return {
            'error': f'Unable to fetch maintenance analytics: {str(e)}',
            'total_maintenance_logs': 0,
            'status_breakdown': {},
            'percentages': {},
            'average_resolution_hours': 0,
            'upcoming_maintenance': {}
        }


def get_quality_analytics():
    """
    Calculate quality KPIs from quality app
    """
    try:
        from quality.models import QualityCheck
        
        # Basic counts
        total_checks = QualityCheck.objects.count()
        
        # Status breakdown
        status_counts = QualityCheck.objects.values('status').annotate(count=Count('id'))
        status_breakdown = {item['status']: item['count'] for item in status_counts}
        
        approved_count = status_breakdown.get('approved', 0)
        rejected_count = status_breakdown.get('rejected', 0)
        pending_count = status_breakdown.get('pending', 0)
        
        # Calculate defect rate (percentage of rejected checks)
        defect_rate = round((rejected_count / total_checks * 100), 1) if total_checks > 0 else 0
        
        # Quality score average
        quality_scores = QualityCheck.objects.filter(
            quality_score__isnull=False
        ).aggregate(avg_score=Avg('quality_score'))
        
        avg_quality_score = quality_scores['avg_score'] or 0
        
        # Recent quality trends (last 30 days)
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        recent_checks = QualityCheck.objects.filter(
            check_date__gte=thirty_days_ago
        )
        
        recent_approved = recent_checks.filter(status='approved').count()
        recent_total = recent_checks.count()
        recent_approval_rate = round((recent_approved / recent_total * 100), 1) if recent_total > 0 else 0
        
        return {
            'total_quality_checks': total_checks,
            'status_breakdown': {
                'approved': approved_count,
                'rejected': rejected_count,
                'pending': pending_count
            },
            'percentages': {
                'approved': round((approved_count / total_checks * 100), 1) if total_checks > 0 else 0,
                'rejected': round((rejected_count / total_checks * 100), 1) if total_checks > 0 else 0,
                'pending': round((pending_count / total_checks * 100), 1) if total_checks > 0 else 0
            },
            'defect_rate': defect_rate,
            'average_quality_score': round(float(avg_quality_score), 1),
            'recent_trends': {
                'last_30_days_checks': recent_total,
                'recent_approval_rate': recent_approval_rate
            }
        }
        
    except Exception as e:
        return {
            'error': f'Unable to fetch quality analytics: {str(e)}',
            'total_quality_checks': 0,
            'status_breakdown': {},
            'percentages': {},
            'defect_rate': 0,
            'average_quality_score': 0,
            'recent_trends': {}
        }


def get_allocation_analytics():
    """
    Calculate allocation KPIs from allocation app
    """
    try:
        from allocation.models import WorkforceAllocation, MaterialAllocation
        from workflow.models import BatchWorkflow
        
        # Workforce analytics
        total_workforce_allocations = WorkforceAllocation.objects.count()
        
        # Workforce per batch
        workforce_per_batch = WorkforceAllocation.objects.values('batch').annotate(
            workforce_count=Count('user', distinct=True)
        ).aggregate(avg_workforce=Avg('workforce_count'))
        
        avg_workforce_per_batch = workforce_per_batch['avg_workforce'] or 0
        
        # Role distribution
        role_distribution = WorkforceAllocation.objects.values('role_assigned').annotate(
            count=Count('id')
        )
        
        # Material analytics
        total_material_allocations = MaterialAllocation.objects.count()
        
        # Material usage by type
        material_usage = MaterialAllocation.objects.values('material_name').annotate(
            total_quantity=Sum('quantity'),
            total_cost=Sum(F('quantity') * F('cost_per_unit')),
            allocation_count=Count('id')
        ).order_by('-total_cost')[:10]  # Top 10 materials by cost
        
        # Total material costs
        total_material_cost = MaterialAllocation.objects.aggregate(
            total=Sum(F('quantity') * F('cost_per_unit'))
        )['total'] or Decimal('0')
        
        # Active allocations (current workforce)
        active_workforce = WorkforceAllocation.objects.filter(
            Q(end_date__isnull=True) | Q(end_date__gte=timezone.now().date())
        ).count()
        
        return {
            'workforce_analytics': {
                'total_allocations': total_workforce_allocations,
                'average_workforce_per_batch': round(float(avg_workforce_per_batch), 1),
                'active_workforce': active_workforce,
                'role_distribution': list(role_distribution)
            },
            'material_analytics': {
                'total_allocations': total_material_allocations,
                'total_material_cost_xof': float(total_material_cost),
                'top_materials_by_cost': list(material_usage),
                'unique_materials': MaterialAllocation.objects.values('material_name').distinct().count()
            }
        }
        
    except Exception as e:
        return {
            'error': f'Unable to fetch allocation analytics: {str(e)}',
            'workforce_analytics': {},
            'material_analytics': {}
        }


def get_dashboard_summary():
    """
    Get overall dashboard summary with key metrics from all apps
    """
    try:
        # Get key metrics from each app
        production = get_production_analytics()
        machines = get_machine_analytics()
        maintenance = get_maintenance_analytics()
        quality = get_quality_analytics()
        allocation = get_allocation_analytics()
        
        return {
            'timestamp': timezone.now().isoformat(),
            'summary': {
                'total_batches': production.get('total_batches', 0),
                'operational_machines': machines.get('status_breakdown', {}).get('operational', 0),
                'quality_approval_rate': quality.get('percentages', {}).get('approved', 0),
                'active_workforce': allocation.get('workforce_analytics', {}).get('active_workforce', 0),
                'overdue_maintenance': maintenance.get('upcoming_maintenance', {}).get('overdue', 0)
            },
            'detailed_analytics': {
                'production': production,
                'machines': machines,
                'maintenance': maintenance,
                'quality': quality,
                'allocation': allocation
            }
        }
        
    except Exception as e:
        return {
            'error': f'Unable to generate dashboard summary: {str(e)}',
            'timestamp': timezone.now().isoformat(),
            'summary': {},
            'detailed_analytics': {}
        }
