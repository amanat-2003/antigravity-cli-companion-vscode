import * as vscode from 'vscode';
import * as crypto from 'crypto';
import * as path from 'path';
import { ContextChip, HostMessage, PanelState, SessionMode, WebviewMessage } from './types';
import { TerminalSession } from './TerminalSession';
import { composeMessage } from './contextComposer';

const SLASH_COMMANDS: vscode.QuickPickItem[] = [
  { label: '/planning',    description: 'Toggle plan mode ON/OFF' },
  { label: '/model',       description: 'Switch model' },
  { label: '/usage',       description: 'View usage statistics' },
  { label: '/quota',       description: 'View quota' },
  { label: '/settings',    description: 'Open settings' },
  { label: '/permissions', description: 'Manage permissions' },
  { label: '/add-dir',     description: 'Add directory to workspace' },
  { label: '/diff',        description: 'View diffs' },
  { label: '/resume',      description: 'Resume a conversation' },
  { label: '/help',        description: 'Show help' },
];

interface ModeItem extends vscode.QuickPickItem {
  mode: SessionMode;
}

const MODE_ITEMS: ModeItem[] = [
  { label: 'Bypass Approvals', description: 'Auto-approve all tool permissions (--dangerously-skip-permissions)', mode: 'bypass' },
  { label: 'Default',          description: 'Standard agy session',                                              mode: 'default' },
  { label: 'Sandbox',          description: 'Run with terminal restrictions (--sandbox)',                         mode: 'sandbox' },
];

export class AgyComposerPanel implements vscode.WebviewViewProvider {
  static readonly viewId = 'agy-composer.panel';

  private view?: vscode.WebviewView;
  private chips: ContextChip[] = [];
  private mode: SessionMode = 'bypass';
  private session: TerminalSession;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.session = new TerminalSession((active) => {
      this.post({ type: 'sessionStatusChanged', active });
    });

    context.subscriptions.push(
      vscode.window.onDidCloseTerminal(t => this.session.handleTerminalClose(t))
    );
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
    };
    webviewView.webview.html = this.renderHtml(webviewView.webview);
    webviewView.webview.onDidReceiveMessage((msg: WebviewMessage) => this.onMessage(msg));
  }

  private onMessage(msg: WebviewMessage): void {
    switch (msg.type) {
      case 'ready':
        this.sendState();
        break;
      case 'send':
        this.handleSend(msg.message);
        break;
      case 'removeChip':
        this.chips = this.chips.filter(c => c.id !== msg.id);
        this.sendState();
        break;
      case 'setMode':
        this.mode = msg.mode;
        break;
      case 'openSlashPicker':
        this.openSlashPicker();
        break;
      case 'openModelPicker':
        if (this.session.isActive()) {
          this.session.sendText('/model');
          this.session.focus();
        } else {
          vscode.window.showWarningMessage('No agy session running. Start a session first by clicking Send.');
        }
        break;
      case 'newSession':
        this.triggerNewSession();
        break;
      case 'startSession':
        this.startSessionOnly();
        break;
    }
  }

  private async handleSend(message: string): Promise<void> {
    if (!message.trim()) return;

    if (!this.session.isActive()) {
      const picked = await this.showModePicker();
      if (!picked) return;
      this.mode = picked;
      this.session.start(this.getCliPath(), this.mode);
      // Wait for agy to boot before sending the first message
      await new Promise<void>(resolve => setTimeout(resolve, 1500));
    }

    const composed = composeMessage(message, this.chips);
    this.session.sendText(composed);
    this.session.focus();

    this.chips = [];
    this.post({ type: 'clearAfterSend' });
    this.post({ type: 'state', state: this.getState() });
  }

  private startSessionOnly(): void {
    this.session.start(this.getCliPath(), this.mode);
  }

  async triggerNewSession(): Promise<void> {
    const picked = await this.showModePicker();
    if (!picked) return;
    this.mode = picked;
    this.session.start(this.getCliPath(), this.mode);
    this.post({ type: 'state', state: this.getState() });
  }

  addSelectionChip(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.selection.isEmpty) return;

    const text = editor.document.getText(editor.selection);
    const fileName = path.basename(editor.document.fileName);
    const start = editor.selection.start.line + 1;
    const end = editor.selection.end.line + 1;
    const label = start === end ? `${fileName}:${start}` : `${fileName}:${start}-${end}`;

    const chip: ContextChip = {
      id: crypto.randomUUID(),
      label,
      text
    };

    this.chips.push(chip);
    this.post({ type: 'chipAdded', chip });
  }

  private async openSlashPicker(): Promise<void> {
    const picked = await vscode.window.showQuickPick(SLASH_COMMANDS, {
      placeHolder: 'Select a slash command to send to agy',
      title: 'AGY Slash Commands'
    });
    if (!picked) return;

    if (!this.session.isActive()) {
      vscode.window.showWarningMessage('No agy session running. Start a session first by clicking Send.');
      return;
    }
    this.session.sendText(picked.label);
    this.session.focus();
  }

  private async showModePicker(): Promise<SessionMode | undefined> {
    const picked = await vscode.window.showQuickPick(MODE_ITEMS, {
      placeHolder: 'Select mode to launch agy',
      title: 'Launch AGY Session'
    });
    return picked?.mode;
  }

  private sendState(): void {
    this.post({ type: 'state', state: this.getState() });
  }

  private getState(): PanelState {
    return {
      mode: this.mode,
      chips: this.chips,
      sessionActive: this.session.isActive()
    };
  }

  private post(msg: HostMessage): void {
    this.view?.webview.postMessage(msg);
  }

  private getCliPath(): string {
    return vscode.workspace.getConfiguration('agy-composer').get<string>('cliPath') ?? 'agy';
  }

  private renderHtml(webview: vscode.Webview): string {
    const nonce = crypto.randomBytes(16).toString('hex');
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'media', 'main.css')
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'media', 'main.js')
    );
    const csp = [
      `default-src 'none'`,
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `script-src 'nonce-${nonce}'`
    ].join('; ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="${csp}" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="${styleUri}" rel="stylesheet" />
</head>
<body>
  <div class="panel">

    <div id="welcome-screen" class="welcome-screen" style="display:none">
      <span class="welcome-title">AGY</span>
      <p class="welcome-text">No active Antigravity session</p>
      <button id="btn-start-session" class="welcome-btn">Start a new Antigravity session</button>
    </div>

    <div id="main-panel" class="main-panel" style="display:none">
      <header class="header">
        <span class="header__title">AGY</span>
        <button id="btn-new-session" class="icon-btn" title="New session">＋</button>
      </header>

      <div id="chips-area" class="chips-area"></div>

      <div class="field">
        <textarea
          id="input"
          placeholder="type your message...&#10;&#10;Enter → send   ·   Shift+Enter → new line&#10;&#10;Please wait for Antigravity CLI to Sign In before sending your 1st mesage."
          rows="5"
          spellcheck="false"
        ></textarea>
      </div>

      <div class="action-bar">
        <button id="btn-slash" class="action-btn" title="Slash commands">/</button>
        <button id="btn-model" class="action-btn" title="Switch model (opens agy model picker)">model</button>
        <div class="mode-wrapper">
          <select id="mode-select" class="mode-select" title="Session mode (applies on next launch)">
            <option value="bypass">bypass</option>
            <option value="default">default</option>
            <option value="sandbox">sandbox</option>
          </select>
          <button id="btn-restart" class="action-btn" title="Restart session to apply mode change" hidden>↺</button>
        </div>
        <button id="btn-send" class="send-btn" disabled title="Send (Enter)">→</button>
      </div>
    </div>

  </div>

  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}
