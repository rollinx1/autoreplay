<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import { ref } from "vue";

import { useDialog } from "@/composables/useDialog";
import { useSession } from "@/composables/useSession";
import { useUIStore } from "@/stores/ui";

const uiStore = useUIStore();
const { closeDialog } = useDialog();
const { updateSession } = useSession();

const sessionId = uiStore.data?.sessionId;
const sessionName = ref(uiStore.data?.sessionName ?? "");

const handleSave = async () => {
  if (sessionId === undefined) return;
  await updateSession(sessionId, { name: sessionName.value });
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
        <span class="font-semibold text-lg">Edit Session</span>
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
          Name
        </label>
        <InputText v-model="sessionName" class="w-full text-sm" />
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
          label="Save"
          size="small"
          :disabled="!sessionName.trim()"
          @click="handleSave"
        />
      </div>
    </div>
  </Dialog>
</template>
