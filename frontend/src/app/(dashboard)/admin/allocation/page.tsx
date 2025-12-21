'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { allocationService, WorkforceAllocation, MaterialAllocation, AllocationStats, MaterialStats } from '../../../../../services/allocationService';
import AdminSidebar from '../../../../../components/layout/AdminSidebar';
import Header from '../../../../../components/layout/Header';
import AllocationReports from '../../../../../components/allocation/AllocationReports';
import { 
  Users, 
  Package, 
  Settings, 
  AlertTriangle, 
  TrendingUp,
  FileText,
  Plus,
  Filter,
  RefreshCw,
  Eye,
  Download,
  Calendar,
  BarChart3
} from 'lucide-react';
import AllocationDashboard from '../../../../../components/allocation/AllocationDashboard';
import WorkforceAllocationList from '../../../../../components/allocation/WorkforceAllocationList';
import MaterialAllocationList from '../../../../../components/allocation/MaterialAllocationList';
import AllocationForm from '../../../../../components/allocation/AllocationForm';

const AllocationPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'workforce' | 'material'>('workforce');

  // Data states
  const [workforceAllocations, setWorkforceAllocations] = useState<WorkforceAllocation[]>([]);
  const [materialAllocations, setMaterialAllocations] = useState<MaterialAllocation[]>([]);
  const [workforceStats, setWorkforceStats] = useState<AllocationStats | null>(null);
  const [materialStats, setMaterialStats] = useState<MaterialStats | null>(null);

  // Load data on component mount
  useEffect(() => {
    console.log('Allocation page useEffect triggered');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('authLoading:', authLoading);
    
    if (isAuthenticated && !authLoading) {
      console.log('Loading allocation data...');
      loadAllocationData();
    } else {
      console.log('Not loading data - auth state:', { isAuthenticated, authLoading });
    }
  }, [isAuthenticated, authLoading]);

  const loadAllocationData = async () => {
    try {
      console.log('loadAllocationData started');
      setLoading(true);
      setError(null);

      // Load workforce allocations
      const workforceResponse = await allocationService.getWorkforceAllocations({ page_size: 50 });
      if (workforceResponse.success && workforceResponse.data) {
        setWorkforceAllocations(workforceResponse.data.results || []);
        console.log('Workforce allocations loaded:', workforceResponse.data.results?.length);
      } else {
        console.error('Workforce allocations failed:', workforceResponse.message);
        setError(workforceResponse.message || 'Failed to load workforce allocations');
      }

      // Load material allocations
      const materialResponse = await allocationService.getMaterialAllocations({ page_size: 50 });
      if (materialResponse.success && materialResponse.data) {
        setMaterialAllocations(materialResponse.data.results || []);
        console.log('Material allocations loaded:', materialResponse.data.results?.length);
      } else {
        console.error('Material allocations failed:', materialResponse.message);
        setError(materialResponse.message || 'Failed to load material allocations');
      }

      // Load stats
      const [workforceStatsResponse, materialStatsResponse] = await Promise.all([
        allocationService.getWorkforceStats(),
        allocationService.getMaterialStats()
      ]);

      if (workforceStatsResponse.success) {
        setWorkforceStats(workforceStatsResponse.data);
      }

      if (materialStatsResponse.success) {
        setMaterialStats(materialStatsResponse.data);
      }

    } catch (err) {
      console.error('Failed to load allocation data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load allocation data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAllocation = (type: 'workforce' | 'material') => {
    setFormType(type);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    loadAllocationData(); // Refresh data after form closes
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center ml-[240px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading resource allocation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col items-center justify-center ml-[240px]">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access the resource allocation module.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-[240px]">
        <Header 
          userRole="admin"
          title="Resource Allocation"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Resource Allocation</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage workforce and material allocation across production batches
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => loadAllocationData()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                  <button 
                    onClick={() => handleCreateAllocation('workforce')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Allocate Staff
                  </button>
                  <button 
                    onClick={() => handleCreateAllocation('material')}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Allocate Material
                  </button>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
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

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
                  { id: 'workforce', name: 'Staff Allocation', icon: Users },
                  { id: 'materials', name: 'Material Allocation', icon: Package },
                  { id: 'reports', name: 'Reports', icon: FileText }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
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

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <AllocationDashboard 
                workforceStats={workforceStats}
                materialStats={materialStats}
                recentWorkforce={workforceAllocations.slice(0, 5)}
                recentMaterials={materialAllocations.slice(0, 5)}
                loading={loading}
              />
            )}

            {/* Workforce Tab */}
            {activeTab === 'workforce' && (
              <WorkforceAllocationList 
                allocations={workforceAllocations}
                onRefresh={loadAllocationData}
                loading={loading}
              />
            )}

            {/* Materials Tab */}
            {activeTab === 'materials' && (
              <MaterialAllocationList 
                allocations={materialAllocations}
                onRefresh={loadAllocationData}
                loading={loading}
              />
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <AllocationReports 
                workforceStats={workforceStats}
                materialStats={materialStats}
                workforceAllocations={workforceAllocations}
                materialAllocations={materialAllocations}
                loading={loading}
              />
            )}
          </div>
        </main>
      </div>

      {/* Allocation Form Modal */}
      {showForm && (
        <AllocationForm 
          type={formType}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default AllocationPage;
