/**
 * Service for connecting and reading values from Bluetooth Digital Calipers (BLE)
 * Supports HM-10 (0xFFE0 / 0xFFE1) and customizable UART BLE services
 */

import { BleConnectionStatus, BleDeviceInfo } from '../types';

export type MeasurementCallback = (valueMm: number, rawData: string) => void;
export type StatusCallback = (status: BleConnectionStatus, message?: string) => void;

class BleCaliperService {
  private device: any = null;
  private server: any = null;
  private characteristic: any = null;
  private status: BleConnectionStatus = 'disconnected';
  private statusMessage: string = '';
  private buffer: string = '';
  private lastValue: number | null = null;
  private lastTimestamp: number = 0;
  private autoReconnect: boolean = true;
  private reconnectTimeout: any = null;

  private measurementListeners: Set<MeasurementCallback> = new Set();
  private statusListeners: Set<StatusCallback> = new Set();

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public getStatus(): BleConnectionStatus {
    return this.status;
  }

  public getStatusMessage(): string {
    return this.statusMessage;
  }

  public getDevice(): BleDeviceInfo | null {
    if (!this.device) return null;
    return {
      name: this.device.name || 'Bluetooth Caliper',
      id: this.device.id,
    };
  }

  public onMeasurement(cb: MeasurementCallback): () => void {
    this.measurementListeners.add(cb);
    return () => this.measurementListeners.delete(cb);
  }

  public onStatusChange(cb: StatusCallback): () => void {
    this.statusListeners.add(cb);
    cb(this.status, this.statusMessage);
    return () => this.statusListeners.delete(cb);
  }

  private updateStatus(status: BleConnectionStatus, message: string = '') {
    this.status = status;
    this.statusMessage = message;
    this.statusListeners.forEach((cb) => cb(status, message));
  }

