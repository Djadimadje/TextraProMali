import React, { useState } from 'react';
import apiService from '../../services/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (schedule: any) => void;
}

export default function NewScheduleModal({ open, onClose, onCreated }: Props) {
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState<'production'|'quality'|'performance'|'cost'|'safety'|'custom'>('production');
  const [frequency, setFrequency] = useState<'daily'|'weekly'|'monthly'|'quarterly'|'on_demand'>('weekly');
  const [nextDate, setNextDate] = useState('');
  const [nextTime, setNextTime] = useState('09:00');
  const [recipients, setRecipients] = useState('');
  const [format, setFormat] = useState<'pdf'|'excel'|'csv'|'word'>('pdf');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!reportTitle) { alert('Le titre du rapport est requis'); return; }
    if (!nextDate) { alert('Date de prochaine exécution requise'); return; }

    setLoading(true);
    try {
      const nextRun = new Date(`${nextDate}T${nextTime}`);
      const payload = {
        report_title: reportTitle,
        report_type: reportType,
        frequency,
        next_run: nextRun.toISOString(),
        recipients: recipients.split(',').map(s => s.trim()).filter(Boolean),
        format
      };
      // Try the dedicated schedules endpoint first
      try {
        const created = await apiService.createReportSchedule(payload);
        if (onCreated) onCreated(created);
        onClose();
        return;
      } catch (err: any) {
        // If schedules endpoint is not found (404), try fallback to create a report with schedule flag
        const status = err?.response?.status;
        console.warn('createReportSchedule failed, status:', status, 'error:', err);
        if (status === 404) {
          try {
            const fallbackPayload = { ...payload, schedule: true };
            // Use generic post to /reports/ as a fallback
            const resp = await apiService.post('/reports/', fallbackPayload);
            const created = resp?.data || resp;
            if (onCreated) onCreated(created);
            onClose();
            return;
          } catch (fallbackErr) {
            console.error('Fallback create schedule failed', fallbackErr);
            throw fallbackErr;
          }
        }

        // rethrow if not handled
        throw err;
      }
    } catch (err) {
      console.error('Failed to create schedule', err);
      alert('Création du planning échouée. Voir la console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-30">
      <div className="w-full max-w-lg p-4">
        <Card padding="lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Nouvelle Planification</h3>
            <button onClick={onClose} className="text-gray-600">✕</button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Titre</label>
              <input value={reportTitle} onChange={e => setReportTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">Type</label>
                <select value={reportType} onChange={e => setReportType(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg">
                  <option value="production">Production</option>
                  <option value="quality">Qualité</option>
                  <option value="performance">Performance</option>
                  <option value="cost">Coûts</option>
                  <option value="safety">Sécurité</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Fréquence</label>
                <select value={frequency} onChange={e => setFrequency(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg">
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                  <option value="quarterly">Trimestriel</option>
                  <option value="on_demand">À la demande</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">Prochaine exécution (date)</label>
                <input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Heure</label>
                <input type="time" value={nextTime} onChange={e => setNextTime(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Destinataires (séparés par des virgules)</label>
              <input value={recipients} onChange={e => setRecipients(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="ex: team@company.com, ops@company.com" />
            </div>

            <div>
              <label className="text-sm text-gray-600">Format</label>
              <select value={format} onChange={e => setFormat(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg">
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
                <option value="word">Word</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <Button variant="secondary" size="sm" onClick={onClose}>Annuler</Button>
              <Button variant="primary" size="sm" onClick={handleSubmit} disabled={loading}>{loading ? 'En cours...' : 'Créer'}</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
