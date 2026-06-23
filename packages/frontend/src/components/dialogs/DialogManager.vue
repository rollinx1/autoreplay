<script setup lang="ts">
import ConfirmDialog from "primevue/confirmdialog";

import AddConstantDialog from "./AddConstantDialog/Container.vue";
import AddListDialog from "./AddListDialog/Container.vue";
import AddWebhookDialog from "./AddWebhookDialog/Container.vue";
import DeleteCheckDialog from "./DeleteCheckDialog/Container.vue";
import DeleteSessionDialog from "./DeleteSessionDialog/Container.vue";
import EditSessionDialog from "./EditSessionDialog/Container.vue";
import GuideDialog from "./GuideDialog/Container.vue";
import SendToAutoReplayDialog from "./SendToAutoReplayDialog/Container.vue";

import { useDialog } from "@/composables/useDialog";
import { useUIStore } from "@/stores/ui";

const store = useUIStore();
const { closeDialog } = useDialog();
</script>

<template>
  <ConfirmDialog />
  <DeleteSessionDialog
    v-if="store.mainView === 'delete-session'"
    @close="closeDialog()"
  />
  <EditSessionDialog
    v-if="store.mainView === 'edit-session'"
    @close="closeDialog()"
  />
  <DeleteCheckDialog
    v-if="store.mainView === 'delete-check'"
    @close="closeDialog()"
  />
  <GuideDialog v-if="store.mainView === 'guide'" @close="closeDialog()" />
  <AddWebhookDialog
    v-if="store.mainView === 'add-webhook'"
    @close="closeDialog()"
  />
  <AddListDialog v-if="store.mainView === 'add-list'" @close="closeDialog()" />
  <AddConstantDialog
    v-if="store.mainView === 'add-constant'"
    @close="closeDialog()"
  />
  <SendToAutoReplayDialog
    v-if="store.mainView === 'send-to-autoreplay'"
    @close="closeDialog()"
  />
</template>
