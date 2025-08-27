'use client';

import React from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Wrench, 
  Clock,
  MapPin,
  User,
  AlertTriangle
} from 'lucide-react';
import { Machine } from '../../../../../../services/machineService';
import { machineService } from '../../../../../../services/machineService';

interface MachineTableProps {
  machines: Machine[];
  onEditMachine: (machine: Machine) => void;
  onDeleteMachine: (machine: Machine) => void;
  onViewMachine: (machine: Machine) => void;
  onScheduleMaintenance: (machine: Machine) => void;
}

const MachineTable: React.FC<MachineTableProps> = ({
  machines,
  onEditMachine,
  onDeleteMachine,
  onViewMachine,
  onScheduleMaintenance
}) => {
  const getStatusBadge = (status: string) => {
    const color = machineService.getOperationalStatusColor(status);
    const display = machineService.getOperationalStatusDisplay(status);
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {display}
      </span>
    );
  };

  const getMaintenanceUrgencyBadge = (urgency?: string) => {
    if (!urgency || urgency === 'unknown') return null;
    
    const color = machineService.getMaintenanceUrgencyColor(urgency);
    const displayMap = {
      'normal': 'Normal',
      'due_soon': 'Due Soon',
      'urgent': 'Urgent',
      'critical': 'Critical'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {displayMap[urgency as keyof typeof displayMap] || urgency}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const formatOperatingHours = (hours: number) => {
    if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours.toFixed(1)}h`;
    }
  };

  if (machines.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-center py-12">
          <Wrench className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No machines found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first machine.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Machine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type & Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operating Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Maintenance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operator
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {machines.map((machine) => (
              <tr key={machine.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {machine.machine_id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {machine.name}
                    </div>
                    {machine.model_number && (
                      <div className="text-xs text-gray-400">
                        {machine.manufacturer} {machine.model_number}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm text-gray-900">
                      {typeof machine.machine_type === 'object' ? machine.machine_type.name : 'Unknown Type'}
                    </div>
                    {getStatusBadge(machine.operational_status)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                    <div className="flex flex-col">
                      {machine.building && (
                        <span>{machine.building}</span>
                      )}
                      {machine.floor && (
                        <span className="text-xs text-gray-500">{machine.floor}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col text-sm">
                    <div className="text-gray-900">
                      Total: {formatOperatingHours(machine.total_operating_hours)}
                    </div>
                    <div className="text-gray-500">
                      Since maintenance: {formatOperatingHours(machine.hours_since_maintenance)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-gray-500">
                      Last: {formatDate(machine.last_maintenance_date)}
                    </div>
                    {machine.maintenance_urgency && getMaintenanceUrgencyBadge(machine.maintenance_urgency)}
                    {machine.needs_maintenance && (
                      <div className="flex items-center text-xs text-orange-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Due
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {machine.primary_operator ? (
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="flex flex-col">
                        <span className="text-gray-900">
                          {machine.primary_operator.first_name} {machine.primary_operator.last_name}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {machine.primary_operator.role}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewMachine(machine)}
                      className="text-purple-600 hover:text-purple-900 p-1 rounded-md hover:bg-purple-50"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditMachine(machine)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                      title="Edit Machine"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onScheduleMaintenance(machine)}
                      className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                      title="Schedule Maintenance"
                    >
                      <Wrench className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteMachine(machine)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                      title="Delete Machine"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MachineTable;
