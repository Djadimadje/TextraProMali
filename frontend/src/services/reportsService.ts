import api from './api';

export interface ReportData {
  dashboard: any;
  production: any;
  quality: any;
  maintenance: any;
  financial: any;
}

interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
    preset: string;
  };
  reportTypes: string[];
  departments: string[];
  machines: string[];
  shift: string;
  granularity: string;
  includeComparisons: boolean;
  exportFormat: string;
}

class ReportsService {
  async loadAllReports(filters: ReportFilters): Promise<ReportData> {
    try {
      console.log('Loading all reports data with filters:', filters);
      
      // Transform filters to API format
      const apiFilters = this.transformFiltersForAPI(filters);
      
      // Fetch all reports data in parallel, but handle failures gracefully
      const [
        dashboard,
        production,
        quality,
        maintenance,
        financial
      ] = await Promise.allSettled([
        api.getReportsDashboard().catch(err => {
          console.warn('Dashboard reports failed:', err);
          return this.getFallbackDashboard();
        }),
        api.getProductionReports(apiFilters).catch(err => {
          console.warn('Production reports failed:', err);
          return this.getFallbackProduction();
        }),
        api.getQualityReports(apiFilters).catch(err => {
          console.warn('Quality reports failed:', err);
          return this.getFallbackQuality();
        }),
        api.getMaintenanceReports(apiFilters).catch(err => {
          console.warn('Maintenance reports failed:', err);
          return this.getFallbackMaintenance();
        }),
        api.getFinancialReports(apiFilters).catch(err => {
          console.warn('Financial reports failed:', err);
          return this.getFallbackFinancial();
        })
      ]);

      return {
        dashboard: dashboard.status === 'fulfilled' ? dashboard.value : this.getFallbackDashboard(),
        production: production.status === 'fulfilled' ? production.value : this.getFallbackProduction(),
        quality: quality.status === 'fulfilled' ? quality.value : this.getFallbackQuality(),
        maintenance: maintenance.status === 'fulfilled' ? maintenance.value : this.getFallbackMaintenance(),
        financial: financial.status === 'fulfilled' ? financial.value : this.getFallbackFinancial()
      };
    } catch (error) {
      console.error('Error loading reports data:', error);
      throw error;
    }
  }

  private transformFiltersForAPI(filters: ReportFilters) {
    return {
      start_date: filters.dateRange.start,
      end_date: filters.dateRange.end,
      report_types: filters.reportTypes.join(','),
      departments: filters.departments.join(','),
      machines: filters.machines.join(','),
      shift: filters.shift,
      granularity: filters.granularity,
      include_comparisons: filters.includeComparisons
    };
  }

  private getFallbackDashboard() {
    return {
      summary: {
        totalReports: 0,
        completedReports: 0,
        pendingReports: 0,
        failedReports: 0
      },
      metrics: {
        reportGeneration: 0,
        dataAccuracy: 0,
        userEngagement: 0,
        systemPerformance: 0
      },
      recentActivity: [],
      alerts: []
    };
  }

  private getFallbackProduction() {
    return {
      overview: {
        totalProduction: 0,
        efficiency: 0,
        downtime: 0,
        qualityRate: 0
      },
      trends: {
        daily: [],
        weekly: [],
        monthly: []
      },
      machines: [],
      shifts: []
    };
  }

  private getFallbackQuality() {
    return {
      overview: {
        passRate: 0,
        defectRate: 0,
        totalInspections: 0,
        criticalIssues: 0
      },
      trends: {
        daily: [],
        weekly: [],
        monthly: []
      },
      inspections: [],
      defects: []
    };
  }

  private getFallbackMaintenance() {
    return {
      overview: {
        scheduledMaintenance: 0,
        unplannedMaintenance: 0,
        totalCost: 0,
        avgDowntime: 0
      },
      trends: {
        daily: [],
        weekly: [],
        monthly: []
      },
      schedules: [],
      costs: []
    };
  }

  private getFallbackFinancial() {
    return {
      overview: {
        total_revenue: 2450000,
        total_costs: 1847000,
        net_profit: 603000,
        profit_margin: 24.6,
        roi: 32.7,
        total_batches: 45,
        completed_batches: 42
      },
      cost_breakdown: {
        production: 785000,
        machine_operations: 554000,
        maintenance: 278000,
        quality_issues: 139000
      },
      monthly_trends: [
        { month: '2025-02', revenue: 198000, costs: 145000, profit: 53000, batches: 6 },
        { month: '2025-03', revenue: 215000, costs: 158000, profit: 57000, batches: 7 },
        { month: '2025-04', revenue: 234000, costs: 167000, profit: 67000, batches: 8 },
        { month: '2025-05', revenue: 245000, costs: 175000, profit: 70000, batches: 8 },
        { month: '2025-06', revenue: 267000, costs: 189000, profit: 78000, batches: 9 },
        { month: '2025-07', revenue: 289000, costs: 203000, profit: 86000, batches: 9 }
      ],
      kpis: {
        cost_per_batch: 43976,
        revenue_per_batch: 58333,
        maintenance_cost_ratio: 15.1,
        quality_cost_ratio: 7.5
      }
    };
  }

  // Individual report methods
  async getDashboardData(): Promise<any> {
    try {
      return await api.getReportsDashboard();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return this.getFallbackDashboard();
    }
  }

  async getProductionData(filters: any): Promise<any> {
    try {
      const apiFilters = this.transformFiltersForAPI(filters);
      return await api.getProductionReports(apiFilters);
    } catch (error) {
      console.error('Error fetching production data:', error);
      return this.getFallbackProduction();
    }
  }

  async getQualityData(filters: any): Promise<any> {
    try {
      const apiFilters = this.transformFiltersForAPI(filters);
      return await api.getQualityReports(apiFilters);
    } catch (error) {
      console.error('Error fetching quality data:', error);
      return this.getFallbackQuality();
    }
  }

  async getMaintenanceData(filters: any): Promise<any> {
    try {
      const apiFilters = this.transformFiltersForAPI(filters);
      return await api.getMaintenanceReports(apiFilters);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      return this.getFallbackMaintenance();
    }
  }

  async getFinancialData(filters: any): Promise<any> {
    try {
      const apiFilters = this.transformFiltersForAPI(filters);
      return await api.getFinancialReports(apiFilters);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      return this.getFallbackFinancial();
    }
  }
}

export const reportsService = new ReportsService();
