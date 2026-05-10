/**
 * styling.ts
 * ─────────────────────────────────────────────────────────────
 * Centralized styling logic and Tailwind utility helpers.
 */

/**
 * Returns the CSS classes for a status badge based on the status string.
 * Supports standard statuses like PENDING, ACCEPTED, REJECTED, etc.
 */
export function statusBadgeClass(status: string): string {
  const normalizedStatus = status?.toUpperCase() || '';

  const map: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    DISPONIBLE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    VENDIDO: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    ALQUILADO: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    RESERVADO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    EN_NEGOCIACION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    RETIRADO: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return map[normalizedStatus] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}
