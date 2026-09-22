import { openDB, IDBPDatabase } from 'idb';
import { ArenaSettings, PointLocation, MeasurementSession, OfflineQueueItem } from '../types';
import { DEFAULT_SETTINGS, PRESET_STANDARD_24 } from '../data/defaultPoints';

const DB_NAME = 'ice_thickness_db';
const DB_VERSION = 1;

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

// --- Settings Storage ---
export async function loadSettings(): Promise<ArenaSettings> {
  try {
    const db = await getDb();
    const saved = await db.get('settings', 'current_settings');
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...saved };
    }
  } catch (err) {
    console.warn('Could not load settings from IndexedDB, using defaults:', err);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: ArenaSettings): Promise<void> {
  const db = await getDb();
  await db.put('settings', settings, 'current_settings');
}

// --- Points Storage ---
export async function loadPoints(): Promise<PointLocation[]> {
  try {
    const db = await getDb();
    const saved = await db.get('points', 'current_points');
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
  } catch (err) {
    console.warn('Could not load points from IndexedDB, using preset:', err);
  }
  return PRESET_STANDARD_24;
}

export async function savePoints(points: PointLocation[]): Promise<void> {
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
    return (all || []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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

export async function saveActiveDraft(measurements: Record<number, number>, sessionId?: string): Promise<void> {
  await saveActiveMeasurements(measurements);
}

export async function getActiveDraft(): Promise<{ measurements: Record<number, number>; sessionId?: string }> {
  const measurements = await loadActiveMeasurements();
  return { measurements };
}

