'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import SupervisorSidebar from '../../../../../components/layout/SupervisorSidebar';
import Header from '../../../../../components/layout/Header';
import Card from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import Badge from '../../../../../components/ui/Badge';
import ProgressBar from '../../../../../components/ui/ProgressBar';
import { 
  Users,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Settings,
  Eye,
  Edit,
  BarChart3,
  MapPin,
  Wrench,
  Target,
  Activity,
  UserCheck,
  UserX
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'assigned' | 'break' | 'absent';
  skills: string[];
  efficiency: number;
  currentAssignment?: string;
  shift: string;
  experience: number;
  performance: number;
}

interface Team {
  id: string;
  name: string;
  supervisor: string;
  members: TeamMember[];
  status: 'active' | 'break' | 'maintenance';
  currentTask: string;
  productivity: number;
  shift: string;
  location: string;
}

interface Resource {
  id: string;
  name: string;
  type: 'machine' | 'tool' | 'space';
  status: 'available' | 'in_use' | 'maintenance';
  location: string;
  assignedTo?: string;
  capacity: number;
  utilization: number;
  nextMaintenance: string;
}

const AllocationPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'staff' | 'resources'>('overview');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const teams: Team[] = [
    {
      id: 'T001',
      name: 'Équipe Alpha',
      supervisor: 'Amadou Traoré',
      members: [
        { id: 'M001', name: 'Mamadou Sidibé', role: 'Opérateur', status: 'assigned', skills: ['Tissage', 'Contrôle Qualité'], efficiency: 95, currentAssignment: 'BATCH-2025-0892', shift: 'Jour', experience: 5, performance: 92 },
        { id: 'M002', name: 'Fatoumata Koné', role: 'Technicienne', status: 'assigned', skills: ['Filature', 'Maintenance'], efficiency: 88, currentAssignment: 'BATCH-2025-0892', shift: 'Jour', experience: 3, performance: 89 },
        { id: 'M003', name: 'Sekou Camara', role: 'Opérateur', status: 'break', skills: ['Tissage'], efficiency: 91, shift: 'Jour', experience: 4, performance: 87 },
        { id: 'M004', name: 'Awa Diarra', role: 'Contrôleur', status: 'assigned', skills: ['Contrôle Qualité', 'Inspection'], efficiency: 96, currentAssignment: 'BATCH-2025-0892', shift: 'Jour', experience: 6, performance: 94 }
      ],
      status: 'active',
      currentTask: 'Production Cotton Fabric Premium',
      productivity: 94,
      shift: 'Jour (6h-14h)',
      location: 'Atelier A'
    },
    {
      id: 'T002',
      name: 'Équipe Beta',
      supervisor: 'Fatima Diallo',
      members: [
        { id: 'M005', name: 'Ibrahim Touré', role: 'Opérateur', status: 'available', skills: ['Filature', 'Teinture'], efficiency: 89, shift: 'Jour', experience: 4, performance: 85 },
        { id: 'M006', name: 'Mariama Keita', role: 'Technicienne', status: 'available', skills: ['Teinture', 'Finition'], efficiency: 92, shift: 'Jour', experience: 5, performance: 90 },
        { id: 'M007', name: 'Boubacar Sangaré', role: 'Opérateur', status: 'available', skills: ['Tissage', 'Préparation'], efficiency: 86, shift: 'Jour', experience: 2, performance: 82 }
      ],
      status: 'break',
      currentTask: 'En attente - Prochain lot prévu',
      productivity: 89,
      shift: 'Jour (6h-14h)',
      location: 'Atelier B'
    },
    {
      id: 'T003',
      name: 'Équipe Gamma',
      supervisor: 'Ibrahim Keita',
      members: [
        { id: 'M008', name: 'Aminata Coulibaly', role: 'Opératrice', status: 'assigned', skills: ['Impression', 'Finition'], efficiency: 93, currentAssignment: 'BATCH-2025-0894', shift: 'Nuit', experience: 4, performance: 91 },
        { id: 'M009', name: 'Modibo Dembélé', role: 'Technicien', status: 'assigned', skills: ['Maintenance', 'Réglage'], efficiency: 87, currentAssignment: 'BATCH-2025-0894', shift: 'Nuit', experience: 7, performance: 88 },
        { id: 'M010', name: 'Salimata Traoré', role: 'Contrôleur', status: 'absent', skills: ['Contrôle Qualité'], efficiency: 94, shift: 'Nuit', experience: 3, performance: 92 }
      ],
      status: 'maintenance',
      currentTask: 'Maintenance préventive équipements',
      productivity: 76,
      shift: 'Nuit (22h-6h)',
      location: 'Atelier C'
    }
  ];

  const resources: Resource[] = [
    { id: 'R001', name: 'Métier à Tisser A1', type: 'machine', status: 'in_use', location: 'Atelier A', assignedTo: 'Équipe Alpha', capacity: 100, utilization: 85, nextMaintenance: '2025-08-30' },
    { id: 'R002', name: 'Machine de Filature B2', type: 'machine', status: 'in_use', location: 'Atelier A', assignedTo: 'Équipe Alpha', capacity: 100, utilization: 92, nextMaintenance: '2025-09-02' },
    { id: 'R003', name: 'Système de Teinture C1', type: 'machine', status: 'maintenance', location: 'Atelier C', capacity: 100, utilization: 0, nextMaintenance: '2025-08-26' },
    { id: 'R004', name: 'Zone de Stockage 1', type: 'space', status: 'available', location: 'Entrepôt', capacity: 100, utilization: 65, nextMaintenance: '2025-09-15' },
    { id: 'R005', name: 'Outils de Contrôle Qualité', type: 'tool', status: 'in_use', location: 'Lab Qualité', assignedTo: 'Équipe Alpha', capacity: 100, utilization: 78, nextMaintenance: '2025-08-28' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned': return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'available': return <User className="w-4 h-4 text-green-600" />;
      case 'break': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'absent': return <UserX className="w-4 h-4 text-red-600" />;
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-orange-600" />;
      case 'in_use': return <Activity className="w-4 h-4 text-blue-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
      case 'in_use':
      case 'active': return 'info';
      case 'available': return 'success';
      case 'break': return 'warning';
      case 'absent':
      case 'maintenance': return 'danger';
      default: return 'default';
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'machine': return <Settings className="w-4 h-4 text-blue-600" />;
      case 'tool': return <Wrench className="w-4 h-4 text-orange-600" />;
      case 'space': return <MapPin className="w-4 h-4 text-purple-600" />;
      default: return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!user || user.role !== 'supervisor') {
    return <div>Access denied.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SupervisorSidebar />
        
        <main className="flex-1 ml-64">
          <Header title="Allocation des Ressources" />
          
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Allocation des Ressources</h1>
                <p className="text-gray-600 mt-1">
                  Gérer l'affectation du personnel, des équipes et des ressources matérielles
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="secondary" size="sm">
                  <Calendar className="mr-2" size={16} />
                  Planifier
                </Button>
                <Button variant="primary" size="sm">
                  <Plus className="mr-2" size={16} />
                  Nouvelle Affectation
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { key: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
                  { key: 'teams', label: 'Équipes', icon: Users },
                  { key: 'staff', label: 'Personnel', icon: User },
                  { key: 'resources', label: 'Ressources', icon: Settings }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === key
                        ? 'border-blue-500 text-blue-600'
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
                        <p className="text-sm font-medium text-gray-600">Personnel Actif</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {teams.reduce((total, team) => 
                            total + team.members.filter(m => m.status === 'assigned').length, 0
                          )}
                        </p>
                      </div>
                      <UserCheck className="w-8 h-8 text-blue-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Équipes Opérationnelles</p>
                        <p className="text-2xl font-bold text-green-600">
                          {teams.filter(t => t.status === 'active').length}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Ressources Utilisées</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {resources.filter(r => r.status === 'in_use').length}
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-orange-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Productivité Moyenne</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {(teams.reduce((sum, team) => sum + team.productivity, 0) / teams.length).toFixed(1)}%
                        </p>
                      </div>
                      <Target className="w-8 h-8 text-purple-600" />
                    </div>
                  </Card>
                </div>

                {/* Allocation Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition du Personnel</h3>
                    <div className="space-y-3">
                      {['assigned', 'available', 'break', 'absent'].map(status => {
                        const count = teams.reduce((total, team) => 
                          total + team.members.filter(m => m.status === status).length, 0
                        );
                        const total = teams.reduce((total, team) => total + team.members.length, 0);
                        const percentage = (count / total) * 100;
                        
                        return (
                          <div key={status} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(status)}
                              <span className="capitalize">{status}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium">{count}</span>
                              <div className="w-24">
                                <ProgressBar 
                                  value={percentage} 
                                  variant={getStatusColor(status) as any} 
                                  className="h-2" 
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12">{percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  <Card padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisation des Ressources</h3>
                    <div className="space-y-3">
                      {['machine', 'tool', 'space'].map(type => {
                        const typeResources = resources.filter(r => r.type === type);
                        const avgUtilization = typeResources.length > 0 
                          ? typeResources.reduce((sum, r) => sum + r.utilization, 0) / typeResources.length 
                          : 0;
                        
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getResourceTypeIcon(type)}
                              <span className="capitalize">{type}s</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium">{typeResources.length}</span>
                              <div className="w-24">
                                <ProgressBar 
                                  value={avgUtilization} 
                                  variant="success" 
                                  className="h-2" 
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12">{avgUtilization.toFixed(1)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <div className="space-y-6">
                <div className="grid gap-6">
                  {teams.map((team) => (
                    <Card key={team.id} padding="lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{team.name}</h3>
                            <Badge variant={getStatusColor(team.status) as any} size="sm">
                              {team.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <span className="text-sm text-gray-600">Superviseur:</span>
                              <p className="font-medium">{team.supervisor}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Membres:</span>
                              <p className="font-medium">{team.members.length}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Localisation:</span>
                              <p className="font-medium">{team.location}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Horaire:</span>
                              <p className="font-medium">{team.shift}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <span className="text-sm text-gray-600">Tâche actuelle:</span>
                            <p className="font-medium">{team.currentTask}</p>
                          </div>

                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">Productivité</span>
                              <span className="text-sm font-medium">{team.productivity}%</span>
                            </div>
                            <ProgressBar value={team.productivity} variant="success" className="h-2" />
                          </div>

                          <div className="border-t border-gray-200 pt-4">
                            <h4 className="font-medium text-gray-900 mb-3">Membres de l'équipe</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {team.members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    {getStatusIcon(member.status)}
                                    <div>
                                      <p className="font-medium text-sm">{member.name}</p>
                                      <p className="text-xs text-gray-600">{member.role}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">{member.efficiency}%</p>
                                    <Badge variant={getStatusColor(member.status) as any} size="sm">
                                      {member.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm">
                            <Eye className="mr-2" size={16} />
                            Détails
                          </Button>
                          <Button variant="primary" size="sm">
                            <Edit className="mr-2" size={16} />
                            Gérer
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Staff Tab */}
            {activeTab === 'staff' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestion du Personnel</h2>
                  
                  <div className="grid gap-4">
                    {teams.flatMap(team => 
                      team.members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-4">
                            {getStatusIcon(member.status)}
                            <div>
                              <h4 className="font-medium text-gray-900">{member.name}</h4>
                              <p className="text-sm text-gray-600">{member.role} • {team.name}</p>
                              <div className="flex gap-2 mt-1">
                                {member.skills.slice(0, 2).map(skill => (
                                  <Badge key={skill} variant="default" size="sm">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Efficacité</p>
                              <p className="font-medium">{member.efficiency}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Performance</p>
                              <p className="font-medium">{member.performance}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Expérience</p>
                              <p className="font-medium">{member.experience} ans</p>
                            </div>
                            <Badge variant={getStatusColor(member.status) as any} size="sm">
                              {member.status}
                            </Badge>
                            <Button variant="secondary" size="sm">
                              Gérer
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestion des Ressources</h2>
                  
                  <div className="grid gap-4">
                    {resources.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          {getResourceTypeIcon(resource.type)}
                          <div>
                            <h4 className="font-medium text-gray-900">{resource.name}</h4>
                            <p className="text-sm text-gray-600 capitalize">{resource.type} • {resource.location}</p>
                            {resource.assignedTo && (
                              <p className="text-sm text-blue-600">Assigné à: {resource.assignedTo}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Utilisation</p>
                            <div className="flex items-center gap-2">
                              <div className="w-16">
                                <ProgressBar value={resource.utilization} variant="success" className="h-2" />
                              </div>
                              <span className="text-sm font-medium">{resource.utilization}%</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Prochaine maintenance</p>
                            <p className="font-medium text-sm">{new Date(resource.nextMaintenance).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <Badge variant={getStatusColor(resource.status) as any} size="sm">
                            {resource.status}
                          </Badge>
                          <Button variant="secondary" size="sm">
                            Gérer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AllocationPage;
