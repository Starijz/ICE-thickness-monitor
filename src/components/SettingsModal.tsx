/**
 * SettingsModal - Configuration for Arena, Google Sheets API,
 * BLE parameters, and Thickness thresholds.
 * Fully localized (LV, EN, RU).
 */

import React, { useState } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Sheet,
  Sliders,
  Bluetooth,
  HelpCircle,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Activity,
  Globe
} from 'lucide-react';
import { ArenaSettings } from '../types';
import { DEFAULT_SETTINGS } from '../data/defaultPoints';
import { GoogleSetupGuide } from './GoogleSetupGuide';
import {
  getCachedToken,
  requestGoogleAccessToken,
  clearCachedToken,
  testSpreadsheetConnection,
  extractSpreadsheetId
} from '../services/googleSheets';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ArenaSettings;
  onSaveSettings: (newSettings: ArenaSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const { t, lang, setLang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'general' | 'sheets' | 'ble' | 'guide'>('general');
  const [formData, setFormData] = useState<ArenaSettings>({ ...settings });
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(!!getCachedToken());
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    if (!formData.googleClientId) {
      setAuthStatus(t.googleClientIdHelp);
      return;
    }
    setAuthStatus(t.syncing);
    requestGoogleAccessToken(
      formData.googleClientId,
      () => {
        setHasToken(true);
        setAuthStatus(t.googleLoginSuccess);
      },
      (err) => {
        setAuthStatus(`${t.googleLoginError}: ${err.message || err}`);
      }
    );
  };

  const handleGoogleLogout = () => {
    clearCachedToken();
    setHasToken(false);
    setAuthStatus(t.notAuthorized);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    const token = getCachedToken();
    if (!token) {
      setTestResult({ success: false, message: t.googleLoginRequired });
      return;
    }
    const cleanId = extractSpreadsheetId(formData.spreadsheetId);
    if (!cleanId) {
      setTestResult({ success: false, message: t.spreadsheetIdHelp });
      return;
    }

    setTestingConnection(true);
    setTestResult(null);
    try {
      const result = await testSpreadsheetConnection(cleanId, token);
      if (result.success) {
        setTestResult({
          success: true,
          message: `${t.connectionSuccess} "${result.title}" (${result.sheets?.join(', ') || 'OK'})`,
        });
      } else {
        setTestResult({
          success: false,
          message: `${t.connectionFailed}: ${result.error}`,
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: `${t.connectionFailed}: ${e.message || String(e)}`,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  const handleReset = () => {
    if (confirm(t.confirmResetSettings)) {
      setFormData(DEFAULT_SETTINGS);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold">{t.settingsTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.settingsSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'general'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            {t.tabGeneral}
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'sheets'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sheet className="w-4 h-4" />
            {t.tabSheets}
          </button>

          <button
            onClick={() => setActiveTab('ble')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'ble'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            {t.tabBle}
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition ${
              activeTab === 'guide'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            {t.tabGuide}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: GENERAL & THRESHOLDS */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* Language Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-500" />
                  {t.language}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'lv', label: 'Latviešu (LV)' },
                    { code: 'en', label: 'English (EN)' },
                    { code: 'ru', label: 'Русский (RU)' },
                  ].map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLang(l.code as Language)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        lang === l.code
                          ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.arenaNameLabel}
                </label>
                <input
                  type="text"
                  value={formData.arenaName}
                  onChange={(e) => setFormData({ ...formData, arenaName: e.target.value })}
                  placeholder="Ice Arena Riga"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Thresholds Section */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {t.thresholdsTitle}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  {/* Critical Min */}
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      {t.criticallyThin} (&lt; X mm)
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.thresholds.criticalMin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          thresholds: {
                            ...formData.thresholds,
                            criticalMin: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-sm font-mono font-bold"
                    />
                  </div>

                  {/* Warning Min */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      {t.belowNormal} (до X mm)
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.thresholds.warningMin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          thresholds: {
                            ...formData.thresholds,
                            warningMin: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-sm font-mono font-bold"
                    />
                  </div>

                  {/* Warning Max */}
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      {t.optimal} (до X mm)
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.thresholds.warningMax}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          thresholds: {
                            ...formData.thresholds,
                            warningMax: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-sm font-mono font-bold"
                    />
                  </div>

                  {/* Critical Max */}
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      {t.criticallyThick} (&gt; X mm)
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.thresholds.criticalMax}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          thresholds: {
                            ...formData.thresholds,
                            criticalMax: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full mt-1 px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900 text-sm font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SHEETS */}
          {activeTab === 'sheets' && (
            <div className="space-y-5">
              <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-sky-900 dark:text-sky-300">
                    <Sheet className="w-5 h-5 text-sky-600" />
                    Google OAuth 2.0
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      hasToken
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {hasToken ? t.authorizedAs : t.notAuthorized}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {!hasToken ? (
                    <button
                      onClick={handleGoogleLogin}
                      className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow transition"
                    >
                      <LogIn className="w-4 h-4" />
                      {t.signInGoogle}
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleGoogleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
                      >
                        <LogOut className="w-4 h-4" />
                        {t.signOutGoogle}
                      </button>

                      <button
                        onClick={handleTestConnection}
                        disabled={testingConnection}
                        className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow transition"
                      >
                        <Activity className="w-4 h-4" />
                        {testingConnection ? t.testingConnection : t.testConnection}
                      </button>
                    </div>
                  )}
                </div>

                {authStatus && (
                  <p className="mt-2 text-xs text-sky-800 dark:text-sky-300 font-medium">
                    {authStatus}
                  </p>
                )}

                {testResult && (
                  <div
                    className={`mt-2.5 p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                      testResult.success
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.spreadsheetIdLabel}
                </label>
                <input
                  type="text"
                  value={formData.spreadsheetId}
                  onChange={(e) => setFormData({ ...formData, spreadsheetId: e.target.value.trim() })}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {t.spreadsheetIdHelp}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.googleClientIdLabel}
                </label>
                <input
                  type="text"
                  value={formData.googleClientId}
                  onChange={(e) => setFormData({ ...formData, googleClientId: e.target.value.trim() })}
                  placeholder="xxxx-xxxx.apps.googleusercontent.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {t.googleClientIdHelp}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl text-xs text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Google Sheet Columns:
                </span>
                Header: <code>Date</code>, <code>point1</code>, <code>point2</code>, <code>point3</code>, ...
              </div>
            </div>
          )}

          {/* TAB 3: BLUETOOTH */}
          {activeTab === 'ble' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.bleServiceUuidLabel}
                </label>
                <input
                  type="text"
                  value={formData.bleServiceUuid}
                  onChange={(e) => setFormData({ ...formData, bleServiceUuid: e.target.value.trim() })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.bleCharUuidLabel}
                </label>
                <input
                  type="text"
                  value={formData.bleCharacteristicUuid}
                  onChange={(e) =>
                    setFormData({ ...formData, bleCharacteristicUuid: e.target.value.trim() })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 4: STEP-BY-STEP GOOGLE GUIDE */}
          {activeTab === 'guide' && <GoogleSetupGuide />}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t.resetDefaults}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              {t.saveSettings}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
