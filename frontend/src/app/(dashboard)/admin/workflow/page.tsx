'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause
} from 'lucide-react';
import Header from '../../../../../components/layout/Header';
import AdminSidebar from '../../../../../components/layout/AdminSidebar';
import { workflowService, BatchWorkflow, BatchWorkflowFilters, BatchWorkflowStats } from '../../../../../services/workflowService';
import { useAuth } from '../../../../contexts/AuthContext';
import { useActivityTracker } from '../../../../hooks/useActivityTracker';

const WorkflowPage: React.FC = () => {
  console.log('WorkflowPage component mounted');
  
  // Track user activity for auto-logout
  useActivityTracker();
  
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  console.log('WorkflowPage - User:', user);
  console.log('WorkflowPage - isAuthenticated:', isAuthenticated);
  console.log('WorkflowPage - AuthLoading:', authLoading);
  const isAuthenticatedRef = React.useRef(isAuthenticated);

  // Keep a ref of the latest auth state to avoid stale closures inside timers
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);
  
  const [batches, setBatches] = useState<BatchWorkflow[]>([]);
  const [stats, setStats] = useState<BatchWorkflowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showExportMenu, setShowExportMenu] = useState(false);
  const endDateRef = useRef<HTMLInputElement | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Filter and search states
  const [filters, setFilters] = useState<BatchWorkflowFilters>({
    page: 1,
    page_size: 20
  });

  // Load data
  // Handle click outside to close export menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu && !(event.target as Element).closest('.relative')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  // Load data on component mount
  useEffect(() => {
    console.log('WorkflowPage useEffect triggered');
    console.log('AuthLoading:', authLoading, 'isAuthenticated:', isAuthenticated, 'User:', user);
    let timerId: number | null = null;

    if (!authLoading && isAuthenticated && user) {
      console.log('Conditions met - calling loadBatchWorkflows');
      // Small delay to ensure token is fully available
      timerId = window.setTimeout(() => {
        loadBatchWorkflows();
        loadStats();
      }, 100);
    } else {
      console.log('Conditions not met - authLoading:', authLoading, 'isAuthenticated:', isAuthenticated, 'user:', user);

      // If not loading and not authenticated, wait briefly before showing an error.
      // This avoids transient false negatives during navigation when auth state
      // may still be settling (token rehydration, context update, etc.).
      if (!authLoading && !isAuthenticated) {
        console.log('Auth not authenticated; delaying error to avoid transient false negatives');
        timerId = window.setTimeout(() => {
          // Use the ref to get the latest auth state (avoid stale closure)
          if (!isAuthenticatedRef.current) {
            setLoading(false);
            setError('Authentication required. Please log in again.');
          } else {
            // If auth recovered while the timer ran, load data
            loadBatchWorkflows();
            loadStats();
          }
        }, 300);
      }
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [authLoading, isAuthenticated, user, filters]);

  const loadBatchWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading batch workflows...');
      console.log('API URL:', `${workflowService.baseUrl}/batches/`);
      console.log('User:', user);
      const token = localStorage.getItem('token');
      console.log('Token:', token ? `${token.substring(0, 20)}...` : 'Missing');
      
      const response = await workflowService.getBatchWorkflows(filters);
      console.log('Workflow response:', response);
      
      if (response && response.success) {
        setBatches(response.data.results || []);
        console.log('Batches loaded:', response.data.results);
      } else {
        console.log('Response structure:', response);
        setError(response?.message || 'Failed to load batch workflows');
      }
    } catch (err) {
      console.error('Failed to load batch workflows:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error details:', errorMsg);
      
      // Check if it's an authentication error
      if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
        setError('Authentication failed. Please log in again.');
      } else if (errorMsg.includes('403') || errorMsg.includes('Forbidden')) {
        setError('You do not have permission to access workflow data.');
      } else {
        setError(`API Error: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('Loading workflow stats...');
      const response = await workflowService.getWorkflowStats();
      console.log('Stats response:', response);
      
      if (response && response.success) {
        setStats(response.data);
      } else {
        console.log('Stats failed:', response);
      }
    } catch (err) {
      console.error('Failed to load workflow stats:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Stats error details:', errorMsg);
    }
  };

  const handleRefresh = () => {
    loadBatchWorkflows();
    loadStats();
  };

  const handleExportBatches = () => {
    setShowExportMenu(!showExportMenu);
  };

  const exportToCSV = () => {
    if (batches.length === 0) {
      setError('No data to export');
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Batch Code,Description,Status,Supervisor,Start Date,End Date,Progress,Days Remaining,Created\n"
      + batches.map(batch => 
          `"${batch.batch_code}","${batch.description || ''}","${batch.status_display}","${batch.supervisor_name}","${workflowService.formatDate(batch.start_date)}","${workflowService.formatDate(batch.end_date)}","${workflowService.formatProgress(batch.progress_percentage)}","${batch.days_remaining || 'N/A'}","${workflowService.formatDate(batch.created_at)}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `batch_workflows_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportToExcel = () => {
    if (batches.length === 0) {
      setError('No data to export');
      return;
    }

    // Create Excel-compatible HTML table
    const excelData = `
      <table>
        <thead>
          <tr>
            <th>Batch Code</th>
            <th>Description</th>
            <th>Status</th>
            <th>Supervisor</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Progress (%)</th>
            <th>Days Remaining</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          ${batches.map(batch => `
            <tr>
              <td>${batch.batch_code}</td>
              <td>${batch.description || ''}</td>
              <td>${batch.status_display}</td>
              <td>${batch.supervisor_name}</td>
              <td>${workflowService.formatDate(batch.start_date)}</td>
              <td>${workflowService.formatDate(batch.end_date)}</td>
              <td>${workflowService.formatProgress(batch.progress_percentage)}</td>
              <td>${batch.days_remaining || 'N/A'}</td>
              <td>${workflowService.formatDate(batch.created_at)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const blob = new Blob([excelData], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch_workflows_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportToPDF = () => {
    if (batches.length === 0) {
      setError('No data to export');
      return;
    }

    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const currentDate = new Date().toLocaleDateString();
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Batch Workflows Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #7c3aed; margin: 0; }
            .header p { color: #666; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f8f9fa; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .status { padding: 2px 6px; border-radius: 4px; font-size: 11px; }
            .status-pending { background-color: #fef3c7; color: #d97706; }
            .status-in_progress { background-color: #fecaca; color: #dc2626; }
            .status-completed { background-color: #d1fae5; color: #059669; }
            .status-delayed { background-color: #fee2e2; color: #dc2626; }
            .status-cancelled { background-color: #f3f4f6; color: #6b7280; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Batch Workflows Report</h1>
            <p>TexPro AI - Textile Manufacturing System</p>
            <p>Generated on: ${currentDate}</p>
            <p>Total Batches: ${batches.length}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Batch Code</th>
                <th>Description</th>
                <th>Status</th>
                <th>Supervisor</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Progress</th>
                <th>Days Remaining</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              ${batches.map(batch => `
                <tr>
                  <td><strong>${batch.batch_code}</strong></td>
                  <td>${batch.description || '-'}</td>
                  <td><span class="status status-${batch.status}">${batch.status_display}</span></td>
                  <td>${batch.supervisor_name}</td>
                  <td>${workflowService.formatDate(batch.start_date)}</td>
                  <td>${workflowService.formatDate(batch.end_date)}</td>
                  <td>${workflowService.formatProgress(batch.progress_percentage)}</td>
                  <td>${batch.days_remaining || 'N/A'}</td>
                  <td>${workflowService.formatDate(batch.created_at)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This report was automatically generated by TexPro AI system.</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
        </html>
      `);
      
      printWindow.document.close();
    }
    setShowExportMenu(false);
  };

  const handleAddBatch = () => {
    setShowCreateModal(true);
  };

  const handleCreateBatch = async (batchData: any) => {
    setFormErrors({});
    setCreating(true);
    try {
      const response = await workflowService.createBatchWorkflow(batchData);
      if (response.success) {
        setShowCreateModal(false);
        loadBatchWorkflows(); // Refresh the data
        loadStats();
      } else {
        setError(response.message || 'Failed to create batch');
      }
    } catch (err: any) {
      // Log both the raw object and a JSON-stringified snapshot for clarity
      try {
        console.error('Failed to create batch:', err, JSON.stringify(err));
      } catch (logErr) {
        console.error('Failed to create batch (stringify failed):', err);
      }
      // Normalize into strings so UI shows meaningful text instead of an object
      const parsedFieldErrors: Record<string, string> = {};

      const serverMessageRaw = (err && (err.serverMessage ?? err.message)) ?? null;
      const errorsRaw = err && (err.errors ?? null);

      // Helper to stringify possibly-nonstring values
      const stringify = (v: any) => {
        if (v === null || v === undefined) return '';
        if (typeof v === 'string') return v;
        try {
          return JSON.stringify(v);
        } catch {
          return String(v);
        }
      };

      // Parse field errors
      if (errorsRaw) {
        if (Array.isArray(errorsRaw)) {
          // Try to extract field and message from Django-style string representations
          errorsRaw.forEach((item: any) => {
            if (typeof item === 'string') {
              const m = /'([^']+)'\s*:\s*\[ErrorDetail\(string='([^']+)'/.exec(item);
              if (m) parsedFieldErrors[m[1]] = m[2];
              else parsedFieldErrors['_all'] = (parsedFieldErrors['_all'] ? parsedFieldErrors['_all'] + ' ' : '') + item;
            } else {
              // non-string entry
              parsedFieldErrors['_all'] = (parsedFieldErrors['_all'] ? parsedFieldErrors['_all'] + ' ' : '') + stringify(item);
            }
          });
        } else if (typeof errorsRaw === 'object') {
          Object.entries(errorsRaw).forEach(([k, v]) => {
            if (Array.isArray(v) && v.length > 0) parsedFieldErrors[k] = stringify(v[0]);
            else parsedFieldErrors[k] = stringify(v);
          });
        } else {
          parsedFieldErrors['_all'] = stringify(errorsRaw);
        }
      }

      // Determine top-level message
      let topMessage = '';
      if (serverMessageRaw) {
        if (typeof serverMessageRaw === 'string') topMessage = serverMessageRaw;
        else if (typeof serverMessageRaw === 'object') {
          // try common fields
          topMessage = serverMessageRaw.message || serverMessageRaw.detail || stringify(serverMessageRaw);
        } else {
          topMessage = String(serverMessageRaw);
        }
      }

      if (Object.keys(parsedFieldErrors).length > 0) {
        setFormErrors(parsedFieldErrors);
      }

      if (topMessage) setError(topMessage);
      else if (parsedFieldErrors['_all']) setError(parsedFieldErrors['_all']);
      else setError('Failed to create batch workflow');
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading workflow data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-[240px] p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Batch Workflows</h1>
                <p className="text-gray-600">Manage textile batch production workflows</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              <div className="relative">
                <button
                  onClick={handleExportBatches}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Export Dropdown Menu */}
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={exportToCSV}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export as CSV
                        </div>
                      </button>
                      <button
                        onClick={exportToExcel}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Export as Excel
                        </div>
                      </button>
                      <button
                        onClick={exportToPDF}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Export as PDF
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
                <button
                  onClick={handleAddBatch}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Batch
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Batches</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_batches}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Batches</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.active_batches}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-50">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.by_status.completed || 0}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overdue</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.overdue_batches}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Simple Batch Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Batch Workflows</h3>
              </div>
              
              {batches.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No batch workflows found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first production batch.
                  </p>
                  <button
                    onClick={handleAddBatch}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Create First Batch
                  </button>
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
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supervisor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {batches.map((batch) => (
                        <tr key={batch.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {batch.batch_code}
                            </div>
                            {batch.description && (
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {batch.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${workflowService.getStatusColor(batch.status)}`}>
                              <span className="mr-1">{workflowService.getStatusIcon(batch.status)}</span>
                              {batch.status_display}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-900">{batch.supervisor_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {workflowService.formatProgress(batch.progress_percentage)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {workflowService.formatDate(batch.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Debug Info */}
            <div className="bg-gray-100 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Debug Info:</h4>
              <pre className="text-xs text-gray-600">
                {JSON.stringify({ 
                  batchCount: batches.length, 
                  statsLoaded: !!stats,
                  userRole: user?.role,
                  loading,
                  error 
                }, null, 2)}
              </pre>
            </div>
          </div>
        </main>
      </div>

      {/* Create Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Batch Workflow</h3>
            {formErrors && formErrors['_all'] && (
              <div className="mb-3 text-sm text-red-600">{formErrors['_all']}</div>
            )}
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const batchData = {
                batch_code: formData.get('batch_code'),
                description: formData.get('description'),
                start_date: formData.get('start_date'),
                end_date: formData.get('end_date')
              };
              // client-side date validation
              const s = batchData.start_date ? String(batchData.start_date) : '';
              const en = batchData.end_date ? String(batchData.end_date) : '';
              const today = new Date(todayStr);
              if (s && new Date(s) < today) {
                setFormErrors({ start_date: 'Start date cannot be in the past' });
                return;
              }
              if (s && en && new Date(en) <= new Date(s)) {
                setFormErrors({ end_date: 'End date must be after start date' });
                return;
              }
              handleCreateBatch(batchData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Code *
                  </label>
                  <input
                    type="text"
                    name="batch_code"
                    defaultValue={`BATCH-${new Date().getFullYear()}-${String(batches.length + 1).padStart(3, '0')}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                  {formErrors.batch_code && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.batch_code}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter batch description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      defaultValue={todayStr}
                      min={todayStr}
                      onPaste={(e) => { e.preventDefault(); setFormErrors({ start_date: 'Pasting dates is disabled' }); }}
                      onChange={(e) => {
                        // when start date changes, ensure end date min updates
                        const val = e.target.value;
                        if (endDateRef.current) {
                          const minForEnd = val ? (new Date(val).toISOString().split('T')[0]) : tomorrowStr;
                          endDateRef.current.min = minForEnd;
                        }
                        setFormErrors((prev) => ({ ...prev, start_date: '' }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    {formErrors.start_date && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.start_date}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      ref={endDateRef}
                      type="date"
                      name="end_date"
                      defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      min={tomorrowStr}
                      onPaste={(e) => { e.preventDefault(); setFormErrors({ end_date: 'Pasting dates is disabled' }); }}
                      onChange={() => setFormErrors((prev) => ({ ...prev, end_date: '' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    {formErrors.end_date && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.end_date}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className={`flex-1 px-4 py-2 text-white rounded-lg ${creating ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {creating ? 'Creating…' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowPage;
