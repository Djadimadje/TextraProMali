import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BatchItem {
  id: string | number;
  batch_code?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

interface Props {
  batches: BatchItem[];
}

const ProductionCalendar: React.FC<Props> = ({ batches }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);

  // Expand to full weeks for calendar grid
  const gridStart = startOfWeek(start, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(end, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const countForDay = (d: Date) => {
    return batches.filter(b => {
      try {
        const dateStr = b.start_date || b.created_at || b.end_date;
        if (!dateStr) return false;
        const parsed = parseISO(String(dateStr));
        return isSameDay(parsed, d);
      } catch (e) {
        return false;
      }
    }).length;
  };

  const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">Calendrier de Production — {format(currentMonth, 'MMMM yyyy')}</h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded hover:bg-gray-100">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={nextMonth} className="p-2 rounded hover:bg-gray-100">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-sm">
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(d => (
          <div key={d} className="text-center font-medium text-gray-500">{d}</div>
        ))}

        {days.map(day => {
          const count = countForDay(day);
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          return (
            <div key={day.toISOString()} className={`min-h-[64px] border rounded p-2 flex flex-col justify-between ${isCurrentMonth ? '' : 'bg-gray-50'}`}>
              <div className="text-xs text-gray-600">{format(day, 'd')}</div>
              <div className="mt-2">
                {count > 0 ? (
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">{count} lot(s)</span>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductionCalendar;
