import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface QualityAlert {
  type: string;
  message: string;
  batch_id: string;
  quality_check_id: string;
  created_at: string;
}

interface QualityAlertsProps {
  alerts: QualityAlert[];
  loading: boolean;
}

const QualityAlerts: React.FC<QualityAlertsProps> = ({ alerts, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quality Alerts</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3">
                <div className="h-5 w-5 bg-gray-200 rounded-full mt-0.5"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quality Alerts</h3>
      </div>
      <div className="p-6">
        {alerts?.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No quality alerts at this time</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QualityAlerts;
