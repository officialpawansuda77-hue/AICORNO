import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import MarkdownContent from '../src/components/ui/MarkdownContent';

test('renders blocks independently when markdown lines are not separated by blank lines', () => {
  const html = renderToStaticMarkup(
    <MarkdownContent
      content={'## Heading\nA paragraph follows immediately.\n- first item\n- second item\n1. first step\n2. second step'}
    />
  );

  assert.match(html, /<h2[^>]*>Heading<\/h2>/);
  assert.match(html, /<p[^>]*>A paragraph follows immediately\.<\/p>/);
  assert.equal((html.match(/<ul/g) ?? []).length, 1);
  assert.equal((html.match(/<ol/g) ?? []).length, 1);
  assert.match(html, />first item/);
  assert.match(html, />first step<\/li>/);
});

test('renders inline markdown and fenced code as escaped React content', () => {
  const html = renderToStaticMarkup(
    <MarkdownContent
      content={'**bold** *emphasis* `code`\n\n```ts\nconst value = "<safe>";\n```'}
    />
  );

  assert.match(html, /<strong[^>]*>bold<\/strong>/);
  assert.match(html, /<em[^>]*>emphasis<\/em>/);
  assert.match(html, /<code[^>]*>code<\/code>/);
  assert.match(html, /<pre[^>]*><code[^>]*>const value = &quot;&lt;safe&gt;&quot;;<\/code><\/pre>/);
});

test('allows safe links and drops javascript and data link destinations', () => {
  const html = renderToStaticMarkup(
    <MarkdownContent
      content={'[safe](https://example.com) [bad](JaVaScRiPt:alert(1)) [also bad](data:text/html,payload) <script>alert(1)</script>'}
    />
  );

  assert.match(html, /<a[^>]+href="https:\/\/example\.com"[^>]*>safe<\/a>/);
  assert.doesNotMatch(html, /javascript:|data:text/i);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});
