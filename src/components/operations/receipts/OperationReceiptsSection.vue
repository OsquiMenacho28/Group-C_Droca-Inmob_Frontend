<template>
  <section class="space-y-6">
    <FwbCard
      class="!max-w-full w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-sm"
    >
      <div class="p-8 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"
          ></div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white leading-none">
              {{ t('receiptsSection.title') }}
            </h2>
            <div class="mt-2">
              <FwbBadge type="default" size="sm" class="font-bold tracking-wider uppercase">
                {{ t('receiptsSection.badge', { n: receipts.length }) }}
              </FwbBadge>
            </div>
          </div>
        </div>

        <FwbButton
          @click="showUploader = !showUploader"
          :color="showUploader ? 'light' : 'blue'"
          size="sm"
          class="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 shadow-sm"
        >
          <div class="flex items-center gap-2 px-1">
            <IconLucidePlus
              class="w-4 h-4 transition-transform duration-200"
              :class="showUploader ? 'rotate-45' : ''"
            />
            <span class="font-bold">
              {{
                showUploader ? t('receiptsSection.cancelButton') : t('receiptsSection.addButton')
              }}
            </span>
          </div>
        </FwbButton>
      </div>
    </FwbCard>

    <FwbAlert v-if="error" type="danger" class="flex items-center gap-3 shadow-sm mx-2">
      <IconLucideAlertCircle class="w-5 h-5 shrink-0" />
      <span class="font-medium">{{ error }}</span>
    </FwbAlert>

    <Transition name="slide-down">
      <div v-if="showUploader" class="px-1">
        <ReceiptUploader :operation-id="operationId" @uploaded="onUploaded" />
      </div>
    </Transition>

    <FwbAlert
      v-if="toastVisible"
      type="success"
      class="fixed bottom-10 right-10 z-[60] max-w-sm shadow-2xl border-l-4 border-green-500 animate-slide-in"
    >
      <div class="flex items-center gap-3 py-1">
        <div class="bg-green-100 dark:bg-green-900/40 p-1.5 rounded-full">
          <IconLucideCircleCheck class="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <span class="font-bold text-gray-900 dark:text-white">
          {{ t('receiptsSection.toastSuccess') }}
        </span>
      </div>
    </FwbAlert>

    <div class="space-y-4">
      <ReceiptList :receipts="receipts" :loading="loading" @delete="handleDelete" />
    </div>

    <FwbCard
      v-if="receipts.length > 0"
      class="!max-w-full w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-sm bg-gray-50/50"
    >
      <div class="p-8 flex flex-wrap gap-10 justify-between items-center">
        <div class="space-y-2">
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-black">
            {{ t('receiptsSection.totalLabel') }}
          </p>
          <div class="flex items-center gap-3 text-gray-900 dark:text-white">
            <span class="text-2xl font-black">{{ receipts.length }}</span>
            <span class="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-tight">
              {{ t('common.entries').toUpperCase() }}
            </span>
          </div>
        </div>

        <div class="flex flex-wrap gap-10">
          <div
            v-for="(total, currency) in totalsByCurrency"
            :key="currency"
            class="text-right space-y-2 border-r last:border-0 border-gray-200 dark:border-gray-700 pr-10 last:pr-0"
          >
            <p
              class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-black"
            >
              {{ currency }}
            </p>
            <p class="text-2xl font-black text-blue-600 dark:text-blue-500 tracking-tighter">
              {{ formatAmount(total, currency) }}
            </p>
          </div>
        </div>
      </div>
    </FwbCard>
  </section>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { FwbCard, FwbButton, FwbAlert, FwbBadge } from 'flowbite-vue';
  import { useReceipts } from '@/composables/useReceipts';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';

  import ReceiptUploader from './ReceiptUploader.vue';
  import ReceiptList from './ReceiptList.vue';
  import IconLucidePlus from '~icons/lucide/plus';
  import IconLucideAlertCircle from '~icons/lucide/alert-circle';
  import IconLucideCircleCheck from '~icons/lucide/circle-check';

  const { t } = useI18n();

  const props = defineProps<{ operationId: string }>();

  const { receipts, loading, error, loadReceipts, deleteReceipt } = useReceipts(props.operationId);

  const showUploader = ref(false);
  const toastVisible = ref(false);

  onMounted(loadReceipts);

  const totalsByCurrency = computed(() => {
    return receipts.value.reduce<Record<string, number>>((acc, r) => {
      acc[r.currency] = (acc[r.currency] ?? 0) + Number(r.amount);
      return acc;
    }, {});
  });

  function onUploaded() {
    showUploader.value = false;
    showToast();
  }

  async function handleDelete(receiptId: string) {
    await deleteReceipt(receiptId);
  }

  function showToast() {
    toastVisible.value = true;
    setTimeout(() => (toastVisible.value = false), 4000);
  }

  function formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat(getLocaleString(), {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }
</script>

<style scoped>
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    max-height: 800px;
    overflow: hidden;
  }
  .slide-down-enter-from,
  .slide-down-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-20px);
  }

  .animate-slide-in {
    animation: slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>
