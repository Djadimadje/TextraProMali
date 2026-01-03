 'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import TechnicianSidebar from '../../../../../components/layout/TechnicianSidebar';
import Header from '../../../../../components/layout/Header';
import Card from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import Badge from '../../../../../components/ui/Badge';
import ProgressBar from '../../../../../components/ui/ProgressBar';
import NewTaskForm from '../../../../../components/maintenance/NewTaskForm';
import { useRouter } from 'next/navigation';
import { machineService } from '../../../../../services/machineService';
import { 
  Cog,
  Search,
  Filter,
  Settings,
  Eye,
  PlayCircle,
  PauseCircle,
  AlertTriangle,
  CheckCircle,
  Activity,
  Clock,
  MapPin,
  Wrench,
  Calendar,
  TrendingUp,
  TrendingDown,
  Zap,
  Thermometer,
  Gauge,
  BarChart3,
  RefreshCw,
  Plus,
  FileText,
  AlertCircle,
  Power
} from 'lucide-react';

interface Machine {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  status: 'running' | 'stopped' | 'maintenance' | 'error' | 'standby';
  health: number;
  efficiency: number;
  uptime: number;
  location: string;
  assignedTechnician: string;
  lastMaintenance: string;
  nextMaintenance: string;
  installationDate: string;
  operatingHours: number;
  totalHours: number;
  temperature: number;
  pressure: number;
  vibration: number;
  rpm: number;
  powerConsumption: number;
  productionCount: number;
  dailyTarget: number;
  alerts: string[];
  specifications: {
    maxTemp: number;
    maxPressure: number;
    maxRpm: number;
    powerRating: number;
  };
}

interface MaintenanceHistory {
  id: string;
  machineId: string;
  date: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  description: string;
  technician: string;
  duration: number;
  status: 'completed' | 'in_progress' | 'scheduled';
  cost?: number;
  partsReplaced?: string[];
}

