export interface LanguageMeta {
  id: 'ar' | 'fr' | 'en' | 'ur' | 'id' | 'bn' | 'tr' | 'ms' | 'de' | 'es';
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  region?: string;
  popular?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { id: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl', region: 'Middle East', popular: true },
  { id: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr', region: 'Global', popular: true },
  { id: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr', region: 'Europe/Africa' },
  { id: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl', region: 'South Asia' },
  { id: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr', region: 'Southeast Asia' },
  { id: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr', region: 'Middle East/Europe' },
  { id: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', dir: 'ltr', region: 'South Asia' },
  { id: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', dir: 'ltr', region: 'Southeast Asia' },
  { id: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr', region: 'Europe' },
  { id: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr', region: 'Global' }
];
