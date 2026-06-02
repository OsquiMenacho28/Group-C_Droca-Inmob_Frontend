<template>
  <FwbAlert v-if="conflict.hasConflict" type="danger" class="mb-4">
    <div class="flex items-start gap-3">
      <IconLucideAlertTriangle class="mt-0.5 h-5 w-5 shrink-0" />
      <div class="flex-1">
        <h3 class="text-sm font-semibold">{{ t('conflict.title') }}</h3>
        <p class="mt-1 text-sm">{{ conflict.message }}</p>
      </div>
    </div>

    <div class="mt-3 ml-8">
      <p class="text-xs font-medium uppercase tracking-wide mb-2">
        {{ t('conflict.scheduledVisits') }}
      </p>
      <FwbListGroup>
        <FwbListGroupItem
          v-for="ev in conflict.conflictingEvents"
          :key="ev.id"
          class="flex items-center gap-2 text-sm"
        >
          <IconLucideCalendar class="h-4 w-4" />
          <span>
            <strong>{{ ev.agentName }}</strong>
            — {{ formatTime(ev.startTime) }} a
            {{ formatTime(ev.endTime) }}
          </span>
        </FwbListGroupItem>
      </FwbListGroup>
    </div>

    <div v-if="conflict.suggestedStartTime" class="mt-3 ml-8">
      <FwbAlert type="warning" class="mt-3">
        <p class="text-xs font-medium uppercase tracking-wide">
          {{ t('conflict.suggestedSlot') }}
        </p>
        <p class="text-sm mt-1">
          🕐 {{ formatTime(conflict.suggestedStartTime) }} —
          {{ formatTime(conflict.suggestedEndTime!) }}
        </p>
        <FwbButton
          v-if="showUseSuggestion"
          @click="
            $emit(
              'use-suggestion',
              conflict.suggestedStartTime,
              conflict.suggestedEndTime
            )
          "
          size="xs"
          color="yellow"
          class="mt-2"
        >
          {{ t('conflict.useSuggested') }}
        </FwbButton>
      </FwbAlert>
    </div>
  </FwbAlert>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { getLocaleString } from '@/locales/i18n';
import type { ConflictResponse } from '@/types/visitCalendar';
import {
  FwbAlert,
  FwbListGroup,
  FwbListGroupItem,
  FwbButton,
} from 'flowbite-vue';
import IconLucideAlertTriangle from '~icons/lucide/alert-triangle';
import IconLucideCalendar from '~icons/lucide/calendar';

const { t } = useI18n();

defineProps<{
  conflict: ConflictResponse;
  showUseSuggestion?: boolean;
}>();

defineEmits<{
  (e: 'use-suggestion', start?: string, end?: string): void;
}>();

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(getLocaleString(), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>
