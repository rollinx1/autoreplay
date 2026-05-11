<script setup lang="ts">
import { Card } from "@caido-utils/ui-components";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Menu from "primevue/menu";
import { computed, ref } from "vue";

import { useDialog } from "@/composables/useDialog";
import { useSession } from "@/composables/useSession";

const { sessions, selectedSessionId, createSession, selectSession } =
  useSession();
const { openDeleteSession, openEditSession } = useDialog();
const search = ref("");
const sessionMenu = ref();
const menuSessionId = ref<number | undefined>(undefined);

const filteredSessions = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return sessions.value;
  return sessions.value.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.requests.some(
        (r) =>
          r.path.toLowerCase().includes(q) || r.host.toLowerCase().includes(q),
      ),
  );
});

const onNewSession = () => {
  void createSession();
};

const menuItems = computed(() => {
  const id = menuSessionId.value;
  const session = sessions.value.find((s) => s.id === id);
  const name = session?.name ?? "";
  return [
    {
      label: "Edit Name",
      icon: "fas fa-pen",
      command: () => {
        if (id !== undefined) openEditSession(id, name);
      },
    },
    {
      label: "Delete Session",
      icon: "fas fa-trash",
      command: () => {
        if (id !== undefined) openDeleteSession(id, name);
      },
    },
  ];
});

const showMenu = (event: Event, id: number) => {
  menuSessionId.value = id;
  sessionMenu.value?.show({
    currentTarget: event.currentTarget,
    relatedTarget: event.target,
  });
};
</script>

<template>
  <Card class="h-full">
    <template #content>
      <div class="h-full flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-3 py-2">
          <span class="text-sm font-bold text-surface-300">Sessions</span>
          <Button
            icon="fas fa-plus"
            label="New Session"
            size="small"
            @click="onNewSession"
          />
        </div>

        <!-- Search -->
        <div class="px-3 py-2">
          <InputText
            v-model="search"
            placeholder="Search..."
            size="small"
            class="w-full"
          />
        </div>

        <!-- Session list -->
        <div class="flex-1 overflow-y-auto">
          <div
            v-for="session in filteredSessions"
            :key="session.id"
            class="flex items-center gap-3 px-3 py-1.5 cursor-pointer"
            :class="{
              'bg-surface-700': selectedSessionId === session.id,
            }"
            @click="selectSession(session.id)"
          >
            <i class="fas fa-bars text-sm text-surface-500 shrink-0" />
            <span
              class="text-sm font-semibold text-surface-200 flex-1 truncate"
            >
              {{ session.name }}
            </span>
            <Button
              icon="fas fa-ellipsis-h"
              text
              size="small"
              class="!p-0 !w-5 !h-5 text-surface-500"
              @click.stop="showMenu($event, session.id)"
            />
          </div>

          <div
            v-if="filteredSessions.length === 0"
            class="p-4 text-center text-sm text-surface-500"
          >
            No sessions
          </div>
        </div>

        <Menu
          ref="sessionMenu"
          :model="menuItems"
          popup
          class="border border-surface-600 shadow-lg text-sm"
        />
      </div>
    </template>
  </Card>
</template>
