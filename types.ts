
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  MARZ_ROHANI = 'MARZ_ROHANI',
  ISM_E_AZAM = 'ISM_E_AZAM',
  ILM_US_SAAT = 'ILM_US_SAAT',
  SHADI_MUWAFIQAT = 'SHADI_MUWAFIQAT',
  KHAIR_O_SHAR = 'KHAIR_O_SHAR'
}

export interface AllahName {
  name: string;
  transliteration: string;
  adad: number;
  meaning: string;
}

export interface SaatHour {
  index: number;
  start: string;
  end: string;
  planet: string;
  isCurrent: boolean;
  value: number;
  status: string;
  judgment: string;
  wazifa: string;
}

export interface CalculationResult {
  totalAdad: number;
  remainder: number;
  interpretation: string;
}
