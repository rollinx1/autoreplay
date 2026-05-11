import type { CheckRule } from "../../types";

export type CheckPreset = Omit<CheckRule, "id">;

export const httpMethodsCheck: CheckPreset = {
  name: "HTTP Methods",
  description: "Tests all common HTTP methods against the target request",
  code: `const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "TRACE", "HEAD"];

for (const method of methods) {
  request.method = method;
  await send(request);
}`,
};

export const xssCheck: CheckPreset = {
  name: "Reflected XSS",
  description: "Appends an XSS payload to every query parameter",
  code: `const payload = "<script>alert(1)</script>";

for (const param of request.query) {
  request.query.append(param.name, payload);
  await send(request);
}`,
};
