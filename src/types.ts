/**
 * Types and interfaces for Ice Thickness Tracking PWA
 */

export interface PointLocation {
  id: string;
  number: number;
  name: string;
  x: number; // in meters (0 to 60)
  y: number; // in meters (0 to 30)
  zone?: 'defending' | 'neutral' | 'attacking';
  description?: string;
}

export interface MeasurementRecord {
  pointId: string;
  pointNumber: number;
  value: number; // in mm, e.g. 38.45
  timestamp: string; // ISO string
}

export interface MeasurementSession {
  id: string;
  arenaName: string;
  timestamp: string; // ISO string
  formattedDate: string; // "15.09.2026 17:30"
  measurements: Record<number, number>; // pointNumber -> value in mm
  pointsConfig?: PointLocation[];
  notes?: string;
  syncedToGoogleSheets: boolean;
  syncedAt?: string;
  syncError?: string;
}

export interface ThicknessThresholds {
  criticalMin: number; // e.g. < 25 mm (Критически тонкий - Красный)
  warningMin: number;  // e.g. 25 - 32 mm (Тонкий - Оранжевый)
  optimalMin: number;  // e.g. 33 - 42 mm (Оптимальный - Зеленый)
  warningMax: number;  // e.g. 43 - 50 mm (Толстый - Синий)
  criticalMax: number; // e.g. > 50 mm (Критически толстый - Фиолетовый)
}

export interface ArenaSettings {
  arenaName: string;
  spreadsheetId: string;
  googleClientId: string;
  autoAdvance: boolean; // Auto switch to next unmeasured point on BLE value
  soundFeedback: boolean; // Audio beep on measurement
  vibrateFeedback: boolean;
  bleServiceUuid: string;
  bleCharacteristicUuid: string;
  thresholds: ThicknessThresholds;
}

export type BleConnectionStatus = 'disconnected' | 'searching' | 'connecting' | 'connected' | 'error';

export interface BleDeviceInfo {
  name: string;
  id: string;
  batteryLevel?: number;
}

export interface OfflineQueueItem {
  id: string;
  session: MeasurementSession;
  attempts: number;
  lastAttempt?: string;
  error?: string;
}

export interface SessionStatistics {
  count: number;
  totalPoints: number;
  min: number | null;
  minPoint: number | null;
  max: number | null;
  maxPoint: number | null;
  avg: number | null;
  delta: number | null;
  optimalPercentage: number;
}

// Web Bluetooth API Type Declarations for standard TypeScript
export interface BluetoothRequestDeviceFilter {
  services?: (string | number)[];
  name?: string;
  namePrefix?: string;
}

export interface BluetoothRequestDeviceOptions {
  filters?: BluetoothRequestDeviceFilter[];
  optionalServices?: (string | number)[];
  acceptAllDevices?: boolean;
}
