import type { TonalPadKey } from '@bgpads/shared';

export type Language = 'es' | 'en';

export type Theme = 'light' | 'dark';

export interface WindowState {
  width: number;
  height: number;
  x: number;
  y: number;
  maximized: boolean;
}

export interface TonalPadBankValidation {
  path: string;
  availableKeys: TonalPadKey[];
  missingKeys: TonalPadKey[];
}

export interface RemoteConnectionInfo {
  host: string;
  port: number;
  interfaceName: string;
}
