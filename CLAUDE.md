# AGENTS.md

Instructions for AI agents working on this codebase.

---

## What this project is

A VSCode extension that sends input to Google's Antigravity CLI (`agy`). It is a sidebar panel with a textarea, context chips, mode/model controls, and a send button. It does **not** display output — everything runs in the terminal.

Read [docs/implementation_overview.md](docs/implementation_overview.md) before making any changes. It contains the architecture, all key flows, and the host ↔ webview communication model.

---

## Critical constraints

**VSCode webview sandbox.** The webview (`media/main.js`) runs in an isolated browser context. It cannot import Node modules, access the filesystem, or call VSCode APIs directly. All host communication goes through `vscode.postMessage()` / `window.addEventListener('message')`. The only VSCode API available in the webview is the object returned by `acquireVsCodeApi()` — which must be called **exactly once**.

**CSP nonce.** Every `<script>` tag in the webview HTML requires a `nonce` attribute matching the Content-Security-Policy header. The nonce is generated in `AgyComposerPanel.renderHtml()`. Never add inline scripts to the HTML without the nonce.

**`retainContextWhenHidden: true`** is set on the WebviewView. This keeps the webview alive when the panel is hidden. Do not remove it — chips added via keyboard shortcut while the panel is collapsed depend on the webview staying alive to receive the `chipAdded` message.

**Terminal sendText is fire-and-forget.** `terminal.sendText(text, true)` types text into the terminal and presses Enter. There is no return value, no confirmation, no way to know if `agy` received it or was ready. The 1500ms delay in `handleSend` for new sessions is intentional and necessary.

**Welcome screen / session lifecycle.** `media/main.js` tracks an in-memory `wasEverActive` boolean (not persisted to `globalState`). This controls which view is shown:
- `!sessionActive && !wasEverActive` → `#welcome-screen` (full-height centered start button)
- otherwise → `#main-panel` (the normal composer UI)

When a session stops mid-use (`sessionActive=false`, `wasEverActive=true`), the send button label changes to `"new session"` and clicking it posts `{ type: 'startSession' }`, which starts the session with the current mode and no QuickPick. `{ type: 'newSession' }` still triggers the mode QuickPick flow.

**Focus management.** After dispatching text to the terminal (`handleSend`, `openSlashPicker`, `openModelPicker`), `TerminalSession.focus()` is called — this calls `terminal.show(false)` to steal keyboard focus into the terminal. The existing `sendText()` method calls `terminal.show(true)` (preserve focus) internally; `focus()` is the explicit steal. After a session starts, the webview posts `sessionStatusChanged: true` and `media/main.js` calls `setTimeout(() => input.focus(), 100)` to move focus to the textarea.

---

## File responsibilities (quick ref)

| File | Owns |
|---|---|
| `src/extension.ts` | VSCode activation, command registration |
| `src/types.ts` | All shared types — edit here first when adding features |
| `src/AgyComposerPanel.ts` | Panel state, webview HTML, message dispatch, QuickPick calls |
| `src/TerminalSession.ts` | Terminal create/send/close/focus lifecycle |
| `src/contextComposer.ts` | Pure function — composes chips + message into a string |
| `media/main.js` | Webview UI logic, state mirror, DOM rendering, focus routing |
| `media/main.css` | All styling — VSCode CSS variables only, no hardcoded colours |
| `media/icon.svg` | Activity bar icon — uses `currentColor`, no hardcoded colours |

---

## How to make a change

**Adding a slash command:** edit `SLASH_COMMANDS` in `src/AgyComposerPanel.ts`. No other file needs changing.

**Adding a session mode:** update `SessionMode` in `src/types.ts`, add to `MODE_ITEMS` in `src/AgyComposerPanel.ts`, handle the new flag in `TerminalSession.start()`, and add the `<option>` in `renderHtml()`.

**Changing the message format:** edit `composeMessage()` in `src/contextComposer.ts`. It is a pure function with no side effects.

**Changing the UI layout:** edit `renderHtml()` in `src/AgyComposerPanel.ts` (HTML structure) and `media/main.css` (styles). Do not add hardcoded colours — use `--vscode-*` CSS variables. The HTML has two top-level siblings inside `.panel`: `#welcome-screen` and `#main-panel` — their visibility is toggled by `renderView()` in `media/main.js`.

**Adding a new webview → host message:** add the type to `WebviewMessage` in `src/types.ts`, post it from `media/main.js`, handle it in `AgyComposerPanel.onMessage()`.

**Adding a new host → webview message:** add the type to `HostMessage` in `src/types.ts`, post it via `this.post()` in `AgyComposerPanel`, handle it in the `window.addEventListener('message', ...)` switch in `media/main.js`.

**Changing keyboard shortcuts:** edit `contributes.keybindings` in `package.json`. The `key` field applies to all platforms; use `mac` for a Mac-specific override. The `when` clause controls context (e.g. `editorHasSelection`).

---

## Build and verify

```bash
npm run check-types   # TypeScript type check (no emit)
npm run compile       # esbuild bundle → dist/extension.js
```

Both must pass with zero errors before considering a change complete.

The webview JS (`media/main.js`) has no build step — it runs as-is in the browser context. TypeScript types do not apply to it.

---

## Testing

Open the project in VSCode and press **F5** to launch the Extension Development Host. See [docs/instructions_for_developer.md](docs/instructions_for_developer.md) for full instructions.

There are no automated tests in this project. Verify changes manually in the Extension Development Host.

---

## What not to change

- Do not add `npm` runtime dependencies. The extension uses only Node built-ins (`crypto`, `path`, `child_process`) and the `vscode` API.
- Do not call `acquireVsCodeApi()` more than once in `media/main.js` — VSCode throws if called twice.
- Do not set `border-radius` in `media/main.css` — the boxy aesthetic is intentional.
- Do not add hardcoded colour values to `media/main.css` — all colours must come from `--vscode-*` variables.
- Do not remove the 1500ms delay in `AgyComposerPanel.handleSend()` — it allows `agy` to boot before the first message is sent.
- Do not persist `wasEverActive` to `globalState` — it is intentionally in-memory so the welcome screen reappears on every cold open when no session is running.
