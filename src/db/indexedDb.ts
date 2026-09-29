import { openDB, IDBPDatabase } from 'idb';
import { ArenaSettings, PointLocation, MeasurementSession, OfflineQueueItem } from '../types';
import { DEFAULT_SETTINGS, PRESET_STANDARD_25 } from '../data/defaultPoints';

const DB_NAME = 'ice_thickness_db';
const DB_VERSION = 1;

const LS_SETTINGS_KEY = 'ice_arena_settings_v2';
const LS_GOOGLE_SHEET_ID_KEY = 'ice_google_spreadsheet_id_persistent';
const LS_GOOGLE_CLIENT_ID_KEY = 'ice_google_client_id_persistent';
const LS_POINTS_VERSION_KEY = 'ice_points_layout_version';
const CURRENT_POINTS_LAYOUT_VERSION = 'v2_25_points';

interface IceThicknessSchema {
  settings: {
    key: string;
    value: ArenaSettings;
  };
  points: {
    key: string;
    value: PointLocation[];
  };
  active_session: {
    key: string;
    value: Record<number, number>; // pointNumber -> value
  };
  sessions: {
    key: string;
    value: MeasurementSession;
  };
  sync_queue: {
    key: string;
    value: OfflineQueueItem;
  };
}

let dbPromise: Promise<IDBPDatabase<IceThicknessSchema>> | null = null;

export async function getDb(): Promise<IDBPDatabase<IceThicknessSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<IceThicknessSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('points')) {
          db.createObjectStore('points');
        }
        if (!db.objectStoreNames.contains('active_session')) {
          db.createObjectStore('active_session');
        }
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions');
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue');
        }
      },
    });
  }
  return dbPromise;
}

function normalizeArenaSettings(raw?: Partial<ArenaSettings> | null): ArenaSettings {
  const merged: ArenaSettings = {
    ...DEFAULT_SETTINGS,
    ...(raw || {}),
    thresholds: {
      ...DEFAULT_SETTINGS.thresholds,
      ...(raw?.thresholds || {}),
    },
  };

  // Migrate old default arena name to "Ледовая арена"
  if (
    !merged.arenaName ||
    merged.arenaName === 'Ледовая Арена "Северный Лед"' ||
    merged.arenaName === 'Лёд'
  ) {
    merged.arenaName = DEFAULT_SETTINGS.arenaName;
  }

  // Restore Google credentials from dedicated persistent localStorage keys if missing
  if (typeof window !== 'undefined') {
    try {
      const persistedSheetId = localStorage.getItem(LS_GOOGLE_SHEET_ID_KEY) || '';
      const persistedClientId = localStorage.getItem(LS_GOOGLE_CLIENT_ID_KEY) || '';
      const envSheetId = (import.meta as any).env?.VITE_GOOGLE_SPREADSHEET_ID || '';
      const envClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';

      if (!merged.spreadsheetId) {
        merged.spreadsheetId = persistedSheetId || envSheetId || '';
      }
      if (!merged.googleClientId) {
        merged.googleClientId = persistedClientId || envClientId || '';
      }
    } catch {
      // Ignore storage access errors
    }
  }

  return merged;
}

/**
 * Synchronous initial settings loader from localStorage so UI never starts with blank Google credentials
 */
export function getInitialSettingsSync(): ArenaSettings {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LS_SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return normalizeArenaSettings(parsed);
      }
    } catch {
      // Ignore parse error
    }
  }
  return normalizeArenaSettings(null);
}

// --- Settings Storage ---
export async function loadSettings(): Promise<ArenaSettings> {
  const syncFallback = getInitialSettingsSync();
  try {
    const db = await getDb();
    const saved = await db.get('settings', 'current_settings');
    if (saved) {
      const normalized = normalizeArenaSettings({
        ...syncFallback,
        ...saved,
        // Never lose non-empty Google credentials from either storage
        spreadsheetId: saved.spreadsheetId || syncFallback.spreadsheetId || '',
        googleClientId: saved.googleClientId || syncFallback.googleClientId || '',
      });
      // Mirror back to localStorage and IndexedDB
      persistSettingsToLocalStorage(normalized);
      await db.put('settings', normalized, 'current_settings');
      return normalized;
    } else {
      await db.put('settings', syncFallback, 'current_settings');
      return syncFallback;
    }
  } catch (err) {
    console.warn('Could not load settings from IndexedDB, using localStorage fallback:', err);
  }
  return syncFallback;
}

function persistSettingsToLocalStorage(settings: ArenaSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
    if (settings.spreadsheetId !== undefined) {
      localStorage.setItem(LS_GOOGLE_SHEET_ID_KEY, settings.spreadsheetId.trim());
    }
    if (settings.googleClientId !== undefined) {
      localStorage.setItem(LS_GOOGLE_CLIENT_ID_KEY, settings.googleClientId.trim());
    }
  } catch {
    // Ignore storage quota errors
  }
}

