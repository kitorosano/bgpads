import { describe, expect, it } from 'vitest';
import { MAX_BPM, MAX_TRACK_VOLUME, MIN_BPM, MIN_TRACK_VOLUME } from './audio.js';
import type { RemoteState } from './remote.js';
import { isRemoteCommand, isRemoteState } from './remoteValidation.js';
import { TONAL_PAD_KEYS } from './tonalPad.js';

describe('isRemoteCommand', () => {
  const validTrack = {
    name: 'Piano',
    color: '#336699',
    volume: 1,
    bpm: 120
  };

  describe('invalid messages', () => {
    it.each([null, undefined, 123, 'track.play', true, [], {}, { type: 'unknown.command' }])(
      'should reject invalid message: %j',
      (value) => {
        expect(isRemoteCommand(value)).toBe(false);
      }
    );
  });

  describe('metronome.toggle', () => {
    it('should accept a valid command', () => {
      expect(isRemoteCommand({ type: 'metronome.toggle' })).toBe(true);
    });
  });

  describe('track.play', () => {
    it('should accept a non-empty trackId', () => {
      expect(
        isRemoteCommand({
          type: 'track.play',
          trackId: 'track-1'
        })
      ).toBe(true);
    });

    it.each(['', null, undefined, 123])('should reject invalid trackId: %j', (trackId) => {
      expect(isRemoteCommand({ type: 'track.play', trackId })).toBe(false);
    });
  });

  describe('track.stop', () => {
    it('should accept a valid command', () => {
      expect(isRemoteCommand({ type: 'track.stop' })).toBe(true);
    });
  });

  describe('track.update', () => {
    it('should accept valid track changes', () => {
      expect(
        isRemoteCommand({
          type: 'track.update',
          trackId: 'track-1',
          changes: validTrack
        })
      ).toBe(true);
    });

    it('should accept boundary values', () => {
      for (const [volume, bpm] of [
        [MIN_TRACK_VOLUME, MIN_BPM],
        [MAX_TRACK_VOLUME, MAX_BPM]
      ]) {
        expect(
          isRemoteCommand({
            type: 'track.update',
            trackId: 'track-1',
            changes: { ...validTrack, volume, bpm }
          })
        ).toBe(true);
      }
    });

    it.each([
      { volume: MIN_TRACK_VOLUME - 0.1 },
      { volume: MAX_TRACK_VOLUME + 0.1 },
      { volume: NaN },
      { volume: Infinity },
      { volume: '1' },
      { bpm: MIN_BPM - 1 },
      { bpm: MAX_BPM + 1 },
      { bpm: NaN },
      { bpm: Infinity },
      { bpm: '120' },
      { name: '' },
      { name: 123 },
      { color: 'red' },
      { color: '#FFF' },
      { color: '#GGGGGG' }
    ])('should reject invalid changes: %j', (changes) => {
      expect(
        isRemoteCommand({
          type: 'track.update',
          trackId: 'track-1',
          changes: { ...validTrack, ...changes }
        })
      ).toBe(false);
    });

    it.each([null, undefined, {}, [], 'invalid'])(
      'should reject invalid changes object: %j',
      (changes) => {
        expect(
          isRemoteCommand({
            type: 'track.update',
            trackId: 'track-1',
            changes
          })
        ).toBe(false);
      }
    );

    it('should reject missing trackId', () => {
      expect(
        isRemoteCommand({
          type: 'track.update',
          changes: validTrack
        })
      ).toBe(false);
    });
  });

  describe('track.reorder', () => {
    it('should accept different track IDs', () => {
      expect(
        isRemoteCommand({
          type: 'track.reorder',
          sourceTrackId: 'track-1',
          targetTrackId: 'track-2'
        })
      ).toBe(true);
    });

    it.each([
      ['', 'track-2'],
      ['track-1', ''],
      ['track-1', 'track-1'],
      [null, 'track-2'],
      ['track-1', undefined]
    ])('should reject invalid reorder: %j -> %j', (sourceTrackId, targetTrackId) => {
      expect(
        isRemoteCommand({
          type: 'track.reorder',
          sourceTrackId,
          targetTrackId
        })
      ).toBe(false);
    });
  });

  describe('track.delete', () => {
    it('should accept a valid trackId', () => {
      expect(
        isRemoteCommand({
          type: 'track.delete',
          trackId: 'track-1'
        })
      ).toBe(true);
    });

    it.each(['', null, undefined, 123])('should reject invalid trackId: %j', (trackId) => {
      expect(isRemoteCommand({ type: 'track.delete', trackId })).toBe(false);
    });
  });

  describe('track.addTonal', () => {
    it.each([...TONAL_PAD_KEYS])('should accept tonal key %s', (key) => {
      expect(isRemoteCommand({ type: 'track.addTonal', key })).toBe(true);
    });

    it.each(['H', 'Db', '', 'c', null, 123])('should reject invalid tonal key: %j', (key) => {
      expect(isRemoteCommand({ type: 'track.addTonal', key })).toBe(false);
    });
  });
});

