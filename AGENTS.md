# Agent Instructions: AutoReplay Caido Plugin

## What this repo is
- A Caido plugin named **AutoReplay**: a scanner/autoreplay tool that captures HTTP requests, defines check rules, replays modified requests, and compares responses.
- Frontend: Vue 3 + PrimeVue (unstyled, `Classic` preset) + `@caido-utils/ui-components`.
- Backend: TypeScript API with SQLite database for sessions, checks, resources, and scan results; sends modified requests via `sdk.requests.send`.
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
  │   ├── profiles.ts  ← addScanProfile, getScanProfiles, updateScanProfile, deleteScanProfile
  │   ├── requests.ts   ← getSetupRequests, getFilteredRequests, getRequestResponse, getRequestsByIds
  │   ├── scan.ts       ← executeScan, pauseScan, resumeScan, stopScan, getScanState, getScanResults
│   ├── session.ts    ← createSession, getSessions, deleteSession, clearSessions, updateSession (DB-backed)
│   └── resources.ts  ← typed wrappers: get/save/delete Discord webhooks, callback configs, payload files, payload lists, constants
├── core/
│   ├── checks/
  │   │   ├── presets.ts  ← built-in check templates (Blind XSS, Tag Test, Reflected Query Parameters)
│   │   ├── seed.ts     ← seedChecks: inserts presets on init if missing
│   │   └── index.ts    ← barrel exports
│   ├── profiles/
│   │   ├── seed.ts     ← seedProfiles: optional default Blind XSS profile seeder
│   │   └── index.ts    ← barrel exports
│   ├── runtime/
│   │   ├── ctx.ts      ← createContext: builds ctx with response-aware send, notify (identifier-based Discord lookup), list (payload list lookup), utils, encode, decode
│   │   ├── request.ts  ← createRequestProxy: takes raw Caido Request, builds RequestParser internally, proxy with id, url, host, port, tls, capturedAt, raw
│   │   ├── response.ts ← createResponseProxy: takes raw Caido Response, uses ResponseParser for headers, provides statusCode, duration, headers, body
│   │   ├── notify.ts   ← Discord webhook delivery via caido:http fetch + Blob (embed format)
│   │   ├── utils.ts    ← urlEncode, urlDecode, random helpers
│   │   ├── encode.ts   ← encode(input, method, options?): supports "url" (strict mode via encodeURIComponent)
│   │   └── decode.ts   ← decode(input, method, options?): supports "url" (strict mode via decodeURIComponent)
│   ├── setup/
│   │   ├── filter.ts     ← buildFilter(filter, options?): composes HTTPQL string from user filter + extension exclusions (req.ext.nlike) + time filters (req.created_at.gt)
│   │   ├── deduplication.ts ← createDeduplicationKey: builds method|host|path|queryNames|cookie fingerprint via RequestParser
│   │   └── index.ts      ← barrel exports
│   └── scanner/
│       ├── runner.ts       ← runScan: creates RequestPool, passes raw Caido RequestResponseOpt to executor, tracks active pools by sessionId
│       ├── executor.ts     ← executeCheck: extracts fields from Caido Request, builds proxies, wraps check code in async IIFE
│       ├── pool.ts         ← RequestPool: enqueue with concurrency + delay + pause/resume/stop + waitUntilIdle
│       └── http.ts         ← sendHttpRequest: parses raw request with RequestSpec.parse(), falls back to RequestSpecRaw, preserves original TLS/port, and uses Caido-native send timeouts
├── database/
│   ├── schema.ts     ← initializeDatabase: creates `sessions`, `checks`, `scan_profiles`, `scan_results`, and `resources` tables
│   ├── types.ts      ← database insert/update input types
│   ├── query.ts      ← session, check, scan profile, scan result, and resource queries
│   ├── mutation.ts   ← session, check, scan profile, scan result, and resource mutations
│   ├── helpers.ts    ← getProjectId: wraps sdk.projects.getCurrent() for project scoping
│   └── index.ts      ← barrel exports
├── types.ts          ← shared domain types + Result<T>
└── index.ts          ← ONLY exports API type + init() wiring (no business logic)
```
- Backend entry: `packages/backend/src/index.ts` exports `init(sdk)` and an `API` type.
- Sessions are persisted per project. **Checks, scan profiles, and resources are global** (no `project_id`).
- Scan profiles use a dedicated `scan_profiles` table with unique name, check IDs, threads, delay, and timeout. There is no shortcut column or shortcut compatibility logic. Backend CRUD accepts an empty `check_ids` array; scan execution remains responsible for rejecting launches with no checks.
- `seedProfiles` is not called during backend initialization. When invoked explicitly, it inserts a missing `Blind XSS` profile with the `Blind XSS` check, 1 thread, 2,000 ms delay, and a 30-second timeout.
- Sessions have `setup_filter`, `results_filter`, and `scan_tag` columns. `setup_filter` persists setup HTTPQL, `results_filter` persists ResultsPanel HTTPQL, and `scan_tag` stores the random per-scan marker value.
- `scan_tag` and `results_filter` are defined directly in the development schema; do not add migrations/`ALTER TABLE` statements for them unless explicitly requested.
- The `active` session concept has been removed from the backend entirely.
- `insertScanResult` emits `BackendEvent.ScanResultCreated` after DB insert and returns the full `ScanResult` (id is DB auto-increment).
- `createRequestProxy` receives the raw Caido `Request` object (from `caido:utils`), builds the `RequestParser` internally, and preserves the original request's `port` and `tls` connection metadata.
- `createResponseProxy` receives the raw Caido `Response` object and exposes the parser's `BodyAccessor` directly (not a proxy).
- Resources use a single `resources` table with `type` column (`discord`, `file`, `list`, `constant`) for all configurable data. No `callback` type (removed).

### Frontend layout
```
packages/frontend/src/
├── views/
│   ├── App.vue       ← top-level app shell (MenuBar with "AutoReplay" branding + tab router: Scanner + Checks + Resources)
│   ├── Dashboard.vue ← scanner layout (SessionList sidebar + SetupPanel / ResultsPanel based on session status)
│   ├── Checks.vue    ← check management view (CheckList + CheckDetail side-by-side, grid with grid-rows-1)
│   ├── Profiles.vue  ← scan profile management view (ProfileList + ProfileDetail)
│   └── Resources.vue ← unified resources with sidebar (Notifications, Files, Lists, Callbacks, Constants) + selected panel on right
├── components/
│   ├── dashboard/
│   │   ├── SetupPanel/
│   │   │   ├── Container.vue   ← layout shell: outer splitter + tab switching + Drawer for Advanced options
│   │   │   ├── SetupHeader.vue ← session name + Launch button
│   │   │   ├── RequestPanel.vue← vertical splitter: requests table + preview editor, cog button opens Advanced drawer
│   │   │   ├── ChecksTab.vue   ← check selection list
│   │   │   ├── ResourcesTab.vue← threads/delay/timeout inputs
│   │   │   ├── AdvancedOptionsTab.vue ← filter presets (No Images, No Videos, No Documents, No Styling, No JavaScript, In Scope, No Duplicates) + Time Range (All time, Recent, 1hr, 6hr, 12hr, 24hr) + Reset preferences
│   │   │   └── useCaido.ts   ← Caido integration: navigation, commands, menu items
│   │   ├── ResultsPanel/
│   │   │   ├── Container.vue   ← splitter: Table (top) + Editors (bottom)
│   │   │   ├── Table/
│   │   │   │   └── Container.vue  ← scan results table with Enter-triggered HTTPQL filter + pause/resume/stop controls
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
│   ├── profiles/
│   │   ├── ProfileList/
│   │   │   └── Container.vue   ← searchable profile list + create action; selected row has secondary-yellow left border and ellipsis menu with Delete Profile
│   │   └── ProfileDetail/
│   │       ├── Container.vue    ← profile header + General/Checks/Resources tabs + actions
│   │       ├── GeneralPanel.vue ← profile name
│   │       ├── ChecksPanel.vue  ← full-height searchable check selection
│   │       └── ResourcesPanel.vue ← focused threads, delay, and timeout settings
  │   ├── resources/
  │   │   ├── NotificationsPanel.vue  ← Discord webhooks table (header + rows + empty state)
  │   │   ├── FilesPanel.vue          ← uploaded payload files table (header + rows + empty state)
  │   │   ├── ListsPanel.vue          ← inline text lists table (header + rows + empty state)
  │   │   └── ConstantsPanel.vue      ← key-value constants table (header + rows + empty state)
  │   └── dialogs/
  │       ├── DialogManager.vue
  │       ├── AddWebhookDialog/
  │       │   └── Container.vue
  │       ├── AddListDialog/
  │       │   └── Container.vue   ← identifier + name + textarea (one item per line)
  │       ├── AddConstantDialog/
  │       │   └── Container.vue   ← key + value inputs
  │       ├── SendToAutoReplayDialog/
  │       │   ├── Container.vue   ← Burp-style scan wizard shell + in-place final scan launch
  │       │   ├── RequestsStep.vue    ← loaded Caido request summary
  │       │   ├── ProfilesStep.vue    ← applies saved checks and resource settings
  │       │   ├── ChecksStep.vue      ← per-scan check selection
  │       │   └── ResourcePoolStep.vue← Fast/Medium/Slow presets + threads, delay, and timeout
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
│   ├── profiles.ts   ← global scan profiles, selection, and edit drafts
│   ├── resources.ts  ← discordWebhooks[], callbackConfigs[], payloadFiles[], payloadLists[], constants[] arrays
│   └── ui.ts         ← dialog state (mainView, data, openDialog, closeDialog)
├── composables/
  │   ├── useCaido.ts   ← Caido integration: registers navigation, static commands, saved profile commands, and menu items
  │   ├── useScan.ts    ← launchScan, launchProfileScan, syncScanState, pauseScan, resumeScan, stopScan. Manages scan orchestration and per-session scanState.
  │   ├── useSession.ts ← wraps SDK session calls (fetch/create/delete/clear/update) + store updates
  │   ├── useChecks.ts  ← wraps SDK check calls (fetch/add/update/delete) + store updates
  │   ├── useProfiles.ts← wraps profile CRUD/store updates
  │   ├── useResources.ts← wraps SDK resource calls (fetch/save/delete for discord, files, lists, constants)
  │   ├── useEvents.ts  ← registers backend event listeners (scan-result-created, scan-complete)
  │   └── useDialog.ts  ← typed dialog openers, including openSendToAutoReplay(requestIds)
