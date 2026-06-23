import { Classic } from "@caido/primevue";
import PrimeVue from "primevue/config";
import { createApp } from "vue";

import { useCaido } from "./composables/useCaido";
import { SDKPlugin } from "./plugins/sdk";
import { pinia } from "./stores";
import "./styles/index.css";
import type { FrontendSDK } from "./types";
import App from "./views/App.vue";

export const init = async (sdk: FrontendSDK) => {
  const app = createApp(App);

  app.use(PrimeVue, {
    unstyled: true,
    pt: Classic,
  });

  app.use(SDKPlugin, sdk);
  app.use(pinia);

  const root = document.createElement("div");
  Object.assign(root.style, {
    height: "100%",
    width: "100%",
  });

  root.id = `plugin--autoreplay`;

  app.mount(root);

  const caido = useCaido(sdk);
  await caido.register(root);
};
