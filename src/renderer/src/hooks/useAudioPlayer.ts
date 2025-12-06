import { useCallback, useRef, useState } from 'react';
import { AudioTrack } from '../types';

export const useAudioPlayer = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const bufferCache = useRef<Map<string, AudioBuffer>>(new Map());
  const [isPlaying, setIsPlaying] = useState<string | null>(null); // ID of playing track
  const [fadeOutDuration, setFadeOutDuration] = useState(2); // Seconds

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

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
    try {
      await loadAudioBuffer(track.file);
    } catch (error) {
      console.error(`Failed to preload track ${track.name}:`, error);
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

      // Fade out current if playing
      if (activeSourceRef.current && gainNodeRef.current) {
        const oldGain = gainNodeRef.current;
        const oldSource = activeSourceRef.current;

        // Cancel any scheduled updates
        oldGain.gain.cancelScheduledValues(ctx.currentTime);
        oldGain.gain.setValueAtTime(oldGain.gain.value, ctx.currentTime);
        oldGain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeOutDuration);

        oldSource.stop(ctx.currentTime + fadeOutDuration);
      }

      try {
        const buffer = await loadAudioBuffer(track.file);

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const gain = ctx.createGain();
        // Use track volume, default to 1.0 if not set
        gain.gain.value = track.volume ?? 1.0;

        source.connect(gain);
        gain.connect(ctx.destination);

        source.start(0);

        activeSourceRef.current = source;
        gainNodeRef.current = gain;
        setIsPlaying(track.id);

        source.onended = () => {
          if (activeSourceRef.current === source) {
            setIsPlaying(null);
            activeSourceRef.current = null;
            gainNodeRef.current = null;
          }
        };
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    },
    [isPlaying, fadeOutDuration, initAudioContext]
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
    }
  }, []);

  return {
    play,
    stop,
    preload,
    isPlaying,
    fadeOutDuration,
    setFadeOutDuration
  };
};
