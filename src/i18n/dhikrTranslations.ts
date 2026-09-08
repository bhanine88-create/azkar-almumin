import { Dhikr } from '../types';

export interface LocalizedDhikrMeta {
  localizedTitle?: string;
  localizedDescription?: string;
  localizedTranslation?: string;
}

export function getLocalizedDhikr(dhikr: Dhikr, language?: string): LocalizedDhikrMeta {
  return {
    localizedTitle: dhikr.title,
    localizedDescription: dhikr.description,
    localizedTranslation: undefined
  };
}
