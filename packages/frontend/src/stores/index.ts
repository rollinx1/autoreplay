import { createPinia } from "pinia";

export const pinia = createPinia();

export { useCheckStore } from "./checks";
export { useSessionStore } from "./sessions";
export { useSettingsStore } from "./settings";
export { useUIStore } from "./ui";
