# Agent Instructions: AutoReplay Caido Plugin

## What this repo is
- A Caido plugin named **AutoReplay**: a scanner/autoreplay tool that captures HTTP requests, defines check rules, replays modified requests, and compares responses.
- Frontend: Vue 3 + PrimeVue (unstyled, `Classic` preset) + `@caido-utils/ui-components`.
- Backend: TypeScript API with SQLite database for sessions, checks, settings, and scan results; sends modified requests via `sdk.requests.send`.
- Packaged as a single zip via `@caido-community/dev` build tooling.
- The `caido.config.ts` is the source of truth for plugin ID (`frontend-vue`), metadata, package boundaries, and Vite build config.

## Workspace structure
- Monorepo with two workspace packages: `packages/backend` and `packages/frontend`.
- Root `package.json` defines shared scripts; each package defines only `typecheck`.

### Backend layout
```
packages/backend/src/
├── api/
│   ├── checks.ts     ← addCheck, getChecks, updateCheck, deleteCheck
│   ├── requests.ts   ← getSetupRequests, getRequestResponse
│   ├── scan.ts       ← executeScan, pauseScan, resumeScan, stopScan, getScanResults
│   ├── session.ts    ← createSession, getSessions, deleteSession, clearSessions, updateSession (DB-backed)
│   └── settings.ts   ← typed wrappers: get/save/delete Discord webhooks, callback configs, payload files, payload lists, constants
├── core/
│   ├── checks/
│   │   ├── presets.ts  ← built-in check templates (HTTP Methods, Reflected XSS, Secondary Context Path Traversal)
│   │   ├── seed.ts     ← seedChecks: inserts presets on init if missing
│   │   └── index.ts    ← barrel exports
│   ├── runtime/
│   │   ├── ctx.ts      ← createContext: builds ctx with send (fire-and-forget), notify (identifier-based Discord lookup), callback, list (payload list lookup), utils
│   │   ├── request.ts  ← createRequestProxy: takes raw Caido Request, builds RequestParser internally, proxy with id, url, host, capturedAt, raw
│   │   ├── response.ts ← createResponseProxy: takes raw Caido Response, uses ResponseParser for headers, provides statusCode, duration, headers, body
│   │   ├── notify.ts   ← Discord webhook delivery via caido:http fetch + Blob (embed format)
│   │   ├── callback.ts ← placeholder for callback URL spawning
│   │   └── utils.ts    ← urlEncode, urlDecode, random helpers
│   └── scanner/
│       ├── runner.ts       ← runScan: creates RequestPool, passes raw Caido RequestResponseOpt to executor, tracks active pools by sessionId
│       ├── executor.ts     ← executeCheck: extracts fields from Caido Request, builds proxies, wraps check code in async IIFE
│       ├── pool.ts         ← RequestPool: enqueue with concurrency + delay + pause/resume/stop + waitUntilIdle
│       └── http.ts         ← sendHttpRequest: accepts host + raw, sends via RequestSpecRaw.setRaw()
├── database/
│   ├── schema.ts     ← initializeDatabase: creates `sessions`, `checks`, `scan_results`, and `settings` tables
│   ├── types.ts      ← InsertSessionInput, UpdateSessionInput, InsertCheckInput, UpdateCheckInput, InsertScanResultInput, Setting, UpsertSettingInput
│   ├── query.ts      ← getSession, getSessions, getChecks, getCheck, getScanResults, getSettings, getSetting
│   ├── mutation.ts   ← insertSession, updateSession, deleteSession, insertCheck, updateCheck, deleteCheck, insertScanResult (emits ScanResultCreated), upsertSetting, deleteSetting
│   ├── helpers.ts    ← getProjectId: wraps sdk.projects.getCurrent() for project scoping
│   └── index.ts      ← barrel exports
├── types.ts          ← shared domain types + Result<T>
└── index.ts          ← ONLY exports API type + init() wiring (no business logic)
```
- Backend entry: `packages/backend/src/index.ts` exports `init(sdk)` and an `API` type.
- Sessions and checks are persisted to SQLite (`sdk.meta.db()`) per project.
- The `active` session concept has been removed from the backend entirely.
- `insertScanResult` emits `BackendEvent.ScanResultCreated` after DB insert and returns the full `ScanResult` (id is DB auto-increment).
- `createRequestProxy` receives the raw Caido `Request` object (from `caido:utils`) and builds the `RequestParser` internally.
- `createResponseProxy` receives the raw Caido `Response` object and uses `ResponseParser` for headers.
- Settings uses a single `settings` table with `type` column (`discord`, `callback`, `file`, `list`, `constant`) for all configurable data.

