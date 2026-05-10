/**
 * dateTime.ts
 * ─────────────────────────────────────────────────────────────
 * RULE: All communication with the backend uses UTC ISO-8601 strings
 *       ending in 'Z'.  User-facing display converts to the browser's
 *       local timezone via Intl.DateTimeFormat.
 */

/** Parses a UTC ISO string and returns a Date object */
export function parseUtc(isoUtc: string): Date {
  return new Date(isoUtc); // Browser always interprets Z-suffixed strings as UTC
}

/**
 * Converts a <input type="datetime-local"> value (local, no TZ)
 * to a UTC ISO string with Z suffix — ready to send to the API.
 *
 * @param localValue — e.g. "2025-06-10T10:00"
 * @returns           — e.g. "2025-06-10T14:00:00.000Z" (if UTC-4)
 */
export function localInputToUtcIso(localValue: string): string {
  if (!localValue) return '';
  return new Date(localValue).toISOString();
}

/**
 * Converts a UTC ISO string to the value required by
 * <input type="datetime-local"> (local time, no TZ suffix).
 *
 * @param utcIso — e.g. "2025-06-10T14:00:00.000Z"
 * @returns       — e.g. "2025-06-10T10:00" (if UTC-4)
 */
export function utcIsoToLocalInput(utcIso: string): string {
  if (!utcIso) return '';
  const d = parseUtc(utcIso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/**
 * Returns a human-readable local-time string, e.g. "mar. 10 jun., 10:00"
 */
export function formatDisplayDateTime(
  utcIso: string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!utcIso) return '';
  return parseUtc(utcIso).toLocaleString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

/** Short HH:mm display */
export function formatShortTime(utcIso: string, locale: string): string {
  if (!utcIso) return '';
  return parseUtc(utcIso).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns the UTC ISO boundaries for the week containing `date`.
 */
export function getWeekRangeUtc(date: Date): { from: string; to: string } {
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    from: monday.toISOString(),
    to: sunday.toISOString(),
  };
}

/**
 * Returns the min value for a datetime-local input (15 minutes from now).
 */
export function minDatetimeLocal(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 15);
  return utcIsoToLocalInput(now.toISOString());
}

/**
 * Checks if a UTC ISO date string falls on the same calendar day as a given local Date object.
 */
export function isSameLocalDay(utcIso: string, localDate: Date): boolean {
  return parseUtc(utcIso).toDateString() === localDate.toDateString();
}

/**
 * Returns a human-readable local-time string (DD MMM YYYY, HH:mm)
 */
import { getLocaleString } from '@/locales/i18n';

/**
 * Returns a human-readable local-time string (DD MMM YYYY, HH:mm)
 */
export function formatDate(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString(getLocaleString(), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns a human-readable local-time string with long month
 */
export function formatDateLong(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(getLocaleString(), {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Alias for formatDate for consistency in components using "formatDateTime" name
 */
export const formatDateTime = formatDate;
