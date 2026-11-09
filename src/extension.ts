import * as vscode from 'vscode';
import { renderDocument } from './render';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(vscode.commands.registerCommand(
    'jsonlViewer.openViewer',
    async (resource?: vscode.Uri) => {
      const uri = resource ?? vscode.window.activeTextEditor?.document.uri;
      if (!uri || !/\.jsonl?$/i.test(uri.path)) return;

      const groups = vscode.window.tabGroups;
      const group = [groups.activeTabGroup, ...groups.all].find(group => {
        const input = group.activeTab?.input;
        return input instanceof vscode.TabInputText && input.uri.toString() === uri.toString();
      });
      try {
        await vscode.commands.executeCommand('vscode.openWith', uri, 'jsonlViewer.viewer', {
          viewColumn: group?.viewColumn ?? vscode.ViewColumn.Active
        });
      } catch (error) {
        void vscode.window.showErrorMessage(`Could not open JsonBrowse: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  ));

  // Use VS Code's text model so external changes and unsaved text stay in sync.
  // The webview itself is entirely read-only and runs no scripts.
  context.subscriptions.push(vscode.window.registerCustomEditorProvider(
    'jsonlViewer.viewer',
    new class implements vscode.CustomTextEditorProvider {
      resolveCustomTextEditor(document: vscode.TextDocument, panel: vscode.WebviewPanel): void {
        panel.webview.options = { enableScripts: false, localResourceRoots: [] };
        const update = () => {
          panel.webview.html = renderDocument(
            document.getText(), /\.jsonl$/i.test(document.uri.path)
          );
        };
        const subscription = vscode.workspace.onDidChangeTextDocument(event => {
          if (event.document === document) update();
        });
        panel.onDidDispose(() => subscription.dispose());
        update();
      }
    }(),
    { supportsMultipleEditorsPerDocument: true }
  ));
}
