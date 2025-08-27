import React from 'react';
import Card from '../../../../../../components/ui/Card';
import { Users, UserPlus, CheckCircle, XCircle } from 'lucide-react';

interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  new_users_this_month: number;
}

interface UserStatsCardsProps {
  stats: UserStats;
}

const UserStatsCards: React.FC<UserStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
          </div>
          <Users className="w-8 h-8 text-blue-600" />
        </div>
      </Card>
      
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Users</p>
            <p className="text-2xl font-bold text-green-600">{stats.active_users}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </Card>
      
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Inactive Users</p>
            <p className="text-2xl font-bold text-red-600">{stats.inactive_users}</p>
          </div>
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
      </Card>
      
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">New This Month</p>
            <p className="text-2xl font-bold text-purple-600">{stats.new_users_this_month}</p>
          </div>
          <UserPlus className="w-8 h-8 text-purple-600" />
        </div>
      </Card>
    </div>
  );
};

export default UserStatsCards;
