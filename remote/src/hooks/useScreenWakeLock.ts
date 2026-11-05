import { useEffect } from 'react';

export function useScreenWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return;

    let wakeLock: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquireWakeLock = async () => {
      if (document.visibilityState !== 'visible' || wakeLock) return;

      try {
        const lock = await navigator.wakeLock.request('screen');

        if (cancelled) {
          await lock.release();
          return;
        }

        wakeLock = lock;

        lock.addEventListener(
          'release',
          () => {
            if (wakeLock === lock) {
              wakeLock = null;
            }
          },
          { once: true }
        );
      } catch (error) {
        console.warn('[Remote] Wake Lock unavailable:', error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void acquireWakeLock();
      }
    };

    void acquireWakeLock();

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;

      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (wakeLock) {
        void wakeLock.release();
      }
    };
  }, [enabled]);
}
