'use client';

import React, { useState, useEffect } from 'react';
import { qualityService } from '../../services/qualityService';
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';

interface QualityStandard {
  id: string;
  product_type: string;
  max_defects_per_batch: number;
  critical_defect_tolerance: number;
  quality_threshold: number;
  thread_count_min?: number | null;
  thread_count_max?: number | null;
  weight_tolerance: number;
  color_fastness_grade: string;
  created_at: string;
  updated_at: string;
}

interface StandardFormData {
  product_type: string;
  max_defects_per_batch: number;
  critical_defect_tolerance: number;
  quality_threshold: number;
  thread_count_min?: number | null;
  thread_count_max?: number | null;
  weight_tolerance: number;
  color_fastness_grade: string;
}

const QualityStandards: React.FC = () => {
  const [standards, setStandards] = useState<QualityStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStandard, setEditingStandard] = useState<QualityStandard | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState<StandardFormData>({
    product_type: '',
    max_defects_per_batch: 5,
    critical_defect_tolerance: 0,
    quality_threshold: 0.95,
    thread_count_min: undefined,
    thread_count_max: undefined,
    weight_tolerance: 0.05,
    color_fastness_grade: '4-5'
  });

  const productTypeOptions = [
    { value: 'cotton_fabric', label: 'Cotton Fabric' },
    { value: 'cotton_yarn', label: 'Cotton Yarn' },
    { value: 'blended_fabric', label: 'Blended Fabric' },
    { value: 'dyed_fabric', label: 'Dyed Fabric' },
    { value: 'printed_fabric', label: 'Printed Fabric' }
  ];

  const loadStandards = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await qualityService.getQualityStandards();
      const list = (resp as any)?.data?.results ?? (resp as any)?.data ?? [];
      setStandards(list);
    } catch (err) {
      console.error('Failed to load standards', err);
      setError(err instanceof Error ? err.message : 'Failed to load standards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStandards();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setError(null);

    try {
      if (editingStandard) {
        await qualityService.updateQualityStandard((editingStandard.id as any), formData as any);
      } else {
        await qualityService.createQualityStandard(formData);
      }

      await loadStandards();
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      // Prefer not to log full error stacks to the console in production UI flows.
      // Map backend field errors to user-friendly messages.
      if (err && err.errors && typeof err.errors === 'object') {
        const fieldErrors: Record<string, string> = {};
        Object.entries(err.errors).forEach(([k, v]) => {
          let text = '';
          if (Array.isArray(v)) text = v.join(' ');
          else if (typeof v === 'string') text = v;
          else text = JSON.stringify(v);

          // Friendly rewrite for a common uniqueness error
          if (k === 'product_type' && /already exists/i.test(text)) {
            fieldErrors[k] = 'A quality standard for this product type already exists.';
          } else {
            fieldErrors[k] = text;
          }
        });
        setFormErrors(fieldErrors);
      } else {
        // Show a concise message only
        const msg = err instanceof Error ? err.message : 'Failed to save standard';
        setError(msg);
      }
    }
  };

  const handleEdit = (standard: QualityStandard) => {
                // setError(err instanceof Error ? err.message : 'Failed to save standard');
    setFormData({
      product_type: standard.product_type || '',
      max_defects_per_batch: standard.max_defects_per_batch ?? 5,
      critical_defect_tolerance: standard.critical_defect_tolerance ?? 0,
      quality_threshold: standard.quality_threshold ?? 0.95,
      thread_count_min: standard.thread_count_min ?? undefined,
      thread_count_max: standard.thread_count_max ?? undefined,
      weight_tolerance: standard.weight_tolerance ?? 0.05,
      color_fastness_grade: standard.color_fastness_grade ?? '4-5'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this standard?')) {
      return;
    }

    try {
      const response = await qualityService.deleteQualityStandard(id);
      if (response.success) {
        await loadStandards();
      } else {
        setError(response.message || 'Failed to delete standard');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete standard');
    }
  };

  const resetForm = () => {
    setFormData({
      product_type: '',
      max_defects_per_batch: 5,
      critical_defect_tolerance: 0,
      quality_threshold: 0.95,
      thread_count_min: undefined,
      thread_count_max: undefined,
      weight_tolerance: 0.05,
      color_fastness_grade: '4-5'
    });
    setEditingStandard(null);
  };

  const filteredStandards = (() => {
    const lowerSearch = (searchTerm || '').trim().toLowerCase();
    return standards.filter(standard => {
      const product = (standard.product_type ?? '').toString();
      const display = product; // could map to label if needed

      const matchesSearch = !lowerSearch || product.toLowerCase().includes(lowerSearch) || display.toLowerCase().includes(lowerSearch) || (standard.color_fastness_grade ?? '').toLowerCase().includes(lowerSearch);
      const matchesFilter = !filterCategory || standard.product_type === filterCategory;
      return matchesSearch && matchesFilter;
    });
  })();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Quality Standards</h3>
            <p className="text-sm text-gray-500">Define and manage quality control standards</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md text-sm font-medium hover:bg-violet-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Standard
          </button>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search standards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Product Types</option>
            {productTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standards List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900">
            Standards ({filteredStandards.length})
          </h4>
        </div>

        {filteredStandards.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No quality standards found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredStandards.map((standard) => (
              <div key={standard.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h5 className="text-lg font-medium text-gray-900">{productTypeOptions.find(p => p.value === standard.product_type)?.label || standard.product_type}</h5>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Max Defects:</span>
                        <p className="text-gray-600">{standard.max_defects_per_batch}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Critical Tolerance:</span>
                        <p className="text-gray-600">{standard.critical_defect_tolerance}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Quality Threshold:</span>
                        <p className="text-gray-600">{standard.quality_threshold}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Color Grade:</span>
                        <p className="text-gray-600">{standard.color_fastness_grade}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(standard)}
                      className="p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-md"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(standard.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingStandard ? 'Edit Standard' : 'New Standard'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type *
                  </label>
                  <select
                    required
                    value={formData.product_type}
                    onChange={(e) => setFormData({...formData, product_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select Product Type</option>
                    {productTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {formErrors.product_type && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.product_type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Defects Per Batch</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.max_defects_per_batch}
                    onChange={(e) => setFormData({...formData, max_defects_per_batch: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md text-sm font-medium hover:bg-violet-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingStandard ? 'Update' : 'Create'} Standard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityStandards;
