'use client';
import React, { useState, useEffect, useRef } from 'react';
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
import BatchWorkflowModal from '../../admin/workflow/components/BatchWorkflowModal';
import { userService } from '../../../../../services/userService';

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

// Keep the original mock data as a fallback while we fetch real data from the backend
const MOCK_TEAMS: Team[] = [
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

const MOCK_RESOURCES: Resource[] = [
  { id: 'R001', name: 'Métier à Tisser A1', type: 'machine', status: 'in_use', location: 'Atelier A', assignedTo: 'Équipe Alpha', capacity: 100, utilization: 85, nextMaintenance: '2025-08-30' },
  { id: 'R002', name: 'Machine de Filature B2', type: 'machine', status: 'in_use', location: 'Atelier A', assignedTo: 'Équipe Alpha', capacity: 100, utilization: 92, nextMaintenance: '2025-09-02' },
  { id: 'R003', name: 'Système de Teinture C1', type: 'machine', status: 'maintenance', location: 'Atelier C', capacity: 100, utilization: 0, nextMaintenance: '2025-08-26' },
  { id: 'R004', name: 'Zone de Stockage 1', type: 'space', status: 'available', location: 'Entrepôt', capacity: 100, utilization: 65, nextMaintenance: '2025-09-15' },
  { id: 'R005', name: 'Outils de Contrôle Qualité', type: 'tool', status: 'in_use', location: 'Lab Qualité', assignedTo: 'Équipe Alpha', capacity: 100, utilization: 78, nextMaintenance: '2025-08-28' }
];

const AllocationPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'staff' | 'resources'>('overview');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [allocationStats, setAllocationStats] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPerson, setNewPerson] = useState<{ name: string; role: string; teamId?: string }>({ name: '', role: '' });
  const DEFAULT_ROLES: { role: string; role_display: string }[] = [
    { role: 'admin', role_display: 'Administrateur' },
    { role: 'supervisor', role_display: 'Superviseur' },
    { role: 'technician', role_display: 'Technicien' },
    { role: 'inspector', role_display: 'Inspecteur' },
    { role: 'analyst', role_display: 'Analyste' }
  ];

  const [rolesList, setRolesList] = useState<{ role: string; role_display: string }[]>(DEFAULT_ROLES);
  const [personErrors, setPersonErrors] = useState<Record<string,string>>({});
  const [showAddResource, setShowAddResource] = useState(false);
  useEffect(() => {
    let mounted = true;

    const fetchRoles = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const res = await fetch(`${base}/reports/users/roles/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        const json = await res.json();
        if (!mounted) return;

        if (json?.success && json.data?.role_distribution) {
          setRolesList(json.data.role_distribution);
        } else {
          // fallback to local default roles so the UI shows a dropdown for supervisors
          setRolesList(DEFAULT_ROLES);
        }
      } catch (err) {
        console.error('Failed to fetch roles:', err);
        // fallback to local default roles so dropdown is available even if report endpoint is protected
        setRolesList(DEFAULT_ROLES);
      }
    };

    fetchRoles();
    return () => { mounted = false; };
  }, []);
  const [newResource, setNewResource] = useState<{ name: string; type: 'machine' | 'tool' | 'space'; location: string }>({ name: '', type: 'machine', location: '' });
  const [resourceErrors, setResourceErrors] = useState<Record<string,string>>({});
  const [showNewAllocation, setShowNewAllocation] = useState(false);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [allocationForm, setAllocationForm] = useState<{ teamId?: string; resourceId?: string; start_date?: string; end_date?: string; notes?: string }>({});
  const [allocationErrors, setAllocationErrors] = useState<Record<string,string>>({});
  const loadRef = useRef<(() => Promise<void>) | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const allocationService = (await import('../../../../../services/allocationService')).default;

      const [analytics, workforce, materials] = await Promise.all([
        allocationService.getAllocationAnalytics().catch(() => null),
        allocationService.getWorkforceAllocationsList().catch(() => []),
        allocationService.getMaterialAllocationsList().catch(() => []),
      ]);

      // Map analytics
      setAllocationStats(analytics || null);

      // Map workforce allocations into team-like structures grouped by batch
      try {
        const batchMap = new Map<string, Team>();
        (workforce || []).forEach((a: any, idx: number) => {
          const batch = a.batch || {};
          const bId = String(batch.id || a.batch || `b-${idx}`);
          if (!batchMap.has(bId)) {
            batchMap.set(bId, {
              id: bId,
              name: batch.batch_number || batch.batch_code || `Batch ${bId}`,
              supervisor: batch.supervisor?.username || batch.supervisor_name || (a.allocated_by?.username ?? '—'),
              members: [],
              status: 'active',
              currentTask: batch.product || batch.product_type || '-',
              productivity: 0,
              shift: 'Jour',
              location: batch.location || '-',
            });
          }

          const userObj = a.user || {};
          const member = {
            id: String(userObj.id || userObj.username || `u-${idx}`),
            name: userObj.first_name ? `${userObj.first_name} ${userObj.last_name || ''}`.trim() : (userObj.username || '—'),
            role: a.role_assigned || 'Opérateur',
            status: (a.end_date && new Date(a.end_date) < new Date()) ? 'available' : 'assigned',
            skills: [],
            efficiency: 80,
            currentAssignment: batch.batch_number || batch.batch_code || undefined,
            shift: 'Jour',
            experience: 0,
            performance: 0,
          } as Team['members'][0];

          const membersArr = batchMap.get(bId)!.members;
          const exists = membersArr.some(m => String(m.id) === String(member.id));
          if (!exists) {
            membersArr.push(member);
          }
        });

        const mappedTeams = Array.from(batchMap.values());
        if (mappedTeams.length > 0) setTeams(mappedTeams);
      } catch (mapErr) {
        console.error('Failed to map workforce allocations to teams', mapErr);
      }

      // Map materials into resource-like objects
      try {
        const mappedResources: Resource[] = (materials || []).map((m: any, idx: number) => ({
          id: String(m.id || `${m.material_name}-${idx}`),
          name: m.material_name || `Material ${idx}`,
          type: 'tool',
          status: m.quantity && Number(m.quantity) > 0 ? 'in_use' : 'available',
          location: m.batch?.location || 'Entrepôt',
          assignedTo: m.batch?.batch_number || undefined,
          capacity: 0,
          utilization: 0,
          nextMaintenance: '',
        }));

        if (mappedResources.length > 0) setResources(mappedResources);
      } catch (mapErr) {
        console.error('Failed to map material allocations to resources', mapErr);
      }

    } catch (err) {
      console.error('Failed to load allocation data', err);
    } finally {
      setLoading(false);
    }
  };

  loadRef.current = loadData;

  useEffect(() => {
    let mounted = true;
    if (mounted) loadData();
    return () => { mounted = false; };
  }, []);

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

  const uniqueMembers = (members: TeamMember[]) => {
    const seen = new Set<string>();
    const out: TeamMember[] = [];
    members.forEach(m => {
      const k = String(m.id);
      if (!seen.has(k)) {
        seen.add(k);
        out.push(m);
      }
    });
    return out;
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
                <Button variant="secondary" size="sm" onClick={() => setShowCreateModal(true)}>
                  <Calendar className="mr-2" size={16} />
                  Planifier
                </Button>
                <Button variant="primary" size="sm" onClick={() => setShowNewAllocation(true)}>
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
                              {uniqueMembers(team.members).map((member) => (
                                <div key={`${team.id}-${member.id}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
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
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Gestion du Personnel</h2>
                    <div>
                      <Button variant="primary" size="sm" onClick={() => setShowAddPerson(true)}>
                        <Plus className="mr-2" size={14} />
                        Ajouter une personne
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                      {teams.flatMap(team => 
                      uniqueMembers(team.members).map(member => (
                        <div key={`${team.id}-${member.id}`} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
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

            {/* Simple Add Person Modal */}
            {showAddPerson && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Ajouter une personne</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Nom</label>
                      <input
                        type="text"
                        value={newPerson.name}
                        onChange={e => { setNewPerson(prev => ({ ...prev, name: e.target.value })); if (personErrors.name) setPersonErrors(prev => ({ ...prev, name: '' })); }}
                        className={`w-full px-3 py-2 border rounded-lg ${personErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Nom complet"
                      />
                      {personErrors.name && <p className="mt-1 text-sm text-red-600">{personErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Rôle</label>
                      {rolesList.length > 0 ? (
                        <select
                          value={newPerson.role}
                          onChange={e => { setNewPerson(prev => ({ ...prev, role: e.target.value })); if (personErrors.role) setPersonErrors(prev => ({ ...prev, role: '' })); }}
                          className={`w-full px-3 py-2 border rounded-lg ${personErrors.role ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">Sélectionnez un rôle</option>
                          {rolesList.map(r => (
                            <option key={r.role} value={r.role}>{r.role_display}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={newPerson.role}
                          onChange={e => { setNewPerson(prev => ({ ...prev, role: e.target.value })); if (personErrors.role) setPersonErrors(prev => ({ ...prev, role: '' })); }}
                          className={`w-full px-3 py-2 border rounded-lg ${personErrors.role ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="p.ex. Opérateur"
                        />
                      )}
                      {personErrors.role && <p className="mt-1 text-sm text-red-600">{personErrors.role}</p>}
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => { setShowAddPerson(false); setNewPerson({ name: '', role: '' }); setPersonErrors({}); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          // simple validations
                          const errs: Record<string,string> = {};
                          if (!newPerson.name.trim()) errs.name = 'Le nom est requis';
                          if (!newPerson.role.trim()) errs.role = 'Le rôle est requis';
                          if (Object.keys(errs).length > 0) { setPersonErrors(errs); return; }

                          // prepare user create payload
                          const parts = newPerson.name.trim().split(/\s+/);
                          const first = parts.shift() || '';
                          const last = parts.join(' ');
                          const rawUsername = (first + (last ? '.' + last.split(' ')[0] : '')).toLowerCase().replace(/[^a-z0-9.]/g, '') || `user${Date.now()}`;
                          const password = `Temp${Math.floor(Math.random()*900000 + 100000)}`;

                          const mapRole = (r: string) => {
                            const s = r.toLowerCase();
                            if (s.includes('supervis') || s.includes('chef')) return 'supervisor';
                            if (s.includes('tech') || s.includes('opér') || s.includes('op')) return 'technician';
                            if (s.includes('inspect')) return 'inspector';
                            return 'technician';
                          };

                          try {
                              const roleCode = rolesList.length > 0 ? newPerson.role : mapRole(newPerson.role);

                              const createData: any = {
                                username: rawUsername,
                                email: `${rawUsername}@example.com`,
                                first_name: first,
                                last_name: last,
                                role: roleCode,
                                password,
                                confirm_password: password
                              };

                            const resp = await userService.createUser(createData);
                            const created = resp.data;

                            // Refresh allocation data from server to reflect newly created user
                            if (loadRef.current) {
                              try {
                                await loadRef.current();
                              } catch (e) {
                                console.warn('Failed to reload allocation data after user create', e);
                              }
                            }

                            setShowAddPerson(false);
                            setNewPerson({ name: '', role: '' });
                            setPersonErrors({});
                          } catch (error: any) {
                            console.error('Failed to create user via API', error);
                            // surface validation errors from backend
                            const respErr = error?.response?.data || error?.response || null;
                            if (respErr && typeof respErr === 'object') {
                              const fieldErrors: Record<string,string> = {};
                              // common Django REST errors format: { field: ['error1','error2'] }
                              Object.keys(respErr).forEach(k => {
                                const v = respErr[k];
                                if (Array.isArray(v)) fieldErrors[k] = String(v[0]);
                                else if (typeof v === 'string') fieldErrors[k] = v;
                              });
                              setPersonErrors(fieldErrors);
                            } else {
                              setPersonErrors({ submit: 'Échec lors de la création. Voir la console.' });
                            }
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Gestion des Ressources</h2>
                    <div>
                      <Button variant="primary" size="sm" onClick={() => setShowAddResource(true)}>
                        <Plus className="mr-2" size={14} />
                        Ajouter une ressource
                      </Button>
                    </div>
                  </div>
                  
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

            {/* Simple Add Resource Modal */}
            {showAddResource && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Ajouter une ressource</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Nom</label>
                      <input
                        type="text"
                        value={newResource.name}
                        onChange={e => { setNewResource(prev => ({ ...prev, name: e.target.value })); if (resourceErrors.name) setResourceErrors(prev => ({ ...prev, name: '' })); }}
                        className={`w-full px-3 py-2 border rounded-lg ${resourceErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Nom de la ressource"
                      />
                      {resourceErrors.name && <p className="mt-1 text-sm text-red-600">{resourceErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Type</label>
                      <select
                        value={newResource.type}
                        onChange={e => { setNewResource(prev => ({ ...prev, type: e.target.value as any })); if (resourceErrors.type) setResourceErrors(prev => ({ ...prev, type: '' })); }}
                        className={`w-full px-3 py-2 border rounded-lg ${resourceErrors.type ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="machine">Machine</option>
                        <option value="tool">Outil</option>
                        <option value="space">Espace</option>
                      </select>
                      {resourceErrors.type && <p className="mt-1 text-sm text-red-600">{resourceErrors.type}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Localisation</label>
                      <input
                        type="text"
                        value={newResource.location}
                        onChange={e => { setNewResource(prev => ({ ...prev, location: e.target.value })); if (resourceErrors.location) setResourceErrors(prev => ({ ...prev, location: '' })); }}
                        className={`w-full px-3 py-2 border rounded-lg ${resourceErrors.location ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Atelier, Entrepôt..."
                      />
                      {resourceErrors.location && <p className="mt-1 text-sm text-red-600">{resourceErrors.location}</p>}
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => { setShowAddResource(false); setNewResource({ name: '', type: 'machine', location: '' }); setResourceErrors({}); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const errs: Record<string,string> = {};
                          if (!newResource.name.trim()) errs.name = 'Le nom est requis';
                          if (!newResource.location.trim()) errs.location = 'La localisation est requise';
                          if (Object.keys(errs).length > 0) { setResourceErrors(errs); return; }

                          const resource = {
                            id: `r-${Date.now()}`,
                            name: newResource.name,
                            type: newResource.type,
                            status: 'available' as const,
                            location: newResource.location,
                            assignedTo: undefined,
                            capacity: 0,
                            utilization: 0,
                            nextMaintenance: ''
                          } as Resource;

                          setResources(prev => [...prev, resource]);
                          setShowAddResource(false);
                          setNewResource({ name: '', type: 'machine', location: '' });
                          setResourceErrors({});
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* New Allocation Modal */}
            {showNewAllocation && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                  <h3 className="text-lg font-semibold mb-4">Nouvelle Affectation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Équipe</label>
                      <select
                        value={allocationForm.teamId || ''}
                        onChange={e => { setAllocationForm(prev => ({ ...prev, teamId: e.target.value })); if (allocationErrors.teamId) setAllocationErrors(prev => ({ ...prev, teamId: '' })); }}
                        className={`w-full px-3 py-2 border rounded-lg ${allocationErrors.teamId ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">-- Sélectionner une équipe --</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      {allocationErrors.teamId && <p className="mt-1 text-sm text-red-600">{allocationErrors.teamId}</p>}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Ressource</label>
                      <select
                        value={allocationForm.resourceId || ''}
                        onChange={e => { setAllocationForm(prev => ({ ...prev, resourceId: e.target.value })); if (allocationErrors.resourceId) setAllocationErrors(prev => ({ ...prev, resourceId: '' })); }}
                        className={`w-full px-3 py-2 border rounded-lg ${allocationErrors.resourceId ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">-- Sélectionner une ressource --</option>
                        {resources.map(r => (
                          <option key={r.id} value={r.id}>{r.name} — {r.type}</option>
                        ))}
                      </select>
                      {allocationErrors.resourceId && <p className="mt-1 text-sm text-red-600">{allocationErrors.resourceId}</p>}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Date de début</label>
                      <input
                        type="datetime-local"
                        value={allocationForm.start_date || ''}
                        onChange={e => { setAllocationForm(prev => ({ ...prev, start_date: e.target.value })); if (allocationErrors.start_date) setAllocationErrors(prev => ({ ...prev, start_date: '' })); }}
                        min={new Date().toISOString().slice(0,16)}
                        className={`w-full px-3 py-2 border rounded-lg ${allocationErrors.start_date ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {allocationErrors.start_date && <p className="mt-1 text-sm text-red-600">{allocationErrors.start_date}</p>}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Date de fin</label>
                      <input
                        type="datetime-local"
                        value={allocationForm.end_date || ''}
                        onChange={e => { setAllocationForm(prev => ({ ...prev, end_date: e.target.value })); if (allocationErrors.end_date) setAllocationErrors(prev => ({ ...prev, end_date: '' })); }}
                        min={allocationForm.start_date && allocationForm.start_date.length > 0 ? allocationForm.start_date : new Date().toISOString().slice(0,16)}
                        className={`w-full px-3 py-2 border rounded-lg ${allocationErrors.end_date ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {allocationErrors.end_date && <p className="mt-1 text-sm text-red-600">{allocationErrors.end_date}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={allocationForm.notes || ''}
                        onChange={e => setAllocationForm(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Détails de l'affectation"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-6">
                    <button type="button" onClick={() => { setShowNewAllocation(false); setAllocationForm({}); setAllocationErrors({}); }} className="px-4 py-2 border border-gray-300 rounded-lg">Annuler</button>
                    <button type="button" onClick={() => {
                      // validations
                      const errs: Record<string,string> = {};
                      if (!allocationForm.teamId) errs.teamId = 'Sélectionner une équipe';
                      if (!allocationForm.resourceId) errs.resourceId = 'Sélectionner une ressource';
                      if (!allocationForm.start_date) errs.start_date = 'La date de début est requise';
                      if (!allocationForm.end_date) errs.end_date = 'La date de fin est requise';
                      const start = allocationForm.start_date ? new Date(allocationForm.start_date) : null;
                      const end = allocationForm.end_date ? new Date(allocationForm.end_date) : null;
                      if (start && end && start >= end) errs.end_date = 'La date de fin doit être après la date de début';
                      if (start && start < new Date()) errs.start_date = 'La date de début ne peut pas être passée';
                      if (Object.keys(errs).length > 0) { setAllocationErrors(errs); return; }

                      const allocation = {
                        id: `a-${Date.now()}`,
                        teamId: allocationForm.teamId,
                        resourceId: allocationForm.resourceId,
                        start_date: allocationForm.start_date,
                        end_date: allocationForm.end_date,
                        notes: allocationForm.notes || ''
                      };

                      setAllocations(prev => [...prev, allocation]);

                      // update resource as assigned locally
                      setResources(prev => prev.map(r => r.id === allocationForm.resourceId ? { ...r, assignedTo: teams.find(t => t.id === allocationForm.teamId)?.name || r.assignedTo, status: 'in_use' } : r));

                      setShowNewAllocation(false);
                      setAllocationForm({});
                      setAllocationErrors({});
                    }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Enregistrer</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      {/* Batch create modal (reuse workflow modal) */}
      <BatchWorkflowModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={() => {
          setShowCreateModal(false);
          // refresh allocation data after a new batch is created
          loadRef.current?.();
        }}
        batch={null}
      />
    </div>
  );
};

export default AllocationPage;
