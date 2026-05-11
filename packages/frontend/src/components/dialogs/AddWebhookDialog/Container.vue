<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import { ref } from "vue";

import { useDialog } from "@/composables/useDialog";
import { useSettings } from "@/composables/useSettings";

const { closeDialog } = useDialog();
const { saveDiscordWebhook } = useSettings();

const identifier = ref("");
const url = ref("");

const handleAdd = async () => {
  if (!identifier.value.trim() || !url.value.trim()) return;
  await saveDiscordWebhook(identifier.value.trim(), url.value.trim());
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
        <span class="font-semibold text-lg">Add Webhook</span>
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
          placeholder="main"
          class="w-full text-sm"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label
          class="text-xs font-medium text-surface-400 uppercase tracking-wide"
        >
          Webhook URL
        </label>
        <InputText
          v-model="url"
          placeholder="https://discord.com/api/webhooks/..."
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
          :disabled="!identifier.trim() || !url.trim()"
          @click="handleAdd"
        />
      </div>
    </div>
  </Dialog>
</template>
