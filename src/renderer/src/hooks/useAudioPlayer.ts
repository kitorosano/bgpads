import { useCallback, useEffect, useRef, useState } from 'react';
import { getTrackAudioSource, resolveAudioSource } from '../audio/AudioSource';
import { audioEngine } from '../engine/AudioEngine';
import { AudioTrack } from '../types';

interface UseAudioPlayerOptions {
  tracksOutputDeviceId?: string;
}

export const useAudioPlayer = ({ tracksOutputDeviceId }: UseAudioPlayerOptions) => {
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

  // Keep the current playing ID available to callbacks without
  // recreating play() every time React state changes.
  const isPlayingRef = useRef<string | null>(null);

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

  // Audio output device
  useEffect(() => {
    void audioEngine.setOutputDevice(tracksOutputDeviceId);
  }, [tracksOutputDeviceId]);

  // Audio engine events
  useEffect(() => {
    const unsubscribe = audioEngine.onEnded((audioKey) => {
      // At this stage audioKey === track.file.
      // Only clear the UI if this is still the active track.
      if (isPlayingRef.current === null) return;

      setIsPlaying(null);
      isPlayingRef.current = null;
      stopProgressTracking();

      console.debug(`Audio ended: ${audioKey}`);
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

  const preload = useCallback(async (track: AudioTrack) => {
    setLoadingTrackIds((previous) => {
      const next = new Set(previous);
      next.add(track.id);
      return next;
    });

    try {
      const source = getTrackAudioSource(track);
      const resolved = resolveAudioSource(source);

      await audioEngine.preload(resolved.key, resolved.path);
    } catch (error) {
      console.error(`Failed to preload track ${track.name}:`, error);
    } finally {
      setLoadingTrackIds((previous) => {
        const next = new Set(previous);
        next.delete(track.id);
        return next;
      });
    }
  }, []);

  const stop = useCallback(() => {
    audioEngine.stop(fadeOutDuration);

    setIsPlaying(null);
    isPlayingRef.current = null;

    stopProgressTracking();
  }, [fadeOutDuration, stopProgressTracking]);

  const play = useCallback(
    async (track: AudioTrack) => {
      // Toggle currently playing track
      if (isPlayingRef.current === track.id) {
        stop();
        return;
      }

      const previousTrackId = isPlayingRef.current;

      stopProgressTracking();

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

      const source = getTrackAudioSource(track);
      const resolved = resolveAudioSource(source);

      const isCached = audioEngine.hasCached(resolved.key);

      if (!isCached) {
        setLoadingTrackIds((previous) => {
          const next = new Set(previous);
          next.add(track.id);
          return next;
        });
      }

      try {
        console.time('Loading Audio Buffer');

        const buffer = await audioEngine.play(resolved.key, resolved.path, {
          volume: track.volume,
          fadeOutDuration
        });

        console.timeEnd('Loading Audio Buffer');

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
    [fadeOutDuration, startProgressTracking, stop, stopProgressTracking]
  );

  const setVolume = useCallback((volume: number) => {
    audioEngine.setVolume(volume);
  }, []);

  return {
    play,
    stop,
    preload,
    isPlaying,
    loadingTrackIds,
    fadeOutDuration,
    setFadeOutDuration,
    setVolume,
    playbackProgress,
    currentTime,
    duration,
    fadingOutTrackId
  };
};
