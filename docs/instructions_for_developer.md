# Developer Instructions

## Prerequisites

- Node.js 18+ (project was built on v24)
- npm 9+
- VSCode 1.90+
- `agy` CLI installed: `which agy` should resolve

---

## Project setup

```bash
git clone <repo-url>
cd agy-cli
npm install
```

---

## Testing locally (F5 — recommended during development)

This is the fastest iteration loop. No packaging needed.

1. Open the project folder in VSCode:
   ```bash
   code /path/to/agy-cli
   ```
2. Press **F5** (or **Run → Start Debugging**).
   VSCode compiles the extension and opens a second **Extension Development Host** window.
3. In the Extension Development Host window, look for the hexagon `A` icon in the activity bar.
4. Make code changes → press **Cmd+Shift+F5** to recompile and reload.

> If the icon doesn't appear, open the Command Palette (`Cmd+Shift+P`) and run **Developer: Reload Window**.

### Watch mode (auto-recompile on save)

In a terminal, run:
```bash
npm run watch
```
Then use `Cmd+R` in the Extension Development Host to reload after each rebuild.

### Type checking

```bash
npm run check-types
```

---

## Building

```bash
# Development build (with source maps)
npm run compile

# Production build (minified, no source maps)
npm run package
```

Output: `dist/extension.js`

---

## Installing locally as a persistent extension

This installs the extension into your main VSCode so it loads on every startup.

```bash
# Install the vsce packaging tool (once)
npm install -g @vscode/vsce

# Package into a .vsix file
vsce package --no-dependencies

# Install into VSCode
code --install-extension agy-input-composer-0.1.0.vsix
```

Reload VSCode after installing. To uninstall:
```bash
code --uninstall-extension amanat-singh.agy-input-composer
```

---

## Publishing to the VSCode Marketplace

### One-time setup

1. Create a **publisher account** at https://marketplace.visualstudio.com/manage
   Sign in with a Microsoft account, then create a publisher ID.

2. Update `package.json`:
   ```json
   "publisher": "<your-publisher-id>"
   ```

3. Generate a **Personal Access Token (PAT)**:
   - Go to https://dev.azure.com → User Settings → Personal Access Tokens
   - New Token → Scopes: **Marketplace → Manage** (full access)
   - Copy the token (shown once)

4. Add a `README.md` to the project root — the marketplace requires it.
   The existing [README.md](../README.md) already covers this.

5. Add a `CHANGELOG.md` (optional but recommended).

### Publishing

```bash
# Login (enter PAT when prompted)
vsce login <your-publisher-id>

# Publish (bumps patch version, packages, uploads)
vsce publish

# Or publish a specific version
vsce publish 1.0.0

# Publish a pre-release
vsce publish --pre-release
```

The extension will be live at:
`https://marketplace.visualstudio.com/items?itemName=<your-publisher-id>.agy-input-composer`

### Updating an existing publication

```bash
# Bump patch version (0.1.0 → 0.1.1) and publish
vsce publish patch

# Bump minor version (0.1.0 → 0.2.0) and publish
vsce publish minor
```

---

## Common issues

| Problem | Fix |
|---|---|
| Icon not showing in activity bar | Reload the Extension Development Host window |
| `agy: command not found` in terminal | Set `agy-composer.cliPath` to the absolute path of the `agy` binary |
| Panel blank after reload | Open the Command Palette → **Developer: Reload Webviews** |
| `vsce package` fails | Ensure `README.md` exists and `publisher` is set in `package.json` |
