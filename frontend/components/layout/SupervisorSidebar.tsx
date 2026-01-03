'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';
import {
  LayoutDashboard,
  Workflow,
  Users,
  CheckCircle,
  BarChart,
  FileText,
  Bell,
  LogOut
} from 'lucide-react';

interface SupervisorSidebarProps {
  className?: string;
}

const SupervisorSidebar: React.FC<SupervisorSidebarProps> = ({ className = '' }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', href: '/supervisor', icon: 'LayoutDashboard', description: 'Supervisor overview' },
    { key: 'workflow', label: 'Workflow', href: '/supervisor/workflow', icon: 'Workflow', description: 'Manage production batches' },
    { key: 'allocation', label: 'Allocation', href: '/supervisor/allocation', icon: 'Users', description: 'Staff & resource assignment' },
    { key: 'quality', label: 'Quality Control', href: '/supervisor/quality', icon: 'CheckCircle', description: 'Quality monitoring' },
    { key: 'analytics', label: 'Analytics', href: '/supervisor/analytics', icon: 'BarChart', description: 'Production KPIs' },
    { key: 'reports', label: 'Reports', href: '/supervisor/reports', icon: 'FileText', description: 'Supervisor reports' },
    
  ];

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      LayoutDashboard: <LayoutDashboard size={20} />,
      Workflow: <Workflow size={20} />,
      Users: <Users size={20} />,
      CheckCircle: <CheckCircle size={20} />,
      BarChart: <BarChart size={20} />,
      FileText: <FileText size={20} />,
      Bell: <Bell size={20} />
    };
    return iconMap[iconName] || <LayoutDashboard size={20} />;
  };

  const isActive = (href: string) => {
    // Exact match for dashboard
    if (href === '/supervisor') {
      return pathname === '/supervisor';
    }
    // For other routes, check if current path starts with the href
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect will be handled by AuthContext
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={`fixed left-0 top-0 h-full w-[200px] lg:w-[240px] bg-white shadow-lg z-40 hidden lg:block ${className}`}>
      <div className="flex flex-col h-full">
        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-medium text-sm">
                {user?.first_name?.[0] || user?.username?.[0] || 'S'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : 'Supervisor'}
              </span>
              <span className="text-xs text-indigo-600 font-medium">
                {user?.role === 'supervisor' ? 'Production Supervisor' : user?.role || 'Supervisor'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex flex-col gap-1 px-3 py-4 flex-1">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`
                  flex flex-row items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                  ${active 
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `.trim().replace(/\s+/g, ' ')}
                title={item.description}
              >
                <div className={`transition-colors ${active ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                  {getIcon(item.icon)}
                </div>
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Logout Section */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex flex-row items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          >
            <LogOut size={20} className="text-gray-500 group-hover:text-red-500" />
            <span className="text-sm font-medium">
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupervisorSidebar;
