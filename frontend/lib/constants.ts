/**
 * Constants for TexPro AI - Mali Textile Manufacturing System
 * Centralized configuration for the application
 */

// Company Information
export const COMPANY = {
  name: 'CMDT',
  fullName: 'Compagnie Malienne pour le Développement du Textile',
  country: 'Mali',
  currency: 'XOF',
  timezone: 'Africa/Bamako',
  language: 'fr'
} as const;

// Application Configuration
export const APP_CONFIG = {
  name: 'TexPro AI',
  version: '1.0.0',
  description: 'Système de Gestion Intelligente de Production Textile',
  support_email: 'support@cmdt.ml',
  api_base_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  frontend_url: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
} as const;

// Base URL for API calls
export const BASE_URL = APP_CONFIG.api_base_url;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor', 
  TECHNICIAN: 'technician',
  INSPECTOR: 'inspector',
  ANALYST: 'analyst'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Role Display Names (French)
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  supervisor: 'Superviseur',
  technician: 'Technicien',
  inspector: 'Inspecteur Qualité',
  analyst: 'Analyste de Données'
};

// Dashboard Routes by Role
export const ROLE_ROUTES: Record<UserRole, string> = {
  admin: '/admin',
  supervisor: '/supervisor',
  technician: '/technician',
  inspector: '/inspector',
  analyst: '/analyst'
};

// Module Permissions by Role
export const ROLE_PERMISSIONS = {
  admin: ['workflow', 'machines', 'maintenance', 'quality', 'allocation', 'analytics', 'reports', 'users', 'notifications', 'settings'],
  supervisor: ['workflow', 'machines', 'maintenance', 'quality', 'allocation', 'analytics', 'reports', 'notifications'],
  technician: ['machines', 'maintenance', 'notifications'],
  inspector: ['quality', 'machines', 'notifications'],
  analyst: ['analytics', 'reports', 'workflow', 'machines', 'notifications']
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login/',
  LOGOUT: '/auth/logout/',
  REFRESH: '/auth/refresh/',
  PROFILE: '/auth/profile/',
  
  // Core Modules
  WORKFLOW: '/workflow/',
  MACHINES: '/machines/',
  MAINTENANCE: '/maintenance/',
  QUALITY: '/quality/',
  ALLOCATION: '/allocation/',
  ANALYTICS: '/analytics/',
  REPORTS: '/reports/',
  USERS: '/users/',
  NOTIFICATIONS: '/notifications/',
  SETTINGS: '/settings/'
} as const;

// Status Constants
export const STATUS_TYPES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed',
  IN_PROGRESS: 'in_progress',
  CANCELLED: 'cancelled',
  ERROR: 'error'
} as const;

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

// Color Schemes for Status
export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-red-100 text-red-800',
  error: 'bg-red-100 text-red-800'
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
} as const;

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss"
} as const;

// Mali-specific Configuration
export const MALI_CONFIG = {
  phone_regex: /^\+?223\d{8}$/,
  employee_id_regex: /^[A-Z]{2}\d{4,6}$/,
  business_hours: {
    start: '07:00',
    end: '18:00'
  },
  work_days: [1, 2, 3, 4, 5, 6], // Monday to Saturday
  currency_symbol: 'XOF',
  // Format currency in West African CFA franc (XOF) using Intl for consistent formatting
  currency_format: (amount: number) => {
    try {
      return new Intl.NumberFormat('fr-ML', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);
    } catch (e) {
      return `${amount.toLocaleString('fr-ML')} XOF`;
    }
  }
} as const;

// Validation Messages (French)
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Ce champ est obligatoire',
  INVALID_EMAIL: 'Adresse email invalide',
  INVALID_PHONE: 'Numéro de téléphone invalide (format Mali: +223XXXXXXXX)',
  INVALID_EMPLOYEE_ID: 'ID employé invalide (format: AB1234)',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères',
  PASSWORDS_DONT_MATCH: 'Les mots de passe ne correspondent pas'
} as const;

// Navigation Labels (French)
export const NAV_LABELS = {
  dashboard: 'Tableau de Bord',
  workflow: 'Flux de Travail',
  machines: 'Machines',
  maintenance: 'Maintenance',
  quality: 'Contrôle Qualité',
  allocation: 'Allocation Ressources',
  analytics: 'Analyses',
  reports: 'Rapports',
  users: 'Utilisateurs',
  notifications: 'Notifications',
  settings: 'Paramètres'
} as const;
