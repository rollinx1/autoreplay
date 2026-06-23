import { storeToRefs } from "pinia";
import { shallowRef } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useProfileStore } from "@/stores";
import type { ScanProfile } from "@/types";

type ScanProfileInput = Omit<ScanProfile, "id" | "createdAt">;

export function useProfiles() {
  const sdk = useSDK();
  const store = useProfileStore();
  const { profiles } = storeToRefs(store);
  const isLoading = shallowRef(false);
  const error = shallowRef<string | undefined>(undefined);

  const fetchProfiles = async () => {
    isLoading.value = true;
    error.value = undefined;
    const result = await sdk.backend.getScanProfiles();
    isLoading.value = false;

    if (result.kind === "Ok") {
      store.setProfiles(result.value);
      if (
        store.selectedProfileId === undefined &&
        result.value[0] !== undefined
      ) {
        store.selectProfile(result.value[0].id);
      }
    } else {
      error.value = result.error;
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  const addProfile = async (profile: ScanProfileInput) => {
    const result = await sdk.backend.addScanProfile(profile);
    if (result.kind === "Ok") {
      store.addProfile(result.value);
      store.selectProfile(result.value.id);
      sdk.window.showToast("Profile created", { variant: "success" });
      return result.value;
    }

    sdk.window.showToast(result.error, { variant: "error" });
    return undefined;
  };

  const updateProfile = async (
    id: number,
    updates: Partial<ScanProfileInput>,
  ) => {
    const result = await sdk.backend.updateScanProfile(id, updates);
    if (result.kind === "Ok") {
      store.updateProfile(result.value);
      sdk.window.showToast("Profile updated", { variant: "success" });
      return result.value;
    }

    sdk.window.showToast(result.error, { variant: "error" });
    return undefined;
  };

  const deleteProfile = async (id: number) => {
    const result = await sdk.backend.deleteScanProfile(id);
    if (result.kind === "Ok") {
      store.removeProfile(id);
      sdk.window.showToast("Profile deleted", { variant: "success" });
      return true;
    }

    sdk.window.showToast(result.error, { variant: "error" });
    return false;
  };

  const createDefaultProfile = async () => {
    const existingNames = new Set(
      profiles.value.map((profile) => profile.name),
    );
    let name = "New Profile";
    let suffix = 2;
    while (existingNames.has(name)) {
      name = `New Profile ${suffix}`;
      suffix++;
    }

    return addProfile({
      name,
      checkIds: [],
      threads: 5,
      delayMs: 0,
      timeoutSec: 30,
    });
  };

  return {
    profiles,
    isLoading,
    error,
    fetchProfiles,
    addProfile,
    updateProfile,
    deleteProfile,
    createDefaultProfile,
  };
}
