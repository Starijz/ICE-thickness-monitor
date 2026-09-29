/**
 * CaliperPanel - Control bar & BLE/HID manager for digital caliper
 * Touch-friendly, designed for ice rink workers with gloves.
 * Collapsible caliper settings header + persistent active point readout.
 * Fully localized (LV, EN, RU) including point names.
 */

import React, { useState, useRef } from 'react';
import {
  Bluetooth,
  BluetoothOff,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Edit3,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Radio,
  AlertCircle,
  Keyboard,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { BleConnectionStatus, PointLocation, ThicknessThresholds } from '../types';
import { getPointColor } from '../services/exportImage';
import { getLocalizedPointName } from '../data/defaultPoints';
import { useLanguage } from '../i18n/LanguageContext';

interface CaliperPanelProps {
  bleStatus: BleConnectionStatus;
  bleStatusMessage: string;
  deviceName: string | null;
  onConnectBle: () => void;
  onDisconnectBle: () => void;
  onSimulateValue: () => void;
  onHidMeasurement?: (valMm: number) => void;
  onOpenGemRedGuide?: () => void;
  hidBuffer?: string;
  lastHidValue?: number | null;
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
  onHidMeasurement,
  onOpenGemRedGuide,
  hidBuffer = '',
  lastHidValue = null,
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
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [showSimNotice, setShowSimNotice] = useState(false);
  const [hidInputFocused, setHidInputFocused] = useState(false);
  const [localHidStr, setLocalHidStr] = useState('');
  const hidInputRef = useRef<HTMLInputElement>(null);
  const hidTimerRef = useRef<any>(null);

  const commitHidString = (raw: string) => {
    if (hidTimerRef.current) {
      clearTimeout(hidTimerRef.current);
      hidTimerRef.current = null;
    }
    const normalized = raw.trim().replace(',', '.');
    const isInches = /in|inch/i.test(normalized);
    const match = normalized.match(/([+-]?\d+\.?\d*)/);
    if (!match) {
      setLocalHidStr('');
      return;
    }
    let num = parseFloat(match[1]);
    if (!isNaN(num)) {
      if (isInches) num = num * 25.4;
      const rounded = Math.round(num * 100) / 100;
      if (rounded >= 0 && rounded <= 200) {
        onHidMeasurement?.(rounded);
      }
    }
    setLocalHidStr('');
  };

  const handleHidInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalHidStr(val);
    if (hidTimerRef.current) clearTimeout(hidTimerRef.current);
    if (/\d/.test(val)) {
      hidTimerRef.current = setTimeout(() => {
        commitHidString(val);
      }, 450);
    }
  };

  const handleHidInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      commitHidString(localHidStr);
    }
  };

  const colorInfo = getPointColor(currentValue, thresholds, lang);
  const isMeasured = currentValue !== undefined && currentValue !== null;
  const localizedPointTitle = getLocalizedPointName(activePoint, lang) || t.activePoint;

  return (
    <div className="bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 p-3.5 sm:p-5">
      {/* Top Header: BLE/HID Status on Left + Expand/Collapse Chevron on Right */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        {/* BLE / HID Status indicator (clickable to toggle controls) */}
        <button
          type="button"
          onClick={() => setIsControlsExpanded((prev) => !prev)}
          className="flex items-center gap-2.5 text-left min-w-0 flex-1 group cursor-pointer"
          title={t.toggleCaliperControls}
        >
          <div className="relative flex items-center justify-center shrink-0">
            {bleStatus === 'connected' ? (
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            ) : bleStatus === 'connecting' || bleStatus === 'searching' ? (
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500"></span>
              </span>
            ) : (
              <span className="inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition">
                {t.caliperTitle}:
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  bleStatus === 'connected'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : bleStatus === 'connecting' || bleStatus === 'searching'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 animate-pulse'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {bleStatus === 'connected'
                  ? deviceName || 'HM-10 Caliper'
                  : bleStatus === 'searching'
                  ? t.bleStatus.searching
                  : bleStatus === 'connecting'
                  ? t.bleStatus.connecting
                  : t.gemRedReady}
              </span>

              {(hidBuffer || localHidStr) && (
                <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 animate-pulse">
                  {t.hidInputPrefix}: {localHidStr || hidBuffer}
                </span>
              )}
              {lastHidValue !== null && !hidBuffer && !localHidStr && (
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> HID: {lastHidValue.toFixed(2)} mm
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Right Chevron Button to Expand / Collapse Caliper Controls */}
        <button
          type="button"
          onClick={() => setIsControlsExpanded((prev) => !prev)}
          title={t.toggleCaliperControls}
          aria-expanded={isControlsExpanded}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition shrink-0 cursor-pointer ${
            isControlsExpanded
              ? 'bg-slate-800 text-sky-400 border-sky-500/50'
              : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {isControlsExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Collapsible Caliper Settings & Controls Drawer */}
      {isControlsExpanded && (
        <div className="pt-3 pb-1 border-b border-slate-800/80 space-y-2.5 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* GemRed Guide / Instructions Button */}
              {onOpenGemRedGuide && (
                <button
                  type="button"
                  onClick={onOpenGemRedGuide}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 transition active:scale-95"
                  title={t.howToConnect}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>GemRed (HID)</span>
                </button>
              )}

              {/* Sound feedback toggle */}
              <button
                type="button"
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
                type="button"
                onClick={() => onToggleAutoAdvance(!autoAdvance)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                  autoAdvance
                    ? 'bg-sky-950/60 text-sky-300 border-sky-600/50'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{t.autoAdvance}</span>
              </button>

              {/* Connect / Disconnect BLE button */}
              {bleStatus === 'connected' ? (
                <button
                  type="button"
                  onClick={onDisconnectBle}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-800 hover:bg-rose-900/50 transition"
                >
                  <BluetoothOff className="w-3.5 h-3.5" />
                  <span>{t.disconnectBle}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onConnectBle}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 shadow-sm shadow-sky-600/30 active:scale-95 transition"
                >
                  <Bluetooth className="w-3.5 h-3.5" />
                  <span>{t.connectBle} (BLE)</span>
                </button>
              )}

              {/* Simulator button */}
              <button
                type="button"
                onClick={() => {
                  onSimulateValue();
                  setShowSimNotice(true);
                  setTimeout(() => setShowSimNotice(false), 2500);
                }}
                title={t.simulateBle}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.simulateBle}</span>
              </button>
            </div>
          </div>

          {bleStatusMessage && (
            <p className="text-[11px] text-amber-300/90">{bleStatusMessage}</p>
          )}

          {/* GemRed HID Direct Smartphone / PC Receiver Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2">
            <div
              onClick={() => hidInputRef.current?.focus()}
              className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer flex-1"
            >
              <Keyboard
                className={`w-4 h-4 shrink-0 ${
                  hidInputFocused ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
                }`}
              />
              <span className="leading-snug">
                <strong className="text-white">{t.gemRedReceiverTitle}</strong>{' '}
                {t.gemRedReceiverDesc}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                ref={hidInputRef}
                type="text"
                inputMode="none"
                value={localHidStr}
                onFocus={() => setHidInputFocused(true)}
                onBlur={() => setHidInputFocused(false)}
                onChange={handleHidInputChange}
                onKeyDown={handleHidInputKeyDown}
                placeholder={hidInputFocused ? t.gemRedWaitBtn : t.gemRedTapFocus}
                className={`w-full sm:w-56 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition focus:outline-none ${
                  hidInputFocused
                    ? 'bg-emerald-950/60 border border-emerald-500/70 text-emerald-300 placeholder:text-emerald-400'
                    : 'bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-400 hover:border-amber-500/50'
                }`}
              />
              {onOpenGemRedGuide && (
                <button
                  type="button"
                  onClick={onOpenGemRedGuide}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shrink-0 transition"
                >
                  {t.howToConnect}
                </button>
              )}
            </div>
          </div>

          {/* Simulator pop-in hint */}
          {showSimNotice && (
            <div className="text-center text-xs text-amber-300 bg-amber-950/50 py-1 px-3 rounded-lg border border-amber-800/60 animate-fade-in">
              ⚡ {t.simulateBle} → #{activePoint?.number}
            </div>
          )}

          {/* Web Bluetooth fallback warning if browser doesn't support Web Bluetooth */}
          {!isBleSupported && (
            <div className="p-2.5 bg-amber-950/40 border border-amber-600/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>{t.bleNotSupported}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Active Point Readout & Controls (ALWAYS VISIBLE) */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-4 items-center">
        {/* Left: Active point details */}
        <div className="md:col-span-4 flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onOpenManualInput}
            title={t.manualInput}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-sky-500/60 flex flex-col items-center justify-center shrink-0 transition cursor-pointer active:scale-95"
          >
            <span className="text-[10px] text-slate-400 font-bold uppercase">№</span>
            <span className="text-xl sm:text-2xl font-black text-sky-400 leading-none">
              {activePoint?.number ?? '—'}
            </span>
          </button>

          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-white truncate">
              {localizedPointTitle}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
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
          className="md:col-span-4 w-full flex flex-col items-center justify-center bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-sky-500/60 rounded-2xl py-2 sm:py-3 px-3 sm:px-4 transition cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 group-hover:text-sky-400 uppercase tracking-wider mb-0.5 transition">
            <span>{activePoint ? `${t.activePoint} #${activePoint.number}` : t.manualInput}</span>
            <Edit3 className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity text-sky-400" />
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
            <div className="mt-0.5 sm:mt-1 flex items-center gap-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: colorInfo.border }}
              />
              <span className="text-xs font-semibold" style={{ color: colorInfo.border }}>
                {colorInfo.label}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-sky-400/90 font-medium mt-0.5 sm:mt-1">
              ✏️ {t.manualInput}
            </span>
          )}
        </button>

        {/* Right: Quick Touch Actions */}
        <div className="md:col-span-4 flex items-center justify-end gap-2">
          {/* Previous point */}
          <button
            type="button"
            onClick={onPrevPoint}
            disabled={!hasPrev}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white transition active:scale-95"
            title={t.prevPoint}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Manual Input (Keypad) */}
          <button
            type="button"
            onClick={onOpenManualInput}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 font-semibold text-sm transition active:scale-95"
          >
            <Edit3 className="w-4 h-4" />
            <span>{t.manualInput}</span>
          </button>

          {/* Clear value button */}
          {isMeasured && (
            <button
              type="button"
              onClick={onClearActivePoint}
              title={t.clear}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Next point */}
          <button
            type="button"
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
