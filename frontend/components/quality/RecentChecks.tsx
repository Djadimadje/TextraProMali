import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { QualityCheck } from '../../services/qualityService';

interface RecentChecksProps {
  checks: QualityCheck[];
  loading: boolean;
}

const RecentChecks: React.FC<RecentChecksProps> = ({ checks, loading }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (severity) {
      case 'high':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Quality Checks</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
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
        <h3 className="text-lg font-medium text-gray-900">Recent Quality Checks</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {checks?.slice(0, 5).map((check) => (
            <div key={check.id} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getStatusIcon(check.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Batch {check.batch?.batch_code || 'Unknown'}
                </p>
                <p className="text-sm text-gray-500">
                  {check.defect_detected ? 
                    `Defect: ${check.defect_type || 'Unknown'}` : 
                    'No defects detected'
                  }
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex-shrink-0">
                  <span className={getSeverityBadge(check.severity)}>
                    {check.severity}
                  </span>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>{check.inspector ? `${check.inspector.first_name} ${check.inspector.last_name}` : 'Inspector: N/A'}</div>
                  <div>AI: {typeof check.ai_confidence_score === 'number' ? `${check.ai_confidence_score}%` : 'N/A'}</div>
                </div>
              </div>
            </div>
          )) || []}
        </div>
      </div>
    </div>
  );
};

export default RecentChecks;
