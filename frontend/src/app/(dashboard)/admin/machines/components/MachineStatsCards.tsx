'use client';

import React from 'react';
import { 
  Cog, 
  Play, 
  Pause, 
  Wrench, 
  AlertTriangle, 
  Power 
} from 'lucide-react';

interface MachineStats {
  total_machines: number;
  active_machines: number;
  running_machines: number;
  idle_machines: number;
  maintenance_machines: number;
  breakdown_machines: number;
  offline_machines: number;
  maintenance_due_count: number;
}

interface MachineStatsCardsProps {
  stats: MachineStats;
}

const MachineStatsCards: React.FC<MachineStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Machines',
      value: stats.total_machines.toString(),
      icon: <Cog className="w-8 h-8" />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      change: '+2',
      changeType: 'positive' as const
    },
    {
      title: 'Running',
      value: stats.running_machines.toString(),
      icon: <Play className="w-8 h-8" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      change: `${((stats.running_machines / stats.total_machines) * 100).toFixed(1)}%`,
      changeType: 'positive' as const
    },
    {
      title: 'Idle',
      value: stats.idle_machines.toString(),
      icon: <Pause className="w-8 h-8" />,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      change: `${((stats.idle_machines / stats.total_machines) * 100).toFixed(1)}%`,
      changeType: 'neutral' as const
    },
    {
      title: 'Under Maintenance',
      value: stats.maintenance_machines.toString(),
      icon: <Wrench className="w-8 h-8" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      change: `${stats.maintenance_due_count} due`,
      changeType: 'neutral' as const
    },
    {
      title: 'Breakdown',
      value: stats.breakdown_machines.toString(),
      icon: <AlertTriangle className="w-8 h-8" />,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      change: stats.breakdown_machines > 0 ? 'Needs attention' : 'All good',
      changeType: stats.breakdown_machines > 0 ? 'negative' as const : 'positive' as const
    },
    {
      title: 'Offline',
      value: stats.offline_machines.toString(),
      icon: <Power className="w-8 h-8" />,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      change: `${((stats.offline_machines / stats.total_machines) * 100).toFixed(1)}%`,
      changeType: 'neutral' as const
    }
  ];

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return '↗';
      case 'negative':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`${card.bgColor} ${card.textColor} p-3 rounded-lg`}>
                {card.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${getChangeColor(card.changeType)}`}>
              {getChangeIcon(card.changeType)} {card.change}
            </span>
            <span className="text-sm text-gray-500 ml-2">
              {card.changeType === 'positive' ? 'improvement' : 
               card.changeType === 'negative' ? 'attention needed' : 'of total'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MachineStatsCards;
