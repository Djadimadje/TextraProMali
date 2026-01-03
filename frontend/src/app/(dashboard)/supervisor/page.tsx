'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SupervisorSidebar from '../../../../components/layout/SupervisorSidebar';
import Header from '../../../../components/layout/Header';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Badge from '../../../../components/ui/Badge';
import ProgressBar from '../../../../components/ui/ProgressBar';
import PageLoading from '../../../../components/ui/PageLoading';
import InlineLoading from '../../../../components/ui/InlineLoading';
import useLoading from '../../../../hooks/useLoading';

const SupervisorDashboard: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { isLoading: dataLoading, withLoading } = useLoading();
  const { isLoading: actionLoading, withLoading: withActionLoading } = useLoading();

  const router = useRouter();

  // Simulate data loading
  useEffect(() => {
    setMounted(true);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await withLoading(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDashboardData({
        productionKPIs: [
          {
            title: 'Production Journalière',
            value: '2,450',
            unit: 'kg',
            change: '+8.5%',
            changeType: 'positive' as const,
            target: 2800,
            current: 2450
          },
          {
            title: 'Efficacité Équipes',
            value: '94.2',
            unit: '%',
            change: '+2.1%',
            changeType: 'positive' as const,
            target: 100,
            current: 94.2
          },
          {
            title: 'Taux de Conformité',
            value: '98.7',
            unit: '%',
            change: '-0.3%',
            changeType: 'negative' as const,
            target: 100,
            current: 98.7
          },
          {
            title: 'Machines Actives',
            value: '47',
            unit: '/50',
            change: '+2',
            changeType: 'positive' as const,
            target: 50,
            current: 47
          }
        ],
        teams: [
          {
            name: 'Équipe Alpha',
            supervisor: 'Amadou Traoré',
            members: 12,
            status: 'Actif',
            statusColor: 'success' as const,
            performance: 96,
            shift: 'Jour (6h-14h)'
          },
          {
            name: 'Équipe Beta',
            supervisor: 'Fatima Diallo',
            members: 10,
            status: 'Actif',
            statusColor: 'success' as const,
            performance: 92,
            shift: 'Jour (6h-14h)'
          },
          {
            name: 'Équipe Gamma',
            supervisor: 'Ibrahim Keita',
            members: 8,
            status: 'Pause',
            statusColor: 'warning' as const,
            performance: 88,
            shift: 'Nuit (22h-6h)'
          },
          {
            name: 'Équipe Delta',
            supervisor: 'Aïcha Cissé',
            members: 11,
            status: 'Maintenance',
            statusColor: 'danger' as const,
            performance: 0,
            shift: 'Soir (14h-22h)'
          }
        ],
        alerts: [
          {
            id: 1,
            type: 'warning' as const,
            message: 'Production en retard - Ligne 3',
            time: 'Il y a 15 min',
            action: 'Vérifier'
          },
          {
            id: 2,
            type: 'info' as const,
            message: 'Changement d\'équipe dans 30 min',
            time: 'Il y a 10 min',
            action: 'Préparer'
          },
          {
            id: 3,
            type: 'success' as const,
            message: 'Objectif quotidien atteint - Secteur B',
            time: 'Il y a 5 min',
            action: 'Féliciter'
          }
        ]
      });
    });
  };

  const handleQuickAction = async (action: string) => {
    await withActionLoading(async () => {
      try {
        switch (action) {
          case 'Rapport de Production':
            return router.push('http://localhost:3000/supervisor/reports');
          case 'Gérer les Équipes':
            return router.push('http://localhost:3000/supervisor/allocation');
          case 'Planifier Maintenance':
            return router.push('/dashboard/technician/maintenance');
          case 'Envoyer Notification':
            return router.push('/dashboard/technician/notifications');
          default:
            console.warn('Unknown quick action', action);
            return;
        }
      } catch (err) {
        console.error('Failed to execute quick action', action, err);
      }
    });
  };

  

  if (!mounted) {
    return null; // Prevent hydration issues
  }

  // Show page loading while data is being fetched
  if (dataLoading || !dashboardData) {
    return <PageLoading variant="dashboard" message="Chargement du tableau de bord..." />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SupervisorSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-[240px]">
        <Header 
          userRole="supervisor"
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, Supervisor!
            </h1>
            <p className="text-gray-600 text-lg">
              Oversee production, manage teams, and ensure operational excellence.
            </p>
          </div>

          {/* Dashboard Content */}
          <div className="space-y-6">
            {/* Production KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardData.productionKPIs.map((kpi: any, index: number) => (
                <Card key={index} variant="elevated" padding="lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-medium text-gray-600">
                      {kpi.title}
                    </h3>
                    <Badge 
                      variant={kpi.changeType === 'positive' ? 'success' : 'danger'} 
                      size="sm"
                    >
                      {kpi.change}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {kpi.value}
                      </span>
                      <span className="text-sm text-gray-600">
                        {kpi.unit}
                      </span>
                    </div>
                  </div>

                  <ProgressBar
                    value={(kpi.current / kpi.target) * 100}
                    variant="success"
                    size="sm"
                    showLabel
                    label={`${Math.round((kpi.current / kpi.target) * 100)}% de l'objectif`}
                  />
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Teams Management */}
              <div className="lg:col-span-2">
                <Card variant="elevated" padding="lg">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-900">
                      Gestion des Équipes
                    </h2>
                    <Button variant="secondary" size="sm">
                      Voir Tout
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {dashboardData.teams.map((team: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {team.name}
                            </h3>
                            <Badge variant={team.statusColor} size="sm">
                              {team.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Superviseur: {team.supervisor}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            {team.members} membres • {team.shift}
                          </p>
                          {team.performance > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Performance:</span>
                              <ProgressBar
                                value={team.performance}
                                variant="success"
                                size="sm"
                                className="flex-1 max-w-32"
                              />
                              <span className="text-xs font-medium text-gray-700">
                                {team.performance}%
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm">
                            Détails
                          </Button>
                          <Button variant="primary" size="sm">
                            Gérer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Alerts & Actions */}
              <div>
                <Card variant="elevated" padding="lg">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-900">
                      Alertes & Actions
                    </h2>
                    <Badge variant="warning" size="sm">
                      {dashboardData.alerts.length}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {dashboardData.alerts.map((alert: any) => (
                      <div key={alert.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            alert.type === 'warning' ? 'bg-yellow-500' :
                            alert.type === 'success' ? 'bg-green-500' :
                            'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 mb-1">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-600 mb-2">
                              {alert.time}
                            </p>
                            <Button variant="secondary" size="sm">
                              {alert.action}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <Button variant="primary" size="sm" fullWidth>
                      Voir Toutes les Alertes
                    </Button>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card variant="elevated" padding="lg" className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">
                      Actions Rapides
                    </h2>
                    {actionLoading && (
                      <InlineLoading size="sm" text="Exécution..." />
                    )}
                  </div>
                  <div className="space-y-3">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      fullWidth
                      disabled={actionLoading}
                      onClick={() => handleQuickAction('Rapport de Production')}
                    >
                      📊 Rapport de Production
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      fullWidth
                      disabled={actionLoading}
                      onClick={() => handleQuickAction('Gérer les Équipes')}
                    >
                      👥 Gérer les Équipes
                    </Button>
                    {/* Removed: Planifier Maintenance and Envoyer Notification quick actions */}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
