import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_METRONOME_TIME_SIGNATURE } from '../../../constants';
import { useAppConfig } from './useAppConfig';

export const useMetronome = (
  bpm: number,
  timeSignature: string = DEFAULT_METRONOME_TIME_SIGNATURE,
  onBeat?: (beat: number) => void
) => {
  const {
    metronomeFrequency,
    metronomeDecay,
    metronomeHarmonicCount,
    metronomeOutputDeviceId,
    metronomeVolume
  } = useAppConfig();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const timerIDRef = useRef<NodeJS.Timeout | null>(null);
  const beatTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const currentBeatRef = useRef<number>(0);
  const lookahead = 25.0; // milliseconds
  const scheduleAheadTime = 0.1; // seconds

  const beatsPerBar = parseInt(timeSignature.split('/')[0]) || 4;
  const beatsPerBarRef = useRef(beatsPerBar);

  useEffect(() => {
    beatsPerBarRef.current = beatsPerBar;
  }, [beatsPerBar]);

  // Use a ref for BPM so the scheduler always sees the latest value
  const bpmRef = useRef(bpm);
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  // Use refs for sound parameters to avoid recreating scheduler
  const frequencyRef = useRef(metronomeFrequency);
  const decayRef = useRef(metronomeDecay);
  const harmonicCountRef = useRef(metronomeHarmonicCount);
  const volumeRef = useRef(metronomeVolume);

  useEffect(() => {
    frequencyRef.current = metronomeFrequency;
  }, [metronomeFrequency]);

  useEffect(() => {
    decayRef.current = metronomeDecay;
  }, [metronomeDecay]);

  useEffect(() => {
    harmonicCountRef.current = metronomeHarmonicCount;
  }, [metronomeHarmonicCount]);

  useEffect(() => {
    volumeRef.current = metronomeVolume;
  }, [metronomeVolume]);

  // Update onBeat ref to avoid scheduler recreation dependencies
  const onBeatRef = useRef(onBeat);
  useEffect(() => {
    onBeatRef.current = onBeat;
  }, [onBeat]);

  const nextNote = useCallback(() => {
    const secondsPerBeat = 60.0 / bpmRef.current;
    nextNoteTimeRef.current += secondsPerBeat;
    currentBeatRef.current = (currentBeatRef.current + 1) % beatsPerBarRef.current;
  }, []);

  const scheduleNote = useCallback((time: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Create a periodic wave for a "click" sound (similar to a pulse)
    // We use a series of harmonics to approximate a narrow pulse
    const frequency = frequencyRef.current;
    const decay = decayRef.current;
    const harmonicCount = harmonicCountRef.current;

    const real = new Float32Array(harmonicCount);
    const imag = new Float32Array(harmonicCount);
    real[0] = 0;
    imag[0] = 0;

    for (let i = 1; i < harmonicCount; i++) {
      real[i] = 1;
      imag[i] = 0;
    }

    const wave = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
    osc.setPeriodicWave(wave);

    osc.frequency.value = frequency;

    // Envelope for a sharp attack and quick decay
    gain.gain.setValueAtTime(volumeRef.current ?? 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + decay);

    if (onBeatRef.current) {
      // Schedule visual callback
      // Calculate delay in ms
      const delay = (time - ctx.currentTime) * 1000;
      // Ensure delay is not negative
      const safeDelay = Math.max(0, delay);

      // Capture current beat for the closure
      const beatToReport = currentBeatRef.current;

      const timeoutId = setTimeout(() => {
        onBeatRef.current?.(beatToReport);
      }, safeDelay);

      beatTimeoutsRef.current.push(timeoutId);
    }
  }, []); // Dependencies are now empty (refs are stable)

  const scheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // While there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.
    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      scheduleNote(nextNoteTimeRef.current);
      nextNote();
    }
    timerIDRef.current = setTimeout(scheduler, lookahead);
  }, [scheduleNote, nextNote, lookahead, scheduleAheadTime]);

  const start = useCallback(() => {
    if (isPlaying) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;

    // Resume if suspended (browser policy)
    if (ctx?.state === 'suspended') {
      ctx.resume();
    }

    if (ctx) {
      if (metronomeOutputDeviceId && metronomeOutputDeviceId !== 'default' && 'setSinkId' in ctx) {
        (ctx as any)
          .setSinkId(metronomeOutputDeviceId)
          .catch((err) => console.warn('Failed to set metronome output:', err));
      }

      nextNoteTimeRef.current = ctx.currentTime + 0.05;
      currentBeatRef.current = 0; // Reset beat counter on start
      setIsPlaying(true);
      // Start the scheduler loop
      scheduler();
    }
  }, [isPlaying, scheduler, metronomeOutputDeviceId]);

  const clearPendingTimeouts = useCallback(() => {
    beatTimeoutsRef.current.forEach((id) => clearTimeout(id));
    beatTimeoutsRef.current = [];
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    if (timerIDRef.current !== null) {
      clearTimeout(timerIDRef.current);
      timerIDRef.current = null;
    }
    clearPendingTimeouts();
  }, [clearPendingTimeouts]);

  const toggle = useCallback(() => {
    // We need to check the current state ref or rely on the state variable.
    // Since this is a toggle, functional update or play/stop is fine.
    // However, we need to access `isPlaying` correctly.
    // The `isPlaying` from scope might be stale if `toggle` isn't updated?
    // `toggle` depends on `isPlaying`.
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIDRef.current !== null) {
        clearTimeout(timerIDRef.current);
      }
      clearPendingTimeouts();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [clearPendingTimeouts]);

  return { isPlaying, start, stop, toggle };
};
