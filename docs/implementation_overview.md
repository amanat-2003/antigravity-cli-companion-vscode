# Implementation Overview

This document describes the architecture and key flows of the Antigravity CLI Companion - Unofficial extension for developers and AI agents working on the codebase.

---

## What this extension does

It provides a VSCode sidebar panel that composes and sends input to the `agy` CLI running in an integrated terminal. It does **not** capture or display `agy`'s output — that stays in the terminal.

The core mechanism is VSCode's `terminal.sendText(text, true)` API, which is equivalent to typing text in the terminal and pressing Enter.

---

## File map

```
src/
  extension.ts          Entry point. Calls activate(), registers the WebviewViewProvider
                        and three commands (openCompanion, addSelection, newSession).

  types.ts              All shared TypeScript types:
                          ContextChip       — a piece of attached code context
                          SessionMode       — 'default' | 'bypass' | 'sandbox'
                          PanelState        — the full state sent to the webview
                          WebviewMessage    — messages FROM the webview TO the host
                          HostMessage       — messages FROM the host TO the webview

  AgyCompanionPanel.ts   WebviewViewProvider. The central coordinator.
                        Owns: chips[], mode, TerminalSession instance.
                        Renders the webview HTML (with CSP/nonce).
                        Handles all WebviewMessages via onMessage().
                        Opens VSCode QuickPicks (slash commands, mode picker).

  TerminalSession.ts    Manages the lifecycle of the integrated terminal running agy.
                        isActive(): checks terminal is in vscode.window.terminals.
                        start(cliPath, mode): creates terminal, runs agy with flags.
                        sendText(text): sends text to the running session.
                        handleTerminalClose(): called when VSCode fires onDidCloseTerminal.

  contextCompanion.ts    Pure function: composeMessage(message, chips) → string.
                        Prepends chips as a labelled context block if any are present.

media/
  icon.svg              Activity bar icon. Flat hexagon outline with letter A.
                        Uses currentColor — VSCode applies theme colouring automatically.

  index.html            Webview HTML template. Rendered by AgyCompanionPanel.renderHtml().
                        Contains CSP meta tag, stylesheet link, DOM skeleton, script tag.
                        Nonce injected at render time for CSP compliance.

  main.js               Webview JavaScript (vanilla, no build step).
                        Calls acquireVsCodeApi() once (required by VSCode).
                        Maintains local state mirror: { mode, chips, sessionActive }.
                        Renders chips, mode select, send button enabled state.
                        Posts WebviewMessages to the host on user interaction.

  main.css              Styling. All colours use --vscode-* CSS custom properties.
                        Zero hardcoded colours — adapts to any VSCode theme automatically.
                        Zero border-radius — intentionally boxy.
                        Font: var(--vscode-editor-font-family) throughout.
```

---

## Communication: host ↔ webview

The extension host (Node.js) and the webview (sandboxed browser context) cannot share memory. They communicate via `postMessage`.

```
Host → Webview:   webview.webview.postMessage(msg: HostMessage)
Webview → Host:   vscode.postMessage(msg: WebviewMessage)   [acquireVsCodeApi()]
```

**Host sends:**
- `state` — full PanelState on `ready`, after chip add/remove, after send
- `chipAdded` — when a chip is added silently (keyboard shortcut while panel hidden)
- `sessionStatusChanged` — when terminal opens or closes
- `clearAfterSend` — clears textarea and chips in the webview after a successful send

**Webview sends:**
- `ready` — on load; host responds with `state`
- `send` — user clicked Send or pressed Cmd+Enter
- `removeChip` — user clicked × on a chip
- `setMode` — user changed the mode select
- `openSlashPicker` — user clicked /; host opens a VSCode QuickPick
- `openModelPicker` — user clicked model; host sends `/model` to terminal
- `newSession` — user clicked ＋; host opens mode QuickPick and starts terminal

---

## Key flows

### First send (no session running)

```
User clicks Send
  → webview posts { type: 'send', message }
  → AgyCompanionPanel.handleSend()
      → showModePicker() — VSCode QuickPick (Bypass Approvals pre-selected)
      → user picks mode
      → TerminalSession.start(cliPath, mode)
          → vscode.window.createTerminal({ name: 'agy' })
          → terminal.show(true)             ← preserveFocus keeps panel active
          → terminal.sendText("agy [--flag]", true)
      → await 1500ms                        ← wait for agy to boot
      → composeMessage(message, chips)      ← contextCompanion.ts
      → TerminalSession.sendText(composed)
      → chips = []
      → post clearAfterSend + updated state to webview
```

