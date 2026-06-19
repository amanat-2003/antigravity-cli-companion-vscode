import * as vscode from 'vscode';
import { AgyComposerPanel } from './AgyComposerPanel';

export function activate(context: vscode.ExtensionContext): void {
  const provider = new AgyComposerPanel(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      AgyComposerPanel.viewId,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agy-composer.openComposer', () => {
      vscode.commands.executeCommand('workbench.view.extension.agy-composer');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agy-composer.addSelection', () => {
      provider.addSelectionChip();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agy-composer.newSession', () => {
      provider.triggerNewSession();
    })
  );
}

export function deactivate(): void {}