├── types/
│   └── models.ts     ← frontend domain types (mirrors backend; Session.id is number; ScanState type; ScanResult.id is number)
├── plugins/
│   └── sdk.ts
└── index.ts
```
- `views/` holds page-level components. `components/` holds feature pieces imported by views.
- `App.vue` owns `onMounted` data bootstrap for sessions, checks, and scan profiles.
- `Profiles.vue` refreshes scan profiles when the view mounts so its list reflects backend seeding or changes made after the initial app bootstrap.
- New profiles are persisted immediately as `New Profile` (with numeric suffixes for collisions), no checks selected, 5 threads, 0 ms delay, and 30-second timeout. Empty check selections can be saved, while scan launch still rejects running without checks.
- Components should use `useSession` composable instead of calling the SDK directly for session operations.
- Dialogs are managed by `DialogManager.vue` mounted in `App.vue`. Only one dialog open at a time via `useUIStore().mainView`.
- The `autoreplay:send` command gets request IDs with `getRequestIds(context)` and opens a Burp-style `SendToAutoReplayDialog` wizard with Requests, Profiles, Checks, and Resource pool steps. Profiles behave as presets: clicking one copies its check IDs and resource values into the scan draft without creating persistent selected-profile state.
- `autoreplay:send` must not call `sdk.navigation.goTo()`. The dialog is global and opens over the current Caido page; the final Scan action creates and launches the configured session without navigating away.
- New sessions are appended to the end of the sessions array (not prepended).
- `Profiles.vue` uses the same 4/8 list-detail layout as Checks. ProfileDetail keeps one normal header with summary/actions and General/Checks/Resources tabs, then gives the remaining height to exactly one focused panel.
- Frontend `init()` awaits `useCaido.register()`, which loads saved profiles before registering one deterministic command (`autoreplay:profile-<id>`) and Request/RequestRow context-menu item for every profile. Profile commands use `getRequestIds(context)` and launch the selected requests immediately with that profile. Profiles have no shortcut UI, shortcut fields, or `sdk.shortcuts` registrations.
- `Checks.vue` uses `grid-rows-1` to ensure grid tracks fill container height.
- `CheckDetail/Container.vue` layout matches `CheckList` pattern: `h-full flex flex-col` with `flex-1 min-h-0 overflow-hidden` around CodeEditor.
- `CodeEditor.vue` uses `flex-1 w-full overflow-hidden` as root, with CodeMirror theme `height: "100%"`.
- The ResultsPanel `HttpqlInput` searches only when Enter is pressed. Do not add a search button beside it; that space is reserved for pause/resume/stop controls.
- ResultsPanel syncs the selected session's scan state from the backend active pool so pause/resume/stop controls survive frontend reloads while a scan continues.
- ResultsPanel filtering calls backend `getFilteredRequests(filter, scanTag)`, then keeps scan results whose `modifiedRequestId` matches the returned Caido request IDs. It is not a live client-side text filter.
- The ResultsPanel HTTPQL value is persisted per session in `resultsFilter`.
- **Resources.vue** is a 3/9 grid sidebar layout (inspired by Swapper's Profiles Sidebar): left sidebar has icon badges + title + description for each category; right panel renders the selected section full-height inside a Card.
- **resources/NotificationsPanel.vue**, **resources/FilesPanel.vue**, **resources/ListsPanel.vue**, **resources/CallbacksPanel.vue**, **resources/ConstantsPanel.vue** all use the same flat table pattern: header row (title + subtitle + action button) + column headers + data rows + empty state. No outer padding, Card fills viewport.

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
- Each logical section (header, table, preview, checks, resources) should be wrapped in its own `Card` from `@caido-utils/ui-components`.
- Selected list items use `bg-surface-700` (CheckList, SessionList, ResourcesList all match this style).
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
- Use `getRequestIds(context)` from `@caido-utils/frontend-sdk` for Caido command/menu request contexts. Do not recreate or cast a local `CommandContext` union.
- Icons must be `fas fa-...` classes; no other icon sets are supported.

## Frontend component conventions
- Use `<script setup lang="ts">` in `.vue` files.
- Keep `views/` for page-level components (App.vue, Dashboard.vue, Checks.vue, Resources.vue).
- Keep `components/` for feature-specific sub-components.
- Colocate component logic in composables under `composables/` when shared across components.
- Use `@caido-utils/ui-components` for Caido-native editors (`RequestEditor`, `ResponseEditor`, etc.) instead of building raw text viewers.

## Domain / state knowledge
- An `HttpRequest` has: `id`, `method`, `url`, `path`, `query`, `host`, `capturedAt`.
- A `ScanResult` has: `id` (number, DB auto-increment), `originalRequestId`, `checkId`, `checkName`, `method`, `host`, `path`, `query`, `modifiedRequestId`, `statusCode`, `size`, `duration`, `timestamp`.
    - All fields except `originalRequestId` describe the modified/replayed request.
    - `size` is the response body length (computed at scan time).
- A `CheckRule` has: `id` (number), `name`, `description`, `code`.
    - All checks are programmable JavaScript. The script receives `request` (a Parser proxy), `response` (the original HTTP response or `undefined`), `send`, `notify`, `list`, and `utils`.
    - Use `request.method = "POST"`, `request.query.set("key", "value")`, then `const result = await send(request)` to fire variations and inspect the replay response.
    - `send(request)` returns `RuntimeSendResult`: `{ kind: "Ok", requestId, response: ResponseProxy }` or `{ kind: "Error", error }`.
    - Existing checks may ignore the return value and simply use `await send(request)`.
    - `notify.discord(identifier)` looks up the webhook URL from saved Discord resources by identifier and returns a notification handle with `.message(text)` to send.
    - `list(identifier)` looks up a saved payload list by identifier and returns `string[]`.
    - `encode(input, "url", { strict: true })` and `decode(input, "url", { strict: true })` are available for URL encoding/decoding.
    - The built-in `Reflected Query Parameters` check mutates one query parameter at a time with an `ar<random>ra` canary, awaits the replay response, restores the original value, and checks `result.response.body.raw` for reflection.
    - The old simple type/target/value format and the `enabled` field have been removed entirely.
- A `ResponseProxy` has: `statusCode`, `duration`, `headers` (with `.get()`, `.has()`, `.raw`), `body` (a `BodyAccessor` or `undefined`).
    - `response.body` exposes the parser's `BodyAccessor` directly with `.raw`, `.type`, `.items`, `.get()`, `.has()`, `.set()`, `.remove()`.
    - The unified API works across formats: `.items`, `.get()`, `.has()` work for json, urlencoded, multipart, xml. `.set()` and `.remove()` work for json, urlencoded, multipart (no-op for xml/raw/html).
    - `response.body` is `undefined` only if parsing failed; otherwise it always exposes `.raw` (the raw body string).
    - `response.body` is lazily parsed — the ResponseParser is only created when accessed.
- A `Session` has: `id` (number), `name`, `status` ("setup" | "results"), `setupFilter`, `resultsFilter`, `scanTag`, `requests`, `createdAt`. Sessions start in `"setup"`; after launching a scan they transition to `"results"` immediately so the ResultsPanel renders while scanning continues in the background.
- `ScanState` = `"idle" | "running" | "paused" | "stopped"`. Tracked per-session in the frontend store.
- Backend emits `BackendEvent.ScanResultCreated` after each replay send is recorded (from inside `insertScanResult`). A single check/request pair may produce multiple results. Frontend filters incoming events by matching `sessionId` against the currently selected session before adding to the store. Event signature: `(sessionId: number, result: ScanResult) => void`.
- Backend emits `BackendEvent.ScanComplete` when the scan finishes (queue empty and pool idle). Frontend sets `scanState` to `"idle"` and shows the "Scan complete" toast. Event signature: `(sessionId: number) => void`.
- Pinia stores: `sessions.ts` holds sessions (id: number), selection, per-session setup state, scan results, and `scanState`; `checks.ts` holds check rules; `resources.ts` holds arrays of Discord webhooks, payload files, payload lists, and constants; `ui.ts` holds dialog state.
- Check selection is per-session only (`sessionCheckIds: Record<number, number[]>`) — there is no global "active" state on checks.
- Dialog system: `useDialog()` provides typed openers. `DialogManager` renders the active dialog based on `uiStore.mainView`. Dialogs use PrimeVue `<Dialog>` with `:visible="true"` and custom header close buttons.
- Resources are stored in a `resources` table with `type`, `identifier`, `data` (JSON string), scoped per project. Typed wrappers exist for `discord`, `file`, `list`, and `constant` types.
- Request sending is managed by a `RequestPool` in the scanner with configurable concurrency, delay between requests, pause/resume/stop, and timeout.
    - `send()` awaits the queued pool item and returns its replay response through `RuntimeSendResult`. Automatic `ScanResult` insertion still happens inside the runtime context.
    - `executeScan` takes an `options` object: `{ threads: number; delayMs: number; timeoutSec: number }`.
    - `pauseScan`, `resumeScan`, `stopScan` operate on the active pool tracked by `sessionId`.
    - Active pools are stored in a Map keyed by `sessionId` in `runner.ts`.
    - `runner.ts` starts each request/check script concurrently; `threads` limits active network sends in `RequestPool`, not the number of check scripts that may be waiting on queued sends.
    - `RequestPool` runs up to `threads` worker loops. `delayMs` is a shared throttle across the pool: replay request start times are spaced by at least that amount, regardless of worker count.
    - Pausing a scan stops workers from taking new queued requests but does not cancel requests already inside `sdk.requests.send`. A paused scan must remain in `activePools` so it can be resumed or stopped later.
    - `sendHttpRequest` passes `timeoutSec` to Caido as a native global send timeout. Do not reintroduce a `Promise.race` timeout around `sdk.requests.send`; it leaves the underlying request running.
    - Outgoing requests must retain the original captured request's TLS mode and destination port. Raw HTTP text alone does not preserve this metadata.
    - `executor.ts` enforces a 120s per-check timeout so a hung check can't block the entire scan. The timeout does not currently cancel the underlying check promise.
    - `runner.ts` uses `Promise.allSettled` (not `Promise.all`) for check execution, then waits for `pool.waitUntilIdle()`. Do not add a fixed idle timeout here: paused scans with queued work are intentionally not idle and should not auto-complete.
- Duration is captured from `response.getRoundtripTime()` and stored in each `ScanResult`.
- Every scan creates one random marker value, stores it in `sessions.scan_tag`, and stamps all replay requests with the cookie `__areplay=<scanTag>` through `request.cookies.set(...)`.
- `getFilteredRequests(filter, tag)` fetches replay requests via cursor-based pagination and always scopes HTTPQL with `req.raw.cont:"__areplay=<tag>"`; a non-empty user filter is combined with `AND`.
- `getSetupRequests` fetches all matching requests via cursor-based pagination (1,000 per page) and always scopes results with `source:"intercept"`. `buildFilter` composes HTTPQL with extension exclusions (`req.ext.nlike:"%.<ext>"`) and time range filters (`req.created_at.gt:"<RFC3339>"`). Supports optional deduplication (`deduplicate = false`) that groups by `method|host|path|queryNames|cookie` using `RequestParser` — query parameter names are sorted and joined, values are ignored, so `?user=1` and `?user=2` are treated as the same fingerprint.
- `SessionSetup` includes filter presets: `deduplicate`, `inScope`, `noJavascript`, `noImages`, `noVideos`, `noDocuments`, `noStyling`, `timeFilter`. All preset checkboxes default to checked except time filter defaults to `"all"`.
- The Advanced Options drawer (right slide-in) uses PrimeVue `<Drawer>` with `Teleport to="body"`, `position="right"`, and a transparent mask so the rest of the UI stays visible.

## CI / release
- `validate.yml` runs `typecheck`, `lint`, and `knip` in parallel on push to `main`.
- `release.yml` runs on every push to `main`. It builds, optionally signs the artifact with an ed25519 key, and creates a GitHub release using the version from `dist/plugin_package.zip` manifest.

## Agent behavior
- **Never run `git status` or any git commands.** This workspace is not using git; if git is present, do not interact with it.

## Other instruction sources
- Additional rules and patterns live in `.cursor/rules/` (backend/frontend SDK patterns, component conventions, style guide, linter notes). Worth reading when touching those areas.
