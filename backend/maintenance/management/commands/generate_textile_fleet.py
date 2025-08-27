"""
Generate realistic textile machine fleet with authentic industry data
Usage: python manage.py generate_textile_fleet --size=medium --clear
"""
import random
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.utils import timezone

from machines.models import Machine, MachineType
from users.models import User

User = get_user_model()


class Command(BaseCommand):
    help = 'Generate realistic textile machine fleet with industry-authentic data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--size',
            type=str,
            choices=['small', 'medium', 'large'],
            default='medium',
            help='Factory size (small=25, medium=50, large=100 machines)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing machines and machine types before generating'
        )
        parser.add_argument(
            '--years-back',
            type=int,
            default=5,
            help='Years back for installation timeline'
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing machines and types...')
            Machine.objects.all().delete()
            MachineType.objects.all().delete()

        self.factory_size = options['size']
        self.years_back = options['years_back']
        
        self.stdout.write(f'\n🏭 Generating {self.factory_size} textile factory fleet...\n')
        
        # Generate machine types first
        machine_types = self.create_textile_machine_types()
        
        # Generate realistic machine fleet
        machines = self.create_machine_fleet(machine_types)
        
        # Display summary
        self.display_fleet_summary(machines)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Successfully generated {len(machines)} machines '
                f'across {len(machine_types)} machine types!'
            )
        )

    def create_textile_machine_types(self):
        """Create authentic textile machine types with industry data"""
        
        textile_types = {
            # Cotton Processing Line
            'Bale Opener': {
                'description': 'Opens cotton bales and removes impurities',
                'manufacturer': 'Trützschler',
                'typical_power_consumption': 60.0,
                'typical_production_rate': 1000.0,
                'production_unit': 'kg/hr',
                'recommended_maintenance_interval_days': 21,
                'recommended_maintenance_interval_hours': 500,
                'category': 'Cotton Processing'
            },
            
            'Carding Machine': {
                'description': 'Combs and aligns cotton fibers into a continuous web',
                'manufacturer': 'Rieter',
                'typical_power_consumption': 100.0,
                'typical_production_rate': 200.0,
                'production_unit': 'kg/hr',
                'recommended_maintenance_interval_days': 14,
                'recommended_maintenance_interval_hours': 350,
                'category': 'Cotton Processing'
            },
            
            'Draw Frame': {
                'description': 'Combines multiple card slivers and draws them',
                'manufacturer': 'Rieter',
                'typical_power_consumption': 45.0,
                'typical_production_rate': 150.0,
                'production_unit': 'kg/hr',
                'recommended_maintenance_interval_days': 30,
                'recommended_maintenance_interval_hours': 720,
                'category': 'Cotton Processing'
            },

            # Spinning Department
            'Ring Spinning Frame': {
                'description': 'Spins cotton roving into yarn using ring and traveler system',
                'manufacturer': 'Rieter',
                'typical_power_consumption': 150.0,
                'typical_production_rate': 25.0,
                'production_unit': 'kg/hr',
                'recommended_maintenance_interval_days': 30,
                'recommended_maintenance_interval_hours': 720,
                'category': 'Spinning'
            },
            
            'Rotor Spinning Machine': {
                'description': 'Open-end spinning using rotor technology',
                'manufacturer': 'Rieter',
                'typical_power_consumption': 120.0,
                'typical_production_rate': 40.0,
                'production_unit': 'kg/hr',
                'recommended_maintenance_interval_days': 21,
                'recommended_maintenance_interval_hours': 500,
                'category': 'Spinning'
            },

            # Weaving Department  
            'Air Jet Loom': {
                'description': 'Weaves yarn into fabric using compressed air for weft insertion',
                'manufacturer': 'Picanol',
                'typical_power_consumption': 12.0,
                'typical_production_rate': 4.5,
                'production_unit': 'm/min',
                'recommended_maintenance_interval_days': 21,
                'recommended_maintenance_interval_hours': 500,
                'category': 'Weaving'
            },
            
            'Projectile Loom': {
                'description': 'Heavy-duty loom for thick fabrics using projectile system',
                'manufacturer': 'Sulzer',
                'typical_power_consumption': 18.0,
                'typical_production_rate': 2.8,
                'production_unit': 'm/min',
                'recommended_maintenance_interval_days': 30,
                'recommended_maintenance_interval_hours': 720,
                'category': 'Weaving'
            },

            # Dyeing & Finishing
            'Jet Dyeing Machine': {
                'description': 'Continuous dyeing of fabric using jet technology',
                'manufacturer': 'Thies',
                'typical_power_consumption': 200.0,
                'typical_production_rate': 500.0,
                'production_unit': 'kg/hr',
                'recommended_maintenance_interval_days': 14,
                'recommended_maintenance_interval_hours': 350,
                'category': 'Dyeing'
            },

            # Auxiliary Equipment
            'Air Compressor': {
                'description': 'Provides compressed air for pneumatic systems',
                'manufacturer': 'Atlas Copco',
                'typical_power_consumption': 75.0,
                'typical_production_rate': 1200.0,
                'production_unit': 'CFM',
                'recommended_maintenance_interval_days': 60,
                'recommended_maintenance_interval_hours': 1440,
                'category': 'Auxiliary'
            },
            
            'Humidification System': {
                'description': 'Controls humidity for optimal cotton processing',
                'manufacturer': 'Munters',
                'typical_power_consumption': 30.0,
                'typical_production_rate': 2000.0,
                'production_unit': 'kg/hr',
                'recommended_maintenance_interval_days': 30,
                'recommended_maintenance_interval_hours': 720,
                'category': 'Auxiliary'
            }
        }

        machine_types = []
        for name, data in textile_types.items():
            # Use get_or_create to avoid duplicate errors
            machine_type, created = MachineType.objects.get_or_create(
                name=name,
                defaults={
                    'description': data['description'],
                    'manufacturer': data['manufacturer'],
                    'typical_power_consumption': data['typical_power_consumption'],
                    'typical_production_rate': data['typical_production_rate'],
                    'production_unit': data['production_unit'],
                    'recommended_maintenance_interval_days': data['recommended_maintenance_interval_days'],
                    'recommended_maintenance_interval_hours': data['recommended_maintenance_interval_hours']
                }
            )
            machine_types.append(machine_type)
            
            if created:
                self.stdout.write(f'Created: {name} ({data["category"]})')
            else:
                self.stdout.write(f'Found existing: {name} ({data["category"]})')
        
        return machine_types

    def create_machine_fleet(self, machine_types):
        """Generate realistic machine fleet based on factory size"""
        
        size_configs = {
            'small': {
                'total_machines': 25,
                'cotton_processing': 4,
                'spinning': 12,
                'weaving': 6,
                'dyeing': 1,
                'auxiliary': 2
            },
            'medium': {
                'total_machines': 50,
                'cotton_processing': 8,
                'spinning': 22,
                'weaving': 14,
                'dyeing': 3,
                'auxiliary': 3
            },
            'large': {
                'total_machines': 100,
                'cotton_processing': 15,
                'spinning': 45,
                'weaving': 25,
                'dyeing': 8,
                'auxiliary': 7
            }
        }
        
        config = size_configs[self.factory_size]
        machines = []
        
        # Create installation timeline
        installation_timeline = self.generate_installation_timeline(config['total_machines'])
        timeline_index = 0
        
        # Generate machines by category
        machines.extend(self.create_category_machines(
            'Cotton Processing', config['cotton_processing'], 
            machine_types, installation_timeline, timeline_index
        ))
        timeline_index += config['cotton_processing']
        
        machines.extend(self.create_category_machines(
            'Spinning', config['spinning'],
            machine_types, installation_timeline, timeline_index
        ))
        timeline_index += config['spinning']
        
        machines.extend(self.create_category_machines(
            'Weaving', config['weaving'],
            machine_types, installation_timeline, timeline_index
        ))
        timeline_index += config['weaving']
        
        machines.extend(self.create_category_machines(
            'Dyeing', config['dyeing'],
            machine_types, installation_timeline, timeline_index
        ))
        timeline_index += config['dyeing']
        
        machines.extend(self.create_category_machines(
            'Auxiliary', config['auxiliary'],
            machine_types, installation_timeline, timeline_index
        ))
        
        return machines

    def create_category_machines(self, category, count, machine_types, timeline, start_index):
        """Create machines for a specific category"""
        
        # Get machine types for this category
        category_types = [mt for mt in machine_types if self.get_machine_category(mt.name) == category]
        
        if not category_types:
            return []
        
        machines = []
        for i in range(count):
            # Select machine type (prefer variety)
            machine_type = random.choice(category_types)
            
            # Get installation data
            install_data = timeline[start_index + i] if start_index + i < len(timeline) else timeline[-1]
            
            # Generate machine data
            machine_data = self.generate_machine_data(machine_type, category, i + 1, install_data)
            
            machine = Machine.objects.create(**machine_data)
            machines.append(machine)
            
            self.stdout.write(f'  Created: {machine.name} ({machine.machine_id})')
        
        return machines

    def generate_machine_data(self, machine_type, category, sequence, install_data):
        """Generate realistic machine data"""
        
        # Create machine ID based on category and sequence
        category_codes = {
            'Cotton Processing': 'CP',
            'Spinning': 'SP', 
            'Weaving': 'WV',
            'Dyeing': 'DY',
            'Auxiliary': 'AX'
        }
        
        category_code = category_codes.get(category, 'XX')
        machine_id = f"{category_code}-{machine_type.name.replace(' ', '')[:3].upper()}-{sequence:03d}"
        
        # Generate realistic serial number
        year = install_data['install_date'].year
        serial_number = f"{machine_type.manufacturer[:3].upper()}{year}{random.randint(1000, 9999)}"
        
        # Calculate current operating status based on age
        age_days = (timezone.now().date() - install_data['install_date']).days
        operational_status = self.determine_operational_status(age_days, install_data['business_phase'])
        
        # Calculate operating hours based on age and usage patterns
        daily_hours = self.get_daily_operating_hours(category)
        total_hours = age_days * daily_hours * random.uniform(0.85, 0.95)  # Account for downtime
        
        # Maintenance hours calculation
        maintenance_cycles = age_days // machine_type.recommended_maintenance_interval_days
        hours_since_maintenance = random.randint(0, machine_type.recommended_maintenance_interval_hours)
        
        return {
            'machine_id': machine_id,
            'name': f"{machine_type.name} {sequence:02d}",
            'machine_type': machine_type,
            'serial_number': serial_number,
            'manufacturer': machine_type.manufacturer,
            'model_number': self.generate_model_name(machine_type),  # Changed from 'model'
            'installation_date': install_data['install_date'],
            'operational_status': operational_status,
            'site_code': 'FAB-001',  # Main factory
            'building': self.generate_building(category),
            'floor': self.generate_floor(sequence),
            'location_details': self.generate_location_details(category, sequence),
            'total_operating_hours': round(total_hours, 1),
            'hours_since_maintenance': hours_since_maintenance,
            'rated_power': machine_type.typical_power_consumption * random.uniform(0.9, 1.1),
            'rated_capacity': machine_type.typical_production_rate * random.uniform(0.95, 1.05),
            'capacity_unit': machine_type.production_unit,
        }

    def generate_installation_timeline(self, machine_count):
        """Generate realistic installation timeline with business phases"""
        
        timeline = []
        
        # Business expansion phases
        expansion_phases = [
            {'year': 2019, 'reason': 'initial_setup', 'percentage': 40},
            {'year': 2021, 'reason': 'covid_recovery', 'percentage': 25},
            {'year': 2023, 'reason': 'export_expansion', 'percentage': 20},
            {'year': 2024, 'reason': 'automation_upgrade', 'percentage': 15}
        ]
        
        machines_allocated = 0
        for phase in expansion_phases:
            phase_machines = int(machine_count * phase['percentage'] / 100)
            
            # Generate installation dates spread across the year
            for i in range(phase_machines):
                # Random month in the year
                month_offset = random.randint(0, 11)
                day_offset = random.randint(1, 28)
                
                install_date = date(phase['year'], 1, 1) + timedelta(
                    days=month_offset * 30 + day_offset
                )
                
                timeline.append({
                    'install_date': install_date,
                    'business_phase': phase['reason']
                })
            
            machines_allocated += phase_machines
        
        # Fill remaining machines in 2024 if needed
        remaining = machine_count - machines_allocated
        for i in range(remaining):
            install_date = date(2024, random.randint(1, 12), random.randint(1, 28))
            timeline.append({
                'install_date': install_date,
                'business_phase': 'recent_addition'
            })
        
        return timeline

    def get_machine_category(self, machine_type_name):
        """Determine category from machine type name"""
        categories = {
            'Cotton Processing': ['Bale Opener', 'Carding Machine', 'Draw Frame'],
            'Spinning': ['Ring Spinning Frame', 'Rotor Spinning Machine'],
            'Weaving': ['Air Jet Loom', 'Projectile Loom'],
            'Dyeing': ['Jet Dyeing Machine'],
            'Auxiliary': ['Air Compressor', 'Humidification System']
        }
        
        for category, types in categories.items():
            if machine_type_name in types:
                return category
        return 'Unknown'

    def determine_operational_status(self, age_days, business_phase):
        """Determine operational status based on age and business context"""
        
        if age_days < 30:  # New machine
            return 'running'
        elif age_days > 1800:  # Old machine (5+ years)
            return random.choice(['running', 'idle', 'maintenance'])
        elif business_phase == 'automation_upgrade':
            return 'running'  # Latest machines are running
        else:
            return random.choice(['running', 'running', 'running', 'idle'])  # Mostly running

    def get_daily_operating_hours(self, category):
        """Get typical daily operating hours by category"""
        daily_hours = {
            'Cotton Processing': 20,  # High utilization
            'Spinning': 22,  # Continuous operation
            'Weaving': 18,  # Shift-based operation
            'Dyeing': 16,  # Batch processing
            'Auxiliary': 24   # Support systems
        }
        return daily_hours.get(category, 20)

    def generate_building(self, category):
        """Generate realistic building assignment based on category"""
        building_assignments = {
            'Cotton Processing': 'Raw Material Processing Building',
            'Spinning': 'Spinning Mill Building A',
            'Weaving': 'Weaving Shed Building B', 
            'Dyeing': 'Wet Processing Building C',
            'Auxiliary': 'Utility Building'
        }
        return building_assignments.get(category, 'Production Building')
    
    def generate_floor(self, sequence):
        """Generate floor assignment"""
        return f"Floor {((sequence - 1) % 3) + 1}"
    
    def generate_location_details(self, category, sequence):
        """Generate detailed location description"""
        zone = chr(65 + ((sequence - 1) % 4))  # A, B, C, D zones
        return f"Production Zone {zone}, Line {((sequence - 1) % 5) + 1}"
    
    def generate_model_name(self, machine_type):
        """Generate realistic model names"""
        models = {
            'Bale Opener': ['BO-A11', 'UNIfloc A15', 'Cleanflow CF-1200'],
            'Carding Machine': ['C70', 'C80', 'TC15'],
            'Draw Frame': ['RSB-D35', 'D45', 'RSB-951'],
            'Ring Spinning Frame': ['G35', 'G38', 'K45'],
            'Rotor Spinning Machine': ['R35', 'R40', 'BD-200'],
            'Air Jet Loom': ['OptiMax-i', 'JAT810', 'ZAX9100'],
            'Projectile Loom': ['P7300', 'P7200', 'ITEMA A9500'],
            'Jet Dyeing Machine': ['eco2flow', 'then', 'Aqua-Jet'],
            'Air Compressor': ['GA75', 'GA90', 'GA110'],
            'Humidification System': ['HumiCool', 'AirWasher AW-2000', 'ML270']
        }
        
        return random.choice(models.get(machine_type.name, ['Model-X']))

    def generate_location(self, category, sequence):
        """Generate realistic factory location"""
        locations = {
            'Cotton Processing': f'Cotton Processing Floor - Line {(sequence-1)//2 + 1}',
            'Spinning': f'Spinning Department - Section {(sequence-1)//8 + 1}',
            'Weaving': f'Weaving Shed - Aisle {(sequence-1)//6 + 1}',
            'Dyeing': f'Dyeing Department - Bay {sequence}',
            'Auxiliary': f'Utility Area - Zone {sequence}'
        }
        
        return locations.get(category, f'Factory Floor - Position {sequence}')

    def display_fleet_summary(self, machines):
        """Display summary of generated fleet"""
        
        self.stdout.write('\n📊 Fleet Summary:')
        
        # Group by category
        categories = {}
        for machine in machines:
            category = self.get_machine_category(machine.machine_type.name)
            if category not in categories:
                categories[category] = []
            categories[category].append(machine)
        
        total_power = 0
        total_capacity = 0
        
        for category, category_machines in categories.items():
            self.stdout.write(f'\n🏭 {category} Department ({len(category_machines)} machines):')
            
            for machine in category_machines:
                age_days = (timezone.now().date() - machine.installation_date).days
                age_years = round(age_days / 365, 1)
                
                total_power += machine.rated_power or 0
                
                self.stdout.write(
                    f'  • {machine.name} ({machine.machine_id}) - '
                    f'{age_years}y old, {machine.operational_status}, '
                    f'{machine.rated_power:.0f}kW'
                )
        
        # Overall statistics
        self.stdout.write(f'\n⚡ Total Fleet Power: {total_power:.0f} kW')
        self.stdout.write(f'🏭 Factory Layout: {len(categories)} departments')
        
        # Age distribution
        new_machines = len([m for m in machines if (timezone.now().date() - m.installation_date).days < 365])
        mature_machines = len([m for m in machines if 365 <= (timezone.now().date() - m.installation_date).days < 1095])
        aging_machines = len([m for m in machines if (timezone.now().date() - m.installation_date).days >= 1095])
        
        self.stdout.write(f'📅 Age Distribution: {new_machines} new, {mature_machines} mature, {aging_machines} aging')
