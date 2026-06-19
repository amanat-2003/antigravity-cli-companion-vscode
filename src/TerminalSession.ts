import * as vscode from 'vscode';
import { SessionMode } from './types';

export class TerminalSession {
  private terminal: vscode.Terminal | undefined;

  constructor(private readonly onStatusChange: (active: boolean) => void) {}

  isActive(): boolean {
    return !!this.terminal && vscode.window.terminals.includes(this.terminal);
  }

  start(cliPath: string, mode: SessionMode): void {
    this.terminal = vscode.window.createTerminal({ name: 'agy' });
    this.terminal.show(true);

    let cmd = cliPath;
    if (mode === 'bypass') {
      cmd += ' --dangerously-skip-permissions';
    } else if (mode === 'sandbox') {
      cmd += ' --sandbox';
    }

    this.terminal.sendText(cmd, true);
    this.onStatusChange(true);
  }

  sendText(text: string): void {
    if (!this.isActive()) return;
    this.terminal!.show(true);
    this.terminal!.sendText(text, true);
  }

  focus(): void {
    this.terminal?.show(false);
  }

  handleTerminalClose(terminal: vscode.Terminal): void {
    if (terminal === this.terminal) {
      this.terminal = undefined;
      this.onStatusChange(false);
    }
  }

  dispose(): void {
    this.terminal = undefined;
  }
}
