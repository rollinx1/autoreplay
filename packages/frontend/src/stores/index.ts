import { createPinia } from "pinia";

export const pinia = createPinia();

export { useCheckStore } from "./checks";
export { useProfileStore } from "./profiles";
export { useSessionStore } from "./sessions";
export { useResourcesStore } from "./resources";
export { useUIStore } from "./ui";
