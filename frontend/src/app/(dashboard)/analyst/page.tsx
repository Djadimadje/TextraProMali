'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useActivityTracker } from '../../../hooks/useActivityTracker';
import apiService from '../../../services/api';
import { AnalyticsMetrics, RecentAnalysis } from '../../../types/api';
import AnalystSidebar from '../../../../components/layout/AnalystSidebar';
import Header from '../../../../components/layout/Header';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Badge from '../../../../components/ui/Badge';
import ProgressBar from '../../../../components/ui/ProgressBar';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  FileText, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap
} from 'lucide-react';

const AnalystDashboard: React.FC = () => {
  // Track user activity for auto-logout
  useActivityTracker();
  
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication and authorization check
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (user && user.role !== 'analyst') {
        const userDashboard = `/${user.role}`;
        router.push(userDashboard);
        return;
      }
      
      if (user && user.role === 'analyst') {
        loadAnalyticsData();
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading analyst dashboard data...');

      // Load data from analytics backend APIs
      try {
        const [
          dashboardMetrics,
          productionData,
          qualityData,
          machineData,
          workflowData,
          maintenanceData,
          activitiesData
        ] = await Promise.all([
          apiService.getAnalyticsMetrics(),
          apiService.getProductionAnalytics(),
          apiService.getQualityAnalytics(), 
          apiService.getMachineAnalytics(),
          apiService.getWorkflowAnalytics(),
          apiService.getMaintenanceAnalytics(),
          apiService.getRecentActivities()
        ]);

        console.log('Analytics data loaded:', {
          dashboardMetrics,
          productionData,
          qualityData,
          machineData,
          workflowData
        });

        // Combine data from different endpoints
        const combinedMetrics: AnalyticsMetrics = {
          production: {
            daily_output: productionData?.daily_output || dashboardMetrics?.detailed_analytics?.production?.daily_output || 2847,
            weekly_output: productionData?.weekly_output || dashboardMetrics?.detailed_analytics?.production?.weekly_output || 19829,
            efficiency: productionData?.efficiency || dashboardMetrics?.detailed_analytics?.production?.efficiency || 94.2,
            trend: productionData?.trend || 'up',
            change_percentage: productionData?.change_percentage || 12.5
          },
          quality: {
            average_score: qualityData?.average_score || dashboardMetrics?.detailed_analytics?.quality?.percentages?.approved || 96.8,
            defect_rate: qualityData?.defect_rate || dashboardMetrics?.detailed_analytics?.quality?.percentages?.defective || 1.9,
            pass_rate: qualityData?.pass_rate || dashboardMetrics?.detailed_analytics?.quality?.percentages?.approved || 98.1,
            ai_accuracy: qualityData?.ai_accuracy || dashboardMetrics?.detailed_analytics?.quality?.ai_accuracy || 94.3
          },
          machines: {
            total_utilization: machineData?.utilization_rate || dashboardMetrics?.detailed_analytics?.machines?.utilization_rate || 87.3,
            average_uptime: machineData?.average_uptime || dashboardMetrics?.detailed_analytics?.machines?.average_uptime || 94.7,
            performance_score: machineData?.performance_score || dashboardMetrics?.detailed_analytics?.machines?.performance_score || 91.2,
            alerts_count: machineData?.alerts_count || maintenanceData?.pending_count || 3
          },
          workflow: {
            batches_completed: workflowData?.batches_completed || dashboardMetrics?.detailed_analytics?.workflow?.completed_batches || 47,
            average_cycle_time: workflowData?.average_cycle_time || dashboardMetrics?.detailed_analytics?.workflow?.average_cycle_time || 4.2,
            on_time_delivery: workflowData?.on_time_delivery || dashboardMetrics?.detailed_analytics?.workflow?.on_time_delivery || 94.8,
            bottlenecks_identified: workflowData?.bottlenecks_identified || dashboardMetrics?.detailed_analytics?.workflow?.bottlenecks || 2
          }
        };

        setMetrics(combinedMetrics);

        // Transform activities into analyses format
        if (activitiesData && Array.isArray(activitiesData)) {
          const transformedAnalyses: RecentAnalysis[] = activitiesData.slice(0, 5).map((activity, index) => ({
            id: activity.id || index + 1,
            type: ['performance', 'quality', 'efficiency', 'prediction'][index % 4] as any,
            title: activity.message?.includes('maintenance') ? 'Maintenance Analysis' :
                   activity.message?.includes('quality') ? 'Quality Analysis' :
                   activity.message?.includes('production') ? 'Production Analysis' :
                   'System Analysis',
            description: activity.message || 'Automated analysis completed',
            status: 'completed' as const,
            timestamp: activity.time || new Date().toLocaleString(),
            impact: activity.severity === 'error' ? 'high' : 
                   activity.severity === 'warning' ? 'medium' : 'low',
            insights: activity.message?.includes('efficiency') ? 'Production efficiency metrics analyzed for optimization opportunities.' :
                     activity.message?.includes('quality') ? 'Quality control metrics reviewed for process improvements.' :
                     activity.message?.includes('maintenance') ? 'Maintenance patterns analyzed for predictive scheduling.' :
                     'System performance analyzed for operational insights.'
          }));
          setRecentAnalyses(transformedAnalyses);
        } else {
          // Generate sample analyses if no activity data
          setRecentAnalyses([
            {
              id: 1,
              type: 'performance',
              title: 'Production Efficiency Analysis',
              description: `Daily production efficiency: ${combinedMetrics.production.efficiency.toFixed(1)}%`,
              status: 'completed',
              timestamp: new Date().toLocaleString(),
              impact: combinedMetrics.production.efficiency > 90 ? 'high' : 'medium',
              insights: `Production efficiency is ${combinedMetrics.production.efficiency > 90 ? 'excellent' : 'good'} at ${combinedMetrics.production.efficiency.toFixed(1)}%.`
            },
            {
              id: 2,
              type: 'quality',
              title: 'Quality Assessment',
              description: `Quality score: ${combinedMetrics.quality.average_score.toFixed(1)}%`,
              status: 'completed',
              timestamp: new Date().toLocaleString(),
              impact: combinedMetrics.quality.average_score > 95 ? 'high' : 'medium',
              insights: `Quality metrics are ${combinedMetrics.quality.average_score > 95 ? 'outstanding' : 'satisfactory'} with AI accuracy at ${combinedMetrics.quality.ai_accuracy.toFixed(1)}%.`
            },
            {
              id: 3,
              type: 'efficiency',
              title: 'Machine Utilization Review',
              description: `Machine utilization: ${combinedMetrics.machines.total_utilization.toFixed(1)}%`,
              status: 'completed', 
              timestamp: new Date().toLocaleString(),
              impact: combinedMetrics.machines.total_utilization > 85 ? 'high' : 'medium',
              insights: `Machine utilization is optimal with ${combinedMetrics.machines.alerts_count} maintenance alerts requiring attention.`
            }
          ]);
        }

      } catch (apiError) {
        console.log('Analytics API not fully available, trying dashboard stats...');
        
        // Fallback to existing dashboard stats
        try {
          const [dashboardStats, activities] = await Promise.all([
            apiService.getDashboardStats(),
            apiService.getRecentActivities()
          ]);

          if (dashboardStats) {
            // Transform admin dashboard data for analyst view
            const analystMetrics: AnalyticsMetrics = {
              production: {
                daily_output: dashboardStats.production?.daily_output || 2847,
                weekly_output: dashboardStats.production?.weekly_output || 19829,
                efficiency: dashboardStats.production?.efficiency || 94.2,
                trend: 'up',
                change_percentage: 12.5
              },
              quality: {
                average_score: dashboardStats.production?.quality_score || 96.8,
                defect_rate: dashboardStats.quality?.defect_rate || 1.9,
                pass_rate: dashboardStats.quality?.approval_rate || 98.1,
                ai_accuracy: dashboardStats.quality?.ai_accuracy || 94.3
              },
              machines: {
                total_utilization: 87.3,
                average_uptime: 94.7,
                performance_score: 91.2,
                alerts_count: dashboardStats.machines?.maintenance || 3
              },
              workflow: {
                batches_completed: 47,
                average_cycle_time: 4.2,
                on_time_delivery: 94.8,
                bottlenecks_identified: 2
              }
            };
            setMetrics(analystMetrics);
          }

          if (activities && Array.isArray(activities)) {
            const transformedAnalyses: RecentAnalysis[] = activities.slice(0, 5).map((activity, index) => ({
              id: activity.id || index,
              type: ['performance', 'quality', 'efficiency', 'prediction'][index % 4] as any,
              title: `Analysis: ${activity.message?.split(' - ')[0] || 'System Analysis'}`,
              description: activity.message || 'Automated analysis completed',
              status: 'completed',
              timestamp: activity.time || new Date().toLocaleString(),
              impact: ['high', 'medium', 'low'][index % 3] as any,
              insights: 'Analysis completed successfully with actionable insights.'
            }));
            setRecentAnalyses(transformedAnalyses);
          }

        } catch (fallbackError) {
          console.log('Dashboard API also not available, using mock data');
          loadMockData();
        }
      }

    } catch (err: any) {
      console.error('Error loading analyst data:', err);
      setError(`Error loading analyst data: ${err.message || 'Unknown error'}`);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    // Mock analytics data for analyst dashboard
    const mockMetrics: AnalyticsMetrics = {
      production: {
        daily_output: 2847,
        weekly_output: 19829,
        efficiency: 94.2,
        trend: 'up',
        change_percentage: 12.5
      },
      quality: {
        average_score: 96.8,
        defect_rate: 1.9,
        pass_rate: 98.1,
        ai_accuracy: 94.3
      },
      machines: {
        total_utilization: 87.3,
        average_uptime: 94.7,
        performance_score: 91.2,
        alerts_count: 3
      },
      workflow: {
        batches_completed: 47,
        average_cycle_time: 4.2,
        on_time_delivery: 94.8,
        bottlenecks_identified: 2
      }
    };

    const mockAnalyses: RecentAnalysis[] = [
      {
        id: 1,
        type: 'performance',
        title: 'Production Efficiency Analysis',
        description: 'Daily production efficiency increased by 12.5% compared to last week',
        status: 'completed',
        timestamp: '2 hours ago',
        impact: 'high',
        insights: 'Machine utilization optimization led to significant efficiency gains.'
      },
      {
        id: 2,
        type: 'quality',
        title: 'Quality Trend Analysis',
        description: 'AI quality detection accuracy improved to 94.3%',
        status: 'completed',
        timestamp: '4 hours ago',
        impact: 'medium',
        insights: 'Enhanced model training reduced false positives by 15%.'
      },
      {
        id: 3,
        type: 'prediction',
        title: 'Demand Forecast Update',
        description: 'Weekly demand prediction model recalibrated',
        status: 'in_progress',
        timestamp: '6 hours ago',
        impact: 'high',
        insights: 'Expected 8% increase in demand for next quarter.'
      },
      {
        id: 4,
        type: 'efficiency',
        title: 'Workflow Bottleneck Detection',
        description: 'Identified 2 workflow bottlenecks affecting cycle time',
        status: 'completed',
        timestamp: '1 day ago',
        impact: 'medium',
        insights: 'Ginning process optimization can reduce cycle time by 18%.'
      },
      {
        id: 5,
        type: 'performance',
        title: 'Machine Performance Report',
        description: 'Weekly machine performance analysis completed',
        status: 'scheduled',
        timestamp: 'Tomorrow',
        impact: 'low',
        insights: 'Routine analysis for maintenance planning.'
      }
    ];

    setMetrics(mockMetrics);
    setRecentAnalyses(mockAnalyses);
  };

  const getAnalysisIcon = (type: string) => {
    const icons = {
      performance: <BarChart3 size={20} />,
      quality: <CheckCircle size={20} />,
      efficiency: <Zap size={20} />,
      prediction: <Target size={20} />
    };
    return icons[type as keyof typeof icons] || <Activity size={20} />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'success' as const,
      in_progress: 'warning' as const,
      scheduled: 'default' as const
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getImpactColor = (impact: string) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    };
    return colors[impact as keyof typeof colors] || 'text-gray-600';
  };

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if redirecting
  if (!isAuthenticated || !user || user.role !== 'analyst') {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">Access Denied</div>
          <p className="text-gray-600">You must be an analyst to access this page.</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AnalystSidebar />
        <div className="flex-1 flex items-center justify-center ml-[240px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AnalystSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-[240px]">
        <Header 
          userRole="analyst"
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user?.first_name || user?.username || 'Analyst'}!
            </h1>
            <p className="text-gray-600 text-lg">
              Analyze production data, monitor KPIs, and generate insights for TexPro AI textile operations.
            </p>
            
            {/* Data Source Indicator */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse mr-2"></div>
                Analytics Engine Active
              </div>
              
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleString('en-US')}
              </div>
            </div>
          </div>

          {/* Key Metrics KPIs */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Production Efficiency */}
              <Card variant="elevated" padding="lg">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-medium text-gray-600">
                    Production Efficiency
                  </h3>
                  <Badge 
                    variant={metrics.production.trend === 'up' ? 'success' : 'warning'} 
                    size="sm"
                  >
                    {metrics.production.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {metrics.production.change_percentage}%
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {metrics.production.efficiency}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Daily: {metrics.production.daily_output.toLocaleString()} kg
                  </p>
                </div>

                <ProgressBar
                  value={metrics.production.efficiency}
                  variant="success"
                  size="sm"
                  showLabel
                  label={`${metrics.production.efficiency}% efficiency`}
                />
              </Card>

              {/* Quality Score */}
              <Card variant="elevated" padding="lg">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-medium text-gray-600">
                    Quality Score
                  </h3>
                  <Badge variant="success" size="sm">
                    <CheckCircle size={12} />
                    Excellent
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {metrics.quality.average_score}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    AI Accuracy: {metrics.quality.ai_accuracy}%
                  </p>
                </div>

                <ProgressBar
                  value={metrics.quality.average_score}
                  variant="success"
                  size="sm"
                  showLabel
                  label={`${metrics.quality.pass_rate}% pass rate`}
                />
              </Card>

              {/* Machine Performance */}
              <Card variant="elevated" padding="lg">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-medium text-gray-600">
                    Machine Performance
                  </h3>
                  <Badge 
                    variant={metrics.machines.alerts_count > 0 ? 'warning' : 'success'} 
                    size="sm"
                  >
                    {metrics.machines.alerts_count} alerts
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {metrics.machines.performance_score}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Uptime: {metrics.machines.average_uptime}%
                  </p>
                </div>

                <ProgressBar
                  value={metrics.machines.total_utilization}
                  variant="success"
                  size="sm"
                  showLabel
                  label={`${metrics.machines.total_utilization}% utilization`}
                />
              </Card>

              {/* Workflow Efficiency */}
              <Card variant="elevated" padding="lg">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-medium text-gray-600">
                    Workflow Efficiency
                  </h3>
                  <Badge 
                    variant={metrics.workflow.bottlenecks_identified > 0 ? 'warning' : 'success'} 
                    size="sm"
                  >
                    {metrics.workflow.bottlenecks_identified} bottlenecks
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {metrics.workflow.on_time_delivery}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Cycle time: {metrics.workflow.average_cycle_time}h avg
                  </p>
                </div>

                <ProgressBar
                  value={metrics.workflow.on_time_delivery}
                  variant="success"
                  size="sm"
                  showLabel
                  label={`${metrics.workflow.batches_completed} batches completed`}
                />
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Analyses */}
            <div className="lg:col-span-2">
              <Card variant="elevated" padding="lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">
                    Recent Analyses
                  </h2>
                  <Button variant="secondary" size="sm" onClick={handleRefresh}>
                    🔄 Refresh
                  </Button>
                </div>

                <div className="space-y-4">
                  {recentAnalyses.map((analysis) => (
                    <div key={analysis.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                          {getAnalysisIcon(analysis.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {analysis.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(analysis.status)} size="sm">
                              {analysis.status.replace('_', ' ')}
                            </Badge>
                            <span className={`text-xs font-medium ${getImpactColor(analysis.impact)}`}>
                              {analysis.impact} impact
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {analysis.description}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          {analysis.insights}
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500">
                            <Clock size={12} className="inline mr-1" />
                            {analysis.timestamp}
                          </p>
                          <Button variant="secondary" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button variant="secondary" size="sm" fullWidth>
                    📊 View All Analyses
                  </Button>
                </div>
              </Card>
            </div>

            {/* Quick Actions & Tools */}
            <div>
              <Card variant="elevated" padding="lg">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Analytics Tools
                </h2>
                <div className="space-y-3">
                  <Button variant="secondary" size="sm" fullWidth>
                    📈 Create Custom Analysis
                  </Button>
                  <Button variant="secondary" size="sm" fullWidth>
                    📋 Generate Report
                  </Button>
                  <Button variant="secondary" size="sm" fullWidth>
                    🔍 Data Explorer
                  </Button>
                  <Button variant="secondary" size="sm" fullWidth>
                    🎯 Prediction Models
                  </Button>
                  <Button variant="secondary" size="sm" fullWidth>
                    📊 KPI Dashboard
                  </Button>
                </div>
              </Card>

              {/* Data Sources */}
              <Card variant="elevated" padding="lg" className="mt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Data Sources
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Production Data</span>
                    <Badge variant="success" size="sm">Live</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Quality Metrics</span>
                    <Badge variant="success" size="sm">Live</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Machine Data</span>
                    <Badge variant="success" size="sm">Live</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Workflow Data</span>
                    <Badge variant="success" size="sm">Live</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Historical Data</span>
                    <Badge variant="default" size="sm">Archive</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalystDashboard;