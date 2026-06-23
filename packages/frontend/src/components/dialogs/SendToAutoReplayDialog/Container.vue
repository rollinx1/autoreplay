<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { computed, onMounted, ref, shallowRef } from "vue";

import ChecksStep from "./ChecksStep.vue";
import ProfilesStep from "./ProfilesStep.vue";
import RequestsStep from "./RequestsStep.vue";
import ResourcePoolStep from "./ResourcePoolStep.vue";

import { useChecks } from "@/composables/useChecks";
import { useDialog } from "@/composables/useDialog";
import { useProfiles } from "@/composables/useProfiles";
import { useScan } from "@/composables/useScan";
import { useSession } from "@/composables/useSession";
import { useSDK } from "@/plugins/sdk";
import { useCheckStore, useProfileStore, useSessionStore } from "@/stores";
import { useUIStore } from "@/stores/ui";
import type { HttpRequest, ScanProfile } from "@/types";

type WizardStep = "requests" | "profiles" | "checks" | "resources";

const steps: {
  id: WizardStep;
  label: string;
  icon: string;
}[] = [
  { id: "requests", label: "Requests", icon: "fas fa-list" },
  { id: "profiles", label: "Profiles", icon: "fas fa-layer-group" },
  { id: "checks", label: "Checks", icon: "fas fa-flask" },
  { id: "resources", label: "Resource pool", icon: "fas fa-sliders" },
];

const sdk = useSDK();
const uiStore = useUIStore();
const checkStore = useCheckStore();
const profileStore = useProfileStore();
const sessionStore = useSessionStore();
const { fetchChecks } = useChecks();
const { fetchProfiles } = useProfiles();
const { createSession } = useSession();
const { launchScan } = useScan();
const { closeDialog } = useDialog();

const requestIds = [...(uiStore.data?.requestIds ?? [])];
const requests = ref<HttpRequest[]>([]);
const requestLoadError = shallowRef<string | undefined>(undefined);
const selectedCheckIds = ref<number[]>([]);
const activeStep = shallowRef<WizardStep>("requests");
const threads = shallowRef(5);
const delayMs = shallowRef(0);
const timeoutSec = shallowRef(30);
const isLoadingRequests = shallowRef(false);
const isSubmitting = shallowRef(false);

const selectedChecks = computed(() =>
  checkStore.checks.filter((check) =>
    selectedCheckIds.value.includes(check.id),
  ),
);
const hasValidResources = computed(
  () => threads.value >= 1 && delayMs.value >= 0 && timeoutSec.value >= 1,
);
const canLaunch = computed(
  () =>
    requests.value.length > 0 &&
    selectedChecks.value.length > 0 &&
    hasValidResources.value &&
    !isLoadingRequests.value &&
    !isSubmitting.value,
);
const loadRequests = async () => {
  isLoadingRequests.value = true;
  requestLoadError.value = undefined;

  const result = await sdk.backend.getRequestsByIds(requestIds);
  isLoadingRequests.value = false;

  if (result.kind === "Error") {
    requestLoadError.value = result.error;
    sdk.window.showToast(result.error, { variant: "error" });
    return;
  }

  requests.value = result.value;
  if (requests.value.length === 0) {
    requestLoadError.value = "No requests could be loaded";
  }
};

const toggleCheck = (checkId: number) => {
  selectedCheckIds.value = selectedCheckIds.value.includes(checkId)
    ? selectedCheckIds.value.filter((id) => id !== checkId)
    : [...selectedCheckIds.value, checkId];
};

const toggleAllChecks = () => {
  selectedCheckIds.value =
    selectedCheckIds.value.length === checkStore.checks.length
      ? []
      : checkStore.checks.map((check) => check.id);
};

const applyProfile = (profile: ScanProfile) => {
  selectedCheckIds.value = [...profile.checkIds];
  threads.value = profile.threads;
  delayMs.value = profile.delayMs;
  timeoutSec.value = profile.timeoutSec;
};

