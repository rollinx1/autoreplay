<script setup lang="ts">
import { Card } from "@caido-utils/ui-components";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { computed, ref } from "vue";

import { useChecks } from "@/composables/useChecks";
import type { CheckRule } from "@/types";

const { checks, createDefaultCheck } = useChecks();
const selected = defineModel<CheckRule | undefined>();

const search = ref("");

const filtered = computed(() => {
  let list = checks.value;

  if (search.value) {
    const q = search.value.toLowerCase();
    list = list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q),
    );
  }

  return list;
});

const select = (m: CheckRule) => {
  selected.value = m;
};

const createCheck = async () => {
  const check = await createDefaultCheck();
  if (check !== undefined) {
    selected.value = check;
  }
};
</script>

<template>
  <Card class="h-full">
    <template #content>
      <div class="h-full flex flex-col">
        <!-- Toolbar -->
        <div
          class="flex items-center gap-2 px-2 py-2 border-b border-surface-700"
        >
          <InputText
            v-model="search"
            placeholder="Search checks..."
            size="small"
            class="flex-1"
          />
          <Button
            icon="fas fa-plus"
            label="New"
            size="small"
            @click="createCheck"
          />
        </div>

        <!-- Results count -->
        <div class="px-4 py-1 border-b border-surface-700/30">
          <span class="text-xs text-surface-500">
            {{ filtered.length }} total
          </span>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto">
          <div
            v-for="m in filtered"
            :key="m.id"
            class="flex items-start gap-3 px-3 py-2.5 cursor-pointer"
            :class="{
              'bg-surface-700': selected?.id === m.id,
            }"
            @click="select(m)"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-surface-200 truncate">
                  {{ m.name }}
                </span>
              </div>

              <p class="text-xs text-surface-500 truncate mt-0.5">
                {{ m.description || "No description" }}
              </p>
            </div>
          </div>

          <div
            v-if="filtered.length === 0"
            class="px-4 py-8 text-center text-surface-500 text-sm"
          >
            <i class="fas fa-flask text-2xl mb-2 opacity-50" />
            <p>No results found</p>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
