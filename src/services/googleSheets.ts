/**
 * Google Sheets API v4 Integration Service
 * Manages OAuth 2.0 (Google Identity Services token client),
 * spreadsheet year sheets (e.g. "2026"), header creation,
 * appending session rows, and offline queue synchronization.
 */

import { MeasurementSession, PointLocation } from '../types';
import { addToSyncQueue, getSyncQueue, removeFromSyncQueue, updateSyncQueueItem } from '../db/indexedDb';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const GOOGLE_OAUTH_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

const SESSION_TOKEN_KEY = 'ice_gsi_token';
const SESSION_EXPIRY_KEY = 'ice_gsi_token_exp';

// In-memory token storage with sessionStorage fallback
let inMemoryAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Extract clean Spreadsheet ID from raw ID or full Google Sheets URL
 */
export function extractSpreadsheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  // Match https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/...
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  // Otherwise strip query params / hashes if any
  const clean = trimmed.split('?')[0].split('#')[0].replace(/\/+$/, '');
  return clean;
}

export function getCachedToken(): string | null {
  const now = Date.now();
  if (inMemoryAccessToken && now < tokenExpiresAt) {
    return inMemoryAccessToken;
  }

  // Fallback to sessionStorage for page reloads
  if (typeof window !== 'undefined') {
    try {
      const savedToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
      const savedExp = sessionStorage.getItem(SESSION_EXPIRY_KEY);
      if (savedToken && savedExp) {
        const exp = parseInt(savedExp, 10);
        if (now < exp) {
          inMemoryAccessToken = savedToken;
          tokenExpiresAt = exp;
          return savedToken;
        } else {
          sessionStorage.removeItem(SESSION_TOKEN_KEY);
          sessionStorage.removeItem(SESSION_EXPIRY_KEY);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  return null;
}

export function setCachedToken(token: string, expiresInSeconds: number = 3600) {
  inMemoryAccessToken = token;
  tokenExpiresAt = Date.now() + expiresInSeconds * 1000 - 60000; // 1 min buffer

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
      sessionStorage.setItem(SESSION_EXPIRY_KEY, tokenExpiresAt.toString());
    } catch {
      // Ignore storage errors
    }
  }
}

export function clearCachedToken() {
  inMemoryAccessToken = null;
  tokenExpiresAt = 0;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_EXPIRY_KEY);
    } catch {
      // Ignore
    }
  }
}

/**
 * Initialize Google Identity Services (GSI) OAuth 2.0 Token Client
 */
export function requestGoogleAccessToken(
  clientId: string,
  onSuccess: (token: string) => void,
  onError: (err: any) => void
) {
  if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
    onError(new Error('Google Identity Services script not loaded. Check internet connection.'));
    return;
  }

  if (!clientId || clientId.trim() === '') {
    onError(new Error('Google Client ID is missing in Settings.'));
    return;
  }

  try {
    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: clientId.trim(),
      scope: GOOGLE_OAUTH_SCOPE,
      callback: (tokenResponse: any) => {
        if (tokenResponse.error) {
          onError(new Error(`OAuth error: ${tokenResponse.error_description || tokenResponse.error}`));
          return;
        }
        if (tokenResponse.access_token) {
          const expiresIn = parseInt(tokenResponse.expires_in, 10) || 3600;
          setCachedToken(tokenResponse.access_token, expiresIn);
          onSuccess(tokenResponse.access_token);
        }
      },
    });

    client.requestAccessToken({ prompt: 'consent' });
  } catch (err) {
    console.error('Failed to initTokenClient:', err);
    onError(err);
  }
}

/**
 * Check if spreadsheet exists and fetch sheets list
 */
export async function getSpreadsheetDetails(rawSpreadsheetId: string, accessToken: string) {
  const spreadsheetId = extractSpreadsheetId(rawSpreadsheetId);
  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID is empty');
  }

  const url = `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}?fields=properties.title,sheets.properties`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errBody = await res.text();
    if (res.status === 404) {
      throw new Error(`Google Таблица не найдена (404). Проверьте ID: "${spreadsheetId}"`);
    }
    if (res.status === 403) {
      throw new Error(`Нет доступа к таблице (403). Убедитесь, что таблица доступна авторизованному Google-аккаунту.`);
    }
    if (res.status === 401) {
      clearCachedToken();
      throw new Error(`Токен Google авторизации истек (401). Требуется повторный вход.`);
    }
    throw new Error(`Google Sheets API error (${res.status}): ${errBody}`);
  }

  return await res.json();
}