export async function saveSettings(settings: ArenaSettings): Promise<void> {
  persistSettingsToLocalStorage(settings);
  try {
    const db = await getDb();
    await db.put('settings', settings, 'current_settings');
  } catch (err) {
    console.warn('Could not save settings to IndexedDB:', err);
  }
}

// --- Points Storage ---
export async function loadPoints(): Promise<PointLocation[]> {
  try {
    const db = await getDb();
    const layoutVer =
      typeof window !== 'undefined' ? localStorage.getItem(LS_POINTS_VERSION_KEY) : null;
    const saved = await db.get('points', 'current_points');

    // Automatically migrate old 24-point preset to the new 25-point scheme
    if (
      layoutVer !== CURRENT_POINTS_LAYOUT_VERSION ||
      !saved ||
      !Array.isArray(saved) ||
      saved.length === 0 ||
      saved.length === 24
    ) {
      await db.put('points', PRESET_STANDARD_25, 'current_points');
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LS_POINTS_VERSION_KEY, CURRENT_POINTS_LAYOUT_VERSION);
        } catch {
          // Ignore
        }
      }
      return PRESET_STANDARD_25;
    }

    return saved;
  } catch (err) {
    console.warn('Could not load points from IndexedDB, using 25-point preset:', err);
  }
  return PRESET_STANDARD_25;
}

export async function savePoints(points: PointLocation[]): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LS_POINTS_VERSION_KEY, CURRENT_POINTS_LAYOUT_VERSION);
    } catch {
      // Ignore
    }
  }
  const db = await getDb();
  await db.put('points', points, 'current_points');
}

// --- Active Session In-Progress Storage ---
export async function loadActiveMeasurements(): Promise<Record<number, number>> {
  try {
    const db = await getDb();
    const measurements = await db.get('active_session', 'current_measurements');
    return measurements || {};
  } catch (err) {
    console.warn('Could not load active measurements:', err);
    return {};
  }
}

export async function saveActiveMeasurements(measurements: Record<number, number>): Promise<void> {
  try {
    const db = await getDb();
    await db.put('active_session', measurements, 'current_measurements');
  } catch (err) {
    console.warn('Could not save active measurements:', err);
  }
}

export async function clearActiveMeasurements(): Promise<void> {
  try {
    const db = await getDb();
    await db.delete('active_session', 'current_measurements');
  } catch (err) {
    console.warn('Could not clear active measurements:', err);
  }
}

// --- Historical Sessions Storage ---
export async function loadAllSessions(): Promise<MeasurementSession[]> {
  try {
    const db = await getDb();
    const all = await db.getAll('sessions');
    return (all || []).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (err) {
    console.error('Error loading sessions:', err);
    return [];
  }
}

export async function saveSessionRecord(session: MeasurementSession): Promise<void> {
  const db = await getDb();
  await db.put('sessions', session, session.id);
}

export async function deleteSessionRecord(sessionId: string): Promise<void> {
  const db = await getDb();
  await db.delete('sessions', sessionId);
}

// --- Offline Sync Queue ---
export async function getSyncQueue(): Promise<OfflineQueueItem[]> {
  try {
    const db = await getDb();
    return await db.getAll('sync_queue');
  } catch (err) {
    console.error('Error getting sync queue:', err);
    return [];
  }
}

export async function addToSyncQueue(session: MeasurementSession, error?: string): Promise<void> {
  const db = await getDb();
  const item: OfflineQueueItem = {
    id: session.id,
    session,
    attempts: 0,
    lastAttempt: new Date().toISOString(),
    error,
  };
  await db.put('sync_queue', item, item.id);
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('sync_queue', id);
}

export async function updateSyncQueueItem(item: OfflineQueueItem): Promise<void> {
  const db = await getDb();
  await db.put('sync_queue', item, item.id);
}

// Aliases for clean component consumption
export const initDatabase = getDb;
export const getSettings = loadSettings;
export const getPoints = loadPoints;
export const getAllSessions = loadAllSessions;
export const saveSession = saveSessionRecord;
export const deleteSession = deleteSessionRecord;
export const getOfflineQueue = getSyncQueue;

export async function saveActiveDraft(
  measurements: Record<number, number>,
  sessionId?: string
): Promise<void> {
  await saveActiveMeasurements(measurements);
}

export async function getActiveDraft(): Promise<{
  measurements: Record<number, number>;
  sessionId?: string;
}> {
  const measurements = await loadActiveMeasurements();
  return { measurements };
}
