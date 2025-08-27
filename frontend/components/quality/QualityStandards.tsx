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
  id: number;
  name: string;
  description: string;
  category: string;
  min_threshold: number;
  max_threshold: number;
  measurement_unit: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StandardFormData {
  name: string;
  description: string;
  category: string;
  min_threshold: number;
  max_threshold: number;
  measurement_unit: string;
  is_active: boolean;
}

const QualityStandards: React.FC = () => {
  const [standards, setStandards] = useState<QualityStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStandard, setEditingStandard] = useState<QualityStandard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState<StandardFormData>({
    name: '',
    description: '',
    category: '',
    min_threshold: 0,
    max_threshold: 100,
    measurement_unit: '',
    is_active: true
  });

  const categories = [
    'Dimensional',
    'Color',
    'Texture',
    'Weight',
    'Strength',
    'Appearance',
    'Defects'
  ];

  const units = [
    'mm',
    'cm',
    'inches',
    'grams',
    'kg',
    'percentage',
    'count',
    'ratio'
  ];

  useEffect(() => {
    loadStandards();
  }, []);

  const loadStandards = async () => {
    try {
      setLoading(true);
      const response = await qualityService.getQualityStandards();
      
      if (response.success) {
        setStandards(response.data.results || []);
      } else {
        setError(response.message || 'Failed to load quality standards');
      }
    } catch (err) {
      console.error('Failed to load standards:', err);
      setError(err instanceof Error ? err.message : 'Failed to load standards');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let response;
      if (editingStandard) {
        response = await qualityService.updateQualityStandard(editingStandard.id, formData);
      } else {
        response = await qualityService.createQualityStandard(formData);
      }

      if (response.success) {
        await loadStandards();
        resetForm();
        setShowForm(false);
      } else {
        setError(response.message || 'Failed to save standard');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save standard');
    }
  };

  const handleEdit = (standard: QualityStandard) => {
    setEditingStandard(standard);
    setFormData({
      name: standard.name,
      description: standard.description,
      category: standard.category,
      min_threshold: standard.min_threshold,
      max_threshold: standard.max_threshold,
      measurement_unit: standard.measurement_unit,
      is_active: standard.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
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
      name: '',
      description: '',
      category: '',
      min_threshold: 0,
      max_threshold: 100,
      measurement_unit: '',
      is_active: true
    });
    setEditingStandard(null);
  };

  const filteredStandards = standards.filter(standard => {
    const matchesSearch = standard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         standard.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || standard.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
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
                      <h5 className="text-lg font-medium text-gray-900">{standard.name}</h5>
                      {standard.is_active ? (
                        <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400 ml-2" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{standard.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Category:</span>
                        <p className="text-gray-600">{standard.category}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Range:</span>
                        <p className="text-gray-600">
                          {standard.min_threshold} - {standard.max_threshold} {standard.measurement_unit}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Unit:</span>
                        <p className="text-gray-600">{standard.measurement_unit}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <p className={`font-medium ${standard.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                          {standard.is_active ? 'Active' : 'Inactive'}
                        </p>
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
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Threshold *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.min_threshold}
                    onChange={(e) => setFormData({...formData, min_threshold: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Threshold *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.max_threshold}
                    onChange={(e) => setFormData({...formData, max_threshold: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    required
                    value={formData.measurement_unit}
                    onChange={(e) => setFormData({...formData, measurement_unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select Unit</option>
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active standard
                </label>
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
