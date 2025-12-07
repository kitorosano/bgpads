import { useCallback, useEffect, useRef, useState } from 'react';

export const useMetronome = (bpm: number) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const timerIDRef = useRef<NodeJS.Timeout | null>(null);
  const lookahead = 25.0; // milliseconds
  const scheduleAheadTime = 0.1; // seconds

  // Use a ref for BPM so the scheduler always sees the latest value
  // without needing to be recreated (which would restart the loop logic mostly).
  const bpmRef = useRef(bpm);
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  const nextNote = useCallback(() => {
    const secondsPerBeat = 60.0 / bpmRef.current;
    nextNoteTimeRef.current += secondsPerBeat;
  }, []);

  const scheduleNote = useCallback((time: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = 1000; // 1000Hz beep
    gain.gain.value = 0.5;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.05); // Short beep
  }, []);

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
      nextNoteTimeRef.current = ctx.currentTime + 0.05;
      setIsPlaying(true);
      // Start the scheduler loop
      scheduler();
    }
  }, [isPlaying, scheduler]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    if (timerIDRef.current !== null) {
      clearTimeout(timerIDRef.current);
      timerIDRef.current = null;
    }
  }, []);

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
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { isPlaying, start, stop, toggle };
};
