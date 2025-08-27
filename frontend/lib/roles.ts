/**
 * Role-based utilities for TexPro AI
 * Clean role management without conditional clutter
 */

import { USER_ROLES, ROLE_PERMISSIONS, ROLE_ROUTES, type UserRole } from './constants';

/**
 * Check if a role has access to a specific module
 */
export function hasRoleAccess(role: UserRole, module: string): boolean {
  return (ROLE_PERMISSIONS[role] as readonly string[]).includes(module);
}

/**
 * Get all accessible modules for a role
 */
export function getRoleModules(role: UserRole): readonly string[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Get the dashboard route for a role
 */
export function getRoleDashboard(role: UserRole): string {
  return ROLE_ROUTES[role];
}

/**
 * Validate if a role is valid
 */
export function isValidRole(role: string): role is UserRole {
  return Object.values(USER_ROLES).includes(role as UserRole);
}

/**
 * Get role hierarchy level (for permission checks)
 */
export function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    admin: 5,
    supervisor: 4,
    technician: 3,
    inspector: 3,
    analyst: 2
  };
  return levels[role];
}

/**
 * Check if role A can manage role B
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  return getRoleLevel(managerRole) > getRoleLevel(targetRole);
}

/**
 * Get available roles that a user can create/manage
 */
export function getManageableRoles(role: UserRole): UserRole[] {
  const currentLevel = getRoleLevel(role);
  return Object.entries(USER_ROLES)
    .filter(([_, roleValue]) => getRoleLevel(roleValue) < currentLevel)
    .map(([_, roleValue]) => roleValue);
}

/**
 * Navigation items for each role
 */
export const ROLE_NAVIGATION = {
  admin: [
    { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
    { key: 'users', label: 'Users', href: '/admin/users', icon: 'UserCog' },
    { key: 'machines', label: 'Machines', href: '/admin/machines', icon: 'Cog' },
    { key: 'workflow', label: 'Workflow', href: '/admin/workflow', icon: 'Workflow' },
    { key: 'quality', label: 'Quality Control', href: '/admin/quality', icon: 'CheckCircle' },
    { key: 'maintenance', label: 'Maintenance', href: '/admin/maintenance', icon: 'Wrench' },
    { key: 'allocation', label: 'Allocation', href: '/admin/allocation', icon: 'Users' },
    { key: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: 'BarChart' },
    { key: 'reports', label: 'Reports', href: '/admin/reports', icon: 'FileText' },
    { key: 'notifications', label: 'Notifications', href: '/admin/notifications', icon: 'Bell' },
    { key: 'settings', label: 'Settings', href: '/admin/settings', icon: 'Settings' }
  ],
  supervisor: [
    { key: 'dashboard', label: 'Dashboard', href: '/supervisor', icon: 'LayoutDashboard' },
    { key: 'workflow', label: 'Workflow', href: '/supervisor/workflow', icon: 'Workflow' },
    { key: 'machines', label: 'Machines', href: '/supervisor/machines', icon: 'Cog' },
    { key: 'maintenance', label: 'Maintenance', href: '/supervisor/maintenance', icon: 'Wrench' },
    { key: 'quality', label: 'Quality Control', href: '/supervisor/quality', icon: 'CheckCircle' },
    { key: 'allocation', label: 'Allocation', href: '/supervisor/allocation', icon: 'Users' },
    { key: 'analytics', label: 'Analytics', href: '/supervisor/analytics', icon: 'BarChart' },
    { key: 'reports', label: 'Reports', href: '/supervisor/reports', icon: 'FileText' },
    { key: 'notifications', label: 'Notifications', href: '/supervisor/notifications', icon: 'Bell' }
  ],
  technician: [
    { key: 'dashboard', label: 'Dashboard', href: '/technician', icon: 'LayoutDashboard' },
    { key: 'machines', label: 'Machines', href: '/technician/machines', icon: 'Cog' },
    { key: 'maintenance', label: 'Maintenance', href: '/technician/maintenance', icon: 'Wrench' },
    { key: 'notifications', label: 'Notifications', href: '/technician/notifications', icon: 'Bell' }
  ],
  inspector: [
    { key: 'dashboard', label: 'Dashboard', href: '/inspector', icon: 'LayoutDashboard' },
    { key: 'quality', label: 'Quality Control', href: '/inspector/quality', icon: 'CheckCircle' },
    { key: 'machines', label: 'Machines', href: '/inspector/machines', icon: 'Cog' },
    { key: 'notifications', label: 'Notifications', href: '/inspector/notifications', icon: 'Bell' }
  ],
  analyst: [
    { key: 'dashboard', label: 'Dashboard', href: '/analyst', icon: 'LayoutDashboard' },
    { key: 'analytics', label: 'Analytics', href: '/analyst/analytics', icon: 'BarChart' },
    { key: 'reports', label: 'Reports', href: '/analyst/reports', icon: 'FileText' },
    { key: 'workflow', label: 'Workflow', href: '/analyst/workflow', icon: 'Workflow' },
    { key: 'machines', label: 'Machines', href: '/analyst/machines', icon: 'Cog' },
    { key: 'notifications', label: 'Notifications', href: '/analyst/notifications', icon: 'Bell' }
  ]
} as const;

/**
 * Get navigation items for a specific role
 */
export function getRoleNavigation(role: UserRole) {
  return ROLE_NAVIGATION[role];
}

/**
 * Role-based styling
 */
export const ROLE_COLORS = {
  admin: {
    primary: 'bg-purple-600 hover:bg-purple-700',
    secondary: 'bg-purple-100 text-purple-800',
    border: 'border-purple-300'
  },
  supervisor: {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-blue-100 text-blue-800',
    border: 'border-blue-300'
  },
  technician: {
    primary: 'bg-green-600 hover:bg-green-700',
    secondary: 'bg-green-100 text-green-800',
    border: 'border-green-300'
  },
  inspector: {
    primary: 'bg-orange-600 hover:bg-orange-700',
    secondary: 'bg-orange-100 text-orange-800',
    border: 'border-orange-300'
  },
  analyst: {
    primary: 'bg-indigo-600 hover:bg-indigo-700',
    secondary: 'bg-indigo-100 text-indigo-800',
    border: 'border-indigo-300'
  }
} as const;

/**
 * Get role-specific colors
 */
export function getRoleColors(role: UserRole) {
  return ROLE_COLORS[role];
}
