# AGY Input Composer

![AGY Input Composer Demo](joined_hq.gif)

A fast, safe, and minimal VS Code companion for [Google's Antigravity CLI](https://antigravity.google) (`agy`).

**🔒 Safe & Open Source**: This extension handles **input only**. It never parses or captures `agy`'s output. All command execution and output stays visible directly in your integrated terminal. The code is 100% open source and [available on GitHub](https://github.com/amanat-2003/antigravity-cli-companion-vscode).

## Usage

1. **Open**: Click the hexagon **A** icon in the activity bar or press `Cmd+Alt+G`.
2. **Start**: Choose a mode (Default, Bypass, or Sandbox) to launch an `agy` session.
3. **Context**: Select code in any editor file and press `Alt+G` to attach it as context.
4. **Send**: Type your message and press `Enter`. Focus switches automatically to the terminal.
5. **Commands**: Click the `/` icon to quickly access commands like `/model` or `/planning`.

## Keyboard Shortcuts

| Shortcut | Action (Mac / Windows & Linux) |
|---|---|
| `Cmd+Alt+G` / `Ctrl+Alt+G` | Open AGY Composer panel |
| `Alt+G` | Add current editor selection to context |
| `Enter` | Send message (inside composer) |
| `Shift+Enter` | Insert newline (inside composer) |

## Documentation

For technical details, architecture, and extension developer guidelines, please see the [`docs/`](docs/) folder.

## About the Developer

Developed by Amanat Singh. 

- **GitHub**: [@amanat-2003](https://github.com/amanat-2003)
- **Repository**: Found a bug or have a feature request? Open an issue on the [GitHub repository](https://github.com/amanat-2003/antigravity-cli-companion-vscode).
