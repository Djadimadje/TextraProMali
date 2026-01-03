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
import apiService from '@/services/api';
import NewScheduleModal from '@/components/reports/NewScheduleModal';

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

  const [reports, setReports] = useState<Report[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showNewSchedule, setShowNewSchedule] = useState(false);
  // Backend currently does not expose a schedules creation endpoint; keep scheduling UI disabled
  const scheduleAvailable = false;

  // reportTemplates state defined above

  // scheduledReports state defined above

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

  // Load reports from API
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const dashboard = await apiService.getReportsDashboard();

        if (!mounted) return;

        // Try to parse common shapes
        setReports(dashboard?.reports || dashboard?.data?.reports || []);
        setReportTemplates(dashboard?.templates || dashboard?.data?.templates || []);
        setScheduledReports(dashboard?.scheduled || dashboard?.data?.scheduled || []);

        // As fallback, fetch production/quality-specific lists and merge if empty
        if ((dashboard?.reports || []).length === 0) {
          const [prod, qual] = await Promise.allSettled([
            apiService.getProductionReports(),
            apiService.getQualityReports()
          ]);
          const prodDataRaw = prod.status === 'fulfilled' ? prod.value : [];
          const qualDataRaw = qual.status === 'fulfilled' ? qual.value : [];

          const normalize = (v: any) => {
            if (!v) return [];
            if (Array.isArray(v)) return v;
            if (v.results && Array.isArray(v.results)) return v.results;
            if (v.data && Array.isArray(v.data)) return v.data;
            if (v.data?.results && Array.isArray(v.data.results)) return v.data.results;
            if (v.items && Array.isArray(v.items)) return v.items;
            return [];
          };

          const prodList = normalize(prodDataRaw);
          const qualList = normalize(qualDataRaw);
          if (mounted) setReports([...prodList, ...qualList]);
        }
      } catch (err) {
        console.error('Failed to load reports dashboard', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async (report: Report) => {
    try {
      setLoading(true);
      const blob = await apiService.generateReport(report.type, { reportId: report.id });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = report.format === 'excel' ? 'xlsx' : report.format === 'csv' ? 'csv' : 'pdf';
      a.download = `${report.title.replace(/[^a-z0-9]/gi, '_').slice(0,120)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert('Download failed. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (report: Report) => {
    // For now generation uses the same endpoint as download
    await handleDownload(report);
  };

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
              
              <div className="flex gap-3" />
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { key: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
                  { key: 'reports', label: 'Mes Rapports', icon: FileText },
                  { key: 'templates', label: 'Templates', icon: Bookmark },
                  { key: 'scheduled', label: 'Planifiés', icon: Clock }
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
                              <Button variant="secondary" size="sm" onClick={() => handleDownload(report)}>
                                <Download className="mr-2" size={16} />
                                Télécharger
                              </Button>
                              <Button variant="secondary" size="sm" onClick={() => alert('Send not implemented')}>
                                <Send className="mr-2" size={16} />
                                Envoyer
                              </Button>
                            </>
                          )}
                          
                          {report.status === 'draft' && (
                            <Button variant="primary" size="sm" onClick={() => handleGenerate(report)}>
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
                    {scheduleAvailable ? (
                      <>
                        <Button variant="primary" size="sm" onClick={() => setShowNewSchedule(true)}>
                          <Plus className="mr-2" size={16} />
                          Nouvelle Planification
                        </Button>
                        {showNewSchedule && (
                          <NewScheduleModal
                            open={showNewSchedule}
                            onClose={() => setShowNewSchedule(false)}
                            onCreated={(created) => {
                              setScheduledReports(prev => [created, ...prev]);
                              setShowNewSchedule(false);
                            }}
                          />
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Button variant="secondary" size="sm" disabled>
                          <Plus className="mr-2" size={16} />
                          Nouvelle Planification
                        </Button>
                        <span className="text-sm text-gray-500">La planification n'est pas disponible sur le serveur.</span>
                      </div>
                    )}
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
