/**
 * CaliperPanel - Control bar & BLE manager for digital caliper
 * Touch-friendly, designed for ice rink workers with gloves.
 * Fully localized (LV, EN, RU).
 */

import React, { useState } from 'react';
import {
  Bluetooth,
  BluetoothOff,
  ChevronLeft,
  ChevronRight,
  Edit3,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Radio,
  AlertCircle
} from 'lucide-react';
import { BleConnectionStatus, PointLocation, ThicknessThresholds } from '../types';
import { getPointColor } from '../services/exportImage';
import { useLanguage } from '../i18n/LanguageContext';

interface CaliperPanelProps {
  bleStatus: BleConnectionStatus;
  bleStatusMessage: string;
  deviceName: string | null;
  onConnectBle: () => void;
  onDisconnectBle: () => void;
  onSimulateValue: () => void;
  activePoint: PointLocation | null;
  currentValue: number | undefined;
  onOpenManualInput: () => void;
  onClearActivePoint: () => void;
  onPrevPoint: () => void;
  onNextPoint: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  autoAdvance: boolean;
  onToggleAutoAdvance: (val: boolean) => void;
  soundEnabled: boolean;
  onToggleSound: (val: boolean) => void;
  thresholds: ThicknessThresholds;
  isBleSupported: boolean;
}

