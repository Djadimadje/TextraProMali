"""
Management command to generate realistic maintenance history for textile machines
Creates industry-authentic maintenance patterns with seasonal variations and business logic
"""
import random
from datetime import datetime, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import models

from machines.models import Machine
from maintenance.models import MaintenanceLog

User = get_user_model()


class Command(BaseCommand):
    help = 'Generate realistic maintenance history for textile machines'
    
    # Textile industry maintenance patterns
    TEXTILE_MAINTENANCE_PATTERNS = {
        'Bale Opener': {
            'routine_interval_days': 21,
            'major_service_days': 180,
            'common_issues': [
                'Dust filter cleaning required',
                'Beater blade wear detected',
                'Conveyor belt tracking adjustment',
                'Air pressure system check',
                'Motor bearing lubrication'
            ],
            'seasonal_multipliers': {
                'monsoon': 1.4,  # More dust and humidity issues
                'peak_season': 1.3,  # Production pressure
                'winter': 0.8  # Optimal maintenance season
            },
            'cost_ranges': {
                'routine': (90000, 180000),              # ~$150-300 USD
                'component_replacement': (480000, 900000), # ~$800-1500 USD
                'emergency': (1200000, 2100000)           # ~$2000-3500 USD
            }
        },
        
        'Carding Machine': {
            'routine_interval_days': 14,
            'major_service_days': 90,
            'common_issues': [
                'Wire clothing inspection and replacement',
                'Doffer roller precision adjustment',
                'Suction fan cleaning',
                'Coiler head maintenance',
                'Card wire damage repair'
            ],
            'quality_impact': True,  # Affects fiber quality
            'seasonal_multipliers': {
                'monsoon': 1.2,
                'peak_season': 1.5,  # Quality critical during peak
                'winter': 0.9
            },
            'cost_ranges': {
                'routine': (150000, 300000),              # ~$250-500 USD
                'component_replacement': (900000, 2700000), # ~$1500-4500 USD
                'emergency': (2100000, 4800000)           # ~$3500-8000 USD
            }
        },
        
        'Ring Spinning Frame': {
            'routine_interval_days': 30,
            'major_service_days': 120,
            'common_issues': [
                'Spindle bearing replacement',
                'Ring rail alignment check',
                'Traveler ring replacement',
                'Balloon control adjustment',
                'Yarn break analysis and correction'
            ],
            'production_critical': True,
            'seasonal_multipliers': {
                'monsoon': 1.3,  # Humidity affects yarn
                'peak_season': 1.6,  # High production stress
                'winter': 0.7
            },
            'cost_ranges': {
                'routine': (180000, 360000),              # ~$300-600 USD
                'component_replacement': (720000, 1680000), # ~$1200-2800 USD
                'emergency': (2400000, 5700000)           # ~$4000-9500 USD
            }
        },
        
        'Air Jet Loom': {
            'routine_interval_days': 21,
            'major_service_days': 180,
            'common_issues': [
                'Air nozzle cleaning and calibration',
                'Gripper system maintenance',
                'Temple mechanism adjustment',
                'Let-off system check',
                'Warp tension optimization'
            ],
            'fabric_quality_critical': True,
            'seasonal_multipliers': {
                'monsoon': 1.2,
                'peak_season': 1.4,
                'winter': 0.8
            },
            'cost_ranges': {
                'routine': (120000, 240000),              # ~$200-400 USD
                'component_replacement': (600000, 1320000), # ~$1000-2200 USD
                'emergency': (1500000, 3300000)           # ~$2500-5500 USD
            }
        },
        
        'Jet Dyeing Machine': {
            'routine_interval_days': 7,  # Frequent cleaning needed
            'major_service_days': 60,
            'common_issues': [
                'Heat exchanger cleaning',
                'Pump seal replacement',
                'Circulation system check',
                'Chemical residue removal',
                'Temperature control calibration'
            ],
            'chemical_wear': True,
            'seasonal_multipliers': {
                'monsoon': 1.1,
                'peak_season': 1.8,  # High demand for dyed fabrics
                'winter': 0.9
            },
            'cost_ranges': {
                'routine': (210000, 420000),              # ~$350-700 USD
                'component_replacement': (1080000, 2400000), # ~$1800-4000 USD
                'emergency': (3000000, 7200000)           # ~$5000-12000 USD
            }
        }
    }
    
    # Seasonal definitions for India
    SEASONAL_PERIODS = {
        'monsoon': [6, 7, 8, 9],  # June-September
        'peak_season': [8, 9, 10, 11],  # August-November (Festival season)
        'winter': [12, 1, 2],  # December-February
        'summer': [3, 4, 5]  # March-May
    }
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--months',
            type=int,
            default=12,
            help='Number of months of history to generate (default: 12)'
        )
        parser.add_argument(
            '--realistic',
            action='store_true',
            help='Use realistic patterns with business logic'
        )
        parser.add_argument(
            '--machine-id',
            type=str,
            help='Generate history for specific machine ID only'
        )
    
    def handle(self, *args, **options):
        months = options['months']
        realistic = options['realistic']
        machine_id = options.get('machine_id')
        
        self.stdout.write(f"🔧 Generating {months} months of maintenance history...")
        
        # Get machines to process
        if machine_id:
            machines = Machine.objects.filter(machine_id=machine_id)
            if not machines.exists():
                self.stdout.write(
                    self.style.ERROR(f"Machine {machine_id} not found")
                )
                return
        else:
            machines = Machine.objects.all()
        
        if not machines.exists():
            self.stdout.write(
                self.style.ERROR("No machines found. Run generate_textile_fleet first.")
            )
            return
        
        # Get or create technicians
        technicians = self.get_or_create_technicians()
        
        total_records = 0
        
        for machine in machines:
            if realistic:
                records = self.generate_realistic_maintenance_history(
                    machine, months, technicians
                )
            else:
                records = self.generate_basic_maintenance_history(
                    machine, months, technicians
                )
            
            total_records += len(records)
            self.stdout.write(f"  Generated {len(records)} records for {machine.name}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Generated {total_records} maintenance records for {machines.count()} machines"
            )
        )
        
        # Show summary statistics
        self.show_maintenance_summary()
    
    def get_or_create_technicians(self):
        """Get or create realistic technician users"""
        technician_names = [
            ('Rajesh', 'Kumar', 'rajesh.kumar'),
            ('Suresh', 'Patel', 'suresh.patel'),
            ('Priya', 'Singh', 'priya.singh'),
            ('Amit', 'Sharma', 'amit.sharma'),
            ('Kavita', 'Gupta', 'kavita.gupta'),
            ('Ramesh', 'Yadav', 'ramesh.yadav')
        ]
        
        technicians = []
        
        for first_name, last_name, username in technician_names:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'email': f'{username}@textilemill.com',
                    'role': 'technician',
                    'employee_id': f'TECH-{random.randint(1001, 9999)}'
                }
            )
            technicians.append(user)
            
            if created:
                self.stdout.write(f"Created technician: {first_name} {last_name}")
        
        return technicians
    
    def generate_realistic_maintenance_history(self, machine, months, technicians):
        """Generate realistic maintenance history with industry patterns"""
        machine_type_name = machine.machine_type.name
        
        if machine_type_name not in self.TEXTILE_MAINTENANCE_PATTERNS:
            # Use generic pattern for unknown machine types
            machine_type_name = 'Ring Spinning Frame'
        
        pattern = self.TEXTILE_MAINTENANCE_PATTERNS[machine_type_name]
        records = []
        
        # Calculate date range
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=months * 30)
        
        # Generate routine maintenance
        records.extend(self.generate_routine_maintenance(
            machine, pattern, start_date, end_date, technicians
        ))
        
        # Generate reactive maintenance (failures)
        records.extend(self.generate_reactive_maintenance(
            machine, pattern, start_date, end_date, technicians
        ))
        
        # Generate seasonal maintenance
        records.extend(self.generate_seasonal_maintenance(
            machine, pattern, start_date, end_date, technicians
        ))
        
        # Create maintenance log records
        maintenance_logs = []
        for record_data in records:
            log = self.create_maintenance_record(record_data)
            if log:
                maintenance_logs.append(log)
        
        return maintenance_logs
    
    def generate_routine_maintenance(self, machine, pattern, start_date, end_date, technicians):
        """Generate scheduled routine maintenance"""
        records = []
        interval_days = pattern['routine_interval_days']
        
        # Start from machine installation date or start_date
        current_date = max(machine.installation_date, start_date)
        
        while current_date <= end_date:
            # Apply seasonal multipliers to timing
            season_multiplier = self.get_seasonal_multiplier(current_date, pattern)
            
            # Adjust interval based on season (maintenance might be delayed in peak season)
            if season_multiplier > 1.3:  # Peak season
                actual_interval = int(interval_days * 1.2)  # 20% longer intervals
            else:
                actual_interval = interval_days
            
            record = {
                'machine': machine,
                'issue_reported': random.choice([
                    f"Scheduled {pattern['common_issues'][0]}",
                    f"Routine {pattern['common_issues'][1]}",
                    f"Preventive {pattern['common_issues'][2]}"
                ]),
                'priority': 'low',
                'status': 'completed',
                'technician': random.choice(technicians),
                'reported_at': current_date,
                'resolved_at': current_date + timedelta(hours=random.randint(2, 8)),
                'maintenance_type': 'routine',
                'cost': self.calculate_cost('routine', pattern, season_multiplier),
                'downtime_hours': random.uniform(1, 4)
            }
            
            records.append(record)
            current_date += timedelta(days=actual_interval)
        
        return records
    
    def generate_reactive_maintenance(self, machine, pattern, start_date, end_date, technicians):
        """Generate unplanned reactive maintenance (failures)"""
        records = []
        
        # Calculate failure frequency based on machine age
        machine_age_years = (timezone.now().date() - machine.installation_date).days / 365
        
        # Older machines fail more often
        if machine_age_years < 2:
            failure_rate = 0.1  # New machines: 1 failure per 10 months
        elif machine_age_years < 5:
            failure_rate = 0.3  # Mature machines: 1 failure per 3 months
        else:
            failure_rate = 0.6  # Aging machines: 1 failure per 1.7 months
        
        # Generate failures
        total_days = (end_date - start_date).days
        expected_failures = int(total_days / 30 * failure_rate)
        
        for _ in range(expected_failures):
            failure_date = start_date + timedelta(
                days=random.randint(0, total_days)
            )
            
            season_multiplier = self.get_seasonal_multiplier(failure_date, pattern)
            
            # Choose failure type based on machine and season
            issue = random.choice(pattern['common_issues'])
            
            # Determine severity based on season and machine criticality
            if season_multiplier > 1.4:  # Peak season
                severity_weights = [0.1, 0.3, 0.6]  # More high priority issues
                priorities = ['low', 'medium', 'high']
            else:
                severity_weights = [0.4, 0.4, 0.2]
                priorities = ['low', 'medium', 'high']
            
            priority = random.choices(priorities, weights=severity_weights)[0]
            
            # Calculate resolution time based on priority and season
            if priority == 'high':
                resolution_hours = random.randint(1, 6)
                cost_type = 'emergency' if season_multiplier > 1.3 else 'component_replacement'
            elif priority == 'medium':
                resolution_hours = random.randint(4, 12)
                cost_type = 'component_replacement'
            else:
                resolution_hours = random.randint(8, 24)
                cost_type = 'routine'
            
            record = {
                'machine': machine,
                'issue_reported': f"FAILURE: {issue}",
                'priority': priority,
                'status': 'completed',
                'technician': random.choice(technicians),
                'reported_at': failure_date,
                'resolved_at': failure_date + timedelta(hours=resolution_hours),
                'maintenance_type': 'reactive',
                'cost': self.calculate_cost(cost_type, pattern, season_multiplier),
                'downtime_hours': resolution_hours * random.uniform(0.8, 1.2)
            }
            
            records.append(record)
        
        return records
    
    def generate_seasonal_maintenance(self, machine, pattern, start_date, end_date, technicians):
        """Generate season-specific maintenance activities"""
        records = []
        
        # Major overhauls during winter (low production season)
        winter_months = []
        current_date = start_date
        
        while current_date <= end_date:
            if current_date.month in self.SEASONAL_PERIODS['winter']:
                winter_months.append(current_date)
            current_date += timedelta(days=30)
        
        # Schedule major service during winter months
        if winter_months and pattern['major_service_days']:
            service_date = random.choice(winter_months)
            
            record = {
                'machine': machine,
                'issue_reported': f"Annual major service and overhaul for {machine.name}",
                'priority': 'medium',
                'status': 'completed',
                'technician': random.choice(technicians),
                'reported_at': service_date,
                'resolved_at': service_date + timedelta(days=2),
                'maintenance_type': 'preventive',
                'cost': self.calculate_cost('component_replacement', pattern, 0.7),  # Lower winter costs
                'downtime_hours': random.uniform(24, 48)
            }
            
            records.append(record)
        
        return records
    
    def get_seasonal_multiplier(self, date, pattern):
        """Get seasonal multiplier for costs and frequency"""
        month = date.month
        
        for season, months in self.SEASONAL_PERIODS.items():
            if month in months:
                return pattern['seasonal_multipliers'].get(season, 1.0)
        
        return 1.0  # Default multiplier
    
    def calculate_cost(self, cost_type, pattern, season_multiplier):
        """Calculate realistic maintenance costs"""
        base_range = pattern['cost_ranges'][cost_type]
        base_cost = random.randint(*base_range)
        
        # Apply seasonal multiplier
        final_cost = base_cost * season_multiplier
        
        # Add some randomness
        final_cost *= random.uniform(0.85, 1.15)
        
        return Decimal(str(int(final_cost)))
    
    def create_maintenance_record(self, record_data):
        """Create a maintenance log record"""
        try:
            # Ensure resolved_at is after reported_at
            if record_data['resolved_at'] <= record_data['reported_at']:
                record_data['resolved_at'] = record_data['reported_at'] + timedelta(hours=2)
            
            # Handle datetime conversion properly
            reported_at = record_data['reported_at']
            resolved_at = record_data['resolved_at']
            
            # Convert date to datetime if needed
            if isinstance(reported_at, datetime):
                reported_at_dt = timezone.make_aware(reported_at)
            else:
                # It's a date object, convert to datetime
                reported_at_dt = timezone.make_aware(
                    datetime.combine(reported_at, datetime.min.time())
                )
            
            if isinstance(resolved_at, datetime):
                resolved_at_dt = timezone.make_aware(resolved_at)
            else:
                # It's a date object, convert to datetime
                resolved_at_dt = timezone.make_aware(
                    datetime.combine(resolved_at, datetime.min.time())
                )
            
            maintenance_log = MaintenanceLog.objects.create(
                machine=record_data['machine'],
                technician=record_data['technician'],
                issue_reported=record_data['issue_reported'],
                priority=record_data['priority'],
                status=record_data['status'],
                reported_at=reported_at_dt,
                resolved_at=resolved_at_dt,
                action_taken=self.generate_action_taken(record_data),
                cost=record_data['cost'],
                downtime_hours=Decimal(str(round(record_data['downtime_hours'], 1))),
                notes=self.generate_maintenance_notes(record_data)
            )
            
            return maintenance_log
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error creating maintenance record: {e}")
            )
            return None
    
    def generate_action_taken(self, record_data):
        """Generate realistic action taken description"""
        actions = {
            'routine': [
                "Completed scheduled maintenance as per checklist",
                "Performed preventive maintenance procedures",
                "Conducted routine inspection and servicing",
                "Applied lubrication and checked all systems"
            ],
            'reactive': [
                "Diagnosed issue and replaced faulty component",
                "Repaired damaged part and tested functionality", 
                "Troubleshot problem and implemented solution",
                "Emergency repair completed and system restored"
            ],
            'preventive': [
                "Comprehensive overhaul and system upgrade",
                "Major service with component replacements",
                "Annual maintenance and calibration completed",
                "Detailed inspection and preventive actions taken"
            ]
        }
        
        maintenance_type = record_data.get('maintenance_type', 'routine')
        return random.choice(actions.get(maintenance_type, actions['routine']))
    
    def generate_maintenance_notes(self, record_data):
        """Generate realistic maintenance notes"""
        machine_name = record_data['machine'].name
        priority = record_data['priority']
        
        notes_templates = [
            f"Maintenance completed on {machine_name}. System performance restored.",
            f"All safety checks passed. {machine_name} ready for production.",
            f"Component replacement successful. Quality parameters within specification.",
            f"Preventive measures applied. Next service recommended in scheduled interval."
        ]
        
        if priority == 'high':
            notes_templates.extend([
                f"Emergency repair on {machine_name}. Production resumed immediately.",
                f"Critical issue resolved. System monitoring increased for 24 hours."
            ])
        
        return random.choice(notes_templates)
    
    def generate_basic_maintenance_history(self, machine, months, technicians):
        """Generate basic maintenance history without complex patterns"""
        records = []
        
        # Simple pattern: 1-2 maintenance per month
        for month in range(months):
            month_start = timezone.now().date() - timedelta(days=(months - month) * 30)
            
            num_maintenance = random.randint(1, 2)
            
            for _ in range(num_maintenance):
                maintenance_date = month_start + timedelta(days=random.randint(0, 29))
                
                record = {
                    'machine': machine,
                    'issue_reported': f"Routine maintenance for {machine.name}",
                    'priority': random.choice(['low', 'medium', 'high']),
                    'status': 'completed',
                    'technician': random.choice(technicians),
                    'reported_at': maintenance_date,
                    'resolved_at': maintenance_date + timedelta(hours=random.randint(2, 8)),
                    'maintenance_type': 'routine',
                    'cost': Decimal(str(random.randint(2000, 8000))),
                    'downtime_hours': random.uniform(1, 6)
                }
                
                records.append(record)
        
        # Create maintenance log records
        maintenance_logs = []
        for record_data in records:
            log = self.create_maintenance_record(record_data)
            if log:
                maintenance_logs.append(log)
        
        return maintenance_logs
    
    def show_maintenance_summary(self):
        """Show summary of generated maintenance data"""
        total_logs = MaintenanceLog.objects.count()
        
        if total_logs == 0:
            return
        
        # Calculate statistics
        total_cost = MaintenanceLog.objects.aggregate(
            total=models.Sum('cost')
        )['total'] or 0
        
        avg_downtime = MaintenanceLog.objects.aggregate(
            avg=models.Avg('downtime_hours')
        )['avg'] or 0
        
        priority_stats = MaintenanceLog.objects.values('priority').annotate(
            count=models.Count('id')
        )
        
        status_stats = MaintenanceLog.objects.values('status').annotate(
            count=models.Count('id')
        )
        
        self.stdout.write("\n📊 Maintenance History Summary:")
        self.stdout.write(f"Total Records: {total_logs}")
        self.stdout.write(f"Total Cost: {total_cost:,.0f} XOF")
        self.stdout.write(f"Average Downtime: {avg_downtime:.1f} hours")
        
        self.stdout.write("\nPriority Distribution:")
        for stat in priority_stats:
            self.stdout.write(f"  {stat['priority'].title()}: {stat['count']} records")
        
        self.stdout.write("\nStatus Distribution:")
        for stat in status_stats:
            self.stdout.write(f"  {stat['status'].title()}: {stat['count']} records")
