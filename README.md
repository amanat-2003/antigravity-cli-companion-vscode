# AGY Input Composer

![AGY Input Composer Demo](joined_hq.gif)

A VSCode extension for composing and sending input to [Google's Antigravity CLI](https://antigravity.google) (`agy`) from a sidebar panel.

The extension handles **input only** — all output stays in the terminal where `agy` runs. The goal is to make it faster to compose messages, attach code context, and switch modes without leaving your editor.

---

## Features

- **Welcome screen** — opening the panel without a running session shows a single centered button; the full composer appears only after a session starts
- **Sidebar panel** — AGY icon in the activity bar opens a clean, minimal composer
- **Context chips** — select code in the editor and attach it as context to your next message; the chips area is always visible with a hint when empty; chips clear after each send
- **Mode selector** — choose Default, Bypass Approvals, or Sandbox before launching a session; a ↺ button appears when a session is active to restart with a new mode
- **Model picker** — one click sends `/model` to the running terminal and shifts focus there
- **Slash commands** — quick-pick menu for `/planning`, `/usage`, `/quota`, `/settings`, and more; terminal focus shifts automatically after selection
- **Session lifecycle** — when a session stops mid-use the send button becomes a "new session" button that restarts with the current mode (no picker); the ＋ button always starts fresh with a mode picker
- **Smart focus routing** — terminal gets focus after send/slash/model; textarea gets focus after starting a new session or changing mode
- **Keyboard shortcuts** — open the composer, add selections, and send without touching the mouse

---

## Requirements

- [Antigravity CLI](https://antigravity.google/cli/install) (`agy`) installed and available on PATH
- VSCode 1.90 or later

---

## Usage

### Open the composer
Click the hexagon **A** icon in the activity bar, or press `Cmd+Alt+G` (mac) / `Ctrl+Alt+G` (windows/linux).

### Start a session
If no session is running the panel shows a centered **Start a new Antigravity session** button. Click it to choose a mode and launch `agy`. The full composer appears once the session is active.

### Attach code context
1. Select text or code in any editor file
2. Right-click → **Add Selection to AGY Context**, or press `Alt+G`
3. A chip appears above the message box showing the file and line range
4. Click `×` on any chip to remove it before sending

### Send a message
1. Type your message in the text area
2. Press `Enter` to send, or click **→**
3. Use `Shift+Enter` to insert a newline instead of sending
4. After sending, focus moves to the terminal so you can interact with `agy` directly

### Compose multi-line messages
Press `Shift+Enter` inside the textarea to insert a newline. Press `Enter` alone to send.

### Session stopped mid-use
If `agy` exits or the terminal is closed while the composer has content:
- The send button changes to **new session**
- Click it (or press `Enter`) to restart `agy` with the currently selected mode — no mode picker
- Your typed text and context chips are preserved; send when ready

### Switch mode
Use the mode dropdown in the action bar:
- **bypass** — `--dangerously-skip-permissions` (auto-approves all tool requests)
- **default** — standard `agy` session
- **sandbox** — `--sandbox` (restricted terminal execution)

While a session is active the dropdown is locked. A **↺** button appears next to it — click it to start a new session in a different mode (opens the mode picker).

### Slash commands
Click **/** in the action bar to open a quick-pick with available slash commands. After selection the command is sent and the terminal gets focus.

| Command | Effect |
|---|---|
| `/planning` | Toggle plan mode ON/OFF (persistent for session) |
| `/model` | Open `agy`'s model picker |
| `/usage` | View usage statistics |
| `/quota` | View quota |
| `/settings` | Open `agy` settings |
| `/permissions` | Manage permission rules |
| `/add-dir` | Add a directory to workspace |
| `/diff` | View diffs |
| `/resume` | Resume a previous conversation |
| `/help` | Show `agy` help |

---

## Configuration

| Setting | Default | Description |
|---|---|---|
| `agy-composer.cliPath` | `"agy"` | Path to the `agy` binary. Use an absolute path if `agy` is not on your shell's PATH. |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+Alt+G` | Open AGY Composer panel |
| `Alt+G` | Add current editor selection to context |
| `Enter` | Send message (inside composer textarea) |
| `Shift+Enter` | Insert newline (inside composer textarea) |

`Cmd+Alt+G` → `Ctrl+Alt+G` on Windows/Linux. `Alt+G` is the same on all platforms.

---

## How it works

The extension runs `agy` in a VSCode integrated terminal and uses `terminal.sendText()` to send composed input. It does not parse or capture `agy`'s output — everything is visible directly in the terminal.

Opening the panel without a running `agy` session shows a welcome screen with a single start button. Once clicked, a mode picker appears and `agy` is launched. After each send, terminal focus shifts automatically so you can read `agy`'s response and interact if needed. When you're ready to send another message, click back into the sidebar or start a new session.

See [docs/implementation_overview.md](docs/implementation_overview.md) for technical details.
