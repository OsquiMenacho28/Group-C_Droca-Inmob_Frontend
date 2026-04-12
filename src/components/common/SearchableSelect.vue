<template>
  <div class="relative" :class="containerClass">
    <label
      v-if="label"
      class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
    >
      {{ label }}
    </label>

    <div class="relative">
      <div class="relative">
        <div
          class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
        >
          <IconLucideSearch class="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          v-model="searchTerm"
          @focus="showDropdown = true"
          :placeholder="placeholder"
          :disabled="loading"
          class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 pl-9 pr-10 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          :class="{ 'border-blue-500 ring-2 ring-blue-200': modelValue }"
          autocomplete="off"
        />
        <button
          type="button"
          @click="showDropdown = !showDropdown"
          class="absolute inset-y-0 right-0 flex items-center pr-3"
        >
          <IconLucideChevronDown
            class="h-4 w-4 text-gray-400 transition-transform"
            :class="{ 'rotate-180': showDropdown }"
          />
        </button>
      </div>

      <Transition name="dropdown">
        <div
          v-if="showDropdown"
          class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto"
        >
          <div v-if="loading" class="px-4 py-3 text-center">
            <div
              class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"
            ></div>
            <span class="ml-2 text-xs text-gray-500">Cargando...</span>
          </div>

          <ul v-else class="py-1">
            <li
              v-if="filteredItems.length === 0"
              class="px-4 py-3 text-xs text-gray-500 italic text-center"
            >
              No se encontraron resultados
            </li>
            <li
              v-for="item in filteredItems"
              :key="item.value"
              @click="selectItem(item)"
              class="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer border-b last:border-b-0 border-gray-50 dark:border-gray-700 transition-colors"
            >
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ item.label }}
              </p>
              <p
                v-if="item.subtitle"
                class="text-[10px] text-gray-500 dark:text-gray-400"
              >
                {{ item.subtitle }}
              </p>
            </li>
          </ul>
        </div>
      </Transition>
    </div>

    <button
      v-if="modelValue && showClearButton"
      @click="clear"
      class="mt-1 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
    >
      <IconLucideX class="w-3 h-3" />
      Limpiar filtro
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import IconLucideSearch from '~icons/lucide/search';
import IconLucideChevronDown from '~icons/lucide/chevron-down';
import IconLucideX from '~icons/lucide/x';

export interface SelectItem {
  value: string;
  label: string;
  subtitle?: string;
}

const props = defineProps<{
  modelValue: string;
  items: SelectItem[];
  label?: string;
  placeholder?: string;
  loading?: boolean;
  showClearButton?: boolean;
  containerClass?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'clear'): void;
}>();

const searchTerm = ref('');
const showDropdown = ref(false);

const filteredItems = computed(() => {
  if (!searchTerm.value.trim()) return props.items;
  const term = searchTerm.value.toLowerCase();
  return props.items.filter(
    (item) =>
      item.label.toLowerCase().includes(term) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(term))
  );
});

const selectItem = (item: SelectItem) => {
  emit('update:modelValue', item.value);
  searchTerm.value = item.label;
  showDropdown.value = false;
};

const clear = () => {
  emit('update:modelValue', '');
  searchTerm.value = '';
  emit('clear');
};

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.relative')) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      const item = props.items.find((i) => i.value === newVal);
      if (item) searchTerm.value = item.label;
    } else if (!searchTerm.value) {
      searchTerm.value = '';
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
