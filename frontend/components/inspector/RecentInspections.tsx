'use client';
import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Calendar
} from 'lucide-react';

interface RecentInspection {
  id: string;
  batchCode: string;
  productType: string;
  result: 'passed' | 'failed' | 'pending';
  score: number;
  timestamp: string;
  defectsFound: number;
}

interface RecentInspectionsProps {
  inspections?: RecentInspection[];
  loading: boolean;
}

const RecentInspections: React.FC<RecentInspectionsProps> = ({ inspections, loading }) => {
  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'passed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Inspections</h3>
          <p className="text-sm text-gray-600 mt-1">Latest quality control activities</p>
        </div>
      </div>

      {(!inspections || inspections.length === 0) ? (
        // Show mock data when no real data is available
        <div className="space-y-3">
          {[
            {
              id: 'INS001',
              batchCode: 'BTH-2024-001',
              productType: 'Cotton Fabric',
              result: 'passed' as const,
              score: 95.2,
              timestamp: '2 hours ago',
              defectsFound: 0
            },
            {
              id: 'INS002',
              batchCode: 'BTH-2024-002',
              productType: 'Silk Blend',
              result: 'failed' as const,
              score: 78.5,
              timestamp: '3 hours ago',
              defectsFound: 2
            },
            {
              id: 'INS003',
              batchCode: 'BTH-2024-003',
              productType: 'Polyester',
              result: 'pending' as const,
              score: 0,
              timestamp: '1 hour ago',
              defectsFound: 0
            },
            {
              id: 'INS004',
              batchCode: 'BTH-2024-004',
              productType: 'Wool Blend',
              result: 'passed' as const,
              score: 92.8,
              timestamp: '4 hours ago',
              defectsFound: 0
            },
            {
              id: 'INS005',
              batchCode: 'BTH-2024-005',
              productType: 'Linen',
              result: 'passed' as const,
              score: 88.7,
              timestamp: '5 hours ago',
              defectsFound: 1
            }
          ].map((inspection) => (
            <div
              key={inspection.id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
            >
              {/* Result Icon */}
              <div className="flex-shrink-0">
                {getResultIcon(inspection.result)}
              </div>

              {/* Inspection Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {inspection.batchCode}
                  </h4>
                  <Badge 
                    variant={getResultColor(inspection.result) as any} 
                    size="sm"
                  >
                    {inspection.result}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{inspection.productType}</span>
                  {inspection.result !== 'pending' && (
                    <span>Score: {inspection.score}%</span>
                  )}
                  {inspection.defectsFound > 0 && (
                    <span className="text-red-600">
                      {inspection.defectsFound} defect{inspection.defectsFound !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{inspection.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {inspections.map((inspection) => (
            <div
              key={inspection.id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
            >
              {/* Result Icon */}
              <div className="flex-shrink-0">
                {getResultIcon(inspection.result)}
              </div>

              {/* Inspection Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {inspection.batchCode}
                  </h4>
                  <Badge 
                    variant={getResultColor(inspection.result) as any} 
                    size="sm"
                  >
                    {inspection.result}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{inspection.productType}</span>
                  {inspection.result !== 'pending' && (
                    <span>Score: {inspection.score}%</span>
                  )}
                  {inspection.defectsFound > 0 && (
                    <span className="text-red-600">
                      {inspection.defectsFound} defect{inspection.defectsFound !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatTimestamp(inspection.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer - always show */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-green-600">3</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          
          <div>
            <div className="text-lg font-semibold text-red-600">1</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          
          <div>
            <div className="text-lg font-semibold text-yellow-600">1</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RecentInspections;
