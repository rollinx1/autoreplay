<script setup lang="ts">
import { Card } from "@caido-utils/ui-components";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import Button from "primevue/button";
import { computed, ref } from "vue";

import HighlightedCode from "@/components/dialogs/GuideDialog/HighlightedCode.vue";

hljs.registerLanguage("javascript", javascript);

const copiedIndex = ref<number | undefined>(undefined);

const copyCode = async (code: string, index: number) => {
  await navigator.clipboard.writeText(code);
  copiedIndex.value = index;
  setTimeout(() => {
    copiedIndex.value = undefined;
  }, 1500);
};

type Pattern = {
  category: string;
  title: string;
  description: string;
  code: string;
};

const patterns: Pattern[] = [
  {
    category: "Basics",
    title: "Change HTTP method",
    description: "Switch the request method",
    code: `request.method = "POST";
await send(request);`,
  },
  {
    category: "Basics",
    title: "Change HTTP version",
    description: "Switch the HTTP version",
    code: `request.version = "HTTP/1.0";
await send(request);`,
  },
  {
    category: "Path",
    title: "Read path segments",
    description: "Access individual path segments by index",
    code: `if (request.path.segments[1] === "users") {
  request.query.set("admin", "true");
  await send(request);
}`,
  },
  {
    category: "Query",
    title: "Set a query parameter",
    description: "Add or overwrite a query string parameter",
    code: `request.query.set("key", "value");
await send(request);`,
  },
  {
    category: "Query",
    title: "Remove a query parameter",
    description: "Delete a query parameter by name",
    code: `request.query.remove("debug");
await send(request);`,
  },
  {
    category: "Query",
    title: "Loop through query parameters",
    description: "Iterate and fuzz every existing query parameter",
    code: `for (const param of request.query.items) {
  request.query.set(param.name, param.value + "' OR '1'='1");
  await send(request);
  request.query.set(param.name, param.value);
}`,
  },
  {
    category: "Headers",
    title: "Set a header",
    description: "Add or overwrite an HTTP header",
    code: `request.headers.set("X-Custom-Header", "value");
await send(request);`,
  },
  {
    category: "Headers",
    title: "Remove a header",
    description: "Delete a header by name",
    code: `request.headers.remove("Authorization");
await send(request);`,
  },
  {
    category: "Headers",
    title: "Read a header",
    description: "Get a header value (case-insensitive)",
    code: `const auth = request.headers.get("Authorization");
if (auth !== undefined) {
  request.headers.set("Authorization", auth + "x");
  await send(request);
}`,
  },
  {
    category: "Headers",
    title: "Get all values for a header",
    description: "Handle duplicate headers",
    code: `const values = request.headers.getAll("X-Forwarded-For");
for (const v of values) {
  request.headers.set("X-Forwarded-For", v + ", 127.0.0.1");
  await send(request);
}`,
  },
  {
    category: "Cookies",
    title: "Set a cookie",
    description: "Add or overwrite a cookie",
    code: `request.cookies.set("session", "admin");
await send(request);`,
  },
  {
    category: "Cookies",
    title: "Remove a cookie",
    description: "Delete a cookie by name",
    code: `request.cookies.remove("session");
await send(request);`,
  },
  {
    category: "Cookies",
    title: "Loop through cookies",
    description: "Iterate and fuzz every existing cookie",
    code: `if (request.cookies.items.length > 0) {
  for (const cookie of request.cookies.items) {
    request.cookies.set(cookie.name, cookie.value + "' OR '1'='1");
    await send(request);
    request.cookies.set(cookie.name, cookie.value);
  }
}`,
  },
  {
    category: "Body",
    title: "Set a body field",
    description: "Add or overwrite a body field (JSON, form, multipart)",
    code: `if (request.body !== undefined) {
  request.body.set("username", "admin");
  await send(request);
}`,
  },
  {
    category: "Body",
    title: "Remove a body field",
    description: "Delete a body field by name",
    code: `if (request.body !== undefined) {
  request.body.remove("csrf_token");
  await send(request);
}`,
  },
  {
    category: "Body",
    title: "Loop through body fields",
    description: "Iterate and fuzz every existing body field",
    code: `if (request.body !== undefined) {
  for (const field of request.body.items) {
    request.body.set(field.name, String(field.value) + "' OR '1'='1");
    await send(request);
    request.body.set(field.name, field.value);
  }
}`,
  },
  {
    category: "Body",
    title: "Check body type",
    description: "Test if the body is a specific content type",
    code: `if (request.body !== undefined && request.body.type === "json") {
  request.body.set("role", "admin");
  await send(request);
}`,
  },
  {
    category: "Body",
    title: "Read multipart parts",
    description: "Access raw multipart parts with content-type metadata",
    code: `if (request.body !== undefined && request.body.rawParts) {
  for (const part of request.body.rawParts) {
    console.log(part.name, part.contentType, part.value);
  }
}`,
  },
  {
    category: "Response",
    title: "Read response status",
    description: "Check the original response status code",
    code: `if (response !== undefined && response.statusCode === 200) {
  request.query.set("debug", "true");
  await send(request);
}`,
  },
  {
    category: "Response",
    title: "Read a specific body field",
    description: "Get a single field value by name from the response body",
    code: `if (response !== undefined && response.body !== undefined) {
  const field = response.body.get("role");
  if (field !== undefined && field === "admin") {
    request.query.set("role", "admin");
    await send(request);
  }
}`,
  },
  {
    category: "Response",
    title: "Loop through response body fields",
    description: "Iterate all response body fields to find a matching value",
    code: `if (response !== undefined && response.body !== undefined) {
  for (const field of response.body.items) {
    if (typeof field.value === "string" && field.value.includes("admin")) {
      request.query.set("role", "admin");
      await send(request);
      break;
    }
  }
}`,
  },
  {
    category: "Advanced",
    title: "Send multiple variations",
    description: "Fire the same request with different payloads",
    code: `const payloads = ["admin", "test", "root"];

for (const payload of payloads) {
  request.query.set("user", payload);
  await send(request);
}`,
  },
  {
    category: "Advanced",
    title: "Discord notification",
    description:
      "Send a Discord webhook after a result (identifier maps to a saved webhook URL)",
    code: `request.query.set("test", "1");
await send(request);

const notification = await notify.discord("my-webhook");
await notification.message("Check completed for " + request.host);`,
  },
  {
    category: "Advanced",
    title: "Callback / OOB detection",
    description: "Spawn a callback URL and wait for a hit",
    code: `const cb = await callback.spawn();
console.log("Callback URL:", cb.url);

request.query.set("callback", cb.url);
await send(request);

const hit = await cb.waitForHit({ timeout: 10000 });
if (hit) {
  console.log("Hit received:", hit.path);
}`,
  },
  {
    category: "Advanced",
    title: "URL encoding helpers",
    description: "Use built-in utility functions",
    code: `const encoded = utils.urlEncode("hello world");
const decoded = utils.urlDecode("hello%20world");

request.query.set("data", encoded);
await send(request);`,
  },
  {
    category: "Advanced",
    title: "Encode / Decode",
    description: "Encode or decode strings with various methods",
    code: `const encoded = encode("hello world", "url", { strict: true });
const decoded = decode("hello%20world", "url", { strict: true });

request.query.set("data", encoded);
await send(request);`,
  },
];

