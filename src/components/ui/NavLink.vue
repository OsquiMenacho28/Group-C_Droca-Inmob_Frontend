<template>
  <li>
    <router-link
      :to="to"
      class="flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group"
      :class="[
        isActive
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-semibold shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
      ]"
    >
      <div class="flex items-center gap-3 min-w-0">
        <component
          :is="icon"
          v-if="icon"
          class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
          :class="[
            isActive
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
          ]"
        />
        <span class="truncate text-sm font-medium">{{ label }}</span>
      </div>
      <div v-if="$slots.suffix" class="flex-shrink-0 ml-2">
        <slot name="suffix"></slot>
      </div>
    </router-link>
  </li>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps<{
  to: string;
  label: string;
  icon?: Component;
  exact?: boolean;
  matchPath?: string;
}>();

const route = useRoute();

const isActive = computed(() => {
  if (props.matchPath) {
    return route.path.includes(props.matchPath);
  }
  if (props.exact) {
    return route.path === props.to;
  }
  // Default active check
  return route.path.startsWith(props.to);
});
</script>
