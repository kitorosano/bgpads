import { AudioBufferCache } from './AudioBufferCache';

export interface AudioEnginePlayOptions {
  volume: number;
  fadeOutDuration: number;
}

type AudioEndedListener = (audioKey: string) => void;

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private activeSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;

  private readonly bufferCache = new AudioBufferCache();
  private readonly pendingLoads = new Map<string, Promise<AudioBuffer>>();

  private activeAudioKey: string | null = null;
  private playRequestId = 0;

  private readonly endedListeners = new Set<AudioEndedListener>();

  onEnded(listener: AudioEndedListener): () => void {
    this.endedListeners.add(listener);

    return () => {
      this.endedListeners.delete(listener);
    };
  }

  private emitEnded(audioKey: string): void {
    for (const listener of this.endedListeners) {
      listener(audioKey);
    }
  }

  private ensureAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    return this.audioContext;
  }

  private async loadAndDecodeBuffer(audioKey: string, filePath: string): Promise<AudioBuffer> {
    const context = this.ensureAudioContext();

    const fileBuffer = await window.api.readBuffer(filePath);

    const decodedBuffer = await context.decodeAudioData(fileBuffer.buffer as ArrayBuffer);
    this.bufferCache.set(audioKey, decodedBuffer);

    return decodedBuffer;
  }

  async setOutputDevice(deviceId?: string): Promise<void> {
    const context = this.ensureAudioContext();

    if (!('setSinkId' in context)) return;

    try {
      await (
        context as AudioContext & {
          setSinkId: (sinkId: string) => Promise<void>;
        }
      ).setSinkId(!deviceId || deviceId === 'default' ? '' : deviceId);
    } catch (error) {
      console.warn('Failed to set audio output device:', error);
    }
  }

  async loadBuffer(audioKey: string, filePath: string): Promise<AudioBuffer> {
    const cachedBuffer = this.bufferCache.get(audioKey);
    if (cachedBuffer) return cachedBuffer;

    const pendingLoad = this.pendingLoads.get(audioKey);
    if (pendingLoad) return pendingLoad;

    const loadPromise = this.loadAndDecodeBuffer(audioKey, filePath);
    this.pendingLoads.set(audioKey, loadPromise);

    try {
      return await loadPromise;
    } finally {
      if (this.pendingLoads.get(audioKey) === loadPromise) {
        this.pendingLoads.delete(audioKey);
      }
    }
  }

  async preload(audioKey: string, filePath: string): Promise<void> {
    await this.loadBuffer(audioKey, filePath);
  }

  async play(
    audioKey: string,
    filePath: string,
    options: AudioEnginePlayOptions
  ): Promise<AudioBuffer | null> {
    const requestId = ++this.playRequestId;

    const buffer = await this.loadBuffer(audioKey, filePath);

    // Another play request was made while this buffer was loading.
    // The newest request always wins.
    if (requestId !== this.playRequestId) return null;

    const context = this.ensureAudioContext();

    this.fadeOutActiveSource(options.fadeOutDuration);

    const source = context.createBufferSource();
    source.buffer = buffer;

    const gain = context.createGain();
    gain.gain.value = options.volume;

    source.connect(gain);
    gain.connect(context.destination);

    source.start();

    this.activeSource = source;
    this.gainNode = gain;
    this.activeAudioKey = audioKey;

    source.onended = () => {
      if (this.activeSource !== source) return;

      this.activeSource = null;
      this.gainNode = null;
      this.activeAudioKey = null;

      this.emitEnded(audioKey);
    };

    return buffer;
  }

  stop(fadeOutDuration: number): void {
    this.playRequestId++;
    this.fadeOutActiveSource(fadeOutDuration);
  }

  setVolume(volume: number): void {
    if (!this.audioContext || !this.gainNode) return;

    this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
  }

  retain(audioKey: string): void {
    this.bufferCache.retain(audioKey);
  }

  release(audioKey: string): boolean {
    if (audioKey === this.activeAudioKey) return false;

    return this.bufferCache.release(audioKey);
  }

  releaseUnreferenced(audioKey: string): boolean {
    if (audioKey === this.activeAudioKey) return false;

    return this.bufferCache.deleteIfUnreferenced(audioKey);
  }

  clearCache(): void {
    this.bufferCache.clear();
  }

  hasCached(audioKey: string): boolean {
    return this.bufferCache.has(audioKey);
  }

  getEstimatedCacheMemoryUsage(): number {
    return this.bufferCache.getEstimatedMemoryUsage();
  }

  private fadeOutActiveSource(duration: number): void {
    if (!this.audioContext || !this.activeSource || !this.gainNode) return;

    const context = this.audioContext;
    const source = this.activeSource;
    const gain = this.gainNode;

    gain.gain.cancelScheduledValues(context.currentTime);
    gain.gain.setValueAtTime(gain.gain.value, context.currentTime);

    gain.gain.linearRampToValueAtTime(0, context.currentTime + duration);

    source.stop(context.currentTime + duration);

    this.activeSource = null;
    this.gainNode = null;
    this.activeAudioKey = null;
  }
}

export const audioEngine = new AudioEngine();
