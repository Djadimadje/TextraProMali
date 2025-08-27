"""
Comprehensive test suite for maintenance app
Tests models, serializers, views, permissions, and services
"""
import uuid
from datetime import date, timedelta
from decimal import Decimal

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIRequestFactory

from machines.models import Machine, MachineType
from maintenance.models import MaintenanceLog
from maintenance.serializers import (
    MaintenanceLogSerializer,
    MaintenanceLogCreateSerializer,
    MaintenanceLogUpdateSerializer
)
from maintenance.services import PredictiveMaintenanceService
from maintenance.permissions import MaintenancePermission

User = get_user_model()


class MaintenanceTestMixin:
    """Mixin providing common test data for maintenance tests"""
    
    @classmethod
    def setUpTestData(cls):
        """Set up test data that can be shared across test methods"""
        
        # Create machine type (use get_or_create to avoid duplicates)
        cls.machine_type, _ = MachineType.objects.get_or_create(
            name="Weaving Loom",
            defaults={
                'description': "Industrial weaving loom for cotton textiles",
                'manufacturer': "TextileTech Corp",
                'typical_power_consumption': 15.5,
                'typical_production_rate': 100.0,
                'production_unit': "m/hr"
            }
        )
        
        # Create machines
        cls.machine_1 = Machine.objects.create(
            machine_id="LOOM-001",
            name="Loom-001",
            machine_type=cls.machine_type,
            serial_number="WT2000-001",
            installation_date=date(2024, 1, 15),
            operational_status="running"
        )
        
        cls.machine_2 = Machine.objects.create(
            machine_id="LOOM-002",
            name="Loom-002", 
            machine_type=cls.machine_type,
            serial_number="WT2000-002",
            installation_date=date(2024, 2, 1),
            operational_status="maintenance"
        )
        
        # Create users with different roles
        cls.admin_user = User.objects.create_user(
            username="admin_user",
            email="admin@texpro.com",
            password="testpass123",
            role="admin",
            first_name="Admin",
            last_name="User",
            employee_id="AD0001"
        )
        
        cls.technician_user = User.objects.create_user(
            username="tech_user",
            email="tech@texpro.com", 
            password="testpass123",
            role="technician",
            first_name="Tech",
            last_name="User",
            employee_id="TC0001"
        )
        
        cls.supervisor_user = User.objects.create_user(
            username="supervisor_user",
            email="supervisor@texpro.com",
            password="testpass123", 
            role="supervisor",
            first_name="Supervisor",
            last_name="User",
            employee_id="SV0001"
        )
        
        cls.inspector_user = User.objects.create_user(
            username="inspector_user",
            email="inspector@texpro.com",
            password="testpass123",
            role="inspector", 
            first_name="Inspector",
            last_name="User",
            employee_id="IN0001"
        )
        
        cls.analyst_user = User.objects.create_user(
            username="analyst_user",
            email="analyst@texpro.com",
            password="testpass123",
            role="analyst",
            first_name="Analyst", 
            last_name="User",
            employee_id="AN0001"
        )
    
    def create_maintenance_log(self, **kwargs):
        """Helper method to create maintenance logs with defaults"""
        defaults = {
            'machine': self.machine_1,
            'technician': self.technician_user,
            'issue_reported': 'Test maintenance issue description',
            'priority': 'medium',
            'status': 'pending',
            'reported_at': timezone.now()
        }
        defaults.update(kwargs)
        return MaintenanceLog.objects.create(**defaults)
    
    def create_completed_maintenance_log(self, **kwargs):
        """Helper method to create completed maintenance logs"""
        # Ensure resolved_at is after reported_at
        resolved_at = kwargs.get('resolved_at', timezone.now())
        reported_at = kwargs.get('reported_at')
        
        if reported_at is None:
            # If no reported_at provided, set it before resolved_at
            reported_at = resolved_at - timedelta(hours=2)
        elif resolved_at < reported_at:
            # If resolved_at is before reported_at, adjust reported_at
            reported_at = resolved_at - timedelta(hours=1)
        
        defaults = {
            'status': 'completed',
            'action_taken': 'Replaced faulty component and tested system',
            'resolved_at': resolved_at,
            'reported_at': reported_at,
            'downtime_hours': Decimal('2.5'),
            'cost': Decimal('150.00'),
            'parts_replaced': 'Motor bearing, tension cable',
            'notes': 'System running normally after repair'
        }
        defaults.update(kwargs)
        return self.create_maintenance_log(**defaults)


