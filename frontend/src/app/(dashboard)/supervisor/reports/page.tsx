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
  FileText,
  Plus,
  Download,
  Filter,
  Calendar,
  Search,
  Eye,
  Share,
  Archive,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  BarChart3,
  PieChart,
  TrendingUp,
  Settings,
  Send,
  Printer,
  Mail,
  FileSpreadsheet,
  FileImage,
  Bookmark,
  Star,
  Trash2
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  type: 'production' | 'quality' | 'performance' | 'cost' | 'safety' | 'custom';
  status: 'draft' | 'generating' | 'ready' | 'sent' | 'archived';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'on_demand';
  format: 'pdf' | 'excel' | 'csv' | 'word';
  createdBy: string;
  createdAt: string;
  lastGenerated?: string;
  recipients: string[];
  description: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  size?: string;
  downloadCount: number;
}

interface ReportTemplate {
  id: string;
  name: string;
  category: 'production' | 'quality' | 'performance' | 'cost' | 'safety';
  description: string;
  sections: string[];
  estimatedTime: number;
  dataPoints: number;
  popularity: number;
}

interface ScheduledReport {
  id: string;
  reportId: string;
  reportTitle: string;
  frequency: string;
  nextRun: string;
  recipients: string[];
  status: 'active' | 'paused' | 'failed';
  lastRun?: string;
  runCount: number;
}

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'templates' | 'scheduled' | 'archive'>('overview');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const reports: Report[] = [
    {
      id: 'R001',
      title: 'Rapport Production Mensuel - Janvier 2025',
      type: 'production',
      status: 'ready',
      frequency: 'monthly',
      format: 'pdf',
      createdBy: 'Amadou Traoré',
      createdAt: '2025-01-26 09:00',
      lastGenerated: '2025-01-26 10:30',
      recipients: ['direction@textpro.ml', 'production@textpro.ml'],
      description: 'Analyse complète de la production du mois avec KPIs et tendances',
      tags: ['production', 'mensuel', 'kpi'],
      priority: 'high',
      size: '2.4 MB',
      downloadCount: 12
    },
    {
      id: 'R002',
      title: 'Rapport Qualité Hebdomadaire S4',
      type: 'quality',
      status: 'ready',
      frequency: 'weekly',
      format: 'excel',
      createdBy: 'Awa Diarra',
      createdAt: '2025-01-26 08:15',
      lastGenerated: '2025-01-26 08:45',
      recipients: ['qualite@textpro.ml', 'superviseurs@textpro.ml'],
      description: 'Suivi des indicateurs qualité et non-conformités de la semaine',
      tags: ['qualité', 'hebdomadaire', 'conformité'],
      priority: 'medium',
      size: '1.8 MB',
      downloadCount: 8
    },
    {
      id: 'R003',
      title: 'Performance Équipes - Janvier 2025',
      type: 'performance',
      status: 'generating',
      frequency: 'monthly',
      format: 'pdf',
      createdBy: 'Fatima Diallo',
      createdAt: '2025-01-26 07:30',
      recipients: ['rh@textpro.ml', 'direction@textpro.ml'],
      description: 'Évaluation de la performance des équipes et recommandations',
      tags: ['performance', 'équipes', 'rh'],
      priority: 'medium',
      downloadCount: 0
    },
    {
      id: 'R004',
      title: 'Analyse Coûts Trimestrielle Q1',
      type: 'cost',
      status: 'draft',
      frequency: 'quarterly',
      format: 'excel',
      createdBy: 'Ibrahim Keita',
      createdAt: '2025-01-25 16:45',
      recipients: ['finance@textpro.ml', 'direction@textpro.ml'],
      description: 'Analyse détaillée des coûts de production et optimisations',
      tags: ['coûts', 'trimestriel', 'finance'],
      priority: 'high',
      downloadCount: 0
    },
    {
      id: 'R005',
      title: 'Rapport Sécurité Journalier',
      type: 'safety',
      status: 'ready',
      frequency: 'daily',
      format: 'pdf',
      createdBy: 'Sekou Camara',
      createdAt: '2025-01-26 06:00',
      lastGenerated: '2025-01-26 06:30',
      recipients: ['securite@textpro.ml'],
      description: 'État quotidien de la sécurité et incidents reportés',
      tags: ['sécurité', 'quotidien', 'incidents'],
      priority: 'urgent',
      size: '0.8 MB',
      downloadCount: 5
    }
  ];

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'T001',
      name: 'Production Mensuelle Standard',
      category: 'production',
      description: 'Template complet pour les rapports de production mensuels',
      sections: ['Vue d\'ensemble', 'KPIs Production', 'Analyse par Produit', 'Tendances', 'Recommandations'],
      estimatedTime: 15,
      dataPoints: 45,
      popularity: 95
    },
    {
      id: 'T002',
      name: 'Qualité Hebdomadaire Détaillé',
      category: 'quality',
      description: 'Analyse complète des métriques qualité sur base hebdomadaire',
      sections: ['Conformité Global', 'Défauts par Type', 'Audits', 'Actions Correctives', 'Satisfaction Client'],
      estimatedTime: 12,
      dataPoints: 38,
      popularity: 87
    },
    {
      id: 'T003',
      name: 'Performance Équipes Mensuel',
      category: 'performance',
      description: 'Évaluation détaillée de la performance des équipes',
      sections: ['OEE par Équipe', 'Productivité', 'Formation', 'Objectifs', 'Plan d\'Action'],
      estimatedTime: 18,
      dataPoints: 52,
      popularity: 78
    },
    {
      id: 'T004',
      name: 'Coûts Trimestriel Complet',
      category: 'cost',
      description: 'Analyse financière approfondie des coûts de production',
      sections: ['Coûts Directs', 'Coûts Indirects', 'Variances Budget', 'ROI', 'Projections'],
      estimatedTime: 25,
      dataPoints: 67,
      popularity: 82
    },
    {
      id: 'T005',
      name: 'Sécurité et Conformité',
      category: 'safety',
      description: 'Rapport de sécurité et conformité réglementaire',
      sections: ['Incidents', 'Formations Sécurité', 'Équipements Protection', 'Audits', 'Conformité'],
      estimatedTime: 10,
      dataPoints: 28,
      popularity: 91
    }
  ];

  const scheduledReports: ScheduledReport[] = [
    {
      id: 'S001',
      reportId: 'R001',
      reportTitle: 'Rapport Production Mensuel',
      frequency: 'Mensuel - 1er du mois',
      nextRun: '2025-02-01 09:00',
      recipients: ['direction@textpro.ml', 'production@textpro.ml'],
      status: 'active',
      lastRun: '2025-01-01 09:00',
      runCount: 12
    },
    {
      id: 'S002',
      reportId: 'R002',
      reportTitle: 'Rapport Qualité Hebdomadaire',
      frequency: 'Hebdomadaire - Lundi 8h',
      nextRun: '2025-01-27 08:00',
      recipients: ['qualite@textpro.ml'],
      status: 'active',
      lastRun: '2025-01-20 08:00',
      runCount: 48
    },
    {
      id: 'S003',
      reportId: 'R005',
      reportTitle: 'Rapport Sécurité Journalier',
      frequency: 'Quotidien - 6h30',
      nextRun: '2025-01-27 06:30',
      recipients: ['securite@textpro.ml'],
      status: 'active',
      lastRun: '2025-01-26 06:30',
      runCount: 365
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'success';
      case 'generating': return 'warning';
      case 'sent': return 'info';
      case 'draft': return 'default';
      case 'archived': return 'secondary';
      case 'failed': return 'danger';
      case 'active': return 'success';
      case 'paused': return 'warning';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'production': return <BarChart3 className="w-4 h-4 text-blue-600" />;
      case 'quality': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'performance': return <Users className="w-4 h-4 text-purple-600" />;
      case 'cost': return <TrendingUp className="w-4 h-4 text-orange-600" />;
      case 'safety': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'custom': return <Settings className="w-4 h-4 text-gray-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-600" />;
      case 'excel': return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
      case 'csv': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'word': return <FileText className="w-4 h-4 text-blue-800" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
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
          <Header title="Rapports" />
          
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Rapports & Documentation</h1>
                <p className="text-gray-600 mt-1">
                  Génération, planification et gestion des rapports de supervision
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="secondary" size="sm">
                  <Archive className="mr-2" size={16} />
                  Archive
                </Button>
                <Button variant="secondary" size="sm">
                  <Settings className="mr-2" size={16} />
                  Configurer
                </Button>
                <Button variant="primary" size="sm">
                  <Plus className="mr-2" size={16} />
                  Nouveau Rapport
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { key: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
                  { key: 'reports', label: 'Mes Rapports', icon: FileText },
                  { key: 'templates', label: 'Templates', icon: Bookmark },
                  { key: 'scheduled', label: 'Planifiés', icon: Clock },
                  { key: 'archive', label: 'Archive', icon: Archive }
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
                        <p className="text-sm font-medium text-gray-600">Rapports Actifs</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {reports.filter(r => r.status === 'ready' || r.status === 'generating').length}
                        </p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Planifications</p>
                        <p className="text-2xl font-bold text-green-600">
                          {scheduledReports.filter(s => s.status === 'active').length}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-green-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Templates Disponibles</p>
                        <p className="text-2xl font-bold text-purple-600">{reportTemplates.length}</p>
                      </div>
                      <Bookmark className="w-8 h-8 text-purple-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Téléchargements</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {reports.reduce((sum, r) => sum + r.downloadCount, 0)}
                        </p>
                      </div>
                      <Download className="w-8 h-8 text-orange-600" />
                    </div>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapports Récents</h3>
                    <div className="space-y-3">
                      {reports.slice(0, 4).map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(report.type)}
                            <div>
                              <p className="font-medium text-sm">{report.title}</p>
                              <p className="text-xs text-gray-600">
                                {report.createdBy} • {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(report.status) as any} size="sm">
                              {report.status}
                            </Badge>
                            {getFormatIcon(report.format)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochaines Exécutions</h3>
                    <div className="space-y-3">
                      {scheduledReports.slice(0, 4).map((scheduled) => (
                        <div key={scheduled.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{scheduled.reportTitle}</p>
                            <p className="text-xs text-gray-600">{scheduled.frequency}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {new Date(scheduled.nextRun).toLocaleDateString('fr-FR')}
                            </p>
                            <Badge variant={getStatusColor(scheduled.status) as any} size="sm">
                              {scheduled.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Rechercher un rapport..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    <Filter className="mr-2" size={16} />
                    Filtrer
                  </Button>
                </div>

                <div className="grid gap-4">
                  {reports.map((report) => (
                    <Card key={report.id} padding="lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          {getTypeIcon(report.type)}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{report.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              {report.tags.map((tag, index) => (
                                <Badge key={index} variant="default" size="sm">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(report.priority) as any} size="sm">
                            {report.priority}
                          </Badge>
                          <Badge variant={getStatusColor(report.status) as any} size="sm">
                            {report.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-xs text-gray-600">Créé par:</span>
                          <p className="text-sm font-medium">{report.createdBy}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Format:</span>
                          <div className="flex items-center gap-1">
                            {getFormatIcon(report.format)}
                            <span className="text-sm font-medium uppercase">{report.format}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Fréquence:</span>
                          <p className="text-sm font-medium capitalize">{report.frequency}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Téléchargements:</span>
                          <p className="text-sm font-medium">{report.downloadCount}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <span className="text-xs text-gray-600">Destinataires:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {report.recipients.map((recipient, index) => (
                            <Badge key={index} variant="info" size="sm">{recipient}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          {report.lastGenerated ? (
                            <>Généré le: {new Date(report.lastGenerated).toLocaleString('fr-FR')}</>
                          ) : (
                            <>Créé le: {new Date(report.createdAt).toLocaleString('fr-FR')}</>
                          )}
                          {report.size && <> • Taille: {report.size}</>}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm">
                            <Eye className="mr-2" size={16} />
                            Aperçu
                          </Button>
                          
                          {report.status === 'ready' && (
                            <>
                              <Button variant="secondary" size="sm">
                                <Download className="mr-2" size={16} />
                                Télécharger
                              </Button>
                              <Button variant="secondary" size="sm">
                                <Send className="mr-2" size={16} />
                                Envoyer
                              </Button>
                            </>
                          )}
                          
                          {report.status === 'draft' && (
                            <Button variant="primary" size="sm">
                              Générer
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Templates de Rapports</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reportTemplates.map((template) => (
                      <div key={template.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            {getTypeIcon(template.category)}
                            <div>
                              <h4 className="font-medium text-gray-900">{template.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">{template.popularity}%</span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <span className="text-xs text-gray-600">Sections incluses:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.sections.map((section, index) => (
                              <Badge key={index} variant="default" size="sm">{section}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-xs text-gray-600">Temps estimé:</span>
                            <p className="text-sm font-medium">{template.estimatedTime} min</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Points de données:</span>
                            <p className="text-sm font-medium">{template.dataPoints}</p>
                          </div>
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

            {/* Scheduled Tab */}
            {activeTab === 'scheduled' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Rapports Planifiés</h2>
                    <Button variant="primary" size="sm">
                      <Plus className="mr-2" size={16} />
                      Nouvelle Planification
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {scheduledReports.map((scheduled) => (
                      <div key={scheduled.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{scheduled.reportTitle}</h4>
                            <p className="text-sm text-gray-600">{scheduled.frequency}</p>
                          </div>
                          <Badge variant={getStatusColor(scheduled.status) as any} size="sm">
                            {scheduled.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-xs text-gray-600">Prochaine exécution:</span>
                            <p className="text-sm font-medium">
                              {new Date(scheduled.nextRun).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Dernière exécution:</span>
                            <p className="text-sm font-medium">
                              {scheduled.lastRun 
                                ? new Date(scheduled.lastRun).toLocaleDateString('fr-FR')
                                : 'Jamais'
                              }
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Exécutions totales:</span>
                            <p className="text-sm font-medium">{scheduled.runCount}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Destinataires:</span>
                            <p className="text-sm font-medium">{scheduled.recipients.length}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <span className="text-xs text-gray-600">Destinataires:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {scheduled.recipients.map((recipient, index) => (
                              <Badge key={index} variant="info" size="sm">{recipient}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="sm">
                            <Settings className="mr-2" size={16} />
                            Configurer
                          </Button>
                          <Button variant="secondary" size="sm">
                            Exécuter Maintenant
                          </Button>
                          {scheduled.status === 'active' ? (
                            <Button variant="warning" size="sm">
                              Suspendre
                            </Button>
                          ) : (
                            <Button variant="success" size="sm">
                              Activer
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Archive Tab */}
            {activeTab === 'archive' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Archive des Rapports</h2>
                    <div className="flex gap-3">
                      <Button variant="secondary" size="sm">
                        <Filter className="mr-2" size={16} />
                        Filtrer
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Trash2 className="mr-2" size={16} />
                        Nettoyer
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-center py-12">
                    <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Archive des Rapports</h3>
                    <p className="text-gray-600 mb-4">
                      Les rapports archivés apparaîtront ici pour consultation historique
                    </p>
                    <Button variant="secondary" size="sm">
                      Configurer l'Archivage Automatique
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

export default ReportsPage;
