'use client';
import React, { useState } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import InspectorSidebar from '../../../../../../components/layout/InspectorSidebar';
import Header from '../../../../../../components/layout/Header';
import Card from '../../../../../../components/ui/Card';
import Button from '../../../../../../components/ui/Button';
import Badge from '../../../../../../components/ui/Badge';
import { 
  Camera,
  Upload,
  Save,
  Send,
  X,
  CheckCircle,
  AlertTriangle,
  Eye,
  Zap,
  FileText,
  Calendar,
  User,
  Package,
  Ruler,
  Palette,
  Shield,
  Target,
  BarChart3
} from 'lucide-react';

interface InspectionData {
  batchCode: string;
  productType: string;
  inspector: string;
  date: string;
  template: string;
  standards: string[];
}

interface DefectItem {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  image?: string;
}

const NewInspectionPage: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'setup' | 'inspection' | 'results' | 'review'>('setup');
  const [inspectionData, setInspectionData] = useState<InspectionData>({
    batchCode: '',
    productType: '',
    inspector: user?.first_name + ' ' + user?.last_name || '',
    date: new Date().toISOString().split('T')[0],
    template: '',
    standards: []
  });
  const [defects, setDefects] = useState<DefectItem[]>([]);
  const [aiAnalysisRunning, setAiAnalysisRunning] = useState(false);
  const [overallScore, setOverallScore] = useState<number | null>(null);

  const inspectionTemplates = [
    { id: 'IT001', name: 'Standard Fabric Inspection', type: 'hybrid', duration: '15 min' },
    { id: 'IT002', name: 'AI Visual Defect Detection', type: 'ai', duration: '5 min' },
    { id: 'IT003', name: 'Manual Color Assessment', type: 'manual', duration: '20 min' },
    { id: 'IT004', name: 'Comprehensive Quality Check', type: 'hybrid', duration: '25 min' }
  ];

  const qualityStandards = [
    { id: 'QS001', name: 'Cotton Fabric Quality Standard' },
    { id: 'QS002', name: 'Yarn Strength Requirements' },
    { id: 'QS003', name: 'Color Consistency Standards' },
    { id: 'QS004', name: 'Textile Finishing Standards' }
  ];

  const defectTypes = [
    'Stain', 'Tear', 'Hole', 'Color Variation', 'Weave Defect', 
    'Threading Issue', 'Density Variation', 'Finish Defect', 'Other'
  ];

  const runAiAnalysis = async () => {
    setAiAnalysisRunning(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock AI results
    const aiDefects: DefectItem[] = [
      {
        id: 'AI001',
        type: 'Color Variation',
        severity: 'medium',
        location: 'Section A2, 15cm from edge',
        description: 'Slight color inconsistency detected in dyed area'
      },
      {
        id: 'AI002', 
        type: 'Weave Defect',
        severity: 'low',
        location: 'Section B1, center',
        description: 'Minor weave irregularity identified'
      }
    ];
    
    setDefects(prev => [...prev, ...aiDefects]);
    setOverallScore(92.5);
    setAiAnalysisRunning(false);
  };

  const addManualDefect = () => {
    const newDefect: DefectItem = {
      id: `MAN${Date.now()}`,
      type: 'Stain',
      severity: 'medium',
      location: '',
      description: ''
    };
    setDefects(prev => [...prev, newDefect]);
  };

  const updateDefect = (id: string, field: keyof DefectItem, value: string) => {
    setDefects(prev => prev.map(defect => 
      defect.id === id ? { ...defect, [field]: value } : defect
    ));
  };

  const removeDefect = (id: string) => {
    setDefects(prev => prev.filter(defect => defect.id !== id));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const calculateScore = () => {
    if (defects.length === 0) return 100;
    
    const severityWeights = { critical: 20, high: 10, medium: 5, low: 2 };
    const totalDeduction = defects.reduce((sum, defect) => 
      sum + (severityWeights[defect.severity] || 0), 0
    );
    
    return Math.max(0, 100 - totalDeduction);
  };

  if (!user || user.role !== 'inspector') {
    return <div>Access denied.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <InspectorSidebar />
        
        <main className="flex-1 ml-64">
          <Header title="New Quality Inspection" />
          
          <div className="p-6">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[
                  { key: 'setup', label: 'Setup', icon: FileText },
                  { key: 'inspection', label: 'Inspection', icon: Eye },
                  { key: 'results', label: 'Results', icon: BarChart3 },
                  { key: 'review', label: 'Review', icon: CheckCircle }
                ].map(({ key, label, icon: Icon }, index) => (
                  <div key={key} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep === key 
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      currentStep === key ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      {label}
                    </span>
                    {index < 3 && (
                      <div className="w-16 h-px bg-gray-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Setup Step */}
            {currentStep === 'setup' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Inspection Setup</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Batch Code *
                      </label>
                      <input
                        type="text"
                        value={inspectionData.batchCode}
                        onChange={(e) => setInspectionData(prev => ({ ...prev, batchCode: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter batch code (e.g., BAT-2025-0345)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Type *
                      </label>
                      <select
                        value={inspectionData.productType}
                        onChange={(e) => setInspectionData(prev => ({ ...prev, productType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select product type</option>
                        <option value="Cotton Fabric">Cotton Fabric</option>
                        <option value="Dyed Fabric">Dyed Fabric</option>
                        <option value="Cotton Yarn">Cotton Yarn</option>
                        <option value="Blended Fabric">Blended Fabric</option>
                        <option value="Printed Fabric">Printed Fabric</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inspection Template *
                      </label>
                      <div className="space-y-2">
                        {inspectionTemplates.map(template => (
                          <div key={template.id} className="flex items-center">
                            <input
                              type="radio"
                              id={template.id}
                              name="template"
                              value={template.id}
                              checked={inspectionData.template === template.id}
                              onChange={(e) => setInspectionData(prev => ({ ...prev, template: e.target.value }))}
                              className="text-orange-600 focus:ring-orange-500"
                            />
                            <label htmlFor={template.id} className="ml-2 flex items-center gap-2">
                              <span className="font-medium">{template.name}</span>
                              <Badge variant="info" size="sm">{template.type}</Badge>
                              <span className="text-sm text-gray-500">({template.duration})</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quality Standards
                      </label>
                      <div className="space-y-2">
                        {qualityStandards.map(standard => (
                          <div key={standard.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={standard.id}
                              checked={inspectionData.standards.includes(standard.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setInspectionData(prev => ({ 
                                    ...prev, 
                                    standards: [...prev.standards, standard.id] 
                                  }));
                                } else {
                                  setInspectionData(prev => ({ 
                                    ...prev, 
                                    standards: prev.standards.filter(id => id !== standard.id) 
                                  }));
                                }
                              }}
                              className="text-orange-600 focus:ring-orange-500"
                            />
                            <label htmlFor={standard.id} className="ml-2">
                              {standard.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="secondary">
                      Cancel
                    </Button>
                    <Button 
                      variant="primary"
                      onClick={() => setCurrentStep('inspection')}
                      disabled={!inspectionData.batchCode || !inspectionData.productType || !inspectionData.template}
                    >
                      Start Inspection
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Inspection Step */}
            {currentStep === 'inspection' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Inspection Tools */}
                  <div className="lg:col-span-1">
                    <Card padding="lg">
                      <h3 className="font-semibold text-gray-900 mb-4">Inspection Tools</h3>
                      
                      <div className="space-y-3">
                        <Button 
                          variant="primary" 
                          className="w-full justify-start"
                          onClick={runAiAnalysis}
                          disabled={aiAnalysisRunning}
                        >
                          <Zap className="mr-2" size={16} />
                          {aiAnalysisRunning ? 'Running AI Analysis...' : 'Run AI Analysis'}
                        </Button>
                        
                        <Button variant="secondary" className="w-full justify-start">
                          <Camera className="mr-2" size={16} />
                          Camera Inspection
                        </Button>
                        
                        <Button variant="secondary" className="w-full justify-start">
                          <Upload className="mr-2" size={16} />
                          Upload Images
                        </Button>
                        
                        <Button 
                          variant="secondary" 
                          className="w-full justify-start"
                          onClick={addManualDefect}
                        >
                          <Target className="mr-2" size={16} />
                          Add Manual Defect
                        </Button>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Current Score</h4>
                        <div className="text-2xl font-bold text-orange-600">
                          {overallScore !== null ? `${overallScore}%` : calculateScore() + '%'}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Defects List */}
                  <div className="lg:col-span-2">
                    <Card padding="lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Detected Defects</h3>
                        <Badge variant="info" size="sm">
                          {defects.length} defects found
                        </Badge>
                      </div>

                      {aiAnalysisRunning && (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2 animate-pulse" />
                            <p className="text-gray-600">AI analysis in progress...</p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {defects.map((defect) => (
                          <div key={defect.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant={getSeverityColor(defect.severity) as any} size="sm">
                                  {defect.severity}
                                </Badge>
                                <span className="font-medium">{defect.type}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeDefect(defect.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Type
                                </label>
                                <select
                                  value={defect.type}
                                  onChange={(e) => updateDefect(defect.id, 'type', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                >
                                  {defectTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Severity
                                </label>
                                <select
                                  value={defect.severity}
                                  onChange={(e) => updateDefect(defect.id, 'severity', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                  <option value="critical">Critical</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Location
                                </label>
                                <input
                                  type="text"
                                  value={defect.location}
                                  onChange={(e) => updateDefect(defect.id, 'location', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="e.g., Section A1, 10cm from edge"
                                />
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <textarea
                                value={defect.description}
                                onChange={(e) => updateDefect(defect.id, 'description', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                rows={2}
                                placeholder="Describe the defect..."
                              />
                            </div>
                          </div>
                        ))}

                        {defects.length === 0 && !aiAnalysisRunning && (
                          <div className="text-center py-8 text-gray-500">
                            <Target className="w-12 h-12 mx-auto mb-2" />
                            <p>No defects detected yet</p>
                            <p className="text-sm">Run AI analysis or add manual defects</p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setCurrentStep('setup')}>
                          Back
                        </Button>
                        <Button variant="primary" onClick={() => setCurrentStep('results')}>
                          Generate Results
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Additional steps (results, review) would be implemented similarly */}
            {currentStep === 'results' && (
              <div className="max-w-4xl mx-auto">
                <Card padding="lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Inspection Results</h2>
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Inspection Complete</h3>
                    <p className="text-gray-600 mb-4">
                      Quality Score: <span className="text-2xl font-bold text-orange-600">{calculateScore()}%</span>
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button variant="primary" onClick={() => setCurrentStep('review')}>
                        Review & Submit
                      </Button>
                      <Button variant="secondary">
                        Generate Report
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewInspectionPage;
