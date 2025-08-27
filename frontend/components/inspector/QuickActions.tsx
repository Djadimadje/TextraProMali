'use client';
import React from 'react';
import Card from '../ui/Card';
import { 
  ClipboardCheck, 
  AlertTriangle,
  FileText, 
  Settings,
  Zap
} from 'lucide-react';

interface QuickActionsProps {
  loading: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ loading }) => {
  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const actionItems = [
    {
      icon: ClipboardCheck,
      title: 'New Inspection',
      description: 'Start quality inspection process',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      icon: Zap,
      title: 'AI Analysis',
      description: 'Run automated quality check',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: FileText,
      title: 'Quality Report',
      description: 'Generate inspection report',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: AlertTriangle,
      title: 'Defect Analysis',
      description: 'Analyze defect patterns',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <Card variant="elevated" padding="lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-600 mt-1">Inspector tools and utilities</p>
      </div>

      <div className="space-y-3">
        {actionItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`p-3 rounded-lg ${item.bgColor} mr-4`}>
                <IconComponent className={`w-6 h-6 ${item.color}`} />
              </div>
              
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">
                  {item.title}
                </div>
                <div className="text-xs text-gray-600">
                  {item.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <Settings className="w-4 h-4 mr-2" />
          Quick actions will be functional in the next update
        </div>
      </div>
    </Card>
  );
};

export default QuickActions;
