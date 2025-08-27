'use client';

import React, { useState, useEffect } from 'react';
import { allocationService, WorkforceAllocation, MaterialAllocation, AllocationStats, MaterialStats } from '../../services/allocationService';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Loader2
} from 'lucide-react';

interface AllocationReportsProps {
  workforceStats?: AllocationStats | null;
  materialStats?: MaterialStats | null;
  workforceAllocations: WorkforceAllocation[];
  materialAllocations: MaterialAllocation[];
  loading?: boolean;
}

interface ReportFilter {
  startDate: string;
  endDate: string;
  role?: string;
  materialType?: string;
  batchNumber?: string;
  status?: string;
}

interface UtilizationReport {
  role: string;
  totalAllocated: number; // Total days allocated
  totalPlanned: number;   // Same as allocated since we don't track separately
  utilizationRate: number;
  avgHoursPerAllocation: number; // Based on 8 hours per day
}

interface CostReport {
  material: string;
  totalCost: number;
  totalQuantity: number;
  avgCostPerUnit: number;
  allocationsCount: number;
}

interface ProductivityReport {
  batch: string;
  staffCount: number;
  materialCount: number;
  totalCost: number;
  efficiency: number;
}

const AllocationReports: React.FC<AllocationReportsProps> = ({
  workforceStats,
  materialStats,
  workforceAllocations,
  materialAllocations,
  loading = false
}) => {
  const [activeReport, setActiveReport] = useState('overview');
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    endDate: new Date().toISOString().split('T')[0]
  });
  const [exportLoading, setExportLoading] = useState(false);

  // Calculate utilization reports
  const utilizationReports: UtilizationReport[] = React.useMemo(() => {
    const roleStats = workforceAllocations.reduce((acc, allocation) => {
      const role = allocation.role_assigned || 'unassigned';
      if (!acc[role]) {
        acc[role] = {
          totalDays: 0,
          totalAllocations: 0,
          count: 0
        };
      }
      
      // Calculate duration in days
      const durationDays = allocation.duration_days || 1; // Default to 1 day if no duration
      acc[role].totalDays += durationDays;
      acc[role].totalAllocations += 1;
      acc[role].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(roleStats).map(([role, stats]) => ({
      role,
      totalAllocated: stats.totalDays, // Using days instead of hours
      totalPlanned: stats.totalDays, // Since we don't have separate planned vs actual
      utilizationRate: 100, // Assuming 100% since we don't track actual vs planned
      avgHoursPerAllocation: stats.count > 0 ? (stats.totalDays * 8) / stats.count : 0 // Assuming 8 hours per day
    }));
  }, [workforceAllocations]);

  // Calculate cost reports
  const costReports: CostReport[] = React.useMemo(() => {
    const materialStats = materialAllocations.reduce((acc, allocation) => {
      const material = allocation.material_name;
      if (!acc[material]) {
        acc[material] = {
          totalCost: 0,
          totalQuantity: 0,
          count: 0,
          totalCostPerUnit: 0
        };
      }
      const cost = (allocation.quantity || 0) * (allocation.cost_per_unit || 0);
      acc[material].totalCost += cost;
      acc[material].totalQuantity += allocation.quantity || 0;
      acc[material].totalCostPerUnit += allocation.cost_per_unit || 0;
      acc[material].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(materialStats).map(([material, stats]) => ({
      material,
      totalCost: stats.totalCost,
      totalQuantity: stats.totalQuantity,
      avgCostPerUnit: stats.count > 0 ? stats.totalCostPerUnit / stats.count : 0,
      allocationsCount: stats.count
    }));
  }, [materialAllocations]);

  // Calculate productivity reports
  const productivityReports: ProductivityReport[] = React.useMemo(() => {
    const batchStats = [...workforceAllocations, ...materialAllocations].reduce((acc, allocation) => {
      const batch = allocation.batch_number || 'unknown';
      if (!acc[batch]) {
        acc[batch] = {
          staffCount: 0,
          materialCount: 0,
          totalCost: 0,
          totalDays: 0
        };
      }
      
      if ('role_assigned' in allocation) {
        acc[batch].staffCount += 1;
        acc[batch].totalDays += allocation.duration_days || 1; // Using days instead of hours
      } else {
        acc[batch].materialCount += 1;
        acc[batch].totalCost += (allocation.quantity || 0) * (allocation.cost_per_unit || 0);
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(batchStats).map(([batch, stats]) => ({
      batch,
      staffCount: stats.staffCount,
      materialCount: stats.materialCount,
      totalCost: stats.totalCost,
      efficiency: stats.totalDays > 0 ? (stats.totalCost / (stats.totalDays * 8)) : 0 // Cost per hour (8 hours per day)
    }));
  }, [workforceAllocations, materialAllocations]);

  const handleExportReport = async (reportType: string, format: 'excel' | 'pdf' = 'excel') => {
    try {
      setExportLoading(true);
      
      // In a real implementation, you'd call the backend export API
      // For now, we'll simulate the export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${reportType}-report-${timestamp}.${format}`;
      
      console.log(`Exporting ${reportType} report as ${format}: ${filename}`);
      
      // In a real implementation:
      // const response = await allocationService.exportReport(reportType, format, filters);
      // downloadFile(response.data, filename);
      
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Staff Allocations
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {workforceStats?.total_allocations || workforceAllocations.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Material Allocations
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {materialStats?.total_allocations || materialAllocations.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Material Cost
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  ${costReports.reduce((sum, r) => sum + r.totalCost, 0).toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Allocation Days
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {workforceAllocations.reduce((sum, a) => sum + (a.duration_days || 1), 0)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Staff Allocation by Role
          </h3>
          <div className="space-y-3">
            {utilizationReports.slice(0, 5).map((report, index) => (
              <div key={report.role} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'][index]
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {report.role.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {(report.totalPlanned * 8).toFixed(0)}h ({report.utilizationRate.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Materials */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Materials by Cost
          </h3>
          <div className="space-y-3">
            {costReports
              .sort((a, b) => b.totalCost - a.totalCost)
              .slice(0, 5)
              .map((report, index) => (
                <div key={report.material} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      ['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'][index]
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">
                      {report.material}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    ${report.totalCost.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUtilizationReport = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Staff Utilization Report</h3>
        <p className="mt-1 text-sm text-gray-500">
          Detailed breakdown of staff allocation and utilization rates
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Allocated Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estimated Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilization Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Days/Allocation
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {utilizationReports.map((report) => (
              <tr key={report.role}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {report.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {report.totalPlanned.toFixed(0)} days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(report.totalAllocated * 8).toFixed(0)} hours
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className={`h-2 rounded-full ${
                          report.utilizationRate >= 80 ? 'bg-green-500' :
                          report.utilizationRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(report.utilizationRate, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900">
                      {report.utilizationRate.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(report.avgHoursPerAllocation / 8).toFixed(1)} days
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCostReport = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Material Cost Analysis</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comprehensive breakdown of material costs and usage
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Material
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Cost/Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Allocations
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {costReports
              .sort((a, b) => b.totalCost - a.totalCost)
              .map((report) => (
                <tr key={report.material}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {report.material}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      ${report.totalCost.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.totalQuantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${report.avgCostPerUnit.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {report.allocationsCount}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProductivityReport = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Batch Productivity Analysis</h3>
        <p className="mt-1 text-sm text-gray-500">
          Resource allocation efficiency across production batches
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batch Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Materials
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Efficiency Score
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productivityReports
              .sort((a, b) => b.efficiency - a.efficiency)
              .map((report) => (
                <tr key={report.batch}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {report.batch}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm text-gray-900">{report.staffCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-gray-900">{report.materialCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${report.totalCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.efficiency >= 100 ? 'bg-green-100 text-green-800' :
                        report.efficiency >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {report.efficiency.toFixed(1)}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Allocation Reports</h2>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive analysis and reporting for resource allocation
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleExportReport(activeReport, 'excel')}
            disabled={exportLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {exportLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Excel
          </button>
          <button
            onClick={() => handleExportReport(activeReport, 'pdf')}
            disabled={exportLoading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {exportLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Export PDF
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          />
          <button className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
            <Filter className="h-4 w-4 mr-1" />
            Apply
          </button>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'utilization', name: 'Staff Utilization', icon: Activity },
            { id: 'costs', name: 'Cost Analysis', icon: DollarSign },
            { id: 'productivity', name: 'Productivity', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`${
                activeReport === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Report Content */}
      <div>
        {activeReport === 'overview' && renderOverviewReport()}
        {activeReport === 'utilization' && renderUtilizationReport()}
        {activeReport === 'costs' && renderCostReport()}
        {activeReport === 'productivity' && renderProductivityReport()}
      </div>
    </div>
  );
};

export default AllocationReports;
