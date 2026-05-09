import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { I18nManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Locale, TranslationKey, EN, HE, interpolate } from '../i18n/translations';

const STORAGE_KEY = '@familycare_lang';

interface LanguageContextValue {
  locale: Locale;
  isRTL: boolean;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  isRTL: false,
  setLocale: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Load persisted preference
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'en' || val === 'he') {
        applyLocale(val, false);
      }
    });
  }, []);

  function applyLocale(l: Locale, persist = true) {
    setLocaleState(l);
    if (persist) {
      AsyncStorage.setItem(STORAGE_KEY, l);
    }
    // RTL support
    const isHe = l === 'he';
    if (Platform.OS === 'web') {
      if (typeof document !== 'undefined') {
        document.documentElement.dir = isHe ? 'rtl' : 'ltr';
        document.documentElement.lang = isHe ? 'he' : 'en';
      }
    } else {
      // On native, RTL change requires app restart — we set it for next launch
      if (I18nManager.isRTL !== isHe) {
        I18nManager.forceRTL(isHe);
        // Note: RNW/Expo Go will need a reload
      }
    }
  }

  const setLocale = useCallback((l: Locale) => applyLocale(l, true), []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      const map = locale === 'he' ? HE : EN;
      const str = map[key] ?? (EN[key] ?? key);
      return interpolate(str, vars);
    },
    [locale],
  );

  const isRTL = locale === 'he';

  return (
    <LanguageContext.Provider value={{ locale, isRTL, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
