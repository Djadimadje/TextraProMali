'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import InspectorSidebar from '../../../../../components/layout/InspectorSidebar';
import Header from '../../../../../components/layout/Header';
import Card from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import Badge from '../../../../../components/ui/Badge';
import ProgressBar from '../../../../../components/ui/ProgressBar';
import machineService, { 
  InspectorMachine, 
  CalibrationRecord, 
  InspectorMachineStats 
} from '../../../../services/machineService';
import { 
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  Eye,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Plus,
  Download,
  Power,
  Gauge,
  Thermometer,
  Zap,
  ChevronDown
} from 'lucide-react';

const MachinesPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'inspection' | 'calibration' | 'performance'>('overview');
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  
  // Real data from backend
  const [machines, setMachines] = useState<InspectorMachine[]>([]);
  const [calibrationRecords, setCalibrationRecords] = useState<CalibrationRecord[]>([]);
  const [machineStats, setMachineStats] = useState<InspectorMachineStats>({
    operational: 0,
    maintenance: 0,
    offline: 0,
    avgEfficiency: 0
  });
  const [error, setError] = useState<string | null>(null);

  // Handler functions for buttons
  const handleExportReport = (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `machine-report-${timestamp}`;
      
      if (format === 'csv') {
        exportAsCSV(filename);
      } else if (format === 'excel') {
        exportAsExcel(filename);
      } else if (format === 'pdf') {
        exportAsPDF(filename);
      }
      
      setShowExportDropdown(false);
    } catch (error) {
      console.error('Export failed:', error);
      setError(`Failed to export ${format.toUpperCase()} report. Please try again.`);
    }
  };

  const exportAsCSV = (filename: string) => {
    const csvHeaders = ['Machine Name', 'Type', 'Status', 'Location', 'Efficiency', 'Last Inspection', 'Next Maintenance'];
    const csvData = filteredMachines.map(machine => [
      machine.name,
      machine.type,
      machine.status,
      machine.location,
      `${machine.efficiency}%`,
      machine.lastInspection,
      machine.nextMaintenance
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `${filename}.csv`);
  };

  const exportAsExcel = (filename: string) => {
    // Create Excel-compatible HTML table
    const headers = ['Machine Name', 'Type', 'Status', 'Location', 'Efficiency', 'Temperature', 'Power', 'Defect Rate', 'Last Inspection', 'Next Maintenance'];
    
    let excelContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .status-operational { background-color: #d4edda; }
            .status-maintenance { background-color: #fff3cd; }
            .status-offline { background-color: #f8d7da; }
          </style>
        </head>
        <body>
          <h2>Machine Management Report - ${new Date().toLocaleDateString()}</h2>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
    `;

    filteredMachines.forEach(machine => {
      excelContent += `
        <tr class="status-${machine.status}">
          <td>${machine.name}</td>
          <td>${machine.type}</td>
          <td>${machine.status}</td>
          <td>${machine.location}</td>
          <td>${machine.efficiency}%</td>
          <td>${machine.temperature || 'N/A'}°C</td>
          <td>${machine.powerConsumption || 'N/A'} kW</td>
          <td>${machine.defectRate || 'N/A'}%</td>
          <td>${machine.lastInspection}</td>
          <td>${machine.nextMaintenance}</td>
        </tr>
      `;
    });

    excelContent += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    downloadFile(blob, `${filename}.xls`);
  };

  const exportAsPDF = (filename: string) => {
    // Create a printable HTML version for PDF
    const printContent = `
      <html>
        <head>
          <title>Machine Management Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
            .stat-card { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            .machines { margin-top: 30px; }
            .machine { border: 1px solid #ddd; margin-bottom: 15px; padding: 15px; border-radius: 8px; }
            .machine-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
            .machine-name { font-size: 18px; font-weight: bold; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .status-operational { background-color: #d4edda; color: #155724; }
            .status-maintenance { background-color: #fff3cd; color: #856404; }
            .status-offline { background-color: #f8d7da; color: #721c24; }
            .machine-details { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
            .detail { text-align: center; }
            .detail-label { font-size: 12px; color: #666; }
            .detail-value { font-weight: bold; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Machine Management Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} | Filter: ${filterStatus === 'all' ? 'All Machines' : filterStatus}</p>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <h3>Operational</h3>
              <div style="font-size: 24px; color: #28a745;">${machineStats.operational}</div>
            </div>
            <div class="stat-card">
              <h3>Maintenance</h3>
              <div style="font-size: 24px; color: #ffc107;">${machineStats.maintenance}</div>
            </div>
            <div class="stat-card">
              <h3>Offline</h3>
              <div style="font-size: 24px; color: #dc3545;">${machineStats.offline}</div>
            </div>
            <div class="stat-card">
              <h3>Avg Efficiency</h3>
              <div style="font-size: 24px; color: #007bff;">${machineStats.avgEfficiency.toFixed(1)}%</div>
            </div>
          </div>

          <div class="machines">
            <h2>Machine Details</h2>
            ${filteredMachines.map(machine => `
              <div class="machine">
                <div class="machine-header">
                  <span class="machine-name">${machine.name}</span>
                  <span class="status status-${machine.status}">${machine.status.toUpperCase()}</span>
                </div>
                <div class="machine-details">
                  <div class="detail">
                    <div class="detail-label">Type</div>
                    <div class="detail-value">${machine.type}</div>
                  </div>
                  <div class="detail">
                    <div class="detail-label">Location</div>
                    <div class="detail-value">${machine.location}</div>
                  </div>
                  <div class="detail">
                    <div class="detail-label">Efficiency</div>
                    <div class="detail-value">${machine.efficiency}%</div>
                  </div>
                  <div class="detail">
                    <div class="detail-label">Quality Impact</div>
                    <div class="detail-value">${machine.qualityImpact}</div>
                  </div>
                </div>
                ${machine.status === 'operational' ? `
                  <div class="machine-details" style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
                    <div class="detail">
                      <div class="detail-label">Temperature</div>
                      <div class="detail-value">${machine.temperature || 'N/A'}°C</div>
                    </div>
                    <div class="detail">
                      <div class="detail-label">Power</div>
                      <div class="detail-value">${machine.powerConsumption || 'N/A'} kW</div>
                    </div>
                    <div class="detail">
                      <div class="detail-label">Defect Rate</div>
                      <div class="detail-value">${machine.defectRate || 'N/A'}%</div>
                    </div>
                    <div class="detail">
                      <div class="detail-label">Last Inspection</div>
                      <div class="detail-value">${machine.lastInspection}</div>
                    </div>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    // Open print dialog for PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleScheduleInspection = () => {
    // Simple prompt for now - in a real app you'd have a modal
    const machineId = prompt('Enter Machine ID to schedule inspection:');
    if (machineId) {
      const machine = machines.find(m => m.id === machineId || m.name.toLowerCase().includes(machineId.toLowerCase()));
      if (machine) {
        alert(`Inspection scheduled for ${machine.name}. You will receive a confirmation email shortly.`);
      } else {
        alert('Machine not found. Please check the ID and try again.');
      }
    }
  };

  const handleScheduleCalibration = () => {
    const machineId = prompt('Enter Machine ID to schedule calibration:');
    if (machineId) {
      const machine = machines.find(m => m.id === machineId || m.name.toLowerCase().includes(machineId.toLowerCase()));
      if (machine) {
        alert(`Calibration scheduled for ${machine.name}. A technician will be assigned shortly.`);
      } else {
        alert('Machine not found. Please check the ID and try again.');
      }
    }
  };

  useEffect(() => {
    loadMachineData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportDropdown) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  const loadMachineData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load machines data
      const [machinesData, statsData, calibrationData] = await Promise.all([
        machineService.getMachinesForInspector(),
        machineService.getInspectorMachineStats(),
        machineService.getCalibrationRecords()
      ]);
      
      setMachines(machinesData);
      setMachineStats(statsData);
      setCalibrationRecords(calibrationData);
    } catch (err) {
      console.error('Error loading machine data:', err);
      setError('Failed to load machine data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-yellow-600" />;
      case 'offline':
        return <Power className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'success';
      case 'maintenance': return 'warning';
      case 'offline': return 'danger';
      default: return 'default';
    }
  };

  const getQualityImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const filteredMachines = filterStatus === 'all' 
    ? machines 
    : machines.filter(machine => machine.status === filterStatus);

  if (!user || user.role !== 'inspector') {
    return <div>Access denied.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <InspectorSidebar />
          <main className="flex-1 ml-64">
            <Header title="Machine Management" />
            <div className="p-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading machine data...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <InspectorSidebar />
          <main className="flex-1 ml-64">
            <Header title="Machine Management" />
            <div className="p-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                  <Button onClick={loadMachineData} variant="primary">
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <InspectorSidebar />
        
        <main className="flex-1 ml-64">
          <Header title="Machine Management" />
          
          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Machine Management</h1>
                <p className="text-gray-600 mt-1">
                  Monitor machine performance, schedule inspections, and manage calibration
                </p>
              </div>
              
              <div className="flex gap-3">
                <div className="relative">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                  >
                    <Download className="mr-2" size={16} />
                    Export Report
                    <ChevronDown className="ml-2" size={16} />
                  </Button>
                  
                  {showExportDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => handleExportReport('csv')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Export as CSV
                        </button>
                        <button
                          onClick={() => handleExportReport('excel')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Export as Excel
                        </button>
                        <button
                          onClick={() => handleExportReport('pdf')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Export as PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={handleScheduleInspection}
                >
                  <Plus className="mr-2" size={16} />
                  Schedule Inspection
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { key: 'overview', label: 'Overview', icon: BarChart3 },
                  { key: 'inspection', label: 'Machine Inspection', icon: Eye },
                  { key: 'calibration', label: 'Calibration', icon: Settings },
                  { key: 'performance', label: 'Performance', icon: Activity }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === key
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Operational</p>
                        <p className="text-2xl font-bold text-green-600">
                          {machineStats.operational}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Maintenance</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {machineStats.maintenance}
                        </p>
                      </div>
                      <Wrench className="w-8 h-8 text-yellow-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Offline</p>
                        <p className="text-2xl font-bold text-red-600">
                          {machineStats.offline}
                        </p>
                      </div>
                      <Power className="w-8 h-8 text-red-600" />
                    </div>
                  </Card>

                  <Card padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {machineStats.avgEfficiency.toFixed(1)}%
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-blue-600" />
                    </div>
                  </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Machines</option>
                    <option value="operational">Operational</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                {/* Machine List */}
                <div className="grid gap-6">
                  {filteredMachines.map((machine) => (
                    <Card key={machine.id} padding="lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {getStatusIcon(machine.status)}
                            <h3 className="font-semibold text-gray-900 text-lg">{machine.name}</h3>
                            <Badge variant={getStatusColor(machine.status) as any} size="sm">
                              {machine.status}
                            </Badge>
                            <Badge variant={getQualityImpactColor(machine.qualityImpact) as any} size="sm">
                              {machine.qualityImpact} impact
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <span className="text-sm text-gray-600">Type:</span>
                              <p className="font-medium">{machine.type}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Location:</span>
                              <p className="font-medium">{machine.location}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Last Inspection:</span>
                              <p className="font-medium">{machine.lastInspection}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">Next Maintenance:</span>
                              <p className="font-medium">{machine.nextMaintenance}</p>
                            </div>
                          </div>

                          {machine.status === 'operational' && (
                            <>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Gauge className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-gray-600">Efficiency</span>
                                  </div>
                                  <div className="text-lg font-bold text-blue-600">{machine.efficiency}%</div>
                                  <ProgressBar value={machine.efficiency} variant="success" className="h-2" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Thermometer className="w-4 h-4 text-red-600" />
                                    <span className="text-sm text-gray-600">Temperature</span>
                                  </div>
                                  <div className="text-lg font-bold text-gray-900">{machine.temperature}°C</div>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Zap className="w-4 h-4 text-yellow-600" />
                                    <span className="text-sm text-gray-600">Power</span>
                                  </div>
                                  <div className="text-lg font-bold text-gray-900">{machine.powerConsumption} kW</div>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                                    <span className="text-sm text-gray-600">Defect Rate</span>
                                  </div>
                                  <div className="text-lg font-bold text-orange-600">{machine.defectRate}%</div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedMachine(machine.id)}
                          >
                            <Eye className="mr-2" size={16} />
                            Inspect
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Calibration Tab */}
            {activeTab === 'calibration' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Equipment Calibration</h2>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={handleScheduleCalibration}
                  >
                    <Plus className="mr-2" size={16} />
                    Schedule Calibration
                  </Button>
                </div>

                <div className="grid gap-4">
                  {calibrationRecords.map((record) => {
                    const machine = machines.find(m => m.id === record.machineId);
                    return (
                      <Card key={record.id} padding="lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{machine?.name}</h3>
                              <Badge 
                                variant={record.status === 'completed' ? 'success' : record.status === 'pending' ? 'warning' : 'danger'} 
                                size="sm"
                              >
                                {record.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                              <span>Type: {record.type}</span>
                              <span>Date: {record.date}</span>
                              <span>Technician: {record.technician}</span>
                              <span>
                                Accuracy: {record.status === 'completed' ? `${record.accuracy}%` : 'Pending'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="secondary" size="sm">
                              View Details
                            </Button>
                            {record.status === 'pending' && (
                              <Button variant="primary" size="sm">
                                Start Calibration
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Performance Analytics</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card padding="lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Efficiency Trends</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center text-gray-500">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                        <p>Performance Chart Placeholder</p>
                      </div>
                    </div>
                  </Card>

                  <Card padding="lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Defect Rate Analysis</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center text-gray-500">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                        <p>Defect Analysis Chart Placeholder</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MachinesPage;
