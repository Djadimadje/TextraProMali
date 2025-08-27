"""
Predictive Maintenance Service for TexPro AI
MVP implementation with rule-based predictions, designed for future AI integration
"""
from datetime import date, timedelta
from django.db.models import Avg, Count
from django.utils import timezone
from typing import Optional, Dict, Any

from machines.models import Machine
from maintenance.models import MaintenanceLog


class PredictiveMaintenanceService:
    """
    Service for predictive maintenance calculations
    MVP: Rule-based approach, designed to be AI-ready
    """
    
    # Default intervals (fallback values)
    DEFAULT_MAINTENANCE_INTERVAL_DAYS = 30
    CRITICAL_THRESHOLD_MULTIPLIER = 1.2
    WARNING_THRESHOLD_MULTIPLIER = 0.8
    
    @classmethod
    def predict_next_due(cls, machine: Machine) -> date:
        """
        Predict next maintenance due date for a machine
        
        MVP Implementation:
        1. Check machine type recommended interval
        2. Use historical maintenance data for pattern recognition
        3. Factor in operating hours
        4. Apply fallback default if no data available
        
        Args:
            machine: Machine instance to predict for
            
        Returns:
            date: Predicted next maintenance due date
        """
        prediction_data = cls._analyze_machine_patterns(machine)
        
        # Strategy 1: Use machine type recommended interval
        if machine.machine_type.recommended_maintenance_interval_days:
            base_interval = machine.machine_type.recommended_maintenance_interval_days
        else:
            # Strategy 2: Use historical average for this machine type
            avg_interval = cls._get_average_interval_for_type(machine.machine_type)
            base_interval = avg_interval or cls.DEFAULT_MAINTENANCE_INTERVAL_DAYS
        
        # Strategy 3: Adjust based on machine's historical performance
        adjusted_interval = cls._adjust_for_machine_history(machine, base_interval)
        
        # Strategy 4: Factor in current operating hours
        final_interval = cls._adjust_for_operating_hours(machine, adjusted_interval)
        
        # Calculate next due date
        reference_date = cls._get_reference_date(machine)
        next_due = reference_date + timedelta(days=final_interval)
        
        return next_due
    
    @classmethod
    def _analyze_machine_patterns(cls, machine: Machine) -> Dict[str, Any]:
        """
        Analyze historical patterns for the machine
        This method is designed to be AI-ready for future ML integration
        """
        maintenance_logs = MaintenanceLog.objects.filter(
            machine=machine,
            status='completed'
        ).order_by('-resolved_at')
        
        if not maintenance_logs.exists():
            return {
                'has_history': False,
                'avg_downtime': None,
                'maintenance_frequency': None,
                'reliability_score': 50  # Default neutral score
            }
        
        # Calculate average downtime
        avg_downtime = maintenance_logs.aggregate(
            avg=Avg('downtime_hours')
        )['avg'] or 0
        
        # Calculate maintenance frequency (logs per month)
        if maintenance_logs.count() > 1:
            first_log = maintenance_logs.last()
            last_log = maintenance_logs.first()
            days_span = (last_log.resolved_at - first_log.resolved_at).days
            
            if days_span > 0:
                frequency = (maintenance_logs.count() / days_span) * 30  # logs per month
            else:
                frequency = 0
        else:
            frequency = 0
        
        # Calculate reliability score (inverse of maintenance frequency)
        reliability_score = max(10, 100 - (frequency * 10))
        
        return {
            'has_history': True,
            'avg_downtime': avg_downtime,
            'maintenance_frequency': frequency,
            'reliability_score': reliability_score,
            'total_maintenance_count': maintenance_logs.count()
        }
    
    @classmethod
    def _get_average_interval_for_type(cls, machine_type) -> Optional[int]:
        """
        Get average maintenance interval for machines of this type
        """
        # Get all completed maintenance for this machine type
        completed_maintenance = MaintenanceLog.objects.filter(
            machine__machine_type=machine_type,
            status='completed'
        ).order_by('machine', 'resolved_at')
        
        intervals = []
        current_machine = None
        last_date = None
        
        for log in completed_maintenance:
            if current_machine != log.machine.id:
                # New machine, reset tracking
                current_machine = log.machine.id
                last_date = log.resolved_at.date()
                continue
            
            if last_date:
                interval = (log.resolved_at.date() - last_date).days
                if interval > 0:  # Valid interval
                    intervals.append(interval)
            
            last_date = log.resolved_at.date()
        
        if intervals:
            return sum(intervals) // len(intervals)  # Average interval
        
        return None
    
    @classmethod
    def _adjust_for_machine_history(cls, machine: Machine, base_interval: int) -> int:
        """
        Adjust interval based on machine's specific history
        """
        patterns = cls._analyze_machine_patterns(machine)
        
        if not patterns['has_history']:
            return base_interval
        
        # Adjust based on reliability score
        reliability_score = patterns['reliability_score']
        
        if reliability_score > 80:
            # Very reliable machine, can extend interval slightly
            adjustment_factor = 1.1
        elif reliability_score > 60:
            # Average reliability, keep interval as is
            adjustment_factor = 1.0
        elif reliability_score > 40:
            # Below average, reduce interval slightly
            adjustment_factor = 0.9
        else:
            # Poor reliability, reduce interval significantly
            adjustment_factor = 0.8
        
        adjusted_interval = int(base_interval * adjustment_factor)
        
        # Ensure reasonable bounds
        return max(7, min(adjusted_interval, 180))  # Between 1 week and 6 months
    
    @classmethod
    def _adjust_for_operating_hours(cls, machine: Machine, base_interval: int) -> int:
        """
        Adjust interval based on current operating hours
        """
        # Check if machine has recommended hour-based maintenance
        if not machine.machine_type.recommended_maintenance_interval_hours:
            return base_interval
        
        recommended_hours = machine.machine_type.recommended_maintenance_interval_hours
        current_hours = machine.hours_since_maintenance
        
        # Calculate how close we are to hour-based maintenance
        hours_ratio = current_hours / recommended_hours
        
        if hours_ratio > cls.CRITICAL_THRESHOLD_MULTIPLIER:
            # Critical: significantly over recommended hours
            return max(1, int(base_interval * 0.5))  # Halve the interval
        elif hours_ratio > 1.0:
            # Over recommended hours
            return max(7, int(base_interval * 0.7))
        elif hours_ratio > cls.WARNING_THRESHOLD_MULTIPLIER:
            # Approaching recommended hours
            return max(7, int(base_interval * 0.9))
        else:
            # Well within limits
            return base_interval
    
    @classmethod
    def _get_reference_date(cls, machine: Machine) -> date:
        """
        Get reference date for calculating next maintenance
        """
        # Priority 1: Last completed maintenance
        last_maintenance = MaintenanceLog.objects.filter(
            machine=machine,
            status='completed'
        ).order_by('-resolved_at').first()
        
        if last_maintenance:
            return last_maintenance.resolved_at.date()
        
        # Priority 2: Last maintenance date from machine
        if machine.last_maintenance_date:
            return machine.last_maintenance_date.date()
        
        # Priority 3: Installation date
        if machine.installation_date:
            return machine.installation_date
        
        # Fallback: Today
        return date.today()
    
    @classmethod
    def get_maintenance_urgency(cls, machine: Machine) -> str:
        """
        Determine maintenance urgency level
        """
        next_due = cls.predict_next_due(machine)
        today = date.today()
        days_until_due = (next_due - today).days
        
        # Check operating hours urgency
        hours_urgency = cls._get_hours_urgency(machine)
        
        # Combine date and hours urgency
        if days_until_due < 0 or hours_urgency == 'critical':
            return 'critical'  # Overdue or critical hours
        elif days_until_due <= 3 or hours_urgency == 'urgent':
            return 'urgent'    # Due very soon or urgent hours
        elif days_until_due <= 7 or hours_urgency == 'warning':
            return 'warning'   # Due soon or warning hours
        else:
            return 'normal'    # Not due soon
    
    @classmethod
    def calculate_urgency(cls, machine: Machine) -> str:
        """
        Calculate maintenance urgency (alias for get_maintenance_urgency)
        """
        return cls.get_maintenance_urgency(machine)
    
    @classmethod
    def analyze_failure_patterns(cls, machine: Machine) -> Dict[str, Any]:
        """
        Analyze failure patterns for a machine (returns same as _analyze_machine_patterns)
        """
        return cls._analyze_machine_patterns(machine)
    
    @classmethod
    def _get_hours_urgency(cls, machine: Machine) -> str:
        """
        Get urgency based on operating hours
        """
        if not machine.machine_type.recommended_maintenance_interval_hours:
            return 'normal'
        
        recommended_hours = machine.machine_type.recommended_maintenance_interval_hours
        current_hours = machine.hours_since_maintenance
        hours_ratio = current_hours / recommended_hours
        
        if hours_ratio > cls.CRITICAL_THRESHOLD_MULTIPLIER:
            return 'critical'
        elif hours_ratio > 1.0:
            return 'urgent'
        elif hours_ratio > cls.WARNING_THRESHOLD_MULTIPLIER:
            return 'warning'
        else:
            return 'normal'
    
    @classmethod
    def get_maintenance_recommendations(cls, machine: Machine) -> list:
        """
        Get maintenance recommendations as a list (for API compatibility)
        """
        recommendations_dict = cls.get_maintenance_recommendations_dict(machine)
        return recommendations_dict['recommendations']
    
    @classmethod
    def get_maintenance_recommendations_dict(cls, machine: Machine) -> Dict[str, Any]:
        """
        Get comprehensive maintenance recommendations for a machine as dictionary
        """
        patterns = cls._analyze_machine_patterns(machine)
        next_due = cls.predict_next_due(machine)
        urgency = cls.get_maintenance_urgency(machine)
        
        recommendations = {
            'machine_id': machine.machine_id,
            'machine_name': machine.name,
            'next_due_date': next_due,
            'urgency': urgency,
            'days_until_due': (next_due - date.today()).days,
            'patterns': patterns,
            'recommendations': []
        }
        
        # Add specific recommendations based on analysis
        if urgency == 'critical':
            recommendations['recommendations'].append(
                "CRITICAL: Schedule maintenance immediately"
            )
        elif urgency == 'urgent':
            recommendations['recommendations'].append(
                "URGENT: Schedule maintenance within 3 days"
            )
        elif urgency == 'warning':
            recommendations['recommendations'].append(
                "Schedule maintenance within 1 week"
            )
        
        # Add recommendations based on patterns
        if patterns['has_history']:
            if patterns['maintenance_frequency'] > 2:  # More than 2 maintenances per month
                recommendations['recommendations'].append(
                    "Consider investigating root cause of frequent maintenance"
                )
            
            if patterns['avg_downtime'] and patterns['avg_downtime'] > 4:  # More than 4 hours
                recommendations['recommendations'].append(
                    "Review maintenance procedures to reduce downtime"
                )
        
        return recommendations
    
    @classmethod
    def bulk_predict_maintenance(cls, machines_queryset) -> Dict[str, Any]:
        """
        Predict maintenance for multiple machines
        Optimized for bulk operations
        """
        results = {
            'total_machines': machines_queryset.count(),
            'critical': [],
            'urgent': [],
            'warning': [],
            'normal': [],
            'summary': {
                'critical_count': 0,
                'urgent_count': 0,
                'warning_count': 0,
                'normal_count': 0
            }
        }
        
        for machine in machines_queryset:
            recommendation = cls.get_maintenance_recommendations_dict(machine)
            urgency = recommendation['urgency']
            
            results[urgency].append({
                'machine_id': machine.machine_id,
                'machine_name': machine.name,
                'next_due_date': recommendation['next_due_date'],
                'days_until_due': recommendation['days_until_due']
            })
            
            results['summary'][f'{urgency}_count'] += 1
        
        return results
    
    # AI-Ready Methods (for future ML integration)
    
    @classmethod
    def prepare_ml_features(cls, machine: Machine) -> Dict[str, Any]:
        """
        Prepare features for ML model training/prediction
        This method structure is ready for AI integration
        """
        patterns = cls._analyze_machine_patterns(machine)
        
        features = {
            # Machine characteristics
            'machine_age_days': cls._get_machine_age_days(machine),
            'machine_type_id': machine.machine_type.id,
            'total_operating_hours': machine.total_operating_hours,
            'hours_since_maintenance': machine.hours_since_maintenance,
            
            # Historical patterns
            'avg_downtime': patterns.get('avg_downtime', 0),
            'maintenance_frequency': patterns.get('maintenance_frequency', 0),
            'reliability_score': patterns.get('reliability_score', 50),
            'total_maintenance_count': patterns.get('total_maintenance_count', 0),
            
            # Environmental factors (can be expanded)
            'site_code': machine.site_code,
            'operational_status': machine.operational_status,
            
            # Target variable (for training)
            'days_until_next_maintenance': (cls.predict_next_due(machine) - date.today()).days
        }
        
        return features
    
    @classmethod
    def _get_machine_age_days(cls, machine: Machine) -> int:
        """
        Get machine age in days
        """
        if machine.installation_date:
            return (date.today() - machine.installation_date).days
        return 0
    
    @classmethod
    def train_ml_model(cls):
        """
        Placeholder for future ML model training
        This method will be implemented when AI integration is ready
        """
        # TODO: Implement ML model training
        # 1. Collect features from all machines
        # 2. Train model using historical data
        # 3. Validate model performance
        # 4. Save trained model
        pass
    
    @classmethod
    def predict_with_ml(cls, machine: Machine) -> date:
        """
        Placeholder for ML-based prediction
        This method will be implemented when AI integration is ready
        """
        # TODO: Implement ML-based prediction
        # 1. Load trained model
        # 2. Prepare features for the machine
        # 3. Make prediction using ML model
        # 4. Return predicted date
        
        # For now, fallback to rule-based prediction
        return cls.predict_next_due(machine)
