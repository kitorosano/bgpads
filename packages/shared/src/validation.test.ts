import { describe, expect, it } from 'vitest';
import { DEFAULT_BPM, MAX_BPM, MAX_TRACK_VOLUME, MIN_BPM, MIN_TRACK_VOLUME } from './audio.js';
import {
  clampBpm,
  isValidBpm,
  isValidColor,
  isValidNumber,
  isValidText,
  isValidTonalKey,
  isValidTrack,
  isValidVolume
} from './validation.js';

describe('clampBpm', () => {
  it('should preserve valid BPM values', () => {
    expect(clampBpm(120)).toBe(120);
    expect(clampBpm(120.5)).toBe(120.5);
  });

  it('should parse numeric strings', () => {
    expect(clampBpm('120')).toBe(120);
    expect(clampBpm('120.5')).toBe(120.5);
  });

  it('should clamp values outside BPM limits', () => {
    expect(clampBpm(MIN_BPM - 1)).toBe(MIN_BPM);
    expect(clampBpm(MAX_BPM + 1)).toBe(MAX_BPM);
  });

  it('should use default BPM for invalid values', () => {
    expect(clampBpm('invalid')).toBe(DEFAULT_BPM);
    expect(clampBpm(NaN)).toBe(DEFAULT_BPM);
    expect(clampBpm(Infinity)).toBe(DEFAULT_BPM);
  });

  it('should round BPM to one decimal place', () => {
    expect(clampBpm(120.56)).toBe(120.6);
    expect(clampBpm(120.54)).toBe(120.5);
  });
});

describe('isValidText', () => {
  it('should accept texts', () => {
    expect(isValidText('abc123')).toBe(true);
    expect(isValidText('hello world')).toBe(true);
    expect(isValidText('123')).toBe(true);
    expect(isValidText('a')).toBe(true);
  });

  it('should reject empty texts', () => {
    expect(isValidText('')).toBe(false);
    expect(isValidText('   ')).toBe(false);
  });

  it('should reject invalid values', () => {
    expect(isValidText(NaN)).toBe(false);
    expect(isValidText(Infinity)).toBe(false);
    expect(isValidText({})).toBe(false);
    expect(isValidText(null)).toBe(false);
  });
});

describe('isValidNumber', () => {
  it('should accept numbers', () => {
    expect(isValidNumber(123)).toBe(true);
    expect(isValidNumber(123.45)).toBe(true);
    expect(isValidNumber(0)).toBe(true);
    expect(isValidNumber(-123)).toBe(true);
  });
  it('should reject invalid values', () => {
    expect(isValidNumber(NaN)).toBe(false);
    expect(isValidNumber(Infinity)).toBe(false);
    expect(isValidNumber({})).toBe(false);
    expect(isValidNumber(null)).toBe(false);
    expect(isValidNumber('123')).toBe(false);
  });
});

describe('isValidColor', () => {
  it('should accept valid hex color strings', () => {
    expect(isValidColor('#FFFFFF')).toBe(true);
    expect(isValidColor('#000000')).toBe(true);
    expect(isValidColor('#FF5733')).toBe(true);
    expect(isValidColor('#abcdef')).toBe(true);
  });

  it('should reject colors outside valid hex range', () => {
    expect(isValidColor('#FFF')).toBe(false);
    expect(isValidColor('#12345G')).toBe(false);
    expect(isValidColor('#1234567')).toBe(false);
    expect(isValidColor('123456')).toBe(false);
  });

  it('should reject invalid values', () => {
    expect(isValidColor(NaN)).toBe(false);
    expect(isValidColor(Infinity)).toBe(false);
    expect(isValidColor({})).toBe(false);
    expect(isValidColor(null)).toBe(false);
    expect(isValidColor(123456)).toBe(false);
  });
});

