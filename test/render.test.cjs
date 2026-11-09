const { test } = require('node:test');
const assert = require('node:assert/strict');
const { renderDocument } = require('../out/render');

test('nested data retains numeric precision, duplicate keys, and empty containers', () => {
  const html = renderDocument('{"id":9007199254740993,"id":1e400,"items":[true,null,{},[]]}', false);
  assert.match(html, /class="number">9007199254740993</);
  assert.match(html, /class="number">1e400</);
  assert.equal((html.match(/class="key">&quot;id&quot;/g) || []).length, 2);
  assert.match(html, /padding-left:4ch.*class="boolean">true</);
  assert.match(html, /padding-left:4ch">\{\},/);
  assert.match(html, /padding-left:4ch">\[\]/);
});

test('newlines display as line breaks while escaped backslashes remain literal', () => {
  const html = renderDocument(JSON.stringify({ text: 'first\nsecond', literal: 'first\\nsecond' }), false);
  assert.ok(html.includes('first\nsecond'));
  assert.ok(html.includes('first\\\\nsecond'));
});

test('untrusted strings and error messages cannot inject HTML', () => {
  for (const source of [JSON.stringify('</span><script>alert(1)</script>'), '<script>']) {
    const html = renderDocument(source, false);
    assert.ok(!html.includes('<script>'));
    assert.ok(html.includes('&lt;'));
  }
});

test('JSONL handles BOM, CRLF, blank lines, scalar records and invalid records independently', () => {
  const html = renderDocument('\uFEFF{}\r\n\r\nbroken\r\n42\r\n"ok"\r\n', true);
  assert.match(html, /Line 3:/);
  assert.match(html, /class="number">42</);
  assert.match(html, /class="string">&quot;ok&quot;</);
  assert.equal((html.match(/<section/g) || []).length, 4);
});

test('JSON rejects malformed or empty input and accepts a BOM', () => {
  assert.match(renderDocument('', false), /role="alert"/);
  assert.match(renderDocument('{"a":}', false), /role="alert"/);
  assert.doesNotMatch(renderDocument('\uFEFF{}', false), /role="alert"/);
});
