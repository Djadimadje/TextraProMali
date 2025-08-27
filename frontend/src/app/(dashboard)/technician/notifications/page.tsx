'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import TechnicianSidebar from '../../../../../components/layout/TechnicianSidebar';
import Header from '../../../../../components/layout/Header';
import Card from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import Badge from '../../../../../components/ui/Badge';
import { 
  Bell,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Search,
  Filter,
  MoreVertical,
  Clock,
  Calendar,
  User,
  Tag,
  Archive,
  Trash2,
  BellRing,
  BellOff,
  Mail,
  MessageSquare,
  Phone,
  Smartphone,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Send,
  Plus,
  X,
  FileText,
  Wrench,
  Activity,
  DollarSign,
  Target,
  TrendingUp,
  AlertOctagon,
  Zap,
  Shield,
  Globe,
  Save,
  Edit
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'maintenance' | 'alert' | 'info' | 'warning' | 'emergency' | 'system' | 'assignment';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read' | 'archived';
  category: string;
  source: string;
  recipient: string;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
  actionRequired: boolean;
  actionUrl?: string;
  metadata?: {
    machineId?: string;
    taskId?: string;
    orderId?: string;
    userId?: string;
  };
  attachments?: string[];
  starred: boolean;
}

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  soundEnabled: boolean;
  categories: {
    maintenance: boolean;
    alerts: boolean;
    assignments: boolean;
    system: boolean;
    emergency: boolean;
  };
  priority: {
    critical: boolean;
    high: boolean;
    medium: boolean;
    low: boolean;
  };
  schedule: {
    workHours: boolean;
    afterHours: boolean;
    weekends: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  recipients: string[];
  actions: string[];
  cooldown: number;
  createdAt: string;
  lastTriggered?: string;
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inbox' | 'alerts' | 'settings' | 'rules'>('inbox');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Component initialization
  }, []);

  const notifications: Notification[] = [
    {
      id: 'NOT001',
      title: 'Urgence: Arrêt Machine Critique',
      message: 'Le Métier à Tisser A1 s\'est arrêté de manière inattendue. Température moteur critique (95°C). Intervention immédiate requise.',
      type: 'emergency',
      priority: 'critical',
      status: 'unread',
      category: 'Machine Failure',
      source: 'Système de Monitoring',
      recipient: 'Mamadou Sidibé',
      createdAt: '2025-01-26T14:30:00Z',
      actionRequired: true,
      actionUrl: '/dashboard/technician/machines/M001',
      metadata: {
        machineId: 'M001',
        taskId: 'MT003'
      },
      starred: true
    },
    {
      id: 'NOT002',
      title: 'Nouvelle Tâche Assignée',
      message: 'Une nouvelle tâche de maintenance préventive vous a été assignée pour la Machine Filature B2 prévue demain à 08h00.',
      type: 'assignment',
      priority: 'high',
      status: 'unread',
      category: 'Task Assignment',
      source: 'Ibrahim Keita',
      recipient: 'Fatima Koné',
      createdAt: '2025-01-26T13:15:00Z',
      actionRequired: true,
      actionUrl: '/dashboard/technician/maintenance',
      metadata: {
        taskId: 'MT001',
        userId: 'U002'
      },
      starred: false
    },
    {
      id: 'NOT003',
      title: 'Maintenance Préventive Complétée',
      message: 'La maintenance préventive du Système Teinture C1 a été complétée avec succès. Tous les paramètres sont dans les normes.',
      type: 'maintenance',
      priority: 'medium',
      status: 'read',
      category: 'Maintenance Complete',
      source: 'Ibrahim Touré',
      recipient: 'Équipe Technique',
      createdAt: '2025-01-22T10:15:00Z',
      readAt: '2025-01-22T10:30:00Z',
      actionRequired: false,
      metadata: {
        taskId: 'MT004',
        machineId: 'M003'
      },
      starred: false
    },
    {
      id: 'NOT004',
      title: 'Alerte Vibrations Anormales',
      message: 'Le Compresseur Air A2 présente des niveaux de vibration élevés (4.2 mm/s). Inspection recommandée dans les 24h.',
      type: 'alert',
      priority: 'high',
      status: 'unread',
      category: 'Vibration Alert',
      source: 'Capteurs IoT',
      recipient: 'Sekou Camara',
      createdAt: '2025-01-26T12:00:00Z',
      actionRequired: true,
      actionUrl: '/dashboard/technician/machines/M005',
      metadata: {
        machineId: 'M005'
      },
      starred: false
    },
    {
      id: 'NOT005',
      title: 'Rapport Hebdomadaire Disponible',
      message: 'Le rapport hebdomadaire d\'activité de maintenance est maintenant disponible pour consultation et validation.',
      type: 'info',
      priority: 'low',
      status: 'read',
      category: 'Reports',
      source: 'Système de Reporting',
      recipient: 'Équipe Technique',
      createdAt: '2025-01-26T09:00:00Z',
      readAt: '2025-01-26T09:15:00Z',
      actionRequired: false,
      starred: false
    },
    {
      id: 'NOT006',
      title: 'Mise à Jour Système Programmée',
      message: 'Une mise à jour du système de gestion sera effectuée dimanche de 02h00 à 06h00. Services temporairement indisponibles.',
      type: 'system',
      priority: 'medium',
      status: 'unread',
      category: 'System Update',
      source: 'IT Department',
      recipient: 'Tous les Utilisateurs',
      createdAt: '2025-01-25T16:00:00Z',
      expiresAt: '2025-01-28T06:00:00Z',
      actionRequired: false,
      starred: false
    },
    {
      id: 'NOT007',
      title: 'Seuil de Stock Atteint',
      message: 'Le stock de filtres à huile est en dessous du seuil minimum (3 unités). Commande recommandée.',
      type: 'warning',
      priority: 'medium',
      status: 'unread',
      category: 'Inventory Alert',
      source: 'Système de Stock',
      recipient: 'Aminata Coulibaly',
      createdAt: '2025-01-26T11:30:00Z',
      actionRequired: true,
      starred: false
    },
    {
      id: 'NOT008',
      title: 'Fin de Garantie Machine',
      message: 'La garantie de la Machine Finition D1 expire dans 30 jours. Vérifier les conditions de renouvellement.',
      type: 'info',
      priority: 'low',
      status: 'read',
      category: 'Warranty',
      source: 'Système de Suivi',
      recipient: 'Service Technique',
      createdAt: '2025-01-20T14:00:00Z',
      readAt: '2025-01-26T08:00:00Z',
      expiresAt: '2025-02-25T00:00:00Z',
      actionRequired: false,
      metadata: {
        machineId: 'M004'
      },
      starred: false
    }
  ];

  const notificationSettings: NotificationSettings = {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    soundEnabled: false,
    categories: {
      maintenance: true,
      alerts: true,
      assignments: true,
      system: false,
      emergency: true
    },
    priority: {
      critical: true,
      high: true,
      medium: true,
      low: false
    },
    schedule: {
      workHours: true,
      afterHours: true,
      weekends: false
    },
    frequency: 'immediate'
  };

  const alertRules: AlertRule[] = [
    {
      id: 'RULE001',
      name: 'Température Critique',
      description: 'Alerte quand la température dépasse 90°C',
      condition: 'temperature > 90',
      severity: 'critical',
      enabled: true,
      recipients: ['tech-team@textpro.com'],
      actions: ['email', 'sms', 'notification'],
      cooldown: 300,
      createdAt: '2025-01-15T10:00:00Z',
      lastTriggered: '2025-01-26T14:30:00Z'
    },
    {
      id: 'RULE002',
      name: 'Vibrations Élevées',
      description: 'Alerte pour vibrations > 4.0 mm/s',
      condition: 'vibration > 4.0',
      severity: 'high',
      enabled: true,
      recipients: ['maintenance@textpro.com'],
      actions: ['notification', 'email'],
      cooldown: 600,
      createdAt: '2025-01-15T10:00:00Z',
      lastTriggered: '2025-01-26T12:00:00Z'
    },
    {
      id: 'RULE003',
      name: 'Maintenance Overdue',
      description: 'Alerte maintenance en retard de plus de 24h',
      condition: 'maintenance_overdue > 24h',
      severity: 'medium',
      enabled: true,
      recipients: ['supervisors@textpro.com'],
      actions: ['notification'],
      cooldown: 3600,
      createdAt: '2025-01-15T10:00:00Z'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertOctagon className="w-5 h-5 text-red-600" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'maintenance': return <Wrench className="w-5 h-5 text-blue-600" />;
      case 'assignment': return <User className="w-5 h-5 text-purple-600" />;
      case 'system': return <Settings className="w-5 h-5 text-gray-600" />;
      case 'info': return <Info className="w-5 h-5 text-green-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesPriority && matchesSearch;
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && n.status === 'unread').length;

  if (!user || user.role !== 'technician') {
    return <div>Access denied.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <TechnicianSidebar />
        
        <main className="flex-1 ml-[200px] lg:ml-[240px]">
          <Header title="Notifications" />
          
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                  <p className="text-gray-600 mt-1">
                    Centre de communication et alertes système
                  </p>
                </div>
                
                {unreadCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="danger" size="lg">
                      {unreadCount} non lues
                    </Badge>
                    {criticalCount > 0 && (
                      <Badge variant="warning" size="lg">
                        <Zap className="w-3 h-3 mr-1" />
                        {criticalCount} critiques
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button variant="secondary" size="sm">
                  <Archive className="mr-2" size={16} />
                  Archiver Sélection
                </Button>
                <Button variant="primary" size="sm">
                  <Send className="mr-2" size={16} />
                  Nouvelle Notification
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { key: 'inbox', label: 'Boîte de Réception', icon: Bell, count: unreadCount },
                  { key: 'alerts', label: 'Alertes Système', icon: AlertTriangle },
                  { key: 'settings', label: 'Paramètres', icon: Settings },
                  { key: 'rules', label: 'Règles d\'Alerte', icon: Shield }
                ].map(({ key, label, icon: Icon, count }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === key
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                    {count && count > 0 && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                        {count}
                      </span>
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
                        <p className="text-sm font-medium text-gray-600">Non Lues</p>
                        <p className="text-2xl font-bold text-green-600">{unreadCount}</p>
                      </div>
                      <Bell className="w-8 h-8 text-green-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Critiques</p>
                        <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
                      </div>
                      <AlertOctagon className="w-8 h-8 text-red-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Action Requise</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {notifications.filter(n => n.actionRequired && n.status === 'unread').length}
                        </p>
                      </div>
                      <Target className="w-8 h-8 text-yellow-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Favoris</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {notifications.filter(n => n.starred).length}
                        </p>
                      </div>
                      <Star className="w-8 h-8 text-blue-600" />
                    </div>
                  </Card>
                </div>

                {/* Filters */}
                <Card padding="lg">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          placeholder="Rechercher dans les notifications..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">Tous les types</option>
                      <option value="emergency">Urgence</option>
                      <option value="alert">Alerte</option>
                      <option value="warning">Avertissement</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="assignment">Assignation</option>
                      <option value="system">Système</option>
                      <option value="info">Information</option>
                    </select>
                    
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">Toutes priorités</option>
                      <option value="critical">Critique</option>
                      <option value="high">Élevée</option>
                      <option value="medium">Moyenne</option>
                      <option value="low">Faible</option>
                    </select>
                  </div>
                </Card>

                {/* Notifications List */}
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      padding="lg" 
                      className={`transition-all duration-200 ${
                        notification.status === 'unread' 
                          ? 'border-l-4 border-l-green-500 bg-white shadow-md' 
                          : 'bg-gray-50'
                      } ${
                        notification.priority === 'critical' 
                          ? 'ring-2 ring-red-200 shadow-lg' 
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 pt-1">
                          {getTypeIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`text-sm font-medium ${
                                  notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </h3>
                                {notification.actionRequired && (
                                  <Badge variant="warning" size="sm">
                                    Action requise
                                  </Badge>
                                )}
                                {notification.starred && (
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                )}
                              </div>
                              
                              <p className={`text-sm ${
                                notification.status === 'unread' ? 'text-gray-700' : 'text-gray-600'
                              }`}>
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>{notification.source}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {new Date(notification.createdAt).toLocaleString('fr-FR')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  <span>{notification.category}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <Badge variant={getPriorityColor(notification.priority) as any} size="sm">
                                {notification.priority}
                              </Badge>
                              
                              <button className="p-1 hover:bg-gray-100 rounded">
                                <MoreVertical size={14} className="text-gray-400" />
                              </button>
                            </div>
                          </div>
                          
                          {notification.actionRequired && notification.actionUrl && (
                            <div className="flex gap-2 mt-3">
                              <Button variant="primary" size="sm">
                                <Eye className="mr-2" size={14} />
                                Voir Détails
                              </Button>
                              {notification.status === 'unread' && (
                                <Button variant="secondary" size="sm">
                                  <CheckCircle className="mr-2" size={14} />
                                  Marquer Lu
                                </Button>
                              )}
                            </div>
                          )}
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Alertes Système Actives</h2>
                  
                  <div className="space-y-4">
                    {notifications
                      .filter(n => ['emergency', 'alert', 'warning'].includes(n.type))
                      .map((alert) => (
                        <div key={alert.id} className={`p-4 border-2 rounded-lg ${
                          alert.priority === 'critical' ? 'border-red-200 bg-red-50' :
                          alert.priority === 'high' ? 'border-orange-200 bg-orange-50' :
                          'border-yellow-200 bg-yellow-50'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {getTypeIcon(alert.type)}
                              <div>
                                <h4 className="font-medium text-gray-900">{alert.title}</h4>
                                <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                                  <span>Source: {alert.source}</span>
                                  <span>{new Date(alert.createdAt).toLocaleString('fr-FR')}</span>
                                  {alert.metadata?.machineId && (
                                    <span>Machine: {alert.metadata.machineId}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant={getPriorityColor(alert.priority) as any} size="sm">
                                {alert.priority}
                              </Badge>
                              {alert.actionRequired && (
                                <Button variant="primary" size="sm">
                                  Intervenir
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Paramètres de Notification</h2>
                  
                  <div className="space-y-8">
                    {/* Delivery Methods */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Méthodes de Livraison</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">Email</p>
                              <p className="text-sm text-gray-600">Notifications par email</p>
                            </div>
                          </div>
                          <button className={`w-12 h-6 rounded-full transition-colors ${
                            notificationSettings.emailEnabled ? 'bg-green-600' : 'bg-gray-300'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              notificationSettings.emailEnabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium text-gray-900">SMS</p>
                              <p className="text-sm text-gray-600">Notifications par SMS</p>
                            </div>
                          </div>
                          <button className={`w-12 h-6 rounded-full transition-colors ${
                            notificationSettings.smsEnabled ? 'bg-green-600' : 'bg-gray-300'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              notificationSettings.smsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <BellRing className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="font-medium text-gray-900">Push</p>
                              <p className="text-sm text-gray-600">Notifications push navigateur</p>
                            </div>
                          </div>
                          <button className={`w-12 h-6 rounded-full transition-colors ${
                            notificationSettings.pushEnabled ? 'bg-green-600' : 'bg-gray-300'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              notificationSettings.pushEnabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            {notificationSettings.soundEnabled ? (
                              <Volume2 className="w-5 h-5 text-yellow-600" />
                            ) : (
                              <VolumeX className="w-5 h-5 text-gray-400" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">Sons</p>
                              <p className="text-sm text-gray-600">Notifications sonores</p>
                            </div>
                          </div>
                          <button className={`w-12 h-6 rounded-full transition-colors ${
                            notificationSettings.soundEnabled ? 'bg-green-600' : 'bg-gray-300'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              notificationSettings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Catégories</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(notificationSettings.categories).map(([category, enabled]) => (
                          <div key={category} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <span className="font-medium text-gray-700 capitalize">{category}</span>
                            <button className={`w-10 h-5 rounded-full transition-colors ${
                              enabled ? 'bg-green-600' : 'bg-gray-300'
                            }`}>
                              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                                enabled ? 'translate-x-5' : 'translate-x-0.5'
                              }`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Priority Levels */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Niveaux de Priorité</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(notificationSettings.priority).map(([priority, enabled]) => (
                          <div key={priority} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Badge variant={getPriorityColor(priority) as any} size="sm">
                                {priority}
                              </Badge>
                              <span className="font-medium text-gray-700 capitalize">{priority}</span>
                            </div>
                            <button className={`w-10 h-5 rounded-full transition-colors ${
                              enabled ? 'bg-green-600' : 'bg-gray-300'
                            }`}>
                              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                                enabled ? 'translate-x-5' : 'translate-x-0.5'
                              }`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Schedule */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Horaires</h3>
                      <div className="space-y-3">
                        {Object.entries(notificationSettings.schedule).map(([schedule, enabled]) => (
                          <div key={schedule} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <span className="font-medium text-gray-700">
                              {schedule === 'workHours' ? 'Heures de travail' :
                               schedule === 'afterHours' ? 'Après les heures' :
                               'Week-ends'}
                            </span>
                            <button className={`w-10 h-5 rounded-full transition-colors ${
                              enabled ? 'bg-green-600' : 'bg-gray-300'
                            }`}>
                              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                                enabled ? 'translate-x-5' : 'translate-x-0.5'
                              }`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="primary">
                        <Save className="mr-2" size={16} />
                        Sauvegarder
                      </Button>
                    </div>
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
                  
                  <div className="space-y-4">
                    {alertRules.map((rule) => (
                      <div key={rule.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">{rule.name}</h4>
                              <Badge 
                                variant={rule.enabled ? 'success' : 'default'} 
                                size="sm"
                              >
                                {rule.enabled ? 'Actif' : 'Inactif'}
                              </Badge>
                              <span className={`px-2 py-1 text-xs rounded border ${getSeverityColor(rule.severity)}`}>
                                {rule.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                            <div className="text-xs text-gray-500">
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded">{rule.condition}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="secondary" size="sm">
                              <Edit className="mr-2" size={14} />
                              Modifier
                            </Button>
                            <Button variant="secondary" size="sm">
                              <Trash2 className="mr-2" size={14} />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Cooldown:</span>
                            <p className="font-medium">{rule.cooldown / 60} min</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Actions:</span>
                            <p className="font-medium">{rule.actions.join(', ')}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Destinataires:</span>
                            <p className="font-medium">{rule.recipients.length}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Dernière alerte:</span>
                            <p className="font-medium">
                              {rule.lastTriggered ? 
                                new Date(rule.lastTriggered).toLocaleDateString('fr-FR') : 
                                'Jamais'
                              }
                            </p>
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
