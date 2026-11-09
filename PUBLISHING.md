# Publishing JsonBrowse

This repository currently builds local VSIX packages. No Marketplace publisher or public repository is configured, and these instructions do not publish anything automatically.

## Prepare the identity and listing

Create a publisher through the [Marketplace publisher management page](https://marketplace.visualstudio.com/manage). Replace `publisher: "local"` in `package.json` with its actual ID before building a release.

Keep `name: "jsonbrowse"` and `displayName: "JsonBrowse"`. The installed extension ID is `<publisher>.jsonbrowse`; changing the publisher or name creates a different identity. Confirm availability before the first release.

Once a public repository exists, set `repository` (Git type and actual URL), `homepage`, and `bugs.url` in `package.json`. Do not publish placeholder URLs. Check the MIT copyright attribution in `LICENSE` and add the maintainer's `author` metadata if desired.

The README is the Marketplace overview; keep its features and limitations accurate. `CHANGELOG.md` provides version notes. An optional Marketplace icon must be a PNG, at least 128 × 128 pixels, referenced by `icon` in the manifest; the toolbar's built-in preview icon is separate. See the [extension manifest reference](https://code.visualstudio.com/api/references/extension-manifest).

## Validate and package

Use Node.js 22 or newer and npm. Before subsequent releases, run `npm version patch --no-git-tag-version` (or choose `minor` / `major`) to update both package files. Update the changelog for that version. The first release can use `0.1.0`.

```bash
npm ci
npm test
npx @vscode/vsce ls --no-dependencies
npx @vscode/vsce package --no-dependencies
```

The release command assumes the repository metadata is filled in. For local builds only, add `--allow-missing-repository` as described in the README. Keep the MIT license check enabled.

Review the package list: include the compiled extension, manifest, README, changelog, and license; exclude source, tests, development configuration, and dependencies. Install the resulting VSIX in VS Code and check:

- Both JSON and JSONL open through the toolbar and **Reopen Editor With**.
- The button is hidden for unrelated files and inside JsonBrowse.
- Nested data, long strings, escaped newlines, invalid JSONL records, and light/dark themes display correctly.
- Split groups target the correct file, and unsaved text survives switching viewers.

Uninstall any old `local.jsonl-viewer` installation first. The command ID `jsonlViewer.openViewer` and editor ID `jsonlViewer.viewer` intentionally remain stable for existing shortcuts and associations.

## Publish and verify

In [publisher management](https://marketplace.visualstudio.com/manage), select your publisher, choose **New extension → Visual Studio Code**, and upload the tested VSIX. For later releases, upload the new version to the existing listing.

After processing, inspect the listing's name, README, license, and release notes. Install from the Marketplace in a clean VS Code profile and repeat the basic viewing checks.

For future CI publishing, follow Microsoft's [Trusted Publishing instructions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#secure-automated-publishing-to-visual-studio-marketplace). No publishing workflow or credentials are configured in this repository.