describe('isValidVolume', () => {
  it('should accept volumes within limits', () => {
    expect(isValidVolume(MIN_TRACK_VOLUME)).toBe(true);
    expect(isValidVolume(0.5)).toBe(true);
    expect(isValidVolume(1)).toBe(true);
    expect(isValidVolume(MAX_TRACK_VOLUME)).toBe(true);
  });

  it('should reject volumes outside limits', () => {
    expect(isValidVolume(MIN_TRACK_VOLUME - 0.1)).toBe(false);
    expect(isValidVolume(MAX_TRACK_VOLUME + 0.1)).toBe(false);
  });

  it('should reject invalid values', () => {
    expect(isValidVolume(NaN)).toBe(false);
    expect(isValidVolume(Infinity)).toBe(false);
    expect(isValidVolume('1')).toBe(false);
    expect(isValidVolume(null)).toBe(false);
  });
});

describe('isValidBpm', () => {
  it('should accept integer and decimal BPM values', () => {
    expect(isValidBpm(120)).toBe(true);
    expect(isValidBpm(120.5)).toBe(true);
    expect(isValidBpm(MIN_BPM)).toBe(true);
    expect(isValidBpm(MAX_BPM)).toBe(true);
  });

  it('should reject values outside limits', () => {
    expect(isValidBpm(MIN_BPM - 0.1)).toBe(false);
    expect(isValidBpm(MAX_BPM + 0.1)).toBe(false);
  });

  it('should reject invalid numeric values', () => {
    expect(isValidBpm(NaN)).toBe(false);
    expect(isValidBpm(Infinity)).toBe(false);
    expect(isValidBpm('120')).toBe(false);
  });
});

describe('isValidTonalKey', () => {
  it('should accept all twelve tonal keys', () => {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    for (const key of keys) {
      expect(isValidTonalKey(key)).toBe(true);
    }
  });

  it('should reject unsupported tonal keys', () => {
    expect(isValidTonalKey('H')).toBe(false);
    expect(isValidTonalKey('Db')).toBe(false);
    expect(isValidTonalKey('')).toBe(false);
    expect(isValidTonalKey('c')).toBe(false);
  });

  it('should reject non-string values', () => {
    expect(isValidTonalKey(null)).toBe(false);
    expect(isValidTonalKey(123)).toBe(false);
    expect(isValidTonalKey(undefined)).toBe(false);
  });
});

describe('isValidTrack', () => {
  it('should accept a valid track object', () => {
    const validTrack = {
      id: 'track1',
      name: 'My Track',
      color: '#FF5733',
      volume: 0.5,
      bpm: 120
    };

    expect(isValidTrack(validTrack)).toBe(true);
  });

  it('should reject non-object values', () => {
    expect(isValidTrack(null)).toBe(false);
    expect(isValidTrack(undefined)).toBe(false);
    expect(isValidTrack(123)).toBe(false);
    expect(isValidTrack('track')).toBe(false);
    expect(isValidTrack([])).toBe(false);
    expect(isValidTrack([1, 2, 3])).toBe(false);
  });

  it('should reject objects missing required properties', () => {
    const missingId = {
      name: 'My Track',
      color: '#FF5733',
      volume: 0.5,
      bpm: 120
    };

    const missingName = {
      id: 'track1',
      color: '#FF5733',
      volume: 0.5,
      bpm: 120
    };

    const missingColor = {
      id: 'track1',
      name: 'My Track',
      volume: 0.5,
      bpm: 120
    };

    const missingVolume = {
      id: 'track1',
      name: 'My Track',
      color: '#FF5733',
      bpm: 120
    };

    const missingBpm = {
      id: 'track1',
      name: 'My Track',
      color: '#FF5733',
      volume: 0.5
    };

    expect(isValidTrack(missingId)).toBe(false);
    expect(isValidTrack(missingName)).toBe(false);
    expect(isValidTrack(missingColor)).toBe(false);
    expect(isValidTrack(missingVolume)).toBe(false);
    expect(isValidTrack(missingBpm)).toBe(false);
  });
});
