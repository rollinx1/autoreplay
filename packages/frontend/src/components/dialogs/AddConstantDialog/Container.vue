<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import { ref } from "vue";

import { useDialog } from "@/composables/useDialog";
import { useResources } from "@/composables/useResources";

const { closeDialog } = useDialog();
const { saveConstant } = useResources();

const identifier = ref("");
const value = ref("");

const handleAdd = async () => {
  if (!identifier.value.trim() || !value.value.trim()) return;
  await saveConstant(identifier.value.trim(), value.value.trim());
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
        <span class="font-semibold text-lg">Add Constant</span>
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
      <div class="flex flex-col gap-2">
        <label
          class="text-xs font-medium text-surface-400 uppercase tracking-wide"
        >
          Key
        </label>
        <InputText
          v-model="identifier"
          placeholder="BASE_URL"
          class="w-full text-sm"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label
          class="text-xs font-medium text-surface-400 uppercase tracking-wide"
        >
          Value
        </label>
        <InputText
          v-model="value"
          placeholder="https://example.com"
          class="w-full text-sm"
        />
      </div>

      <div class="flex justify-end gap-2 pt-2 border-t border-surface-700/30">
        <Button
          label="Cancel"
          severity="secondary"
          size="small"
          outlined
          @click="closeDialog"
        />
        <Button
          label="Add"
          size="small"
          :disabled="!identifier.trim() || !value.trim()"
          @click="handleAdd"
        />
      </div>
    </div>
  </Dialog>
</template>
