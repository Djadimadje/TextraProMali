'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import SupervisorSidebar from '../../../../../components/layout/SupervisorSidebar';
import Header from '../../../../../components/layout/Header';
import Card from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import Badge from '../../../../../components/ui/Badge';
import ProgressBar from '../../../../../components/ui/ProgressBar';
import BatchWorkflowModal from '../../admin/workflow/components/BatchWorkflowModal';
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
import { formatDate } from '../../../../../lib/formatters';
import workflowService from '../../../../../services/workflowService';
import ProductionCalendar from '../../../../components/workflow/ProductionCalendar';


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
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'batches' | 'planning' | 'monitoring'>('overview');
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const pollingRef = useRef<number | null>(null);
  const isPollingRef = useRef(false);
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const [dashboard, batchesResp, process] = await Promise.all([
          workflowService.getWorkflowDashboard(),
          workflowService.getBatches(),
          workflowService.getProcessAnalytics(),
        ]);

        if (!mounted) return;

        // Map batches from API to the local ProductionBatch shape with fallbacks
        const batchList = Array.isArray(batchesResp) ? batchesResp : (batchesResp?.results || []);
        const mappedBatches: ProductionBatch[] = (batchList || []).map((b: any) => ({
          id: String(b.id || b.batch_code || b.batchCode || b.pk || ''),
          batchCode: b.batch_code || b.batchCode || b.code || 'N/A',
          productType: b.product_type || b.productType || b.product || 'Unknown',
          status: (b.status || 'planned') as any,
          priority: (b.priority || 'medium') as any,
          startDate: b.start_date || b.startDate || b.start || new Date().toISOString(),
          endDate: b.end_date || b.endDate || b.end || new Date().toISOString(),
          progress: b.progress_percentage ?? b.progress ?? 0,
          assignedTeam: b.assigned_team || b.team || '—',
          supervisor: b.supervisor_name || b.supervisor || (b.supervisor?.username ?? '—'),
          targetQuantity: b.target_quantity || b.targetQuantity || b.target || 0,
          currentQuantity: b.current_quantity || b.currentQuantity || b.current || 0,
          qualityScore: b.quality_score || b.qualityScore || b.quality || 0,
          estimatedCompletion: b.estimated_completion || b.estimatedCompletion || b.end_date || new Date().toISOString(),
          notes: b.notes || b.note || b.remarks || undefined,
        }));

        // Map process analytics stages to WorkflowStep
        const mappedSteps: WorkflowStep[] = (process?.stages || []).map((s: any, idx: number) => {
          // Normalize status to the WorkflowStep union to satisfy TypeScript
          const rawStatus = String(s.status ?? '').toLowerCase();
          const allowed = ['active', 'pending', 'completed', 'blocked'] as const;
          const status = (allowed.includes(rawStatus as any) ? rawStatus : (s.avg_duration && s.avg_duration > 0 ? 'active' : 'pending')) as WorkflowStep['status'];

          return {
            id: String(s.name || s.id || `stage-${idx}`),
            name: s.name || `Stage ${idx + 1}`,
            status,
            duration: Math.round(s.avg_duration || s.avgDuration || 0),
            assignedWorkers: s.assigned_workers || s.assignedWorkers || 0,
            efficiency: Math.round(s.efficiency_score ?? s.efficiency ?? 0),
          };
        });

        // If no mapped steps, attempt to derive minimal steps from dashboard bottlenecks
        if (mappedSteps.length === 0 && dashboard?.bottlenecks) {
          const derived: WorkflowStep[] = dashboard.bottlenecks.map((b: any, idx: number) => ({
            id: `bn-${idx}`,
            name: b.stage || `Stage ${idx + 1}`,
            status: 'active' as WorkflowStep['status'],
            duration: Math.round(b.avg_duration || 0),
            assignedWorkers: b.batch_count || 0,
            efficiency: Math.round((dashboard?.stats?.current_efficiency) || 0),
          }));
          setWorkflowSteps(derived);
        } else {
          setWorkflowSteps(mappedSteps);
        }

        setProductionBatches(mappedBatches);
        setDashboardData(dashboard || null);
      } catch (err) {
        console.error('Failed to load workflow data', err);
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => { mounted = false; };
  }, []);

  const refreshBatches = async () => {
    try {
      const batchesResp = await workflowService.getBatches();
      const batchList = Array.isArray(batchesResp) ? batchesResp : (batchesResp?.results || []);
      const mappedBatches: ProductionBatch[] = (batchList || []).map((b: any) => ({
        id: String(b.id || b.batch_code || b.batchCode || b.pk || ''),
        batchCode: b.batch_code || b.batchCode || b.code || 'N/A',
        productType: b.product_type || b.productType || b.product || 'Unknown',
        status: (b.status || 'planned') as any,
        priority: (b.priority || 'medium') as any,
        startDate: b.start_date || b.startDate || b.start || new Date().toISOString(),
        endDate: b.end_date || b.endDate || b.end || new Date().toISOString(),
        progress: b.progress_percentage ?? b.progress ?? 0,
        assignedTeam: b.assigned_team || b.team || '—',
        supervisor: b.supervisor_name || b.supervisor || (b.supervisor?.username ?? '—'),
        targetQuantity: b.target_quantity || b.targetQuantity || b.target || 0,
        currentQuantity: b.current_quantity || b.currentQuantity || b.current || 0,
        qualityScore: b.quality_score || b.qualityScore || b.quality || 0,
        estimatedCompletion: b.estimated_completion || b.estimatedCompletion || b.end_date || new Date().toISOString(),
        notes: b.notes || b.note || b.remarks || undefined,
      }));
      setProductionBatches(mappedBatches);
    } catch (err) {
      console.error('Failed to refresh batches', err);
    }
  };

  const pollOnce = async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;
    try {
      await refreshBatches();
      // refresh analytics and dashboard as part of monitoring
      try {
        const process = await workflowService.getProcessAnalytics();
        const mappedSteps: WorkflowStep[] = (process?.stages || []).map((s: any, idx: number) => {
          const rawStatus = String(s.status ?? '').toLowerCase();
          const allowed = ['active', 'pending', 'completed', 'blocked'] as const;
          const status = (allowed.includes(rawStatus as any) ? rawStatus : (s.avg_duration && s.avg_duration > 0 ? 'active' : 'pending')) as WorkflowStep['status'];
          return {
            id: String(s.name || s.id || `stage-${idx}`),
            name: s.name || `Stage ${idx + 1}`,
            status,
            duration: Math.round(s.avg_duration || s.avgDuration || 0),
            assignedWorkers: s.assigned_workers || s.assignedWorkers || 0,
            efficiency: Math.round(s.efficiency_score ?? s.efficiency ?? 0),
          };
        });
        setWorkflowSteps(mappedSteps);
      } catch (e) {
        console.warn('Failed to refresh process analytics during polling', e);
      }

      try {
        const d = await workflowService.getWorkflowDashboard();
        setDashboardData(d || null);
      } catch (e) {
        // non-fatal
      }
    } finally {
      isPollingRef.current = false;
    }
  };

  const startMonitoring = () => {
    if (isMonitoring) return;
    setIsMonitoring(true);
    // switch to monitoring tab so the live view is visible
    setActiveTab('monitoring');
    // run immediately
    pollOnce();
    // then set interval
    const id = window.setInterval(() => pollOnce(), 5000);
    pollingRef.current = id;
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      // cleanup on unmount
      if (pollingRef.current) window.clearInterval(pollingRef.current);
      pollingRef.current = null;
      isPollingRef.current = false;
    };
  }, []);

  // Compute average efficiency for display (defensive)
  const avgEfficiencyDisplay = Math.round(
    workflowSteps && workflowSteps.length > 0
      ? workflowSteps.reduce((sum, s) => sum + (s.efficiency || 0), 0) / workflowSteps.length
      : 0
  );

  // Helper utilities for UI
  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'info';
      case 'pending': return 'default';
      case 'completed': return 'success';
      case 'blocked': return 'danger';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'planned': return 'default';
      case 'paused': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress': return <Play className="w-5 h-5 text-blue-600" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'paused': return <Pause className="w-5 h-5 text-yellow-600" />;
      case 'cancelled': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Square className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredBatches = productionBatches.filter((batch) => {
    if (filterStatus !== 'all' && batch.status !== filterStatus) return false;
    if (filterPriority !== 'all' && batch.priority !== filterPriority) return false;
    return true;
  });
  // Allow supervisor access either from context `user` or from localStorage fallback
  let isSupervisor = false;
  if (user && user.role === 'supervisor') {
    isSupervisor = true;
  } else if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.role === 'supervisor') isSupervisor = true;
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  if (!isSupervisor) {
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
                <Button variant="secondary" size="sm" onClick={() => setShowCreateModal(true)}>
                  <Calendar className="mr-2" size={16} />
                  Planifier
                </Button>
                {/*<Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2" size={16} />
                  Nouveau Lot
                </Button>*/}
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
                          {dashboardData?.in_progress_batches ?? dashboardData?.active_batches ?? productionBatches.filter(b => b.status === 'in_progress').length}
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
                          {dashboardData?.completed_batches ?? productionBatches.filter(b => b.status === 'completed').length}
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
                          {(dashboardData?.daily_production ?? productionBatches
                            .filter(b => b.status === 'completed' || b.status === 'in_progress')
                            .reduce((sum, b) => sum + b.currentQuantity, 0)).toLocaleString()} kg
                        </p>
                      </div>
                      <Target className="w-8 h-8 text-orange-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Efficacité Moyenne</p>
                        <p className="text-2xl font-bold text-purple-600">{dashboardData?.current_efficiency ?? dashboardData?.current_efficiency ?? avgEfficiencyDisplay}%</p>
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
                {/* Recent Batches */}
                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lots Récents</h3>
                  <div className="space-y-2">
                    {(dashboardData?.recent_batches || productionBatches.slice(0, 5) || []).map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{b.batch_code || b.batchCode || b.batchCode}</p>
                          <p className="text-sm text-gray-500">{b.product_type || b.productType || ''} — {formatDate(b.created_at || b.startDate || b.start || b.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={getStatusColor(b.status || b.status)} size="sm">{b.status || b.status}</Badge>
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
                  <ProductionCalendar batches={(dashboardData?.recent_batches || productionBatches) as any} />
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
                    <Button
                      variant={isMonitoring ? 'secondary' : 'primary'}
                      className="mt-4"
                      onClick={() => {
                        if (isMonitoring) stopMonitoring();
                        else startMonitoring();
                      }}
                    >
                      {isMonitoring ? 'Arrêter le Monitoring' : 'Démarrer le Monitoring'}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
      <BatchWorkflowModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={async (createdBatch?: any) => {
          // Optimistically add created batch so calendar updates immediately
              if (createdBatch) {
            try {
              const mapped: ProductionBatch = {
                id: String(createdBatch.id || createdBatch.batch_code || createdBatch.pk || ''),
                batchCode: createdBatch.batch_code || createdBatch.batchCode || createdBatch.code || 'N/A',
                productType: createdBatch.product_type || createdBatch.productType || createdBatch.product || 'Unknown',
                status: (createdBatch.status || 'planned') as any,
                priority: (createdBatch.priority || 'medium') as any,
                startDate: createdBatch.start_date || createdBatch.startDate || createdBatch.start || new Date().toISOString(),
                endDate: createdBatch.end_date || createdBatch.endDate || createdBatch.end || new Date().toISOString(),
                progress: createdBatch.progress_percentage ?? createdBatch.progress ?? 0,
                assignedTeam: createdBatch.assigned_team || createdBatch.team || '—',
                supervisor: createdBatch.supervisor_name || createdBatch.supervisor || (createdBatch.supervisor?.username ?? '—'),
                targetQuantity: createdBatch.target_quantity || createdBatch.targetQuantity || createdBatch.target || 0,
                currentQuantity: createdBatch.current_quantity || createdBatch.currentQuantity || createdBatch.current || 0,
                qualityScore: createdBatch.quality_score || createdBatch.qualityScore || createdBatch.quality || 0,
                estimatedCompletion: createdBatch.estimated_completion || createdBatch.estimatedCompletion || createdBatch.end_date || new Date().toISOString(),
                notes: createdBatch.notes || createdBatch.note || createdBatch.remarks || undefined,
              };

              setProductionBatches((prev: ProductionBatch[]) => [mapped, ...prev]);
              setDashboardData((prev: any) => ({
                ...(prev || {}),
                recent_batches: [createdBatch, ...(prev?.recent_batches || [])]
              }));
            } catch (err) {
              console.warn('Failed optimistic insert of created batch', err);
            }
          }

          // Also refresh authoritative lists to ensure server state
          await refreshBatches();
          try {
            const d = await workflowService.getWorkflowDashboard();
            setDashboardData(d || null);
          } catch (e) {
            console.warn('Failed to refresh dashboard after create', e);
          }

          setShowCreateModal(false);
        }}
        batch={null}
      />
    </div>
  );
};

export default WorkflowPage;
