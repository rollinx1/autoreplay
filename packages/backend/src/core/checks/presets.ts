import type { CheckRule } from "../../types";

export type CheckPreset = Omit<CheckRule, "id">;

export const bxssCheck: CheckPreset = {
  name: "Blind XSS (POST Body)",
  description:
    "Replaces every POST body parameter value with a blind XSS payload URL",
  code: `// Replace this with your own blind XSS / collaborator URL
const bxssUrl = "https://YOUR-BXSS-COLLABORATOR.com";

if (request.method === "POST" && request.body !== undefined) {
  for (const field of request.body.entries()) {
    const original = field.value;
    request.body.set(field.name, bxssUrl);
    await send(request);
    request.body.set(field.name, original);
  }
}`,
};
