import React, { useState } from 'react';
import Button from '../../../../../../components/ui/Button';
import { X, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { User as ApiUser } from '../../../../../../services/userService';
// Dynamic import for jsPDF to avoid SSR issues
const generatePDF = async (users: User[], selectedFields: any) => {
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;
  
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('User Management Report', 20, 20);
  
  // Date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
  doc.text(`Total Users: ${users.length}`, 20, 45);
  
  // Prepare table data
  const headers: string[] = [];
  const fields: string[] = [];
  
  if (selectedFields.username) { headers.push('Username'); fields.push('username'); }
  if (selectedFields.email) { headers.push('Email'); fields.push('email'); }
  if (selectedFields.first_name) { headers.push('First Name'); fields.push('first_name'); }
  if (selectedFields.last_name) { headers.push('Last Name'); fields.push('last_name'); }
  if (selectedFields.role) { headers.push('Role'); fields.push('role'); }
  if (selectedFields.department) { headers.push('Department'); fields.push('department'); }
  if (selectedFields.employee_id) { headers.push('Employee ID'); fields.push('employee_id'); }
  if (selectedFields.status) { headers.push('Status'); fields.push('status'); }
  if (selectedFields.date_joined) { headers.push('Date Joined'); fields.push('date_joined'); }
  if (selectedFields.last_login) { headers.push('Last Login'); fields.push('last_login'); }

  const tableData = users.map(user => 
    fields.map(field => {
      if (field === 'status') return user.is_active ? 'Active' : 'Inactive';
      if (field === 'date_joined') return new Date(user.date_joined).toLocaleDateString();
      if (field === 'last_login') return user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never';
      return user[field as keyof typeof user] || '';
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
  doc.save(`users_report_${new Date().toISOString().split('T')[0]}.pdf`);
};

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  status: string;
  date_joined: string;
  last_login: string | null;
  employee_id?: string;
  department?: string;
  phone_number?: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, users }) => {
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'pdf' | null>(null);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [selectedFields, setSelectedFields] = useState({
    username: true,
    email: true,
    first_name: true,
    last_name: true,
    role: true,
    department: true,
    employee_id: true,
    status: true,
    date_joined: true,
    last_login: false
  });

  const handleFieldToggle = (field: keyof typeof selectedFields) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getFilteredUsers = () => {
    return includeInactive ? users : users.filter(u => u.is_active);
  };

  const exportToExcel = () => {
    const filteredUsers = getFilteredUsers();
    const headers: string[] = [];
    const fields: string[] = [];

    // Build headers and fields based on selection
    if (selectedFields.username) { headers.push('Username'); fields.push('username'); }
    if (selectedFields.email) { headers.push('Email'); fields.push('email'); }
    if (selectedFields.first_name) { headers.push('First Name'); fields.push('first_name'); }
    if (selectedFields.last_name) { headers.push('Last Name'); fields.push('last_name'); }
    if (selectedFields.role) { headers.push('Role'); fields.push('role'); }
    if (selectedFields.department) { headers.push('Department'); fields.push('department'); }
    if (selectedFields.employee_id) { headers.push('Employee ID'); fields.push('employee_id'); }
    if (selectedFields.status) { headers.push('Status'); fields.push('status'); }
    if (selectedFields.date_joined) { headers.push('Date Joined'); fields.push('date_joined'); }
    if (selectedFields.last_login) { headers.push('Last Login'); fields.push('last_login'); }

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + filteredUsers.map(user => 
          fields.map(field => {
            if (field === 'status') return user.is_active ? 'Active' : 'Inactive';
            if (field === 'date_joined') return new Date(user.date_joined).toLocaleDateString();
            if (field === 'last_login') return user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never';
            return user[field as keyof User] || '';
          }).join(",")
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    const filteredUsers = getFilteredUsers();
    await generatePDF(filteredUsers, selectedFields);
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
          <h2 className="text-xl font-semibold text-gray-900">Export Users</h2>
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
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="ml-2 text-sm text-gray-700">Include inactive users</span>
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
            <div>Total users to export: <span className="font-medium">{getFilteredUsers().length}</span></div>
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