export const CaliperPanel: React.FC<CaliperPanelProps> = ({
  bleStatus,
  bleStatusMessage,
  deviceName,
  onConnectBle,
  onDisconnectBle,
  onSimulateValue,
  activePoint,
  currentValue,
  onOpenManualInput,
  onClearActivePoint,
  onPrevPoint,
  onNextPoint,
  hasPrev,
  hasNext,
  autoAdvance,
  onToggleAutoAdvance,
  soundEnabled,
  onToggleSound,
  thresholds,
  isBleSupported,
}) => {
  const { t, lang } = useLanguage();
  const [showSimNotice, setShowSimNotice] = useState(false);

  const colorInfo = getPointColor(currentValue, thresholds, lang);
  const isMeasured = currentValue !== undefined && currentValue !== null;

  return (
    <div className="bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 p-4 sm:p-5">
      {/* Top Header: BLE Connection status & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        {/* BLE Status indicator */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {bleStatus === 'connected' ? (
              <span className="flex h-4 w-4 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
            ) : bleStatus === 'connecting' || bleStatus === 'searching' ? (
              <span className="flex h-4 w-4 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
              </span>
            ) : (
              <span className="inline-flex rounded-full h-3.5 w-3.5 bg-slate-500"></span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t.caliperTitle}:
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  bleStatus === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : bleStatus === 'connecting' || bleStatus === 'searching'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {bleStatus === 'connected'
                  ? deviceName || 'HM-10 Caliper'
                  : bleStatus === 'searching'
                  ? t.bleStatus.searching
                  : bleStatus === 'connecting'
                  ? t.bleStatus.connecting
                  : t.bleStatus.disconnected}
              </span>
            </div>
            {bleStatusMessage && (
              <p className="text-[11px] text-slate-400 truncate max-w-xs">{bleStatusMessage}</p>
            )}
          </div>
        </div>

        {/* Action buttons & controls */}
        <div className="flex items-center gap-2">
          {/* Sound feedback toggle */}
          <button
            onClick={() => onToggleSound(!soundEnabled)}
            title={soundEnabled ? `${t.sound}: On` : `${t.sound}: Off`}
            className={`p-2 rounded-xl border transition ${
              soundEnabled
                ? 'bg-slate-800 text-sky-400 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-800/40 text-slate-500 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Auto advance toggle */}
          <button
            onClick={() => onToggleAutoAdvance(!autoAdvance)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              autoAdvance
                ? 'bg-sky-950/60 text-sky-300 border-sky-600/50'
                : 'bg-slate-800/60 text-slate-400 border-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.autoAdvance}</span>
          </button>

          {/* Connect / Disconnect button */}
          {bleStatus === 'connected' ? (
            <button
              onClick={onDisconnectBle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-800 hover:bg-rose-900/50 transition"
            >
              <BluetoothOff className="w-3.5 h-3.5" />
              {t.disconnectBle}
            </button>
          ) : (
            <button
              onClick={onConnectBle}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 shadow-sm shadow-sky-600/30 active:scale-95 transition"
            >
              <Bluetooth className="w-3.5 h-3.5" />
              {t.connectBle}
            </button>
          )}

          {/* Simulator button (for testing without physical Bluetooth caliper) */}
          <button
            onClick={() => {
              onSimulateValue();
              setShowSimNotice(true);
              setTimeout(() => setShowSimNotice(false), 2500);
            }}
            title={t.simulateBle}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.simulateBle}</span>
          </button>
        </div>
      </div>

      {/* Simulator pop-in hint */}
      {showSimNotice && (
        <div className="mt-2 text-center text-xs text-amber-300 bg-amber-950/50 py-1 px-3 rounded-lg border border-amber-800/60 animate-fade-in">
          ⚡ {t.simulateBle} → #{activePoint?.number}
        </div>
      )}

      {/* Web Bluetooth fallback warning if browser doesn't support Web Bluetooth */}
      {!isBleSupported && (
        <div className="mt-2.5 p-2.5 bg-amber-950/40 border border-amber-600/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>{t.bleNotSupported}</strong>
          </div>
        </div>
      )}

      {/* Main Active Point Readout & Controls */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left: Active point details */}
        <div className="md:col-span-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenManualInput}
            title={t.manualInput}
            className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-sky-500/60 flex flex-col items-center justify-center shrink-0 transition cursor-pointer active:scale-95"
          >
            <span className="text-[10px] text-slate-400 font-bold uppercase">№</span>
            <span className="text-2xl font-black text-sky-400 leading-none">
              {activePoint?.number ?? '—'}
            </span>
          </button>

          <div className="min-w-0">
            <h3 className="font-bold text-base text-white truncate">
              {activePoint?.name || t.activePoint}
            </h3>
            <p className="text-xs text-slate-400 truncate">
              {activePoint
                ? `${t.pointCoord}: X=${activePoint.x.toFixed(1)}m, Y=${activePoint.y.toFixed(1)}m`
                : t.rinkTip}
            </p>
          </div>
        </div>

        {/* Center: Big Thickness Value Display (Clickable for Manual Input) */}
        <button
          type="button"
          onClick={onOpenManualInput}
          title={t.manualInput}
          className="md:col-span-4 w-full flex flex-col items-center justify-center bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-sky-500/60 rounded-2xl py-3 px-4 transition cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 group-hover:text-sky-400 uppercase tracking-wider mb-0.5 transition">
            <span>{t.appSubtitle}</span>
            <Edit3 className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight group-hover:scale-105 transition-transform"
              style={{ color: isMeasured ? colorInfo.border : '#64748b' }}
            >
              {isMeasured ? currentValue.toFixed(2) : '—.—'}
            </span>
            <span className="text-slate-400 text-sm font-semibold">mm</span>
          </div>

          {isMeasured ? (
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: colorInfo.border }}
              />
              <span className="text-xs font-semibold" style={{ color: colorInfo.border }}>
                {colorInfo.label}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-sky-400/90 font-medium mt-1">
              ✏️ {t.manualInput}
            </span>
          )}
        </button>

        {/* Right: Quick Touch Actions */}
        <div className="md:col-span-4 flex items-center justify-end gap-2">
          {/* Previous point */}
          <button
            onClick={onPrevPoint}
            disabled={!hasPrev}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white transition active:scale-95"
            title={t.prevPoint}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Manual Input (Keypad) */}
          <button
            onClick={onOpenManualInput}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 font-semibold text-sm transition active:scale-95"
          >
            <Edit3 className="w-4 h-4" />
            <span>{t.manualInput}</span>
          </button>

          {/* Clear value button */}
          {isMeasured && (
            <button
              onClick={onClearActivePoint}
              title={t.clear}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Next point */}
          <button
            onClick={onNextPoint}
            disabled={!hasNext}
            className="p-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:pointer-events-none text-white transition active:scale-95 shadow-md shadow-sky-900/30"
            title={t.nextPoint}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
