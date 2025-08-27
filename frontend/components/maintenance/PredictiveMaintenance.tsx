'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../lib/formatters';
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Settings, 
  BarChart3,
  Activity,
  Zap,
  Target,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  FileText
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { maintenanceService, PredictiveMaintenance as PredictiveMaintenanceType } from '../../services/maintenanceApiService';
import { exportService } from '../../services/exportService';

interface MachineHealthData {
  machine_id: string;
  machine_name: string;
  health_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  next_maintenance_due: string;
  failure_probability: number;
  components_at_risk: string[];
  maintenance_cost_estimate: number;
}

const PredictiveMaintenance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictiveMaintenanceType[]>([]);
  const [machineHealth, setMachineHealth] = useState<MachineHealthData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');

  useEffect(() => {
    loadPredictiveData();
  }, [selectedTimeframe, selectedRiskLevel]);

  const loadPredictiveData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load predictive maintenance data
      const predictionsResponse = await maintenanceService.getPredictiveMaintenance();
      
      if (predictionsResponse.success && predictionsResponse.data) {
        setPredictions(predictionsResponse.data);
        
        // Transform predictions data to machine health format
        const healthData: MachineHealthData[] = predictionsResponse.data.map((pred: PredictiveMaintenanceType) => ({
          machine_id: pred.machine_id,
          machine_name: pred.machine_name,
          health_score: pred.urgency === 'critical' ? 20 : 
                       pred.urgency === 'high' ? 45 : 
                       pred.urgency === 'medium' ? 75 : 92,
          risk_level: pred.urgency,
          next_maintenance_due: pred.next_due_date || new Date().toISOString().split('T')[0],
          failure_probability: pred.urgency === 'critical' ? 85 : 
                             pred.urgency === 'high' ? 65 : 
                             pred.urgency === 'medium' ? 25 : 8,
          components_at_risk: pred.recommendations.slice(0, 3) || ['General maintenance'],
          maintenance_cost_estimate: pred.urgency === 'critical' ? 2100 : 
                                   pred.urgency === 'high' ? 1200 : 
                                   pred.urgency === 'medium' ? 850 : 300
        }));
        
        setMachineHealth(healthData);
      }

    } catch (err) {
      console.error('Failed to load predictive maintenance data:', err);
      setError('Failed to load predictive maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const exportSingleMachineReport = async (machine: MachineHealthData) => {
    try {
      // Format single machine data for export
      const exportData = [{
        machine_id: machine.machine_id,
        machine_name: machine.machine_name,
        health_score: `${machine.health_score}%`,
        risk_level: machine.risk_level,
        next_maintenance_due: machine.next_maintenance_due,
        failure_probability: `${machine.failure_probability}%`,
        components_at_risk: machine.components_at_risk.join('; '),
        maintenance_cost_estimate: `$${machine.maintenance_cost_estimate.toLocaleString()}`
      }];

      const headers = {
        machine_id: 'Machine ID',
        machine_name: 'Machine Name',
        health_score: 'Health Score',
        risk_level: 'Risk Level',
        next_maintenance_due: 'Next Due Date',
        failure_probability: 'Failure Probability',
        components_at_risk: 'Components at Risk',
        maintenance_cost_estimate: 'Estimated Cost'
      };

      await exportService.exportToExcel(exportData, {
        filename: `${machine.machine_id}_health_report_${new Date().toISOString().split('T')[0]}.xlsx`,
        headers,
        title: `${machine.machine_name} Health Report`
      });
    } catch (err) {
      console.error('Failed to export machine report:', err);
      alert('Failed to export machine report. Please try again.');
    }
  };

  const exportPredictiveData = async () => {
    try {
      if (predictions.length === 0) {
        alert('No predictive data available for export');
        return;
      }

      // Format data for export
      const exportData = predictions.map(pred => ({
        machine_id: pred.machine_id,
        machine_name: pred.machine_name,
        next_due_date: pred.next_due_date || 'Not scheduled',
        urgency: pred.urgency,
        days_until_due: pred.days_until_due || 'N/A',
        recommendations: pred.recommendations.join('; ')
      }));

      await exportService.exportToExcel(exportData, {
        filename: `predictive_maintenance_${new Date().toISOString().split('T')[0]}.xlsx`,
        headers: exportService.getPredictiveMaintenanceHeaders(),
        title: 'Predictive Maintenance Analysis'
      });
    } catch (err) {
      console.error('Failed to export predictive data:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  const exportPredictivePDF = async () => {
    try {
      if (predictions.length === 0 || machineHealth.length === 0) {
        alert('No predictive data available for export');
        return;
      }

      const reportData = {
        title: 'Predictive Maintenance Analysis Report',
        predictions: predictions,
        machineHealth: machineHealth,
        summary: {
          totalMachines: machineHealth.length,
          criticalMachines: machineHealth.filter(m => m.risk_level === 'critical').length,
          highRiskMachines: machineHealth.filter(m => m.risk_level === 'high').length,
          avgHealthScore: machineHealth.reduce((sum, m) => sum + m.health_score, 0) / machineHealth.length,
          totalEstimatedCost: machineHealth.reduce((sum, m) => sum + m.maintenance_cost_estimate, 0)
        }
      };

      await exportService.exportPredictiveMaintenancePDF(reportData);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredMachines = machineHealth.filter(machine => 
    selectedRiskLevel === 'all' || machine.risk_level === selectedRiskLevel
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} padding="lg">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card padding="lg">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="secondary" onClick={loadPredictiveData}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Brain className="h-6 w-6 text-blue-600 mr-2" />
            Predictive Maintenance AI
          </h2>
          <p className="text-gray-600">AI-powered maintenance predictions and failure analysis</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={loadPredictiveData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="secondary" onClick={exportPredictiveData}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="secondary" onClick={exportPredictivePDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* AI Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI Predictions</p>
              <p className="text-2xl font-bold text-gray-900">{predictions.length}</p>
              <p className="text-sm text-gray-500">Active recommendations</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Machines</p>
              <p className="text-2xl font-bold text-gray-900">
                {machineHealth.filter(m => m.risk_level === 'critical').length}
              </p>
              <p className="text-sm text-red-600">Immediate attention</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Health Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(machineHealth.reduce((acc, m) => acc + m.health_score, 0) / machineHealth.length)}%
              </p>
              <p className="text-sm text-green-600">Fleet average</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cost Savings</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(12400)}</p>
              <p className="text-sm text-green-600">This month</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content - Machine Health Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Machine Health Analysis</h3>
              <div className="flex space-x-2">
                <select
                  value={selectedRiskLevel}
                  onChange={(e) => setSelectedRiskLevel(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredMachines.map((machine) => (
                <div key={machine.machine_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{machine.machine_name}</h4>
                      <p className="text-sm text-gray-500">ID: {machine.machine_id}</p>
                    </div>
                    <Badge variant={getRiskColor(machine.risk_level)} size="sm">
                      {machine.risk_level.toUpperCase()} RISK
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Health Score</p>
                      <p className={`text-xl font-bold ${getHealthColor(machine.health_score)}`}>
                        {machine.health_score}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Failure Risk</p>
                      <p className="text-xl font-bold text-gray-900">{machine.failure_probability}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Due</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatDate(machine.next_maintenance_due)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Est. Cost</p>
                      <p className="text-xl font-bold text-gray-900">
                        ${machine.maintenance_cost_estimate.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">AI-Detected Components at Risk:</p>
                    <div className="flex flex-wrap gap-2">
                      {machine.components_at_risk.map((component, index) => (
                        <Badge key={index} variant="warning" size="sm">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="primary" size="sm">
                      Schedule Maintenance
                    </Button>
                    <Button variant="secondary" size="sm">
                      View AI Analysis
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => exportSingleMachineReport(machine)}
                    >
                      Download Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Insights */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Zap className="h-5 w-5 text-yellow-500 mr-2" />
              AI Insights
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Pattern Detected</p>
                <p className="text-sm text-blue-700 mt-1">
                  Motor bearings show 40% higher failure rate during high-humidity periods. Recommend preventive maintenance scheduling.
                </p>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-900">Cost Optimization</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Scheduling 3 machines together could save 15% on maintenance costs through bulk parts ordering.
                </p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900">Efficiency Gain</p>
                <p className="text-sm text-green-700 mt-1">
                  Predictive maintenance reduced unplanned downtime by 34% this month compared to reactive approach.
                </p>
              </div>
            </div>
          </Card>

          {/* Failure Pattern Analysis */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
              Failure Patterns
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Motor Failures</span>
                <div className="flex items-center">
                  <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                    <div className="w-8 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">32%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Electrical Issues</span>
                <div className="flex items-center">
                  <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                    <div className="w-6 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">24%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mechanical Wear</span>
                <div className="flex items-center">
                  <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                    <div className="w-7 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">28%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sensor Malfunction</span>
                <div className="flex items-center">
                  <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                    <div className="w-4 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">16%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">AI Actions</h3>
            <div className="space-y-3">
              <Button variant="primary" size="sm" fullWidth>
                Run AI Analysis
              </Button>
              <Button variant="secondary" size="sm" fullWidth>
                Generate Predictions
              </Button>
              <Button variant="secondary" size="sm" fullWidth>
                Download ML Report
              </Button>
              <Button variant="secondary" size="sm" fullWidth>
                Configure Alerts
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PredictiveMaintenance;
