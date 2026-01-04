'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import InspectorSidebar from '../../../../../components/layout/InspectorSidebar';
import Header from '../../../../../components/layout/Header';
import Card from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import Badge from '../../../../../components/ui/Badge';
import ProgressBar from '../../../../../components/ui/ProgressBar';
import { useRouter } from 'next/navigation';
import api from '../../../../services/api';
import { 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Camera,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Eye,
  FileText,
  Settings,
  Zap,
  Calendar,
  Clock,
  Target
} from 'lucide-react';

interface QualityStandard {
  id: string;
  name: string;
  category: string;
  version: string;
  status: 'active' | 'draft' | 'archived';
  criteria: number;
  lastUpdated: string;
}

interface InspectionTemplate {
  id: string;
  name: string;
  type: 'visual' | 'ai' | 'manual' | 'hybrid';
  standards: string[];
  duration: number;
  accuracy: number;
  usage: number;
}

const QualityControlPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'standards' | 'templates' | 'analytics'>('overview');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // fetch live standards and templates from backend
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setDataLoading(true);
      setDataError(null);
      try {
        const [sResp, tResp] = await Promise.allSettled([
          api.get('/quality/standards/'),
          api.get('/quality/templates/')
        ]);

        if (!mounted) return;

        if (sResp.status === 'fulfilled') {
          const sData = sResp.value.data?.data || sResp.value.data || [];
          if (Array.isArray(sData)) setStandards(sData as any);
        }

        if (tResp.status === 'fulfilled') {
          const tData = tResp.value.data?.data || tResp.value.data || [];
          if (Array.isArray(tData)) setTemplates(tData as any);
        }
      } catch (err) {
        if (mounted) setDataError('Failed to load standards or templates');
      } finally {
        if (mounted) setDataLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  // Fetch analytics metrics and recent inspections for the overview charts
  useEffect(() => {
    let mounted = true;
    const loadMetrics = async () => {
      setMetricsLoading(true);
      setMetricsError(null);
      setRecentLoading(true);
      setRecentError(null);

      try {
        const [aResp, qResp] = await Promise.allSettled([
          api.getQualityAnalytics(),
          api.getQualityChecks({ page_size: 7, ordering: '-created_at' })
        ]);

        if (!mounted) return;

        if (aResp.status === 'fulfilled') {
          const aData = aResp.value?.data || aResp.value || null;
          setMetrics(aData);
        } else {
          setMetricsError('Failed to load analytics');
        }

        if (qResp.status === 'fulfilled') {
          const q = qResp.value?.results || qResp.value?.data || qResp.value || [];
          const arr = Array.isArray(q) ? q : (q.results || q.data || []);
          setRecentInspections(arr as any[]);
        } else {
          setRecentError('Failed to load recent inspections');
        }
      } catch (err) {
        if (mounted) {
          setMetricsError('Failed to load analytics');
          setRecentError('Failed to load recent inspections');
        }
      } finally {
        if (mounted) {
          setMetricsLoading(false);
          setRecentLoading(false);
        }
      }
    };

    loadMetrics();
    return () => { mounted = false; };
  }, []);

  // local state for live data (seeded with defaults while backend loads)
  const [standards, setStandards] = useState<QualityStandard[]>([
    { id: 'QS001', name: 'Cotton Fabric Quality Standard', category: 'Textile', version: 'v2.1', status: 'active', criteria: 15, lastUpdated: '2025-08-20' },
    { id: 'QS002', name: 'Yarn Strength Requirements', category: 'Yarn', version: 'v1.8', status: 'active', criteria: 12, lastUpdated: '2025-08-18' },
    { id: 'QS003', name: 'Color Consistency Standards', category: 'Dyeing', version: 'v3.0', status: 'draft', criteria: 8, lastUpdated: '2025-08-24' }
  ]);

  const [templates, setTemplates] = useState<InspectionTemplate[]>([
    { id: 'IT001', name: 'Standard Fabric Inspection', type: 'hybrid', standards: ['QS001','QS002'], duration: 15, accuracy: 96.5, usage: 142 },
    { id: 'IT002', name: 'AI Visual Defect Detection', type: 'ai', standards: ['QS001'], duration: 5, accuracy: 98.2, usage: 89 },
    { id: 'IT003', name: 'Manual Color Assessment', type: 'manual', standards: ['QS003'], duration: 20, accuracy: 94.1, usage: 67 }
  ]);

  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [recentInspections, setRecentInspections] = useState<any[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai': return <Zap className="w-4 h-4" />;
      case 'visual': return <Eye className="w-4 h-4" />;
      case 'manual': return <FileText className="w-4 h-4" />;
      case 'hybrid': return <Settings className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  if (!user || user.role !== 'inspector') {
    return <div>Access denied.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <InspectorSidebar />
        
        <main className="flex-1 ml-64">
          <Header title="Quality Control" />
          
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quality Control Management</h1>
                <p className="text-gray-600 mt-1">
                  Manage inspection standards, templates, and quality analysis
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="secondary" size="sm">
                  <Download className="mr-2" size={16} />
                  Export Data
                </Button>
                <Button variant="primary" size="sm" onClick={() => router.push('/inspector/quality/new')}>
                  <Plus className="mr-2" size={16} />
                  New Inspection
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { key: 'overview', label: 'Overview', icon: BarChart3 },
                  { key: 'standards', label: 'Quality Standards', icon: Target },
                  { key: 'templates', label: 'Inspection Templates', icon: FileText },
                  { key: 'analytics', label: 'Analytics', icon: BarChart3 }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === key
                        ? 'border-orange-500 text-orange-600'
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
                        <p className="text-sm font-medium text-gray-600">Active Standards</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {standards.filter(s => s.status === 'active').length}
                        </p>
                      </div>
                      <Target className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-green-600">
                        +2 updated this week
                      </div>
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Templates</p>
                        <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-blue-600">
                        {metricsLoading ? 'Loading...' : (metrics?.template_avg_accuracy ?? metrics?.avg_template_accuracy ?? '96.3%')} avg accuracy
                      </div>
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Today's Inspections</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {metricsLoading ? '...' : (metrics?.todayInspections?.completed ?? metrics?.today_inspections_count ?? recentInspections.length)}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-green-600">
                        {metricsLoading ? 'Loading...' : (metrics?.passRate ?? metrics?.pass_rate ?? '91.5%')} pass rate
                      </div>
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                        <p className="text-2xl font-bold text-gray-900">{metricsLoading ? '...' : (metrics?.ai_accuracy ?? metrics?.aiAccuracy ?? '98.2%')}</p>
                      </div>
                      <Zap className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-purple-600">
                        {metrics?.model_version ? `Model ${metrics.model_version} active` : 'Model v2.1 active'}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="primary" className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => router.push('/inspector/quality/new')}>
                      <Plus className="w-6 h-6" />
                      <span className="text-sm">New Inspection</span>
                    </Button>
                    <Button variant="secondary" className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => router.push('/inspector/quality/camera')}>
                      <Camera className="w-6 h-6" />
                      <span className="text-sm">Camera Mode</span>
                    </Button>
                    <Button variant="secondary" className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => router.push('/inspector/quality/new?ai=true')}>
                      <Zap className="w-6 h-6" />
                      <span className="text-sm">AI Analysis</span>
                    </Button>
                    <Button variant="secondary" className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => router.push('/inspector/quality?tab=analytics')}>
                      <BarChart3 className="w-6 h-6" />
                      <span className="text-sm">View Reports</span>
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Standards Tab */}
            {activeTab === 'standards' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Quality Standards</h2>
                  <div className="flex gap-3">
                    <Button variant="secondary" size="sm">
                      <Upload className="mr-2" size={16} />
                      Import Standards
                    </Button>
                    <Button variant="primary" size="sm">
                      <Plus className="mr-2" size={16} />
                      Create Standard
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {dataLoading && (
                    <Card padding="lg">
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="space-y-2">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded" />
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}

                  {dataError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-800">{dataError}</p>
                    </div>
                  )}

                  {!dataLoading && !dataError && standards.map((standard) => (
                    <Card key={standard.id} padding="lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{standard.name}</h3>
                            <Badge variant={getStatusColor(standard.status) as any} size="sm">
                              {standard.status}
                            </Badge>
                            <Badge variant="default" size="sm">
                              {standard.version}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Category: {standard.category}</span>
                            <span>Criteria: {standard.criteria}</span>
                            <span>Updated: {standard.lastUpdated}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
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
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Inspection Templates</h2>
                  <Button variant="primary" size="sm">
                    <Plus className="mr-2" size={16} />
                    Create Template
                  </Button>
                </div>

                <div className="grid gap-4">
                  {dataLoading && (
                    <Card padding="lg">
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="space-y-2">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded" />
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}

                  {dataError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-800">{dataError}</p>
                    </div>
                  )}

                  {!dataLoading && !dataError && templates.map((template) => (
                    <Card key={template.id} padding="lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getTypeIcon(template.type)}
                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                            <Badge variant="info" size="sm">
                              {template.type}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <span>Duration: {template.duration}min</span>
                            <span>Accuracy: {template.accuracy}%</span>
                            <span>Used: {template.usage} times</span>
                            <span>Standards: {template.standards.length}</span>
                          </div>
                          <ProgressBar 
                            value={template.accuracy} 
                            variant={template.accuracy >= 95 ? 'success' : 'warning'}
                            className="h-2"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm">
                            Use Template
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Quality Analytics</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card padding="lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Inspection Trends</h3>
                    <div className="h-64 p-4 bg-white rounded-lg">
                      {recentLoading ? (
                        <div className="h-full flex items-center justify-center text-sm text-gray-500">Loading trends...</div>
                      ) : recentError ? (
                        <div className="h-full flex items-center justify-center text-sm text-red-600">{recentError}</div>
                      ) : recentInspections.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-sm text-gray-500">No recent inspections</div>
                      ) : (
                        <div className="h-full flex items-end gap-2 items-stretch">
                          {(() => {
                            const values = recentInspections.map((r: any) => (r.ai_confidence_score ? Math.round((r.ai_confidence_score||0)*100) : (r.defectsFound ?? (r.defect_detected ? 1 : 0))));
                            const max = Math.max(...values, 1);
                            return values.map((v: number, i: number) => (
                              <div key={i} className="flex-1 flex flex-col items-center">
                                <div className="bg-orange-500 w-full" style={{ height: `${(v / max) * 100}%` }}></div>
                                <div className="text-xs text-gray-600 mt-2 truncate">{new Date(recentInspections[i]?.created_at || '').toLocaleDateString()}</div>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card padding="lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Defect Categories</h3>
                    <div className="h-64 p-4 bg-white rounded-lg">
                      {recentLoading ? (
                        <div className="h-full flex items-center justify-center text-sm text-gray-500">Loading categories...</div>
                      ) : recentError ? (
                        <div className="h-full flex items-center justify-center text-sm text-red-600">{recentError}</div>
                      ) : recentInspections.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-sm text-gray-500">No data</div>
                      ) : (
                        <div className="h-full grid grid-cols-3 gap-4">
                          {['low','medium','high','critical'].map((severity) => {
                            const count = recentInspections.filter(r => (r.defect_severity || r.severity || '').toString().toLowerCase() === severity).length;
                            return (
                              <div key={severity} className="p-3 bg-gray-50 rounded">
                                <div className="text-sm text-gray-600">{severity}</div>
                                <div className="text-2xl font-bold">{count}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default QualityControlPage;
