'use client';
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { ReportFilters } from '../../src/app/(dashboard)/analyst/reports/page';
import { Wrench, Clock, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';

interface MaintenanceData {
  summary: {
    total_cost: number;
    planned_percentage: number;
    average_downtime: number;
    mtbf: number;
  };
  by_type: {
    type: 'Preventive' | 'Corrective' | 'Emergency';
    count: number;
    cost: number;
    hours: number;
  }[];
  upcoming: {
    machine: string;
    type: string;
    date: string;
    estimated_cost: number;
  }[];
}

interface MaintenanceReportsProps {
  filters: ReportFilters;
  loading: boolean;
  data?: any;
}

const MaintenanceReports: React.FC<MaintenanceReportsProps> = ({ filters, loading, data: backendData }) => {
  const [data, setData] = useState<MaintenanceData | null>(null);

  useEffect(() => {
    loadMaintenanceData();
  }, [filters]);

  const loadMaintenanceData = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockData: MaintenanceData = {
      summary: {
        total_cost: 45600,
        planned_percentage: 78,
        average_downtime: 4.2,
        mtbf: 720
      },
      by_type: [
        { type: 'Preventive', count: 45, cost: 28400, hours: 180 },
        { type: 'Corrective', count: 23, cost: 12800, hours: 96 },
        { type: 'Emergency', count: 8, cost: 4400, hours: 32 }
      ],
      upcoming: [
        { machine: 'Production Line A', type: 'Preventive', date: '2025-09-01', estimated_cost: 850 },
        { machine: 'CNC Mill #1', type: 'Corrective', date: '2025-09-03', estimated_cost: 1200 },
        { machine: 'Quality Station', type: 'Preventive', date: '2025-09-05', estimated_cost: 400 }
      ]
    };

    setData(mockData);
  };

  if (loading || !data) {
    return <div className="animate-pulse">Loading maintenance reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="text-green-600" size={24} />
            <h3 className="font-semibold">Total Cost</h3>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(data.summary.total_cost)}</p>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-blue-600" size={24} />
            <h3 className="font-semibold">Planned %</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{data.summary.planned_percentage}%</p>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-yellow-600" size={24} />
            <h3 className="font-semibold">Avg Downtime</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{data.summary.average_downtime}h</p>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <Wrench className="text-purple-600" size={24} />
            <h3 className="font-semibold">MTBF</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{data.summary.mtbf}h</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-semibold mb-4">Maintenance by Type</h3>
          <div className="space-y-4">
            {data.by_type.map((type, index) => (
              <div key={index} className="border border-gray-200 rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{type.type}</h4>
                  <Badge variant={type.type === 'Emergency' ? 'danger' : 'default'} size="sm">
                    {type.count} events
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Cost: </span>
                    <span className="font-medium">{formatCurrency(type.cost)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Hours: </span>
                    <span className="font-medium">{type.hours}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-semibold mb-4">Upcoming Maintenance</h3>
          <div className="space-y-3">
            {data.upcoming.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{item.machine}</p>
                  <p className="text-sm text-gray-600">{item.type} - {item.date}</p>
                </div>
                <p className="font-bold">{formatCurrency(item.estimated_cost)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceReports;