### Frontend layout
```
packages/frontend/src/
├── views/
│   ├── App.vue       ← top-level app shell (MenuBar with "AutoReplay" branding + tab router: Scanner + Checks + Settings)
│   ├── Dashboard.vue ← scanner layout (SessionList sidebar + SetupPanel / ResultsPanel based on session status)
│   ├── Checks.vue    ← check management view (CheckList + CheckDetail side-by-side, grid with grid-rows-1)
│   └── Settings.vue  ← unified settings with sidebar (Notifications, Files, Lists, Callbacks, Constants) + selected panel on right
├── components/
│   ├── dashboard/
│   │   ├── SetupPanel/
│   │   │   ├── Container.vue   ← layout shell: outer splitter + tab switching
│   │   │   ├── SetupHeader.vue ← session name + Launch button
│   │   │   ├── RequestPanel.vue← vertical splitter: requests table + preview editor
│   │   │   ├── ChecksTab.vue   ← check selection list
│   │   │   └── SettingsTab.vue ← threads/delay/timeout inputs
│   │   ├── ResultsPanel/
│   │   │   ├── Container.vue   ← splitter: Table (top) + Editors (bottom)
│   │   │   ├── Table/
│   │   │   │   └── Container.vue  ← scan results table with pause/resume/stop controls next to filter
│   │   │   └── Editors/
│   │   │       ├── Container.vue  ← RequestEditor + ResponseEditor
│   │   │       └── useEditors.ts  ← editor view state
│   │   └── SessionList/
│   │       └── SessionList.vue
│   ├── checks/
│   │   ├── CheckList/
│   │   │   └── Container.vue   ← searchable/filterable check list
│   │   └── CheckDetail/
│   │       ├── Container.vue   ← inline check editor (name + description + code), layout matches CheckList pattern (h-full flex flex-col)
│   │       └── CodeEditor.vue  ← CodeMirror-based JS editor (VSCode Dark theme, flex-1 w-full overflow-hidden, h-full from parent)
│   ├── settings/
│   │   ├── NotificationsPanel.vue  ← Discord webhooks table (header + rows + empty state)
│   │   ├── FilesPanel.vue          ← uploaded payload files table (header + rows + empty state)
│   │   ├── ListsPanel.vue          ← inline text lists table (header + rows + empty state)
│   │   ├── CallbacksPanel.vue      ← callback URLs table (header + rows + empty state)
│   │   └── ConstantsPanel.vue      ← key-value constants table (header + rows + empty state)
│   └── dialogs/
│       ├── DialogManager.vue
│       ├── AddWebhookDialog/
│       │   └── Container.vue
│       ├── AddCallbackDialog/
│       │   └── Container.vue
│       ├── AddListDialog/
│       │   └── Container.vue   ← identifier + name + textarea (one item per line)
│       ├── AddConstantDialog/
│       │   └── Container.vue   ← key + value inputs
│       ├── DeleteSessionDialog/
│       │   └── Container.vue
│       ├── EditSessionDialog/
│       │   └── Container.vue
│       ├── DeleteCheckDialog/
│       │   └── Container.vue
│       └── GuideDialog/
│           ├── Container.vue   ← code pattern examples with syntax highlighting
│           └── HighlightedCode.vue
├── stores/
│   ├── index.ts      ← Pinia instance + store exports
│   ├── sessions.ts   ← sessions (id: number), selectedSessionId (number), request selection, per-session setup + results + scanState
│   ├── checks.ts     ← check rules
│   ├── settings.ts   ← discordWebhooks[], callbackConfigs[], payloadFiles[], payloadLists[], constants[] arrays
│   └── ui.ts         ← dialog state (mainView, data, openDialog, closeDialog)
├── composables/
│   ├── useScan.ts    ← launchScan, pauseScan, resumeScan, stopScan. Manages per-session scanState.
│   ├── useSession.ts ← wraps SDK session calls (fetch/create/delete/clear/update) + store updates
│   ├── useChecks.ts  ← wraps SDK check calls (fetch/add/update/delete) + store updates
│   ├── useSettings.ts← wraps SDK settings calls (fetch/save/delete for discord, callbacks, files, lists, constants)
│   ├── useEvents.ts  ← registers backend event listeners (scan-result-created, scan-complete)
│   └── useDialog.ts  ← typed dialog openers (openDeleteSession, openEditSession, openDeleteCheck, openGuide, openAddWebhook, openAddCallback, openAddList, openAddConstant)
├── types/
│   └── models.ts     ← frontend domain types (mirrors backend; Session.id is number; ScanState type; ScanResult.id is number)
├── plugins/
│   └── sdk.ts
└── index.ts
```
- `views/` holds page-level components. `components/` holds feature pieces imported by views.
- `App.vue` owns `onMounted` data bootstrap (`fetchSessions` via `useSession`).
- Components should use `useSession` composable instead of calling the SDK directly for session operations.
- Dialogs are managed by `DialogManager.vue` mounted in `App.vue`. Only one dialog open at a time via `useUIStore().mainView`.
- New sessions are appended to the end of the sessions array (not prepended).
- `Checks.vue` uses `grid-rows-1` to ensure grid tracks fill container height.
- `CheckDetail/Container.vue` layout matches `CheckList` pattern: `h-full flex flex-col` with `flex-1 min-h-0 overflow-hidden` around CodeEditor.
- `CodeEditor.vue` uses `flex-1 w-full overflow-hidden` as root, with CodeMirror theme `height: "100%"`.
- **Settings.vue** is a 3/9 grid sidebar layout (inspired by Swapper's Profiles Sidebar): left sidebar has icon badges + title + description for each category; right panel renders the selected section full-height inside a Card.
- **settings/NotificationsPanel.vue**, **settings/FilesPanel.vue**, **settings/ListsPanel.vue**, **settings/CallbacksPanel.vue**, **settings/ConstantsPanel.vue** all use the same flat table pattern: header row (title + subtitle + action button) + column headers + data rows + empty state. No outer padding, Card fills viewport.

## Toolchain
- Package manager: **pnpm 9**. Node: **20**.
- Build: root scripts call `caido-dev build` and `caido-dev watch`.
- Lint: ESLint via `@caido/eslint-config` (`pnpm lint` runs on `./packages/**/src` with `--fix`).
- Typecheck: `pnpm typecheck` runs `vue-tsc --noEmit` (frontend) and `tsc --noEmit` (backend).
- Unused-code check: `pnpm knip`.

## Verified commands
```bash
# Install dependencies
pnpm install

# Watch during development (builds continuously)
pnpm watch

# Build production artifact (outputs to dist/)
pnpm build

# Run checks used in CI (independent, order does not matter)
pnpm typecheck
pnpm lint
pnpm knip
```

## Styling and build quirks
- CSS is wrapped by a `postcss-prefixwrap` plugin to scope the plugin under `#plugin--frontend-vue`. The frontend root element ID must match that selector, as seen in `caido.config.ts` and `packages/frontend/src/index.ts`.
- Tailwind is configured in `caido.config.ts` with `darkMode: ["selector", '[data-mode="dark"]']` and `corePlugins.preflight: false`.
    - PrimeVue is used unstyled with the `Classic` preset. No custom PrimeVue theme files are committed; the custom theme comes from `@caido/tailwindcss` and `tailwindcss-primeui`.
    - The frontend depends on `@caido-utils/ui-components` for Caido-native UI primitives like `RequestEditor`, `ResponseEditor`, etc.

## Styling conventions
- Do **not** use Tailwind arbitrary-value bracket syntax (e.g., `w-[45%]`, `h-[35%]`, `flex-[2]`). Use standard Tailwind utilities, grid/flex ratios, or semantic class names instead.
- Use `gap-1` for spacing between cards/components, not `gap-2`.
- Each logical section (header, table, preview, checks, settings) should be wrapped in its own `Card` from `@caido-utils/ui-components`.
- Selected list items use `bg-surface-700` (CheckList, SessionList, SettingsList all match this style).
- Do **not** add `severity="primary"` to PrimeVue buttons. The default primary styling applies without it.

## Backend conventions that differ from defaults
- Use `type` aliases only; avoid `interface`.
- Do not use `any`, do not cast to `any`, and prefer `undefined` over `null`.
- Use `Result<T>` types for backend APIs with `kind: "Ok" | "Error"`.
- Handle errors on the frontend by checking `result.kind === "Ok"` — **never** use try/catch around backend calls.
- Example:
  ```ts
  export type Result<T> =
    | { kind: "Ok"; value: T }
    | { kind: "Error"; error: string };
  ```

## Frontend SDK usage quirks
- SDK surface is fully typed and guaranteed stable: **never** add runtime checks like `if ("showToast" in sdk.window)`.
- The frontend imports the backend `API` type from the `backend` workspace package (`import { type API } from "backend"`).
- Icons must be `fas fa-...` classes; no other icon sets are supported.

## Frontend component conventions
- Use `<script setup lang="ts">` in `.vue` files.
- Keep `views/` for page-level components (App.vue, Dashboard.vue, Checks.vue, Settings.vue).
- Keep `components/` for feature-specific sub-components.
- Colocate component logic in composables under `composables/` when shared across components.
- Use `@caido-utils/ui-components` for Caido-native editors (`RequestEditor`, `ResponseEditor`, etc.) instead of building raw text viewers.

## Domain / state knowledge
- An `HttpRequest` has: `id`, `method`, `url`, `path`, `query`, `host`, `capturedAt`.
- A `ScanResult` has: `id` (number, DB auto-increment), `originalRequestId`, `checkId`, `checkName`, `method`, `host`, `path`, `query`, `modifiedRequestId`, `statusCode`, `size`, `duration`, `timestamp`.
    - All fields except `originalRequestId` describe the modified/replayed request.
    - `size` is the response body length (computed at scan time).
- A `CheckRule` has: `id` (number), `name`, `description`, `code`.
    - All checks are programmable JavaScript. The script receives `request` (a Parser proxy with `.send()`), `response` (the original HTTP response or `undefined`), `send`, `notify`, `callback`, `list`, and `utils`.
    - Use `request.method = "POST"`, `request.query.set("key", "value")`, then `await send(request)` to fire variations.
    - `notify.discord(identifier)` looks up the webhook URL from saved Discord settings by identifier and returns a notification handle with `.message(text)` to send.
    - `list(identifier)` looks up a saved payload list by identifier and returns `string[]`.
    - The old simple type/target/value format and the `enabled` field have been removed entirely.
- A `ResponseProxy` has: `statusCode`, `duration`, `headers` (with `.get()`, `.has()`, `.raw`), `body` (a `BodyProxy` or `undefined`).
    - `response.body` exposes the parsed response body with `.items`, `.get(name)`, `.set(name, value)`, `.remove(name)`, and `.type`.
    - `response.body` is `undefined` for unsupported content types or empty bodies.
    - `response.body` is lazily parsed — the ResponseParser is only created when accessed.
- A `Session` has: `id` (number), `name`, `status` ("setup" | "results"), `requests`, `createdAt`. Sessions start in `"setup"`; after launching a scan they transition to `"results"` immediately so the ResultsPanel renders while scanning continues in the background.
- `ScanState` = `"idle" | "running" | "paused" | "stopped"`. Tracked per-session in the frontend store.
- Backend emits `BackendEvent.ScanResultCreated` after each check/request pair completes (from inside `insertScanResult`). Frontend filters incoming events by matching `sessionId` against the currently selected session before adding to the store.
- Backend emits `BackendEvent.ScanComplete` when the scan finishes (queue empty and pool idle). Frontend sets `scanState` to `"idle"` and shows the "Scan complete" toast.
- Pinia stores: `sessions.ts` holds sessions (id: number), selection, per-session setup state, scan results, and `scanState`; `checks.ts` holds check rules; `settings.ts` holds arrays of Discord webhooks, callback configs, payload files, payload lists, and constants; `ui.ts` holds dialog state.
- Check selection is per-session only (`sessionCheckIds: Record<number, number[]>`) — there is no global "active" state on checks.
- Dialog system: `useDialog()` provides typed openers. `DialogManager` renders the active dialog based on `uiStore.mainView`. Dialogs use PrimeVue `<Dialog>` with `:visible="true"` and custom header close buttons.
- Settings are stored in a `settings` table with `type`, `identifier`, `data` (JSON string), scoped per project. Typed wrappers exist for `discord`, `callback`, `file`, `list`, and `constant` types.
- Request sending is managed by a `RequestPool` in the scanner with configurable concurrency, delay between requests, pause/resume/stop, and timeout.
    - `send()` is fire-and-forget: check scripts call `await send(request)` which returns immediately after enqueue. The pool processes requests asynchronously.
    - `executeScan` takes an `options` object: `{ threads: number; delayMs: number; timeoutSec: number }`.
    - `pauseScan`, `resumeScan`, `stopScan` operate on the active pool tracked by `sessionId`.
    - Active pools are stored in a Map keyed by `sessionId` in `runner.ts`.
    - `executor.ts` enforces a 120s per-check timeout so a hung check can't block the entire scan.
    - `runner.ts` uses `Promise.allSettled` (not `Promise.all`) and a 60s idle timeout so `finally` always cleans up the pool and emits `ScanComplete`.
- Duration is captured from `response.getRoundtripTime()` and stored in each `ScanResult`.
- `getSetupRequests` supports optional deduplication (`deduplicate = false`) that groups by `method|host|path|query|cookie` using `RequestParser` to keep only the first request per unique fingerprint.

## CI / release
- `validate.yml` runs `typecheck`, `lint`, and `knip` in parallel on push to `main`.
- `release.yml` runs on every push to `main`. It builds, optionally signs the artifact with an ed25519 key, and creates a GitHub release using the version from `dist/plugin_package.zip` manifest.

## Agent behavior
- **Never run `git status` or any git commands.** This workspace is not using git; if git is present, do not interact with it.

## Other instruction sources
- Additional rules and patterns live in `.cursor/rules/` (backend/frontend SDK patterns, component conventions, style guide, linter notes). Worth reading when touching those areas.
