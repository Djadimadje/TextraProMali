// Dynamic import for XLSX to handle potential loading issues
let XLSX: any = null;
let jsPDF: any = null;
let autoTable: any = null;

import { formatCurrency } from '../lib/formatters';

const loadXLSX = async () => {
  if (!XLSX) {
    try {
      XLSX = await import('xlsx');
    } catch (error) {
      console.warn('XLSX library not available, Excel export disabled');
      // Do not throw here — return null so callers can fallback gracefully to CSV
      return null;
    }
  }
  return XLSX;
};

const loadPDFLibraries = async () => {
  if (!jsPDF) {
    try {
      const jsPDFModule = await import('jspdf');
      jsPDF = jsPDFModule.default;
      
      const autoTableModule = await import('jspdf-autotable');
      autoTable = autoTableModule.default;
    } catch (error) {
      console.warn('PDF libraries not available, PDF export disabled');
      throw new Error('PDF export is not available. Please install jspdf and jspdf-autotable packages.');
    }
  }
  return { jsPDF, autoTable };
};

interface ExportData {
  [key: string]: any;
}

interface ExportOptions {
  filename?: string;
  title?: string;
  headers?: { [key: string]: string };
  format?: 'csv' | 'excel' | 'pdf';
}

class ExportService {
  /**
   * Export data to CSV format
   */
  exportToCSV(data: ExportData[], options: ExportOptions = {}) {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const filename = options.filename || `export_${new Date().toISOString().split('T')[0]}.csv`;
    const headers = options.headers || {};
    
    // Get headers - use custom headers if provided, otherwise use object keys
    const headerKeys = Object.keys(headers).length > 0 ? Object.keys(headers) : Object.keys(data[0]);
    const headerLabels = headerKeys.map(key => headers[key] || key);
    
    // Create CSV content
    const csvContent = [
      headerLabels.join(','),
      ...data.map(row => 
        headerKeys.map(key => {
          const value = row[key];
          // Escape commas and quotes in CSV values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    this.downloadFile(csvContent, filename, 'text/csv');
  }

  /**
   * Export data to Excel format
   */
  async exportToExcel(data: ExportData[], options: ExportOptions = {}) {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const filename = options.filename || `export_${new Date().toISOString().split('T')[0]}.xlsx`;
    const headers = options.headers || {};
    const title = options.title || 'Export Data';
    
    try {
        const XLSX = await loadXLSX();

        // If XLSX library couldn't be loaded, silently fallback to CSV
        if (!XLSX) {
          this.exportToCSV(data, { ...options, filename: filename.replace('.xlsx', '.csv') });
          return;
        }

        // Prepare data with custom headers
      const headerKeys = Object.keys(headers).length > 0 ? Object.keys(headers) : Object.keys(data[0]);
      const headerLabels = headerKeys.map(key => headers[key] || key);
      
      // Create worksheet data
      const worksheetData = [
        headerLabels,
        ...data.map(row => headerKeys.map(key => row[key] || ''))
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Set column widths
      const columnWidths = headerLabels.map(() => ({ width: 20 }));
      worksheet['!cols'] = columnWidths;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      
      // Generate Excel file and download
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Excel export failed:', error);
      // Fallback to CSV if Excel fails
      this.exportToCSV(data, { ...options, filename: filename.replace('.xlsx', '.csv') });
    }
  }

  /**
   * Export data to PDF format using jsPDF
   */
  async exportToPDF(data: ExportData[], options: ExportOptions = {}) {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const filename = options.filename || `export_${new Date().toISOString().split('T')[0]}.pdf`;
    const headers = options.headers || {};
    const title = options.title || 'Export Data';
    
    try {
      const { jsPDF, autoTable } = await loadPDFLibraries();
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(title, 20, 20);
      
      // Add generation info
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
      doc.text(`Total records: ${data.length}`, 20, 35);
      
      // Prepare table data
      const headerKeys = Object.keys(headers).length > 0 ? Object.keys(headers) : Object.keys(data[0]);
      const headerLabels = headerKeys.map(key => headers[key] || key);
      
      const tableData = data.map(row => 
        headerKeys.map(key => {
          let value = row[key];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        })
      );
      
      // Add table using autoTable plugin
      autoTable(doc, {
        head: [headerLabels],
        body: tableData,
        startY: 45,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 45, left: 20, right: 20 },
      });
      
      // Save the PDF
      doc.save(filename);
      
    } catch (error) {
      console.error('PDF export failed:', error);
      
      // Fallback to HTML version if PDF fails
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
              th { background-color: #f8f9fa; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .export-info { margin-bottom: 20px; color: #666; font-size: 14px; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <div class="export-info">
              <p>Generated on: ${new Date().toLocaleString()}</p>
              <p>Total records: ${data.length}</p>
            </div>
            <table>
              <thead>
                <tr>
                  ${Object.keys(headers).length > 0 ? Object.values(headers).map(label => `<th>${label}</th>`).join('') : Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.map(row => `
                  <tr>
                    ${(Object.keys(headers).length > 0 ? Object.keys(headers) : Object.keys(data[0])).map(key => `<td>${row[key] || ''}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <script>
              // Auto-print for PDF generation
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `;

      this.downloadFile(htmlContent, filename.replace('.pdf', '.html'), 'text/html');
      alert('PDF library unavailable. Downloaded as HTML file that will auto-print to PDF.');
    }
  }

  /**
   * Universal export function that handles multiple formats
   */
  async exportData(data: ExportData[], format: 'csv' | 'excel' | 'pdf', options: ExportOptions = {}) {
    switch (format) {
      case 'csv':
        this.exportToCSV(data, options);
        break;
      case 'excel':
        await this.exportToExcel(data, options);
        break;
      case 'pdf':
        this.exportToPDF(data, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Helper function to download file
   */
  private downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Quality Checks specific export headers
   */
  getQualityChecksHeaders() {
    return {
      'batch_code': 'Batch Code',
      'check_type': 'Check Type',
      'status': 'Status',
      'defects_found': 'Defects Found',
      'ai_confidence': 'AI Confidence (%)',
      'inspector_name': 'Inspector',
      'created_at': 'Date Created',
      'severity': 'Severity',
      'comments': 'Comments'
    };
  }

  /**
   * Quality Standards specific export headers
   */
  getQualityStandardsHeaders() {
    return {
      'name': 'Standard Name',
      'category': 'Category',
      'min_threshold': 'Min Threshold',
      'max_threshold': 'Max Threshold',
      'measurement_unit': 'Unit',
      'is_active': 'Status',
      'created_at': 'Created Date',
      'description': 'Description'
    };
  }

  /**
   * Image Analysis Results specific export headers
   */
  getImageAnalysisHeaders() {
    return {
      'file_name': 'File Name',
      'batch_code': 'Batch Code',
      'status': 'Status',
      'defects_found': 'Defects Found',
      'ai_confidence': 'AI Confidence (%)',
      'analysis': 'Analysis Result',
      'upload_date': 'Upload Date'
    };
  }

  /**
   * Maintenance Logs specific export headers
   */
  getMaintenanceLogsHeaders() {
    return {
      'id': 'Task ID',
      'machine': 'Machine',
      'technician_name': 'Technician',
      'issue_reported': 'Issue Reported',
      'action_taken': 'Action Taken',
      'status': 'Status',
      'priority': 'Priority',
      'reported_at': 'Reported Date',
      'resolved_at': 'Resolved Date',
      'downtime_hours': 'Downtime (hrs)',
      'cost': 'Cost ($)',
      'parts_replaced': 'Parts Replaced',
      'notes': 'Notes'
    };
  }

  /**
   * Maintenance Statistics specific export headers
   */
  getMaintenanceStatsHeaders() {
    return {
      'total_maintenance_logs': 'Total Tasks',
      'pending_count': 'Pending Tasks',
      'in_progress_count': 'In Progress',
      'completed_count': 'Completed Tasks',
      'overdue_count': 'Overdue Tasks',
      'average_resolution_time_hours': 'Avg Resolution Time (hrs)',
      'average_downtime_hours': 'Avg Downtime (hrs)',
      'total_maintenance_cost': 'Total Cost (CFA)'
    };
  }

  /**
   * Predictive Maintenance specific export headers
   */
  getPredictiveMaintenanceHeaders() {
    return {
      'machine_id': 'Machine ID',
      'machine_name': 'Machine Name',
      'next_due_date': 'Next Due Date',
      'urgency': 'Urgency Level',
      'days_until_due': 'Days Until Due',
      'recommendations': 'AI Recommendations'
    };
  }

  /**
   * Export maintenance report as professional PDF
   */
  async exportMaintenanceReportPDF(reportData: {
    title: string;
    stats?: any;
    logs?: any[];
    costBreakdown?: any;
    performanceMetrics?: any;
  }) {
    try {
      const { jsPDF, autoTable } = await loadPDFLibraries();
      
      const doc = new jsPDF();
      let yPosition = 20;
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(44, 62, 80);
      doc.text(reportData.title, 20, yPosition);
      yPosition += 15;
      
      // Company info
      doc.setFontSize(12);
      doc.setTextColor(127, 140, 141);
      doc.text('TexPro AI - Textile Manufacturing Optimization', 20, yPosition);
      yPosition += 10;
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
      yPosition += 20;
      
      // Stats summary if provided
      if (reportData.stats) {
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text('Summary Statistics', 20, yPosition);
        yPosition += 10;
        
        const statsData = [
          ['Total Tasks', reportData.stats.total_maintenance_logs?.toString() || '0'],
          ['Pending', reportData.stats.pending_count?.toString() || '0'],
          ['In Progress', reportData.stats.in_progress_count?.toString() || '0'],
          ['Completed', reportData.stats.completed_count?.toString() || '0'],
          ['Overdue', reportData.stats.overdue_count?.toString() || '0'],
          ['Total Cost', `${formatCurrency(reportData.stats.total_maintenance_cost || 0)}`]
        ];
        
        autoTable(doc, {
          head: [['Metric', 'Value']],
          body: statsData,
          startY: yPosition,
          theme: 'striped',
          headStyles: { fillColor: [52, 152, 219] },
          margin: { left: 20, right: 20 },
          tableWidth: 'auto',
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 60 }
          }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }
      
      // Cost breakdown if provided
      if (reportData.costBreakdown) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text('Cost Breakdown', 20, yPosition);
        yPosition += 10;
        
        const costData = [
          ['Labor', `$${reportData.costBreakdown.labor?.toLocaleString() || '0'}`],
          ['Parts', `$${reportData.costBreakdown.parts?.toLocaleString() || '0'}`],
          ['Downtime', `$${reportData.costBreakdown.downtime?.toLocaleString() || '0'}`],
          ['Overhead', `$${reportData.costBreakdown.overhead?.toLocaleString() || '0'}`]
        ];
        
        autoTable(doc, {
          head: [['Category', 'Amount']],
          body: costData,
          startY: yPosition,
          theme: 'striped',
          headStyles: { fillColor: [46, 204, 113] },
          margin: { left: 20, right: 20 },
          tableWidth: 'auto',
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 60 }
          }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }
      
      // Maintenance logs if provided
      if (reportData.logs && reportData.logs.length > 0) {
        if (yPosition > 150) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text('Maintenance Logs', 20, yPosition);
        yPosition += 10;
        
        const logsData = reportData.logs.slice(0, 50).map(log => [
          log.id?.slice(0, 8) || '',
          log.machine || '',
          log.status || '',
          log.priority || '',
          log.reported_at ? new Date(log.reported_at).toLocaleDateString() : ''
        ]);
        
        autoTable(doc, {
          head: [['ID', 'Machine', 'Status', 'Priority', 'Date']],
          body: logsData,
          startY: yPosition,
          theme: 'striped',
          headStyles: { fillColor: [155, 89, 182] },
          styles: { fontSize: 8 },
          margin: { left: 20, right: 20 }
        });
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(127, 140, 141);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
        doc.text('TexPro AI Maintenance Report', 20, doc.internal.pageSize.height - 10);
      }
      
      const filename = `${reportData.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw error;
    }
  }

  async exportPredictiveMaintenancePDF(data: any): Promise<void> {
    try {
      if (!data) {
        throw new Error('No data provided for PDF export');
      }

      const jsPDF = (await import('jspdf')).default;
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;

      // Header
      doc.setFillColor(147, 51, 234);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(data.title, margin, 25);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 50);

      let currentY = 60;

      // Summary section
      if (data.summary) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Predictive Analysis Summary', margin, currentY);
        currentY += 10;

        const summaryData = [
          ['Total Machines Monitored', data.summary.totalMachines?.toString() || '0'],
          ['Critical Risk Machines', data.summary.criticalMachines?.toString() || '0'],
          ['High Risk Machines', data.summary.highRiskMachines?.toString() || '0'],
          ['Average Health Score', `${data.summary.avgHealthScore?.toFixed(1) || '0'}%`],
          ['Total Estimated Maintenance Cost', `$${data.summary.totalEstimatedCost?.toLocaleString() || '0'}`]
        ];

        autoTable(doc, {
          startY: currentY,
          head: [['Metric', 'Value']],
          body: summaryData,
          theme: 'grid',
          headStyles: { fillColor: [147, 51, 234], textColor: 255 },
          margin: { left: margin, right: margin }
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // Machine health data
      if (data.machineHealth && data.machineHealth.length > 0) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Machine Health Status', margin, currentY);
        currentY += 10;

        const healthData = data.machineHealth.map((machine: any) => [
          machine.machine_name || machine.machine_id,
          `${machine.health_score || 0}%`,
          machine.risk_level?.toUpperCase() || 'UNKNOWN',
          `${machine.failure_probability || 0}%`,
          `$${machine.maintenance_cost_estimate?.toLocaleString() || '0'}`
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['Machine', 'Health Score', 'Risk Level', 'Failure Risk', 'Est. Cost']],
          body: healthData,
          theme: 'striped',
          headStyles: { fillColor: [234, 88, 12], textColor: 255 },
          margin: { left: margin, right: margin },
          styles: { fontSize: 9 }
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // Predictions data
      if (data.predictions && data.predictions.length > 0) {
        // Check if new page needed
        if (currentY > pageHeight - 100) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Maintenance Predictions', margin, currentY);
        currentY += 10;

        const predictionsData = data.predictions.slice(0, 15).map((pred: any) => [
          pred.machine_name || pred.machine_id,
          pred.urgency?.toUpperCase() || 'UNKNOWN',
          pred.next_due_date ? new Date(pred.next_due_date).toLocaleDateString() : 'Not scheduled',
          pred.days_until_due?.toString() || 'N/A',
          pred.recommendations?.slice(0, 2).join('; ') || 'No recommendations'
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['Machine', 'Urgency', 'Due Date', 'Days Until Due', 'Recommendations']],
          body: predictionsData,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129], textColor: 255 },
          margin: { left: margin, right: margin },
          styles: { fontSize: 8 },
          columnStyles: {
            4: { cellWidth: 50 } // Recommendations column
          }
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
      }

      // Footer
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
        doc.text('Confidential - Predictive Maintenance Report', margin, pageHeight - 10);
      }

      // Save the PDF
      doc.save(`predictive_maintenance_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Predictive PDF generation failed:', error);
      throw error;
    }
  }
}

export const exportService = new ExportService();
export default exportService;