const colorMap: Record<string, string> = {
  "hljs-keyword": "#c678dd",
  "hljs-string": "#98c379",
  "hljs-number": "#d19a66",
  "hljs-function": "#61afef",
  "hljs-title": "#61afef",
  "hljs-params": "#abb2bf",
  "hljs-comment": "#5c6370",
  "hljs-built_in": "#e6c07b",
  "hljs-literal": "#d19a66",
  "hljs-attr": "#d19a66",
  "hljs-variable": "#e06c75",
  "hljs-property": "#e06c75",
  "hljs-operator": "#56b6c2",
  "hljs-punctuation": "#abb2bf",
  "hljs-regexp": "#98c379",
  "hljs-class": "#e6c07b",
};

const applyInlineStyles = (html: string): string => {
  return html.replace(/class="([^"]*)"/g, (match, classes) => {
    const cls = classes
      .split(" ")
      .find((c: string) => colorMap[c] !== undefined);
    if (cls !== undefined) {
      return `style="color: ${colorMap[cls]}"`;
    }
    return match;
  });
};

const highlightedPatterns = computed(() =>
  patterns.map((p) => ({
    ...p,
    html: applyInlineStyles(
      hljs.highlight(p.code, { language: "javascript" }).value,
    ),
  })),
);

type GroupedPatterns = {
  category: string;
  items: (Pattern & { html: string; index: number })[];
};

const groupedPatterns = computed(() => {
  const map = new Map<string, (Pattern & { html: string; index: number })[]>();
  highlightedPatterns.value.forEach((p, index) => {
    const list = map.get(p.category) ?? [];
    list.push({ ...p, index });
    map.set(p.category, list);
  });
  const categories: string[] = [];
  for (const p of patterns) {
    if (!categories.includes(p.category)) {
      categories.push(p.category);
    }
  }
  return categories.map((category) => ({
    category,
    items: map.get(category) ?? [],
  })) as GroupedPatterns[];
});
</script>

<template>
  <Card class="h-full flex flex-col">
    <template #content>
      <div class="flex flex-col h-full gap-1 overflow-hidden">
        <div class="flex-1 min-h-0 overflow-y-auto px-4 py-4">
          <p class="text-xs text-surface-500 mb-6">
            Click the copy icon on any snippet to paste it into your check.
          </p>

          <div class="flex flex-col gap-8">
            <div
              v-for="group in groupedPatterns"
              :key="group.category"
              class="flex flex-col gap-4"
            >
              <h3
                class="text-xs font-bold text-secondary-400 uppercase tracking-wider border-b border-surface-700 pb-1"
              >
                {{ group.category }}
              </h3>

              <div
                v-for="pattern in group.items"
                :key="pattern.index"
                class="flex flex-col gap-2"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-semibold text-surface-200">
                      {{ pattern.title }}
                    </h4>
                    <p class="text-xs text-surface-500">
                      {{ pattern.description }}
                    </p>
                  </div>
                  <Button
                    :icon="
                      copiedIndex === pattern.index
                        ? 'fas fa-check'
                        : 'fas fa-copy'
                    "
                    :severity="
                      copiedIndex === pattern.index ? 'success' : 'secondary'
                    "
                    size="small"
                    text
                    @click="copyCode(pattern.code, pattern.index)"
                  />
                </div>

                <pre
                  class="code-block bg-surface-950 border border-surface-800 rounded p-3 text-xs overflow-x-auto"
                ><HighlightedCode :html="pattern.html" /></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.code-block {
  margin: 0;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 12px;
  user-select: text;
}
</style>
