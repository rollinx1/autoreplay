<script setup lang="ts">
import {
  autocompletion,
  type CompletionContext,
} from "@codemirror/autocomplete";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView, keymap } from "@codemirror/view";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { basicSetup } from "codemirror";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const containerRef = ref<HTMLDivElement>();
let view: EditorView | undefined;

const getExtensions = () => {
  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const newValue = update.state.doc.toString();
      emit("update:modelValue", newValue);
    }
  });

  const autoComplete = autocompletion({
    override: [
      (context: CompletionContext) => {
        const word = context.matchBefore(/[\w]*\.?[\w]*/);
        if (!word || word.from === word.to) return null;

        const text = word.text;
        const dotIndex = text.lastIndexOf(".");

        if (dotIndex >= 0) {
          const prefix = text.slice(0, dotIndex);
          const options: Array<{
            label: string;
            type: string;
            info?: string;
          }> = [];

          if (prefix === "request") {
            options.push(
              { label: "id", type: "property", info: "string" },
              { label: "method", type: "property", info: "string" },
              { label: "url", type: "property", info: "string" },
              { label: "version", type: "property", info: "string" },
              { label: "host", type: "property", info: "string" },
              { label: "capturedAt", type: "property", info: "string" },
              { label: "raw", type: "property", info: "string (getter)" },
              { label: "path", type: "property", info: "PathParser" },
              { label: "query", type: "property", info: "QueryParser" },
              { label: "headers", type: "property", info: "HeadersParser" },
              { label: "cookies", type: "property", info: "CookiesParser" },
              {
                label: "body",
                type: "property",
                info: "BodyParser | undefined",
              },
              { label: "build", type: "method", info: "() => string" },
            );
          } else if (prefix === "response") {
            options.push(
              { label: "statusCode", type: "property", info: "number" },
              { label: "duration", type: "property", info: "number (ms)" },
              { label: "headers", type: "property", info: "ResponseHeaders" },
              {
                label: "body",
                type: "property",
                info: "string | undefined (lazy)",
              },
            );
          } else if (prefix === "send") {
            options.push({
              label: "send",
              type: "method",
              info: "async (req: HttpRequest & {raw}) => void",
            });
          } else if (prefix === "notify") {
            options.push({
              label: "discord",
              type: "method",
              info: "(identifier: string) => Promise<{ message: (text: string) => Promise<void> }>",
            });
          } else if (prefix === "callback") {
            options.push({
              label: "spawn",
              type: "method",
              info: "() => Promise<{ url, waitForHit({ timeout? }) }>",
            });
          } else if (prefix === "path") {
            options.push(
              { label: "segments", type: "property", info: "string[]" },
              {
                label: "has",
                type: "method",
                info: "(index: number) => boolean",
              },
              { label: "set", type: "method", info: "(path: string) => void" },
              {
                label: "replace",
                type: "method",
                info: "(search: string, replacement: string) => void",
              },
            );
          } else if (prefix === "query") {
            options.push(
              {
                label: "get",
                type: "method",
                info: "(name: string) => string | undefined",
              },
              {
                label: "has",
                type: "method",
                info: "(name: string) => boolean",
              },
              {
                label: "set",
                type: "method",
                info: "(name: string, value: string) => void",
              },
              {
                label: "remove",
                type: "method",
                info: "(name: string) => void",
              },
              {
                label: "replace",
                type: "method",
                info: "(search: string, replacement: string) => void",
              },
              {
                label: "setByPattern",
                type: "method",
                info: "(pattern: RegExp, value: string) => void",
              },
            );
          } else if (prefix === "headers") {
            options.push(
              { label: "raw", type: "property", info: "[string, string][]" },
              {
                label: "get",
                type: "method",
                info: "(name: string) => string | undefined",
              },
              {
                label: "has",
                type: "method",
                info: "(name: string) => boolean",
              },
              {
                label: "getAll",
                type: "method",
                info: "(name: string) => string[]",
              },
              {
                label: "set",
                type: "method",
                info: "(name: string, value: string) => void",
              },
              {
                label: "remove",
                type: "method",
                info: "(name: string) => void",
              },
              {
                label: "replace",
                type: "method",
                info: "(search: string, replacement: string) => void",
              },
            );
          } else if (prefix === "cookies") {
            options.push(
              {
                label: "get",
                type: "method",
                info: "(name: string) => string | undefined",
              },
              {
                label: "has",
                type: "method",
                info: "(name: string) => boolean",
              },
              {
                label: "set",
                type: "method",
                info: "(name: string, value: string) => void",
              },
              {
                label: "remove",
                type: "method",
                info: "(name: string) => void",
              },
              {
                label: "replace",
                type: "method",
                info: "(search: string, replacement: string) => void",
              },
              { label: "isEmpty", type: "method", info: "() => boolean" },
            );
          } else if (prefix === "body") {
            options.push(
              {
                label: "get",
                type: "method",
                info: "(name: string) => string | undefined",
              },
              {
                label: "has",
                type: "method",
                info: "(name: string) => boolean",
              },
              {
                label: "set",
                type: "method",
                info: "(name: string, value: string) => void",
              },
              {
                label: "remove",
                type: "method",
                info: "(name: string) => void",
              },
              {
                label: "replace",
                type: "method",
                info: "(search: string, replacement: string) => void",
              },
              {
                label: "setByPattern",
                type: "method",
                info: "(pattern: RegExp, value: string) => void",
              },
              {
                label: "isValid",
                type: "method",
                info: "() => boolean (JSON only)",
              },
              {
                label: "rawParts",
                type: "property",
                info: "{ name, contentType, value }[] (multipart only)",
              },
            );
          }

          if (options.length === 0) return null;

          return {
            from: word.from + dotIndex + 1,
            options,
          };
        }

        // Top-level variable suggestions
        const options = [
          {
            label: "request",
            type: "variable",
            info: "Parser-like object with all HTTP parts",
          },
          {
            label: "response",
            type: "variable",
            info: "Original response (statusCode, headers, body) or undefined",
          },
          {
            label: "send",
            type: "function",
            info: "async (req) => void — fire the modified request",
          },
          {
            label: "notify",
            type: "variable",
            info: "{ discord(opts) } — webhook notifications",
          },
          {
            label: "callback",
            type: "variable",
            info: "{ spawn() } — create listener, wait for hit",
          },
          {
            label: "urlEncode",
            type: "function",
            info: "(input: string) => string",
          },
          {
            label: "urlDecode",
            type: "function",
            info: "(input: string) => string",
          },
          {
            label: "random",
            type: "function",
            info: "(length?: number) => string — defaults to 8",
          },
        ];

        return {
          from: word.from,
          options,
        };
      },
    ],
  });

  const themeOverride = EditorView.theme({
    "&": {
      fontSize: "12px",
      height: "100%",
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    ".cm-scroller": {
      overflow: "auto",
    },
    ".cm-gutters": {
      borderRight: "1px solid rgba(255, 255, 255, 0.1)",
    },
    ".cm-selectionBackground": {
      backgroundColor: "var(--secondary-500, #3b82f6) !important",
      opacity: "0.3",
    },
    ".cm-cursor": {
      borderLeftColor: "var(--surface-200, #e4e4e7)",
    },
    ".cm-completionIcon": {
      width: "16px",
      height: "16px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--surface-400, #a1a1aa)",
    },
    ".cm-completionLabel": {
      color: "var(--surface-200, #e4e4e7)",
    },
    ".cm-completionDetail": {
      color: "var(--surface-500, #71717a)",
      fontStyle: "italic",
    },
    ".cm-tooltip.cm-completionInfo": {
      backgroundColor: "var(--surface-800, #27272a)",
      border: "1px solid var(--surface-700, #3f3f46)",
      color: "var(--surface-200, #e4e4e7)",
      padding: "8px",
      borderRadius: "4px",
    },
  });

  return [
    basicSetup,
    javascript(),
    vscodeDark,
    themeOverride,
    updateListener,
    autoComplete,
    EditorView.lineWrapping,
    keymap.of([
      {
        key: "Tab",
        run: (v) => {
          v.dispatch(v.state.replaceSelection("  "));
          return true;
        },
      },
    ]),
  ];
};

const initEditor = () => {
  if (view !== undefined || containerRef.value === undefined) return;

  view = new EditorView({
    doc: props.modelValue,
    extensions: getExtensions(),
    parent: containerRef.value,
  });
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (view !== undefined && newValue !== view.state.doc.toString()) {
      const transaction = view.state.update({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: newValue,
        },
      });
      view.dispatch(transaction);
    }
  },
);

onMounted(() => {
  initEditor();
});

onBeforeUnmount(() => {
  if (view !== undefined) {
    view.destroy();
    view = undefined;
  }
});
</script>

<template>
  <div
    ref="containerRef"
    class="flex-1 w-full overflow-hidden rounded border border-surface-700"
  />
</template>
