"""
Allocation Services for TexPro AI
Business logic for workforce and material allocation
"""

from datetime import datetime, date
from django.db import transaction
from django.core.exceptions import ValidationError
from allocation.models import WorkforceAllocation, MaterialAllocation, AllocationSummary


def check_workforce_conflicts(user, batch, start_date=None, end_date=None, exclude_id=None):
    """
    Check if user has conflicting workforce allocations
    
    Args:
        user: User to check
        batch: Batch to allocate to
        start_date: Allocation start date
        end_date: Allocation end date
        exclude_id: Allocation ID to exclude from check (for updates)
    
    Returns:
        dict: Conflict information
    """
    
    conflicts = []
    
    # Get existing allocations for this user
    existing_allocations = WorkforceAllocation.objects.filter(user=user)
    
    if exclude_id:
        existing_allocations = existing_allocations.exclude(id=exclude_id)
    
    for allocation in existing_allocations:
        # Check for same batch allocation
        if allocation.batch == batch:
            conflicts.append({
                'type': 'same_batch',
                'message': f'User already allocated to batch {batch.batch_number}',
                'allocation_id': str(allocation.id),
                'role': allocation.role_assigned
            })
            continue
        
        # Check for date overlaps if dates are provided
        if start_date and end_date and allocation.start_date and allocation.end_date:
            # Check if date ranges overlap
            if not (end_date < allocation.start_date or start_date > allocation.end_date):
                conflicts.append({
                    'type': 'date_overlap',
                    'message': f'Date overlap with allocation to batch {allocation.batch.batch_number}',
                    'allocation_id': str(allocation.id),
                    'conflicting_dates': f'{allocation.start_date} to {allocation.end_date}',
                    'role': allocation.role_assigned
                })
    
    return {
        'has_conflicts': len(conflicts) > 0,
        'conflicts': conflicts,
        'can_proceed': len([c for c in conflicts if c['type'] == 'same_batch']) == 0
    }


def allocate_workforce(batch, user, role_assigned=None, allocated_by=None, start_date=None, end_date=None):
    """
    Allocate workforce to a batch with conflict checking
    
    Args:
        batch: BatchWorkflow instance
        user: User to allocate
        role_assigned: Role for this allocation
        allocated_by: User making the allocation
        start_date: Start date
        end_date: End date
    
    Returns:
        tuple: (WorkforceAllocation, conflicts_info)
    """
    
    # Check for conflicts
    conflicts = check_workforce_conflicts(user, batch, start_date, end_date)
    
    # Don't allow same batch allocation
    if not conflicts['can_proceed']:
        same_batch_conflicts = [c for c in conflicts['conflicts'] if c['type'] == 'same_batch']
        raise ValidationError(f"Cannot allocate: {same_batch_conflicts[0]['message']}")
    
    # Create allocation
    with transaction.atomic():
        allocation = WorkforceAllocation.objects.create(
            batch=batch,
            user=user,
            role_assigned=role_assigned,
            allocated_by=allocated_by,
            start_date=start_date,
            end_date=end_date
        )
        
        # Update allocation summary
        update_allocation_summary(batch)
        
        return allocation, conflicts


def allocate_material(batch, material_name, quantity, unit, allocated_by=None, cost_per_unit=None, supplier=None):
    """
    Allocate material to a batch
    
    Args:
        batch: BatchWorkflow instance
        material_name: Name of material
        quantity: Quantity to allocate
        unit: Unit of measurement
        allocated_by: User making the allocation
        cost_per_unit: Cost per unit
        supplier: Material supplier
    
    Returns:
        MaterialAllocation: Created allocation
    """
    
    with transaction.atomic():
        allocation = MaterialAllocation.objects.create(
            batch=batch,
            material_name=material_name,
            quantity=quantity,
            unit=unit,
            allocated_by=allocated_by,
            cost_per_unit=cost_per_unit,
            supplier=supplier
        )
        
        # Update allocation summary
        update_allocation_summary(batch)
        
        return allocation


def update_allocation_summary(batch):
    """Update or create allocation summary for a batch"""
    
    summary, created = AllocationSummary.objects.get_or_create(
        batch=batch,
        defaults={
            'total_workforce': 0,
            'total_material_cost': 0,
            'material_count': 0
        }
    )
    
    summary.refresh_summary()
    return summary


