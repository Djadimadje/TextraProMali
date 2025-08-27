'use client';

import React, { useState } from 'react';
import { Download, FileText, Table, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { exportService } from '../../services/exportService';

interface ExportButtonProps {
  data: any[];
  filename?: string;
  title?: string;
  headers?: { [key: string]: string };
  className?: string;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename,
  title,
  headers,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!data || data.length === 0) {
      alert('No data available to export');
      return;
    }

    try {
      setIsExporting(true);
      setIsOpen(false);

      const options = {
        filename: filename ? `${filename}.${format === 'excel' ? 'xlsx' : format}` : undefined,
        title: title || 'Export Data',
        headers: headers || {}
      };

      await exportService.exportData(data, format, options);
      
      // Show success message
      const formatName = format === 'excel' ? 'Excel' : format.toUpperCase();
      console.log(`${formatName} export completed successfully`);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (disabled || !data || data.length === 0) {
    return (
      <button
        disabled
        className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed ${className}`}
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </button>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 ${className} ${
          isExporting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? 'Exporting...' : 'Export'}
        <ChevronDown className="h-4 w-4 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <div className="py-1">
            {/* CSV Export */}
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FileText className="h-4 w-4 mr-3 text-green-600" />
              <div className="text-left">
                <div className="font-medium">Export as CSV</div>
                <div className="text-xs text-gray-500">Comma-separated values</div>
              </div>
            </button>

            {/* Excel Export */}
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FileSpreadsheet className="h-4 w-4 mr-3 text-green-700" />
              <div className="text-left">
                <div className="font-medium">Export as Excel</div>
                <div className="text-xs text-gray-500">Microsoft Excel format</div>
              </div>
            </button>

            {/* PDF Export */}
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Table className="h-4 w-4 mr-3 text-red-600" />
              <div className="text-left">
                <div className="font-medium">Export as PDF</div>
                <div className="text-xs text-gray-500">Printable document</div>
              </div>
            </button>
          </div>

          {/* Data Info */}
          <div className="border-t border-gray-100 px-4 py-2">
            <div className="text-xs text-gray-500">
              {data.length} record{data.length !== 1 ? 's' : ''} to export
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ExportButton;
