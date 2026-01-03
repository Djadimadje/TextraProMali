'use client';
import React, { useState, useEffect } from 'react';
import { qualityService } from '../../../../../services/qualityService';
import { useAuth } from '../../../../contexts/AuthContext';
import SupervisorSidebar from '../../../../../components/layout/SupervisorSidebar';
import Header from '../../../../../components/layout/Header';
import Card from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import Badge from '../../../../../components/ui/Badge';
import ProgressBar from '../../../../../components/ui/ProgressBar';
import { 
  Shield,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Target,
  Award,
  AlertCircle,
  Activity,
  BarChart3,
  PieChart,
  Layers,
  Clipboard
} from 'lucide-react';
import { BatchWorkflow } from '@/types/api';
import workflowService from '../../../../../services/workflowService';
import api from '@/services/api';

interface QualityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  lastUpdate: string;
}

interface QualityIssue {
  id: string;
  batchId: string;
  productName: string;
  issueType: 'defect' | 'measurement' | 'color' | 'texture';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedBy: string;
  detectedAt: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  assignedTo?: string;
  resolution?: string;
  impact: number;
}

interface QualityAudit {
  id: string;
  type: 'routine' | 'special' | 'customer' | 'certification';
  auditor: string;
  date: string;
  score: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'reporting';
  areas: string[];
  findings: number;
  recommendations: number;
}

interface ProductionBatch {
  id: string;
  productName: string;
  quantity: number;
  qualityScore: number;
  defectRate: number;
  status: 'testing' | 'approved' | 'rejected' | 'rework';
  testResults: {
    visual: number;
    mechanical: number;
    chemical: number;
    dimensional: number;
  };
  inspector: string;
  completedAt: string;
}

const QualityPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'issues' | 'audits' | 'batches'>('overview');
  const [filterPeriod, setFilterPeriod] = useState<string>('week');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const qualityMetrics: QualityMetric[] = [
    { id: 'QM001', name: 'Taux de Conformité Global', value: 96.8, target: 95, unit: '%', trend: 'up', status: 'good', lastUpdate: '2025-01-26 10:30' },
    { id: 'QM002', name: 'Taux de Défauts', value: 2.1, target: 3, unit: '%', trend: 'down', status: 'good', lastUpdate: '2025-01-26 10:30' },
    { id: 'QM003', name: 'Temps de Réponse Qualité', value: 45, target: 60, unit: 'min', trend: 'down', status: 'good', lastUpdate: '2025-01-26 10:25' },
    { id: 'QM004', name: 'Satisfaction Client', value: 4.7, target: 4.5, unit: '/5', trend: 'up', status: 'good', lastUpdate: '2025-01-26 09:15' },
    { id: 'QM005', name: 'Retours Clients', value: 0.8, target: 1.5, unit: '%', trend: 'stable', status: 'good', lastUpdate: '2025-01-26 08:45' },
    { id: 'QM006', name: 'Coût Qualité', value: 2.3, target: 3, unit: '%', trend: 'down', status: 'good', lastUpdate: '2025-01-26 08:30' }
  ];

  const [qualityIssuesState, setQualityIssuesState] = useState<QualityIssue[]>([
    {
      id: 'QI001',
      batchId: 'BATCH-2025-0892',
      productName: 'Cotton Fabric Premium',
      issueType: 'color',
      severity: 'medium',
      description: 'Variation de teinte détectée sur 5% du lot',
      detectedBy: 'Awa Diarra',
      detectedAt: '2025-01-26 09:15',
      status: 'investigating',
      assignedTo: 'Ibrahim Keita',
      impact: 3
    },
    {
      id: 'QI002',
      batchId: 'BATCH-2025-0894',
      productName: 'Textile Impression Africaine',
      issueType: 'texture',
      severity: 'low',
      description: 'Légère irrégularité dans la texture en zone centrale',
      detectedBy: 'Salimata Traoré',
      detectedAt: '2025-01-26 08:45',
      status: 'resolved',
      assignedTo: 'Modibo Dembélé',
      resolution: 'Ajustement des paramètres de finition',
      impact: 1
    },
    {
      id: 'QI003',
      batchId: 'BATCH-2025-0889',
      productName: 'Denim Standard',
      issueType: 'measurement',
      severity: 'high',
      description: 'Épaisseur hors tolérances sur 15% du lot',
      detectedBy: 'Fatoumata Koné',
      detectedAt: '2025-01-25 16:30',
      status: 'open',
      impact: 7
    }
    ]);

    type NewCheck = {
      batch: string;
      image: File | null;
      defect_detected: boolean;
      defect_type: string;
      severity: 'low'|'medium'|'high';
      comments: string;
      ai_analysis_requested: boolean;
    };

    const DEFAULT_NEW_CHECK: NewCheck = {
      batch: '',
      image: null,
      defect_detected: false,
      defect_type: '',
      severity: 'low',
      comments: '',
      ai_analysis_requested: false
    };

    const [showNewCheck, setShowNewCheck] = useState(false);
    const [newCheck, setNewCheck] = useState<NewCheck>(DEFAULT_NEW_CHECK);
    const [submitting, setSubmitting] = useState(false);
    const [batches, setBatches] = useState<BatchWorkflow[]>([]);

  const [qualityAudits, setQualityAudits] = useState<QualityAudit[]>([
    {
      id: 'QA001',
      type: 'routine',
      auditor: 'Amadou Traoré',
      date: '2025-01-28',
      score: 0,
      status: 'scheduled',
      areas: ['Production', 'Contrôle Qualité', 'Stockage'],
      findings: 0,
      recommendations: 0
    },
    {
      id: 'QA002',
      type: 'customer',
      auditor: 'Externe - Bureau Veritas',
      date: '2025-01-25',
      score: 94,
      status: 'completed',
      areas: ['Système Qualité', 'Traçabilité', 'Documentation'],
      findings: 3,
      recommendations: 5
    },
    {
      id: 'QA003',
      type: 'certification',
      auditor: 'ISO 9001 Certifieur',
      date: '2025-01-30',
      score: 0,
      status: 'scheduled',
      areas: ['Management Qualité', 'Amélioration Continue', 'Satisfaction Client'],
      findings: 0,
      recommendations: 0
    }
  ]);

  // Load quality checks from backend on mount so they persist across refreshes
  useEffect(() => {
    let mounted = true;
    const loadChecks = async () => {
      try {
        const resp = await qualityService.getQualityChecks({ page_size: 50 });
        // qualityService returns ApiResponse<PaginatedResponse<QualityCheck>>
        const list = (resp && resp.data && (resp.data.results || resp.data)) || [];
        if (mounted && Array.isArray(list)) {
          // Map backend shape to local QualityIssue if necessary
          const mapped = list.map((item: any) => ({
            id: item.id || item.pk || String(Math.random()),
            batchId: item.batch?.batch_code || item.batch_code || item.batch || '',
            productName: item.batch?.product_type || item.productName || item.product_type || '',
            issueType: item.defect_detected ? 'defect' : 'measurement',
            severity: item.severity || 'low',
            description: item.comments || item.description || '',
            detectedBy: item.inspector?.display_name || item.inspector?.username || item.reported_by || '',
            detectedAt: item.created_at || item.detectedAt || new Date().toISOString(),
            status: item.status || 'pending',
            assignedTo: item.assigned_to || item.assignedTo || undefined,
            resolution: item.resolution || undefined,
            impact: item.impact || 0
          } as QualityIssue));

          setQualityIssuesState(mapped);
        }
      } catch (err) {
        console.error('Failed to load quality checks on mount', err);
      }
    };

    loadChecks();
    return () => { mounted = false; };
  }, []);

  const [showScheduleAudit, setShowScheduleAudit] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<Partial<QualityAudit>>({
    type: 'routine',
    auditor: user?.first_name ? `${user.first_name} ${user.last_name}` : '',
    date: '',
    areas: [],
    score: 0,
    status: 'scheduled'
  });

  const productionBatches: ProductionBatch[] = [
    {
      id: 'BATCH-2025-0892',
      productName: 'Cotton Fabric Premium',
      quantity: 1500,
      qualityScore: 94,
      defectRate: 2.1,
      status: 'testing',
      testResults: { visual: 96, mechanical: 94, chemical: 92, dimensional: 95 },
      inspector: 'Awa Diarra',
      completedAt: '2025-01-26 10:30'
    },
    {
      id: 'BATCH-2025-0894',
      productName: 'Textile Impression Africaine',
      quantity: 800,
      qualityScore: 97,
      defectRate: 1.2,
      status: 'approved',
      testResults: { visual: 98, mechanical: 96, chemical: 97, dimensional: 97 },
      inspector: 'Salimata Traoré',
      completedAt: '2025-01-26 09:45'
    },
    {
      id: 'BATCH-2025-0889',
      productName: 'Denim Standard',
      quantity: 2000,
      qualityScore: 85,
      defectRate: 6.8,
      status: 'rework',
      testResults: { visual: 88, mechanical: 82, chemical: 89, dimensional: 81 },
      inspector: 'Fatoumata Koné',
      completedAt: '2025-01-25 16:30'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'approved':
      case 'resolved':
      case 'completed': return 'success';
      case 'warning':
      case 'testing':
      case 'investigating':
      case 'in_progress': return 'warning';
      case 'critical':
      case 'rejected':
      case 'open': return 'danger';
      case 'scheduled':
      case 'rework': return 'info';
      default: return 'default';
    }
  };

  // Normalize backend QualityCheck objects to the local QualityIssue shape
  const normalizeToQualityIssue = (item: any): QualityIssue => ({
    id: item.id || item.pk || String(Math.random()),
    batchId: item.batch?.batch_code || item.batch_code || item.batch || '',
    productName: item.batch?.product_type || item.productName || item.product_type || '',
    issueType: item.defect_detected ? 'defect' : (item.issueType || 'measurement'),
    severity: item.severity || 'low',
    description: item.comments || item.description || '',
    detectedBy: item.inspector?.display_name || item.inspector?.username || item.detectedBy || item.reported_by || '',
    detectedAt: item.created_at || item.detectedAt || new Date().toISOString(),
    status: item.status || 'open',
    assignedTo: item.assigned_to || item.assignedTo || undefined,
    resolution: item.resolution || undefined,
    impact: item.impact || 0
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'danger';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <Activity className="w-4 h-4 text-gray-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case 'defect': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'measurement': return <Target className="w-4 h-4 text-blue-600" />;
      case 'color': return <PieChart className="w-4 h-4 text-purple-600" />;
      case 'texture': return <Layers className="w-4 h-4 text-orange-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!user || user.role !== 'supervisor') {
    return <div>Access denied.</div>;
  }

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // try getting the user's batches first
        const my = await workflowService.getMyBatches();
        console.log('workflow.getMyBatches ->', my);
        if (mounted && Array.isArray(my) && my.length) {
          console.log('Using my_batches array, count=', my.length);
          setBatches(my as any);
          return;
        }
        console.log('my_batches not an array or empty, will try getBatches()');

        // fallback to paginated list
        const res = await workflowService.getBatches();
        console.log('workflow.getBatches ->', res);
        if (mounted && res) {
          const list = (res as any).results || (res as any).data || (res as any);
          console.log('Derived list from getBatches, type=', Array.isArray(list) ? 'array' : typeof list, 'length=', Array.isArray(list) ? list.length : 'n/a');
          if (Array.isArray(list) && list.length) setBatches(list);
          
        }
      } catch (err) {
        console.error('Failed loading batches for quality dropdown', err);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  // Preselect first backend batch when opening the New Check modal
  useEffect(() => {
    if (showNewCheck && batches.length > 0 && !newCheck.batch) {
      setNewCheck(prev => ({ ...prev, batch: batches[0].batch_code }));
    }
  }, [showNewCheck, batches]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SupervisorSidebar />
        
        <main className="flex-1 ml-64">
          <Header title="Contrôle Qualité" />
          
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contrôle Qualité</h1>
                <p className="text-gray-600 mt-1">
                  Supervision et suivi de la qualité des produits et processus
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="primary" size="sm" onClick={() => setShowNewCheck(true)}>
                  <Plus className="mr-2" size={16} />
                  Nouveau Contrôle
                </Button>
                <div className="flex items-center pl-2">
                  <Badge variant="default" size="sm">Lots backend: {batches.length}</Badge>
                </div>
              </div>
            </div>
            

            {/* New Quality Check Modal */}
            {showNewCheck && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                  <h3 className="text-lg font-semibold mb-4">Nouveau Contrôle Qualité</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="newcheck-batch" className="block text-sm text-gray-700 mb-1">Code du lot</label>
                      <select id="newcheck-batch" name="batch" value={newCheck.batch} onChange={e => setNewCheck(prev => ({...prev, batch: e.target.value}))} className="w-full px-3 py-2 border rounded-lg">
                        <option value="">Sélectionner un lot...</option>
                        {batches.length > 0 ? (
                          batches.map(b => (
                            <option key={b.id} value={b.batch_code}>{b.batch_code}{b.batch_number ? ` — ${b.batch_number}` : ''}{b.product_type ? ` — ${b.product_type}` : ''}</option>
                          ))
                        ) : (
                          <option value="" disabled>Aucun lot disponible</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="newcheck-image" className="block text-sm text-gray-700 mb-1">Image</label>
                      <input id="newcheck-image" name="image" type="file" accept="image/*" onChange={e => setNewCheck(prev => ({...prev, image: e.target.files?.[0] || null}))} />
                    </div>

                    <div className="flex items-center gap-3">
                      <label htmlFor="newcheck-defect" className="flex items-center gap-2">
                        <input id="newcheck-defect" name="defect_detected" type="checkbox" checked={newCheck.defect_detected} onChange={e => setNewCheck(prev => ({...prev, defect_detected: e.target.checked}))} />
                        <span className="text-sm text-gray-700">Défaut détecté</span>
                      </label>
                      <label htmlFor="newcheck-ai" className="flex items-center gap-2">
                        <input id="newcheck-ai" name="ai_analysis_requested" type="checkbox" checked={newCheck.ai_analysis_requested} onChange={e => setNewCheck(prev => ({...prev, ai_analysis_requested: e.target.checked}))} />
                        <span className="text-sm text-gray-700">Analyser avec IA</span>
                      </label>
                    </div>

                    {newCheck.defect_detected && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="newcheck-defect-type" className="block text-sm text-gray-700 mb-1">Type de défaut</label>
                          <input id="newcheck-defect-type" name="defect_type" type="text" value={newCheck.defect_type} onChange={e => setNewCheck(prev => ({...prev, defect_type: e.target.value}))} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                          <label htmlFor="newcheck-severity" className="block text-sm text-gray-700 mb-1">Gravité</label>
                          <select id="newcheck-severity" name="severity" value={newCheck.severity} onChange={e => setNewCheck(prev => ({...prev, severity: e.target.value as any}))} className="w-full px-3 py-2 border rounded-lg">
                            <option value="low">Faible</option>
                            <option value="medium">Moyenne</option>
                            <option value="high">Haute</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="newcheck-comments" className="block text-sm text-gray-700 mb-1">Commentaires</label>
                      <textarea id="newcheck-comments" name="comments" value={newCheck.comments} onChange={e => setNewCheck(prev => ({...prev, comments: e.target.value}))} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                      <button type="button" onClick={() => { setShowNewCheck(false); setNewCheck(DEFAULT_NEW_CHECK); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">Annuler</button>
                      <button type="button" disabled={submitting} onClick={async () => {
                        // basic validation
                        if (!newCheck.batch.trim()) { alert('Le code du lot est requis'); return; }
                        if (!newCheck.image) { alert('Une image est requise'); return; }
                        if (newCheck.defect_detected && !newCheck.defect_type.trim()) { alert('Le type de défaut est requis lorsque un défaut est détecté'); return; }

                        try {
                          setSubmitting(true);
                          const payload = {
                            batch: newCheck.batch,
                            image: newCheck.image!,
                            defect_detected: newCheck.defect_detected,
                            defect_type: newCheck.defect_type || undefined,
                            severity: newCheck.severity || undefined,
                            comments: newCheck.comments || undefined,
                            ai_analysis_requested: newCheck.ai_analysis_requested || undefined
                          } as any;

                          const resp = await qualityService.createQualityCheck(payload);

                          // Normalize created object from different service shapes
                          let created: any = null;
                          if (!resp) created = null;
                          else if (resp.data) created = resp.data;
                          else created = resp;

                          if (created && (created.id || created.pk)) {
                            const normalized = normalizeToQualityIssue(created);
                            setQualityIssuesState(prev => [normalized, ...prev]);
                          } else {
                            // Fallback: reload recent checks from API and prepend newest
                            try {
                              const recent = await qualityService.getQualityChecks({ page_size: 10 });
                              const list = (recent && recent.data && (recent.data.results || recent.data)) || [];
                              if (Array.isArray(list) && list.length) {
                                const mapped = list.map((i: any) => normalizeToQualityIssue(i));
                                setQualityIssuesState(prev => [...mapped, ...prev]);
                              }
                            } catch (reloadErr) {
                              console.error('Failed to reload recent checks after create', reloadErr);
                            }
                          }

                          setShowNewCheck(false);
                          setNewCheck(DEFAULT_NEW_CHECK);
                        } catch (err: any) {
                          alert('Échec de création: ' + (err.message || String(err)));
                        } finally {
                          setSubmitting(false);
                        }
                      }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{submitting ? 'Enregistrement...' : 'Enregistrer'}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { key: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
                  { key: 'metrics', label: 'Indicateurs', icon: Target },
                  { key: 'issues', label: 'Problèmes', icon: AlertTriangle },
                  { key: 'audits', label: 'Audits', icon: Clipboard },
                  { key: 'batches', label: 'Lots Production', icon: Layers }
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
                        <p className="text-sm font-medium text-gray-600">Conformité Globale</p>
                        <p className="text-2xl font-bold text-green-600">96.8%</p>
                      </div>
                      <Shield className="w-8 h-8 text-green-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Problèmes Ouverts</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {qualityIssuesState.filter(issue => issue.status === 'open').length}
                        </p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-orange-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Lots en Test</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {productionBatches.filter(batch => batch.status === 'testing').length}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Score Qualité Moyen</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {(productionBatches.reduce((sum, batch) => sum + batch.qualityScore, 0) / productionBatches.length).toFixed(1)}
                        </p>
                      </div>
                      <Award className="w-8 h-8 text-purple-600" />
                    </div>
                  </Card>
                </div>

                {/* Recent Issues and Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Problèmes Récents</h3>
                    <div className="space-y-3">
                      {qualityIssuesState.slice(0, 3).map((issue) => (
                        <div key={issue.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getIssueTypeIcon(issue.issueType)}
                            <div>
                              <p className="font-medium text-sm">{issue.productName}</p>
                              <p className="text-xs text-gray-600">{issue.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={getSeverityColor(issue.severity) as any} size="sm">
                              {issue.severity}
                            </Badge>
                            <p className="text-xs text-gray-600 mt-1">{issue.detectedBy}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicateurs Clés</h3>
                    <div className="space-y-3">
                      {qualityMetrics.slice(0, 4).map((metric) => (
                        <div key={metric.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getTrendIcon(metric.trend)}
                            <span className="text-sm">{metric.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{metric.value}{metric.unit}</span>
                            <Badge variant={getStatusColor(metric.status) as any} size="sm">
                              {metric.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Metrics Tab */}
            {activeTab === 'metrics' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Indicateurs de Qualité</h2>
                  
                  <div className="grid gap-6">
                    {qualityMetrics.map((metric) => (
                      <div key={metric.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getTrendIcon(metric.trend)}
                            <h3 className="font-medium text-gray-900">{metric.name}</h3>
                            <Badge variant={getStatusColor(metric.status) as any} size="sm">
                              {metric.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{metric.value}{metric.unit}</p>
                            <p className="text-sm text-gray-600">Objectif: {metric.target}{metric.unit}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Progression vers l'objectif</span>
                          <span className="text-sm font-medium">
                            {((metric.value / metric.target) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <ProgressBar 
                          value={(metric.value / metric.target) * 100} 
                          variant={getStatusColor(metric.status) as any} 
                          className="h-2" 
                        />
                        
                        <p className="text-xs text-gray-500 mt-2">
                          Dernière mise à jour: {new Date(metric.lastUpdate).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Issues Tab */}
            {activeTab === 'issues' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Problèmes Qualité</h2>
                    <div className="flex gap-3">
                      <Button variant="secondary" size="sm">
                        <Filter className="mr-2" size={16} />
                        Filtrer
                      </Button>
                      <Button variant="primary" size="sm">
                        <Plus className="mr-2" size={16} />
                        Nouveau Problème
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {qualityIssuesState.map((issue) => (
                      <div key={issue.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            {getIssueTypeIcon(issue.issueType)}
                            <div>
                              <h4 className="font-medium text-gray-900">{issue.productName}</h4>
                              <p className="text-sm text-gray-600 mb-2">{issue.batchId}</p>
                              <p className="text-sm text-gray-800">{issue.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(issue.severity) as any} size="sm">
                              {issue.severity}
                            </Badge>
                            <Badge variant={getStatusColor(issue.status) as any} size="sm">
                              {issue.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <span className="text-xs text-gray-600">Détecté par:</span>
                            <p className="text-sm font-medium">{issue.detectedBy}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Date détection:</span>
                            <p className="text-sm font-medium">
                              {new Date(issue.detectedAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Assigné à:</span>
                            <p className="text-sm font-medium">{issue.assignedTo || 'Non assigné'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Impact:</span>
                            <p className="text-sm font-medium">{issue.impact}/10</p>
                          </div>
                        </div>
                        
                        {issue.resolution && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm text-green-800">
                              <strong>Résolution:</strong> {issue.resolution}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2 mt-3">
                          <Button variant="secondary" size="sm">
                            <Eye className="mr-2" size={16} />
                            Détails
                          </Button>
                          <Button variant="primary" size="sm">
                            Traiter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Audits Tab */}
            {activeTab === 'audits' && (
              <div className="space-y-6">
                <Card padding="lg">
                    <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Audits Qualité</h2>
                    <Button variant="primary" size="sm" onClick={() => setShowScheduleAudit(true)}>
                      <Plus className="mr-2" size={16} />
                      Planifier Audit
                    </Button>
                  </div>

                  {showScheduleAudit && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h3 className="text-lg font-semibold mb-4">Planifier un Audit</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Type d'audit</label>
                            <select value={scheduleForm.type} onChange={e => setScheduleForm(prev => ({...prev, type: e.target.value as any}))} className="w-full px-3 py-2 border rounded-lg">
                              <option value="routine">Routine</option>
                              <option value="special">Spécial</option>
                              <option value="customer">Client</option>
                              <option value="certification">Certification</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Auditeur</label>
                            <input type="text" value={scheduleForm.auditor || ''} onChange={e => setScheduleForm(prev => ({...prev, auditor: e.target.value}))} className="w-full px-3 py-2 border rounded-lg" />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Date</label>
                            <input type="date" value={scheduleForm.date || ''} onChange={e => setScheduleForm(prev => ({...prev, date: e.target.value}))} className="w-full px-3 py-2 border rounded-lg" />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Zones (séparées par des virgules)</label>
                            <input type="text" value={(scheduleForm.areas || []).join(', ')} onChange={e => setScheduleForm(prev => ({...prev, areas: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}))} className="w-full px-3 py-2 border rounded-lg" placeholder="Production, Contrôle Qualité" />
                          </div>

                          <div className="flex gap-3 justify-end pt-4">
                            <button type="button" onClick={() => { setShowScheduleAudit(false); setScheduleForm({}); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">Annuler</button>
                            <button type="button" onClick={async () => {
                              if (!scheduleForm.date || !scheduleForm.auditor) { alert('Auditeur et date requis'); return; }
                              try {
                                setScheduling(true);

                                const payload = {
                                  audit_type: scheduleForm.type || 'routine',
                                  auditor: scheduleForm.auditor,
                                  date: scheduleForm.date,
                                  areas: scheduleForm.areas || [],
                                  status: 'scheduled'
                                } as any;

                                const resp = await api.createQualityAudit(payload);
                                // API returns created audit — prepend to list
                                setQualityAudits(prev => [resp, ...prev]);
                                setShowScheduleAudit(false);
                                setScheduleForm({});
                              } catch (err: any) {
                                console.error('Failed to schedule audit', err);
                                alert('Échec lors de la planification: ' + (err?.message || err?.response?.data?.error || String(err)));
                              } finally {
                                setScheduling(false);
                              }
                            }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Planifier</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid gap-4">
                    {qualityAudits.map((audit) => (
                      <div key={audit.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900 capitalize">{audit.type} Audit</h4>
                            <p className="text-sm text-gray-600">Auditeur: {audit.auditor}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(audit.status) as any} size="sm">
                              {audit.status}
                            </Badge>
                            {audit.score > 0 && (
                              <Badge variant="success" size="sm">
                                Score: {audit.score}/100
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <span className="text-xs text-gray-600">Date:</span>
                            <p className="text-sm font-medium">
                              {new Date(audit.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Zones auditées:</span>
                            <p className="text-sm font-medium">{audit.areas.length}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Constats:</span>
                            <p className="text-sm font-medium">{audit.findings}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Recommandations:</span>
                            <p className="text-sm font-medium">{audit.recommendations}</p>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <span className="text-xs text-gray-600">Zones concernées:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {audit.areas.map((area, index) => (
                              <Badge key={index} variant="default" size="sm">{area}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="sm">
                            <FileText className="mr-2" size={16} />
                            Rapport
                          </Button>
                          {audit.status === 'scheduled' && (
                            <Button variant="primary" size="sm">
                              Démarrer
                            </Button>
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
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Lots de Production</h2>
                    <div className="flex gap-3">
                      <Button variant="secondary" size="sm">
                        <Filter className="mr-2" size={16} />
                        Filtrer
                      </Button>
                      <Button variant="primary" size="sm">
                        <Plus className="mr-2" size={16} />
                        Nouveau Test
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {(batches.length ? batches : productionBatches).map((batch: any) => (
                      <div key={batch.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900">{(batch.product_type || batch.productName || batch.description) ?? batch.batch_code ?? batch.id}</h4>
                            <p className="text-sm text-gray-600">{batch.batch_code ?? batch.id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(batch.status) as any} size="sm">
                              {batch.status}
                            </Badge>
                            {batch.progress_percentage !== undefined && (
                              <Badge variant="success" size="sm">Progress: {Math.round(batch.progress_percentage)}%</Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-xs text-gray-600">Produit:</span>
                            <p className="text-sm font-medium">{batch.product_type || batch.productName || '-'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Superviseur:</span>
                            <p className="text-sm font-medium">{batch.supervisor_name || batch.inspector || '-'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Début:</span>
                            <p className="text-sm font-medium">{batch.start_date ? new Date(batch.start_date).toLocaleDateString('fr-FR') : '-'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Fin prévue:</span>
                            <p className="text-sm font-medium">{batch.end_date ? new Date(batch.end_date).toLocaleDateString('fr-FR') : '-'}</p>
                          </div>
                        </div>

                        {batch.progress_percentage !== undefined && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Progression</h5>
                            <ProgressBar value={batch.progress_percentage} className="h-2" />
                          </div>
                        )}

                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="sm">
                            <Eye className="mr-2" size={16} />
                            Détails
                          </Button>
                          {(batch.status === 'testing' || batch.status === 'in_progress') && (
                            <Button variant="primary" size="sm">Valider</Button>
                          )}
                          {batch.status === 'rework' && (
                            <Button variant="warning" size="sm">Reprendre</Button>
                          )}
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

export default QualityPage;
