/**
 * PointsAdminModal - Manage configurable measurement points
 * (Add, Edit, Delete, Coordinates X/Y in meters, Presets)
 * Fully localized (LV, EN, RU).
 */

import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, MapPin } from 'lucide-react';
import { PointLocation } from '../types';
import { POINT_PRESETS } from '../data/defaultPoints';
import { useLanguage } from '../i18n/LanguageContext';

interface PointsAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: PointLocation[];
  onSavePoints: (newPoints: PointLocation[]) => void;
}

export const PointsAdminModal: React.FC<PointsAdminModalProps> = ({
  isOpen,
  onClose,
  points,
  onSavePoints,
}) => {
  const { t } = useLanguage();
  const [pointList, setPointList] = useState<PointLocation[]>([...points]);
  const [editingPoint, setEditingPoint] = useState<PointLocation | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formNumber, setFormNumber] = useState<number>(1);
  const [formName, setFormName] = useState<string>('');
  const [formX, setFormX] = useState<number>(30);
  const [formY, setFormY] = useState<number>(15);
  const [formZone, setFormZone] = useState<'defending' | 'neutral' | 'attacking'>('neutral');

  if (!isOpen) return null;

  const startAddPoint = () => {
    const nextNum = pointList.length > 0 ? Math.max(...pointList.map((p) => p.number)) + 1 : 1;
    setFormNumber(nextNum);
    setFormName(`point${nextNum}`);
    setFormX(30);
    setFormY(15);
    setFormZone('neutral');
    setIsAdding(true);
    setEditingPoint(null);
  };

  const startEditPoint = (p: PointLocation) => {
    setEditingPoint(p);
    setIsAdding(false);
    setFormNumber(p.number);
    setFormName(p.name);
    setFormX(p.x);
    setFormY(p.y);
    setFormZone(p.zone || 'neutral');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      const newPt: PointLocation = {
        id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        number: formNumber,
        name: formName || `point${formNumber}`,
        x: Math.round(Math.max(0.5, Math.min(59.5, formX)) * 10) / 10,
        y: Math.round(Math.max(0.5, Math.min(29.5, formY)) * 10) / 10,
        zone: formZone,
      };
      setPointList([...pointList, newPt]);
    } else if (editingPoint) {
      setPointList(
        pointList.map((p) =>
          p.id === editingPoint.id
            ? {
                ...p,
                number: formNumber,
                name: formName,
                x: Math.round(Math.max(0.5, Math.min(59.5, formX)) * 10) / 10,
                y: Math.round(Math.max(0.5, Math.min(29.5, formY)) * 10) / 10,
                zone: formZone,
              }
            : p
        )
      );
    }
    setIsAdding(false);
    setEditingPoint(null);
  };

  const handleDelete = (id: string) => {
    if (confirm(t.confirmDeleteSession)) {
      setPointList(pointList.filter((p) => p.id !== id));
    }
  };

  const handleLoadPreset = (presetPoints: PointLocation[]) => {
    setPointList([...presetPoints]);
  };

  const handleSaveAll = () => {
    const sorted = [...pointList].sort((a, b) => a.number - b.number);
    onSavePoints(sorted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-600" />
              {t.pointsAdminTitle} ({pointList.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.pointsAdminSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets & Add actions */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">{t.quickPresets}:</span>
            <button
              onClick={() => handleLoadPreset(POINT_PRESETS[0].points)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 transition"
            >
              {t.presetStandard24}
            </button>
            <button
              onClick={() => handleLoadPreset(POINT_PRESETS[1].points)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 transition"
            >
              {t.presetFast12}
            </button>
          </div>

          <button
            onClick={startAddPoint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t.addPoint}
          </button>
        </div>

        {/* Modal content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* Add / Edit Form */}
          {(isAdding || editingPoint) && (
            <form
              onSubmit={handleSaveForm}
              className="mb-5 p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-2xl space-y-3"
            >
              <div className="font-bold text-sm text-sky-900 dark:text-sky-300">
                {isAdding ? t.addPoint : `№${editingPoint?.number} — ${editingPoint?.name}`}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    {t.pointNumber}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formNumber}
                    onChange={(e) => setFormNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    {t.pointName}
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="point1"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    {t.pointX}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="60"
                    required
                    value={formX}
                    onChange={(e) => setFormX(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    {t.pointY}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    required
                    value={formY}
                    onChange={(e) => setFormY(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingPoint(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow"
                >
                  <Check className="w-3.5 h-3.5" />
                  {t.apply}
                </button>
              </div>
            </form>
          )}

          {/* Points Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-2.5 px-3">{t.pointNumber}</th>
                  <th className="py-2.5 px-3">{t.pointName}</th>
                  <th className="py-2.5 px-3">{t.pointX}</th>
                  <th className="py-2.5 px-3">{t.pointY}</th>
                  <th className="py-2.5 px-3 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pointList
                  .sort((a, b) => a.number - b.number)
                  .map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-2.5 px-3 font-bold text-sky-600 dark:text-sky-400">
                        №{p.number}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                        {p.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {p.x.toFixed(1)} m
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {p.y.toFixed(1)} m
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEditPoint(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {pointList.length} {t.points}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              {t.savePoints}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
