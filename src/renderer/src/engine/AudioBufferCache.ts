interface CacheEntry {
  buffer: AudioBuffer;
  references: number;
}

export class AudioBufferCache {
  private readonly buffers = new Map<string, CacheEntry>();

  has(key: string): boolean {
    return this.buffers.has(key);
  }

  get(key: string): AudioBuffer | undefined {
    return this.buffers.get(key)?.buffer;
  }

  set(key: string, buffer: AudioBuffer): void {
    const existing = this.buffers.get(key);

    if (existing) {
      existing.buffer = buffer;
      return;
    }

    this.buffers.set(key, {
      buffer,
      references: 0
    });
  }

  retain(key: string): void {
    const entry = this.buffers.get(key);

    if (entry) {
      entry.references += 1;
    }
  }

  release(key: string): boolean {
    const entry = this.buffers.get(key);
    if (!entry) return false;

    entry.references = Math.max(0, entry.references - 1);

    if (entry.references === 0) {
      return this.buffers.delete(key);
    }

    return false;
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

    for (const { buffer } of this.buffers.values()) {
      bytes += buffer.length * buffer.numberOfChannels * 4;
    }

    return bytes;
  }
}
