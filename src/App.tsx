/**
 * Ice Thickness Monitor PWA
 * Measurement & visualization of ice sheet thickness on 30x60m arena.
 * Bluetooth BLE digital caliper integration, Google Sheets API v4 synchronization,
 * and high-resolution PNG diagram export.
 * Fully localized in Latvian (LV), English (EN), and Russian (RU).
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Cloud,
  CloudOff,
  Download,
  History,
  MapPin,
  Save,
  Settings,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Globe,
  FileSpreadsheet,
  Menu,
  X
} from 'lucide-react';

import {
  ArenaSettings,
  BleConnectionStatus,
  MeasurementSession,
  PointLocation,
  SessionStatistics,
} from './types';
import { DEFAULT_POINTS, DEFAULT_SETTINGS, getLocalizedArenaName } from './data/defaultPoints';
import {
  initDatabase,
  getSettings,
  getInitialSettingsSync,
  saveSettings,
  getPoints,
  savePoints,
  getAllSessions,
  saveSession,
  deleteSession,
  getOfflineQueue,
  saveActiveDraft,
  getActiveDraft,
} from './db/indexedDb';
import { bleCaliper } from './services/bleCaliper';
import {
  syncSessionToGoogleSheets,
  processOfflineSyncQueue,
  getCachedToken,
} from './services/googleSheets';

import { HockeyRink } from './components/HockeyRink';
import { CaliperPanel } from './components/CaliperPanel';
import { SessionStats } from './components/SessionStats';
import { ManualInputModal } from './components/ManualInputModal';
import { SettingsModal } from './components/SettingsModal';
import { PointsAdminModal } from './components/PointsAdminModal';
import { ExportModal } from './components/ExportModal';
import { HistoryModal } from './components/HistoryModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { GemRedGuideModal } from './components/GemRedGuideModal';
import { useLanguage } from './i18n/LanguageContext';
import { Language } from './i18n/translations';

// Audio feedback helper using Web Audio API
const playTone = (frequency = 880, durationMs = 120) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (e) {
    // Ignore audio error if blocked by browser policy
  }
};

export default function App() {
  const { t, lang, setLang } = useLanguage();

  // --- Persistent State ---
  const [settings, setSettingsState] = useState<ArenaSettings>(() => getInitialSettingsSync());
  const [points, setPointsState] = useState<PointLocation[]>(DEFAULT_POINTS);
  const [sessions, setSessionsState] = useState<MeasurementSession[]>([]);

  // --- Active Session State ---
  const [measurements, setMeasurements] = useState<Record<number, number>>({});
  const [activePointNumber, setActivePointNumber] = useState<number | null>(1);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => `sess_${Date.now()}`);

  // --- BLE Caliper State ---
  const [bleStatus, setBleStatus] = useState<BleConnectionStatus>('disconnected');
  const [bleStatusMessage, setBleStatusMessage] = useState<string>('');
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [isBleSupported, setIsBleSupported] = useState<boolean>(true);

  // --- Preferences & Offline Sync ---
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);
  const [hasGoogleToken, setHasGoogleToken] = useState<boolean>(() => !!getCachedToken());
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // --- Modals State ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPointsAdminOpen, setIsPointsAdminOpen] = useState(false);
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGemRedGuideOpen, setIsGemRedGuideOpen] = useState(false);
  const [editRinkMode, setEditRinkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Bluetooth HID (GemRed Caliper Keyboard Wedge) State ---
  const [hidBuffer, setHidBuffer] = useState<string>('');
  const [lastHidValue, setLastHidValue] = useState<number | null>(null);
  const hidBufferRef = useRef<string>('');
  const hidCommitTimerRef = useRef<any>(null);

  // Active point lookup
  const activePoint = useMemo(
    () => points.find((p) => Number(p.number) === Number(activePointNumber)) || points[0] || null,
    [points, activePointNumber]
  );

  // Show notification helper
  const notify = (type: 'success' | 'error' | 'info', message: string, duration = 4000) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  };

  // Sync offline queue to Google Sheets
  const triggerQueueSync = useCallback(async () => {
    const token = getCachedToken();
    if (!token || !settings.spreadsheetId) return;

    try {
      const res = await processOfflineSyncQueue(points, settings.spreadsheetId, token);
      const queue = await getOfflineQueue();
      setOfflineQueueCount(queue.length);
      if (res.processed > 0) {
        const updated = await getAllSessions();
        setSessionsState(updated);
        notify('success', `${t.syncSuccess}: ${res.processed}`);
      }
    } catch (e) {
      console.warn('Sync queue attempt failed:', e);
    }
  }, [settings, points, t.syncSuccess]);

  // 1. Initial Load & Setup (runs strictly once on component mount)
  useEffect(() => {
    setIsBleSupported(bleCaliper.isSupported());

    async function loadData() {
      try {
        await initDatabase();
        const loadedSettings = await getSettings();
        if (loadedSettings) setSettingsState(loadedSettings);

        const loadedPoints = await getPoints();
        if (loadedPoints && loadedPoints.length > 0) {
          setPointsState(loadedPoints);
          setActivePointNumber((current) => {
            if (current !== null && loadedPoints.some((p) => Number(p.number) === Number(current))) {
              return current;
            }
            return Number(loadedPoints[0].number);
          });
        }

        const loadedSessions = await getAllSessions();
        setSessionsState(loadedSessions);

        const draft = await getActiveDraft();
        if (draft && draft.measurements && Object.keys(draft.measurements).length > 0) {
          setMeasurements(draft.measurements);
          if (draft.sessionId) setCurrentSessionId(draft.sessionId);
        }

        const queue = await getOfflineQueue();
        setOfflineQueueCount(queue.length);
        setHasGoogleToken(!!getCachedToken());
      } catch (err) {
        console.error('Failed to initialize database:', err);
      }
    }

    loadData();
  }, []);

  // Online network reconnect sync listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerQueueSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerQueueSync]);

  // Helper to calculate next and prev point numbers by sorted order
  const nextNumberBySort = (
    currentNum: number | null,
    pointsList: PointLocation[]
  ): number => {
    if (!pointsList || pointsList.length === 0) return 1;
    const sorted = [...pointsList].sort((a, b) => Number(a.number) - Number(b.number));
    if (currentNum === null) return Number(sorted[0].number);
    const currentIndex = sorted.findIndex((p) => Number(p.number) === Number(currentNum));
    if (currentIndex >= 0 && currentIndex < sorted.length - 1) {
      return Number(sorted[currentIndex + 1].number);
    }
    return Number(sorted[0].number);
  };

  const prevNumberBySort = (
    currentNum: number | null,
    pointsList: PointLocation[]
  ): number => {
    if (!pointsList || pointsList.length === 0) return 1;
    const sorted = [...pointsList].sort((a, b) => Number(a.number) - Number(b.number));
    if (currentNum === null) return Number(sorted[0].number);
    const currentIndex = sorted.findIndex((p) => Number(p.number) === Number(currentNum));
    if (currentIndex > 0) {
      return Number(sorted[currentIndex - 1].number);
    }
    return Number(sorted[sorted.length - 1].number);
  };

  // Next and Prev point handlers
  const handleNextPoint = useCallback(() => {
    setActivePointNumber((prev) => nextNumberBySort(prev, points));
  }, [points]);

  const handlePrevPoint = useCallback(() => {
    setActivePointNumber((prev) => prevNumberBySort(prev, points));
  }, [points]);

  // Handle point selection & manual input modal opening
  const handleSelectPoint = useCallback((pointNum: number) => {
    setActivePointNumber(Number(pointNum));
  }, []);

  const handleOpenManualInput = useCallback((pointNum?: number) => {
    if (pointNum !== undefined && pointNum !== null) {
      setActivePointNumber(Number(pointNum));
    }
    setIsManualInputOpen(true);
  }, []);

  // Apply measurement to point
  const applyMeasurement = useCallback(
    (pointNum: number, value: number, shouldAdvance = false) => {
      const numKey = Number(pointNum);
      const roundedVal = Math.round(value * 100) / 100;

      setMeasurements((prev) => {
        const next = { ...prev, [numKey]: roundedVal };
        saveActiveDraft(next, currentSessionId);
        return next;
      });

      if (soundEnabled) {
        playTone(1050, 140);
      }

      if (shouldAdvance) {
        setActivePointNumber((prev) => nextNumberBySort(prev !== null ? prev : numKey, points));
      }
    },
    [soundEnabled, currentSessionId, points]
  );

  // BLE Caliper callbacks
  useEffect(() => {
    const unsubStatus = bleCaliper.onStatusChange((status, message) => {
      setBleStatus(status);
      if (message) setBleStatusMessage(message);
    });

    const unsubMeasurement = bleCaliper.onMeasurement((valMm) => {
      if (activePointNumber !== null) {
        applyMeasurement(activePointNumber, valMm, autoAdvance);
      }
    });

    return () => {
      unsubStatus();
      unsubMeasurement();
    };
  }, [activePointNumber, applyMeasurement, autoAdvance]);

  // Handle measurement arriving from GemRed Bluetooth HID Caliper
  const handleHidMeasurement = useCallback(
    (valMm: number) => {
      const targetPoint = activePointNumber ?? (points[0] ? Number(points[0].number) : 1);
      setLastHidValue(valMm);
      applyMeasurement(targetPoint, valMm, autoAdvance);
      notify('success', `GemRed: ${valMm.toFixed(2)} mm → №${targetPoint}`, 2500);
    },
    [activePointNumber, points, applyMeasurement, autoAdvance]
  );

  // Global keydown listener for Bluetooth HID Caliper (GemRed sends digits + Enter/Tab)
  useEffect(() => {
    const commitBuffer = () => {
      if (hidCommitTimerRef.current) {
        clearTimeout(hidCommitTimerRef.current);
        hidCommitTimerRef.current = null;
      }
      const raw = hidBufferRef.current.trim();
      hidBufferRef.current = '';
      setHidBuffer('');
      if (!raw) return;

      const parsed = bleCaliper.parseCaliperString(raw);
      if (parsed !== null) {
        handleHidMeasurement(parsed);
      }
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside an input, textarea, or select element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (isSettingsOpen || isPointsAdminOpen || isManualInputOpen || isGemRedGuideOpen) {
        return;
      }

      if (/^[0-9.,+-]$/.test(e.key)) {
        hidBufferRef.current += e.key;
        setHidBuffer(hidBufferRef.current);

        if (hidCommitTimerRef.current) clearTimeout(hidCommitTimerRef.current);
        hidCommitTimerRef.current = setTimeout(() => {
          commitBuffer();
        }, 500);
      } else if ((e.key === 'Enter' || e.key === 'Tab') && hidBufferRef.current.length > 0) {
        e.preventDefault();
        commitBuffer();
      } else if (e.key === 'Escape' && hidBufferRef.current.length > 0) {
        hidBufferRef.current = '';
        setHidBuffer('');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [
    handleHidMeasurement,
    isSettingsOpen,
    isPointsAdminOpen,
    isManualInputOpen,
    isGemRedGuideOpen,
  ]);

  // Connect BLE Caliper
  const handleConnectBle = async () => {
    try {
      const connected = await bleCaliper.connect(
        settings.bleServiceUuid,
        settings.bleCharacteristicUuid
      );
      if (connected) {
        const dev = bleCaliper.getDevice();
        setDeviceName(dev?.name || 'BLE Caliper');
        notify('success', `${dev?.name || 'BLE'} ${t.connected}`);
      } else if (bleCaliper.getStatus() === 'error') {
        // Show GemRed / HID setup guide when Web Bluetooth is blocked or unsupported
        setIsGemRedGuideOpen(true);
      }
    } catch (e: any) {
      if (e.name !== 'NotFoundError') {
        setIsGemRedGuideOpen(true);
      }
    }
  };

  const handleDisconnectBle = async () => {
    await bleCaliper.disconnect();
    setDeviceName(null);
    notify('info', t.disconnected);
  };

  // Simulate caliper measurement for test / demo
  const handleSimulateValue = () => {
    if (activePointNumber === null) return;
    const base = 38.0 + (Math.random() * 8.0 - 4.0);
    const value = Math.round(base * 100) / 100;
    applyMeasurement(activePointNumber, value, autoAdvance);
  };

  // Clear active point value
  const handleClearActivePoint = () => {
    if (activePointNumber === null) return;
    setMeasurements((prev) => {
      const next = { ...prev };
      delete next[activePointNumber];
      saveActiveDraft(next, currentSessionId);
      return next;
    });
  };

  // Clear whole session
  const handleResetSession = () => {
    if (Object.keys(measurements).length === 0) return;
    if (confirm(t.confirmResetSession)) {
      setMeasurements({});
      const newSessId = `sess_${Date.now()}`;
      setCurrentSessionId(newSessId);
      saveActiveDraft({}, newSessId);
      if (points[0]) setActivePointNumber(points[0].number);
      notify('info', t.sessionStarted);
    }
  };

  // Format date helper with locale
  const getFormattedDate = useCallback(() => {
    const locale = lang === 'lv' ? 'lv-LV' : lang === 'en' ? 'en-US' : 'ru-RU';
    return new Date().toLocaleString(locale);
  }, [lang]);

  // Save Session & Sync with Google Sheets
  const handleSaveSession = async () => {
    const measuredCount = Object.keys(measurements).length;
    if (measuredCount === 0) {
      notify('error', t.noMeasurementsToSave);
      return;
    }

    setIsSaving(true);
    const now = new Date();
    const newSession: MeasurementSession = {
      id: currentSessionId,
      timestamp: now.toISOString(),
      formattedDate: getFormattedDate(),
      arenaName: getLocalizedArenaName(settings.arenaName, lang),
      measurements: { ...measurements },
      pointsConfig: [...points],
      syncedToGoogleSheets: false,
    };

    try {
      // 1. Save to local IndexedDB
      await saveSession(newSession);

      // 2. Try sync with Google Sheets
      const syncRes = await syncSessionToGoogleSheets(newSession, points, settings.spreadsheetId);
      if (syncRes.success) {
        newSession.syncedToGoogleSheets = true;
        await saveSession(newSession);
        notify('success', t.syncSuccess);
      } else if (syncRes.queuedLocally) {
        const queue = await getOfflineQueue();
        setOfflineQueueCount(queue.length);
        notify('info', syncRes.message);
      } else {
        notify('error', syncRes.message);
      }

      // Update session list
      const updated = await getAllSessions();
      setSessionsState(updated);
      // Reset draft
      saveActiveDraft({}, `sess_${Date.now()}`);
    } catch (e: any) {
      notify('error', `${t.syncError}: ${e.message || e}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Update Points coords from rink drag/click
  const handleUpdatePointCoords = (pointId: string, x: number, y: number) => {
    const updated = points.map((p) => (p.id === pointId ? { ...p, x, y } : p));
    setPointsState(updated);
    savePoints(updated);
  };

  // Save modified settings
  const handleSaveSettings = async (newSettings: ArenaSettings) => {
    setSettingsState(newSettings);
    await saveSettings(newSettings);
    setHasGoogleToken(!!getCachedToken());
    notify('success', t.settingsSaved);
  };

  // Save modified points list
  const handleSavePoints = async (newPoints: PointLocation[]) => {
    setPointsState(newPoints);
    await savePoints(newPoints);
    if (!newPoints.some((p) => p.number === activePointNumber) && newPoints[0]) {
      setActivePointNumber(newPoints[0].number);
    }
    notify('success', t.pointsUpdated);
  };

  // Load session from history
  const handleLoadSession = (session: MeasurementSession) => {
    setMeasurements({ ...session.measurements });
    if (session.pointsConfig && session.pointsConfig.length > 0) {
      setPointsState(session.pointsConfig);
    }
    setCurrentSessionId(session.id);
    notify('info', `${t.sessionLoaded} ${session.formattedDate || session.timestamp}`);
  };

  // Delete session from history
  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId);
    const updated = await getAllSessions();
    setSessionsState(updated);
    notify('info', t.sessionDeleted);
  };

  // Resync specific session
  const handleResyncSession = async (session: MeasurementSession) => {
    const res = await syncSessionToGoogleSheets(session, points, settings.spreadsheetId);
    if (res.success) {
      session.syncedToGoogleSheets = true;
      await saveSession(session);
      const updated = await getAllSessions();
      setSessionsState(updated);
      notify('success', t.syncSuccess);
    } else {
      notify('error', res.message);
    }
  };

  // Calculate Statistics
  const stats: SessionStatistics = useMemo(() => {
    const values: number[] = Object.values(measurements).filter(
      (v): v is number => typeof v === 'number' && !isNaN(v)
    );
    const count = values.length;
    if (count === 0) {
      return {
        count: 0,
        totalPoints: points.length,
        min: null,
        max: null,
        avg: null,
        delta: null,
        minPoint: null,
        maxPoint: null,
        optimalPercentage: 0,
      };
    }

    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let minPoint: number | null = null;
    let maxPoint: number | null = null;
    let optimalCount = 0;

    Object.entries(measurements).forEach(([pointStr, val]) => {
      const pNum = parseInt(pointStr, 10);
      const numVal = Number(val);
      if (isNaN(numVal)) return;

      sum += numVal;
      if (numVal < min) {
        min = numVal;
        minPoint = pNum;
      }
      if (numVal > max) {
        max = numVal;
        maxPoint = pNum;
      }
      if (
        numVal >= settings.thresholds.warningMin &&
        numVal <= settings.thresholds.warningMax
      ) {
        optimalCount++;
      }
    });

    const avg = sum / count;
    const delta = max - min;
    const optimalPercentage = Math.round((optimalCount / count) * 100);

    return {
      count,
      totalPoints: points.length,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      avg: Math.round(avg * 100) / 100,
      delta: Math.round(delta * 100) / 100,
      minPoint,
      maxPoint,
      optimalPercentage,
    };
  }, [measurements, points, settings.thresholds]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* --- TOP APP BAR --- */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="max-w-7xl mx-auto">
          {/* Main Top Line: Brand on Left, Primary Save + Mobile Menu on Right */}
          <div className="flex items-center justify-between gap-2">
            {/* Brand & Arena Name */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/30 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs">
                    {getLocalizedArenaName(settings.arenaName, lang)}
                  </h1>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 uppercase shrink-0">
                    30×60 m
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  <span className="hidden md:inline">PWA • BLE •</span>
                  <span className="flex items-center gap-1">
                    {isOnline ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Cloud className="w-3 h-3" /> <span className="hidden sm:inline">{t.online}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <CloudOff className="w-3 h-3" /> <span className="hidden sm:inline">{t.offline}</span>
                      </span>
                    )}
                  </span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-1 hover:underline text-left cursor-pointer"
                    title={settings.spreadsheetId ? (hasGoogleToken ? t.authorizedAs : t.signInGoogle) : t.spreadsheetIdHelp}
                  >
                    <FileSpreadsheet className="w-3 h-3" />
                    {settings.spreadsheetId ? (
                      hasGoogleToken ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Sheets</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">Sheets: {t.signInGoogle}</span>
                      )
                    ) : (
                      <span className="text-slate-400 font-medium">Sheets?</span>
                    )}
                  </button>
                  {offlineQueueCount > 0 && (
                    <span
                      onClick={triggerQueueSync}
                      className="cursor-pointer text-amber-500 font-bold bg-amber-100 dark:bg-amber-950/60 px-1 py-0.2 rounded text-[10px]"
                      title={t.resyncGoogle}
                    >
                      Q:{offlineQueueCount}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Primary Save Action + Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Save Session Button - prominently placed on top line for ALL devices */}
              <button
                onClick={handleSaveSession}
                disabled={isSaving || Object.keys(measurements).length === 0}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white shadow-md shadow-emerald-600/30 transition active:scale-95 shrink-0"
                title={t.saveSession}
              >
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">
                  {isSaving ? t.syncing : t.saveSession}
                </span>
                <span className="sm:hidden">
                  {isSaving ? '...' : stats.count > 0 ? `${t.saveSession.slice(0, 5)} (${stats.count})` : t.saveSession.slice(0, 5)}
                </span>
              </button>

              {/* Reset Session on top bar when active measurements exist */}
              {Object.keys(measurements).length > 0 && (
                <button
                  onClick={handleResetSession}
                  title={t.resetSession}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              {/* Mobile Menu Toggle Button (visible on mobile only) */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-1.5 rounded-xl border sm:hidden transition ${
                  isMobileMenuOpen
                    ? 'bg-sky-600 text-white border-sky-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
                title={t.settings}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Desktop-only action buttons */}
              <div className="hidden sm:flex items-center gap-1.5">
                {/* Quick Language Selector */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
                  {(['lv', 'en', 'ru'] as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`px-2 py-1 rounded-lg text-xs font-extrabold uppercase transition ${
                        lang === l
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title={l === 'lv' ? 'Latviešu' : l === 'en' ? 'English' : 'Русский'}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                <PWAInstallButton />

                {/* History Button */}
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  title={t.history}
                >
                  <History className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>{t.history}</span>
                  {sessions.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 text-[10px] font-bold flex items-center justify-center">
                      {sessions.length}
                    </span>
                  )}
                </button>

                {/* Points Config Button */}
                <button
                  onClick={() => setIsPointsAdminOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  title={t.points}
                >
                  <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>{t.points} ({points.length})</span>
                </button>

                {/* Settings Button */}
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
                  title={t.settings}
                >
                  <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>

                {/* Export PNG Button */}
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600 transition shadow-sm"
                  title={t.exportPng}
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>PNG</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Quick-Actions Swipe Bar (Smooth scrollable row on smartphones) */}
          <div className="sm:hidden mt-2 pt-1.5 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 -mx-1 px-1">
            {/* Quick Language Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 shrink-0">
              {(['lv', 'en', 'ru'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded-lg text-xs font-black uppercase transition ${
                    lang === l
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <PWAInstallButton />

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0 transition"
            >
              <History className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{t.history}</span>
              {sessions.length > 0 && (
                <span className="px-1 rounded-full bg-slate-300 dark:bg-slate-700 text-[10px] font-bold">
                  {sessions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsPointsAdminOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{t.points} ({points.length})</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0 transition"
              title={t.settings}
            >
              <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>

            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 shrink-0 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>PNG</span>
            </button>
          </div>

          {/* Expandable Mobile Menu Drawer (when hamburger clicked) */}
          {isMobileMenuOpen && (
            <div className="sm:hidden mt-2 p-3 bg-slate-50 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg animate-fade-in flex flex-col gap-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {t.settings} & {t.history}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsHistoryOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 text-left active:scale-95 transition"
                >
                  <History className="w-4 h-4 text-sky-500" />
                  <span>{t.history} ({sessions.length})</span>
                </button>

                <button
                  onClick={() => {
                    setIsPointsAdminOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 text-left active:scale-95 transition"
                >
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>{t.points} ({points.length})</span>
                </button>

                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 text-left active:scale-95 transition"
                >
                  <Settings className="w-4 h-4 text-amber-500" />
                  <span>{t.settings}</span>
                </button>

                <button
                  onClick={() => {
                    setIsExportOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 text-left active:scale-95 transition"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>{t.exportPng}</span>
                </button>
              </div>

              {Object.keys(measurements).length > 0 && (
                <button
                  onClick={() => {
                    handleResetSession();
                    setIsMobileMenuOpen(false);
                  }}
                  className="mt-1 flex items-center justify-center gap-1.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs font-semibold active:scale-95 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.resetSession}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* --- NOTIFICATION TOAST --- */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 animate-bounce-in max-w-sm">
          <div
            className={`p-3.5 rounded-2xl shadow-xl border flex items-start gap-2.5 text-xs font-medium backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700'
                : notification.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-700'
                : 'bg-sky-950/90 text-sky-200 border-sky-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : notification.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">{notification.message}</div>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4 sm:space-y-5">
        {/* 1. BLUETOOTH CALIPER CONTROL BAR */}
        <CaliperPanel
          bleStatus={bleStatus}
          bleStatusMessage={bleStatusMessage}
          deviceName={deviceName}
          onConnectBle={handleConnectBle}
          onDisconnectBle={handleDisconnectBle}
          onSimulateValue={handleSimulateValue}
          onHidMeasurement={handleHidMeasurement}
          onOpenGemRedGuide={() => setIsGemRedGuideOpen(true)}
          hidBuffer={hidBuffer}
          lastHidValue={lastHidValue}
          activePoint={activePoint}
          currentValue={
            activePointNumber !== null ? measurements[Number(activePointNumber)] : undefined
          }
          onOpenManualInput={() => handleOpenManualInput()}
          onClearActivePoint={handleClearActivePoint}
          onPrevPoint={handlePrevPoint}
          onNextPoint={handleNextPoint}
          hasPrev={activePointNumber !== null && points.length > 0}
          hasNext={activePointNumber !== null && points.length > 0}
          autoAdvance={autoAdvance}
          onToggleAutoAdvance={setAutoAdvance}
          soundEnabled={soundEnabled}
          onToggleSound={setSoundEnabled}
          thresholds={settings.thresholds}
          isBleSupported={isBleSupported}
        />

        {/* 2. INTERACTIVE HOCKEY RINK (30x60m) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 sm:p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t.rinkSchemeTitle}
              </h2>
              <span className="text-xs text-slate-400">
                ({t.clickToSelect})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditRinkMode(!editRinkMode)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                  editRinkMode
                    ? 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950 dark:text-amber-200'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent'
                }`}
              >
                {editRinkMode ? `✓ ${t.movePointsMode}` : t.movePointsMode}
              </button>
            </div>
          </div>

          {editRinkMode && (
            <div className="mb-3 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              ⚡ {t.clickToMove} №{activePointNumber}.
            </div>
          )}

          {/* Scalable SVG Ice Rink */}
          <HockeyRink
            points={points}
            measurements={measurements}
            activePointNumber={activePointNumber}
            onSelectPoint={handleSelectPoint}
            onOpenManualInput={handleOpenManualInput}
            thresholds={settings.thresholds}
            editMode={editRinkMode}
            onUpdatePointCoords={handleUpdatePointCoords}
          />
        </div>

        {/* 3. SESSION METRICS & THRESHOLD LEGEND */}
        <SessionStats stats={stats} thresholds={settings.thresholds} />
      </main>

      {/* --- FOOTER --- */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-4 px-4 bg-white/50 dark:bg-slate-900/50 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            {getLocalizedArenaName(settings.arenaName, lang)} • 30×60 m
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:underline text-slate-600 dark:text-slate-400"
            >
              Google Sheets API
            </button>
            <span>•</span>
            <span>Bluetooth Low Energy 4.0/5.0</span>
          </div>
        </div>
      </footer>

      {/* --- MODALS --- */}
      <ManualInputModal
        isOpen={isManualInputOpen}
        onClose={() => setIsManualInputOpen(false)}
        point={activePoint}
        points={points}
        measurements={measurements}
        onSelectPoint={handleSelectPoint}
        initialValue={
          activePointNumber !== null ? measurements[Number(activePointNumber)] : undefined
        }
        onSave={(val, advanceNext) => {
          const targetPointNum = activePoint ? Number(activePoint.number) : activePointNumber;
          if (targetPointNum !== null) {
            applyMeasurement(targetPointNum, val, advanceNext);
          }
        }}
        onClearPoint={handleClearActivePoint}
        onPrevPoint={handlePrevPoint}
        onNextPoint={handleNextPoint}
        hasPrev={activePointNumber !== null && points.length > 0}
        hasNext={activePointNumber !== null && points.length > 0}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setHasGoogleToken(!!getCachedToken());
        }}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <PointsAdminModal
        isOpen={isPointsAdminOpen}
        onClose={() => setIsPointsAdminOpen(false)}
        points={points}
        onSavePoints={handleSavePoints}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        settings={settings}
        points={points}
        measurements={measurements}
        dateStr={getFormattedDate()}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        points={points}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        onResyncSession={handleResyncSession}
      />

      <GemRedGuideModal
        isOpen={isGemRedGuideOpen}
        onClose={() => setIsGemRedGuideOpen(false)}
        onTestMeasurement={handleHidMeasurement}
        onTryWebBle={handleConnectBle}
      />
    </div>
  );
}
