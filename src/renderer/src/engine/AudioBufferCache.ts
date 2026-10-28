export class AudioBufferCache {
  private buffers = new Map<string, AudioBuffer>();

  has(key: string): boolean {
    return this.buffers.has(key);
  }

  get(key: string): AudioBuffer | undefined {
    return this.buffers.get(key);
  }

  set(key: string, buffer: AudioBuffer): void {
    this.buffers.set(key, buffer);
  }

  delete(key: string): boolean {
    return this.buffers.delete(key);
  }

  clear(): void {
    this.buffers.clear();
  }

  get size(): number {
    return this.buffers.size;
  }

  getEstimatedMemoryUsage(): number {
    let bytes = 0;

    for (const buffer of this.buffers.values()) {
      bytes += buffer.length * buffer.numberOfChannels * 4;
    }

    return bytes;
  }
}
