import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface DashboardData {
  total_checks_today: number;
  total_checks_week: number;
  defect_rate_today: number;
  defect_rate_week: number;
  quality_score_trend: any[];
  defect_types_breakdown: any[];
  recent_checks: any[];
  top_inspectors: any[];
  alerts: any[];
}

interface QualityDashboardProps {
  dashboardData: DashboardData | null;
  loading: boolean;
}

const QualityDashboard: React.FC<QualityDashboardProps> = ({ dashboardData, loading }) => {
  if (loading || !dashboardData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Today's Checks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Today's Checks
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {dashboardData.total_checks_today}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Week's Checks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                This Week
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {dashboardData.total_checks_week}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Today's Defect Rate */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Today's Defect Rate
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {dashboardData.defect_rate_today.toFixed(1)}%
              </dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Week's Defect Rate */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Week's Defect Rate
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {dashboardData.defect_rate_week.toFixed(1)}%
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityDashboard;
