<script setup lang="ts">
import { Card } from "@caido-utils/ui-components";
import Button from "primevue/button";
import { onMounted, ref } from "vue";

import { useResources } from "@/composables/useResources";
import { useResourcesStore } from "@/stores";

const store = useResourcesStore();
const { fetchPayloadFiles, savePayloadFile, deletePayloadFile } =
  useResources();

const fileInput = ref<HTMLInputElement | undefined>(undefined);

onMounted(() => {
  void fetchPayloadFiles();
});

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  for (const file of Array.from(files)) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const identifier = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await savePayloadFile(identifier, file.name, content);
    };
    reader.readAsText(file);
  }

  target.value = "";
};

const onDelete = async (id: string) => {
  await deletePayloadFile(id);
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
            <h2 class="text-base font-bold text-surface-100">Files</h2>
            <p class="text-xs text-surface-500 mt-0.5">
              Uploaded text files for checks
            </p>
          </div>
          <Button
            icon="fas fa-upload"
            label="Upload"
            size="small"
            @click="triggerFileUpload"
          />
        </div>

        <input
          ref="fileInput"
          type="file"
          class="hidden"
          @change="onFileChange"
        />

        <div class="flex-1 overflow-y-auto">
          <div
            class="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-surface-500 border-b border-surface-700"
          >
            <div class="col-span-3">Name</div>
            <div class="col-span-8">Lines</div>
            <div class="col-span-1" />
          </div>

          <div
            v-for="file in store.payloadFiles"
            :key="file.identifier"
            class="grid grid-cols-12 gap-2 px-4 py-2 items-center text-xs hover:bg-surface-800 transition-colors border-b border-surface-800"
          >
            <div class="col-span-3 text-surface-200 font-semibold truncate">
              {{ file.name }}
            </div>
            <div class="col-span-8 text-surface-500">
              {{ file.content.split("\n").length }} lines
            </div>
            <div class="col-span-1 flex justify-end">
              <Button
                icon="fas fa-trash"
                severity="danger"
                size="small"
                text
                @click="onDelete(file.identifier)"
              />
            </div>
          </div>

          <div
            v-if="store.payloadFiles.length === 0"
            class="py-12 text-center text-surface-600 text-xs flex flex-col items-center"
          >
            <i class="fas fa-folder-open text-2xl mb-2 opacity-50" />
            <p>No payload files uploaded</p>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