const MachinesPage: React.FC = () => {
  const { user } = useAuth();
    const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'monitoring' | 'maintenance' | 'diagnostics'>('overview');
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    // initial machine load
    loadMachines();
    return () => clearTimeout(timer);
  }, []);

  const initialMachines: Machine[] = [
    {
      id: 'M001',
      name: 'Métier à Tisser A1',
      type: 'Tissage',
      model: 'TexWeave Pro 2024',
      serialNumber: 'TW-2024-001',
      status: 'running',
      health: 95,
      efficiency: 94,
      uptime: 98.5,
      location: 'Atelier A - Poste 1',
      assignedTechnician: 'Mamadou Sidibé',
      lastMaintenance: '2025-01-20',
      nextMaintenance: '2025-02-20',
      installationDate: '2024-03-15',
      operatingHours: 2856,
      totalHours: 3000,
      temperature: 65,
      pressure: 4.2,
      vibration: 2.1,
      rpm: 1450,
      powerConsumption: 15.2,
      productionCount: 1250,
      dailyTarget: 1500,
      alerts: [],
      specifications: {
        maxTemp: 80,
        maxPressure: 6.0,
        maxRpm: 1800,
        powerRating: 18.5
      }
    },
    {
      id: 'M002',
      name: 'Machine Filature B2',
      type: 'Filature',
      model: 'SpinMaster X200',
      serialNumber: 'SM-X200-002',
      status: 'maintenance',
      health: 78,
      efficiency: 87,
      uptime: 85.2,
      location: 'Atelier B - Poste 2',
      assignedTechnician: 'Fatima Koné',
      lastMaintenance: '2025-01-15',
      nextMaintenance: '2025-02-15',
      installationDate: '2024-01-10',
      operatingHours: 4200,
      totalHours: 4500,
      temperature: 0,
      pressure: 0,
      vibration: 0,
      rpm: 0,
      powerConsumption: 0,
      productionCount: 0,
      dailyTarget: 2000,
      alerts: ['Maintenance en cours', 'Système d\'alimentation en réparation'],
      specifications: {
        maxTemp: 70,
        maxPressure: 5.5,
        maxRpm: 2200,
        powerRating: 22.0
      }
    },
    {
      id: 'M003',
      name: 'Système Teinture C1',
      type: 'Teinture',
      model: 'DyeFlow 3000',
      serialNumber: 'DF-3000-003',
      status: 'running',
      health: 89,
      efficiency: 91,
      uptime: 92.8,
      location: 'Atelier C - Zone Teinture',
      assignedTechnician: 'Ibrahim Touré',
      lastMaintenance: '2025-01-22',
      nextMaintenance: '2025-02-22',
      installationDate: '2024-05-20',
      operatingHours: 2100,
      totalHours: 2400,
      temperature: 82,
      pressure: 3.8,
      vibration: 1.8,
      rpm: 800,
      powerConsumption: 28.5,
      productionCount: 480,
      dailyTarget: 600,
      alerts: ['Température élevée - surveillance requise'],
      specifications: {
        maxTemp: 90,
        maxPressure: 5.0,
        maxRpm: 1200,
        powerRating: 35.0
      }
    },
    {
      id: 'M004',
      name: 'Machine Finition D1',
      type: 'Finition',
      model: 'FinishLine Elite',
      serialNumber: 'FL-E-004',
      status: 'running',
      health: 96,
      efficiency: 95,
      uptime: 97.2,
      location: 'Atelier D - Finition',
      assignedTechnician: 'Aminata Coulibaly',
      lastMaintenance: '2025-01-18',
      nextMaintenance: '2025-02-18',
      installationDate: '2024-06-10',
      operatingHours: 1850,
      totalHours: 2000,
      temperature: 45,
      pressure: 2.1,
      vibration: 1.2,
      rpm: 950,
      powerConsumption: 12.8,
      productionCount: 890,
      dailyTarget: 1000,
      alerts: [],
      specifications: {
        maxTemp: 60,
        maxPressure: 3.0,
        maxRpm: 1500,
        powerRating: 15.0
      }
    },
    {
      id: 'M005',
      name: 'Compresseur Air A2',
      type: 'Support',
      model: 'AirMax 500',
      serialNumber: 'AM-500-005',
      status: 'error',
      health: 65,
      efficiency: 72,
      uptime: 78.5,
      location: 'Zone Technique',
      assignedTechnician: 'Sekou Camara',
      lastMaintenance: '2025-01-10',
      nextMaintenance: '2025-01-25',
      installationDate: '2023-12-05',
      operatingHours: 5200,
      totalHours: 6000,
      temperature: 95,
      pressure: 7.2,
      vibration: 4.5,
      rpm: 0,
      powerConsumption: 0,
      productionCount: 0,
      dailyTarget: 0,
      alerts: ['Surchauffe détectée', 'Pression élevée', 'Vibrations anormales', 'Arrêt de sécurité activé'],
      specifications: {
        maxTemp: 85,
        maxPressure: 8.0,
        maxRpm: 3000,
        powerRating: 45.0
      }
    }
  ];

  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showIntervention, setShowIntervention] = useState(false);

  const loadMachines = async () => {
    try {
      const res = await machineService.getMachines({ page_size: 200, created_by_role: 'admin' });
      if (res && res.success && res.data) {
        let list: any[] = [];
        if (Array.isArray(res.data)) list = res.data;
        else if (Array.isArray((res.data as any).results)) list = (res.data as any).results;
        else if (Array.isArray((res as any).results)) list = (res as any).results;
        if (list.length > 0) setMachines(list as any);
      }
    } catch (e) {
      console.error('Failed to load machines on page:', e);
    }
  };

  const maintenanceHistory: MaintenanceHistory[] = [
    {
      id: 'MH001',
      machineId: 'M001',
      date: '2025-01-20',
      type: 'preventive',
      description: 'Maintenance préventive mensuelle - graissage et inspection',
      technician: 'Mamadou Sidibé',
      duration: 120,
      status: 'completed',
      cost: 25000,
      partsReplaced: ['Filtre à huile', 'Courroie principale']
    },
    {
      id: 'MH002',
      machineId: 'M002',
      date: '2025-01-25',
      type: 'corrective',
      description: 'Réparation système d\'alimentation en cours',
      technician: 'Fatima Koné',
      duration: 240,
      status: 'in_progress',
      partsReplaced: ['Pompe alimentation']
    },
    {
      id: 'MH003',
      machineId: 'M005',
      date: '2025-01-26',
      type: 'emergency',
      description: 'Intervention urgente - surchauffe compresseur',
      technician: 'Sekou Camara',
      duration: 180,
      status: 'in_progress',
      partsReplaced: ['Ventilateur', 'Capteur température']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'stopped': return 'default';
      case 'maintenance': return 'warning';
      case 'error': return 'danger';
      case 'standby': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <PlayCircle className="w-4 h-4 text-green-600" />;
      case 'stopped': return <PauseCircle className="w-4 h-4 text-gray-600" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'standby': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <Cog className="w-4 h-4 text-gray-600" />;
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-600';
    if (health >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getParameterStatus = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage > 90) return 'danger';
    if (percentage > 75) return 'warning';
    return 'success';
  };

  if (!user || user.role !== 'technician') {
    return <div>Access denied.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <TechnicianSidebar />
        
        <main className="flex-1 ml-[200px] lg:ml-[240px]">
          <Header title="Gestion des Machines" />
          
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mes Machines Assignées</h1>
                <p className="text-gray-600 mt-1">
                  Surveillance et maintenance des équipements assignés
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" onClick={() => loadMachines()}>
                  <RefreshCw className="mr-2" size={16} />
                  Actualiser
                </Button>
                <Button variant="primary" size="sm" onClick={() => setShowNewTask(true)}>
                  <Plus className="mr-2" size={16} />
                  Nouvelle Tâche
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { key: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
                  { key: 'monitoring', label: 'Surveillance', icon: Activity },
                  { key: 'maintenance', label: 'Maintenance', icon: Wrench },
                  { key: 'diagnostics', label: 'Diagnostics', icon: Settings }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === key
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Machines Actives</p>
                        <p className="text-2xl font-bold text-green-600">
                          {machines.filter(m => m.status === 'running').length}
                        </p>
                      </div>
                      <PlayCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">En Maintenance</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {machines.filter(m => m.status === 'maintenance').length}
                        </p>
                      </div>
                      <Wrench className="w-8 h-8 text-yellow-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Alertes Actives</p>
                        <p className="text-2xl font-bold text-red-600">
                          {machines.reduce((sum, m) => sum + m.alerts.length, 0)}
                        </p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Santé Moyenne</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {(machines.reduce((sum, m) => sum + m.health, 0) / machines.length).toFixed(1)}%
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-blue-600" />
                    </div>
                  </Card>
                </div>

                {/* Machines Grid */}
                <div className="grid gap-6">
                  {machines.map((machine) => (
                    <Card key={machine.id} padding="lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-green-100 rounded-lg">
                            {getStatusIcon(machine.status)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{machine.name}</h3>
                            <p className="text-sm text-gray-600">{machine.model} • {machine.serialNumber}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-500">{machine.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(machine.status) as any} size="sm">
                            {machine.status}
                          </Badge>
                          {machine.alerts.length > 0 && (
                            <Badge variant="danger" size="sm">
                              {machine.alerts.length} alertes
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-xs text-gray-600">Santé</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${getHealthColor(machine.health)}`}>
                              {machine.health}%
                            </span>
                            <ProgressBar 
                              value={machine.health} 
                              variant={machine.health >= 90 ? 'success' : machine.health >= 75 ? 'warning' : 'danger'} 
                              className="h-2 flex-1" 
                            />
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-xs text-gray-600">Efficacité</span>
                          <p className="text-lg font-bold text-gray-900">{machine.efficiency}%</p>
                        </div>
                        
                        <div>
                          <span className="text-xs text-gray-600">Uptime</span>
                          <p className="text-lg font-bold text-gray-900">{machine.uptime}%</p>
                        </div>
                        
                        <div>
                          <span className="text-xs text-gray-600">Production</span>
                          <p className="text-lg font-bold text-gray-900">
                            {machine.productionCount}/{machine.dailyTarget}
                          </p>
                        </div>
                      </div>
                      
                      {machine.alerts.length > 0 && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">Alertes Actives</span>
                          </div>
                          <div className="space-y-1">
                            {machine.alerts.map((alert, index) => (
                              <p key={index} className="text-sm text-red-700">• {alert}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Prochaine maintenance: {new Date(machine.nextMaintenance).toLocaleDateString('fr-FR')}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm">
                            <Eye className="mr-2" size={16} />
                            Détails
                          </Button>
                          <Button variant="primary" size="sm">
                            <Settings className="mr-2" size={16} />
                            Maintenance
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {showNewTask && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <Card padding="md">
                  <div className="p-4">
                    <NewTaskForm onClose={() => setShowNewTask(false)} onCreated={() => setShowNewTask(false)} />
                  </div>
                </Card>
              </div>
            )}

            {/* Monitoring Tab */}
            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Surveillance Temps Réel</h2>
                  
                  <div className="grid gap-6">
                    {machines.filter(m => m.status === 'running' || m.status === 'error').map((machine) => (
                      <div key={machine.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">{machine.name}</h3>
                          <Badge variant={getStatusColor(machine.status) as any} size="sm">
                            {machine.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <Thermometer className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                            <p className="text-xs text-gray-600">Température</p>
                            <p className={`text-lg font-bold ${
                              machine.temperature > machine.specifications.maxTemp * 0.9 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {machine.temperature}°C
                            </p>
                            <div className="mt-1">
                              <ProgressBar 
                                value={(machine.temperature / machine.specifications.maxTemp) * 100} 
                                variant={getParameterStatus(machine.temperature, machine.specifications.maxTemp)} 
                                className="h-1" 
                              />
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <Gauge className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                            <p className="text-xs text-gray-600">Pression</p>
                            <p className={`text-lg font-bold ${
                              machine.pressure > machine.specifications.maxPressure * 0.9 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {machine.pressure} bar
                            </p>
                            <div className="mt-1">
                              <ProgressBar 
                                value={(machine.pressure / machine.specifications.maxPressure) * 100} 
                                variant={getParameterStatus(machine.pressure, machine.specifications.maxPressure)} 
                                className="h-1" 
                              />
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <Activity className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                            <p className="text-xs text-gray-600">Vibration</p>
                            <p className={`text-lg font-bold ${
                              machine.vibration > 3 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {machine.vibration} mm/s
                            </p>
                          </div>
                          
                          <div className="text-center">
                            <Power className="w-6 h-6 mx-auto mb-2 text-green-500" />
                            <p className="text-xs text-gray-600">Consommation</p>
                            <p className={`text-lg font-bold ${
                              machine.powerConsumption > machine.specifications.powerRating * 0.95 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {machine.powerConsumption} kW
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Historique de Maintenance</h2>
                    <Button variant="primary" size="sm" onClick={() => { router.push('/dashboard/technician/maintenance/new'); }}>
                      <Plus className="mr-2" size={16} />
                      Nouvelle Intervention
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {maintenanceHistory.map((maintenance) => {
                      const machine = machines.find(m => m.id === maintenance.machineId);
                      return (
                        <div key={maintenance.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{machine?.name}</h4>
                              <p className="text-sm text-gray-600">{maintenance.description}</p>
                            </div>
                            <Badge 
                              variant={maintenance.status === 'completed' ? 'success' : maintenance.status === 'in_progress' ? 'warning' : 'info'} 
                              size="sm"
                            >
                              {maintenance.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <span className="text-xs text-gray-600">Date:</span>
                              <p className="text-sm font-medium">
                                {new Date(maintenance.date).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-600">Type:</span>
                              <p className="text-sm font-medium capitalize">{maintenance.type}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-600">Durée:</span>
                              <p className="text-sm font-medium">{maintenance.duration} min</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-600">Technicien:</span>
                              <p className="text-sm font-medium">{maintenance.technician}</p>
                            </div>
                          </div>
                          
                          {maintenance.partsReplaced && maintenance.partsReplaced.length > 0 && (
                            <div className="mb-3">
                              <span className="text-xs text-gray-600">Pièces remplacées:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {maintenance.partsReplaced.map((part, index) => (
                                  <Badge key={index} variant="default" size="sm">{part}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="secondary" size="sm">
                              <FileText className="mr-2" size={16} />
                              Rapport
                            </Button>
                            {maintenance.status === 'in_progress' && (
                              <Button variant="primary" size="sm">
                                Mettre à Jour
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* Diagnostics Tab */}
            {activeTab === 'diagnostics' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Diagnostics et Analyse</h2>
                  
                  <div className="grid gap-6">
                    {machines.map((machine) => (
                      <div key={machine.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">{machine.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${getHealthColor(machine.health)}`}>
                              Santé: {machine.health}%
                            </span>
                            {getStatusIcon(machine.status)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <span className="text-xs text-gray-600">Heures de fonctionnement:</span>
                            <p className="text-sm font-medium">{machine.operatingHours.toLocaleString()}h</p>
                            <ProgressBar 
                              value={(machine.operatingHours / machine.totalHours) * 100} 
                              variant="default" 
                              className="h-1 mt-1" 
                            />
                          </div>
                          
                          <div>
                            <span className="text-xs text-gray-600">Efficacité moyenne:</span>
                            <p className="text-sm font-medium">{machine.efficiency}%</p>
                          </div>
                          
                          <div>
                            <span className="text-xs text-gray-600">Disponibilité:</span>
                            <p className="text-sm font-medium">{machine.uptime}%</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Paramètres Actuels</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Température:</span>
                                <span className={machine.temperature > machine.specifications.maxTemp * 0.9 ? 'text-red-600 font-medium' : ''}>
                                  {machine.temperature}°C / {machine.specifications.maxTemp}°C
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Pression:</span>
                                <span className={machine.pressure > machine.specifications.maxPressure * 0.9 ? 'text-red-600 font-medium' : ''}>
                                  {machine.pressure} / {machine.specifications.maxPressure} bar
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Vitesse:</span>
                                <span>{machine.rpm} / {machine.specifications.maxRpm} RPM</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Puissance:</span>
                                <span>{machine.powerConsumption} / {machine.specifications.powerRating} kW</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Maintenance</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Dernière maintenance:</span>
                                <span>{new Date(machine.lastMaintenance).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Prochaine maintenance:</span>
                                <span>{new Date(machine.nextMaintenance).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Installation:</span>
                                <span>{new Date(machine.installationDate).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-4">
                          <Button variant="secondary" size="sm">
                            <BarChart3 className="mr-2" size={16} />
                            Historique
                          </Button>
                          <Button variant="primary" size="sm">
                            <Settings className="mr-2" size={16} />
                            Configurer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                  {showIntervention && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <Card padding="md">
                        <div className="p-4">
                          <NewTaskForm onClose={() => setShowIntervention(false)} onCreated={() => setShowIntervention(false)} />
                        </div>
                      </Card>
                    </div>
                  )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MachinesPage;
