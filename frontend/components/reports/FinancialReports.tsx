'use client';
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { ReportFilters } from '../../src/app/(dashboard)/analyst/reports/page';
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';

interface FinancialData {
  summary: {
    total_revenue: number;
    total_costs: number;
    profit_margin: number;
    roi: number;
  };
  cost_breakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  trends: {
    month: string;
    revenue: number;
    costs: number;
    profit: number;
  }[];
}

interface FinancialReportsProps {
  filters: ReportFilters;
  loading: boolean;
  data?: any;
}

const FinancialReports: React.FC<FinancialReportsProps> = ({ filters, loading, data: backendData }) => {
  const [data, setData] = useState<FinancialData | null>(null);

  useEffect(() => {
    loadFinancialData();
  }, [filters, backendData]);

  const loadFinancialData = async () => {
    // Use backend data if available, otherwise use mock data
    if (backendData && backendData.overview) {
      const processedData: FinancialData = {
        summary: {
          total_revenue: backendData.overview.total_revenue || 0,
          total_costs: backendData.overview.total_costs || 0,
          profit_margin: backendData.overview.profit_margin || 0,
          roi: backendData.overview.roi || 0
        },
        cost_breakdown: backendData.cost_breakdown ? Object.entries(backendData.cost_breakdown).map(([category, amount]: [string, any]) => ({
          category: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          amount: amount,
          percentage: backendData.overview.total_costs > 0 ? Math.round((amount / backendData.overview.total_costs) * 100 * 10) / 10 : 0
        })) : [],
        trends: backendData.monthly_trends ? backendData.monthly_trends.map((trend: any) => ({
          month: trend.month.slice(-2), // Get MM from YYYY-MM format
          revenue: trend.revenue,
          costs: trend.costs,
          profit: trend.profit
        })) : []
      };
      setData(processedData);
      return;
    }

    // Fallback to mock data if no backend data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockData: FinancialData = {
      summary: {
        total_revenue: 2450000,
        total_costs: 1847000,
        profit_margin: 24.6,
        roi: 32.7
      },
      cost_breakdown: [
        { category: 'Labor', amount: 785000, percentage: 42.5 },
        { category: 'Materials', amount: 554000, percentage: 30.0 },
        { category: 'Maintenance', amount: 278000, percentage: 15.1 },
        { category: 'Energy', amount: 139000, percentage: 7.5 },
        { category: 'Other', amount: 91000, percentage: 4.9 }
      ],
      trends: [
        { month: 'Jan', revenue: 198000, costs: 145000, profit: 53000 },
        { month: 'Feb', revenue: 215000, costs: 158000, profit: 57000 },
        { month: 'Mar', revenue: 234000, costs: 167000, profit: 67000 },
        { month: 'Apr', revenue: 245000, costs: 175000, profit: 70000 },
        { month: 'May', revenue: 267000, costs: 189000, profit: 78000 },
        { month: 'Jun', revenue: 289000, costs: 203000, profit: 86000 }
      ]
    };

    setData(mockData);
  };

  if (loading || !data) {
    return <div className="animate-pulse">Loading financial reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="text-green-600" size={24} />
            <h3 className="font-semibold">Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(data.summary.total_revenue)}
          </p>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-red-600" size={24} />
            <h3 className="font-semibold">Total Costs</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(data.summary.total_costs)}
          </p>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-blue-600" size={24} />
            <h3 className="font-semibold">Profit Margin</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{data.summary.profit_margin}%</p>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="text-purple-600" size={24} />
            <h3 className="font-semibold">ROI</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{data.summary.roi}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
          <div className="space-y-4">
            {data.cost_breakdown.map((cost, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{cost.category}</p>
                  <p className="text-sm text-gray-600">{cost.percentage}%</p>
                </div>
                <p className="text-lg font-bold">{formatCurrency(cost.amount)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
          <div className="space-y-3">
            {data.trends.map((trend, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 text-sm">
                <span className="font-medium">{trend.month}</span>
                <span className="text-green-600">{formatCurrency(trend.revenue)}</span>
                <span className="text-red-600">{formatCurrency(trend.costs)}</span>
                <span className="text-blue-600 font-bold">{formatCurrency(trend.profit)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FinancialReports;
