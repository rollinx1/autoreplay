<script setup lang="ts">
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import RadioButton from "primevue/radiobutton";
import { computed } from "vue";

import { useSessionStore } from "@/stores";

const emit = defineEmits<{
  close: [];
}>();

const sessionStore = useSessionStore();
const sessionId = computed(() => sessionStore.selectedSessionId);

const deduplicate = computed({
  get: () => sessionStore.currentSessionSetup.deduplicate,
  set: (v) => {
    if (sessionId.value !== undefined) {
      sessionStore.setSessionSetup(sessionId.value, { deduplicate: v });
    }
  },
});

const inScope = computed({
  get: () => sessionStore.currentSessionSetup.inScope,
  set: (v) => {
    if (sessionId.value !== undefined) {
      sessionStore.setSessionSetup(sessionId.value, { inScope: v });
    }
  },
});

const noJavascript = computed({
  get: () => sessionStore.currentSessionSetup.noJavascript,
  set: (v) => {
    if (sessionId.value !== undefined) {
      sessionStore.setSessionSetup(sessionId.value, { noJavascript: v });
    }
  },
});

const noImages = computed({
  get: () => sessionStore.currentSessionSetup.noImages,
  set: (v) => {
    if (sessionId.value !== undefined) {
      sessionStore.setSessionSetup(sessionId.value, { noImages: v });
    }
  },
});

const noVideos = computed({
  get: () => sessionStore.currentSessionSetup.noVideos,
  set: (v) => {
    if (sessionId.value !== undefined) {
      sessionStore.setSessionSetup(sessionId.value, { noVideos: v });
    }
  },
});

const noDocuments = computed({
  get: () => sessionStore.currentSessionSetup.noDocuments,
  set: (v) => {
    if (sessionId.value !== undefined) {
      sessionStore.setSessionSetup(sessionId.value, { noDocuments: v });
    }
  },
});

const noStyling = computed({
  get: () => sessionStore.currentSessionSetup.noStyling,
  set: (v) => {
    if (sessionId.value !== undefined) {
      sessionStore.setSessionSetup(sessionId.value, { noStyling: v });
    }
  },
});

const timeFilter = computed({
  get: () => sessionStore.currentSessionSetup.timeFilter,
  set: (v) => {
    if (sessionId.value !== undefined) {
      sessionStore.setSessionSetup(sessionId.value, { timeFilter: v });
    }
  },
});

const onReset = () => {
  deduplicate.value = true;
  inScope.value = true;
  noJavascript.value = false;
  noImages.value = false;
  noVideos.value = false;
  noDocuments.value = false;
  noStyling.value = false;
  timeFilter.value = "all";
};

const timeOptions: {
  key: "all" | "recent" | "1hr" | "6hr" | "12hr" | "24hr";
  label: string;
}[] = [
  { key: "all", label: "All time" },
  { key: "recent", label: "Recent" },
  { key: "1hr", label: "1hr" },
  { key: "6hr", label: "6hr" },
  { key: "12hr", label: "12hr" },
  { key: "24hr", label: "24hr" },
];
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div
      class="flex items-center justify-between px-3 py-2 border-b border-surface-700 shrink-0"
    >
      <span class="text-sm font-bold text-surface-100">Advanced options</span>
      <Button
        icon="fas fa-times"
        text
        size="small"
        class="text-surface-400 hover:text-surface-300"
        @click="emit('close')"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto px-3 py-2">
      <!-- Custom Presets -->
      <div class="mb-3">
        <div
          class="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-2"
        >
          Custom Presets
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-2 py-1">
            <Checkbox v-model="noImages" binary size="small" />
            <span class="text-sm font-semibold text-surface-200"
              >No Images</span
            >
          </div>
          <div class="flex items-center gap-2 py-1">
            <Checkbox v-model="noVideos" binary size="small" />
            <span class="text-sm font-semibold text-surface-200"
              >No Videos</span
            >
          </div>
          <div class="flex items-center gap-2 py-1">
            <Checkbox v-model="noDocuments" binary size="small" />
            <span class="text-sm font-semibold text-surface-200"
              >No Documents</span
            >
          </div>
          <div class="flex items-center gap-2 py-1">
            <Checkbox v-model="noStyling" binary size="small" />
            <span class="text-sm font-semibold text-surface-200"
              >No Styling</span
            >
          </div>
          <div class="flex items-center gap-2 py-1">
            <Checkbox v-model="noJavascript" binary size="small" />
            <span class="text-sm font-semibold text-surface-200"
              >No JavaScript</span
            >
          </div>
          <div class="flex items-center gap-2 py-1">
            <Checkbox v-model="inScope" binary size="small" />
            <span class="text-sm font-semibold text-surface-200">In Scope</span>
          </div>
          <div class="flex items-center gap-2 py-1">
            <Checkbox v-model="deduplicate" binary size="small" />
            <span class="text-sm font-semibold text-surface-200"
              >No Duplicates</span
            >
          </div>
        </div>
      </div>

      <!-- Time Range -->
      <div class="mb-3">
        <div
          class="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-2"
        >
          Time Range
        </div>
        <div class="flex flex-col">
          <div
            v-for="opt in timeOptions"
            :key="opt.key"
            class="flex items-center gap-2 py-1"
          >
            <RadioButton v-model="timeFilter" :value="opt.key" size="small" />
            <span class="text-sm font-semibold text-surface-200">{{
              opt.label
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="shrink-0 px-3 py-2 border-t border-surface-700">
      <button
        class="w-full text-sm font-semibold text-center text-surface-500 hover:text-surface-300 transition-colors py-1"
        @click="onReset"
      >
        Reset preferences
      </button>
    </div>
  </div>
</template>
