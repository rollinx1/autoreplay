<script setup lang="ts">
import { Card } from "@caido-utils/ui-components";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { computed } from "vue";

import CodeEditor from "./CodeEditor.vue";

import { useChecks } from "@/composables/useChecks";
import { useDialog } from "@/composables/useDialog";
import { useCheckStore } from "@/stores";

const checksApi = useChecks();
const checkStore = useCheckStore();
const { openDeleteCheck, openGuide } = useDialog();

const model = computed(() => checkStore.selectedCheck);

const draft = computed(() => {
  if (!model.value) return undefined;
  return checkStore.drafts[model.value.id];
});

const editName = computed({
  get: () => draft.value?.name ?? model.value?.name ?? "",
  set: (v) => {
    if (!model.value) return;
    checkStore.setDraft(model.value.id, { name: v });
  },
});

const editDescription = computed({
  get: () => draft.value?.description ?? model.value?.description ?? "",
  set: (v) => {
    if (!model.value) return;
    checkStore.setDraft(model.value.id, { description: v });
  },
});

const editCode = computed({
  get: () => draft.value?.code ?? model.value?.code ?? "",
  set: (v) => {
    if (!model.value) return;
    checkStore.setDraft(model.value.id, { code: v });
  },
});

const saveEdit = async () => {
  if (!model.value) return;

  const updates = {
    name: editName.value || model.value.name,
    description: editDescription.value,
    code: editCode.value,
  };

  const updated = await checksApi.updateCheck(model.value.id, updates);
  if (updated !== undefined) {
    checkStore.updateCheck(updated);
    checkStore.clearDraft(model.value.id);
  }
};

const onDelete = () => {
  if (!model.value) return;
  openDeleteCheck(model.value.id, model.value.name);
};
</script>

<template>
  <Card class="h-full">
    <template #content>
      <div v-if="model" class="h-full flex flex-col gap-3 p-4">
        <!-- Title row -->
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-surface-100 truncate">
            {{ model.name }}
          </h2>
          <Button
            icon="fas fa-save"
            label="Save"
            size="small"
            @click="saveEdit"
          />
        </div>

        <!-- Name -->
        <Card>
          <template #content>
            <div class="text-xs text-surface-500 mb-1">Name</div>
            <InputText v-model="editName" class="w-full text-sm" />
          </template>
        </Card>

        <!-- Description -->
        <Card>
          <template #content>
            <div class="text-xs text-surface-500 mb-1">Description</div>
            <InputText
              v-model="editDescription"
              placeholder="Describe what this check does..."
              class="w-full text-sm"
            />
          </template>
        </Card>

        <!-- Code editor -->
        <div class="text-xs text-surface-500 mb-1">Script (JavaScript)</div>
        <div class="flex-1 min-h-0 overflow-hidden">
          <CodeEditor v-model="editCode" class="h-full" />
        </div>

        <!-- Bottom action bar -->
        <div class="flex items-center justify-between pt-2">
          <Button
            icon="fas fa-book"
            label="Guide"
            severity="secondary"
            size="small"
            @click="openGuide"
          />
          <Button
            icon="fas fa-trash"
            label="Delete"
            severity="danger"
            size="small"
            @click="onDelete"
          />
        </div>
      </div>

      <div
        v-else
        class="h-full flex flex-col items-center justify-center text-surface-500"
      >
        <i class="fas fa-arrow-left text-3xl mb-3 opacity-50" />
        <p class="text-sm">No check selected</p>
        <p class="text-xs mt-1">Select a check from the list</p>
      </div>
    </template>
  </Card>
</template>
