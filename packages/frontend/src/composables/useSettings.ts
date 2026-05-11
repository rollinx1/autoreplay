import { ref } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useSettingsStore } from "@/stores";

export function useSettings() {
  const sdk = useSDK();
  const store = useSettingsStore();
  const isLoading = ref(false);
  const error = ref<string | undefined>(undefined);

  // ─── Discord ───

  const fetchDiscordWebhooks = async () => {
    const result = await sdk.backend.getDiscordWebhooks();
    if (result.kind === "Ok") {
      store.setDiscordWebhooks(result.value);
    } else {
      error.value = result.error;
    }
  };

  const saveDiscordWebhook = async (identifier: string, url: string) => {
    const result = await sdk.backend.saveDiscordWebhook(identifier, url);
    if (result.kind === "Ok") {
      await fetchDiscordWebhooks();
      sdk.window.showToast("Webhook saved", { variant: "success" });
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  const deleteDiscordWebhook = async (identifier: string) => {
    const result = await sdk.backend.deleteDiscordWebhook(identifier);
    if (result.kind === "Ok") {
      await fetchDiscordWebhooks();
      sdk.window.showToast("Webhook deleted", { variant: "success" });
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  // ─── Callbacks ───

  const fetchCallbackConfigs = async () => {
    const result = await sdk.backend.getCallbackConfigs();
    if (result.kind === "Ok") {
      store.setCallbackConfigs(result.value);
    } else {
      error.value = result.error;
    }
  };

  const saveCallbackConfig = async (
    identifier: string,
    providerUrl: string,
  ) => {
    const result = await sdk.backend.saveCallbackConfig(
      identifier,
      providerUrl,
    );
    if (result.kind === "Ok") {
      await fetchCallbackConfigs();
      sdk.window.showToast("Callback saved", { variant: "success" });
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  const deleteCallbackConfig = async (identifier: string) => {
    const result = await sdk.backend.deleteCallbackConfig(identifier);
    if (result.kind === "Ok") {
      await fetchCallbackConfigs();
      sdk.window.showToast("Callback deleted", { variant: "success" });
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  // ─── Payload Files ───

  const fetchPayloadFiles = async () => {
    const result = await sdk.backend.getPayloadFiles();
    if (result.kind === "Ok") {
      store.setPayloadFiles(result.value);
    } else {
      error.value = result.error;
    }
  };

  const savePayloadFile = async (
    identifier: string,
    name: string,
    content: string,
  ) => {
    const result = await sdk.backend.savePayloadFile(identifier, name, content);
    if (result.kind === "Ok") {
      await fetchPayloadFiles();
      sdk.window.showToast("File saved", { variant: "success" });
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  const deletePayloadFile = async (identifier: string) => {
    const result = await sdk.backend.deletePayloadFile(identifier);
    if (result.kind === "Ok") {
      await fetchPayloadFiles();
      sdk.window.showToast("File deleted", { variant: "success" });
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  // ─── Payload Lists ───

  const fetchPayloadLists = async () => {
    const result = await sdk.backend.getPayloadLists();
    if (result.kind === "Ok") {
      store.setPayloadLists(result.value);
    } else {
      error.value = result.error;
    }
  };

  const savePayloadList = async (
    identifier: string,
    name: string,
    items: string[],
  ) => {
    const result = await sdk.backend.savePayloadList(identifier, name, items);
    if (result.kind === "Ok") {
      await fetchPayloadLists();
      sdk.window.showToast("List saved", { variant: "success" });
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  const deletePayloadList = async (identifier: string) => {
    const result = await sdk.backend.deletePayloadList(identifier);
    if (result.kind === "Ok") {
      await fetchPayloadLists();
      sdk.window.showToast("List deleted", { variant: "success" });
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  // ─── Constants ───

  const fetchConstants = async () => {
    const result = await sdk.backend.getConstants();
    if (result.kind === "Ok") {
      store.setConstants(result.value);
    } else {
      error.value = result.error;
    }
  };

  const saveConstant = async (identifier: string, value: string) => {
    const result = await sdk.backend.saveConstant(identifier, value);
    if (result.kind === "Ok") {
      await fetchConstants();
      sdk.window.showToast("Constant saved", { variant: "success" });
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  const deleteConstant = async (identifier: string) => {
    const result = await sdk.backend.deleteConstant(identifier);
    if (result.kind === "Ok") {
      await fetchConstants();
      sdk.window.showToast("Constant deleted", { variant: "success" });
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  // ─── Bootstrap ───

  const fetchAll = async () => {
    isLoading.value = true;
    await fetchDiscordWebhooks();
    await fetchCallbackConfigs();
    await fetchPayloadFiles();
    await fetchPayloadLists();
    await fetchConstants();
    isLoading.value = false;
  };

  return {
    isLoading,
    error,
    fetchAll,
    fetchDiscordWebhooks,
    saveDiscordWebhook,
    deleteDiscordWebhook,
    fetchCallbackConfigs,
    saveCallbackConfig,
    deleteCallbackConfig,
    fetchPayloadFiles,
    savePayloadFile,
    deletePayloadFile,
    fetchPayloadLists,
    savePayloadList,
    deletePayloadList,
    fetchConstants,
    saveConstant,
    deleteConstant,
  };
}
