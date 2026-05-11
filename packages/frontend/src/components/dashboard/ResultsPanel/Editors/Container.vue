<script setup lang="ts">
import {
  ButtonGroup,
  Card as CardContainer,
  RequestEditor,
  ResponseEditor,
} from "@caido-utils/ui-components";

import { useEditors } from "./useEditors";

import { useSDK } from "@/plugins/sdk";
import { useSessionStore } from "@/stores";

const sdk = useSDK();
const sessionStore = useSessionStore();

const { editorView, rawRequest, rawResponse, viewOptions, handleEditorView } =
  useEditors();
</script>

<template>
  <CardContainer class="h-full overflow-hidden">
    <template #content>
      <div class="flex flex-col h-full overflow-hidden">
        <div class="flex gap-2 flex-1 min-h-0" style="height: 100%">
          <div class="flex-1 overflow-hidden">
            <RequestEditor
              :key="sessionStore.selectedResult?.id"
              :sdk="sdk"
              :content="rawRequest"
            />
          </div>
          <div
            class="flex-1 overflow-hidden border-l border-surface-700/30 pl-2"
          >
            <ResponseEditor
              :key="sessionStore.selectedResult?.id"
              :sdk="sdk"
              :content="rawResponse"
            />
          </div>
        </div>
        <div
          class="flex items-center gap-2 text-xs text-surface-400 px-2 py-2 border-t border-surface-700/30"
        >
          <span>Version:</span>
          <ButtonGroup
            v-model="editorView"
            :options="viewOptions"
            @update:model-value="handleEditorView"
          />
        </div>
      </div>
    </template>
  </CardContainer>
</template>
