import { storeToRefs } from "pinia";
import { ref } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useCheckStore } from "@/stores";
import type { CheckRule } from "@/types";

export function useChecks() {
  const sdk = useSDK();
  const store = useCheckStore();
  const { checks } = storeToRefs(store);
  const isLoading = ref(false);
  const error = ref<string | undefined>(undefined);

  const fetchChecks = async () => {
    const result = await sdk.backend.getChecks();
    if (result.kind === "Ok") {
      store.setChecks(result.value);
    } else {
      error.value = result.error;
    }
  };

  const addCheck = async (rule: Omit<CheckRule, "id">) => {
    const result = await sdk.backend.addCheck(rule);
    if (result.kind === "Ok") {
      store.addCheck(result.value);
      sdk.window.showToast("Check created", { variant: "success" });
      return result.value;
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
      return undefined;
    }
  };

  const updateCheck = async (
    id: number,
    updates: Partial<Omit<CheckRule, "id">>,
  ) => {
    const result = await sdk.backend.updateCheck(id, updates);
    if (result.kind === "Ok") {
      store.updateCheck(result.value);
      sdk.window.showToast("Check updated", { variant: "success" });

      return result.value;
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
      return undefined;
    }
  };

  const deleteCheck = async (id: number) => {
    const result = await sdk.backend.deleteCheck(id);
    if (result.kind === "Ok") {
      store.removeCheck(id);
      sdk.window.showToast("Check deleted", { variant: "success" });
    } else {
      sdk.window.showToast(result.error, { variant: "error" });
    }
  };

  const createDefaultCheck = async () => {
    const rule: Omit<CheckRule, "id"> = {
      name: "New Check",
      description: "",
      code: `// Available: request, send, notify, utils
// request is a Parser-like object with: method, path, query, headers, body, cookies, version
// plus: id, url, host, capturedAt, raw (getter)
//
// Use await send(request) to fire the modified request and create a ScanResult.
// You can call send(request) multiple times to fire many variations.
//
// Extras:
//   - notify.discord({ webhookUrl, message })
//   - utils.urlEncode, urlDecode

// Example: add a test query parameter
request.query.set("test", "value");

await send(request);`,
    };

    return addCheck(rule);
  };

  return {
    isLoading,
    error,
    checks,
    fetchChecks,
    addCheck,
    updateCheck,
    deleteCheck,
    createDefaultCheck,
  };
}