const handleScan = async () => {
  if (!canLaunch.value) return;

  isSubmitting.value = true;
  const session = await createSession();
  if (session === undefined) {
    isSubmitting.value = false;
    return;
  }

  const options = {
    threads: threads.value,
    delayMs: delayMs.value,
    timeoutSec: timeoutSec.value,
  };

  sessionStore.setSessionSetup(session.id, {
    requests: requests.value,
    checkIds: [...selectedCheckIds.value],
    ...options,
  });

  await launchScan(
    session.id,
    requests.value.map((request) => request.id),
    selectedChecks.value,
    options,
  );

  closeDialog();
};

onMounted(() => {
  void loadRequests();
  if (checkStore.checks.length === 0) {
    void fetchChecks();
  }
  if (profileStore.profiles.length === 0) {
    void fetchProfiles();
  }
});
</script>

<template>
  <Dialog
    :visible="true"
    modal
    :style="{ width: 'min(900px, 92vw)' }"
    :content-style="{
      height: 'min(560px, 76vh)',
      padding: '0',
      overflow: 'hidden',
    }"
    :closable="false"
    @update:visible="closeDialog"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2 min-w-0">
          <i class="fas fa-bolt text-secondary-400" />
          <span class="font-semibold text-base">New scan</span>
        </div>
        <Button
          icon="fas fa-times"
          text
          severity="secondary"
          size="small"
          aria-label="Close"
          @click="closeDialog"
        />
      </div>
    </template>

    <div class="h-full flex flex-col bg-surface-900">
      <div class="flex flex-1 min-h-0">
        <nav
          class="w-48 shrink-0 border-r border-surface-700 bg-surface-800"
          aria-label="Scan setup"
        >
          <button
            v-for="step in steps"
            :key="step.id"
            type="button"
            class="w-full flex items-center gap-3 px-4 py-4 border-l-2 text-left text-sm transition-colors"
            :class="
              activeStep === step.id
                ? 'border-secondary-400 bg-surface-700 text-surface-100'
                : 'border-transparent text-surface-400 hover:bg-surface-700 hover:text-surface-200'
            "
            @click="activeStep = step.id"
          >
            <i :class="[step.icon, 'w-5 text-center']" />
            <span>{{ step.label }}</span>
          </button>
        </nav>

        <main class="flex-1 min-w-0 min-h-0 overflow-hidden">
          <RequestsStep
            v-if="activeStep === 'requests'"
            :requests="requests"
            :loading="isLoadingRequests"
            :error="requestLoadError"
            @retry="loadRequests"
          />
          <ProfilesStep
            v-else-if="activeStep === 'profiles'"
            :profiles="profileStore.profiles"
            @select="applyProfile"
          />
          <ChecksStep
            v-else-if="activeStep === 'checks'"
            :checks="checkStore.checks"
            :selected-check-ids="selectedCheckIds"
            @toggle="toggleCheck"
            @toggle-all="toggleAllChecks"
          />
          <ResourcePoolStep
            v-else
            v-model:threads="threads"
            v-model:delay-ms="delayMs"
            v-model:timeout-sec="timeoutSec"
          />
        </main>
      </div>

      <footer
        class="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-t border-surface-700 bg-surface-800"
      >
        <span class="text-xs text-surface-500">
          {{ requests.length }} request{{ requests.length === 1 ? "" : "s" }} |
          {{ selectedCheckIds.length }} check{{
            selectedCheckIds.length === 1 ? "" : "s"
          }}
        </span>

        <div class="flex items-center gap-1">
          <Button
            label="Cancel"
            severity="secondary"
            size="small"
            outlined
            @click="closeDialog"
          />
          <Button
            label="Scan"
            icon="fas fa-rocket"
            size="small"
            :loading="isSubmitting"
            :disabled="!canLaunch"
            @click="handleScan"
          />
        </div>
      </footer>
    </div>
  </Dialog>
</template>
