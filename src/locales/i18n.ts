import { createI18n } from 'vue-i18n';
import { es } from '@/locales/es';
import { en } from '@/locales/en';

type MessageSchema = typeof es;

declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
}

export type Language = 'es' | 'en';

const DEFAULT_LANGUAGE: Language = 'es';

function getSavedLanguage(): Language {
  const stored = localStorage.getItem('language') as Language;
  return stored === 'es' || stored === 'en' ? stored : DEFAULT_LANGUAGE;
}

const i18n = createI18n({
  legacy: false,
  locale: getSavedLanguage(),
  fallbackLocale: 'es',
  messages: { es, en },
  datetimeFormats: {
    es: {
      short: { year: 'numeric', month: '2-digit', day: '2-digit' },
      long: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      },
      time: { hour: '2-digit', minute: '2-digit' },
      monthShort: { month: 'short' },
      monthYear: { month: 'short', year: 'numeric' },
      weekday: { weekday: 'short' },
    },
    en: {
      short: { year: 'numeric', month: '2-digit', day: '2-digit' },
      long: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      },
      time: { hour: '2-digit', minute: '2-digit' },
      monthShort: { month: 'short' },
      monthYear: { month: 'short', year: 'numeric' },
      weekday: { weekday: 'short' },
    },
  },
  numberFormats: {
    es: {
      currency: { style: 'currency', currency: 'USD', minimumFractionDigits: 0 },
      decimal: { style: 'decimal', minimumFractionDigits: 0 },
    },
    en: {
      currency: { style: 'currency', currency: 'USD', minimumFractionDigits: 0 },
      decimal: { style: 'decimal', minimumFractionDigits: 0 },
    },
  },
});

/** Set language and persist to localStorage */
export function setLanguage(lang: Language): void {
  localStorage.setItem('language', lang);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (i18n.global.locale as any).value = lang;
}

/** Get the current active language */
export function getCurrentLanguage(): Language {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (i18n.global.locale as any).value as Language;
}

/** Get the locale string for toLocaleString() calls in non-component code */
export function getLocaleString(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (i18n.global.locale as any).value === 'en' ? 'en-US' : 'es-BO';
}

export default i18n;
