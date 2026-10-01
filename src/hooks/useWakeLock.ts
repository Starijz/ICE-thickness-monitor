/**
 * useWakeLock - Custom hook for Screen Wake Lock API (navigator.wakeLock.request('screen'))
 * Keeps the tablet/smartphone screen awake during Bluetooth caliper measurements
 * so the OS does not suspend JavaScript or drop BLE characteristicvaluechanged events.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseWakeLockReturn {
  isActive: boolean;
  isSupported: boolean;
  requestWakeLock: () => Promise<boolean>;
  releaseWakeLock: () => Promise<void>;
}

export function useWakeLock(): UseWakeLockReturn {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isSupported] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator && !!navigator.wakeLock;
  });

  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator) || !navigator.wakeLock) {
      setIsActive(false);
      return false;
    }

    // If an active lock is already held, do not request a duplicate
    if (sentinelRef.current && !sentinelRef.current.released) {
      setIsActive(true);
      return true;
    }

    try {
      const sentinel = await navigator.wakeLock.request('screen');
      sentinelRef.current = sentinel;
      setIsActive(true);

      const handleRelease = () => {
        // Browser automatically releases wake lock when tab is hidden/minimized
        if (sentinelRef.current === sentinel) {
          sentinelRef.current = null;
        }
        setIsActive(false);
      };

      sentinel.addEventListener('release', handleRelease);
      return true;
    } catch (err) {
      // Wake Lock errors (e.g. battery saver mode, iframe policy, or background tab)
      // must not interrupt application flow
      console.warn('Wake Lock request failed:', err);
      sentinelRef.current = null;
      setIsActive(false);
      return false;
    }
  }, []);

  const releaseWakeLock = useCallback(async (): Promise<void> => {
    const currentSentinel = sentinelRef.current;
    sentinelRef.current = null;

    if (!currentSentinel) {
      setIsActive(false);
      return;
    }

    try {
      if (!currentSentinel.released) {
        await currentSentinel.release();
      }
    } catch (err) {
      console.warn('Wake Lock release failed:', err);
    } finally {
      setIsActive(false);
    }
  }, []);

  // Ensure wake lock is released on unmount (leaving measurements screen)
  useEffect(() => {
    return () => {
      if (sentinelRef.current && !sentinelRef.current.released) {
        sentinelRef.current.release().catch(() => {});
        sentinelRef.current = null;
      }
    };
  }, []);

  return {
    isActive,
    isSupported,
    requestWakeLock,
    releaseWakeLock,
  };
}
