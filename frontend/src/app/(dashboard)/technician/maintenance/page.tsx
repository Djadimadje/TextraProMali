'use client';
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../../../../lib/formatters';
import { useAuth } from '../../../../contexts/AuthContext';
import TechnicianSidebar from '../../../../../components/layout/TechnicianSidebar';
import Header from '../../../../../components/layout/Header';
import Card from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import Badge from '../../../../../components/ui/Badge';
import ProgressBar from '../../../../../components/ui/ProgressBar';
import { 
  Wrench,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  FileText,
  Search,
  Filter,
  Edit,
  MapPin,
  DollarSign,
  Package,
  Activity,
  Target,
  Settings,
  Save,
  AlertCircle,
  Clipboard,
  Cog,
  Eye
} from 'lucide-react';

interface MaintenanceTask {
  id: string;
  title: string;
  machineId: string;
  machineName: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  actualDuration?: number;
  assignedTo: string;
  description: string;
  location: string;
  requiredParts: string[];
  requiredTools: string[];
  instructions: string[];
  safetyNotes: string[];
  completedAt?: string;
  notes?: string;
  cost?: number;
  createdAt: string;
  createdBy: string;
}

interface MaintenanceTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  duration: number;
  frequency: string;
  instructions: string[];
  requiredParts: string[];
  requiredTools: string[];
  safetyNotes: string[];
  category: string;
}

interface WorkOrder {
  id: string;
  taskId: string;
  taskTitle: string;
  machine: string;
  technician: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'paused' | 'completed';
  timeSpent: number;
  notes: string[];
  completionPercentage: number;
}

const MaintenancePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'schedule' | 'tasks' | 'workorders' | 'templates' | 'reports'>('schedule');

  useEffect(() => {
    // Initialize component
  }, []);

  const maintenanceTasks: MaintenanceTask[] = [
    {
      id: 'MT001',
      title: 'Maintenance Préventive Mensuelle',
      machineId: 'M001',
      machineName: 'Métier à Tisser A1',
      type: 'preventive',
      priority: 'medium',
      status: 'scheduled',
      scheduledDate: '2025-01-27',
      scheduledTime: '08:00',
      estimatedDuration: 120,
      assignedTo: 'Mamadou Sidibé',
      description: 'Maintenance préventive mensuelle complète incluant graissage, inspection et nettoyage',
      location: 'Atelier A - Poste 1',
      requiredParts: ['Filtre à huile', 'Courroie principale', 'Graisse haute température'],
      requiredTools: ['Clés dynamométriques', 'Multimètre', 'Pistolet à graisse'],
      instructions: [
        'Arrêter la machine et sécuriser la zone',
        'Vérifier et remplacer le filtre à huile',
        'Contrôler la tension des courroies',
        'Graisser tous les points de lubrification',
        'Tester les systèmes électriques',
        'Nettoyer et ranger'
      ],
      safetyNotes: [
        'Porter obligatoirement les EPI',
        'Consigner électriquement avant intervention',
        'Vérifier l\'arrêt complet avant maintenance'
      ],
      createdAt: '2025-01-20',
      createdBy: 'Ibrahim Keita'
    },
    {
      id: 'MT002',
      title: 'Réparation Système d\'Alimentation',
      machineId: 'M002',
      machineName: 'Machine Filature B2',
      type: 'corrective',
      priority: 'high',
      status: 'in_progress',
      scheduledDate: '2025-01-26',
      scheduledTime: '10:00',
      estimatedDuration: 240,
      actualDuration: 180,
      assignedTo: 'Fatima Koné',
      description: 'Réparation du système d\'alimentation en matière première suite à panne',
      location: 'Atelier B - Poste 2',
      requiredParts: ['Pompe alimentation', 'Capteur de débit', 'Joints toriques'],
      requiredTools: ['Clés plates', 'Tournevis électricien', 'Testeur de pression'],
      instructions: [
        'Isoler le système d\'alimentation',
        'Démonter la pompe défaillante',
        'Installer la nouvelle pompe',
        'Remplacer les joints et capteurs',
        'Tester le système complet',
        'Remettre en service progressivement'
      ],
      safetyNotes: [
        'Attention aux fluides sous pression',
        'Utiliser des lunettes de protection',
        'Signaler la zone de travail'
      ],
      completedAt: '2025-01-26 13:30',
      notes: 'Pompe remplacée avec succès. Système testé et opérationnel.',
      cost: 85000,
      createdAt: '2025-01-25',
      createdBy: 'Amadou Traoré'
    },
    {
      id: 'MT003',
      title: 'Intervention Urgente Surchauffe',
      machineId: 'M005',
      machineName: 'Compresseur Air A2',
      type: 'emergency',
      priority: 'critical',
      status: 'in_progress',
      scheduledDate: '2025-01-26',
      scheduledTime: '14:00',
      estimatedDuration: 180,
      assignedTo: 'Sekou Camara',
      description: 'Intervention d\'urgence suite à surchauffe du compresseur avec arrêt de sécurité',
      location: 'Zone Technique',
      requiredParts: ['Ventilateur de refroidissement', 'Capteur température', 'Thermostat'],
      requiredTools: ['Multimètre', 'Clés Allen', 'Pistolet thermique'],
      instructions: [
        'Vérifier l\'arrêt de sécurité',
        'Contrôler le système de refroidissement',
        'Remplacer le ventilateur défaillant',
        'Calibrer les capteurs de température',
        'Tester le redémarrage progressif'
      ],
      safetyNotes: [
        'Risque de brûlures - surface chaude',
        'Vérifier la ventilation de la zone',
        'Ne pas redémarrer sans autorisation'
      ],
      createdAt: '2025-01-26',
      createdBy: 'Système d\'Alerte'
    },
    {
      id: 'MT004',
      title: 'Inspection Qualité Hebdomadaire',
      machineId: 'M003',
      machineName: 'Système Teinture C1',
      type: 'inspection',
      priority: 'low',
      status: 'completed',
      scheduledDate: '2025-01-22',
      scheduledTime: '09:00',
      estimatedDuration: 60,
      actualDuration: 75,
      assignedTo: 'Ibrahim Touré',
      description: 'Inspection hebdomadaire du système de teinture et contrôle qualité',
      location: 'Atelier C - Zone Teinture',
      requiredParts: [],
      requiredTools: ['Thermomètre digital', 'pH-mètre', 'Échantillons test'],
      instructions: [
        'Vérifier les paramètres de température',
        'Contrôler le pH des bains',
        'Inspecter l\'état des cuves',
        'Tester la qualité de teinture',
        'Documenter les résultats'
      ],
      safetyNotes: [
        'Attention aux produits chimiques',
        'Porter gants et lunettes',
        'Assurer une bonne ventilation'
      ],
      completedAt: '2025-01-22 10:15',
      notes: 'Inspection réalisée. Tous les paramètres dans les normes. pH ajusté.',
      createdAt: '2025-01-20',
      createdBy: 'Awa Diarra'
    },
    {
      id: 'MT005',
      title: 'Maintenance Corrective Courroie',
      machineId: 'M004',
      machineName: 'Machine Finition D1',
      type: 'corrective',
      priority: 'medium',
      status: 'scheduled',
      scheduledDate: '2025-01-28',
      scheduledTime: '13:00',
      estimatedDuration: 90,
      assignedTo: 'Aminata Coulibaly',
      description: 'Remplacement de la courroie principale suite à usure détectée',
      location: 'Atelier D - Finition',
      requiredParts: ['Courroie trapézoïdale', 'Tendeur automatique'],
      requiredTools: ['Clés plates', 'Outil tension courroie', 'Mètre'],
      instructions: [
        'Arrêter et consigner la machine',
        'Détendre et retirer l\'ancienne courroie',
        'Vérifier l\'alignement des poulies',
        'Installer la nouvelle courroie',
        'Régler la tension selon spécifications',
        'Tester le fonctionnement'
      ],
      safetyNotes: [
        'Attention aux pièces en mouvement',
        'Respecter les couples de serrage',
        'Vérifier l\'arrêt complet'
      ],
      createdAt: '2025-01-25',
      createdBy: 'Fatima Diallo'
    }
  ];

  const maintenanceTemplates: MaintenanceTemplate[] = [
    {
      id: 'TMP001',
      name: 'Maintenance Préventive Standard',
      type: 'preventive',
      description: 'Template de maintenance préventive pour machines de production',
      duration: 120,
      frequency: 'Mensuel',
      instructions: [
        'Arrêter et sécuriser la machine',
        'Vérifier les niveaux de fluides',
        'Contrôler les serrages',
        'Graisser les points de lubrification',
        'Tester les systèmes de sécurité'
      ],
      requiredParts: ['Filtre à huile', 'Graisse', 'Joints'],
      requiredTools: ['Clés', 'Multimètre', 'Pistolet à graisse'],
      safetyNotes: ['EPI obligatoires', 'Consignation électrique'],
      category: 'Production'
    },
    {
      id: 'TMP002',
      name: 'Inspection Qualité Hebdomadaire',
      type: 'inspection',
      description: 'Contrôle qualité hebdomadaire des paramètres de production',
      duration: 60,
      frequency: 'Hebdomadaire',
      instructions: [
        'Vérifier les paramètres de process',
        'Contrôler la qualité de production',
        'Documenter les mesures',
        'Signaler les écarts'
      ],
      requiredParts: [],
      requiredTools: ['Instruments de mesure', 'Échantillons'],
      safetyNotes: ['Attention aux produits chimiques'],
      category: 'Qualité'
    }
  ];

  const workOrders: WorkOrder[] = [
    {
      id: 'WO001',
      taskId: 'MT002',
      taskTitle: 'Réparation Système d\'Alimentation',
      machine: 'Machine Filature B2',
      technician: 'Fatima Koné',
      startTime: '2025-01-26 10:00',
      endTime: '2025-01-26 13:30',
      status: 'completed',
      timeSpent: 210,
      notes: [
        '10:00 - Début intervention, diagnostic système',
        '10:30 - Démontage pompe défaillante',
        '11:15 - Installation nouvelle pompe',
        '12:30 - Tests système et calibrage',
        '13:30 - Fin intervention, système opérationnel'
      ],
      completionPercentage: 100
    },
    {
      id: 'WO002',
      taskId: 'MT003',
      taskTitle: 'Intervention Urgente Surchauffe',
      machine: 'Compresseur Air A2',
      technician: 'Sekou Camara',
      startTime: '2025-01-26 14:00',
      status: 'active',
      timeSpent: 120,
      notes: [
        '14:00 - Arrivée sur site, sécurisation zone',
        '14:15 - Diagnostic surchauffe, ventilateur HS',
        '14:45 - Commande pièces de rechange',
        '15:30 - Démontage ventilateur défaillant'
      ],
      completionPercentage: 65
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'scheduled': return 'default';
      case 'delayed': return 'danger';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'default';
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

  if (!user || user.role !== 'technician') {
    return <div>Access denied.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <TechnicianSidebar />
        
        <main className="flex-1 ml-[200px] lg:ml-[240px]">
          <Header title="Gestion de la Maintenance" />
          
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion de la Maintenance</h1>
                <p className="text-gray-600 mt-1">
                  Planification, suivi et documentation des activités de maintenance
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="secondary" size="sm">
                  <FileText className="mr-2" size={16} />
                  Rapport
                </Button>
                <Button variant="primary" size="sm">
                  <Plus className="mr-2" size={16} />
                  Nouvelle Tâche
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { key: 'schedule', label: 'Planning', icon: Calendar },
                  { key: 'tasks', label: 'Mes Tâches', icon: Clipboard },
                  { key: 'workorders', label: 'Ordres de Travail', icon: FileText },
                  { key: 'templates', label: 'Templates', icon: Settings },
                  { key: 'reports', label: 'Rapports', icon: Activity }
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

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                        <p className="text-2xl font-bold text-green-600">
                          {maintenanceTasks.filter(t => 
                            new Date(t.scheduledDate).toDateString() === new Date().toDateString()
                          ).length}
                        </p>
                      </div>
                      <Calendar className="w-8 h-8 text-green-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">En Cours</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {maintenanceTasks.filter(t => t.status === 'in_progress').length}
                        </p>
                      </div>
                      <PlayCircle className="w-8 h-8 text-yellow-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Programmées</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {maintenanceTasks.filter(t => t.status === 'scheduled').length}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Urgentes</p>
                        <p className="text-2xl font-bold text-red-600">
                          {maintenanceTasks.filter(t => t.priority === 'critical').length}
                        </p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                  </Card>
                </div>

                {/* Schedule Timeline */}
                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Planning des 7 Prochains Jours</h3>
                  <div className="space-y-4">
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() + i);
                      const dayTasks = maintenanceTasks.filter(task => 
                        new Date(task.scheduledDate).toDateString() === date.toDateString()
                      );
                      
                      return (
                        <div key={i} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                          <div className="text-center min-w-[80px]">
                            <p className="text-lg font-bold text-gray-900">
                              {date.getDate()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {date.toLocaleDateString('fr-FR', { weekday: 'short', month: 'short' })}
                            </p>
                          </div>
                          
                          <div className="flex-1">
                            {dayTasks.length > 0 ? (
                              <div className="space-y-2">
                                {dayTasks.map((task) => (
                                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      {getTypeIcon(task.type)}
                                      <div>
                                        <p className="font-medium text-sm">{task.title}</p>
                                        <p className="text-xs text-gray-600">{task.machineName} • {task.scheduledTime}</p>
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
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                <p className="text-sm">Aucune tâche programmée</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Rechercher une tâche..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    <Filter className="mr-2" size={16} />
                    Filtrer
                  </Button>
                </div>

                {/* Tasks List */}
                <div className="grid gap-4">
                  {maintenanceTasks.map((task) => (
                    <Card key={task.id} padding="lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-green-100 rounded-lg">
                            {getTypeIcon(task.type)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                            <p className="text-sm text-gray-600">{task.machineName}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(task.scheduledDate).toLocaleDateString('fr-FR')} à {task.scheduledTime}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{task.estimatedDuration} min</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{task.location}</span>
                              </div>
                            </div>
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
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-700">{task.description}</p>
                      </div>
                      
                      {task.requiredParts.length > 0 && (
                        <div className="mb-4">
                          <span className="text-xs text-gray-600">Pièces requises:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.requiredParts.map((part, index) => (
                              <Badge key={index} variant="default" size="sm">
                                <Package className="w-3 h-3 mr-1" />
                                {part}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {task.requiredTools.length > 0 && (
                        <div className="mb-4">
                          <span className="text-xs text-gray-600">Outils requis:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.requiredTools.map((tool, index) => (
                              <Badge key={index} variant="default" size="sm">
                                <Wrench className="w-3 h-3 mr-1" />
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {task.safetyNotes.length > 0 && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">Notes de Sécurité</span>
                          </div>
                          <ul className="space-y-1">
                            {task.safetyNotes.map((note, index) => (
                              <li key={index} className="text-sm text-yellow-700">• {note}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {task.status === 'completed' && task.notes && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Notes de Completion</span>
                          </div>
                          <p className="text-sm text-green-700">{task.notes}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          {task.actualDuration ? (
                            <>Durée réelle: {task.actualDuration} min</>
                          ) : (
                            <>Durée estimée: {task.estimatedDuration} min</>
                          )}
                          {task.cost && <> • Coût: {formatCurrency(task.cost)}</>}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm">
                            <FileText className="mr-2" size={16} />
                            Instructions
                          </Button>
                          
                          {task.status === 'scheduled' && (
                            <Button variant="primary" size="sm">
                              <PlayCircle className="mr-2" size={16} />
                              Démarrer
                            </Button>
                          )}
                          
                          {task.status === 'in_progress' && (
                            <Button variant="warning" size="sm">
                              <Save className="mr-2" size={16} />
                              Mettre à Jour
                            </Button>
                          )}
                          
                          <Button variant="secondary" size="sm">
                            <Edit className="mr-2" size={16} />
                            Modifier
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Work Orders Tab */}
            {activeTab === 'workorders' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Ordres de Travail Actifs</h2>
                  
                  <div className="space-y-4">
                    {workOrders.map((order) => (
                      <div key={order.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900">{order.taskTitle}</h4>
                            <p className="text-sm text-gray-600">{order.machine} • {order.technician}</p>
                          </div>
                          <Badge 
                            variant={order.status === 'completed' ? 'success' : order.status === 'active' ? 'warning' : 'default'} 
                            size="sm"
                          >
                            {order.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-xs text-gray-600">Début:</span>
                            <p className="text-sm font-medium">
                              {new Date(order.startTime).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          {order.endTime && (
                            <div>
                              <span className="text-xs text-gray-600">Fin:</span>
                              <p className="text-sm font-medium">
                                {new Date(order.endTime).toLocaleString('fr-FR')}
                              </p>
                            </div>
                          )}
                          <div>
                            <span className="text-xs text-gray-600">Temps passé:</span>
                            <p className="text-sm font-medium">{order.timeSpent} min</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Progression:</span>
                            <p className="text-sm font-medium">{order.completionPercentage}%</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progression</span>
                            <span className="text-sm text-gray-600">{order.completionPercentage}%</span>
                          </div>
                          <ProgressBar 
                            value={order.completionPercentage} 
                            variant={order.completionPercentage === 100 ? 'success' : 'warning'} 
                            className="h-2" 
                          />
                        </div>
                        
                        {order.notes.length > 0 && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-700 mb-2 block">Journal d'activité:</span>
                            <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                              {order.notes.map((note, index) => (
                                <p key={index} className="text-sm text-gray-600 mb-1">{note}</p>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2">
                          {order.status === 'active' && (
                            <>
                              <Button variant="secondary" size="sm">
                                <PauseCircle className="mr-2" size={16} />
                                Pause
                              </Button>
                              <Button variant="primary" size="sm">
                                <Plus className="mr-2" size={16} />
                                Ajouter Note
                              </Button>
                            </>
                          )}
                          <Button variant="secondary" size="sm">
                            <FileText className="mr-2" size={16} />
                            Rapport
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Templates de Maintenance</h2>
                    <Button variant="primary" size="sm">
                      <Plus className="mr-2" size={16} />
                      Nouveau Template
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {maintenanceTemplates.map((template) => (
                      <div key={template.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{template.name}</h4>
                            <p className="text-sm text-gray-600">{template.description}</p>
                          </div>
                          <Badge variant="default" size="sm">{template.category}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-xs text-gray-600">Durée:</span>
                            <p className="text-sm font-medium">{template.duration} min</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Fréquence:</span>
                            <p className="text-sm font-medium">{template.frequency}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <span className="text-xs text-gray-600">Instructions:</span>
                          <ul className="mt-1 space-y-1">
                            {template.instructions.slice(0, 3).map((instruction, index) => (
                              <li key={index} className="text-sm text-gray-700">• {instruction}</li>
                            ))}
                            {template.instructions.length > 3 && (
                              <li className="text-sm text-gray-500">... et {template.instructions.length - 3} autres</li>
                            )}
                          </ul>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="sm">
                            <Eye className="mr-2" size={16} />
                            Aperçu
                          </Button>
                          <Button variant="primary" size="sm">
                            Utiliser
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Rapports de Maintenance</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Rapport d'Activité</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Résumé des activités de maintenance de la période
                      </p>
                      <Button variant="primary" size="sm">
                        Générer
                      </Button>
                    </div>
                    
                    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Performance KPIs</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Indicateurs de performance de maintenance
                      </p>
                      <Button variant="primary" size="sm">
                        Générer
                      </Button>
                    </div>
                    
                    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Analyse des Coûts</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Analyse des coûts de maintenance par machine
                      </p>
                      <Button variant="primary" size="sm">
                        Générer
                      </Button>
                    </div>
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

export default MaintenancePage;
