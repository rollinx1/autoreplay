import { defineStore } from "pinia";
import { computed, ref } from "vue";

type MainView =
  | "delete-session"
  | "edit-session"
  | "delete-check"
  | "guide"
  | "add-webhook"
  | "add-list"
  | "add-constant"
  | "send-to-autoreplay";

type DialogData = {
  sessionId?: number;
  sessionName?: string;
  checkId?: number;
  checkName?: string;
  requestIds?: string[];
};

export const useUIStore = defineStore("ui", () => {
  const data = ref<DialogData | undefined>(undefined);
  const mainView = ref<MainView | undefined>(undefined);

  const visible = computed(() => mainView.value !== undefined);

  const openDialog = (view: MainView, dialogData?: DialogData) => {
    mainView.value = view;
    data.value = dialogData;
  };

  const closeDialog = () => {
    data.value = undefined;
    mainView.value = undefined;
  };

  return {
    data,
    visible,
    mainView,
    openDialog,
    closeDialog,
  };
});
