'use client';

import React, { useState, useEffect } from 'react';
import { qualityService, QualityCheck } from '../../services/qualityService';
import { workflowService } from '../../services/workflowService';
import BatchAutocomplete from './BatchAutocomplete';
import { exportService } from '../../services/exportService';
import ExportButton from '../common/ExportButton';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye,
  Filter,
  Calendar,
  Search,
  Download,
  Plus
} from 'lucide-react';

interface QualityChecksProps {
  onNewCheck?: () => void;
}

const QualityChecks: React.FC<QualityChecksProps> = ({ onNewCheck }) => {
  const [checks, setChecks] = useState<QualityCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    check_type: '',
    date_from: '',
    date_to: '',
    search: ''
  });
  const [selectedCheck, setSelectedCheck] = useState<QualityCheck | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showNewCheckModal, setShowNewCheckModal] = useState(false);
  const [newCheckForm, setNewCheckForm] = useState({
    batch_code: '',
    check_type: 'visual',
    comments: '',
    image: null as File | null
  });
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [batchOptions, setBatchOptions] = useState<Array<{ id: string; batch_code: string }>>([]);

  // Helper functions to extract values from the service QualityCheck type
  const getBatchCode = (check: QualityCheck): string => {
    return check.batch?.batch_code || 'N/A';
  };

  const getInspectorName = (check: QualityCheck): string => {
    return check.inspector ? `${check.inspector.first_name} ${check.inspector.last_name}`.trim() : 'Unknown';
  };

  const getCheckType = (check: QualityCheck): string => {
    // Map severity or use comments to determine check type, or default to 'visual'
    return 'visual'; // Default since this field doesn't exist in service type
  };

  const getDefectsFound = (check: QualityCheck): number => {
    return check.defect_detected ? 1 : 0; // Convert boolean to count
  };

  const getAIConfidence = (check: QualityCheck): number => {
    return check.ai_confidence_score || 0;
  };

  const getStatus = (check: QualityCheck): 'passed' | 'failed' | 'warning' => {
    if (check.status === 'approved') return 'passed';
    if (check.status === 'rejected') return 'failed';
    if (check.defect_detected) return 'failed';
    return 'passed';
  };

  useEffect(() => {
    loadQualityChecks();
  }, [filters]);

  useEffect(() => {
    // Load recent batches to populate dropdown for new checks
    const loadBatches = async () => {
      try {
        const resp = await workflowService.getBatchWorkflows({ page_size: 100, ordering: '-created_at' });
        const results = (resp as any)?.data?.results ?? (resp as any)?.results ?? [];
        setBatchOptions(results.map((b: any) => ({ id: b.id, batch_code: b.batch_code })));
      } catch (err) {
        console.error('Failed to load batch options for quality checks:', err);
        setBatchOptions([]);
      }
    };

    loadBatches();
  }, []);

  const loadQualityChecks = async () => {
    try {
      setLoading(true);
      const response = await qualityService.getQualityChecks({
        page_size: 50,
        ...filters
      });
      
      if (response.success) {
        setChecks(response.data.results || []);
      } else {
        setError(response.message || 'Failed to load quality checks');
      }
    } catch (err) {
      console.error('Failed to load quality checks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quality checks');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'passed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      check_type: '',
      date_from: '',
      date_to: '',
      search: ''
    });
  };

  const handleNewCheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCheckForm.batch_code || !newCheckForm.image) {
      alert('Please provide batch code and image');
      return;
    }

    try {
      // Use selected batch (from autocomplete) if available
      const resolvedBatchCode = selectedBatch || newCheckForm.batch_code;

      if (!resolvedBatchCode) {
        alert('Please select a valid batch before creating the quality check.');
        return;
      }

      const response = await qualityService.createQualityCheck({
        batch: resolvedBatchCode,
        image: newCheckForm.image,
        defect_detected: false,
        severity: 'low',
        comments: newCheckForm.comments,
        ai_analysis_requested: true
      });

      if (response.success) {
        // Reset form and close modal
        setNewCheckForm({
          batch_code: '',
          check_type: 'visual',
          comments: '',
          image: null
        });
        setShowNewCheckModal(false);
        
        // Reload checks
        await loadQualityChecks();
        
        if (onNewCheck) {
          onNewCheck();
        }
        
        alert('Quality check created successfully!');
      }
    } catch (err) {
      console.error('Failed to create quality check:', err);
      let errorMessage = 'Failed to create quality check';
      
      if (err instanceof Error) {
        if (err.message.includes('batch')) {
          errorMessage = 'Invalid batch code. Please check the batch code exists.';
        } else {
          errorMessage = err.message;
        }
      }
      
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Batch code, inspector..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Status</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="warning">Warning</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check Type</label>
            <select
              value={filters.check_type}
              onChange={(e) => handleFilterChange('check_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Types</option>
              <option value="visual">Visual Inspection</option>
              <option value="dimensional">Dimensional Check</option>
              <option value="color">Color Consistency</option>
              <option value="texture">Texture Analysis</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear Filters
          </button>
          <div className="flex space-x-2">
            <ExportButton
              data={checks.map(check => ({
                'batch_code': getBatchCode(check),
                'check_type': getCheckType(check),
                'status': getStatus(check),
                'defects_found': getDefectsFound(check),
                'ai_confidence': `${getAIConfidence(check)}%`,
                'inspector_name': getInspectorName(check),
                'created_at': new Date(check.created_at).toLocaleDateString(),
                'severity': check.severity || 'N/A',
                'comments': check.comments || ''
              }))}
              filename={`quality_checks_${new Date().toISOString().split('T')[0]}`}
              title="Quality Checks Export"
              headers={exportService.getQualityChecksHeaders()}
              className="mr-2"
            />
            {onNewCheck && (
              <button
                onClick={() => setShowNewCheckModal(true)}
                className="inline-flex items-center px-3 py-2 bg-violet-600 text-white rounded-md text-sm font-medium hover:bg-violet-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Check
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Quality Checks ({checks.length})
          </h3>
        </div>
        
        {error ? (
          <div className="p-6">
            <div className="flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        ) : checks.length === 0 ? (
          <div className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No quality checks found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Defects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {checks.map((check) => (
                  <tr key={check.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getBatchCode(check)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCheckType(check)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(getStatus(check))}
                        <span className={`ml-2 ${getStatusBadge(getStatus(check))}`}>
                          {getStatus(check)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDefectsFound(check)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getAIConfidence(check)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getInspectorName(check)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(check.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedCheck(check);
                          setShowDetails(true);
                        }}
                        className="text-violet-600 hover:text-violet-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Check Modal */}
      {showNewCheckModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Create New Quality Check
              </h3>
              <button
                onClick={() => setShowNewCheckModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleNewCheckSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Code *
                  </label>
                  <select
                    value={selectedBatch || newCheckForm.batch_code}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSelectedBatch(v || null);
                      setNewCheckForm({...newCheckForm, batch_code: v});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select a batch...</option>
                    {batchOptions.map(opt => (
                      <option key={opt.id} value={opt.batch_code}>{opt.batch_code}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check Type *
                  </label>
                  <select
                    value={newCheckForm.check_type}
                    onChange={(e) => setNewCheckForm({...newCheckForm, check_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="visual">Visual Inspection</option>
                    <option value="dimensional">Dimensional Check</option>
                    <option value="color">Color Consistency</option>
                    <option value="texture">Texture Analysis</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setNewCheckForm({...newCheckForm, image: e.target.files?.[0] || null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, GIF (Max 10MB)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments
                </label>
                <textarea
                  rows={3}
                  value={newCheckForm.comments}
                  onChange={(e) => setNewCheckForm({...newCheckForm, comments: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Optional comments about the quality check"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewCheckModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 text-white rounded-md text-sm font-medium hover:bg-violet-700"
                >
                  Create Check
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedCheck && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Quality Check Details
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Batch Code</label>
                <p className="mt-1 text-sm text-gray-900">{getBatchCode(selectedCheck)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Check Type</label>
                <p className="mt-1 text-sm text-gray-900">{getCheckType(selectedCheck)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1 flex items-center">
                  {getStatusIcon(getStatus(selectedCheck))}
                  <span className={`ml-2 ${getStatusBadge(getStatus(selectedCheck))}`}>
                    {getStatus(selectedCheck)}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Defects Found</label>
                <p className="mt-1 text-sm text-gray-900">{getDefectsFound(selectedCheck)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">AI Confidence</label>
                <p className="mt-1 text-sm text-gray-900">{getAIConfidence(selectedCheck)}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Inspector</label>
                <p className="mt-1 text-sm text-gray-900">{getInspectorName(selectedCheck)}</p>
              </div>
            </div>
            
            {selectedCheck.image && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Inspection Image</label>
                <img 
                  src={selectedCheck.image} 
                  alt="Quality Check"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityChecks;
