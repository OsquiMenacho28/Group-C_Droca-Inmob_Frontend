import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export type PropertyStatus =
  | 'DISPONIBLE'
  | 'RESERVADO'
  | 'VENDIDO'
  | 'EN_NEGOCIACION'
  | 'ELIMINADO'
  | 'RETIRADO';

export function usePropertyStatus(status?: string) {
  const { t } = useI18n();

  const currentStatus = computed(() => (status?.toUpperCase() as PropertyStatus) || 'DISPONIBLE');

  const isSold = computed(() => currentStatus.value === 'VENDIDO');
  const isDeleted = computed(() => currentStatus.value === 'ELIMINADO');
  const isWithdrawn = computed(() => currentStatus.value === 'RETIRADO');
  const isReserved = computed(() => currentStatus.value === 'RESERVADO');
  const isNegotiating = computed(() => currentStatus.value === 'EN_NEGOCIACION');
  const isAvailable = computed(() => currentStatus.value === 'DISPONIBLE');

  const isMinimalInfo = computed(() => isSold.value || isDeleted.value || isWithdrawn.value);

  const statusLabel = computed(() => t(`status.${currentStatus.value}`));

  const statusColor = computed(() => {
    switch (currentStatus.value) {
      case 'DISPONIBLE':
        return 'green';
      case 'RESERVADO':
        return 'yellow';
      case 'VENDIDO':
        return 'red';
      case 'EN_NEGOCIACION':
        return 'blue';
      case 'ELIMINADO':
        return 'gray';
      case 'RETIRADO':
        return 'orange';
      default:
        return 'gray';
    }
  });

  const statusBadgeClass = computed(() => {
    switch (currentStatus.value) {
      case 'DISPONIBLE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'RESERVADO':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'VENDIDO':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'EN_NEGOCIACION':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ELIMINADO':
        return 'bg-gray-400 text-white dark:bg-gray-600 dark:text-gray-200';
      case 'RETIRADO':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  });

  return {
    currentStatus,
    isSold,
    isDeleted,
    isWithdrawn,
    isReserved,
    isNegotiating,
    isAvailable,
    isMinimalInfo,
    statusLabel,
    statusColor,
    statusBadgeClass,
  };
}
