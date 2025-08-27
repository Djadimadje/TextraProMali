"""
Basic tests for machines app
Tests the core functionality of machine models and API endpoints
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from machines.models import Machine, MachineType

User = get_user_model()


class MachineModelTest(TestCase):
    """
    Test cases for Machine and MachineType models
    """
    
    def setUp(self):
        """Set up test data"""
        self.machine_type = MachineType.objects.create(
            name="Cotton Gin",
            description="Cotton ginning machine",
            manufacturer="TextileTech",
            typical_power_consumption=15.5,
            typical_production_rate=100.0,
            production_unit="kg/hr",
            recommended_maintenance_interval_hours=720,
            recommended_maintenance_interval_days=30
        )
        
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            role="technician"
        )
        
        self.machine = Machine.objects.create(
            machine_id="CTN-GIN-001",
            name="Cotton Gin Unit 1",
            machine_type=self.machine_type,
            site_code="BAM001",
            building="Production Hall A",
            floor="Ground Floor",
            manufacturer="TextileTech",
            model_number="CTG-2024",
            serial_number="CTG2024001",
            primary_operator=self.user,
            operational_status="idle"
        )
    
    def test_machine_type_creation(self):
        """Test MachineType model creation"""
        self.assertEqual(self.machine_type.name, "Cotton Gin")
        self.assertEqual(str(self.machine_type), "Cotton Gin")
        self.assertEqual(self.machine_type.typical_power_consumption, 15.5)
    
    def test_machine_creation(self):
        """Test Machine model creation"""
        self.assertEqual(self.machine.machine_id, "CTN-GIN-001")
        self.assertEqual(str(self.machine), "CTN-GIN-001 - Cotton Gin Unit 1")
        self.assertEqual(self.machine.machine_type, self.machine_type)
        self.assertTrue(self.machine.is_operational)
    
    def test_machine_maintenance_properties(self):
        """Test machine maintenance-related properties"""
        # Initially should not need maintenance
        self.assertFalse(self.machine.needs_maintenance)
        self.assertEqual(self.machine.maintenance_urgency, "normal")
        
        # Simulate high operating hours
        self.machine.hours_since_maintenance = 800
        self.machine.save()
        
        # Should now need maintenance
        self.assertTrue(self.machine.needs_maintenance)
        self.assertEqual(self.machine.maintenance_urgency, "urgent")
    
    def test_machine_operating_hours_update(self):
        """Test updating machine operating hours"""
        initial_hours = self.machine.total_operating_hours
        initial_maintenance_hours = self.machine.hours_since_maintenance
        
        additional_hours = 8.5
        self.machine.update_operating_hours(additional_hours)
        
        self.assertEqual(
            self.machine.total_operating_hours, 
            initial_hours + additional_hours
        )
        self.assertEqual(
            self.machine.hours_since_maintenance, 
            initial_maintenance_hours + additional_hours
        )
    
    def test_machine_maintenance_reset(self):
        """Test resetting maintenance hours"""
        self.machine.hours_since_maintenance = 500
        self.machine.save()
        
        self.machine.reset_maintenance_hours()
        
        self.assertEqual(self.machine.hours_since_maintenance, 0)
        self.assertIsNotNone(self.machine.last_maintenance_date)
