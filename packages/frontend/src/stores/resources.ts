import { defineStore } from "pinia";
import { ref } from "vue";

type DiscordWebhook = {
  id: number;
  identifier: string;
  url: string;
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

export const useResourcesStore = defineStore("resources", () => {
  const discordWebhooks = ref<DiscordWebhook[]>([]);
  const payloadFiles = ref<PayloadFile[]>([]);
  const payloadLists = ref<PayloadList[]>([]);
  const constants = ref<Constant[]>([]);

  const setDiscordWebhooks = (val: DiscordWebhook[]) => {
    discordWebhooks.value = val;
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
    payloadFiles,
    payloadLists,
    constants,
    setDiscordWebhooks,
    setPayloadFiles,
    setPayloadLists,
    setConstants,
  };
});
