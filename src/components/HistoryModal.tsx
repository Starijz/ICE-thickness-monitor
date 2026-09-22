/**
 * HistoryModal - Displays past measurement sessions with sync status,
 * re-export to PNG, resync to Google Sheets, and CSV export.
 * Fully localized (LV, EN, RU).
 */

import React from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Trash2,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { MeasurementSession, PointLocation } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: MeasurementSession[];
  points: PointLocation[];
  onLoadSession: (session: MeasurementSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onResyncSession: (session: MeasurementSession) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  points,
  onLoadSession,
  onDeleteSession,
  onResyncSession,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const exportAllToCsv = () => {
    if (sessions.length === 0) return;

    const sortedPoints = [...points].sort((a, b) => a.number - b.number);
    const headers = ['ID', 'Date', ...sortedPoints.map((p) => `point${p.number}`)];

    const rows = sessions.map((s) => {
      const row = [s.id, s.formattedDate || s.timestamp];
      sortedPoints.forEach((p) => {
        row.push(s.measurements[p.number] !== undefined ? `${s.measurements[p.number]}` : '');
      });
      return row.join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ice_sessions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-600" />
              {t.historyTitle} ({sessions.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.historySubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {t.localQueue}
          </span>

          <button
            onClick={exportAllToCsv}
            disabled={sessions.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white shadow transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            {t.exportCsv}
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {sessions.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              {t.noSessions}
            </div>
          ) : (
            sessions.map((s) => {
              const measuredCount = Object.keys(s.measurements).length;
              const values: number[] = Object.values(s.measurements);
              const avg =
                values.length > 0
                  ? (values.reduce((a: number, b: number) => a + b, 0) / values.length).toFixed(2)
                  : '—';

              return (
                <div
                  key={s.id}
                  className="p-4 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-sky-500/50 transition shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {s.formattedDate || new Date(s.timestamp).toLocaleString()}
                      </span>
                      {s.syncedToGoogleSheets ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          {t.inGoogleSheet}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          <AlertCircle className="w-3 h-3" />
                          {t.localQueue}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        {t.points}: <strong className="text-slate-700 dark:text-slate-200">{measuredCount}</strong>
                      </span>
                      <span>
                        {t.average}: <strong className="text-slate-700 dark:text-slate-200">{avg} mm</strong>
                      </span>
                      {s.arenaName && <span className="truncate max-w-[150px]">{s.arenaName}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!s.syncedToGoogleSheets && (
                      <button
                        onClick={() => onResyncSession(s)}
                        title={t.resyncGoogle}
                        className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-300 hover:bg-sky-100 transition"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onLoadSession(s);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {t.viewOnRink}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(t.confirmDeleteSession)) {
                          onDeleteSession(s.id);
                        }
                      }}
                      title="Delete"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
