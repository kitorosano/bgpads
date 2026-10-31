import * as fs from 'fs';
import * as path from 'path';
import { TonalPadBankValidation, TonalPadKey } from '../types';

const TONAL_PAD_FILES: Record<TonalPadKey, string> = {
  C: 'C.mp3',
  'C#': 'Db.mp3',
  D: 'D.mp3',
  'D#': 'Eb.mp3',
  E: 'E.mp3',
  F: 'F.mp3',
  'F#': 'Gb.mp3',
  G: 'G.mp3',
  'G#': 'Ab.mp3',
  A: 'A.mp3',
  'A#': 'Bb.mp3',
  B: 'B.mp3'
};

export const validateTonalPadBank = (directoryPath: string): TonalPadBankValidation => {
  const availableKeys: TonalPadKey[] = [];
  const missingKeys: TonalPadKey[] = [];

  for (const [key, fileName] of Object.entries(TONAL_PAD_FILES)) {
    const filePath = path.join(directoryPath, fileName);

    if (fs.existsSync(filePath)) {
      availableKeys.push(key as TonalPadKey);
    } else {
      missingKeys.push(key as TonalPadKey);
    }
  }

  return {
    path: directoryPath,
    availableKeys,
    missingKeys
  };
};

export const resolveTonalPadPath = (directoryPath: string, key: string): string => {
  const fileName = TONAL_PAD_FILES[key];

  if (!fileName) {
    throw new Error(`Unknown tonal pad key: ${key}`);
  }

  const filePath = path.join(directoryPath, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Tonal pad file not found: ${fileName}`);
  }

  return filePath;
};
