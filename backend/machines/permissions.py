"""
Machines app permissions
TexPro AI - Machine management access control
"""
from rest_framework import permissions
from users.permissions import HasRolePermission


class CanManageMachines(HasRolePermission):
    """Permission to manage machines"""
    required_permission = 'can_manage_machines'


class CanViewMachines(permissions.BasePermission):
    """Permission to view machines"""
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and
            request.user.status == 'active'
        )


class IsMachineOperator(permissions.BasePermission):
    """Permission for machine operators"""
    def has_object_permission(self, request, view, obj):
        return obj.primary_operator == request.user
