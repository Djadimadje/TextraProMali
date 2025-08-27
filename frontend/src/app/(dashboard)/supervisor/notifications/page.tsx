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
  Bell,
  Plus,
  Search,
  Filter,
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Users,
  MessageSquare,
  Send,
  Archive,
  Star,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Monitor,
  Zap,
  Shield,
  Activity,
  Target,
  TrendingUp,
  UserCheck,
  Wrench,
  Package,
  Calendar,
  MapPin
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  category: 'production' | 'quality' | 'safety' | 'maintenance' | 'hr' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'read' | 'acknowledged' | 'resolved' | 'archived';
  source: string;
  timestamp: string;
  expiresAt?: string;
  assignedTo?: string[];
  location?: string;
  relatedId?: string;
  actionRequired: boolean;
  acknowledged: boolean;
  readBy: string[];
}

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'desktop' | 'app';
  enabled: boolean;
  conditions: string[];
  recipients: string[];
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  category: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  channels: string[];
  cooldownMinutes: number;
  lastTriggered?: string;
  triggerCount: number;
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'alerts' | 'channels' | 'rules' | 'history'>('inbox');
  const [filterType, setFilterType] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const notifications: Notification[] = [
    {
      id: 'N001',
      title: 'Arrêt Machine Critique - Atelier A',
      message: 'Le métier à tisser A1 est en panne depuis 15 minutes. Intervention technique requise immédiatement.',
      type: 'urgent',
      category: 'production',
      priority: 'critical',
      status: 'new',
      source: 'Système de Surveillance',
      timestamp: '2025-01-26 10:45',
      location: 'Atelier A - Poste 1',
      relatedId: 'MACHINE-A1',
      actionRequired: true,
      acknowledged: false,
      readBy: []
    },
    {
      id: 'N002',
      title: 'Dépassement Seuil Qualité',
      message: 'Le taux de défauts du lot BATCH-2025-0892 a dépassé le seuil de 3%. Contrôle qualité renforcé recommandé.',
      type: 'warning',
      category: 'quality',
      priority: 'high',
      status: 'acknowledged',
      source: 'Contrôle Qualité',
      timestamp: '2025-01-26 10:30',
      assignedTo: ['Awa Diarra', 'Ibrahim Keita'],
      relatedId: 'BATCH-2025-0892',
      actionRequired: true,
      acknowledged: true,
      readBy: ['Awa Diarra']
    },
    {
      id: 'N003',
      title: 'Formation Sécurité Obligatoire',
      message: 'Rappel: Formation sécurité obligatoire pour l\'équipe Beta prévue demain à 14h en salle de formation.',
      type: 'info',
      category: 'hr',
      priority: 'medium',
      status: 'read',
      source: 'Ressources Humaines',
      timestamp: '2025-01-26 09:15',
      expiresAt: '2025-01-27 14:00',
      assignedTo: ['Fatima Diallo'],
      actionRequired: false,
      acknowledged: true,
      readBy: ['Fatima Diallo', 'Ibrahim Keita']
    },
    {
      id: 'N004',
      title: 'Maintenance Préventive Programmée',
      message: 'Maintenance préventive du système de teinture C1 programmée pour demain 6h-8h. Arrêt production prévu.',
      type: 'info',
      category: 'maintenance',
      priority: 'medium',
      status: 'read',
      source: 'Service Maintenance',
      timestamp: '2025-01-26 08:30',
      location: 'Atelier C',
      relatedId: 'MACHINE-C1',
      actionRequired: false,
      acknowledged: true,
      readBy: ['Ibrahim Keita', 'Amadou Traoré']
    },
    {
      id: 'N005',
      title: 'Objectif Production Atteint',
      message: 'Félicitations! L\'équipe Alpha a atteint 105% de son objectif de production journalier.',
      type: 'success',
      category: 'production',
      priority: 'low',
      status: 'read',
      source: 'Système de Production',
      timestamp: '2025-01-26 07:45',
      assignedTo: ['Amadou Traoré'],
      actionRequired: false,
      acknowledged: true,
      readBy: ['Amadou Traoré', 'Fatima Diallo']
    },
    {
      id: 'N006',
      title: 'Incident Sécurité Mineur',
      message: 'Incident sécurité mineur signalé en Atelier B - blessure légère. Rapport d\'incident en cours.',
      type: 'warning',
      category: 'safety',
      priority: 'high',
      status: 'resolved',
      source: 'Sécurité',
      timestamp: '2025-01-25 16:20',
      location: 'Atelier B',
      actionRequired: true,
      acknowledged: true,
      readBy: ['Sekou Camara', 'Ibrahim Keita']
    }
  ];

  const notificationChannels: NotificationChannel[] = [
    {
      id: 'C001',
      name: 'Email Superviseurs',
      type: 'email',
      enabled: true,
      conditions: ['priority >= high', 'category = production'],
      recipients: ['superviseurs@textpro.ml']
    },
    {
      id: 'C002',
      name: 'SMS Urgences',
      type: 'sms',
      enabled: true,
      conditions: ['priority = critical', 'type = urgent'],
      recipients: ['+223 XX XX XX XX']
    },
    {
      id: 'C003',
      name: 'Push Mobile',
      type: 'push',
      enabled: true,
      conditions: ['actionRequired = true'],
      recipients: ['mobile_app_users']
    },
    {
      id: 'C004',
      name: 'Notifications Bureau',
      type: 'desktop',
      enabled: true,
      conditions: ['category = safety'],
      recipients: ['desktop_users']
    }
  ];

  const alertRules: AlertRule[] = [
    {
      id: 'AR001',
      name: 'Arrêt Machine Critique',
      description: 'Alerte immédiate en cas d\'arrêt inattendu d\'une machine critique',
      category: 'production',
      condition: 'machine_status = stopped AND duration > 10min',
      threshold: 10,
      enabled: true,
      channels: ['C001', 'C002', 'C003'],
      cooldownMinutes: 30,
      lastTriggered: '2025-01-26 10:45',
      triggerCount: 3
    },
    {
      id: 'AR002',
      name: 'Dépassement Seuil Qualité',
      description: 'Alerte quand le taux de défauts dépasse le seuil acceptable',
      category: 'quality',
      condition: 'defect_rate > 3%',
      threshold: 3,
      enabled: true,
      channels: ['C001', 'C003'],
      cooldownMinutes: 60,
      lastTriggered: '2025-01-26 10:30',
      triggerCount: 1
    },
    {
      id: 'AR003',
      name: 'Incident Sécurité',
      description: 'Notification immédiate pour tout incident de sécurité',
      category: 'safety',
      condition: 'safety_incident = true',
      threshold: 1,
      enabled: true,
      channels: ['C001', 'C002', 'C004'],
      cooldownMinutes: 0,
      lastTriggered: '2025-01-25 16:20',
      triggerCount: 2
    },
    {
      id: 'AR004',
      name: 'Performance Équipe Faible',
      description: 'Alerte quand la performance d\'une équipe chute sous 80%',
      category: 'production',
      condition: 'team_efficiency < 80%',
      threshold: 80,
      enabled: true,
      channels: ['C001'],
      cooldownMinutes: 120,
      triggerCount: 0
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'success';
      case 'info': return 'info';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      case 'urgent': return 'danger';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'info';
      case 'read': return 'default';
      case 'acknowledged': return 'warning';
      case 'resolved': return 'success';
      case 'archived': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'info': return <Info className="w-4 h-4 text-blue-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'urgent': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'production': return <Package className="w-4 h-4 text-blue-600" />;
      case 'quality': return <Target className="w-4 h-4 text-green-600" />;
      case 'safety': return <Shield className="w-4 h-4 text-red-600" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-orange-600" />;
      case 'hr': return <Users className="w-4 h-4 text-purple-600" />;
      case 'system': return <Monitor className="w-4 h-4 text-gray-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4 text-blue-600" />;
      case 'sms': return <Smartphone className="w-4 h-4 text-green-600" />;
      case 'push': return <Bell className="w-4 h-4 text-purple-600" />;
      case 'desktop': return <Monitor className="w-4 h-4 text-orange-600" />;
      case 'app': return <Smartphone className="w-4 h-4 text-blue-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
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
          <Header title="Notifications" />
          
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Centre de Notifications</h1>
                <p className="text-gray-600 mt-1">
                  Gestion des alertes, notifications et communications d'équipe
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="secondary" size="sm">
                  <Settings className="mr-2" size={16} />
                  Paramètres
                </Button>
                <Button variant="secondary" size="sm">
                  <Archive className="mr-2" size={16} />
                  Archiver Lues
                </Button>
                <Button variant="primary" size="sm">
                  <Plus className="mr-2" size={16} />
                  Nouvelle Alerte
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { key: 'inbox', label: 'Boîte de Réception', icon: Bell },
                  { key: 'alerts', label: 'Alertes Actives', icon: AlertTriangle },
                  { key: 'channels', label: 'Canaux', icon: Send },
                  { key: 'rules', label: 'Règles', icon: Settings },
                  { key: 'history', label: 'Historique', icon: Archive }
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
                    {key === 'inbox' && (
                      <Badge variant="danger" size="sm">
                        {notifications.filter(n => n.status === 'new').length}
                      </Badge>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Inbox Tab */}
            {activeTab === 'inbox' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Nouvelles</p>
                        <p className="text-2xl font-bold text-red-600">
                          {notifications.filter(n => n.status === 'new').length}
                        </p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Actions Requises</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {notifications.filter(n => n.actionRequired && n.status !== 'resolved').length}
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-orange-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Critiques</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {notifications.filter(n => n.priority === 'critical').length}
                        </p>
                      </div>
                      <Zap className="w-8 h-8 text-purple-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {notifications.filter(n => 
                            new Date(n.timestamp).toDateString() === new Date().toDateString()
                          ).length}
                        </p>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                  </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button 
                      variant={showUnreadOnly ? "primary" : "secondary"} 
                      size="sm"
                      onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                    >
                      Non Lues Seulement
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Filter className="mr-2" size={16} />
                      Filtrer par Catégorie
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                      <CheckCircle className="mr-2" size={16} />
                      Tout Marquer Lu
                    </Button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                  {notifications
                    .filter(n => !showUnreadOnly || n.status === 'new')
                    .map((notification) => (
                    <Card key={notification.id} padding="lg" className={`${
                      notification.status === 'new' ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex flex-col items-center gap-1">
                            {getTypeIcon(notification.type)}
                            {notification.actionRequired && (
                              <Activity className="w-3 h-3 text-orange-500" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{notification.title}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant={getPriorityColor(notification.priority) as any} size="sm">
                                  {notification.priority}
                                </Badge>
                                <Badge variant={getStatusColor(notification.status) as any} size="sm">
                                  {notification.status}
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-700 mb-3">{notification.message}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                {getCategoryIcon(notification.category)}
                                <span className="capitalize">{notification.category}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(notification.timestamp).toLocaleString('fr-FR')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <UserCheck className="w-3 h-3" />
                                <span>{notification.source}</span>
                              </div>
                              {notification.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{notification.location}</span>
                                </div>
                              )}
                            </div>
                            
                            {notification.assignedTo && notification.assignedTo.length > 0 && (
                              <div className="mb-3">
                                <span className="text-xs text-gray-600">Assigné à:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {notification.assignedTo.map((person, index) => (
                                    <Badge key={index} variant="info" size="sm">{person}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {notification.expiresAt && (
                              <div className="mb-3">
                                <Badge variant="warning" size="sm">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Expire le {new Date(notification.expiresAt).toLocaleString('fr-FR')}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-xs text-gray-500">
                          {notification.readBy.length > 0 && (
                            <>Lu par: {notification.readBy.join(', ')}</>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {notification.status === 'new' && (
                            <Button variant="secondary" size="sm">
                              <Eye className="mr-2" size={16} />
                              Marquer Lu
                            </Button>
                          )}
                          
                          {notification.actionRequired && notification.status !== 'resolved' && (
                            <Button variant="primary" size="sm">
                              <CheckCircle className="mr-2" size={16} />
                              Traiter
                            </Button>
                          )}
                          
                          <Button variant="secondary" size="sm">
                            <Archive className="mr-2" size={16} />
                            Archiver
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Alertes Actives</h2>
                  
                  <div className="grid gap-4">
                    {notifications
                      .filter(n => n.type === 'urgent' || n.priority === 'critical')
                      .map((alert) => (
                      <div key={alert.id} className="p-4 border-l-4 border-l-red-500 bg-red-50 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            {getTypeIcon(alert.type)}
                            <div>
                              <h4 className="font-medium text-gray-900">{alert.title}</h4>
                              <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                            </div>
                          </div>
                          <Badge variant="danger" size="sm">URGENT</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                          <div>
                            <span className="text-xs text-gray-600">Catégorie:</span>
                            <p className="font-medium capitalize">{alert.category}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Localisation:</span>
                            <p className="font-medium">{alert.location || 'Non spécifié'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Depuis:</span>
                            <p className="font-medium">
                              {new Date(alert.timestamp).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Statut:</span>
                            <Badge variant={getStatusColor(alert.status) as any} size="sm">
                              {alert.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="sm">
                            <MessageSquare className="mr-2" size={16} />
                            Commenter
                          </Button>
                          <Button variant="warning" size="sm">
                            <UserCheck className="mr-2" size={16} />
                            Prendre en Charge
                          </Button>
                          <Button variant="danger" size="sm">
                            <Zap className="mr-2" size={16} />
                            Action Immédiate
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Channels Tab */}
            {activeTab === 'channels' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Canaux de Notification</h2>
                    <Button variant="primary" size="sm">
                      <Plus className="mr-2" size={16} />
                      Nouveau Canal
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {notificationChannels.map((channel) => (
                      <div key={channel.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            {getChannelIcon(channel.type)}
                            <div>
                              <h4 className="font-medium text-gray-900">{channel.name}</h4>
                              <p className="text-sm text-gray-600 capitalize">{channel.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {channel.enabled ? (
                              <Badge variant="success" size="sm">Actif</Badge>
                            ) : (
                              <Badge variant="danger" size="sm">Inactif</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <span className="text-xs text-gray-600">Conditions de déclenchement:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {channel.conditions.map((condition, index) => (
                              <Badge key={index} variant="default" size="sm">{condition}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <span className="text-xs text-gray-600">Destinataires:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {channel.recipients.map((recipient, index) => (
                              <Badge key={index} variant="info" size="sm">{recipient}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="sm">
                            <Eye className="mr-2" size={16} />
                            Tester
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Settings className="mr-2" size={16} />
                            Configurer
                          </Button>
                          {channel.enabled ? (
                            <Button variant="warning" size="sm">
                              <VolumeX className="mr-2" size={16} />
                              Désactiver
                            </Button>
                          ) : (
                            <Button variant="success" size="sm">
                              <Volume2 className="mr-2" size={16} />
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

            {/* Rules Tab */}
            {activeTab === 'rules' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Règles d'Alerte</h2>
                    <Button variant="primary" size="sm">
                      <Plus className="mr-2" size={16} />
                      Nouvelle Règle
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {alertRules.map((rule) => (
                      <div key={rule.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{rule.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={rule.enabled ? 'success' : 'danger'} size="sm">
                              {rule.enabled ? 'Activée' : 'Désactivée'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <span className="text-xs text-gray-600">Catégorie:</span>
                            <p className="text-sm font-medium capitalize">{rule.category}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Seuil:</span>
                            <p className="text-sm font-medium">{rule.threshold}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Délai de silence:</span>
                            <p className="text-sm font-medium">{rule.cooldownMinutes} min</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Déclenchements:</span>
                            <p className="text-sm font-medium">{rule.triggerCount}</p>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <span className="text-xs text-gray-600">Condition:</span>
                          <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-1">{rule.condition}</p>
                        </div>
                        
                        {rule.lastTriggered && (
                          <div className="mb-3">
                            <span className="text-xs text-gray-600">Dernier déclenchement:</span>
                            <p className="text-sm font-medium">
                              {new Date(rule.lastTriggered).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="sm">
                            <Eye className="mr-2" size={16} />
                            Historique
                          </Button>
                          <Button variant="secondary" size="sm">
                            <Settings className="mr-2" size={16} />
                            Modifier
                          </Button>
                          {rule.enabled ? (
                            <Button variant="warning" size="sm">
                              Désactiver
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

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Historique des Notifications</h2>
                    <div className="flex gap-3">
                      <Button variant="secondary" size="sm">
                        <Filter className="mr-2" size={16} />
                        Filtrer
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Archive className="mr-2" size={16} />
                        Nettoyer
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {notifications
                      .filter(n => n.status === 'resolved' || n.status === 'archived')
                      .map((notification) => (
                      <div key={notification.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(notification.type)}
                            <div>
                              <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-600">
                                {new Date(notification.timestamp).toLocaleString('fr-FR')} • {notification.source}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(notification.status) as any} size="sm">
                              {notification.status}
                            </Badge>
                            <Button variant="secondary" size="sm">
                              <Eye className="mr-2" size={16} />
                              Détails
                            </Button>
                          </div>
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

export default NotificationsPage;
