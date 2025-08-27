'use client';
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { ReportFilters } from '../../src/app/(dashboard)/analyst/reports/page';
import { CheckCircle, AlertTriangle, TrendingUp, Target, Award, XCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';

interface QualityData {
  summary: {
    overall_score: number;
    defect_rate: number;
    customer_satisfaction: number;
    compliance_score: number;
  };
  by_category: {
    category: string;
    score: number;
    defects: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  defect_analysis: {
    type: string;
    count: number;
    cost: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
}

interface QualityReportsProps {
  filters: ReportFilters;
  loading: boolean;
  data?: any;
}

const QualityReports: React.FC<QualityReportsProps> = ({ filters, loading, data: backendData }) => {
  const [data, setData] = useState<QualityData | null>(null);

  useEffect(() => {
    if (backendData) {
      console.log('QualityReports: Using backend data:', backendData);
    } else {
      console.log('QualityReports: Using mock data');
    }
    loadQualityData();
  }, [filters, backendData]);

  const loadQualityData = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockData: QualityData = {
      summary: {
        overall_score: 96.8,
        defect_rate: 2.1,
        customer_satisfaction: 4.7,
        compliance_score: 98.5
      },
      by_category: [
        { category: 'Dimensional', score: 98.2, defects: 12, trend: 'up' },
        { category: 'Surface Finish', score: 96.1, defects: 28, trend: 'stable' },
        { category: 'Functional', score: 95.8, defects: 35, trend: 'down' },
        { category: 'Packaging', score: 97.5, defects: 18, trend: 'up' }
      ],
      defect_analysis: [
        { type: 'Surface Scratches', count: 145, cost: 2850, severity: 'low' },
        { type: 'Dimensional Variance', count: 89, cost: 4200, severity: 'medium' },
        { type: 'Functional Failure', count: 23, cost: 8900, severity: 'high' },
        { type: 'Critical Safety Issue', count: 3, cost: 15000, severity: 'critical' }
      ]
    };

    setData(mockData);
  };

  if (loading || !data) {
    return <div className="animate-pulse">Loading quality reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-green-600" size={24} />
            <h3 className="font-semibold">Overall Score</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{data.summary.overall_score}%</p>
          <ProgressBar value={data.summary.overall_score} variant="success" size="sm" />
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="text-red-600" size={24} />
            <h3 className="font-semibold">Defect Rate</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">{data.summary.defect_rate}%</p>
          <ProgressBar value={data.summary.defect_rate} variant="danger" size="sm" />
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <Award className="text-blue-600" size={24} />
            <h3 className="font-semibold">Customer Satisfaction</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{data.summary.customer_satisfaction}/5.0</p>
          <ProgressBar value={(data.summary.customer_satisfaction / 5) * 100} variant="default" size="sm" />
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-purple-600" size={24} />
            <h3 className="font-semibold">Compliance</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{data.summary.compliance_score}%</p>
          <ProgressBar value={data.summary.compliance_score} variant="success" size="sm" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-semibold mb-4">Quality by Category</h3>
          <div className="space-y-4">
            {data.by_category.map((category, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{category.category}</p>
                  <p className="text-sm text-gray-600">{category.defects} defects</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{category.score}%</p>
                  <Badge variant={category.trend === 'up' ? 'success' : category.trend === 'down' ? 'danger' : 'default'} size="sm">
                    {category.trend}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-semibold mb-4">Defect Analysis</h3>
          <div className="space-y-4">
            {data.defect_analysis.map((defect, index) => (
              <div key={index} className="border border-gray-200 rounded p-3">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium">{defect.type}</p>
                  <Badge 
                    variant={defect.severity === 'critical' ? 'danger' : 
                            defect.severity === 'high' ? 'warning' : 'default'} 
                    size="sm"
                  >
                    {defect.severity}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Count: </span>
                    <span className="font-medium">{defect.count}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Cost: </span>
                    <span className="font-medium">{formatCurrency(defect.cost)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QualityReports;
