'use client';

import React, { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { maintenanceService } from '../../services/maintenanceApiService';
import { machineService } from '../../services/machineService';
import { PRIORITY_LEVELS } from '../../lib/constants';

interface Props {
  onClose: () => void;
  onCreated?: (created?: any) => void;
}

const NewTaskForm: React.FC<Props> = ({ onClose, onCreated }) => {
  const [machines, setMachines] = useState<any[]>([]);
  const [machineId, setMachineId] = useState('');
  const [issue, setIssue] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // loadMachines is used for initial load and onFocus reloads
  const loadMachines = async () => {
    try {
      const res = await machineService.getMachines({ page_size: 200, created_by_role: 'admin' });
      setDebugInfo(JSON.stringify(res, null, 2));
      if (res && res.success && res.data) {
        // Normalize response: support both array and paginated { results: [] }
        let list: any[] = [];
        if (Array.isArray(res.data)) list = res.data as any[];
        else if (Array.isArray((res.data as any).results)) list = (res.data as any).results;
        else if (Array.isArray((res as any).results)) list = (res as any).results;
        const machinesByAdmin = list.filter((m: any) => m.created_by_detail && m.created_by_detail.role === 'admin');
        if (machinesByAdmin.length > 0) {
          setMachines(machinesByAdmin);
        } else if (list.length > 0) {
          setMachines(list);
        } else {
          // Fallback: retry without created_by_role filter to see if any machines exist
          try {
            const resAll = await machineService.getMachines({ page_size: 200 });
            // append fallback debug info
            setDebugInfo(prev => prev ? prev + '\n\nFALLBACK: ' + JSON.stringify(resAll, null, 2) : JSON.stringify(resAll, null, 2));
            let listAll: any[] = [];
            if (resAll && resAll.success && resAll.data) {
              if (Array.isArray(resAll.data)) listAll = resAll.data as any[];
              else if (Array.isArray((resAll.data as any).results)) listAll = (resAll.data as any).results;
              else if (Array.isArray((resAll as any).results)) listAll = (resAll as any).results;
            }
            if (listAll.length > 0) setMachines(listAll);
          } catch (e2) {
            console.error('Fallback load failed', e2);
            setDebugInfo(prev => prev ? prev + '\n\nFALLBACK ERROR: ' + String(e2) : String(e2));
          }
        }
      }
    } catch (e) {
      console.error('Failed to load machines for NewTaskForm', e);
      setDebugInfo(String(e));
    }
  };

  useEffect(() => {
    let mounted = true;
    // initial load
    if (mounted) loadMachines();
    return () => { mounted = false; };
  }, []);

  const validate = (): boolean => {
    setError(null);
    if (!machineId) {
      setError('Veuillez sélectionner une machine');
      return false;
    }
    if (!issue || issue.trim().length < 10) {
      setError('La description doit contenir au moins 10 caractères');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        machine: machineId,
        issue_reported: issue.trim(),
        priority: priority
      };

      const resp = await maintenanceService.createMaintenanceLog(payload as any);
      if (resp && resp.success) {
        if (onCreated) onCreated(resp.data);
        onClose();
      } else {
        setError(resp && (resp.message || JSON.stringify(resp)) || 'Erreur inconnue');
      }
    } catch (err: any) {
      console.error('Create maintenance error', err);
      // Try to show validation errors from backend
      const msg = err?.message || String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-[520px] max-w-full">
      <h4 className="text-lg font-semibold mb-2">Nouvelle Tâche</h4>

      <div className="mb-3">
        <label className="text-sm font-medium mb-1 block">Machine</label>
        <select
          value={machineId}
          onChange={(e) => setMachineId(e.target.value)}
          onFocus={async () => { await loadMachines(); }}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">-- Sélectionner une machine --</option>
          {machines.map(m => (
            <option key={m.id} value={m.id}>{m.name} ({m.machine_id || m.id})</option>
          ))}
        </select>
        {machines.length === 0 && (
          <div className="text-sm text-gray-500 mt-2">
            Aucune machine trouvée.
            {debugInfo && (
              <pre className="mt-2 p-2 bg-gray-100 text-xs text-gray-700 rounded max-h-48 overflow-auto">{debugInfo}</pre>
            )}
          </div>
        )}
      </div>

      <div className="mb-3">
        <label className="text-sm font-medium mb-1 block">Description du problème</label>
        <textarea
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded"
          placeholder="Décrivez le problème ou la maintenance requise (min 10 caractères)"
        />
      </div>

      <div className="mb-3">
        <label className="text-sm font-medium mb-1 block">Priorité</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        >
          <option value="low">Faible</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
          <option value="critical">Critique</option>
        </select>
      </div>

      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
        <Button type="submit" variant="primary" size="sm" disabled={loading}>{loading ? 'Création...' : 'Créer'}</Button>
      </div>
    </form>
  );
};

export default NewTaskForm;
