"""
Machine views package
Exports all machine-related views
"""

from .machine import (
    MachineViewSet,
    MachineTypeViewSet,
    MachineMaintenanceView,
    MachineStatusUpdateView,
    MachineOperatingHoursView
)
from .machine_stats import (
    MachineStatsView,
    MachineAnalyticsView,
    MaintenanceAnalyticsView,
    EfficiencyAnalyticsView,
    UtilizationAnalyticsView
)

__all__ = [
    'MachineViewSet',
    'MachineTypeViewSet', 
    'MachineMaintenanceView',
    'MachineStatusUpdateView',
    'MachineOperatingHoursView',
    'MachineStatsView',
    'MachineAnalyticsView',
    'MaintenanceAnalyticsView',
    'EfficiencyAnalyticsView',
    'UtilizationAnalyticsView'
]
