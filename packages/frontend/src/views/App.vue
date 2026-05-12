<script setup lang="ts">
import Button from "primevue/button";
import MenuBar from "primevue/menubar";
import { onMounted, ref } from "vue";

import Checks from "./Checks.vue";
import Dashboard from "./Dashboard.vue";
import Guide from "./Guide.vue";
import Settings from "./Settings.vue";

import DialogManager from "@/components/dialogs/DialogManager.vue";
import { useChecks } from "@/composables/useChecks";
import { useEvents } from "@/composables/useEvents";
import { useSession } from "@/composables/useSession";
import { useSDK } from "@/plugins/sdk";

type ActiveTab = "scanner" | "checks" | "guide" | "settings";

const sdk = useSDK();
const session = useSession();
const checks = useChecks();
const { registerEventListeners } = useEvents(sdk);
const activeTab = ref<ActiveTab>("scanner");

const items = [
  {
    label: "Scanner",
    isActive: () => activeTab.value === "scanner",
    command: () => {
      activeTab.value = "scanner";
    },
  },
  {
    label: "Checks",
    isActive: () => activeTab.value === "checks",
    command: () => {
      activeTab.value = "checks";
    },
  },
  {
    label: "Guide",
    isActive: () => activeTab.value === "guide",
    command: () => {
      activeTab.value = "guide";
    },
  },
  {
    label: "Settings",
    isActive: () => activeTab.value === "settings",
    command: () => {
      activeTab.value = "settings";
    },
  },
];

onMounted(() => {
  registerEventListeners();
  void session.fetchSessions();
  void checks.fetchChecks();
});
</script>

<template>
  <div class="flex flex-col h-full gap-1 overflow-hidden">
    <MenuBar :model="items" class="h-12 gap-2">
      <template #start>
        <div class="px-2 font-bold">AutoReplay</div>
      </template>

      <template #item="{ item }">
        <Button
          :class="[
            item.isActive()
              ? '!border-secondary-400 !text-secondary-400 !bg-transparent'
              : '!border-transparent !text-surface-300 !bg-transparent hover:!text-surface-50',
            'border-[1px] rounded-md !ring-0 transition-colors px-4',
          ]"
          :severity="item.isActive?.() ? 'contrast' : 'secondary'"
          :outlined="item.isActive?.()"
          size="small"
          :text="!item.isActive()"
          :label="item.label"
          @click="item.command"
        />
      </template>
    </MenuBar>

    <div class="flex-1 min-h-0 overflow-hidden">
      <Dashboard v-if="activeTab === 'scanner'" />
      <Checks v-else-if="activeTab === 'checks'" />
      <Guide v-else-if="activeTab === 'guide'" />
      <Settings v-else-if="activeTab === 'settings'" />
    </div>

    <DialogManager />
  </div>
</template>