# MODEL TESTS
class MaintenanceLogModelTest(MaintenanceTestMixin, TestCase):
    """Test cases for MaintenanceLog model"""
    
    def test_maintenance_log_creation(self):
        """Test creating a maintenance log"""
        maintenance_log = self.create_maintenance_log()
        
        self.assertIsNotNone(maintenance_log.id)
        self.assertEqual(maintenance_log.machine, self.machine_1)
        self.assertEqual(maintenance_log.technician, self.technician_user)
        self.assertEqual(maintenance_log.status, 'pending')
        self.assertEqual(maintenance_log.priority, 'medium')
        self.assertIsNotNone(maintenance_log.created_at)
        self.assertIsNotNone(maintenance_log.updated_at)
    
    def test_maintenance_log_str_representation(self):
        """Test string representation of maintenance log"""
        maintenance_log = self.create_maintenance_log()
        expected_str = f"Maintenance {maintenance_log.machine.machine_id} - {maintenance_log.status} ({maintenance_log.reported_at.date()})"
        self.assertEqual(str(maintenance_log), expected_str)
    
    def test_machine_info_property(self):
        """Test machine_info property"""
        maintenance_log = self.create_maintenance_log()
        machine_info = maintenance_log.machine_info
        
        self.assertEqual(machine_info['machine_id'], 'LOOM-001')
        self.assertEqual(machine_info['name'], 'Loom-001')
        self.assertEqual(machine_info['type'], 'Weaving Loom')
        self.assertIn('location', machine_info)
    
    def test_is_overdue_property(self):
        """Test is_overdue property"""
        # Test with future due date
        future_date = timezone.now().date() + timedelta(days=5)
        future_log = self.create_maintenance_log(next_due_date=future_date)
        self.assertFalse(future_log.is_overdue)
        
        # Test with past due date
        past_date = timezone.now().date() - timedelta(days=5)
        overdue_log = self.create_maintenance_log(
            next_due_date=past_date,
            status='pending'
        )
        self.assertTrue(overdue_log.is_overdue)


# SERIALIZER TESTS
class MaintenanceLogSerializerTest(MaintenanceTestMixin, TestCase):
    """Test cases for maintenance serializers"""
    
    def test_maintenance_log_serializer_fields(self):
        """Test serializer includes all expected fields"""
        maintenance_log = self.create_maintenance_log()
        serializer = MaintenanceLogSerializer(maintenance_log)
        
        expected_fields = [
            'id', 'machine', 'technician', 'technician_name',
            'issue_reported', 'action_taken', 'status', 'priority',
            'reported_at', 'resolved_at', 'next_due_date',
            'downtime_hours', 'cost', 'machine_info',
            'duration_hours', 'is_overdue', 'days_since_reported',
            'created_at', 'updated_at'
        ]
        
        for field in expected_fields:
            self.assertIn(field, serializer.data)
    
    def test_create_serializer_validation(self):
        """Test create serializer validation"""
        data = {
            'machine': self.machine_1.id,
            'technician': self.technician_user.id,
            'issue_reported': 'Test issue description for maintenance',
            'priority': 'high'
        }
        
        serializer = MaintenanceLogCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_create_serializer_technician_role_validation(self):
        """Test that only users with technician role can be assigned"""
        data = {
            'machine': self.machine_1.id,
            'technician': self.supervisor_user.id,  # Not a technician
            'issue_reported': 'Test issue description',
            'priority': 'medium'
        }
        
        serializer = MaintenanceLogCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('technician', serializer.errors)


