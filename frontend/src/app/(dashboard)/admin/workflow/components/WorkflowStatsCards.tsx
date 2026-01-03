'use client';

import React from 'react';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users
} from 'lucide-react';
import type { BatchWorkflowStats } from '@/types/api';

interface WorkflowStatsCardsProps {
  stats: BatchWorkflowStats;
}

const WorkflowStatsCards: React.FC<WorkflowStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Batches',
      value: stats.total_batches,
      icon: TrendingUp,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Batches',
      value: stats.active_batches,
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Completed',
      value: stats.by_status.completed || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Overdue',
      value: stats.overdue_batches,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  const getCompletionRate = () => {
    const completed = stats.by_status.completed || 0;
    const total = stats.total_batches;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              {card.title === 'Completed' && (
                <p className="text-xs text-gray-500 mt-1">
                  {getCompletionRate()}% completion rate
                </p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-6 w-6 ${card.textColor}`} />
            </div>
          </div>
        </div>
      ))}

      {/* Status Breakdown Card */}
      <div className="md:col-span-2 lg:col-span-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(stats.by_status).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">
                {status.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supervisor Distribution */}
      {Object.keys(stats.by_supervisor).length > 0 && (
        <div className="md:col-span-2 lg:col-span-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Supervisor Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.by_supervisor).slice(0, 6).map(([supervisor, count]) => (
              <div key={supervisor} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{supervisor}</span>
                <span className="text-sm text-gray-600">{count} batches</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowStatsCards;