describe('isRemoteState', () => {
  const validTrack = {
    id: 'track-1',
    name: 'Piano',
    color: '#336699',
    volume: 1,
    bpm: 120
  };

  const validState: RemoteState = {
    tracks: [validTrack],
    playingTrackId: null,
    availableTonalKeys: [...TONAL_PAD_KEYS],
    fadingOutTrackId: null,
    fadeOutDuration: 0,
    fadeOutStartedAt: null,
    bpm: 120,
    metronomePlaying: false,
    currentBeat: 0,
    timeSignature: '4/4',
    beatAccents: [1, 0, 0, 0],
    playbackProgress: 0,
    currentTime: 0,
    duration: 0
  };

  describe('valid states', () => {
    it('should accept a complete state', () => {
      expect(isRemoteState(validState)).toBe(true);
    });

    it('should accept an empty track list', () => {
      expect(
        isRemoteState({
          ...validState,
          tracks: []
        })
      ).toBe(true);
    });

    it('should accept multiple tracks', () => {
      expect(
        isRemoteState({
          ...validState,
          tracks: [validTrack, { ...validTrack, id: 'track-2' }]
        })
      ).toBe(true);
    });

    it('should accept active playback and fade-out', () => {
      expect(
        isRemoteState({
          ...validState,
          playingTrackId: 'track-1',
          fadingOutTrackId: 'track-2',
          fadeOutDuration: 2000,
          fadeOutStartedAt: 123456789,
          playbackProgress: 0.5,
          currentTime: 30,
          duration: 60
        })
      ).toBe(true);
    });

    it('should accept decimal BPM values', () => {
      expect(
        isRemoteState({
          ...validState,
          bpm: 120.5,
          tracks: [{ ...validTrack, bpm: 120.5 }]
        })
      ).toBe(true);
    });

    it('should accept boundary BPM and volume values', () => {
      for (const [bpm, volume] of [
        [MIN_BPM, MIN_TRACK_VOLUME],
        [MAX_BPM, MAX_TRACK_VOLUME]
      ]) {
        expect(
          isRemoteState({
            ...validState,
            bpm,
            tracks: [{ ...validTrack, bpm, volume }]
          })
        ).toBe(true);
      }
    });

    it('should accept an empty list of tonal keys', () => {
      expect(
        isRemoteState({
          ...validState,
          availableTonalKeys: []
        })
      ).toBe(true);
    });
  });

  describe('invalid root values', () => {
    it.each([null, undefined, 123, 'invalid', true, [], {}])(
      'should reject invalid root: %j',
      (value) => {
        expect(isRemoteState(value)).toBe(false);
      }
    );
  });

  describe('required properties', () => {
    it.each(Object.keys(validState))('should reject missing property: %s', (property) => {
      const state = { ...validState };
      delete (state as Record<string, unknown>)[property];

      expect(isRemoteState(state)).toBe(false);
    });
  });

  describe('tracks', () => {
    it.each([null, {}, 'invalid', 123])('should reject invalid tracks collection: %j', (tracks) => {
      expect(isRemoteState({ ...validState, tracks })).toBe(false);
    });

    it.each([null, {}, 'invalid', 123, []])('should reject invalid track: %j', (track) => {
      expect(
        isRemoteState({
          ...validState,
          tracks: [track]
        })
      ).toBe(false);
    });

    it.each([
      { id: '' },
      { id: null },
      { name: 123 },
      { color: null },
      { volume: MIN_TRACK_VOLUME - 0.1 },
      { volume: MAX_TRACK_VOLUME + 0.1 },
      { volume: NaN },
      { volume: Infinity },
      { volume: '1' },
      { bpm: MIN_BPM - 0.1 },
      { bpm: MAX_BPM + 0.1 },
      { bpm: NaN },
      { bpm: Infinity },
      { bpm: '120' }
    ])('should reject invalid track field: %j', (changes) => {
      expect(
        isRemoteState({
          ...validState,
          tracks: [{ ...validTrack, ...changes }]
        })
      ).toBe(false);
    });
  });

  describe('tonal keys', () => {
    it('should accept all supported tonal keys', () => {
      expect(
        isRemoteState({
          ...validState,
          availableTonalKeys: [...TONAL_PAD_KEYS]
        })
      ).toBe(true);
    });

    it.each([['H'], ['Db'], ['c'], [123], [null]])(
      'should reject invalid tonal keys: %j',
      (keys) => {
        expect(
          isRemoteState({
            ...validState,
            availableTonalKeys: keys
          })
        ).toBe(false);
      }
    );

    it('should reject a non-array tonal key collection', () => {
      expect(
        isRemoteState({
          ...validState,
          availableTonalKeys: 'C'
        })
      ).toBe(false);
    });
  });

  describe('playback and metronome', () => {
    it.each([
      { playingTrackId: 123 },
      { fadingOutTrackId: false },
      { fadeOutDuration: NaN },
      { fadeOutDuration: Infinity },
      { fadeOutStartedAt: '123' },
      { bpm: MIN_BPM - 1 },
      { bpm: MAX_BPM + 1 },
      { bpm: NaN },
      { metronomePlaying: 'true' },
      { currentBeat: 1.5 },
      { currentBeat: '1' },
      { timeSignature: 4 },
      { beatAccents: '1,0,0,0' },
      // { beatAccents: [1, 0.5, 0, 0] }, TODO: should be validated with a isValidBeatAccents function
      { playbackProgress: NaN },
      { currentTime: Infinity },
      { duration: '60' }
    ])('should reject invalid state field: %j', (changes) => {
      expect(
        isRemoteState({
          ...validState,
          ...changes
        })
      ).toBe(false);
    });
  });
});