def get_batch_allocation_report(batch):
    """
    Generate comprehensive allocation report for a batch
    
    Args:
        batch: BatchWorkflow instance
    
    Returns:
        dict: Allocation report
    """
    
    workforce_allocations = WorkforceAllocation.objects.filter(batch=batch).select_related('user', 'allocated_by')
    material_allocations = MaterialAllocation.objects.filter(batch=batch).select_related('allocated_by')
    
    # Workforce summary
    workforce_by_role = {}
    total_workforce_cost = 0
    
    for allocation in workforce_allocations:
        role = allocation.role_assigned or 'unassigned'
        if role not in workforce_by_role:
            workforce_by_role[role] = []
        
        workforce_by_role[role].append({
            'user': allocation.user.username,
            'start_date': allocation.start_date,
            'end_date': allocation.end_date,
            'duration_days': allocation.duration_days,
            'allocated_by': allocation.allocated_by.username if allocation.allocated_by else None
        })
    
    # Material summary
    material_by_type = {}
    total_material_cost = 0
    
    for allocation in material_allocations:
        material = allocation.material_name
        if material not in material_by_type:
            material_by_type[material] = {
                'total_quantity': 0,
                'unit': allocation.unit,
                'allocations': [],
                'total_cost': 0
            }
        
        material_by_type[material]['total_quantity'] += allocation.quantity
        material_by_type[material]['allocations'].append({
            'quantity': allocation.quantity,
            'cost_per_unit': allocation.cost_per_unit,
            'total_cost': allocation.total_cost,
            'supplier': allocation.supplier,
            'allocated_by': allocation.allocated_by.username if allocation.allocated_by else None,
            'created_at': allocation.created_at
        })
        
        if allocation.total_cost:
            material_by_type[material]['total_cost'] += allocation.total_cost
            total_material_cost += allocation.total_cost
    
    return {
        'batch_info': {
            'batch_number': batch.batch_number,
            'product_type': batch.product_type,
            'current_stage': batch.current_stage,
            'created_at': batch.created_at
        },
        'workforce_summary': {
            'total_workers': workforce_allocations.count(),
            'by_role': workforce_by_role,
            'estimated_cost': total_workforce_cost
        },
        'material_summary': {
            'total_materials': len(material_by_type),
            'total_cost': total_material_cost,
            'by_type': material_by_type
        },
        'allocation_efficiency': {
            'workforce_utilization': calculate_workforce_utilization(workforce_allocations),
            'material_efficiency': calculate_material_efficiency(material_allocations)
        }
    }


def calculate_workforce_utilization(workforce_allocations):
    """Calculate workforce utilization metrics"""
    
    if not workforce_allocations:
        return {'utilization_rate': 0, 'average_duration': 0}
    
    total_allocations = len(workforce_allocations)
    allocations_with_dates = [a for a in workforce_allocations if a.duration_days]
    
    avg_duration = 0
    if allocations_with_dates:
        avg_duration = sum(a.duration_days for a in allocations_with_dates) / len(allocations_with_dates)
    
    return {
        'utilization_rate': (len(allocations_with_dates) / total_allocations) * 100,
        'average_duration': round(avg_duration, 1),
        'total_allocations': total_allocations
    }


def calculate_material_efficiency(material_allocations):
    """Calculate material efficiency metrics"""
    
    if not material_allocations:
        return {'cost_efficiency': 0, 'supplier_diversity': 0}
    
    # Count unique suppliers
    suppliers = set(a.supplier for a in material_allocations if a.supplier)
    
    # Calculate average cost per allocation
    allocations_with_cost = [a for a in material_allocations if a.total_cost]
    avg_cost = 0
    if allocations_with_cost:
        avg_cost = sum(a.total_cost for a in allocations_with_cost) / len(allocations_with_cost)
    
    return {
        'supplier_diversity': len(suppliers),
        'average_cost_per_allocation': round(float(avg_cost), 2) if avg_cost else 0,
        'total_allocations': len(material_allocations),
        'costed_allocations': len(allocations_with_cost)
    }