# VIEW TESTS
class MaintenanceLogViewSetTest(MaintenanceTestMixin, APITestCase):
    """Test cases for MaintenanceLogViewSet"""
    
    def test_list_maintenance_logs_as_admin(self):
        """Test listing maintenance logs as admin user"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Create test data
        self.create_maintenance_log(issue_reported="First issue")
        self.create_maintenance_log(issue_reported="Second issue")
        
        url = reverse('v1:maintenance:maintenance-logs-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_create_maintenance_log_as_technician(self):
        """Test creating maintenance log as technician user"""
        self.client.force_authenticate(user=self.technician_user)
        
        data = {
            'machine': str(self.machine_1.id),
            'technician': str(self.technician_user.id),
            'issue_reported': 'Technician reported maintenance issue',
            'priority': 'medium'
        }
        
        url = reverse('v1:maintenance:maintenance-logs-list')
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_create_maintenance_log_as_supervisor_denied(self):
        """Test that supervisors cannot create maintenance logs"""
        self.client.force_authenticate(user=self.supervisor_user)
        
        data = {
            'machine': str(self.machine_1.id),
            'technician': str(self.technician_user.id),
            'issue_reported': 'Supervisor trying to create',
            'priority': 'medium'
        }
        
        url = reverse('v1:maintenance:maintenance-logs-list')
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_update_maintenance_log_as_technician(self):
        """Test updating maintenance log as technician"""
        self.client.force_authenticate(user=self.technician_user)
        
        maintenance_log = self.create_maintenance_log()
        
        data = {
            'status': 'in_progress',
            'action_taken': 'Started troubleshooting the issue'
        }
        
        url = reverse('v1:maintenance:maintenance-logs-detail', args=[maintenance_log.id])
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        maintenance_log.refresh_from_db()
        self.assertEqual(maintenance_log.status, 'in_progress')
        self.assertEqual(maintenance_log.action_taken, 'Started troubleshooting the issue')
    
    def test_maintenance_stats_as_admin(self):
        """Test getting maintenance statistics as admin"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Create test data
        self.create_maintenance_log(status='pending', priority='high')
        self.create_completed_maintenance_log(status='completed', priority='medium')
        
        url = reverse('v1:maintenance:maintenance-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data
        self.assertEqual(data['total_maintenance_logs'], 2)
        self.assertEqual(data['pending_count'], 1)
        self.assertEqual(data['completed_count'], 1)
        self.assertIn('stats_by_status', data)
        self.assertIn('stats_by_priority', data)


# SERVICE TESTS
class PredictiveMaintenanceServiceTest(MaintenanceTestMixin, TestCase):
    """Test cases for PredictiveMaintenanceService"""
    
    def test_predict_next_due_no_history(self):
        """Test prediction when machine has no maintenance history"""
        next_due = PredictiveMaintenanceService.predict_next_due(self.machine_1)
        
        # Should predict 30 days from installation date (since no maintenance history)
        expected_date = self.machine_1.installation_date + timedelta(days=30)
        self.assertEqual(next_due, expected_date)
    
    def test_calculate_urgency_overdue(self):
        """Test urgency calculation for overdue maintenance"""
        # Create overdue maintenance
        past_date = timezone.now().date() - timedelta(days=5)
        self.create_maintenance_log(
            machine=self.machine_1,
            next_due_date=past_date,
            status='pending'
        )
        
        urgency = PredictiveMaintenanceService.calculate_urgency(self.machine_1)
        self.assertEqual(urgency, 'critical')
    
    def test_get_maintenance_recommendations(self):
        """Test recommendations for operational machine"""
        recommendations = PredictiveMaintenanceService.get_maintenance_recommendations(
            self.machine_1
        )
        
        self.assertIsInstance(recommendations, list)
        self.assertGreater(len(recommendations), 0)


# PERMISSION TESTS
class MaintenancePermissionTest(MaintenanceTestMixin, TestCase):
    """Test cases for MaintenancePermission"""
    
    def setUp(self):
        """Set up test data"""
        # Only call setUpTestData if not already called
        if not hasattr(self, 'machine_type'):
            self.setUpTestData()
        self.factory = APIRequestFactory()
        self.permission = MaintenancePermission()
    
    def test_admin_full_access(self):
        """Test admin has full access"""
        request = self.factory.get('/')
        request.user = self.admin_user
        
        has_permission = self.permission.has_permission(request, None)
        self.assertTrue(has_permission)
    
    def test_technician_create_read_update_access(self):
        """Test technician has create, read, update access"""
        request = self.factory.post('/')
        request.user = self.technician_user
        
        has_permission = self.permission.has_permission(request, None)
        self.assertTrue(has_permission)
    
    def test_supervisor_read_only_access(self):
        """Test supervisor has read-only access"""
        request = self.factory.get('/')
        request.user = self.supervisor_user
        
        has_permission = self.permission.has_permission(request, None)
        self.assertTrue(has_permission)
        
        request = self.factory.post('/')
        request.user = self.supervisor_user
        
        has_permission = self.permission.has_permission(request, None)
        self.assertFalse(has_permission)
    
    def test_unauthenticated_access_denied(self):
        """Test unauthenticated users are denied access"""
        from django.contrib.auth.models import AnonymousUser
        
        request = self.factory.get('/')
        request.user = AnonymousUser()
        
        has_permission = self.permission.has_permission(request, None)
        self.assertFalse(has_permission)


# INTEGRATION TESTS
class MaintenanceIntegrationTest(MaintenanceTestMixin, APITestCase):
    """Integration tests for maintenance workflow"""
    
    def test_complete_maintenance_workflow(self):
        """Test complete maintenance workflow from creation to completion"""
        self.client.force_authenticate(user=self.admin_user)
        
        # 1. Create maintenance log
        create_data = {
            'machine': str(self.machine_1.id),
            'technician': str(self.technician_user.id),
            'issue_reported': 'Motor making unusual noise during operation',
            'priority': 'high'
        }
        
        url = reverse('v1:maintenance:maintenance-logs-list')
        response = self.client.post(url, create_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        maintenance_id = response.data['id']
        
        # 2. Update to in-progress
        update_data = {
            'status': 'in_progress',
            'action_taken': 'Investigating motor noise issue'
        }
        
        url = reverse('v1:maintenance:maintenance-logs-detail', args=[maintenance_id])
        response = self.client.patch(url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 3. Complete maintenance
        complete_data = {
            'action_taken': 'Replaced motor bearings and lubricated system',
            'downtime_hours': '4.0',
            'cost': '250.00',
            'parts_replaced': 'Motor bearings x2',
            'notes': 'Motor running smoothly after repair'
        }
        
        url = reverse('v1:maintenance:maintenance-logs-mark-completed', args=[maintenance_id])
        response = self.client.post(url, complete_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 4. Verify completion
        maintenance_log = MaintenanceLog.objects.get(id=maintenance_id)
        self.assertEqual(maintenance_log.status, 'completed')
        self.assertIsNotNone(maintenance_log.resolved_at)
        self.assertEqual(maintenance_log.cost, Decimal('250.00'))
    
    def test_predictive_maintenance_workflow(self):
        """Test predictive maintenance workflow"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Create some maintenance history
        self.create_completed_maintenance_log(
            machine=self.machine_1,
            resolved_at=timezone.now() - timedelta(days=30)
        )
        
        # Get predictive maintenance data
        url = reverse('v1:maintenance:predictive-maintenance')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should include our machine
        machine_ids = [item['machine_id'] for item in response.data]
        self.assertIn(str(self.machine_1.id), machine_ids)
        
        # Get specific machine prediction
        url = reverse('v1:maintenance:machine-prediction', args=[self.machine_1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.assertEqual(response.data['machine_id'], str(self.machine_1.id))
        self.assertIn('next_due_date', response.data)
        self.assertIn('urgency', response.data)
        self.assertIn('recommendations', response.data)
