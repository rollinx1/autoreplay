import { defineStore } from "pinia";
import { ref } from "vue";

type DiscordWebhook = {
  id: number;
  identifier: string;
  url: string;
};

type CallbackConfig = {
  id: number;
  identifier: string;
  providerUrl: string;
};

type PayloadFile = {
  id: number;
  identifier: string;
  name: string;
  content: string;
};

type PayloadList = {
  id: number;
  identifier: string;
  name: string;
  items: string[];
};

type Constant = {
  id: number;
  identifier: string;
  value: string;
};

export const useSettingsStore = defineStore("settings", () => {
  const discordWebhooks = ref<DiscordWebhook[]>([]);
  const callbackConfigs = ref<CallbackConfig[]>([]);
  const payloadFiles = ref<PayloadFile[]>([]);
  const payloadLists = ref<PayloadList[]>([]);
  const constants = ref<Constant[]>([]);

  const setDiscordWebhooks = (val: DiscordWebhook[]) => {
    discordWebhooks.value = val;
  };

  const setCallbackConfigs = (val: CallbackConfig[]) => {
    callbackConfigs.value = val;
  };

  const setPayloadFiles = (val: PayloadFile[]) => {
    payloadFiles.value = val;
  };

  const setPayloadLists = (val: PayloadList[]) => {
    payloadLists.value = val;
  };

  const setConstants = (val: Constant[]) => {
    constants.value = val;
  };

  return {
    discordWebhooks,
    callbackConfigs,
    payloadFiles,
    payloadLists,
    constants,
    setDiscordWebhooks,
    setCallbackConfigs,
    setPayloadFiles,
    setPayloadLists,
    setConstants,
  };
});
