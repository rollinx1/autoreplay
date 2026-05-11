import { ref, watch } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useSessionStore } from "@/stores";

export function useEditors() {
  const sdk = useSDK();
  const sessionStore = useSessionStore();

  const editorView = ref<"original" | "modified">("modified");
  const rawRequest = ref<string | undefined>(undefined);
  const rawResponse = ref<string | undefined>(undefined);

  const viewOptions = [
    { label: "Modified", value: "modified" },
    { label: "Original", value: "original" },
  ];

  const handleEditorView = (v: string) => {
    editorView.value = v as "original" | "modified";
    void loadRequestResponse();
  };

  const loadRequestResponse = async () => {
    const selectedResult = sessionStore.selectedResult;

    if (selectedResult === undefined) {
      rawRequest.value = undefined;
      rawResponse.value = undefined;
      return;
    }

    const requestId =
      editorView.value === "modified"
        ? selectedResult.modifiedRequestId
        : selectedResult.originalRequestId;

    if (requestId === undefined) {
      rawRequest.value = undefined;
      rawResponse.value = undefined;
      return;
    }

    const data = await sdk.backend.getRequestResponse(requestId);
    if (data) {
      rawRequest.value = data.rawRequest ?? undefined;
      rawResponse.value = data.rawResponse ?? undefined;
    }
  };

  watch(
    () => sessionStore.selectedResult,
    () => {
      void loadRequestResponse();
    },
    { immediate: true },
  );

  watch(editorView, () => {
    void loadRequestResponse();
  });

  return {
    editorView,
    rawRequest,
    rawResponse,
    viewOptions,
    handleEditorView,
  };
}
