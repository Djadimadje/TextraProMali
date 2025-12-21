'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';
import { getRoleNavigation } from '../../lib/roles';
import {
  LayoutDashboard,
  Workflow,
  Cog,
  Wrench,
  CheckCircle,
  Users,
  BarChart,
  FileText,
  UserCog,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';

interface AdminSidebarProps {
  className?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ className = '' }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  // Get navigation items based on user role (admin in this case)
  // const menuItems = getRoleNavigation('admin');
  // Filter out 'settings' and 'notifications' (assuming their keys are 'settings' and 'notifications')
  const menuItems = getRoleNavigation('admin').filter(item => item.key !== 'settings' && item.key !== 'notifications');

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      LayoutDashboard: <LayoutDashboard size={20} />,
      Workflow: <Workflow size={20} />,
      Cog: <Cog size={20} />,
      Wrench: <Wrench size={20} />,
      CheckCircle: <CheckCircle size={20} />,
      Users: <Users size={20} />,
      BarChart: <BarChart size={20} />,
      FileText: <FileText size={20} />,
      UserCog: <UserCog size={20} />,
      Bell: <Bell size={20} />,
      Settings: <Settings size={20} />
    };
    return iconMap[iconName] || <LayoutDashboard size={20} />;
  };

  const isActive = (href: string) => {
    // Exact match for dashboard
    if (href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
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
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 font-medium text-sm">
                {user?.first_name?.[0] || user?.username?.[0] || 'A'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : 'Administrator'}
              </span>
              <span className="text-xs text-purple-600 font-medium">
                {user?.role === 'admin' ? 'System Administrator' : user?.role || 'Administrator'}
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
                    ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `.trim().replace(/\s+/g, ' ')}
              >
                <div className={`transition-colors ${active ? 'text-purple-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
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

export default AdminSidebar;
