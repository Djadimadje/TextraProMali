'use client';

import React, { useState } from 'react';
import Button from '../../../../../../components/ui/Button';
import { X, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Machine } from '../../../../../../services/machineService';

// Dynamic import for jsPDF to avoid SSR issues
const generatePDF = async (machines: Machine[], selectedFields: any) => {
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;
  
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Machine Inventory Report', 20, 20);
  
  // Date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
  doc.text(`Total Machines: ${machines.length}`, 20, 45);
  
  // Prepare table data
  const headers: string[] = [];
  const fields: string[] = [];
  
  if (selectedFields.machine_id) { headers.push('Machine ID'); fields.push('machine_id'); }
  if (selectedFields.name) { headers.push('Name'); fields.push('name'); }
  if (selectedFields.type) { headers.push('Type'); fields.push('type'); }
  if (selectedFields.status) { headers.push('Status'); fields.push('status'); }
  if (selectedFields.location) { headers.push('Location'); fields.push('location'); }
  if (selectedFields.operator) { headers.push('Operator'); fields.push('operator'); }
  if (selectedFields.operating_hours) { headers.push('Operating Hours'); fields.push('operating_hours'); }
  if (selectedFields.last_maintenance) { headers.push('Last Maintenance'); fields.push('last_maintenance'); }
  if (selectedFields.manufacturer) { headers.push('Manufacturer'); fields.push('manufacturer'); }

  const tableData = machines.map(machine => 
    fields.map(field => {
      switch (field) {
        case 'machine_id': return machine.machine_id;
        case 'name': return machine.name;
        case 'type': return typeof machine.machine_type === 'object' 
          ? machine.machine_type.name 
          : 'Unknown Type';
        case 'status': return machine.operational_status;
        case 'location': return `${machine.building || ''} ${machine.floor || ''}`.trim() || '-';
        case 'operator': return machine.primary_operator && typeof machine.primary_operator === 'object'
          ? `${machine.primary_operator.first_name} ${machine.primary_operator.last_name}` 
          : 'Unassigned';
        case 'operating_hours': return `${machine.total_operating_hours}h`;
        case 'last_maintenance': return machine.last_maintenance_date 
          ? new Date(machine.last_maintenance_date).toLocaleDateString() 
          : '-';
        case 'manufacturer': return machine.manufacturer || '-';
        default: return '';
      }
    })
  );

  // Add table using autoTable
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 55,
    styles: { 
      fontSize: 8,
      cellPadding: 3
    },
    headStyles: { 
      fillColor: [147, 51, 234],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { top: 55, left: 20, right: 20 }
  });
  
  // Save the PDF
  doc.save(`machines_report_${new Date().toISOString().split('T')[0]}.pdf`);
};

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  machines: Machine[];
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, machines }) => {
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'pdf' | null>(null);
  const [includeOffline, setIncludeOffline] = useState(true);
  const [selectedFields, setSelectedFields] = useState({
    machine_id: true,
    name: true,
    type: true,
    status: true,
    location: true,
    operator: true,
    operating_hours: true,
    last_maintenance: true,
    manufacturer: false
  });

  const handleFieldToggle = (field: keyof typeof selectedFields) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getFilteredMachines = () => {
    return includeOffline ? machines : machines.filter(m => m.operational_status !== 'offline');
  };

  const exportToExcel = () => {
    const filteredMachines = getFilteredMachines();
    const headers: string[] = [];
    const fields: string[] = [];

    // Build headers and fields based on selection
    if (selectedFields.machine_id) { headers.push('Machine ID'); fields.push('machine_id'); }
    if (selectedFields.name) { headers.push('Name'); fields.push('name'); }
    if (selectedFields.type) { headers.push('Type'); fields.push('type'); }
    if (selectedFields.status) { headers.push('Status'); fields.push('status'); }
    if (selectedFields.location) { headers.push('Location'); fields.push('location'); }
    if (selectedFields.operator) { headers.push('Operator'); fields.push('operator'); }
    if (selectedFields.operating_hours) { headers.push('Operating Hours'); fields.push('operating_hours'); }
    if (selectedFields.last_maintenance) { headers.push('Last Maintenance'); fields.push('last_maintenance'); }
    if (selectedFields.manufacturer) { headers.push('Manufacturer'); fields.push('manufacturer'); }

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + filteredMachines.map(machine => 
          fields.map(field => {
            switch (field) {
              case 'machine_id': return machine.machine_id;
              case 'name': return `"${machine.name}"`; // Quote to handle commas
              case 'type': return typeof machine.machine_type === 'object' 
                ? machine.machine_type.name 
                : 'Unknown Type';
              case 'status': return machine.operational_status;
              case 'location': return `"${`${machine.building || ''} ${machine.floor || ''}`.trim() || '-'}"`;
              case 'operator': return machine.primary_operator && typeof machine.primary_operator === 'object'
                ? `"${machine.primary_operator.first_name} ${machine.primary_operator.last_name}"` 
                : 'Unassigned';
              case 'operating_hours': return machine.total_operating_hours;
              case 'last_maintenance': return machine.last_maintenance_date 
                ? new Date(machine.last_maintenance_date).toLocaleDateString() 
                : '-';
              case 'manufacturer': return machine.manufacturer || '-';
              default: return '';
            }
          }).join(",")
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `machines_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    const filteredMachines = getFilteredMachines();
    await generatePDF(filteredMachines, selectedFields);
  };

  const handleExport = async () => {
    if (selectedFormat === 'excel') {
      exportToExcel();
    } else if (selectedFormat === 'pdf') {
      await exportToPDF();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Export Machines</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Select Export Format</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedFormat('excel')}
              className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                selectedFormat === 'excel' 
                  ? 'border-purple-500 bg-purple-50 text-purple-700' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileSpreadsheet size={24} />
              <div className="text-left">
                <div className="font-medium">Excel (CSV)</div>
                <div className="text-sm text-gray-500">Spreadsheet compatible format</div>
              </div>
            </button>
            <button
              onClick={() => setSelectedFormat('pdf')}
              className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                selectedFormat === 'pdf' 
                  ? 'border-purple-500 bg-purple-50 text-purple-700' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText size={24} />
              <div className="text-left">
                <div className="font-medium">PDF Report</div>
                <div className="text-sm text-gray-500">Professional document format</div>
              </div>
            </button>
          </div>
        </div>

        {/* Filter Options */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Filter Options</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeOffline}
              onChange={(e) => setIncludeOffline(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="ml-2 text-sm text-gray-700">Include offline machines</span>
          </label>
        </div>

        {/* Field Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Select Fields to Export</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(selectedFields).map(([field, checked]) => (
              <label key={field} className="flex items-center">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleFieldToggle(field as keyof typeof selectedFields)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">
                  {field.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <div>Total machines to export: <span className="font-medium">{getFilteredMachines().length}</span></div>
            <div>Selected fields: <span className="font-medium">{Object.values(selectedFields).filter(Boolean).length}</span></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleExport} 
            disabled={!selectedFormat}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Download size={16} />
            Export {selectedFormat === 'excel' ? 'CSV' : selectedFormat === 'pdf' ? 'PDF' : ''}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
