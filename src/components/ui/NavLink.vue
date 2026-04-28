<template>
  <li>
    <router-link
      :to="to"
      class="block py-2 pr-4 pl-3 rounded transition-colors duration-200 md:p-0 text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
      :class="{
        'text-blue-700 dark:text-white font-bold': isActive,
      }"
    >
      <div class="flex items-center gap-2">
        <component
          :is="icon"
          v-if="icon"
          class="w-4 h-4 transition-colors"
          :class="{
            'text-blue-700 dark:text-white': isActive,
            'text-gray-500 dark:text-gray-400': !isActive,
          }"
        />
        <span class="whitespace-nowrap">{{ label }}</span>
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
