import api from './api';
import { QualityCheck, QualityFilters } from '../types/api';

export interface InspectorDashboardData {
  todayInspections: {
    completed: number;
    pending: number;
    passed: number;
    failed: number;
  };
  qualityMetrics: {
    passRate: number;
    defectRate: number;
    aiAccuracy: number;
    avgScore: number;
  };
  machineStatus: {
    total: number;
    operational: number;
    maintenance: number;
    offline: number;
  };
  alerts: {
    high: number;
    medium: number;
    low: number;
  };
  recentInspections: Array<{
    id: string;
    batchCode: string;
    productType: string;
    result: 'passed' | 'failed' | 'pending';
    score: number;
    timestamp: string;
    defectsFound: number;
  }>;
}

export interface InspectorStats {
  daily_target: number;
  completed_inspections: number;
  completion_rate: number;
  quality_score: number;
  efficiency: number;
  ai_accuracy: number;
}

class InspectorService {
  // Get inspector dashboard overview data
  async getDashboardData(): Promise<InspectorDashboardData> {
    try {
      // Get quality checks for today
      const qualityChecks = await this.getTodayQualityChecks();
      
      // Get machine status from machine service
      const machineStats = await this.getMachineStatusSummary();
      
      // Transform quality checks to dashboard format
      const todayInspections = this.calculateTodayInspections(qualityChecks);
      const qualityMetrics = this.calculateQualityMetrics(qualityChecks);
      const recentInspections = this.transformToRecentInspections(qualityChecks);
      
      // Get alerts (placeholder for now)
      const alerts = {
        high: 2,
        medium: 5,
        low: 3
      };

      return {
        todayInspections,
        qualityMetrics,
        machineStatus: machineStats,
        alerts,
        recentInspections
      };
    } catch (error) {
      console.error('Error fetching inspector dashboard data:', error);
      throw error;
    }
  }

  // Get today's quality checks
  async getTodayQualityChecks(): Promise<QualityCheck[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const filters: QualityFilters = {
        date_from: today,
        date_to: today
      };
      
      const response = await api.getQualityChecks(filters);
      return response.results || [];
    } catch (error) {
      console.error('Error fetching today quality checks:', error);
      return [];
    }
  }

  // Get recent quality checks (last 10)
  async getRecentQualityChecks(limit: number = 10): Promise<QualityCheck[]> {
    try {
      const response = await api.get(`/quality/?limit=${limit}`);
      const data = response.data?.data || response.data;
      return data.results || [];
    } catch (error) {
      console.error('Error fetching recent quality checks:', error);
      return [];
    }
  }

  // Get machine status summary
  async getMachineStatusSummary() {
    try {
      const response = await api.get('/machines/stats/');
      const data = response.data?.data || response.data;
      
      return {
        total: data.total_machines || 0,
        operational: data.operational_machines || 0,
        maintenance: data.maintenance_machines || 0,
        offline: data.offline_machines || 0
      };
    } catch (error) {
      console.error('Error fetching machine status:', error);
      return {
        total: 0,
        operational: 0,
        maintenance: 0,
        offline: 0
      };
    }
  }

  // Get inspector performance stats
  async getInspectorStats(): Promise<InspectorStats> {
    try {
      const response = await api.get('/analytics/inspector-stats/');
      const data = response.data?.data || response.data;
      
      return {
        daily_target: data.daily_target || 50,
        completed_inspections: data.completed_inspections || 0,
        completion_rate: data.completion_rate || 0,
        quality_score: data.quality_score || 0,
        efficiency: data.efficiency || 0,
        ai_accuracy: data.ai_accuracy || 0
      };
    } catch (error) {
      console.error('Error fetching inspector stats:', error);
      // Return fallback stats
      return {
        daily_target: 50,
        completed_inspections: 0,
        completion_rate: 0,
        quality_score: 0,
        efficiency: 0,
        ai_accuracy: 0
      };
    }
  }

  // Private helper methods
  private calculateTodayInspections(qualityChecks: QualityCheck[]) {
    const completed = qualityChecks.filter(q => q.status !== 'pending').length;
    const pending = qualityChecks.filter(q => q.status === 'pending').length;
    const passed = qualityChecks.filter(q => q.status === 'approved').length;
    const failed = qualityChecks.filter(q => q.status === 'rejected').length;

    return {
      completed,
      pending,
      passed,
      failed
    };
  }

  private calculateQualityMetrics(qualityChecks: QualityCheck[]) {
    if (qualityChecks.length === 0) {
      return {
        passRate: 0,
        defectRate: 0,
        aiAccuracy: 0,
        avgScore: 0
      };
    }

    const completedChecks = qualityChecks.filter(q => q.status !== 'pending');
    const passedChecks = qualityChecks.filter(q => q.status === 'approved');
    const defectChecks = qualityChecks.filter(q => q.defect_detected);
    const aiChecks = qualityChecks.filter(q => q.ai_confidence_score !== null);

    const passRate = completedChecks.length > 0 ? (passedChecks.length / completedChecks.length) * 100 : 0;
    const defectRate = qualityChecks.length > 0 ? (defectChecks.length / qualityChecks.length) * 100 : 0;
    
    // Calculate AI accuracy (placeholder calculation)
    const aiAccuracy = aiChecks.length > 0 ? 
      (aiChecks.reduce((sum, check) => sum + (check.ai_confidence_score || 0), 0) / aiChecks.length) * 100 : 0;
    
    // Calculate average score (based on pass rate and AI confidence)
    const avgScore = (passRate + aiAccuracy) / 2;

    return {
      passRate: Math.round(passRate * 10) / 10,
      defectRate: Math.round(defectRate * 10) / 10,
      aiAccuracy: Math.round(aiAccuracy * 10) / 10,
      avgScore: Math.round(avgScore * 10) / 10
    };
  }

  private transformToRecentInspections(qualityChecks: QualityCheck[]) {
    return qualityChecks
      .slice(0, 5) // Get latest 5
      .map(check => {
        // Map status to result
        let result: 'passed' | 'failed' | 'pending';
        switch (check.status) {
          case 'approved':
            result = 'passed';
            break;
          case 'rejected':
            result = 'failed';
            break;
          default:
            result = 'pending';
        }

        // Calculate score based on AI confidence and defect status
        const score = check.ai_confidence_score ? 
          check.ai_confidence_score * 100 : 
          (result === 'passed' ? 95 : result === 'failed' ? 75 : 0);

        return {
          id: check.id,
          batchCode: check.batch?.batch_code || `BAT-${check.id.slice(0, 8)}`,
          productType: check.batch?.description || 'Textile Product',
          result,
          score: Math.round(score * 10) / 10,
          timestamp: check.created_at,
          defectsFound: check.defect_detected ? 1 : 0
        };
      });
  }
}

export const inspectorService = new InspectorService();
export default inspectorService;
