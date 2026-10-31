import { useCallback, useEffect, useRef, useState } from 'react';
import { resolveAudioSource } from '../audio/AudioSource';
import { audioEngine } from '../engine/AudioEngine';
import { AudioTrack } from '../types';

interface UseAudioPlayerOptions {
  tracksOutputDeviceId?: string;
  tonalPadBankPath?: string;
}

export const useAudioPlayer = ({
  tracksOutputDeviceId,
  tonalPadBankPath
}: UseAudioPlayerOptions) => {
  const [loadingTrackIds, setLoadingTrackIds] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [fadeOutDuration, setFadeOutDuration] = useState(2);
  const [fadingOutTrackId, setFadingOutTrackId] = useState<string | null>(null);

  const fadeOutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Playback progress tracking
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const isPlayingRef = useRef<string | null>(null);
  const playingAudioKeyRef = useRef<string | null>(null);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const updateProgress = useCallback(() => {
    if (!startTimeRef.current || !durationRef.current) {
      return;
    }

    const elapsed = performance.now() / 1000 - startTimeRef.current;
    const progress = Math.min(elapsed / durationRef.current, 1);

    setCurrentTime(elapsed);
    setPlaybackProgress(progress);

    if (progress < 1) {
      animFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  const startProgressTracking = useCallback(
    (audioDuration: number) => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }

      startTimeRef.current = performance.now() / 1000;
      durationRef.current = audioDuration;

      setDuration(audioDuration);
      setCurrentTime(0);
      setPlaybackProgress(0);

      animFrameRef.current = requestAnimationFrame(updateProgress);
    },
    [updateProgress]
  );

  const stopProgressTracking = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setPlaybackProgress(0);
    setCurrentTime(0);
    setDuration(0);

    startTimeRef.current = 0;
    durationRef.current = 0;
  }, []);

  useEffect(() => {
    audioEngine.setOutputDevice(tracksOutputDeviceId);
  }, [tracksOutputDeviceId]);

  useEffect(() => {
    const unsubscribe = audioEngine.onEnded(() => {
      if (isPlayingRef.current === null) return;

      setIsPlaying(null);
      isPlayingRef.current = null;
      playingAudioKeyRef.current = null;
      stopProgressTracking();
    });

    return unsubscribe;
  }, [stopProgressTracking]);

  // Cleanup UI resources on unmount.
  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }

      if (fadeOutTimerRef.current) {
        clearTimeout(fadeOutTimerRef.current);
      }
    };
  }, []);

  const preload = useCallback(
    async (track: AudioTrack) => {
      const resolved = await resolveAudioSource(track.source, {
        tonalPadBankPath
      });

      const isCached = audioEngine.hasCached(resolved.key);
      if (!isCached) {
        setLoadingTrackIds((previous) => {
          const next = new Set(previous);
          next.add(track.id);
          return next;
        });
      }

      try {
        await audioEngine.preload(resolved.key, resolved.path);

        return resolved.key;
      } catch (error) {
        console.error(`Failed to preload track ${track.name}:`, error);
        throw error;
      } finally {
        if (!isCached) {
          setLoadingTrackIds((previous) => {
            const next = new Set(previous);
            next.delete(track.id);
            return next;
          });
        }
      }
    },
    [tonalPadBankPath]
  );

  const stop = useCallback(() => {
    audioEngine.stop(fadeOutDuration);

    const trackId = isPlayingRef.current;
    if (trackId) {
      setFadingOutTrackId(trackId);

      if (fadeOutTimerRef.current) {
        clearTimeout(fadeOutTimerRef.current);
      }

      fadeOutTimerRef.current = setTimeout(() => {
        setFadingOutTrackId(null);
        fadeOutTimerRef.current = null;
      }, fadeOutDuration * 1000);
    }

    setIsPlaying(null);
    isPlayingRef.current = null;
    playingAudioKeyRef.current = null;

    stopProgressTracking();
  }, [fadeOutDuration, stopProgressTracking]);

  const play = useCallback(
    async (track: AudioTrack) => {
      const previousTrackId = isPlayingRef.current;

      stopProgressTracking();

      const resolved = await resolveAudioSource(track.source, {
        tonalPadBankPath
      });

      if (isPlayingRef.current === track.id && playingAudioKeyRef.current === resolved.key) {
        stop();
        return;
      }

      const isCached = audioEngine.hasCached(resolved.key);
      if (!isCached) {
        setLoadingTrackIds((previous) => {
          const next = new Set(previous);
          next.add(track.id);
          return next;
        });
      }

      try {
        const buffer = await audioEngine.play(resolved.key, resolved.path, {
          volume: track.volume,
          fadeOutDuration
        });
        if (!buffer) {
          setLoadingTrackIds((previous) => {
            if (!previous.has(track.id)) {
              return previous;
            }

            const next = new Set(previous);
            next.delete(track.id);
            return next;
          });

          return;
        }

        // Preserve the current UI indication while the previous pad fades out.
        if (previousTrackId) {
          if (fadeOutTimerRef.current) {
            clearTimeout(fadeOutTimerRef.current);
          }

          setFadingOutTrackId(previousTrackId);

          fadeOutTimerRef.current = setTimeout(() => {
            setFadingOutTrackId(null);
            fadeOutTimerRef.current = null;
          }, fadeOutDuration * 1000);
        }

        setLoadingTrackIds((previous) => {
          if (!previous.has(track.id)) {
            return previous;
          }

          const next = new Set(previous);
          next.delete(track.id);

          return next;
        });

        setIsPlaying(track.id);
        isPlayingRef.current = track.id;
        playingAudioKeyRef.current = resolved.key;

        startProgressTracking(buffer.duration);
      } catch (error) {
        console.error('Error playing audio:', error);

        setLoadingTrackIds((previous) => {
          if (!previous.has(track.id)) {
            return previous;
          }

          const next = new Set(previous);
          next.delete(track.id);
          return next;
        });
      }
    },
    [fadeOutDuration, startProgressTracking, stop, stopProgressTracking, tonalPadBankPath]
  );

  const setVolume = useCallback((volume: number) => {
    audioEngine.setVolume(volume);
  }, []);

  const retain = useCallback((audioKey: string) => {
    audioEngine.retain(audioKey);
  }, []);

  const release = useCallback((audioKey: string) => {
    return audioEngine.release(audioKey);
  }, []);

  const releaseUnreferenced = useCallback((audioKey: string) => {
    return audioEngine.releaseUnreferenced(audioKey);
  }, []);

  return {
    isPlaying,
    loadingTrackIds,
    fadeOutDuration,
    playbackProgress,
    currentTime,
    duration,
    fadingOutTrackId,

    play,
    stop,
    preload,
    retain,
    release,
    releaseUnreferenced,
    setFadeOutDuration,
    setVolume
  };
};