/**
 * Test connection to spreadsheet
 */
export async function testSpreadsheetConnection(
  rawSpreadsheetId: string,
  accessToken: string
): Promise<{ success: boolean; title?: string; sheets?: string[]; error?: string }> {
  try {
    const data = await getSpreadsheetDetails(rawSpreadsheetId, accessToken);
    const title = data.properties?.title || 'Таблица';
    const sheets = (data.sheets || []).map((s: any) => s.properties?.title).filter(Boolean);
    return {
      success: true,
      title,
      sheets,
    };
  } catch (e: any) {
    return {
      success: false,
      error: e.message || String(e),
    };
  }
}

/**
 * Build standard header row:
 * ["Date", "Point 1", "Point 2", "Point 3", ...]
 * As requested: "point1 меняем на более красивый Point 1"
 */
export function buildHeaderRow(points: PointLocation[]): string[] {
  const sorted = [...points].sort((a, b) => a.number - b.number);
  const headers = ['Date'];
  sorted.forEach((p) => {
    headers.push(`Point ${p.number}`);
  });
  return headers;
}

/**
 * Ensure sheet has header row. If row 1 is empty, write header.
 */
export async function ensureHeaderRow(
  spreadsheetId: string,
  yearTitle: string,
  points: PointLocation[],
  accessToken: string
): Promise<void> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  // Numeric sheet titles MUST be quoted in single quotes, e.g. '2026'!1:1
  const readRange = `'${yearTitle}'!1:1`;
  const getUrl = `${SHEETS_API_BASE}/${encodeURIComponent(cleanId)}/values/${encodeURIComponent(readRange)}`;

  try {
    const res = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.values && data.values.length > 0 && data.values[0].length > 0) {
        // Headers already exist
        return;
      }
    }
  } catch (e) {
    console.warn('Could not read existing header row:', e);
  }

  // Row 1 is empty or missing, write header
  const headerRow = buildHeaderRow(points);
  const writeRange = `'${yearTitle}'!A1`;
  const putUrl = `${SHEETS_API_BASE}/${encodeURIComponent(cleanId)}/values/${encodeURIComponent(
    writeRange
  )}?valueInputOption=USER_ENTERED`;

  await fetch(putUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      majorDimension: 'ROWS',
      values: [headerRow],
    }),
  });
}

/**
 * Create a new worksheet for the given year and format it with header row
 */
export async function createYearWorksheetWithHeader(
  rawSpreadsheetId: string,
  yearTitle: string,
  points: PointLocation[],
  accessToken: string
): Promise<number> {
  const spreadsheetId = extractSpreadsheetId(rawSpreadsheetId);

  // 1. Batch update: Add sheet
  const addSheetUrl = `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}:batchUpdate`;
  const addSheetBody = {
    requests: [
      {
        addSheet: {
          properties: {
            title: yearTitle,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      },
    ],
  };

  const addRes = await fetch(addSheetUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(addSheetBody),
  });

  if (!addRes.ok) {
    const errText = await addRes.text();
    // If sheet already exists, ignore error and continue to header
    if (!errText.includes('already exists')) {
      throw new Error(`Не удалось создать лист "${yearTitle}": ${errText}`);
    }
  }

  let newSheetId = 0;
  try {
    const addResult = await addRes.json();
    newSheetId = addResult.replies?.[0]?.addSheet?.properties?.sheetId || 0;
  } catch {
    //
  }

  // 2. Write short header row ("Date", "point1", "point2", ...)
  const headerRow = buildHeaderRow(points);
  const writeRange = `'${yearTitle}'!A1`;
  const putUrl = `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(
    writeRange
  )}?valueInputOption=USER_ENTERED`;

  const headerRes = await fetch(putUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      majorDimension: 'ROWS',
      values: [headerRow],
    }),
  });

  if (!headerRes.ok) {
    const headerErr = await headerRes.text();
    console.warn(`Worksheet created, but header row failed: ${headerErr}`);
  }

  return newSheetId;
}

/**
 * Append session row to the sheet:
 * A: Timestamp (formatted Date & Time)
 * B..N: thickness value in mm for point1, point2...
 */
