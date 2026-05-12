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

// export const massAssignmentCheck: CheckPreset = {
//   name: "Mass Assignment",
//   description:
//     "Extracts keys from the JSON response body and attempts to set each one in the request body (POST/PUT/PATCH)",
//   code: `if (["POST", "PUT", "PATCH"].includes(request.method)) {
//   if (response !== undefined && response.body !== undefined) {
//     let json;
//     try {
//       json = JSON.parse(response.body);
//     } catch {
//       return;
//     }
//
//     if (
//       typeof json === "object" &&
//       json !== null &&
//       !Array.isArray(json)
//     ) {
//       if (request.body !== undefined) {
//         for (const key of Object.keys(json)) {
//           request.body.set(key, "mass_assignment_test");
//           await send(request);
//           request.body.remove(key);
//         }
//       }
//     }
//   }
// }`,
// };
