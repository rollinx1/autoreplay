<script setup lang="ts">
import { Card } from "@caido-utils/ui-components";
import { ref } from "vue";

import CallbacksPanel from "@/components/settings/CallbacksPanel.vue";
import ConstantsPanel from "@/components/settings/ConstantsPanel.vue";
import FilesPanel from "@/components/settings/FilesPanel.vue";
import ListsPanel from "@/components/settings/ListsPanel.vue";
import NotificationsPanel from "@/components/settings/NotificationsPanel.vue";

type SettingsSection =
  | "notifications"
  | "files"
  | "lists"
  | "callbacks"
  | "constants";

const selected = ref<SettingsSection>("notifications");

const categories = [
  {
    id: "notifications" as SettingsSection,
    name: "Notifications",
    icon: "fas fa-bell",
    description: "Discord webhooks",
  },
  {
    id: "files" as SettingsSection,
    name: "Files",
    icon: "fas fa-file-lines",
    description: "Uploaded payload files",
  },
  {
    id: "lists" as SettingsSection,
    name: "Lists",
    icon: "fas fa-list",
    description: "Inline text lists",
  },
  {
    id: "callbacks" as SettingsSection,
    name: "Callbacks",
    icon: "fas fa-link",
    description: "Callback URLs",
  },
  {
    id: "constants" as SettingsSection,
    name: "Constants",
    icon: "fas fa-sliders",
    description: "Key-value pairs",
  },
];
</script>

<template>
  <div class="h-full grid grid-cols-12 gap-1">
    <!-- Sidebar -->
    <div class="col-span-3 h-full">
      <Card class="h-full">
        <template #content>
          <div class="h-full flex flex-col">
            <div
              class="flex items-center justify-between px-3 py-2 bg-surface-800/50 select-none border-b border-surface-700/30"
            >
              <span
                class="text-xs font-medium text-surface-400 uppercase tracking-wide"
              >
                Settings
              </span>
            </div>

            <div class="p-2 flex-1 flex flex-col gap-1">
              <div
                v-for="cat in categories"
                :key="cat.id"
                class="group flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors"
                :class="
                  selected === cat.id
                    ? 'bg-surface-700/70'
                    : 'hover:bg-surface-700/50'
                "
                @click="selected = cat.id"
              >
                <div
                  class="flex items-center justify-center w-7 h-7 rounded-md bg-surface-500/30 text-surface-300"
                >
                  <i :class="[cat.icon, 'text-xs']" />
                </div>

                <div class="flex-1 min-w-0">
                  <div
                    class="text-sm font-medium truncate"
                    :class="
                      selected === cat.id
                        ? 'text-surface-100'
                        : 'text-surface-300'
                    "
                  >
                    {{ cat.name }}
                  </div>
                  <div class="text-xs text-surface-500">
                    {{ cat.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Panel -->
    <div class="col-span-9 h-full overflow-hidden">
      <NotificationsPanel v-if="selected === 'notifications'" />
      <FilesPanel v-else-if="selected === 'files'" />
      <ListsPanel v-else-if="selected === 'lists'" />
      <CallbacksPanel v-else-if="selected === 'callbacks'" />
      <ConstantsPanel v-else-if="selected === 'constants'" />
    </div>
  </div>
</template>
