"""
Management command to create fixture templates for demos and showcases
Creates pre-built datasets optimized for different presentation scenarios
"""
import json
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.core import serializers
from django.utils import timezone
from django.db import models

from machines.models import Machine, MachineType
from maintenance.models import MaintenanceLog
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create fixture templates for demos and showcases'
    
    FIXTURE_SCENARIOS = {
        'demo_quick': {
            'description': 'Perfect for 5-minute demos',
            'machines': 10,
            'months_history': 3,
            'showcase_features': [
                'Cost savings calculation',
                'Predictive maintenance alerts',
                'Department efficiency comparison'
            ]
        },
        
        'presentation_full': {
            'description': 'Comprehensive dataset for client presentations',
            'machines': 25,
            'months_history': 12,
            'showcase_features': [
                'Full seasonal patterns',
                'ROI calculations with real numbers',
                'Before/after maintenance strategy comparison',
                'Quality correlation analysis'
            ]
        },
        
        'portfolio_showcase': {
            'description': 'Optimized for GitHub/portfolio showcasing',
            'machines': 15,
            'months_history': 6,
            'showcase_features': [
                'Technical depth demonstration',
                'Industry knowledge display',
                'Data science readiness',
                'Business impact metrics'
            ]
        },
        
        'interview_ready': {
            'description': 'Perfect for technical interviews',
            'machines': 20,
            'months_history': 8,
            'showcase_features': [
                'Complex business logic',
                'Performance optimization examples',
                'Scalability demonstration',
                'Real-world problem solving'
            ]
        }
    }
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--scenario',
            type=str,
            choices=list(self.FIXTURE_SCENARIOS.keys()),
            default='demo_quick',
            help='Fixture scenario to create'
        )
        parser.add_argument(
            '--output-dir',
            type=str,
            default='fixtures',
            help='Output directory for fixture files'
        )
    
    def handle(self, *args, **options):
        scenario = options['scenario']
        output_dir = options['output_dir']
        
        scenario_config = self.FIXTURE_SCENARIOS[scenario]
        
        self.stdout.write(f"🎯 Creating {scenario} fixture...")
        self.stdout.write(f"📝 {scenario_config['description']}")
        
        # Clear existing data for clean fixture
        self.clear_demo_data()
        
        # Generate the fleet for this scenario
        fleet_size = self.determine_fleet_size(scenario_config['machines'])
        self.stdout.write(f"🏭 Generating {fleet_size} fleet...")
        
        from maintenance.management.commands.generate_textile_fleet import Command as FleetCommand
        fleet_cmd = FleetCommand()
        fleet_cmd.stdout = self.stdout
        fleet_cmd.handle(size=fleet_size, clear=False, years_back=3)
        
        # Generate maintenance history
        self.stdout.write(f"🔧 Generating {scenario_config['months_history']} months of history...")
        
        from maintenance.management.commands.generate_maintenance_history import Command as HistoryCommand
        history_cmd = HistoryCommand()
        history_cmd.stdout = self.stdout
        history_cmd.handle(months=scenario_config['months_history'], realistic=True)
        
        # Create scenario-specific showcase data
        self.create_showcase_data(scenario, scenario_config)
        
        # Export to fixture files
        self.export_fixtures(scenario, output_dir)
        
        # Generate README for the fixture
        self.generate_fixture_readme(scenario, scenario_config, output_dir)
        
        self.stdout.write(
            self.style.SUCCESS(f"✅ {scenario} fixture created successfully!")
        )
    
    def clear_demo_data(self):
        """Clear existing demo data for clean fixture generation"""
        self.stdout.write("🧹 Clearing existing demo data...")
        
        # Don't delete admin users, but clear demo data
        MaintenanceLog.objects.all().delete()
        Machine.objects.all().delete()
        MachineType.objects.exclude(name__in=['Weaving Loom']).delete()  # Keep test data
        
        # Remove demo technicians (keep admin)
        User.objects.filter(role='technician').delete()
    
    def determine_fleet_size(self, target_machines):
        """Map target machines to fleet size categories"""
        if target_machines <= 15:
            return 'small'
        elif target_machines <= 30:
            return 'medium'
        else:
            return 'large'
    
    def create_showcase_data(self, scenario, config):
        """Create scenario-specific showcase data points"""
        
        if scenario == 'demo_quick':
            self.create_demo_highlights()
        elif scenario == 'presentation_full':
            self.create_presentation_highlights()
        elif scenario == 'portfolio_showcase':
            self.create_portfolio_highlights()
        elif scenario == 'interview_ready':
            self.create_interview_highlights()
    
    def create_demo_highlights(self):
        """Create compelling data points for quick demos"""
        
        # Create a recent critical failure that was predicted
        dyeing_machine = Machine.objects.filter(name__contains='Dyeing').first()
        if dyeing_machine:
            technician = User.objects.filter(role='technician').first()
            
            # Critical failure avoided
            MaintenanceLog.objects.create(
                machine=dyeing_machine,
                technician=technician,
                issue_reported="PREDICTED: Heat exchanger failure detected 5 days early",
                action_taken="Scheduled maintenance during planned downtime. Avoided 85,000 XOF emergency repair.",
                priority='high',
                status='completed',
                reported_at=timezone.now() - timedelta(days=2),
                resolved_at=timezone.now() - timedelta(days=1),
                cost=12000,
                downtime_hours=4,
                notes="Predictive maintenance success story. System detected temperature anomaly trend."
            )
        
        self.stdout.write("✨ Created demo highlight: Predictive maintenance success story")
    
    def create_presentation_highlights(self):
        """Create comprehensive data for client presentations"""
        
        # Create seasonal pattern demonstration
        machines = Machine.objects.all()[:5]
        
        for i, machine in enumerate(machines):
            # Monsoon season impact (July)
            monsoon_date = timezone.now().replace(month=7, day=15) - timedelta(days=30)
            
            MaintenanceLog.objects.create(
                machine=machine,
                technician=User.objects.filter(role='technician').first(),
                issue_reported=f"Monsoon impact: Increased humidity causing electrical issues in {machine.name}",
                action_taken="Applied moisture protection and adjusted maintenance schedule for monsoon season",
                priority='medium',
                status='completed',
                reported_at=monsoon_date,
                resolved_at=monsoon_date + timedelta(hours=6),
                cost=8000 + (i * 1000),  # Varying costs
                downtime_hours=3.5,
                notes="Seasonal pattern identified. Maintenance schedule optimized for weather conditions."
            )
        
        self.stdout.write("✨ Created presentation highlights: Seasonal patterns and ROI examples")
    
    def create_portfolio_highlights(self):
        """Create data that showcases technical and business acumen"""
        
        # Create a quality correlation example
        ring_frame = Machine.objects.filter(machine_type__name='Ring Spinning Frame').first()
        if ring_frame:
            technician = User.objects.filter(role='technician').first()
            
            MaintenanceLog.objects.create(
                machine=ring_frame,
                technician=technician,
                issue_reported="Quality correlation detected: Yarn breaks increased 23% - spindle bearing degradation",
                action_taken="Replaced precision bearings. Quality parameters restored. Prevented customer complaints.",
                priority='high',
                status='completed',
                reported_at=timezone.now() - timedelta(days=10),
                resolved_at=timezone.now() - timedelta(days=9),
                cost=18500,
                downtime_hours=8,
                notes="Quality-maintenance correlation analysis. Prevented 125,000 XOF in customer claims."
            )
        
        self.stdout.write("✨ Created portfolio highlights: Quality correlation and business impact")
    
    def create_interview_highlights(self):
        """Create data that demonstrates technical problem-solving"""
        
        # Create a complex failure chain example
        machines = Machine.objects.filter(machine_type__name__contains='Spinning')[:3]
        
        if machines.count() >= 3:
            technician = User.objects.filter(role='technician').first()
            
            # Failure cascade scenario
            for i, machine in enumerate(machines):
                MaintenanceLog.objects.create(
                    machine=machine,
                    technician=technician,
                    issue_reported=f"Cascade failure analysis: {machine.name} affected by upstream process disruption",
                    action_taken=f"Root cause analysis completed. Implemented preventive measures across spinning line.",
                    priority='high',
                    status='completed',
                    reported_at=timezone.now() - timedelta(days=15 + i),
                    resolved_at=timezone.now() - timedelta(days=14 + i),
                    cost=15000 + (i * 3000),
                    downtime_hours=6 + i,
                    notes="Complex system interaction analysis. Demonstrates holistic maintenance approach."
                )
        
        self.stdout.write("✨ Created interview highlights: Complex problem solving and system thinking")
    
    def export_fixtures(self, scenario, output_dir):
        """Export data to fixture files"""
        import os
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Export machine types
        machine_types = MachineType.objects.all()
        with open(f'{output_dir}/{scenario}_machine_types.json', 'w', encoding='utf-8') as f:
            serializers.serialize('json', machine_types, indent=2, stream=f)
        
        # Export machines
        machines = Machine.objects.all()
        with open(f'{output_dir}/{scenario}_machines.json', 'w', encoding='utf-8') as f:
            serializers.serialize('json', machines, indent=2, stream=f)
        
        # Export users
        users = User.objects.filter(role__in=['technician', 'supervisor'])
        with open(f'{output_dir}/{scenario}_users.json', 'w', encoding='utf-8') as f:
            serializers.serialize('json', users, indent=2, stream=f)
        
        # Export maintenance logs
        maintenance_logs = MaintenanceLog.objects.all()
        with open(f'{output_dir}/{scenario}_maintenance_logs.json', 'w', encoding='utf-8') as f:
            serializers.serialize('json', maintenance_logs, indent=2, stream=f)
        
        self.stdout.write(f"📁 Exported fixtures to {output_dir}/")
    
    def generate_fixture_readme(self, scenario, config, output_dir):
        """Generate README file explaining the fixture"""
        
        # Calculate statistics
        total_machines = Machine.objects.count()
        total_logs = MaintenanceLog.objects.count()
        total_cost = MaintenanceLog.objects.aggregate(
            total=models.Sum('cost')
        )['total'] or 0
        
        readme_content = f"""# TexPro AI - {scenario.title()} Dataset

## Overview
{config['description']}

## Dataset Statistics
- **Machines**: {total_machines} across multiple departments
- **Maintenance Records**: {total_logs} records over {config['months_history']} months
- **Total Maintenance Cost**: {total_cost:,.0f} XOF
- **Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M')}

## Showcase Features
{chr(10).join(['- ' + feature for feature in config['showcase_features']])}

## Files Included
- `{scenario}_machine_types.json` - Textile machine type definitions
- `{scenario}_machines.json` - Machine fleet data
- `{scenario}_users.json` - Technician and user data
- `{scenario}_maintenance_logs.json` - Maintenance history records

## Loading the Dataset
```bash
# Load in order (dependencies matter)
python manage.py loaddata {scenario}_machine_types.json
python manage.py loaddata {scenario}_users.json
python manage.py loaddata {scenario}_machines.json
python manage.py loaddata {scenario}_maintenance_logs.json
```

## Key Demo Points

### 🎯 Quick Demo Talking Points:
1. **Industry Authenticity**: Real textile machine brands (Rieter, Picanol, Toyota)
2. **Business Intelligence**: Seasonal patterns, cost optimization, quality correlation
3. **Predictive Value**: Early failure detection, maintenance scheduling optimization
4. **ROI Demonstration**: Quantified savings and efficiency improvements

### 📊 Dashboard Metrics to Highlight:
- Average downtime per incident
- Maintenance cost by department
- Predictive accuracy rates
- Seasonal pattern analysis

### 🏭 Technical Depth Indicators:
- Machine-specific failure patterns
- Component lifecycle tracking
- Quality-maintenance correlations
- Business cycle integration

## Business Context
This dataset represents a typical Malian textile manufacturing facility with:
- Cotton processing line
- Spinning department (ring and rotor spinning)
- Weaving department (air jet and projectile looms)
- Dyeing operations
- Auxiliary support systems

The maintenance patterns reflect real-world West African textile industry challenges including:
- Harmattan season impacts
- Festival season production pressure
- Machine age-related reliability patterns
- Department-specific maintenance requirements

---
Generated by TexPro AI Data Generator
Authentic textile industry intelligence for impressive demonstrations
"""
        
        with open(f'{output_dir}/{scenario}_README.md', 'w', encoding='utf-8') as f:
            f.write(readme_content)
        
        self.stdout.write(f"📝 Generated README: {output_dir}/{scenario}_README.md")
