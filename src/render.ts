function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]!);
}

function renderJson(source: string): string {
  JSON.parse(source); // Validate, but retain original tokens (including large numbers).
  const tokens = source.match(/"(?:\\[\s\S]|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\],:]/g)!;
  const rows: string[] = [];
  let depth = 0;
  let row = '';
  const flush = () => {
    if (row) rows.push(`<div class="line" style="padding-left:${depth * 2}ch">${row}</div>`);
    row = '';
  };
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (token === '{' || token === '[') {
      row += token;
      if (tokens[index + 1] === (token === '{' ? '}' : ']')) {
        row += tokens[++index];
      } else {
        flush();
        depth++;
      }
    } else if (token === '}' || token === ']') {
      flush();
      depth--;
      row += token;
    } else if (token === ',') {
      row += ',';
      flush();
    } else if (token === ':') {
      row += ': ';
    } else {
      const kind = token.startsWith('"')
        ? (tokens[index + 1] === ':' ? 'key' : 'string')
        : token === 'null' ? 'null' : /^(true|false)$/.test(token) ? 'boolean' : 'number';
      // Match whole escape sequences so a literal \\n stays literal.
      const display = kind === 'string'
        ? token.replace(/\\(?:u[\da-fA-F]{4}|[\s\S])/g, escape => escape === '\\n' ? '\n' : escape)
        : token;
      row += `<span class="${kind}">${escapeHtml(display)}</span>`;
    }
  }
  flush();
  return rows.join('\n');
}

export function renderDocument(text: string, jsonl: boolean): string {
  const source = text.replace(/^\uFEFF/, '');
  const render = (value: string, line?: number) => {
    try {
      return `<section>${renderJson(value)}</section>`;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return `<section class="error" role="alert">${line ? `Line ${line}: ` : ''}${escapeHtml(message)}</section>`;
    }
  };
  const content = jsonl
    ? source.split(/\r?\n/).map((value, index) => value.trim() ? render(value, index + 1) : '').join('')
    : render(source);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
<title>JsonBrowse</title>
<style>
body { padding: 12px 20px; color: var(--vscode-editor-foreground); background: var(--vscode-editor-background); font-family: var(--vscode-editor-font-family, monospace); font-size: var(--vscode-editor-font-size, 14px); font-weight: var(--vscode-editor-font-weight, normal); line-height: 1.5; }
section { margin: 0 0 1em; }
.line, .error { white-space: pre-wrap; overflow-wrap: anywhere; }
.key { color: #9cdcfe; }
.string { color: #ce9178; }
.number { color: #b5cea8; }
.boolean { color: #569cd6; }
.null { color: #c586c0; }
.vscode-light .key { color: #0451a5; }
.vscode-light .string { color: #a31515; }
.vscode-light .number { color: #098658; }
.vscode-light .boolean { color: #0000ff; }
.vscode-light .null { color: #800080; }
.error { color: var(--vscode-errorForeground); }
.vscode-high-contrast .key, .vscode-high-contrast-light .key { color: var(--vscode-textLink-foreground); }
.vscode-high-contrast span:not(.key), .vscode-high-contrast-light span:not(.key) { color: var(--vscode-editor-foreground); }
</style>
</head>
<body><main aria-label="JsonBrowse">${content}</main></body>
</html>`;
}
