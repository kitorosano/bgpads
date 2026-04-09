import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioTrack } from '../types';
import { useAppConfig } from './useAppConfig';

export const useAudioPlayer = () => {
  const { tracksOutputDeviceId } = useAppConfig();
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const bufferCache = useRef<Map<string, AudioBuffer>>(new Map());
  const [loadingTrackIds, setLoadingTrackIds] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState<string | null>(null); // ID of playing track
  const [fadeOutDuration, setFadeOutDuration] = useState(2); // Seconds
  const [fadingOutTrackId, setFadingOutTrackId] = useState<string | null>(null);
  const fadeOutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Playback progress tracking
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0 to 1
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Animation loop for progress tracking
  const updateProgress = useCallback(() => {
    if (!audioContextRef.current || !startTimeRef.current || !durationRef.current) return;
    const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
    const progress = Math.min(elapsed / durationRef.current, 1);
    setCurrentTime(elapsed);
    setPlaybackProgress(progress);
    if (progress < 1) {
      animFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  const startProgressTracking = useCallback((audioDuration: number) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    startTimeRef.current = audioContextRef.current!.currentTime;
    durationRef.current = audioDuration;
    setDuration(audioDuration);
    setCurrentTime(0);
    setPlaybackProgress(0);
    animFrameRef.current = requestAnimationFrame(updateProgress);
  }, [updateProgress]);

  const stopProgressTracking = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setPlaybackProgress(0);
    setCurrentTime(0);
    setDuration(0);
    startTimeRef.current = 0;
    durationRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (
      audioContextRef.current &&
      tracksOutputDeviceId &&
      tracksOutputDeviceId !== 'default' &&
      'setSinkId' in audioContextRef.current
    ) {
      (audioContextRef.current as any).setSinkId(tracksOutputDeviceId).catch((err) => {
        console.warn('Failed to set audio output device:', err);
      });
    }
  }, [tracksOutputDeviceId]);

  const loadAudioBuffer = async (filePath: string): Promise<AudioBuffer> => {
    initAudioContext();
    // Check cache first
    if (bufferCache.current.has(filePath)) {
      return bufferCache.current.get(filePath)!;
    }

    // Use IPC to read file buffer from main process
    const buffer = await window.api.readBuffer(filePath);
    const decodedBuffer = await audioContextRef.current!.decodeAudioData(
      buffer.buffer as ArrayBuffer
    );

    // Cache the decoded buffer
    bufferCache.current.set(filePath, decodedBuffer);
    return decodedBuffer;
  };

  const preload = useCallback(async (track: AudioTrack) => {
    setLoadingTrackIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(track.id);
      return newSet;
    });

    try {
      await loadAudioBuffer(track.file);
    } catch (error) {
      console.error(`Failed to preload track ${track.name}:`, error);
    } finally {
      setLoadingTrackIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(track.id);
        return newSet;
      });
    }
  }, []);

  const play = useCallback(
    async (track: AudioTrack) => {
      initAudioContext();
      const ctx = audioContextRef.current!;

      // If already playing this track, stop it (toggle)
      if (isPlaying === track.id) {
        stop();
        return;
      }

      // Stop previous progress tracking
      stopProgressTracking();

      // Fade out current if playing
      if (activeSourceRef.current && gainNodeRef.current) {
        const oldGain = gainNodeRef.current;
        const oldSource = activeSourceRef.current;

        // Track the fading out pad for UI
        if (isPlaying) {
          if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
          setFadingOutTrackId(isPlaying);
          fadeOutTimerRef.current = setTimeout(() => {
            setFadingOutTrackId(null);
            fadeOutTimerRef.current = null;
          }, fadeOutDuration * 1000);
        }

        // Cancel any scheduled updates
        oldGain.gain.cancelScheduledValues(ctx.currentTime);
        oldGain.gain.setValueAtTime(oldGain.gain.value, ctx.currentTime);
        oldGain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeOutDuration);

        oldSource.stop(ctx.currentTime + fadeOutDuration);
      }

      try {
        console.time('Loading Audio Buffer');
        // If track is not cached, we might want to show loading indicator too,
        // but typically play is called after preload.
        // However, if we want to ensure loading state shows if play causes load:
        if (!bufferCache.current.has(track.file)) {
          setLoadingTrackIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(track.id);
            return newSet;
          });
        }

        const buffer = await loadAudioBuffer(track.file);
        console.timeEnd('Loading Audio Buffer');

        // Remove from loading set if it was added
        setLoadingTrackIds((prev) => {
          if (!prev.has(track.id)) return prev;
          const newSet = new Set(prev);
          newSet.delete(track.id);
          return newSet;
        });

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const gain = ctx.createGain();
        gain.gain.value = track.volume;

        source.connect(gain);

        gain.connect(ctx.destination);

        source.start(0);

        activeSourceRef.current = source;
        gainNodeRef.current = gain;
        setIsPlaying(track.id);

        // Start tracking progress
        startProgressTracking(buffer.duration);

        source.onended = () => {
          if (activeSourceRef.current === source) {
            setIsPlaying(null);
            activeSourceRef.current = null;
            gainNodeRef.current = null;
            stopProgressTracking();
          }
        };
      } catch (error) {
        console.error('Error playing audio:', error);
        // Ensure loading state is cleared on error
        setLoadingTrackIds((prev) => {
          if (!prev.has(track.id)) return prev;
          const newSet = new Set(prev);
          newSet.delete(track.id);
          return newSet;
        });
      }
    },
    [isPlaying, fadeOutDuration, initAudioContext, startProgressTracking, stopProgressTracking]
  );

  const stop = useCallback(() => {
    if (activeSourceRef.current && gainNodeRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      const gain = gainNodeRef.current;
      const source = activeSourceRef.current;

      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeOutDuration);
      source.stop(ctx.currentTime + fadeOutDuration);

      setIsPlaying(null);
      activeSourceRef.current = null;
      gainNodeRef.current = null;
      stopProgressTracking();
    }
  }, [stopProgressTracking]);

  const setVolume = useCallback((volume: number) => {
    if (gainNodeRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      gainNodeRef.current.gain.setValueAtTime(volume, ctx.currentTime);
    }
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