  /**
   * Request and connect to a BLE Caliper device
   */
  public async connect(serviceUuid?: string, characteristicUuid?: string): Promise<boolean> {
    if (!this.isSupported()) {
      this.updateStatus('error', 'Web Bluetooth API не поддерживается вашим браузером. Используйте Chrome / Edge.');
      return false;
    }

    try {
      this.updateStatus('searching', 'Поиск Bluetooth-устройств...');

      // Default HM-10 service and characteristic
      const sUuid = (serviceUuid || '0000ffe0-0000-1000-8000-00805f9b34fb').toLowerCase();
      const cUuid = (characteristicUuid || '0000ffe1-0000-1000-8000-00805f9b34fb').toLowerCase();

      // Request device - accept devices advertising the service or name filters
      const options: any = {
        filters: [
          { services: [sUuid] },
          { namePrefix: 'HM' },
          { namePrefix: 'BT' },
          { namePrefix: 'Caliper' },
          { namePrefix: 'BLE' },
          { namePrefix: 'JDY' },
          { namePrefix: 'SHANG' },
        ],
        optionalServices: [
          sUuid,
          '0000ffe0-0000-1000-8000-00805f9b34fb',
          '0ffe', // 16-bit short form
          'ffe0',
          '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART
        ],
      };

      // In case standard filter misses custom devices, fallback to acceptAllDevices with optionalServices
      let dev: any;
      try {
        dev = await (navigator as any).bluetooth.requestDevice(options);
      } catch (filterErr: any) {
        // If user cancelled, rethrow
        if (filterErr.name === 'NotFoundError') {
          this.updateStatus('disconnected', 'Выбор устройства отменен пользователем.');
          return false;
        }
        // Try with acceptAllDevices
        dev = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            sUuid,
            '0000ffe0-0000-1000-8000-00805f9b34fb',
            'ffe0',
            '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
          ],
        });
      }

      this.device = dev;
      this.device.addEventListener('gattserverdisconnected', this.handleDisconnection);

      return await this.connectGatt(sUuid, cUuid);
    } catch (err: any) {
      console.error('BLE connection failed:', err);
      if (err.name === 'NotFoundError') {
        this.updateStatus('disconnected', 'Поиск отменен');
      } else {
        this.updateStatus('error', `Ошибка подключения: ${err.message || err}`);
      }
      return false;
    }
  }

  private async connectGatt(serviceUuid: string, characteristicUuid: string): Promise<boolean> {
    try {
      this.updateStatus('connecting', `Подключение к ${this.device.name || 'штангенциркулю'}...`);

      if (!this.device.gatt) {
        throw new Error('GATT server не найден');
      }

      this.server = await this.device.gatt.connect();

      // Find service
      let service: any;
      try {
        service = await this.server.getPrimaryService(serviceUuid);
      } catch (sErr) {
        // Fallback: search known alternative services
        try {
          service = await this.server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        } catch {
          service = await this.server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
        }
      }

      // Find characteristic
      try {
        this.characteristic = await service.getCharacteristic(characteristicUuid);
      } catch {
        // Fallback to FFE1
        this.characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
      }

      // Subscribe to notifications
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', this.handleNotification);

      this.buffer = '';
      this.updateStatus('connected', `Подключено к ${this.device.name || 'Штангенциркулю BLE'}`);
      return true;
    } catch (err: any) {
      console.error('GATT connection error:', err);
      this.updateStatus('error', `Ошибка службы BLE: ${err.message}`);
      return false;
    }
  }

  private handleDisconnection = () => {
    console.warn('BLE device disconnected');
    this.updateStatus('disconnected', 'Штангенциркуль отключился');
    this.server = null;
    this.characteristic = null;

    if (this.autoReconnect && this.device) {
      this.updateStatus('connecting', 'Связь потеряна. Попытка авто-переподключения...');
      if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = setTimeout(async () => {
        try {
          if (this.device && !this.device.gatt?.connected) {
            await this.device.gatt?.connect();
            // Re-setup notifications
            await this.connectGatt(
              '0000ffe0-0000-1000-8000-00805f9b34fb',
              '0000ffe1-0000-1000-8000-00805f9b34fb'
            );
          }
        } catch (e) {
          console.error('Auto reconnect failed:', e);
          this.updateStatus('disconnected', 'Не удалось автоматически переподключиться');
        }
      }, 3000);
    }
  };

  private handleNotification = (event: any) => {
    const value = event.target.value as DataView;
    if (!value) return;

    // Decode bytes to ASCII string
    const decoder = new TextDecoder('utf-8');
    const chunk = decoder.decode(value);
    this.buffer += chunk;

    // Process complete lines or buffered segments
    if (this.buffer.includes('\n') || this.buffer.includes('\r') || this.buffer.length > 30) {
      this.parseAndEmitBuffer();
    }
  };

  private parseAndEmitBuffer() {
    const raw = this.buffer;
    this.buffer = ''; // Reset buffer

    // Parse measurement value from ASCII string
    // Examples from Chinese BLE calipers:
    // " 38.45\r\n", "+038.45 mm", "A+038.50", "-00.02", "38,45"
    const parsed = this.parseCaliperString(raw);
    if (parsed !== null) {
      const now = Date.now();
      // Debounce if same value arrived within 500ms
      if (this.lastValue === parsed && now - this.lastTimestamp < 500) {
        return;
      }

      this.lastValue = parsed;
      this.lastTimestamp = now;

      // Notify all measurement listeners
      this.measurementListeners.forEach((cb) => cb(parsed, raw.trim()));
    }
  }

  /**
   * Robust parser for various digital caliper formats
   */
  public parseCaliperString(input: string): number | null {
    if (!input || typeof input !== 'string') return null;

    // Normalize comma to period
    const normalized = input.replace(',', '.');

    // Check if measurement is in inches (e.g. "1.512 in")
    const isInches = /in|inch/i.test(normalized);

    // Match float number with optional sign
    const match = normalized.match(/([+-]?\d+\.?\d*)/);
    if (!match) return null;

    let num = parseFloat(match[1]);
    if (isNaN(num)) return null;

    // If unit is inches, convert to mm
    if (isInches) {
      num = num * 25.4;
    }

    // Round to 2 decimal places (0.01 mm precision)
    const mm = Math.round(num * 100) / 100;

    // Plausibility check for ice thickness (0.00 to 200.00 mm)
    if (mm >= 0 && mm <= 200) {
      return mm;
    }

    return null;
  }

  /**
   * Manual measurement injection (or for simulator)
   */
  public injectMeasurement(valueMm: number, sourceLabel: string = 'manual') {
    const rounded = Math.round(valueMm * 100) / 100;
    this.lastValue = rounded;
    this.lastTimestamp = Date.now();
    this.measurementListeners.forEach((cb) => cb(rounded, sourceLabel));
  }

  public disconnect() {
    this.autoReconnect = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }

    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.updateStatus('disconnected', 'Отключено пользователем');
  }

  public setAutoReconnect(enabled: boolean) {
    this.autoReconnect = enabled;
  }
}

export const bleCaliper = new BleCaliperService();
