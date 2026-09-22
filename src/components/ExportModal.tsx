/**
 * ExportModal - Preview and download high-resolution PNG of the arena ice sheet
 * Fully localized (LV, EN, RU).
 */

import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import { ArenaSettings, PointLocation } from '../types';
import { generateArenaPng } from '../services/exportImage';
import { useLanguage } from '../i18n/LanguageContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ArenaSettings;
  points: PointLocation[];
  measurements: Record<number, number>;
  dateStr: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  settings,
  points,
  measurements,
  dateStr,
}) => {
  const { t, lang } = useLanguage();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      generateArenaPng(settings, points, measurements, dateStr, lang)
        .then((url) => {
          setDataUrl(url);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to generate PNG:', err);
          setLoading(false);
        });
    }
  }, [isOpen, settings, points, measurements, dateStr, lang]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    const safeArena = (settings.arenaName || 'arena').replace(/[^a-zA-Z0-9а-яА-Я_-]/g, '_');
    a.download = `ice_thickness_${safeArena}_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = async () => {
    if (!dataUrl) return;
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      if ((navigator as any).clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        handleDownload();
      }
    } catch (e) {
      console.warn('Clipboard write failed, downloading instead:', e);
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-600" />
              {t.exportModalTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.exportModalSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-slate-100 dark:bg-slate-950">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
              <span className="text-sm font-semibold">{t.generatingImage}</span>
            </div>
          ) : dataUrl ? (
            <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-xl bg-white">
              <img
                src={dataUrl}
                alt="Ice thickness diagram"
                className="w-full h-auto object-contain"
              />
            </div>
          ) : (
            <div className="text-rose-500 text-sm">{t.imageGenFailed}</div>
          )}
        </div>

        {/* Action buttons */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            PNG 1600×1100 px (30×60 m)
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopy}
              disabled={loading || !dataUrl}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t.copyImage}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              disabled={loading || !dataUrl}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadPng}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
