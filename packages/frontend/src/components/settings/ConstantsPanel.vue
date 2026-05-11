<script setup lang="ts">
import { Card } from "@caido-utils/ui-components";
import Button from "primevue/button";
import { onMounted } from "vue";

import { useDialog } from "@/composables/useDialog";
import { useSettings } from "@/composables/useSettings";
import { useSettingsStore } from "@/stores";

const store = useSettingsStore();
const { fetchConstants, deleteConstant } = useSettings();
const { openAddConstant } = useDialog();

onMounted(() => {
  void fetchConstants();
});

const onDelete = async (id: string) => {
  await deleteConstant(id);
};
</script>

<template>
  <Card class="h-full">
    <template #content>
      <div class="flex flex-col h-full">
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-surface-700"
        >
          <div>
            <h2 class="text-base font-bold text-surface-100">Constants</h2>
            <p class="text-xs text-surface-500 mt-0.5">
              Key-value pairs for checks
            </p>
          </div>
          <Button
            icon="fas fa-plus"
            label="Add"
            size="small"
            @click="openAddConstant"
          />
        </div>
        <div class="flex-1 overflow-y-auto">
          <div
            class="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-surface-500 border-b border-surface-700"
          >
            <div class="col-span-3">Key</div>
            <div class="col-span-8">Value</div>
            <div class="col-span-1" />
          </div>
          <div
            v-for="c in store.constants"
            :key="c.identifier"
            class="grid grid-cols-12 gap-2 px-4 py-2 items-center text-xs hover:bg-surface-800 transition-colors border-b border-surface-800"
          >
            <div class="col-span-3 text-surface-200 font-semibold truncate">
              {{ c.identifier }}
            </div>
            <div class="col-span-8 text-surface-500 truncate">
              {{ c.value }}
            </div>
            <div class="col-span-1 flex justify-end">
              <Button
                icon="fas fa-trash"
                severity="danger"
                size="small"
                text
                @click="onDelete(c.identifier)"
              />
            </div>
          </div>
          <div
            v-if="store.constants.length === 0"
            class="py-12 text-center text-surface-600 text-xs flex flex-col items-center"
          >
            <i class="fas fa-sliders text-2xl mb-2 opacity-50" />
            <p>No constants configured</p>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