export async function appendSessionRow(
  rawSpreadsheetId: string,
  yearTitle: string,
  session: MeasurementSession,
  points: PointLocation[],
  accessToken: string
) {
  const spreadsheetId = extractSpreadsheetId(rawSpreadsheetId);
  const sortedPoints = [...points].sort((a, b) => a.number - b.number);

  const rowData: (string | number)[] = [session.formattedDate || session.timestamp];

  for (const pt of sortedPoints) {
    const val = session.measurements[pt.number];
    if (val !== undefined && val !== null && !isNaN(Number(val))) {
      rowData.push(Number(val));
    } else {
      rowData.push(''); // Empty cell if not measured
    }
  }

  // Quoted range for numeric sheet name e.g. '2026'!A1:append
  const targetRange = `'${yearTitle}'!A1`;
  const appendUrl = `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(
    targetRange
  )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      majorDimension: 'ROWS',
      values: [rowData],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401) {
      clearCachedToken();
    }
    throw new Error(`Ошибка записи в таблицу (${res.status}): ${errText}`);
  }

  return await res.json();
}

/**
 * Main Save Session function:
 * Checks current year worksheet, creates/verifies header, and appends row.
 * Handles offline fallback gracefully.
 */
export async function syncSessionToGoogleSheets(
  session: MeasurementSession,
  points: PointLocation[],
  rawSpreadsheetId: string,
  customToken?: string
): Promise<{ success: boolean; message: string; queuedLocally?: boolean; details?: any }> {
  const token = customToken || getCachedToken();
  const spreadsheetId = extractSpreadsheetId(rawSpreadsheetId);

  // If no spreadsheet ID or offline or no token, queue locally
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!spreadsheetId || !token || !isOnline) {
    const reason = !isOnline
      ? 'Офлайн режим'
      : !token
      ? 'Требуется вход в Google'
      : 'Не задан ID таблицы';
    await addToSyncQueue(session, reason);
    return {
      success: false,
      queuedLocally: true,
      message: !isOnline
        ? 'Нет подключения к сети. Сессия сохранена в локальную очередь.'
        : !token
        ? 'Сессия сохранена локально. Нажмите «Синхронизировать с Google» для отправки.'
        : 'Сессия сохранена локально. Укажите ID Google Таблицы в настройках.',
    };
  }

  try {
    const sessionYear = new Date(session.timestamp).getFullYear().toString();

    // 1. Get sheets list
    const details = await getSpreadsheetDetails(spreadsheetId, token);
    const existingSheets = details.sheets || [];
    const yearSheetExists = existingSheets.some(
      (s: any) => s.properties?.title === sessionYear
    );

    // 2. If year sheet does not exist, create it with short header ('Date', 'point1', 'point2'...)
    if (!yearSheetExists) {
      await createYearWorksheetWithHeader(spreadsheetId, sessionYear, points, token);
    } else {
      // Make sure existing sheet has header row
      await ensureHeaderRow(spreadsheetId, sessionYear, points, token);
    }

    // 3. Append session data
    const appendResult = await appendSessionRow(spreadsheetId, sessionYear, session, points, token);

    return {
      success: true,
      message: `Данные успешно сохранены в Google Таблицу (Лист "${sessionYear}")`,
      details: appendResult,
    };
  } catch (err: any) {
    console.error('Google Sheets sync error:', err);
    await addToSyncQueue(session, err.message || 'Ошибка сети');
    return {
      success: false,
      queuedLocally: true,
      message: `Ошибка отправки: ${err.message || err}. Сессия сохранена в локальную очередь.`,
    };
  }
}

/**
 * Process offline sync queue
 */
export async function processOfflineSyncQueue(
  points: PointLocation[],
  rawSpreadsheetId: string,
  customToken?: string
): Promise<{ processed: number; failed: number }> {
  const token = customToken || getCachedToken();
  const spreadsheetId = extractSpreadsheetId(rawSpreadsheetId);
  if (!token || !spreadsheetId || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return { processed: 0, failed: 0 };
  }

  const queue = await getSyncQueue();
  let processed = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      const res = await syncSessionToGoogleSheets(item.session, points, spreadsheetId, token);
      if (res.success) {
        await removeFromSyncQueue(item.id);
        processed++;
      } else {
        item.attempts += 1;
        item.lastAttempt = new Date().toISOString();
        item.error = res.message;
        await updateSyncQueueItem(item);
        failed++;
      }
    } catch (e: any) {
      item.attempts += 1;
      item.lastAttempt = new Date().toISOString();
      item.error = e.message;
      await updateSyncQueueItem(item);
      failed++;
    }
  }

  return { processed, failed };
}
