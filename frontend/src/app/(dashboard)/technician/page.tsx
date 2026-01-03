'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import TechnicianSidebar from '../../../../components/layout/TechnicianSidebar';
import Header from '../../../../components/layout/Header';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Badge from '../../../../components/ui/Badge';
import ProgressBar from '../../../../components/ui/ProgressBar';
import { 
  Wrench,
  Cog,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Calendar,
  Target,
  TrendingUp,
  Settings,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  AlertCircle,
  Zap,
  Users,
  FileText,
  Plus
} from 'lucide-react';

// Component Interfaces
interface MaintenanceTask {
  id: string;
  machineId: string;
  machineName: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  scheduledDate: string;
  estimatedDuration: number;
  assignedTo: string;
  description: string;
  location: string;
}

interface MachineStatus {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'maintenance' | 'error';
  health: number;
  lastMaintenance: string;
  nextMaintenance: string;
  location: string;
  assignedTechnician: string;
  uptime: number;
  efficiency: number;
}

interface TechnicianMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target?: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

// Main Components
const TechnicianOverview: React.FC = () => {
  const metrics: TechnicianMetric[] = [
    { id: 'M1', name: 'Tâches Aujourd\'hui', value: 6, unit: '', trend: 'stable', status: 'good' },
    { id: 'M2', name: 'Machines Assignées', value: 12, unit: '', trend: 'stable', status: 'good' },
    { id: 'M3', name: 'Temps Réponse Moyen', value: 18, unit: 'min', target: 20, trend: 'down', status: 'good' },
    { id: 'M4', name: 'Taux de Résolution', value: 94, unit: '%', target: 90, trend: 'up', status: 'good' }
  ];

  return (
    <Card padding="lg">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Vue d'Ensemble</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-2xl font-bold text-green-600">{metric.value}{metric.unit}</p>
            <p className="text-sm text-gray-600 mt-1">{metric.name}</p>
            {metric.target && (
              <p className="text-xs text-gray-500">Objectif: {metric.target}{metric.unit}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

const TodayTasks: React.FC<{ tasks: MaintenanceTask[] }> = ({ tasks }) => {
  const todayTasks = tasks.filter(task => 
    new Date(task.scheduledDate).toDateString() === new Date().toDateString()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'pending': return 'info';
      case 'delayed': return 'danger';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'corrective': return <Wrench className="w-4 h-4 text-orange-600" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'inspection': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Cog className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tâches d'Aujourd'hui</h3>
        <Badge variant="info" size="sm">{todayTasks.length} tâches</Badge>
      </div>
      
      <div className="space-y-3">
        {todayTasks.slice(0, 5).map((task) => (
          <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-3">
              {getTypeIcon(task.type)}
              <div>
                <p className="font-medium text-sm text-gray-900">{task.machineName}</p>
                <p className="text-xs text-gray-600">{task.description}</p>
                <p className="text-xs text-gray-500">{task.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getPriorityColor(task.priority) as any} size="sm">
                {task.priority}
              </Badge>
              <Badge variant={getStatusColor(task.status) as any} size="sm">
                {task.status}
              </Badge>
            </div>
          </div>
        ))}
        
        {todayTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p>Aucune tâche programmée pour aujourd'hui</p>
          </div>
        )}
      </div>
    </Card>
  );
};

const MachineStatusPanel: React.FC<{ machines: MachineStatus[] }> = ({ machines }) => {
  const assignedMachines = machines.filter(m => m.assignedTechnician === 'Current User');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'stopped': return 'default';
      case 'maintenance': return 'warning';
      case 'error': return 'danger';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <PlayCircle className="w-4 h-4 text-green-600" />;
      case 'stopped': return <PauseCircle className="w-4 h-4 text-gray-600" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Cog className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Mes Machines Assignées</h3>
        <Badge variant="success" size="sm">{assignedMachines.length} machines</Badge>
      </div>
      
      <div className="grid gap-3">
        {assignedMachines.slice(0, 4).map((machine) => (
          <div key={machine.id} className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(machine.status)}
                <span className="font-medium text-sm">{machine.name}</span>
              </div>
              <Badge variant={getStatusColor(machine.status) as any} size="sm">
                {machine.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div>
                <span>Santé: </span>
                <span className={`font-medium ${machine.health >= 90 ? 'text-green-600' : machine.health >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {machine.health}%
                </span>
              </div>
              <div>
                <span>Uptime: </span>
                <span className="font-medium">{machine.uptime}%</span>
              </div>
              <div>
                <span>Efficacité: </span>
                <span className="font-medium">{machine.efficiency}%</span>
              </div>
              <div>
                <span>Localisation: </span>
                <span className="font-medium">{machine.location}</span>
              </div>
            </div>
            
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Santé Globale</span>
                <span>{machine.health}%</span>
              </div>
              <ProgressBar 
                value={machine.health} 
                variant={machine.health >= 90 ? 'success' : machine.health >= 70 ? 'warning' : 'danger'} 
                className="h-2" 
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const MaintenanceAlerts: React.FC = () => {
  const alerts = [
    { id: 'A1', machine: 'Métier à Tisser A1', type: 'Maintenance Urgente', priority: 'critical', time: '10 min' },
    { id: 'A2', machine: 'Machine Filature B2', type: 'Inspection Due', priority: 'medium', time: '2h' },
    { id: 'A3', machine: 'Système Teinture C1', type: 'Vérification Routine', priority: 'low', time: '1 jour' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Alertes Maintenance</h3>
        <Badge variant="danger" size="sm">{alerts.length}</Badge>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-center justify-between p-3 border-l-4 border-l-orange-500 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <div>
                <p className="font-medium text-sm text-gray-900">{alert.machine}</p>
                <p className="text-xs text-gray-600">{alert.type}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={getPriorityColor(alert.priority) as any} size="sm">
                {alert.priority}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">Dans {alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

import NewTaskForm from '../../../../components/maintenance/NewTaskForm';
import InspectionForm from '../../../../components/maintenance/InspectionForm';

const QuickActions: React.FC<{ onTaskCreated?: (created: any) => void }> = ({ onTaskCreated }) => {
  const actions = [
    { id: 'qa1', label: 'Nouvelle Tâche', icon: Plus, color: 'bg-green-500 hover:bg-green-600' },
    { id: 'qa2', label: 'Rapport Intervention', icon: FileText, color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'qa3', label: 'Inspection Machine', icon: CheckCircle, color: 'bg-purple-500 hover:bg-purple-600' },
    { id: 'qa4', label: 'Demande Pièces', icon: Settings, color: 'bg-orange-500 hover:bg-orange-600' }
  ];
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleAction = (actionId: string, label: string) => {
    // Minimal local behavior: open a confirmation modal/placeholder
    console.log('Quick action invoked:', actionId);
    setActiveAction(label);
  };

  return (
    <Card padding="lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action.id, action.label)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-white transition-colors ${action.color}`}
            >
              <IconComponent size={24} />
              <span className="text-sm font-medium text-center">{action.label}</span>
            </button>
          );
        })}
      </div>

      {activeAction && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <Card padding="md">
            <div className="p-4">
              {activeAction === 'Nouvelle Tâche' ? (
                <NewTaskForm onClose={() => setActiveAction(null)} onCreated={(created) => { if (onTaskCreated) onTaskCreated(created); }} />
              ) : activeAction === 'Inspection Machine' ? (
                <InspectionForm onClose={() => setActiveAction(null)} onCreated={(created) => { if (onTaskCreated) onTaskCreated(created); }} />
              ) : (
                <div>
                  <h4 className="text-lg font-semibold mb-2">{activeAction}</h4>
                  <p className="text-sm text-gray-600 mb-4">This is a placeholder for the "{activeAction}" flow.</p>
                  <div className="flex justify-end gap-2">
                    <Button onClick={() => setActiveAction(null)} variant="secondary" size="sm">Close</Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};

// Main Dashboard Component
const TechnicianDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Sample data (kept in state so we can refresh when a new task is created)
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([
    {
      id: 'MT001',
      machineId: 'M001',
      machineName: 'Métier à Tisser A1',
      type: 'preventive',
      priority: 'medium',
      status: 'pending',
      scheduledDate: new Date().toISOString(),
      estimatedDuration: 120,
      assignedTo: 'Current User',
      description: 'Maintenance préventive mensuelle',
      location: 'Atelier A'
    },
    {
      id: 'MT002',
      machineId: 'M002',
      machineName: 'Machine Filature B2',
      type: 'corrective',
      priority: 'high',
      status: 'in_progress',
      scheduledDate: new Date().toISOString(),
      estimatedDuration: 90,
      assignedTo: 'Current User',
      description: 'Réparation système d\'alimentation',
      location: 'Atelier B'
    },
    {
      id: 'MT003',
      machineId: 'M003',
      machineName: 'Système Teinture C1',
      type: 'inspection',
      priority: 'low',
      status: 'completed',
      scheduledDate: new Date().toISOString(),
      estimatedDuration: 60,
      assignedTo: 'Current User',
      description: 'Inspection qualité hebdomadaire',
      location: 'Atelier C'
    }
  ]);

  const handleTaskCreated = (created: any) => {
    if (!created) return;
    const newTask: MaintenanceTask = {
      id: String(created.id || `MT${Date.now()}`),
      machineId: String(created.machine?.id || created.machine || created.machine_id || 'M-unknown'),
      machineName: created.machine?.name || created.machine_name || String(created.machine) || 'Machine',
      type: (created.type as any) || 'corrective',
      priority: (created.priority as any) || 'medium',
      status: (created.status as any) || 'pending',
      scheduledDate: created.scheduled_date || created.created_at || new Date().toISOString(),
      estimatedDuration: created.estimated_duration || 60,
      assignedTo: created.technician_name || created.assigned_to || 'Current User',
      description: created.issue_reported || created.description || '',
      location: created.location || ''
    };
    setMaintenanceTasks(prev => [newTask, ...prev]);
  };

  const machines: MachineStatus[] = [
    {
      id: 'M001',
      name: 'Métier à Tisser A1',
      type: 'Tissage',
      status: 'running',
      health: 95,
      lastMaintenance: '2025-01-20',
      nextMaintenance: '2025-02-20',
      location: 'Atelier A',
      assignedTechnician: 'Current User',
      uptime: 98,
      efficiency: 94
    },
    {
      id: 'M002',
      name: 'Machine Filature B2',
      type: 'Filature',
      status: 'maintenance',
      health: 78,
      lastMaintenance: '2025-01-15',
      nextMaintenance: '2025-02-15',
      location: 'Atelier B',
      assignedTechnician: 'Current User',
      uptime: 85,
      efficiency: 87
    },
    {
      id: 'M003',
      name: 'Système Teinture C1',
      type: 'Teinture',
      status: 'running',
      health: 89,
      lastMaintenance: '2025-01-22',
      nextMaintenance: '2025-02-22',
      location: 'Atelier C',
      assignedTechnician: 'Current User',
      uptime: 92,
      efficiency: 91
    },
    {
      id: 'M004',
      name: 'Machine Finition D1',
      type: 'Finition',
      status: 'running',
      health: 96,
      lastMaintenance: '2025-01-18',
      nextMaintenance: '2025-02-18',
      location: 'Atelier D',
      assignedTechnician: 'Current User',
      uptime: 97,
      efficiency: 95
    }
  ];

  if (!user || user.role !== 'technician') {
    return <div>Access denied.</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <TechnicianSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-[240px]">
        <Header 
          userRole="technician"
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user?.first_name || user?.username || 'Technician'}!
            </h1>
            <p className="text-gray-600 text-lg">
              Manage maintenance tasks, monitor machines, and ensure operational excellence.
            </p>
          </div>

          {/* Dashboard Content */}
          <div className="space-y-6">
            {/* Top Row - Overview */}
            <TechnicianOverview />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TodayTasks tasks={maintenanceTasks} />
              <MachineStatusPanel machines={machines} />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MaintenanceAlerts />
              <QuickActions onTaskCreated={handleTaskCreated} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
