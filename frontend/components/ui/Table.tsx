'use client';
import React from 'react';

interface TableColumn {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps {
  columns: TableColumn[];
  data: Record<string, any>[];
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: Record<string, any>, index: number) => void;
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  className = '',
  striped = true,
  hoverable = true,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick
}) => {
  const getAlignment = (align?: string) => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  if (loading) {
    return (
      <div className="bg-global-9 rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-button-1"></div>
          <span className="ml-3 text-global-6">Loading...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-global-9 rounded-lg border border-gray-200 p-8">
        <div className="text-center text-global-6">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-global-9 rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-global-5">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-4 py-3 sm:px-6 sm:py-4
                    text-sm font-medium
                    text-global-2
                    ${getAlignment(column.align)}
                  `.trim().replace(/\s+/g, ' ')}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                className={`
                  border-t border-gray-200
                  ${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : ''}
                  ${hoverable ? 'hover:bg-gray-100' : ''}
                  ${onRowClick ? 'cursor-pointer' : ''}
                  transition-colors duration-150
                `.trim().replace(/\s+/g, ' ')}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      px-4 py-3 sm:px-6 sm:py-4
                      text-sm
                      text-global-4
                      ${getAlignment(column.align)}
                    `.trim().replace(/\s+/g, ' ')}
                  >
                    {row[column.key]}
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

export default Table;
