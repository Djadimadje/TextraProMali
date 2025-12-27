'use client';

import React, { useState, useEffect, useRef } from 'react';
import { workflowService } from '../../services/workflowService';

interface BatchOption {
  id: string;
  batch_code: string;
  description?: string;
}

interface Props {
  value?: string;
  onChange: (batchCode: string | null) => void;
  placeholder?: string;
}

export default function BatchAutocomplete({ value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState(value || '');
  const [options, setOptions] = useState<BatchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowList(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const doSearch = async (q: string) => {
    if (!q) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const resp = await workflowService.getBatchWorkflows({ search: q, page_size: 8 });
      // Prefer the typed `data.results` shape; fall back to top-level `results` if present.
      const matches = (resp as any)?.data?.results ?? (resp as any)?.results ?? [];
      setOptions(matches.map((m: any) => ({ id: m.id, batch_code: m.batch_code, description: m.description })));
    } catch (err) {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const onInput = (val: string) => {
    setQuery(val);
    setShowList(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      doSearch(val.trim());
    }, 300);
  };

  const selectOption = (opt: BatchOption) => {
    setQuery(opt.batch_code);
    setShowList(false);
    onChange(opt.batch_code);
  };

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          onInput(e.target.value);
          onChange(null);
        }}
        onFocus={() => {
          if (query) doSearch(query);
          setShowList(true);
        }}
        placeholder={placeholder || 'Search batch by code...'}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      {showList && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
          {loading ? (
            <div className="p-2 text-sm text-gray-500">Searching...</div>
          ) : options.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">No batches found</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => selectOption(opt)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
              >
                <div className="font-medium">{opt.batch_code}</div>
                {opt.description && <div className="text-xs text-gray-500">{opt.description}</div>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
