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
  Workflow,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Square,
  Eye,
  Edit,
  BarChart3,
  Users,
  Package,
  Target,
  TrendingUp
} from 'lucide-react';

interface ProductionBatch {
  id: string;
  batchCode: string;
  productType: string;
  status: 'planned' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate: string;
  progress: number;
  assignedTeam: string;
  supervisor: string;
  targetQuantity: number;
  currentQuantity: number;
  qualityScore: number;
  estimatedCompletion: string;
  notes?: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'blocked';
  duration: number;
  assignedWorkers: number;
  efficiency: number;
}

const WorkflowPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'batches' | 'planning' | 'monitoring'>('overview');
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const productionBatches: ProductionBatch[] = [
    {
      id: 'PB001',
      batchCode: 'BATCH-2025-0892',
      productType: 'Cotton Fabric Premium',
      status: 'in_progress',
      priority: 'high',
      startDate: '2025-08-25T06:00:00Z',
      endDate: '2025-08-26T18:00:00Z',
      progress: 68,
      assignedTeam: 'Équipe Alpha',
      supervisor: 'Amadou Traoré',
      targetQuantity: 2500,
      currentQuantity: 1700,
      qualityScore: 94.5,
      estimatedCompletion: '2025-08-26T16:30:00Z'
    },
    {
      id: 'PB002',
      batchCode: 'BATCH-2025-0893',
      productType: 'Dyed Cotton Blend',
      status: 'planned',
      priority: 'medium',
      startDate: '2025-08-26T06:00:00Z',
      endDate: '2025-08-27T14:00:00Z',
      progress: 0,
      assignedTeam: 'Équipe Beta',
      supervisor: 'Fatima Diallo',
      targetQuantity: 1800,
      currentQuantity: 0,
      qualityScore: 0,
      estimatedCompletion: '2025-08-27T14:00:00Z'
    },
    {
      id: 'PB003',
      batchCode: 'BATCH-2025-0891',
      productType: 'Printed Fabric Special',
      status: 'completed',
      priority: 'high',
      startDate: '2025-08-23T06:00:00Z',
      endDate: '2025-08-24T18:00:00Z',
      progress: 100,
      assignedTeam: 'Équipe Gamma',
      supervisor: 'Ibrahim Keita',
      targetQuantity: 2200,
      currentQuantity: 2180,
      qualityScore: 96.8,
      estimatedCompletion: '2025-08-24T17:45:00Z'
    },
    {
      id: 'PB004',
      batchCode: 'BATCH-2025-0894',
      productType: 'Yarn Production',
      status: 'paused',
      priority: 'urgent',
      startDate: '2025-08-25T14:00:00Z',
      endDate: '2025-08-26T06:00:00Z',
      progress: 35,
      assignedTeam: 'Équipe Delta',
      supervisor: 'Aïcha Cissé',
      targetQuantity: 1500,
      currentQuantity: 525,
      qualityScore: 89.2,
      estimatedCompletion: '2025-08-26T08:00:00Z',
      notes: 'Machine maintenance required'
    }
  ];

  const workflowSteps: WorkflowStep[] = [
    { id: 'WS001', name: 'Raw Material Preparation', status: 'completed', duration: 120, assignedWorkers: 4, efficiency: 98 },
    { id: 'WS002', name: 'Spinning Process', status: 'completed', duration: 180, assignedWorkers: 6, efficiency: 95 },
    { id: 'WS003', name: 'Weaving Operation', status: 'active', duration: 240, assignedWorkers: 8, efficiency: 92 },
    { id: 'WS004', name: 'Dyeing Process', status: 'pending', duration: 150, assignedWorkers: 5, efficiency: 0 },
    { id: 'WS005', name: 'Finishing & Quality Check', status: 'pending', duration: 90, assignedWorkers: 3, efficiency: 0 }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress': return <Play className="w-4 h-4 text-blue-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'planned': return <Clock className="w-4 h-4 text-gray-600" />;
      case 'cancelled': return <Square className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'paused': return 'warning';
      case 'planned': return 'default';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'info';
      case 'pending': return 'default';
      case 'blocked': return 'danger';
      default: return 'default';
    }
  };

  const filteredBatches = productionBatches.filter(batch => {
    if (filterStatus !== 'all' && batch.status !== filterStatus) return false;
    if (filterPriority !== 'all' && batch.priority !== filterPriority) return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || user.role !== 'supervisor') {
    return <div>Access denied.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SupervisorSidebar />
        
        <main className="flex-1 ml-64">
          <Header title="Gestion des Flux de Production" />
          
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Flux de Production</h1>
                <p className="text-gray-600 mt-1">
                  Gérer les lots de production, planifier les tâches et suivre les flux de travail
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="secondary" size="sm">
                  <Calendar className="mr-2" size={16} />
                  Planifier
                </Button>
                <Button variant="primary" size="sm">
                  <Plus className="mr-2" size={16} />
                  Nouveau Lot
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { key: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
                  { key: 'batches', label: 'Lots de Production', icon: Package },
                  { key: 'planning', label: 'Planification', icon: Calendar },
                  { key: 'monitoring', label: 'Suivi en Temps Réel', icon: Eye }
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
                        <p className="text-sm font-medium text-gray-600">Lots Actifs</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {productionBatches.filter(b => b.status === 'in_progress').length}
                        </p>
                      </div>
                      <Play className="w-8 h-8 text-blue-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Lots Complétés</p>
                        <p className="text-2xl font-bold text-green-600">
                          {productionBatches.filter(b => b.status === 'completed').length}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Production Journalière</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {productionBatches
                            .filter(b => b.status === 'completed' || b.status === 'in_progress')
                            .reduce((sum, b) => sum + b.currentQuantity, 0)
                            .toLocaleString()} kg
                        </p>
                      </div>
                      <Target className="w-8 h-8 text-orange-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Efficacité Moyenne</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {(workflowSteps
                            .filter(s => s.efficiency > 0)
                            .reduce((sum, s) => sum + s.efficiency, 0) / 
                            workflowSteps.filter(s => s.efficiency > 0).length
                          ).toFixed(1)}%
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                  </Card>
                </div>

                {/* Workflow Status */}
                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">État du Flux de Travail Actuel</h3>
                  <div className="space-y-4">
                    {workflowSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                          <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">{step.name}</h4>
                            <Badge variant={getStepStatusColor(step.status) as any} size="sm">
                              {step.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                            <span>Durée: {step.duration}min</span>
                            <span>Ouvriers: {step.assignedWorkers}</span>
                            <span>Efficacité: {step.efficiency}%</span>
                          </div>
                          
                          {step.efficiency > 0 && (
                            <ProgressBar 
                              value={step.efficiency} 
                              variant="success" 
                              className="h-2 mt-2" 
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Batches Tab */}
            {activeTab === 'batches' && (
              <div className="space-y-6">
                {/* Filters */}
                <Card padding="lg">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Filtres:</span>
                    </div>
                    
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="planned">Planifié</option>
                      <option value="in_progress">En cours</option>
                      <option value="completed">Terminé</option>
                      <option value="paused">En pause</option>
                    </select>

                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">Toutes les priorités</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">Haute</option>
                      <option value="medium">Moyenne</option>
                      <option value="low">Basse</option>
                    </select>

                    <Button variant="secondary" size="sm">
                      <Search className="mr-2" size={16} />
                      Rechercher
                    </Button>
                  </div>
                </Card>

                {/* Batch List */}
                <div className="grid gap-6">
                  {filteredBatches.map((batch) => (
                    <Card key={batch.id} padding="lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {getStatusIcon(batch.status)}
                            <h3 className="font-semibold text-gray-900 text-lg">{batch.batchCode}</h3>
                            <Badge variant={getStatusColor(batch.status) as any} size="sm">
                              {batch.status}
                            </Badge>
                            <Badge variant={getPriorityColor(batch.priority) as any} size="sm">
                              {batch.priority}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <span className="text-sm text-gray-600">Produit:</span>
                              <p className="font-medium">{batch.productType}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Équipe:</span>
                              <p className="font-medium">{batch.assignedTeam}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Superviseur:</span>
                              <p className="font-medium">{batch.supervisor}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Fin estimée:</span>
                              <p className="font-medium">{formatDate(batch.estimatedCompletion)}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Progression</span>
                                <span className="text-sm font-medium">{batch.progress}%</span>
                              </div>
                              <ProgressBar value={batch.progress} variant="success" className="h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Quantité</span>
                                <span className="text-sm font-medium">
                                  {batch.currentQuantity.toLocaleString()} / {batch.targetQuantity.toLocaleString()} kg
                                </span>
                              </div>
                              <ProgressBar 
                                value={(batch.currentQuantity / batch.targetQuantity) * 100} 
                                variant="default" 
                                className="h-2" 
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Qualité</span>
                                <span className="text-sm font-medium">{batch.qualityScore}%</span>
                              </div>
                              <ProgressBar 
                                value={batch.qualityScore} 
                                variant={batch.qualityScore >= 95 ? 'success' : 'warning'} 
                                className="h-2" 
                              />
                            </div>
                          </div>

                          {batch.notes && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <strong>Note:</strong> {batch.notes}
                              </p>
                            </div>
                          )}
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

            {/* Planning Tab */}
            {activeTab === 'planning' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Planification de Production</h2>
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Calendrier de Production</h3>
                    <p>Interface de planification des lots de production</p>
                    <Button variant="primary" className="mt-4">
                      Ouvrir le Planificateur
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Monitoring Tab */}
            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Suivi en Temps Réel</h2>
                  <div className="text-center py-12 text-gray-500">
                    <Eye className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Monitoring Live</h3>
                    <p>Surveillance en temps réel des flux de production</p>
                    <Button variant="primary" className="mt-4">
                      Démarrer le Monitoring
                    </Button>
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

export default WorkflowPage;
