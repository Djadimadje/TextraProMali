'use client';

import React, { useEffect, useState } from 'react';
import Button from '../ui/Button';
import { maintenanceService } from '../../services/maintenanceApiService';
import { machineService } from '../../services/machineService';

interface Props {
  onClose: () => void;
  onCreated?: (created?: any) => void;
}

const InspectionForm: React.FC<Props> = ({ onClose, onCreated }) => {
  const [machines, setMachines] = useState<any[]>([]);
  const [machineId, setMachineId] = useState('');
  const [notes, setNotes] = useState('');
  const [severity, setSeverity] = useState('low');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMachines = async () => {
    try {
      const res = await machineService.getMachines({ page_size: 200, created_by_role: 'admin' });
      let list: any[] = [];
      if (res && res.success && res.data) {
        if (Array.isArray(res.data)) list = res.data;
        else if (Array.isArray((res.data as any).results)) list = (res.data as any).results;
        else if (Array.isArray((res as any).results)) list = (res as any).results;
      }
      if (list.length > 0) setMachines(list);
      else {
        const resAll = await machineService.getMachines({ page_size: 200 });
        let listAll: any[] = [];
        if (resAll && resAll.success && resAll.data) {
          if (Array.isArray(resAll.data)) listAll = resAll.data;
          else if (Array.isArray((resAll.data as any).results)) listAll = (resAll.data as any).results;
          else if (Array.isArray((resAll as any).results)) listAll = (resAll as any).results;
        }
        setMachines(listAll);
      }
    } catch (e) {
      console.error('InspectionForm: failed to load machines', e);
    }
  };

  useEffect(() => {
    loadMachines();
  }, []);

  const validate = () => {
    setError(null);
    if (!machineId) {
      setError('Veuillez sélectionner une machine');
      return false;
    }
    if (!notes || notes.trim().length < 5) {
      setError('Notes d\'inspection trop courtes (min 5 caractères)');
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
        issue_reported: `Inspection: ${notes.trim()}`,
        priority: severity
      };
      const resp = await maintenanceService.createMaintenanceLog(payload as any);
      if (resp && resp.success) {
        if (onCreated) onCreated(resp.data);
        onClose();
      } else {
        setError(resp && (resp.message || JSON.stringify(resp)) || 'Erreur inconnue');
      }
    } catch (err: any) {
      console.error('Inspection create error', err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-[520px] max-w-full">
      <h4 className="text-lg font-semibold mb-2">Inspection Machine</h4>

      <div className="mb-3">
        <label className="text-sm font-medium mb-1 block">Machine</label>
        <select value={machineId} onChange={e => setMachineId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded">
          <option value="">-- Sélectionner une machine --</option>
          {machines.map(m => (
            <option key={m.id} value={m.id}>{m.name} ({m.machine_id || m.id})</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="text-sm font-medium mb-1 block">Notes d\'inspection</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded" placeholder="Décrivez les observations"></textarea>
      </div>

      <div className="mb-3">
        <label className="text-sm font-medium mb-1 block">Sévérité</label>
        <select value={severity} onChange={e => setSeverity(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded">
          <option value="low">Faible</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
          <option value="critical">Critique</option>
        </select>
      </div>

      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
        <Button type="submit" variant="primary" size="sm" disabled={loading}>{loading ? 'Envoi...' : 'Envoyer'}</Button>
      </div>
    </form>
  );
};

export default InspectionForm;
