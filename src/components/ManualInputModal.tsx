/**
 * ManualInputModal - Touch-optimized numerical keypad and direct keyboard input for ice arena workers
 * Fully localized (LV, EN, RU). Supports:
 * - Arbitrary point selection (quick horizontal scroll bar and full grid picker)
 * - Touch keypad + direct hardware keyboard typing (Enter to save, Esc to close)
 * - Quick presets
 * - Save & Close, Save & Next point navigation
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Check, Delete, ChevronLeft, ChevronRight, RotateCcw, Edit3, Grid, ArrowRight } from 'lucide-react';
import { PointLocation } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface ManualInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  point: PointLocation | null;
  points?: PointLocation[];
  measurements?: Record<number, number>;
  onSelectPoint?: (pointNumber: number) => void;
  initialValue?: number;
  onSave: (value: number, advanceToNext?: boolean) => void;
  onClearPoint?: () => void;
  onPrevPoint?: () => void;
  onNextPoint?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const ManualInputModal: React.FC<ManualInputModalProps> = ({
  isOpen,
  onClose,
  point,
  points = [],
  measurements = {},
  onSelectPoint,
  initialValue,
  onSave,
  onClearPoint,
  onPrevPoint,
  onNextPoint,
  hasPrev = false,
  hasNext = false,
}) => {
  const { t } = useLanguage();
  const [valStr, setValStr] = useState<string>('');
  const [isInitialUntouched, setIsInitialUntouched] = useState<boolean>(false);
  const [showFullGrid, setShowFullGrid] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollChipsRef = useRef<HTMLDivElement>(null);

  const sortedPoints = useMemo(
    () => [...points].sort((a, b) => Number(a.number) - Number(b.number)),
    [points]
  );

  const currentPointNumber = point ? Number(point.number) : undefined;
  const currentPointMeasurement = currentPointNumber !== undefined ? measurements[currentPointNumber] : undefined;

  // Sync state whenever modal opens or active point changes
  useEffect(() => {
    if (isOpen && point) {
      const pNum = Number(point.number);
      const measuredVal = currentPointMeasurement !== undefined ? currentPointMeasurement : initialValue;
      if (measuredVal !== undefined && measuredVal !== null && !isNaN(measuredVal)) {
        const str = Number.isInteger(measuredVal)
          ? String(measuredVal)
          : measuredVal.toFixed(2).replace(/\.?0+$/, '');
        setValStr(str);
        setIsInitialUntouched(true);
      } else {
        setValStr('');
        setIsInitialUntouched(false);
      }

      // Auto-focus and select input after render
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
        // Auto scroll active chip into view
        if (scrollChipsRef.current) {
          const activeChip = scrollChipsRef.current.querySelector(`[data-chip="${pNum}"]`);
          if (activeChip) {
            activeChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen, currentPointNumber, currentPointMeasurement, initialValue]);

  if (!isOpen || !point) return null;

  const appendDigit = (digit: string) => {
    if (isInitialUntouched) {
      setIsInitialUntouched(false);
      if (digit === '.') {
        setValStr('0.');
      } else {
        setValStr(digit);
      }
      return;
    }

    if (digit === '.') {
      if (valStr.includes('.')) return;
      setValStr(valStr === '' ? '0.' : valStr + '.');
      return;
    }

    if (valStr.includes('.')) {
      const parts = valStr.split('.');
      if (parts[1] && parts[1].length >= 2) return;
    }

    const nextVal = valStr + digit;
    const parsed = parseFloat(nextVal);
    if (!isNaN(parsed) && parsed > 200) {
      return;
    }

    setValStr(nextVal);
  };

  const handleBackspace = () => {
    if (isInitialUntouched) {
      setIsInitialUntouched(false);
      setValStr('');
      return;
    }
    setValStr((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setIsInitialUntouched(false);
    setValStr('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleConfirm = (advanceNext = false) => {
    const clean = valStr.trim().replace(',', '.');
    const parsed = parseFloat(clean);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 200) {
      onSave(Math.round(parsed * 100) / 100, advanceNext);
      if (!advanceNext) {
        onClose();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsInitialUntouched(false);
    const raw = e.target.value.replace(',', '.');
    if (raw === '' || /^[0-9]*\.?[0-9]{0,2}$/.test(raw)) {
      const num = parseFloat(raw);
      if (raw === '' || isNaN(num) || num <= 200) {
        setValStr(raw);
      }
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (showFullGrid) {
        setShowFullGrid(false);
      } else {
        onClose();
      }
    }
  };

  const quickPresets = [30.0, 35.0, 38.0, 40.0, 42.0, 45.0];
  const isValidNumber = !isNaN(parseFloat(valStr.replace(',', '.'))) && parseFloat(valStr.replace(',', '.')) >= 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Point Number, Point Picker Toggle, and Navigation */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFullGrid(!showFullGrid)}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-sm transition ${
                  showFullGrid
                    ? 'bg-sky-500 text-slate-950 border-sky-400'
                    : 'bg-sky-600/20 border-sky-500/40 text-sky-400 hover:bg-sky-600/30'
                }`}
                title={t.selectPoint}
              >
                #{point.number}
              </button>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
                    {t.manualInput}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFullGrid(!showFullGrid)}
                    className="text-[10px] text-slate-400 hover:text-sky-300 underline transition"
                  >
                    ({t.selectPoint})
                  </button>
                </div>
                <h3 className="text-sm font-bold text-white truncate max-w-[150px]">
                  {point.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onPrevPoint && (
                <button
                  type="button"
                  onClick={onPrevPoint}
                  disabled={!hasPrev}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
                  title={t.prevPoint}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {onSelectPoint && points.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowFullGrid(!showFullGrid)}
                  className={`p-2 rounded-xl border transition ${
                    showFullGrid
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent'
                  }`}
                  title={t.allPoints}
                >
                  <Grid className="w-4 h-4" />
                </button>
              )}

              {onNextPoint && (
                <button
                  type="button"
                  onClick={onNextPoint}
                  disabled={!hasNext}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
                  title={t.nextPoint}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition ml-0.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Horizontal Point Chips for Direct Arbitrary Selection */}
          {sortedPoints.length > 0 && onSelectPoint && (
            <div
              ref={scrollChipsRef}
              className="mt-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 -mx-1 px-1"
            >
              {sortedPoints.map((p) => {
                const pointNum = Number(p.number);
                const isSelected = pointNum === Number(point.number);
                const isPointMeasured = measurements[pointNum] !== undefined && measurements[pointNum] !== null;

                return (
                  <button
                    key={`chip-${pointNum}`}
                    data-chip={pointNum}
                    type="button"
                    onClick={() => {
                      onSelectPoint(pointNum);
                      setShowFullGrid(false);
                    }}
                    className={`h-7 px-2 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 shadow-md ring-2 ring-sky-400/50'
                        : isPointMeasured
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 hover:bg-slate-700'
                        : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>#{pointNum}</span>
                    {isPointMeasured && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Full Grid Point Picker Drawer (when user clicks grid icon or point button) */}
        {showFullGrid && (
          <div className="p-3 bg-slate-950 border-b border-slate-800 max-h-56 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {t.allPoints} ({sortedPoints.length}):
              </span>
              <button
                type="button"
                onClick={() => setShowFullGrid(false)}
                className="text-xs text-sky-400 hover:underline"
              >
                {t.cancel}
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {sortedPoints.map((p) => {
                const pointNum = Number(p.number);
                const isSelected = pointNum === Number(point.number);
                const mVal = measurements[pointNum];
                const hasVal = mVal !== undefined && mVal !== null;

                return (
                  <button
                    key={`grid-p-${pointNum}`}
                    type="button"
                    onClick={() => {
                      onSelectPoint?.(pointNum);
                      setShowFullGrid(false);
                    }}
                    className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 border-sky-400 font-black ring-2 ring-sky-300/40'
                        : hasVal
                        ? 'bg-slate-900 border-emerald-500/50 text-white hover:border-emerald-400'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold">№{pointNum}</span>
                    <span className="text-[10px] truncate max-w-full font-mono">
                      {hasVal ? `${mVal.toFixed(1)}` : '—'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Display / Native Input */}
        <div className="p-3.5 bg-slate-950 flex flex-col items-center justify-center border-b border-slate-800">
          <label htmlFor="thickness-input" className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-sky-400" />
            <span>{t.enterThickness}</span>
          </label>

          <div className="flex items-center justify-center gap-2 w-full">
            <input
              id="thickness-input"
              ref={inputRef}
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              value={valStr}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder="0.00"
              autoComplete="off"
              className="w-44 text-center text-4xl sm:text-5xl font-mono font-black text-white bg-transparent border-b-2 border-sky-500/60 focus:border-sky-400 focus:outline-none tracking-tight py-0.5"
            />
            <span className="text-sky-400 font-bold text-xl sm:text-2xl select-none">mm</span>
          </div>

          {isInitialUntouched && (
            <span className="text-[10px] text-slate-500 mt-1">
              Нажмите цифру или пресет для замены
            </span>
          )}
        </div>

        {/* Quick Presets */}
        <div className="p-2 bg-slate-900/90 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] text-slate-400 font-semibold px-1 shrink-0">
            {t.quickPresets}:
          </span>
          {quickPresets.map((qp) => (
            <button
              key={qp}
              type="button"
              onClick={() => {
                setIsInitialUntouched(false);
                setValStr(qp.toFixed(1));
                if (inputRef.current) inputRef.current.focus();
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-sky-600/30 hover:text-sky-300 text-slate-300 border border-slate-700 shrink-0 transition active:scale-95"
            >
              {qp.toFixed(1)}
            </button>
          ))}
        </div>

        {/* Big Touch Keypad */}
        <div className="p-3 grid grid-cols-3 gap-2 flex-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => appendDigit(digit)}
              className="h-11 sm:h-12 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:bg-sky-600 active:text-white text-xl sm:text-2xl font-bold text-white shadow-sm border border-slate-700/60 flex items-center justify-center transition active:scale-95 select-none"
            >
              {digit}
            </button>
          ))}

          {/* Backspace */}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-11 sm:h-12 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 flex items-center justify-center transition active:scale-95 select-none"
            title="Delete"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Actions: Clear, Apply, Save & Next */}
        <div className="p-3 pt-0 flex flex-col gap-2">
          <div className="grid grid-cols-12 gap-2">
            {/* Clear field */}
            <button
              type="button"
              onClick={handleClear}
              className="col-span-3 h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1 transition"
              title={t.clear}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.clear}</span>
            </button>

            {/* Confirm & Save (Close modal) */}
            <button
              type="button"
              onClick={() => handleConfirm(false)}
              disabled={!isValidNumber}
              className="col-span-4 h-11 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1 shadow-md shadow-sky-600/30 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{t.apply}</span>
            </button>

            {/* Save & Advance to Next Point */}
            <button
              type="button"
              onClick={() => handleConfirm(true)}
              disabled={!isValidNumber}
              className="col-span-5 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1 shadow-md shadow-emerald-600/30 transition active:scale-95"
              title={t.saveAndNext}
            >
              <span>{t.saveAndNext}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Reset measurement for this point */}
          {initialValue !== undefined && initialValue !== null && onClearPoint && (
            <button
              type="button"
              onClick={() => {
                onClearPoint();
                onClose();
              }}
              className="py-1 text-xs text-rose-400 hover:text-rose-300 transition text-center hover:underline"
            >
              Сбросить замер точки №{point.number}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
