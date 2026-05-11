<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { ref } from "vue";

import { useDialog } from "@/composables/useDialog";
import { useSettings } from "@/composables/useSettings";

const { closeDialog } = useDialog();
const { savePayloadList } = useSettings();

const identifier = ref("");
const name = ref("");
const itemsText = ref("");

const handleAdd = async () => {
  if (!identifier.value.trim() || !name.value.trim()) return;
  const items = itemsText.value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  await savePayloadList(identifier.value.trim(), name.value.trim(), items);
  closeDialog();
};
</script>

<template>
  <Dialog
    :visible="true"
    modal
    :style="{ width: '450px' }"
    :closable="false"
    @update:visible="closeDialog"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="font-semibold text-lg">Add List</span>
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
          Identifier
        </label>
        <InputText
          v-model="identifier"
          placeholder="common-paths"
          class="w-full text-sm"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label
          class="text-xs font-medium text-surface-400 uppercase tracking-wide"
        >
          Name
        </label>
        <InputText
          v-model="name"
          placeholder="Common Paths"
          class="w-full text-sm"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label
          class="text-xs font-medium text-surface-400 uppercase tracking-wide"
        >
          Items (one per line)
        </label>
        <Textarea
          v-model="itemsText"
          :rows="6"
          placeholder="/admin&#10;/api/v1/users&#10;/.env"
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
          :disabled="!identifier.trim() || !name.trim()"
          @click="handleAdd"
        />
      </div>
    </div>
  </Dialog>
</template>
