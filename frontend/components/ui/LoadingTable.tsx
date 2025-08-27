'use client';
import React from 'react';

interface LoadingTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

const LoadingTable: React.FC<LoadingTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header */}
          {showHeader && (
            <thead className="bg-gray-50">
              <tr>
                {[...Array(columns)].map((_, i) => (
                  <th key={i} className="px-6 py-3 text-left">
                    <div className="h-4 bg-gray-300 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                  </th>
                ))}
              </tr>
            </thead>
          )}

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(rows)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(columns)].map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-300 rounded animate-pulse" style={{ width: `${Math.random() * 30 + 50}%` }}></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoadingTable;
