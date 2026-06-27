# AGY Input Composer

![AGY Input Composer Demo](joined_hq.gif)

A fast, safe, and minimal VS Code companion for [Google's Antigravity CLI](https://antigravity.google) (`agy`).

**🔒 Safe & Open Source**: This extension handles **input only**. It never parses or captures `agy`'s output. All command execution and output stays visible directly in your integrated terminal. The code is 100% open source and [available on GitHub](https://github.com/amanat-2003/antigravity-cli-companion-vscode).

## Why I built this

- **The Ecosystem**: In India, Jio users get Gemini Advanced (Gemini Pro) included with their recharges, making it virtually free to use Google Antigravity. However, using Antigravity natively requires switching away from VS Code, which is the default editor for most.
- **Efficiency over UI**: The Antigravity CLI uses significantly fewer tokens compared to the Agent UI, making it highly efficient. 
- **Lack of Existing Tools**: I searched the Marketplace but only found the deprecated "Gemini CLI Companion" (since Gemini CLI was replaced by Antigravity CLI). Other available tools were either untrustworthy or had broken functionality. I needed something robust, so I built this and tested every single edge case.
- **Solving CLI Pain Points**: Typing long prompts, managing new lines, and switching modes (Bypass, Sandbox) in a terminal is frustrating. The biggest hurdle was code context—copying and pasting code into the terminal breaks flow. This extension solves that by letting you select code and press `Alt+G` to instantly add it as a context chip.
- **Resilience & UX**: I designed the UI to be clean, boxy, and robotic, optimized for low latency. If you accidentally close the terminal, the extension gracefully recovers by auto-starting a new session on your next message.

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
