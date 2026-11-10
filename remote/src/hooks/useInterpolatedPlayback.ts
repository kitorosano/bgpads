import { useEffect, useMemo, useState } from 'react';

interface Props {
  playingTrackId: string | null;
  currentTime: number;
  duration: number;
  disabled: boolean;
}

export const useInterpolatedPlayback = ({
  playingTrackId,
  currentTime,
  duration,
  disabled
}: Props) => {
  const [interpolatedTime, setInterpolatedTime] = useState(currentTime);

  useEffect(() => {
    // Sin reproducción activa, usamos el tiempo recibido.
    if (!playingTrackId || disabled || duration <= 0) return;

    const startTime = performance.now();
    let frameId: number;

    const update = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const nextTime = Math.min(Math.max(currentTime + elapsed, 0), duration);

      setInterpolatedTime(nextTime);

      if (nextTime < duration) {
        frameId = requestAnimationFrame(update);
      }
    };

    frameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [playingTrackId, currentTime, duration, disabled]);

  const displayTime = useMemo(
    () => (!playingTrackId || disabled || duration <= 0 ? currentTime : interpolatedTime),
    [playingTrackId, disabled, duration, currentTime, interpolatedTime]
  );
  const progress = useMemo(
    () => (duration > 0 ? Math.min(Math.max(displayTime / duration, 0), 1) : 0),
    [displayTime, duration]
  );

  return {
    currentTime: displayTime,
    progress
  };
};
