<script setup lang="ts">
import { Card } from "@caido-utils/ui-components";
import Button from "primevue/button";
import { onMounted } from "vue";

import { useDialog } from "@/composables/useDialog";
import { useResources } from "@/composables/useResources";
import { useResourcesStore } from "@/stores";

const store = useResourcesStore();
const { fetchPayloadLists, deletePayloadList } = useResources();
const { openAddList } = useDialog();

onMounted(() => {
  void fetchPayloadLists();
});

const onDelete = async (id: string) => {
  await deletePayloadList(id);
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
            <h2 class="text-base font-bold text-surface-100">Lists</h2>
            <p class="text-xs text-surface-500 mt-0.5">
              Inline text lists for checks
            </p>
          </div>
          <Button
            icon="fas fa-plus"
            label="Add"
            size="small"
            @click="openAddList"
          />
        </div>

        <div class="flex-1 overflow-y-auto">
          <div
            class="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-surface-500 border-b border-surface-700"
          >
            <div class="col-span-3">Identifier</div>
            <div class="col-span-3">Name</div>
            <div class="col-span-5">Items</div>
            <div class="col-span-1" />
          </div>

          <div
            v-for="list in store.payloadLists"
            :key="list.identifier"
            class="grid grid-cols-12 gap-2 px-4 py-2 items-center text-xs hover:bg-surface-800 transition-colors border-b border-surface-800"
          >
            <div class="col-span-3 text-surface-200 font-semibold truncate">
              {{ list.identifier }}
            </div>
            <div class="col-span-3 text-surface-400 truncate">
              {{ list.name }}
            </div>
            <div class="col-span-5 text-surface-500 truncate">
              {{ list.items.length }} items
            </div>
            <div class="col-span-1 flex justify-end">
              <Button
                icon="fas fa-trash"
                severity="danger"
                size="small"
                text
                @click="onDelete(list.identifier)"
              />
            </div>
          </div>

          <div
            v-if="store.payloadLists.length === 0"
            class="py-12 text-center text-surface-600 text-xs flex flex-col items-center"
          >
            <i class="fas fa-list text-2xl mb-2 opacity-50" />
            <p>No lists configured</p>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