### Subsequent sends (session active)

```
User clicks Send
  → webview posts { type: 'send', message }
  → AgyCompanionPanel.handleSend()
      → TerminalSession.isActive() === true
      → composeMessage(message, chips)
      → TerminalSession.sendText(composed)
      → chips = []
      → post clearAfterSend + updated state
```

### Adding a context chip

```
User selects text → Cmd+Alt+Shift+G (or right-click → Add Selection)
  → command 'agy-companion.addSelection' fires
  → AgyCompanionPanel.addSelectionChip()
      → reads vscode.window.activeTextEditor.selection
      → getText(selection) → label: "filename.ts:12-18"
      → pushes ContextChip to this.chips[]
      → post { type: 'chipAdded', chip } to webview
          (webview is retainContextWhenHidden=true so it receives this even when hidden)
```

### Composed message format

When chips are present:
```
Context:
---
[utils.ts:12-18]:
<selected text>

[api.ts:5]:
<selected text>
---

<user typed message>
```

When no chips: the raw message is sent as-is.

---

## Terminal session lifecycle

`TerminalSession` tracks **one** terminal at a time (the most recently started one).

`isActive()` cross-checks `this.terminal` against `vscode.window.terminals` — this correctly detects terminals closed by the user outside the extension.

When `vscode.window.onDidCloseTerminal` fires, `handleTerminalClose()` clears the reference and fires `onStatusChange(false)` → the host posts `sessionStatusChanged: false` to the webview → mode dropdown re-enables.

**Externally-started terminals are not tracked.** If the user runs `agy` manually in a terminal, `isActive()` returns false. Clicking Send starts a new extension-managed terminal alongside it.

---

## Mode → CLI flag mapping

| SessionMode | CLI behaviour |
|---|---|
| `'default'` | `agy` (no extra flags) |
| `'bypass'` | `agy --dangerously-skip-permissions` |
| `'sandbox'` | `agy --sandbox` |

Mode is a start-time concept. Changing it after a session is started has no effect on the running process — the UI reflects this by disabling the select and showing "restart to apply".

Plan mode (`/planning`) is handled separately as a slash command sent to the running session — it is a toggle and is not a start-time flag.

---

## CSP and nonce

`renderHtml()` generates a fresh 16-byte hex nonce on every call. The Content-Security-Policy meta tag allows:
- `script-src 'nonce-{nonce}'` — only the inline `<script nonce="...">` tag
- `style-src {webview.cspSource} 'unsafe-inline'` — the linked stylesheet + VSCode's own styles

`localResourceRoots` is set to `media/` only — the webview cannot load resources from anywhere else.

---

## Extension state

The extension host holds the canonical state:
- `this.chips: ContextChip[]` — current chips (all cleared on send)
- `this.mode: SessionMode` — selected mode (default: `'bypass'`)

The webview maintains a local mirror of this state for rendering. On any state change the host calls `sendState()` which posts the full `PanelState` to the webview, which re-renders.

There is no persistence (`workspaceState` / `globalState`) — chips are in-memory only and reset on each send or VSCode restart.

---

## Adding new slash commands

Edit the `SLASH_COMMANDS` array in [src/AgyCompanionPanel.ts](../src/AgyCompanionPanel.ts). Each entry is a `vscode.QuickPickItem` with `label` (the slash command) and `description`. The label is sent verbatim to the terminal.

## Adding new modes

1. Add the new value to the `SessionMode` union in [src/types.ts](../src/types.ts)
2. Add a `ModeItem` entry to `MODE_ITEMS` in [src/AgyCompanionPanel.ts](../src/AgyCompanionPanel.ts)
3. Add the flag mapping in `TerminalSession.start()` in [src/TerminalSession.ts](../src/TerminalSession.ts)
4. Add the `<option>` in the `<select>` in `renderHtml()` in [src/AgyCompanionPanel.ts](../src/AgyCompanionPanel.ts)
