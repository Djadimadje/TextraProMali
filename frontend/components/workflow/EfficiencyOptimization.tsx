'use client';
import React, { useState } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { formatCurrency } from '../../lib/formatters';
import { 
  Zap, 
  TrendingUp, 
  Target,
  Settings,
  Lightbulb,
  CheckCircle,
  Clock,
  DollarSign,
  ArrowUpRight,
  Play,
  Pause,
  RotateCcw,
  Calculator,
  BarChart3,
  Users,
  AlertTriangle,
  Star
} from 'lucide-react';

interface EfficiencyOptimizationProps {
  filters: any;
}

const EfficiencyOptimization: React.FC<EfficiencyOptimizationProps> = ({ filters }) => {
  const [selectedOptimization, setSelectedOptimization] = useState<string | null>(null);
  const [simulationRunning, setSimulationRunning] = useState<boolean>(false);

  // Mock data - replace with actual API call
  const optimizationData = {
    currentMetrics: {
      overallEfficiency: 87.2,
      throughput: 245,
      cycleTime: 2.4,
      utilization: 89.7,
      qualityRate: 94.2,
      costPerUnit: 45.20
    },
    optimizationOpportunities: [
      {
        id: 1,
        title: 'Automated Quality Inspection',
        category: 'Automation',
        priority: 'high',
        impactScore: 95,
        estimatedSavings: 180000,
        implementationTime: 12,
        complexity: 'medium',
        description: 'Replace manual quality inspection with automated vision systems',
        currentState: {
          efficiency: 65,
          throughput: 120,
          errorRate: 5.8
        },
        projectedState: {
          efficiency: 92,
          throughput: 180,
          errorRate: 1.2
        },
        requirements: [
          'Vision inspection system installation',
          'Staff training on new equipment',
          'Process workflow redesign'
        ],
        benefits: [
          '27% increase in efficiency',
          '50% increase in throughput',
          '79% reduction in error rate',
          '{formatCurrency(180000)} annual savings'
        ],
        risks: [
          'Initial learning curve',
          'System calibration requirements',
          'Dependency on technology'
        ],
        status: 'pending'
      },
      {
        id: 2,
        title: 'Production Line Balancing',
        category: 'Process Optimization',
        priority: 'high',
        impactScore: 88,
        estimatedSavings: 125000,
        implementationTime: 8,
        complexity: 'low',
        description: 'Redistribute workload across production stations to eliminate bottlenecks',
        currentState: {
          efficiency: 78,
          throughput: 200,
          bottlenecks: 3
        },
        projectedState: {
          efficiency: 89,
          throughput: 245,
          bottlenecks: 1
        },
        requirements: [
          'Workstation analysis',
          'Task redistribution',
          'Operator retraining'
        ],
        benefits: [
          '14% efficiency improvement',
          '22% throughput increase',
          '67% bottleneck reduction',
          '{formatCurrency(125000)} annual savings'
        ],
        risks: [
          'Temporary productivity dip',
          'Resistance to change',
          'Training requirements'
        ],
        status: 'analyzing'
      },
      {
        id: 3,
        title: 'Predictive Maintenance Implementation',
        category: 'Maintenance',
        priority: 'medium',
        impactScore: 82,
        estimatedSavings: 95000,
        implementationTime: 16,
        complexity: 'high',
        description: 'Implement IoT sensors and AI-based predictive maintenance',
        currentState: {
          efficiency: 83,
          downtime: 15,
          maintenanceCost: 45000
        },
        projectedState: {
          efficiency: 91,
          downtime: 8,
          maintenanceCost: 28000
        },
        requirements: [
          'IoT sensor installation',
          'AI system integration',
          'Maintenance team training'
        ],
        benefits: [
          '10% efficiency increase',
          '47% downtime reduction',
          '38% maintenance cost savings',
          '{formatCurrency(95000)} annual savings'
        ],
        risks: [
          'High initial investment',
          'Technology complexity',
          'Data integration challenges'
        ],
        status: 'planning'
      },
      {
        id: 4,
        title: 'Lean Manufacturing Implementation',
        category: 'Process Optimization',
        priority: 'medium',
        impactScore: 75,
        estimatedSavings: 78000,
        implementationTime: 20,
        complexity: 'medium',
        description: 'Apply lean principles to eliminate waste and optimize workflow',
        currentState: {
          efficiency: 87,
          waste: 18,
          inventoryTurns: 8
        },
        projectedState: {
          efficiency: 93,
          waste: 8,
          inventoryTurns: 12
        },
        requirements: [
          'Lean training program',
          'Process mapping',
          'Kaizen implementation'
        ],
        benefits: [
          '7% efficiency improvement',
          '56% waste reduction',
          '50% inventory optimization',
          '{formatCurrency(78000)} annual savings'
        ],
        risks: [
          'Cultural change resistance',
          'Time-intensive implementation',
          'Continuous improvement commitment'
        ],
        status: 'implementing'
      }
    ],
    simulationResults: {
      scenarios: [
        {
          name: 'Current State',
          efficiency: 87.2,
          throughput: 245,
          cost: 45.20,
          revenue: 2450000
        },
        {
          name: 'Single Optimization',
          efficiency: 91.5,
          throughput: 275,
          cost: 42.80,
          revenue: 2750000
        },
        {
          name: 'Multiple Optimizations',
          efficiency: 94.8,
          throughput: 315,
          cost: 38.90,
          revenue: 3150000
        },
        {
          name: 'Full Implementation',
          efficiency: 97.2,
          throughput: 350,
          cost: 35.60,
          revenue: 3500000
        }
      ]
    },
    improvementTracking: [
      {
        metric: 'Overall Efficiency',
        baseline: 82.5,
        current: 87.2,
        target: 92.0,
        improvement: 5.7,
        timeline: '6 months'
      },
      {
        metric: 'Throughput',
        baseline: 210,
        current: 245,
        target: 280,
        improvement: 16.7,
        timeline: '4 months'
      },
      {
        metric: 'Quality Rate',
        baseline: 91.8,
        current: 94.2,
        target: 96.5,
        improvement: 2.6,
        timeline: '8 months'
      },
      {
        metric: 'Cost per Unit',
        baseline: 48.50,
        current: 45.20,
        target: 42.00,
        improvement: 6.8,
        timeline: '12 months'
      }
    ]
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implementing': return 'warning';
      case 'planning': return 'info';
      case 'analyzing': return 'default';
      case 'pending': return 'danger';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implementing': return <Settings size={16} className="animate-spin" />;
      case 'planning': return <Target size={16} />;
      case 'analyzing': return <BarChart3 size={16} />;
      case 'pending': return <Clock size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const runSimulation = () => {
    setSimulationRunning(true);
    setTimeout(() => {
      setSimulationRunning(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Current Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card padding="lg" className="text-center">
          <Zap className="mx-auto mb-2 text-blue-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{optimizationData.currentMetrics.overallEfficiency}%</div>
          <div className="text-sm text-gray-600">Overall Efficiency</div>
        </Card>

        <Card padding="lg" className="text-center">
          <TrendingUp className="mx-auto mb-2 text-green-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{optimizationData.currentMetrics.throughput}</div>
          <div className="text-sm text-gray-600">Throughput/hr</div>
        </Card>

        <Card padding="lg" className="text-center">
          <Clock className="mx-auto mb-2 text-orange-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{optimizationData.currentMetrics.cycleTime}h</div>
          <div className="text-sm text-gray-600">Cycle Time</div>
        </Card>

        <Card padding="lg" className="text-center">
          <Target className="mx-auto mb-2 text-purple-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{optimizationData.currentMetrics.utilization}%</div>
          <div className="text-sm text-gray-600">Utilization</div>
        </Card>

        <Card padding="lg" className="text-center">
          <CheckCircle className="mx-auto mb-2 text-indigo-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">{optimizationData.currentMetrics.qualityRate}%</div>
          <div className="text-sm text-gray-600">Quality Rate</div>
        </Card>

        <Card padding="lg" className="text-center">
          <DollarSign className="mx-auto mb-2 text-green-600" size={24} />
          <div className="text-2xl font-bold text-gray-900">${optimizationData.currentMetrics.costPerUnit}</div>
          <div className="text-sm text-gray-600">Cost per Unit</div>
        </Card>
      </div>

      {/* Optimization Opportunities */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Optimization Opportunities</h3>
          <div className="flex items-center gap-2">
            <Button 
              onClick={runSimulation}
              variant="primary" 
              size="sm"
              disabled={simulationRunning}
            >
              <Calculator className={`mr-2 ${simulationRunning ? 'animate-spin' : ''}`} size={16} />
              {simulationRunning ? 'Running...' : 'Run Simulation'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {optimizationData.optimizationOpportunities.map(opportunity => (
            <Card 
              key={opportunity.id} 
              padding="lg" 
              className={`cursor-pointer transition-all ${
                selectedOptimization === opportunity.id.toString() 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedOptimization(
                selectedOptimization === opportunity.id.toString() ? null : opportunity.id.toString()
              )}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-md font-semibold text-gray-900">{opportunity.title}</h4>
                    <p className="text-sm text-gray-600">{opportunity.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(opportunity.priority)} size="sm">
                      {opportunity.priority}
                    </Badge>
                    <Badge variant={getStatusColor(opportunity.status)} size="sm">
                      {getStatusIcon(opportunity.status)}
                      {opportunity.status}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-gray-700">{opportunity.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      ${opportunity.estimatedSavings.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Annual Savings</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{opportunity.impactScore}</div>
                    <div className="text-xs text-gray-600">Impact Score</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-600">Timeline:</span>
                    <span className="font-medium ml-1">{opportunity.implementationTime} weeks</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Complexity:</span>
                    <span className={`font-medium ml-1 ${getComplexityColor(opportunity.complexity)}`}>
                      {opportunity.complexity}
                    </span>
                  </div>
                </div>

                {selectedOptimization === opportunity.id.toString() && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Current State</h5>
                        <div className="space-y-2 text-sm">
                          {Object.entries(opportunity.currentState).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">{key}:</span>
                              <span className="font-medium">{value}{typeof value === 'number' && key !== 'bottlenecks' ? '%' : ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Projected State</h5>
                        <div className="space-y-2 text-sm">
                          {Object.entries(opportunity.projectedState).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">{key}:</span>
                              <span className="font-medium text-green-600">{value}{typeof value === 'number' && key !== 'bottlenecks' ? '%' : ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Requirements</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {opportunity.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Expected Benefits</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        {opportunity.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Potential Risks</h5>
                      <ul className="text-sm text-orange-700 space-y-1">
                        {opportunity.risks.map((risk, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle size={14} className="text-orange-600 mt-0.5 flex-shrink-0" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="primary" size="sm">
                        Start Implementation
                      </Button>
                      <Button variant="secondary" size="sm">
                        Schedule Review
                      </Button>
                      <Button variant="secondary" size="sm">
                        Export Report
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulation Results */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Optimization Scenarios</h3>
            <BarChart3 className="text-blue-600" size={20} />
          </div>

          <div className="space-y-4">
            {optimizationData.simulationResults.scenarios.map((scenario, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">{scenario.name}</h4>
                  {index === 0 ? (
                    <Badge variant="default" size="sm">Current</Badge>
                  ) : (
                    <Badge variant="success" size="sm">
                      <ArrowUpRight size={12} />
                      Projected
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Efficiency:</span>
                      <span className="font-medium">{scenario.efficiency}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Throughput:</span>
                      <span className="font-medium">{scenario.throughput}/hr</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost/Unit:</span>
                      <span className="font-medium">${scenario.cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium">${scenario.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {index > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm text-green-600 font-medium">
                      Improvement vs Current: +{((scenario.revenue - optimizationData.simulationResults.scenarios[0].revenue) / optimizationData.simulationResults.scenarios[0].revenue * 100).toFixed(1)}% revenue
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Improvement Tracking */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Improvement Tracking</h3>
            <TrendingUp className="text-green-600" size={20} />
          </div>

          <div className="space-y-4">
            {optimizationData.improvementTracking.map((metric, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{metric.metric}</h4>
                  <span className="text-xs text-gray-600">{metric.timeline}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Baseline: {metric.baseline}{metric.metric.includes('Cost') ? '' : metric.metric.includes('Throughput') ? '/hr' : '%'}</span>
                    <span>Target: {metric.target}{metric.metric.includes('Cost') ? '' : metric.metric.includes('Throughput') ? '/hr' : '%'}</span>
                  </div>
                  
                  <ProgressBar 
                    value={(metric.improvement / (metric.target - metric.baseline)) * 100} 
                    variant="success"
                    className="h-2"
                  />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current: {metric.current}{metric.metric.includes('Cost') ? '' : metric.metric.includes('Throughput') ? '/hr' : '%'}</span>
                    <span className="text-green-600 font-medium">+{metric.improvement.toFixed(1)}% improvement</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Lightbulb className="text-blue-600 mb-2" size={20} />
            <div className="text-sm font-medium text-gray-900">Generate Ideas</div>
            <div className="text-xs text-gray-600">AI-powered optimization suggestions</div>
          </button>
          
          <button className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <Play className="text-green-600 mb-2" size={20} />
            <div className="text-sm font-medium text-gray-900">Start Implementation</div>
            <div className="text-xs text-gray-600">Begin selected optimization</div>
          </button>
          
          <button className="p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <BarChart3 className="text-orange-600 mb-2" size={20} />
            <div className="text-sm font-medium text-gray-900">View Analytics</div>
            <div className="text-xs text-gray-600">Detailed performance analysis</div>
          </button>
          
          <button className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Users className="text-purple-600 mb-2" size={20} />
            <div className="text-sm font-medium text-gray-900">Team Collaboration</div>
            <div className="text-xs text-gray-600">Share optimization plans</div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default EfficiencyOptimization;
