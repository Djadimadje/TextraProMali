'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useActivityTracker } from '../../../../hooks/useActivityTracker';
import AdminSidebar from '../../../../../components/layout/AdminSidebar';
import Header from '../../../../../components/layout/Header';
import MachineStatsCards from './components/MachineStatsCards';
import SearchAndFilters from './components/SearchAndFilters';
import MachineTable from './components/MachineTable';
import MachineFormModal from './components/MachineFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ExportModal from './components/ExportModal';
import MaintenanceScheduleModal from './components/MaintenanceScheduleModal';
import { 
  machineService, 
  Machine, 
  MachineStats as ApiMachineStats,
  MachineCreateData,
  MachineUpdateData,
  MachineType
} from '../../../../../services/machineService';

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface MachineStats extends ApiMachineStats {
  maintenance_due_count: number;
}

const MachinesPage: React.FC = () => {
  useActivityTracker();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machineStats, setMachineStats] = useState<MachineStats | null>(null);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [operators, setOperators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Show notification and auto-hide after 3 seconds
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (user && user.role !== 'admin') {
        router.push(`/${user.role}`);
        return;
      }
      if (user && user.role === 'admin') {
        loadMachineData();
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadMachineData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== STARTING MACHINE DATA LOAD ===');
      
      // Build filters object
      const filters = {
        search: searchTerm || undefined,
        operational_status: statusFilter || undefined,
        machine_type: typeFilter || undefined,
        ordering: '-created_at',
        page_size: 100
      };

      console.log('Loading machines with filters:', filters);

      // Load machines first
      console.log('Calling machineService.getMachines...');
      const machinesResponse = await machineService.getMachines(filters);
      console.log('Machines response received:', machinesResponse);
      console.log('Response success:', machinesResponse?.success);
      console.log('Response data:', machinesResponse?.data);
      console.log('Response data type:', typeof machinesResponse?.data);
      console.log('Response data keys:', machinesResponse?.data ? Object.keys(machinesResponse.data) : 'No data');
      console.log('Has results property:', machinesResponse?.data && 'results' in machinesResponse.data);
      console.log('Is data array:', Array.isArray(machinesResponse?.data));
      console.log('Results array:', machinesResponse?.data?.results);
      console.log('Results length:', machinesResponse?.data?.results?.length);
      console.log('Count from API:', machinesResponse?.data?.count);

      if (machinesResponse && machinesResponse.success) {
        // Handle successful response
        let machineList: Machine[] = [];
        
        if (Array.isArray(machinesResponse.data)) {
          // Data is directly an array
          console.log('Data is direct array');
          machineList = machinesResponse.data;
        } else if (machinesResponse.data && machinesResponse.data.results) {
          // Data has a results property
          console.log('Data has results property');
          machineList = machinesResponse.data.results;
        } else if (machinesResponse.data) {
          // Data exists but structure is different
          console.log('Unexpected data structure:', machinesResponse.data);
          machineList = [];
        }
        
        console.log('Final machine list:', machineList);
        console.log('Machine list length:', machineList.length);
        setMachines(machineList);
        
        // Calculate stats from loaded machines
        const stats: MachineStats = {
          total_machines: machineList.length,
          active_machines: machineList.filter(m => m.status === 'active').length,
          running_machines: machineList.filter(m => m.operational_status === 'running').length,
          idle_machines: machineList.filter(m => m.operational_status === 'idle').length,
          maintenance_machines: machineList.filter(m => m.operational_status === 'maintenance').length,
          breakdown_machines: machineList.filter(m => m.operational_status === 'breakdown').length,
          offline_machines: machineList.filter(m => m.operational_status === 'offline').length,
          by_type: {},
          by_location: {},
          by_operator: {},
          average_operating_hours: machineList.length > 0 
            ? machineList.reduce((sum, m) => sum + m.total_operating_hours, 0) / machineList.length 
            : 0,
          maintenance_due_count: machineList.filter(m => m.needs_maintenance === true).length
        };
        
        console.log('Calculated stats:', stats);
        setMachineStats(stats);
      } else {
        console.log('Machine response not successful:', machinesResponse);
        throw new Error(machinesResponse?.message || 'Failed to load machines');
      }

      // Load machine types and operators (mock data for now)
      // Fetch machine types from API
      try {
        const machineTypesResponse = await fetch('http://localhost:8000/api/v1/machines/machine-types/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (machineTypesResponse.ok) {
          const machineTypesData = await machineTypesResponse.json();
          console.log('Machine types from API:', machineTypesData);
          setMachineTypes(machineTypesData.results || machineTypesData);
        } else {
          console.error('Failed to fetch machine types');
          // Fallback to mock data
          const mockMachineTypes: MachineType[] = [
            { 
              id: '1', 
              name: 'Weaving Loom', 
              description: 'Industrial weaving equipment',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            { 
              id: '2', 
              name: 'Cotton Spinner', 
              description: 'Cotton spinning machinery',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            { 
              id: '3', 
              name: 'Cotton Gin', 
              description: 'Cotton processing equipment',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            { 
              id: '4', 
              name: 'Dyeing Machine', 
              description: 'Textile dyeing equipment',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          setMachineTypes(mockMachineTypes);
        }
      } catch (error) {
        console.error('Error fetching machine types:', error);
        // Fallback to mock data
        const mockMachineTypes: MachineType[] = [
          { 
            id: '1', 
            name: 'Weaving Loom', 
            description: 'Industrial weaving equipment',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { 
            id: '2', 
            name: 'Cotton Spinner', 
            description: 'Cotton spinning machinery',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { 
            id: '3', 
            name: 'Cotton Gin', 
            description: 'Cotton processing equipment',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { 
            id: '4', 
            name: 'Dyeing Machine', 
            description: 'Textile dyeing equipment',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setMachineTypes(mockMachineTypes);
      }
      
      // Mock operators for now
      const mockOperators: User[] = [
        { id: '1', username: 'operator1', first_name: 'John', last_name: 'Smith', role: 'operator' },
        { id: '2', username: 'operator2', first_name: 'Jane', last_name: 'Doe', role: 'operator' },
        { id: '3', username: 'operator3', first_name: 'Mike', last_name: 'Johnson', role: 'operator' }
      ];
      
      setOperators(mockOperators);

      console.log('=== MACHINE DATA LOAD COMPLETED ===');

    } catch (err: any) {
      console.error('Error loading machines:', err);
      
      // Don't show "success" messages as errors
      if (err.message && err.message.includes('successfully')) {
        console.log('Machines loaded successfully but caught in error block:', err.message);
        // Don't set error for success messages
        return;
      }
      
      setError(`Error loading machines: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Reload data when filters change
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadMachineData();
    }
  }, [searchTerm, statusFilter, typeFilter, locationFilter, operatorFilter, user]);

  const handleAddMachine = () => {
    setSelectedMachine(null);
    setShowCreateModal(true);
  };

  const handleEditMachine = (machine: Machine) => {
    setSelectedMachine(machine);
    setShowEditModal(true);
  };

  const handleDeleteMachine = (machine: Machine) => {
    setSelectedMachine(machine);
    setShowDeleteConfirm(true);
  };

  const handleViewMachine = (machine: Machine) => {
    // Navigate to machine detail page or show detail modal
    console.log('View machine:', machine);
    // router.push(`/admin/machines/${machine.id}`);
  };

  const handleScheduleMaintenance = (machine: Machine) => {
    setSelectedMachine(machine);
    setShowMaintenanceModal(true);
  };

  const handleMachineSaved = async (machineData: MachineCreateData | MachineUpdateData) => {
    try {
      if (selectedMachine) {
        // Update existing machine
        const updateData: MachineUpdateData = {
          machine_id: machineData.machine_id,
          name: machineData.name,
          machine_type: typeof machineData.machine_type === 'string' 
            ? machineData.machine_type 
            : machineData.machine_type || '',
          operational_status: machineData.operational_status,
          building: machineData.building,
          floor: machineData.floor,
          primary_operator: machineData.primary_operator,
          notes: machineData.notes
        };
        
        const response = await machineService.updateMachine(selectedMachine.id, updateData);
        if (response.success) {
          // Update local state
          setMachines(prev => prev.map(m => m.id === selectedMachine.id ? response.data : m));
          
          // Close modal and clear selection
          setShowEditModal(false);
          setSelectedMachine(null);
          
          // Show success message
          showNotification('Machine updated successfully!', 'success');
          
          // Reload data to ensure fresh state
          await loadMachineData();
        } else {
          throw new Error(response.message || 'Failed to update machine');
        }
      } else {
        // Create new machine
        const createData: MachineCreateData = {
          machine_id: machineData.machine_id || '',
          name: machineData.name || '',
          machine_type: typeof machineData.machine_type === 'string' 
            ? machineData.machine_type 
            : machineData.machine_type || '',
          operational_status: machineData.operational_status || 'idle',
          building: machineData.building,
          floor: machineData.floor,
          primary_operator: machineData.primary_operator,
          notes: machineData.notes,
          site_code: 'SITE001' // Default site code
        };
        
        console.log('Creating machine with data:', createData);
        const response = await machineService.createMachine(createData);
        console.log('Machine creation response:', response);
        
        if (response.success) {
          console.log('Machine created successfully:', response.data);
          
          // Close modal and clear selection
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedMachine(null);
          
          // Show success message
          showNotification('Machine created successfully!', 'success');
          
          // Reload data to get the fresh machine
          console.log('Reloading machine data to reflect new machine...');
          await loadMachineData();
          console.log('Machine data reloaded successfully');
          
        } else {
          throw new Error(response.message || 'Failed to create machine');
        }
      }

    } catch (err: any) {
      console.error('Error saving machine:', err);
      
      // Extract detailed error information
      let errorMessage = 'Unknown error occurred';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.errors) {
          // Format validation errors
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          errorMessage = `Validation errors:\n${errorMessages}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = JSON.stringify(errorData, null, 2);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showNotification(`Error saving machine: ${errorMessage}`, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedMachine) {
      try {
        const response = await machineService.deleteMachine(selectedMachine.id);
        if (response.success) {
          // Remove from local state
          setMachines(prev => prev.filter(m => m.id !== selectedMachine.id));
          setShowDeleteConfirm(false);
          setSelectedMachine(null);
          
          // Reload data to get fresh stats
          await loadMachineData();
        } else {
          throw new Error(response.message || 'Failed to delete machine');
        }
      } catch (err: any) {
        console.error('Error deleting machine:', err);
        alert(`Error deleting machine: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleExportMachines = () => {
    setShowExportModal(true);
  };

  const handleRefresh = async () => {
    console.log('Refreshing machine data...');
    await loadMachineData();
    console.log('Machine data refreshed successfully');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading machines...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => loadMachineData()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-[240px]">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Notification Toast */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-medium ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              <div className="flex items-center gap-2">
                <span>{notification.type === 'success' ? '✅' : '❌'}</span>
                {notification.message}
              </div>
            </div>
          )}
          
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Machines Monitoring</h1>
                <p className="text-gray-600">Monitor and manage your textile production machines.</p>
              </div>
              <button 
                onClick={handleAddMachine}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <span className="text-lg">➕</span>
                Add Machine
              </button>
            </div>

            {/* Stats Cards */}
            {machineStats && <MachineStatsCards stats={machineStats} />}
            
            {/* Search and Filters */}
            <SearchAndFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              operatorFilter={operatorFilter}
              setOperatorFilter={setOperatorFilter}
              onExportMachines={handleExportMachines}
              onAddMachine={handleAddMachine}
              onRefresh={handleRefresh}
              machineTypes={machineTypes.map(mt => mt.name)}
              locations={['Building A', 'Building B', 'Building C']}
              operators={operators.map(op => `${op.first_name} ${op.last_name}`)}
            />
            
            {/* Machine Table */}
            <MachineTable 
              machines={machines}
              onEditMachine={handleEditMachine}
              onDeleteMachine={handleDeleteMachine}
              onViewMachine={handleViewMachine}
              onScheduleMaintenance={handleScheduleMaintenance}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      <MachineFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleMachineSaved}
        machine={null}
        machineTypes={machineTypes}
        operators={operators}
      />

      <MachineFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleMachineSaved}
        machine={selectedMachine}
        machineTypes={machineTypes}
        operators={operators}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        machine={selectedMachine}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        machines={machines}
      />

      <MaintenanceScheduleModal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        machine={selectedMachine}
        onSchedule={async () => {
          await loadMachineData(); // Refresh data after scheduling maintenance
        }}
      />
    </div>
  );
};

export default MachinesPage;
