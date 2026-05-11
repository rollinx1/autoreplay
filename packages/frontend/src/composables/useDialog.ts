import { storeToRefs } from "pinia";

import { useUIStore } from "@/stores/ui";

export function useDialog() {
  const store = useUIStore();
  const { data, visible, mainView } = storeToRefs(store);

  const openDeleteSession = (sessionId: number, sessionName: string) => {
    store.openDialog("delete-session", { sessionId, sessionName });
  };

  const openEditSession = (sessionId: number, sessionName: string) => {
    store.openDialog("edit-session", { sessionId, sessionName });
  };

  const openDeleteCheck = (checkId: number, checkName: string) => {
    store.openDialog("delete-check", { checkId, checkName });
  };

  const openGuide = () => {
    store.openDialog("guide");
  };

  const openAddWebhook = () => {
    store.openDialog("add-webhook");
  };

  const openAddCallback = () => {
    store.openDialog("add-callback");
  };

  const openAddList = () => {
    store.openDialog("add-list");
  };

  const openAddConstant = () => {
    store.openDialog("add-constant");
  };

  const closeDialog = () => {
    store.closeDialog();
  };

  return {
    data,
    visible,
    mainView,
    openDeleteSession,
    openEditSession,
    openDeleteCheck,
    openGuide,
    openAddWebhook,
    openAddCallback,
    openAddList,
    openAddConstant,
    closeDialog,
  };
}
