<script setup lang="ts">
import Checkbox from "primevue/checkbox";
import { computed } from "vue";

import type { CheckRule } from "@/types";

const props = defineProps<{
  checks: CheckRule[];
  selectedCheckIds: number[];
}>();

const emit = defineEmits<{
  toggle: [checkId: number];
  "toggle-all": [];
}>();

const allSelected = computed(
  () =>
    props.checks.length > 0 &&
    props.selectedCheckIds.length === props.checks.length,
);
</script>

<template>
  <section class="h-full flex flex-col">
    <header class="shrink-0 px-6 py-5 border-b border-surface-700">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-base font-semibold text-surface-100">Checks</h2>
          <p class="mt-1 text-xs text-surface-400">
            Select the checks to run against each request
          </p>
        </div>
        <label class="flex items-center gap-2 text-xs text-surface-400">
          <Checkbox
            :model-value="allSelected"
            binary
            size="small"
            @update:model-value="emit('toggle-all')"
          />
          <span>Select all</span>
        </label>
      </div>
    </header>

    <div class="flex-1 min-h-0 overflow-y-auto">
      <label
        v-for="check in checks"
        :key="check.id"
        :for="`scan-check-${check.id}`"
        class="flex items-start gap-3 px-6 py-3 border-b border-surface-800 cursor-pointer hover:bg-surface-800"
      >
        <Checkbox
          :input-id="`scan-check-${check.id}`"
          :model-value="selectedCheckIds.includes(check.id)"
          binary
          size="small"
          @update:model-value="emit('toggle', check.id)"
        />
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-medium text-surface-200">
            {{ check.name }}
          </span>
          <span class="block mt-1 text-xs text-surface-500">
            {{ check.description }}
          </span>
        </span>
      </label>

      <div
        v-if="checks.length === 0"
        class="h-full flex flex-col items-center justify-center gap-2 text-surface-500"
      >
        <i class="fas fa-flask text-xl" />
        <span class="text-xs">No checks available</span>
      </div>
    </div>
  </section>
</template>
