<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";

import { useChecks } from "@/composables/useChecks";
import { useDialog } from "@/composables/useDialog";
import { useUIStore } from "@/stores/ui";

const uiStore = useUIStore();
const { closeDialog } = useDialog();
const { deleteCheck } = useChecks();

const checkId = uiStore.data?.checkId;
const checkName = uiStore.data?.checkName ?? "Unknown";

const handleDelete = async () => {
  if (checkId === undefined) return;
  await deleteCheck(checkId);
  closeDialog();
};
</script>

<template>
  <Dialog
    :visible="true"
    modal
    :style="{ width: '400px' }"
    :closable="false"
    @update:visible="closeDialog"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="font-semibold text-lg">Delete Check</span>
        <Button
          icon="fas fa-times"
          text
          severity="secondary"
          size="small"
          @click="closeDialog"
        />
      </div>
    </template>

    <div class="flex flex-col gap-4">
      <p class="text-sm text-surface-300">
        Are you sure you want to delete
        <span class="font-semibold text-surface-100">{{ checkName }}</span
        >? This action cannot be undone.
      </p>

      <div class="flex justify-end gap-2 pt-2 border-t border-surface-700/30">
        <Button
          label="Cancel"
          severity="secondary"
          size="small"
          outlined
          @click="closeDialog"
        />
        <Button
          label="Delete"
          severity="danger"
          size="small"
          @click="handleDelete"
        />
      </div>
    </div>
  </Dialog>
</template>
