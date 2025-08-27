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

  const qualityIssues: QualityIssue[] = [
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
  ];

  const qualityAudits: QualityAudit[] = [
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
  ];

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
                <Button variant="secondary" size="sm">
                  <Download className="mr-2" size={16} />
                  Rapport
                </Button>
                <Button variant="primary" size="sm">
                  <Plus className="mr-2" size={16} />
                  Nouveau Contrôle
                </Button>
              </div>
            </div>

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
                          {qualityIssues.filter(issue => issue.status === 'open').length}
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
                      {qualityIssues.slice(0, 3).map((issue) => (
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
                    {qualityIssues.map((issue) => (
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
                    <Button variant="primary" size="sm">
                      <Plus className="mr-2" size={16} />
                      Planifier Audit
                    </Button>
                  </div>
                  
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
                    {productionBatches.map((batch) => (
                      <div key={batch.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900">{batch.productName}</h4>
                            <p className="text-sm text-gray-600">{batch.id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(batch.status) as any} size="sm">
                              {batch.status}
                            </Badge>
                            <Badge variant="success" size="sm">
                              Score: {batch.qualityScore}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-xs text-gray-600">Quantité:</span>
                            <p className="text-sm font-medium">{batch.quantity.toLocaleString()} m</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Taux de défauts:</span>
                            <p className="text-sm font-medium">{batch.defectRate}%</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Inspecteur:</span>
                            <p className="text-sm font-medium">{batch.inspector}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Complété le:</span>
                            <p className="text-sm font-medium">
                              {new Date(batch.completedAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Résultats des Tests</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(batch.testResults).map(([test, score]) => (
                              <div key={test} className="text-center">
                                <p className="text-xs text-gray-600 capitalize">{test}</p>
                                <p className="text-sm font-medium">{score}%</p>
                                <div className="w-full mt-1">
                                  <ProgressBar 
                                    value={score} 
                                    variant={score >= 90 ? 'success' : score >= 80 ? 'warning' : 'danger'} 
                                    className="h-1" 
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="sm">
                            <Eye className="mr-2" size={16} />
                            Détails
                          </Button>
                          {batch.status === 'testing' && (
                            <Button variant="primary" size="sm">
                              Valider
                            </Button>
                          )}
                          {batch.status === 'rework' && (
                            <Button variant="warning" size="sm">
                              Reprendre
                            </Button>
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
