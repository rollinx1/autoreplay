<script setup lang="ts">
import Checkbox from "primevue/checkbox";
import InputText from "primevue/inputtext";
import { computed, shallowRef } from "vue";

import type { CheckRule } from "@/types";

const props = defineProps<{
  checks: CheckRule[];
  selectedCheckIds: number[];
}>();

const emit = defineEmits<{
  toggle: [checkId: number];
}>();

const search = shallowRef("");

const filteredChecks = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (query === "") return props.checks;

  return props.checks.filter(
    (check) =>
      check.name.toLowerCase().includes(query) ||
      check.description.toLowerCase().includes(query),
  );
});
</script>

<template>
  <section class="h-full flex flex-col min-h-0">
    <div
      class="shrink-0 flex items-center gap-3 px-3 py-2 border-b border-surface-800"
    >
      <InputText
        v-model="search"
        placeholder="Search checks..."
        size="small"
        class="flex-1 min-w-0"
      />
      <span class="shrink-0 text-xs text-surface-500">
        {{ selectedCheckIds.length }} selected
      </span>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto">
      <label
        v-for="check in filteredChecks"
        :key="check.id"
        :for="`profile-check-${check.id}`"
        class="flex items-start gap-3 px-4 py-2.5 border-b border-surface-800 cursor-pointer hover:bg-surface-800"
      >
        <Checkbox
          :input-id="`profile-check-${check.id}`"
          :model-value="selectedCheckIds.includes(check.id)"
          binary
          size="small"
          @update:model-value="emit('toggle', check.id)"
        />
        <span class="min-w-0 flex-1">
          <span class="block text-sm text-surface-200">
            {{ check.name }}
          </span>
          <span class="block mt-0.5 text-xs text-surface-500 truncate">
            {{ check.description || "No description" }}
          </span>
        </span>
      </label>

      <div
        v-if="filteredChecks.length === 0"
        class="h-full flex flex-col items-center justify-center gap-2 text-surface-500"
      >
        <i class="fas fa-flask text-xl opacity-50" />
        <span class="text-xs">No checks found</span>
      </div>
    </div>
  </section>
</template>
