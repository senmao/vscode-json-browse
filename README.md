# JsonBrowse

A lightweight, read-only JSON and JSONL viewer for Visual Studio Code. Browse nested data with colored keys and values, automatic line wrapping, and readable multiline strings.

## Features

- Indented objects and arrays with distinct colors for keys, strings, numbers, booleans, and nulls.
- Long values wrap to the editor panel width, including text without spaces.
- Escaped `\n` inside string values appears as a real line break; literal `\\n` remains literal.
- JSONL records display separately. Invalid records show their source line number without hiding valid records; blank lines are ignored.
- Numbers retain their original text, including large integers, and duplicate object keys remain visible.
- One-click access from the editor toolbar, with no runtime dependencies.

## Usage

Requires VS Code **1.85.0 or newer**.

1. Open a `.json` or `.jsonl` file.
2. Click the preview icon near **Split Editor** in the top-right editor toolbar. Its tooltip is **Open in JsonBrowse**.
3. Alternatively, run **Open in JsonBrowse** from the Command Palette, or right-click the editor tab and select **Reopen Editor With… → JsonBrowse**.

To return to source text, use **Reopen Editor With… → Text Editor**. To make JsonBrowse your default, choose **Configure default editor** in that menu. Installing JsonBrowse does not change your default editor automatically.

## Display behavior and limits

JsonBrowse is a viewer: it does not edit or reformat the source file. Wrapping is always enabled, independently of `editor.wordWrap`. Multiline string display is intended for reading, so copied rendered text is not necessarily valid JSON.

Input must be strict JSON or JSONL; comments and trailing commas are not supported. A JSONL record must fit on one source line, with newlines inside strings escaped. Files are rendered fully in memory, so very large files may be slow. There are no extension-specific settings.

File content is rendered locally. The extension has no telemetry or network requests, and its viewer runs no scripts.

## Build and install a VSIX

Use Node.js 22 or newer and npm. From the repository directory:

```bash
npm ci
npm test
npx @vscode/vsce package --no-dependencies --allow-missing-repository
```

Packaging compiles the extension automatically and produces `jsonbrowse-0.1.0.vsix` (the filename follows the version in `package.json`). `--no-dependencies` is appropriate because JsonBrowse has no runtime dependencies. The `local` publisher is for local builds; no Marketplace account is needed to install a VSIX.

In VS Code, press **Ctrl+Shift+P**, run **Extensions: Install from VSIX…**, select the package, and reload if prompted.

### Building in WSL for Windows VS Code

Build using the commands above in WSL, then select the generated VSIX in Windows VS Code. `/mnt/c/` in WSL maps to `C:\` in Windows. For example, a package built in `/mnt/c/projects/JsonBrowse` is available at `C:\projects\JsonBrowse\jsonbrowse-0.1.0.vsix`; no copying is necessary. The extension has no native binaries and the same package works on Windows.

If you installed the earlier **JSON/JSONL Viewer** package (`local.jsonl-viewer`), uninstall it before installing JsonBrowse (`local.jsonbrowse`) to avoid duplicate commands. Existing editor associations still use the same editor ID.

## Development

Run `npm ci`, then press **F5** to open an Extension Development Host. Open a JSON or JSONL file there and select JsonBrowse. `npm run watch` recompiles changes; `npm test` compiles and runs the rendering tests. Manually check the toolbar button, split editor groups, and unsaved text in the development host.

Release preparation and Marketplace upload instructions are in `PUBLISHING.md` in the source repository. Release notes are in `CHANGELOG.md`.

## License

MIT. See `LICENSE` for the full license text.
