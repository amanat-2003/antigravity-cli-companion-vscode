import * as vscode from 'vscode';
import { AgyCompanionPanel } from './AgyCompanionPanel';

export function activate(context: vscode.ExtensionContext): void {
  const provider = new AgyCompanionPanel(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      AgyCompanionPanel.viewId,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agy-companion.openCompanion', () => {
      vscode.commands.executeCommand('workbench.view.extension.agy-companion');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agy-companion.addSelection', () => {
      provider.addSelectionChip();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agy-companion.newSession', () => {
      provider.triggerNewSession();
    })
  );
}

export function deactivate(): void {}
