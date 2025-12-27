'use client';

import React from 'react';
import { 
  Wrench,
  MapPin,
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
      <div className="overflow-x-visible">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Machine
              </th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type & Status
              </th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operating Hours
              </th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Maintenance
              </th>
              
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {machines.map((machine) => (
              <tr key={machine.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
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

                    {/* Small-screen condensed info: show type & status */}
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 md:hidden">
                      <span>{typeof machine.machine_type === 'object' ? machine.machine_type.name : 'Unknown'}</span>
                      <span className="mx-1">•</span>
                      {getStatusBadge(machine.operational_status)}
                    </div>
                  </div>
                </td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm text-gray-900">
                      {typeof machine.machine_type === 'object' ? machine.machine_type.name : 'Unknown Type'}
                    </div>
                    {getStatusBadge(machine.operational_status)}
                  </div>
                </td>
                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
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
                <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col text-sm">
                    <div className="text-gray-900">
                      Total: {formatOperatingHours(machine.total_operating_hours)}
                    </div>
                    <div className="text-gray-500">
                      Since maintenance: {formatOperatingHours(machine.hours_since_maintenance)}
                    </div>
                  </div>
                </td>
                <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
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
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MachineTable;
