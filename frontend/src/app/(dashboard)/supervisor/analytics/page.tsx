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
  BarChart3,
  Plus,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Users,
  Clock,
  DollarSign,
  Package,
  Zap,
  AlertTriangle,
  CheckCircle,
  PieChart,
  LineChart,
  Settings,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import ExportService from '../../../../../services/exportService';
import AnalyticsService from '@/services/analyticsService';


// Colors for category bars
const categoryColors = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B'];

interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  period: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  category: 'production' | 'quality' | 'efficiency' | 'cost';
}

interface PerformanceMetric {
  id: string;
  department: string;
  supervisor: string;
  efficiency: number;
  productivity: number;
  qualityScore: number;
  oee: number; // Overall Equipment Effectiveness
  staff: number;
  target: number;
}

interface ProductionTrend {
  id: string;
  product: string;
  week1: number;
  week2: number;
  week3: number;
  week4: number;
  total: number;
  target: number;
  growth: number;
}

interface CostAnalysis {
  id: string;
  category: 'raw_materials' | 'labor' | 'energy' | 'maintenance' | 'quality' | 'overhead';
  current: number;
  budget: number;
  variance: number;
  trend: 'up' | 'down' | 'stable';
}

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'production' | 'performance' | 'costs' | 'trends'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const kpis: KPI[] = [
    { id: 'KPI001', name: 'Production Totale', value: 125000, target: 120000, unit: 'm', trend: 'up', change: 8.5, period: 'ce mois', status: 'excellent', category: 'production' },
    { id: 'KPI002', name: 'Efficacité Globale (OEE)', value: 87.2, target: 85, unit: '%', trend: 'up', change: 3.2, period: 'ce mois', status: 'good', category: 'efficiency' },
    { id: 'KPI003', name: 'Temps de Cycle Moyen', value: 12.8, target: 15, unit: 'min', trend: 'down', change: -7.1, period: 'ce mois', status: 'excellent', category: 'efficiency' },
    { id: 'KPI004', name: 'Taux de Conformité', value: 96.8, target: 95, unit: '%', trend: 'up', change: 1.2, period: 'ce mois', status: 'excellent', category: 'quality' },
    { id: 'KPI005', name: 'Coût par Unité', value: 8.45, target: 9.00, unit: '€', trend: 'down', change: -6.1, period: 'ce mois', status: 'excellent', category: 'cost' },
    { id: 'KPI006', name: 'Productivité Équipe', value: 94.3, target: 90, unit: '%', trend: 'up', change: 5.8, period: 'ce mois', status: 'excellent', category: 'efficiency' },
    { id: 'KPI007', name: 'Taux de Défauts', value: 2.1, target: 3, unit: '%', trend: 'down', change: -12.5, period: 'ce mois', status: 'excellent', category: 'quality' },
    { id: 'KPI008', name: 'Temps d\'Arrêt', value: 4.2, target: 5, unit: '%', trend: 'down', change: -8.7, period: 'ce mois', status: 'good', category: 'efficiency' }
  ];

  const performanceMetrics: PerformanceMetric[] = [
    { id: 'PM001', department: 'Atelier A - Tissage', supervisor: 'Amadou Traoré', efficiency: 94, productivity: 96, qualityScore: 97, oee: 89, staff: 12, target: 85 },
    { id: 'PM002', department: 'Atelier B - Filature', supervisor: 'Fatima Diallo', efficiency: 89, productivity: 91, qualityScore: 94, oee: 84, staff: 8, target: 85 },
    { id: 'PM003', department: 'Atelier C - Teinture', supervisor: 'Ibrahim Keita', efficiency: 76, productivity: 78, qualityScore: 89, oee: 71, staff: 6, target: 85 },
    { id: 'PM004', department: 'Contrôle Qualité', supervisor: 'Awa Diarra', efficiency: 98, productivity: 95, qualityScore: 99, oee: 94, staff: 4, target: 90 },
    { id: 'PM005', department: 'Finition', supervisor: 'Sekou Camara', efficiency: 92, productivity: 89, qualityScore: 96, oee: 86, staff: 10, target: 85 }
  ];

  const productionTrends: ProductionTrend[] = [
    { id: 'PT001', product: 'Cotton Fabric Premium', week1: 8500, week2: 9200, week3: 8800, week4: 9500, total: 36000, target: 35000, growth: 8.9 },
    { id: 'PT002', product: 'Denim Standard', week1: 12000, week2: 11500, week3: 12800, week4: 13200, total: 49500, target: 48000, growth: 5.2 },
    { id: 'PT003', product: 'Textile Impression', week1: 6200, week2: 6800, week3: 7100, week4: 6900, total: 27000, target: 26000, growth: 3.1 },
    { id: 'PT004', product: 'Tissu Africain', week1: 4500, week2: 4200, week3: 4800, week4: 5000, total: 18500, target: 20000, growth: -7.5 }
  ];

  const costAnalysis: CostAnalysis[] = [
    { id: 'CA001', category: 'raw_materials', current: 45200, budget: 47000, variance: -3.8, trend: 'down' },
    { id: 'CA002', category: 'labor', current: 28500, budget: 27000, variance: 5.6, trend: 'up' },
    { id: 'CA003', category: 'energy', current: 8900, budget: 9500, variance: -6.3, trend: 'down' },
    { id: 'CA004', category: 'maintenance', current: 5600, budget: 6000, variance: -6.7, trend: 'down' },
    { id: 'CA005', category: 'quality', current: 3200, budget: 4000, variance: -20.0, trend: 'down' },
    { id: 'CA006', category: 'overhead', current: 12800, budget: 13000, variance: -1.5, trend: 'stable' }
  ];

  // Prepare data for category chart (avg performance per category)
  const categoryData = React.useMemo(() => {
    if (analyticsData) {
      const prod = analyticsData.production?.daily_summary?.efficiency ?? kpis.find(k => k.category === 'production')?.value ?? 0;
      const qual = analyticsData.quality?.overall_metrics?.average_score ?? kpis.find(k => k.category === 'quality')?.value ?? 0;
      const eff = analyticsData.machines?.fleet_overview?.average_utilization ?? kpis.find(k => k.category === 'efficiency')?.value ?? 0;
      const cost = kpis.find(k => k.category === 'cost')?.value ?? 0;
      return [
        { name: 'Production', value: Number(prod) },
        { name: 'Quality', value: Number(qual) },
        { name: 'Efficiency', value: Number(eff) },
        { name: 'Cost', value: Number(cost) }
      ];
    }

    return ['production', 'quality', 'efficiency', 'cost'].map((category) => {
      const categoryKPIs = kpis.filter(kpi => kpi.category === category);
      const avgPerformance = categoryKPIs.length
        ? categoryKPIs.reduce((sum, kpi) => sum + ((kpi.value / kpi.target) * 100), 0) / categoryKPIs.length
        : 0;
      return { name: category.charAt(0).toUpperCase() + category.slice(1), value: Number(avgPerformance.toFixed(1)) };
    });
  }, [analyticsData, kpis]);

  

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'warning': return 'warning';
      case 'critical': return 'danger';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (change < 0) return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'production': return <Package className="w-5 h-5 text-blue-600" />;
      case 'quality': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'efficiency': return <Zap className="w-5 h-5 text-yellow-600" />;
      case 'cost': return <DollarSign className="w-5 h-5 text-purple-600" />;
      default: return <BarChart3 className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCostCategoryLabel = (category: string) => {
    switch (category) {
      case 'raw_materials': return 'Matières Premières';
      case 'labor': return 'Main d\'Œuvre';
      case 'energy': return 'Énergie';
      case 'maintenance': return 'Maintenance';
      case 'quality': return 'Qualité';
      case 'overhead': return 'Frais Généraux';
      default: return category;
    }
  };

  const handleExport = async (format: 'excel' | 'csv' | 'pdf' = 'excel') => {
    try {
      setLoading(true);

      // Build a lightweight analytics payload from available page data
      const analyticsData = {
        overview: {
          overall_score: 94,
          total_production: kpis.find(k => k.id === 'KPI001')?.value || 0,
          average_quality: kpis.find(k => k.category === 'quality') ? 96.8 : 0,
          machine_utilization: 87,
          active_alerts: 3,
          completed_batches: 47
        },
        production: {
          daily_summary: { total_output: productionTrends.reduce((s, p) => s + p.total, 0), efficiency: 94.2, defect_rate: 1.8, avg_cycle_time: 4.2 }
        },
        quality: { overall_metrics: { average_score: 96.8, pass_rate: 98.1, defect_rate: 1.9, ai_accuracy: 94.3, inspection_count: 24 } },
        machines: { machine_details: [] },
        workflow: { process_stages: [] }
      };

      const filters = { timeRange: selectedPeriod };

      // @ts-ignore - dynamic access to export service static helpers
      const ExportSvc: any = ExportService as any;
      const exportData = ExportSvc.generateAnalyticsReportData(analyticsData, filters, user);

      if (format === 'excel') {
        await ExportSvc.exportToExcel(exportData);
      } else if (format === 'csv') {
        await ExportSvc.exportToCSV(exportData);
      } else {
        await ExportSvc.exportToPDF(exportData);
      }
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Shared refresh function with improved error logging
  const refreshAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnalyticsService.loadAllAnalytics();
      setAnalyticsData(data);
      console.log('Analytics refreshed', data);
    } catch (err: any) {
      console.error('Failed to load analytics', err);
      // Axios-like error details
      if (err?.response) {
        try {
          console.error('Response status:', err.response.status);
          console.error('Response data:', JSON.stringify(err.response.data, null, 2));
        } catch (e) {
          console.error('Error serializing response data', e);
        }
      }
      const msg = err?.message || (err?.response?.data && JSON.stringify(err.response.data)) || 'Failed to load analytics';
      setError(msg);
      // Provide a concise alert to the user
      if (typeof window !== 'undefined') {
        alert(`Failed to load analytics: ${msg}. See console for details.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-load analytics on mount
  useEffect(() => {
    // Fire-and-forget; errors are surfaced to console/alert
    refreshAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user || user.role !== 'supervisor') {
    return <div>Access denied.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <SupervisorSidebar />
        
        <main className="flex-1 ml-64">
          <Header title="Analyses & KPIs" />
          
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analyses & Indicateurs de Performance</h1>
                <p className="text-gray-600 mt-1">
                  Tableaux de bord et analyses détaillées de la performance de production
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" onClick={async () => { await refreshAnalytics(); }}>
                  <RefreshCw className="mr-2" size={16} />
                  Actualiser
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { key: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
                  { key: 'production', label: 'Production', icon: Package },
                  { key: 'performance', label: 'Performance Équipes', icon: Users },
                  { key: 'costs', label: 'Coûts', icon: DollarSign },
                  { key: 'trends', label: 'Tendances', icon: LineChart }
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
                  {kpis.slice(0, 4).map((kpi) => (
                    <Card key={kpi.id} padding="lg">
                      <div className="flex items-center justify-between mb-2">
                        {getCategoryIcon(kpi.category)}
                        <Badge variant={getStatusColor(kpi.status) as any} size="sm">
                          {kpi.status}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">{kpi.name}</h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {kpi.value.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-600">{kpi.unit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getChangeIcon(kpi.change)}
                        <span className={`text-sm font-medium ${
                          kpi.change > 0 ? 'text-green-600' : kpi.change < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {Math.abs(kpi.change)}% {kpi.period}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* KPI Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicateurs par Catégorie</h3>
                    <div style={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" name="Performance (%)">
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card padding="lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance par Département</h3>
                    <div className="space-y-3">
                      {performanceMetrics.slice(0, 4).map((metric) => (
                        <div key={metric.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{metric.department}</p>
                            <p className="text-xs text-gray-600">{metric.supervisor}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <p className="text-xs text-gray-600">OEE</p>
                              <p className="text-sm font-medium">{metric.oee}%</p>
                            </div>
                            <div className="w-16">
                              <ProgressBar 
                                value={metric.oee} 
                                variant={metric.oee >= 85 ? 'success' : metric.oee >= 75 ? 'warning' : 'danger'} 
                                className="h-2" 
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              
            )}

            {/* Production Tab */}
            {activeTab === 'production' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {kpis.filter(kpi => kpi.category === 'production' || kpi.category === 'efficiency').map((kpi) => (
                    <Card key={kpi.id} padding="lg">
                      <div className="flex items-center justify-between mb-2">
                        {getCategoryIcon(kpi.category)}
                        {getTrendIcon(kpi.trend)}
                      </div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">{kpi.name}</h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-xl font-bold text-gray-900">
                          {kpi.value.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-600">{kpi.unit}</span>
                      </div>
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Objectif: {kpi.target.toLocaleString()}{kpi.unit}</span>
                          <span>{((kpi.value / kpi.target) * 100).toFixed(1)}%</span>
                        </div>
                        <ProgressBar 
                          value={(kpi.value / kpi.target) * 100} 
                          variant={getStatusColor(kpi.status) as any} 
                          className="h-2" 
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {getChangeIcon(kpi.change)}
                        <span className={`text-xs font-medium ${
                          kpi.change > 0 ? 'text-green-600' : kpi.change < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {Math.abs(kpi.change)}% vs mois précédent
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Production par Produit</h3>
                  <div className="grid gap-4">
                    {productionTrends.map((trend) => (
                      <div key={trend.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{trend.product}</h4>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={trend.growth >= 0 ? 'success' : 'danger'} 
                              size="sm"
                            >
                              {trend.growth >= 0 ? '+' : ''}{trend.growth.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 mb-3">
                          <div className="text-center">
                            <p className="text-xs text-gray-600">Semaine 1</p>
                            <p className="text-sm font-medium">{trend.week1.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600">Semaine 2</p>
                            <p className="text-sm font-medium">{trend.week2.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600">Semaine 3</p>
                            <p className="text-sm font-medium">{trend.week3.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600">Semaine 4</p>
                            <p className="text-sm font-medium">{trend.week4.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            Total: {trend.total.toLocaleString()} / Objectif: {trend.target.toLocaleString()}
                          </span>
                          <span className="text-sm font-medium">
                            {((trend.total / trend.target) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <ProgressBar 
                          value={(trend.total / trend.target) * 100} 
                          variant={trend.total >= trend.target ? 'success' : 'warning'} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance par Département</h2>
                  
                  <div className="grid gap-4">
                    {performanceMetrics.map((metric) => (
                      <div key={metric.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900">{metric.department}</h4>
                            <p className="text-sm text-gray-600">Superviseur: {metric.supervisor}</p>
                            <p className="text-sm text-gray-600">Personnel: {metric.staff} personnes</p>
                          </div>
                          <Badge 
                            variant={metric.oee >= metric.target ? 'success' : metric.oee >= 75 ? 'warning' : 'danger'} 
                            size="sm"
                          >
                            OEE: {metric.oee}%
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Efficacité</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <ProgressBar 
                                  value={metric.efficiency} 
                                  variant={metric.efficiency >= 90 ? 'success' : metric.efficiency >= 80 ? 'warning' : 'danger'} 
                                  className="h-2" 
                                />
                              </div>
                              <span className="text-sm font-medium">{metric.efficiency}%</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Productivité</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <ProgressBar 
                                  value={metric.productivity} 
                                  variant={metric.productivity >= 90 ? 'success' : metric.productivity >= 80 ? 'warning' : 'danger'} 
                                  className="h-2" 
                                />
                              </div>
                              <span className="text-sm font-medium">{metric.productivity}%</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Score Qualité</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <ProgressBar 
                                  value={metric.qualityScore} 
                                  variant={metric.qualityScore >= 95 ? 'success' : metric.qualityScore >= 90 ? 'warning' : 'danger'} 
                                  className="h-2" 
                                />
                              </div>
                              <span className="text-sm font-medium">{metric.qualityScore}%</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-600 mb-1">vs Objectif</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <ProgressBar 
                                  value={(metric.oee / metric.target) * 100} 
                                  variant={metric.oee >= metric.target ? 'success' : 'warning'} 
                                  className="h-2" 
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {((metric.oee / metric.target) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-4">
                          <Button variant="secondary" size="sm">
                            <Eye className="mr-2" size={16} />
                            Détails
                          </Button>
                          <Button variant="primary" size="sm">
                            Analyser
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Costs Tab */}
            {activeTab === 'costs' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {kpis.filter(kpi => kpi.category === 'cost').map((kpi) => (
                    <Card key={kpi.id} padding="lg">
                      <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        {getTrendIcon(kpi.trend)}
                      </div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">{kpi.name}</h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-xl font-bold text-gray-900">
                          {kpi.value.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-600">{kpi.unit}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getChangeIcon(kpi.change)}
                        <span className={`text-xs font-medium ${
                          kpi.change < 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Math.abs(kpi.change)}% vs objectif
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyse des Coûts par Catégorie</h3>
                  <div className="grid gap-4">
                    {costAnalysis.map((cost) => (
                      <div key={cost.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            {getCostCategoryLabel(cost.category)}
                          </h4>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(cost.trend)}
                            <Badge 
                              variant={cost.variance <= 0 ? 'success' : cost.variance <= 10 ? 'warning' : 'danger'} 
                              size="sm"
                            >
                              {cost.variance >= 0 ? '+' : ''}{cost.variance.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-600">Réel</p>
                            <p className="text-sm font-medium">{cost.current.toLocaleString()} €</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Budget</p>
                            <p className="text-sm font-medium">{cost.budget.toLocaleString()} €</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Écart</p>
                            <p className={`text-sm font-medium ${
                              cost.variance <= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {cost.variance >= 0 ? '+' : ''}{(cost.current - cost.budget).toLocaleString()} €
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Utilisation du budget</span>
                          <span className="text-xs font-medium">
                            {((cost.current / cost.budget) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <ProgressBar 
                          value={(cost.current / cost.budget) * 100} 
                          variant={cost.variance <= 0 ? 'success' : cost.variance <= 10 ? 'warning' : 'danger'} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Trends Tab */}
            {activeTab === 'trends' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Tendances et Évolutions</h2>
                  
                  <div className="grid gap-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-4">Évolution des KPIs Principaux</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {kpis.slice(0, 6).map((kpi) => (
                          <div key={kpi.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center gap-3">
                              {getCategoryIcon(kpi.category)}
                              <span className="text-sm font-medium">{kpi.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getChangeIcon(kpi.change)}
                              <span className={`text-sm font-medium ${
                                kpi.change > 0 ? 'text-green-600' : kpi.change < 0 ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {Math.abs(kpi.change)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-4">Tendances de Production par Produit</h4>
                      <div className="space-y-3">
                        {productionTrends.map((trend) => (
                          <div key={trend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium text-sm">{trend.product}</p>
                              <p className="text-xs text-gray-600">
                                Total mensuel: {trend.total.toLocaleString()} m
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-sm font-medium">vs Objectif</p>
                                <p className="text-xs text-gray-600">
                                  {((trend.total / trend.target) * 100).toFixed(1)}%
                                </p>
                              </div>
                              <Badge 
                                variant={trend.growth >= 0 ? 'success' : 'danger'} 
                                size="sm"
                              >
                                {trend.growth >= 0 ? '+' : ''}{trend.growth.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
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

export default AnalyticsPage;
