import { createI18n } from 'vue-i18n';

// Import JSON modules
import esUI from '@/locales/es/ui.json';
import esNav from '@/locales/es/nav.json';
import esUsers from '@/locales/es/users.json';
import esAudit from '@/locales/es/audit.json';
import esReports from '@/locales/es/reports.json';
import esDashboard from '@/locales/es/dashboard.json';
import esVehicles from '@/locales/es/vehicles.json';
import esAuth from '@/locales/es/auth.json';
import esCalendar from '@/locales/es/calendar.json';
import esProperties from '@/locales/es/properties.json';

import enUI from '@/locales/en/ui.json';
import enNav from '@/locales/en/nav.json';
import enUsers from '@/locales/en/users.json';
import enAudit from '@/locales/en/audit.json';
import enReports from '@/locales/en/reports.json';
import enDashboard from '@/locales/en/dashboard.json';
import enVehicles from '@/locales/en/vehicles.json';
import enAuth from '@/locales/en/auth.json';
import enCalendar from '@/locales/en/calendar.json';
import enProperties from '@/locales/en/properties.json';

// Merge modules
const es = {
  ...esUI,
  ...esNav,
  ...esUsers,
  ...esAudit,
  ...esReports,
  ...esDashboard,
  ...esVehicles,
  ...esAuth,
  ...esCalendar,
  ...esProperties,
};

const en = {
  ...enUI,
  ...enNav,
  ...enUsers,
  ...enAudit,
  ...enReports,
  ...enDashboard,
  ...enVehicles,
  ...enAuth,
  ...enCalendar,
  ...enProperties,
};

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
