/**
 * SessionStats - Displays live metrics and threshold distribution
 * Fully localized (LV, EN, RU).
 */

import React from 'react';
import { SessionStatistics, ThicknessThresholds } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface SessionStatsProps {
  stats: SessionStatistics;
  thresholds: ThicknessThresholds;
}

export const SessionStats: React.FC<SessionStatsProps> = ({ stats, thresholds }) => {
  const { t } = useLanguage();
  const percentComplete = Math.round((stats.count / Math.max(1, stats.totalPoints)) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.progress}
          </h4>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {stats.count} / {stats.totalPoints} {t.pointsMeasured} ({percentComplete}%)
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full sm:w-48 bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            className="bg-sky-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {/* Metrics 4-grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Average */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
            {t.average}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {stats.avg !== null ? stats.avg.toFixed(2) : '—'}
            </span>
            <span className="text-xs text-slate-500">mm</span>
          </div>
        </div>

        {/* Min */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
            {t.minimum}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {stats.min !== null ? stats.min.toFixed(2) : '—'}
            </span>
            <span className="text-xs text-slate-500">
              {stats.minPoint !== null ? `(№${stats.minPoint})` : 'mm'}
            </span>
          </div>
        </div>

        {/* Max */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
            {t.maximum}
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {stats.max !== null ? stats.max.toFixed(2) : '—'}
            </span>
            <span className="text-xs text-slate-500">
              {stats.maxPoint !== null ? `(№${stats.maxPoint})` : 'mm'}
            </span>
          </div>
        </div>

        {/* Delta */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
            {t.delta} (Δ)
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {stats.delta !== null ? stats.delta.toFixed(2) : '—'}
            </span>
            <span className="text-xs text-slate-500">mm</span>
          </div>
        </div>
      </div>

      {/* Threshold Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-500 dark:text-slate-400">{t.legend}:</span>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="text-slate-700 dark:text-slate-300">
              &lt; {thresholds.criticalMin} mm ({t.criticallyThin})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="text-slate-700 dark:text-slate-300">
              {thresholds.criticalMin}–{thresholds.warningMin} mm ({t.belowNormal})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-700 dark:text-slate-300 font-bold">
              {thresholds.warningMin}–{thresholds.warningMax} mm ({t.optimal})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
            <span className="text-slate-700 dark:text-slate-300">
              &gt; {thresholds.warningMax} mm ({t.criticallyThick})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
