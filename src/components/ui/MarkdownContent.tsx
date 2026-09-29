import type { ReactNode } from 'react';

type ListKind = 'ordered' | 'unordered';

type MarkdownBlock =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; lines: string[] }
  | { type: 'list'; kind: ListKind; items: string[] }
  | { type: 'code'; language?: string; value: string };

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

const HEADING_CLASSES = [
  'text-3xl sm:text-4xl font-black text-[#101010] pt-6 pb-2 border-b border-[#E8E4DA]',
  'text-2xl sm:text-3xl font-black text-[#101010] pt-6 pb-2 border-b border-[#E8E4DA]',
  'text-xl font-extrabold text-[#101010] pt-4',
  'text-lg font-extrabold text-[#101010] pt-3',
  'text-base font-extrabold text-[#101010] pt-3',
  'text-base font-bold text-[#101010] pt-2',
];

function parseHeading(line: string): MarkdownBlock | null {
  const match = line.match(/^\s{0,3}(#{1,6})(?:[ \t]+(.*?)[ \t]*|[ \t]*)$/);
  if (!match) {
    return null;
  }

  const text = (match[2] ?? '').replace(/[ \t]+#+[ \t]*$/, '').trim();
  return { type: 'heading', level: match[1].length, text };
}

function parseFenceStart(line: string): { language?: string } | null {
  const match = line.match(/^\s{0,3}```(?:[ \t]*([^\s`]+))?[ \t]*$/);
  return match ? { language: match[1] } : null;
}

function isFenceEnd(line: string): boolean {
  return /^\s{0,3}```[ \t]*$/.test(line);
}

function parseListItem(line: string): { kind: ListKind; text: string } | null {
  const unordered = line.match(/^\s{0,3}[-+*][ \t]+(.*)$/);
  if (unordered) {
    return { kind: 'unordered', text: unordered[1] };
  }

  const ordered = line.match(/^\s{0,3}\d+[.)][ \t]+(.*)$/);
  if (ordered) {
    return { kind: 'ordered', text: ordered[1] };
  }

  return null;
}

function isBlockStart(line: string): boolean {
  return Boolean(parseHeading(line) || parseFenceStart(line) || parseListItem(line));
}

function parseBlocks(content: string): MarkdownBlock[] {
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = parseFenceStart(line);
    if (fence) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !isFenceEnd(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) {
        index += 1;
      }
      blocks.push({ type: 'code', language: fence.language, value: codeLines.join('\n') });
      continue;
    }

    const heading = parseHeading(line);
    if (heading) {
      blocks.push(heading);
      index += 1;
      continue;
    }

    const firstListItem = parseListItem(line);
    if (firstListItem) {
      const items = [firstListItem.text];
      const kind = firstListItem.kind;
      index += 1;

      while (index < lines.length) {
        const nextLine = lines[index];
        const nextItem = parseListItem(nextLine);

        if (nextItem?.kind === kind) {
          items.push(nextItem.text);
          index += 1;
          continue;
        }

        // A blank line may separate items in the same list. It does not
        // make a following paragraph part of that list.
        if (!nextLine.trim()) {
          let lookahead = index + 1;
          while (lookahead < lines.length && !lines[lookahead].trim()) {
            lookahead += 1;
          }
          const lookaheadItem = lines[lookahead] ? parseListItem(lines[lookahead]) : null;
          if (lookaheadItem?.kind === kind) {
            index = lookahead;
            continue;
          }
        }

        // Preserve simple wrapped list-item lines without swallowing a new
        // block that happens to follow the list.
        if (
          nextLine.trim() &&
          /^(?:[ \t]{2,}|\t)/.test(nextLine) &&
          !isBlockStart(nextLine)
        ) {
          items[items.length - 1] += `\n${nextLine.trim()}`;
          index += 1;
          continue;
        }

        break;
      }

      blocks.push({ type: 'list', kind, items });
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
      paragraphLines.push(lines[index]);
      index += 1;
    }
    blocks.push({ type: 'paragraph', lines: paragraphLines });
  }

  return blocks;
}

function findClosingMarker(text: string, start: number, marker: string): number {
  let index = start;
  while (index < text.length) {
    const found = text.indexOf(marker, index);
    if (found < 0) {
      return -1;
    }
    if (found === 0 || text[found - 1] !== '\\') {
      return found;
    }
    index = found + marker.length;
  }
  return -1;
}

function findClosingBracket(text: string, start: number): number {
  let depth = 0;
  for (let index = start; index < text.length; index += 1) {
    if (text[index] === '\\') {
      index += 1;
      continue;
    }
    if (text[index] === '[') {
      depth += 1;
    } else if (text[index] === ']') {
      if (depth === 0) {
        return index;
      }
      depth -= 1;
    }
  }
  return -1;
}

function findClosingParenthesis(text: string, start: number): number {
  let depth = 0;
  for (let index = start; index < text.length; index += 1) {
    if (text[index] === '\\') {
      index += 1;
      continue;
    }
    if (text[index] === '(') {
      depth += 1;
    } else if (text[index] === ')') {
      if (depth === 0) {
        return index;
      }
      depth -= 1;
    }
  }
  return -1;
}

function decodeForProtocolCheck(value: string): string {
  let decoded = value;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) {
        break;
      }
      decoded = next;
    } catch {
      break;
    }
  }
  return decoded;
}

function isSafeHref(value: string): boolean {
  const href = value.trim();
  if (!href) {
    return false;
  }

  const normalized = decodeForProtocolCheck(href)
    .replace(/[\u0000-\u0020\u007f-\u009f]/g, '')
    .toLowerCase();
  if (/^(?:javascript|data):/.test(normalized)) {
    return false;
  }

  try {
    const protocol = new URL(href, 'https://aicorn.design').protocol.toLowerCase();
    return protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:';
  } catch {
    return false;
  }
}

function extractHref(rawTarget: string): string | null {
  const target = rawTarget.trim();
  if (!target) {
    return null;
  }

  if (target.startsWith('<') && target.endsWith('>')) {
    return target.slice(1, -1).trim() || null;
  }

  return target.split(/[ \t]+/, 1)[0] || null;
}

function isWordCharacter(value: string | undefined): boolean {
  return Boolean(value && /[\p{L}\p{N}_]/u.test(value));
}

function canOpenUnderscore(text: string, index: number): boolean {
  return !isWordCharacter(text[index - 1]);
}

function canCloseUnderscore(text: string, index: number): boolean {
  return !isWordCharacter(text[index + 1]);
}

function renderInline(text: string, keyPrefix = 'inline'): ReactNode[] {
  const parts: ReactNode[] = [];
  let textStart = 0;
  let index = 0;
  let tokenIndex = 0;

  const pushText = (end: number) => {
    if (end > textStart) {
      parts.push(text.slice(textStart, end));
    }
  };

  while (index < text.length) {
    // Code spans are handled before any other inline syntax so their content
    // is always rendered literally.
    if (text[index] === '`') {
      let runLength = 1;
      while (text[index + runLength] === '`') {
        runLength += 1;
      }
      const marker = '`'.repeat(runLength);
      const close = text.indexOf(marker, index + runLength);
      if (close > index + runLength) {
        pushText(index);
        parts.push(
          <code
            key={`${keyPrefix}-${tokenIndex}`}
            className="px-1.5 py-0.5 rounded bg-[#F7F4EE] border border-[#E8E4DA] text-xs font-mono text-[#101010]"
          >
            {text.slice(index + runLength, close)}
          </code>
        );
        tokenIndex += 1;
        index = close + runLength;
        textStart = index;
        continue;
      }
    }

    if (text[index] === '[' && (index === 0 || text[index - 1] !== '!')) {
      const closeBracket = findClosingBracket(text, index + 1);
      if (closeBracket > index && text[closeBracket + 1] === '(') {
        const closeParenthesis = findClosingParenthesis(text, closeBracket + 2);
        if (closeParenthesis > closeBracket + 2) {
          pushText(index);
          const label = text.slice(index + 1, closeBracket);
          const href = extractHref(text.slice(closeBracket + 2, closeParenthesis));
          const labelContent = renderInline(label, `${keyPrefix}-${tokenIndex}-label`);
          if (href && isSafeHref(href)) {
            parts.push(
              <a
                key={`${keyPrefix}-${tokenIndex}`}
                href={href}
                className="text-[#101010] underline font-bold hover:text-[#FF4B26]"
              >
                {labelContent}
              </a>
            );
          } else {
            parts.push(...labelContent);
          }
          tokenIndex += 1;
          index = closeParenthesis + 1;
          textStart = index;
          continue;
        }
      }
    }

    const marker = text.startsWith('**', index)
      ? '**'
      : text.startsWith('__', index) && canOpenUnderscore(text, index)
        ? '__'
        : null;
    if (marker) {
      const close = findClosingMarker(text, index + marker.length, marker);
      if (close > index + marker.length) {
        pushText(index);
        parts.push(
          <strong key={`${keyPrefix}-${tokenIndex}`} className="font-extrabold text-[#101010]">
            {renderInline(text.slice(index + marker.length, close), `${keyPrefix}-${tokenIndex}-strong`)}
          </strong>
        );
        tokenIndex += 1;
        index = close + marker.length;
        textStart = index;
        continue;
      }
    }

    const emphasisMarker = text[index] === '*' ? '*' : text[index] === '_' && canOpenUnderscore(text, index) ? '_' : null;
    if (emphasisMarker) {
      const close = findClosingMarker(text, index + 1, emphasisMarker);
      if (close > index + 1 && (emphasisMarker !== '_' || canCloseUnderscore(text, close))) {
        pushText(index);
        parts.push(
          <em key={`${keyPrefix}-${tokenIndex}`} className="italic text-[#1A1A1A]">
            {renderInline(text.slice(index + 1, close), `${keyPrefix}-${tokenIndex}-em`)}
          </em>
        );
        tokenIndex += 1;
        index = close + 1;
        textStart = index;
        continue;
      }
    }

    index += 1;
  }

  pushText(text.length);
  return parts;
}

function renderBlock(block: MarkdownBlock, index: number): ReactNode {
  if (block.type === 'heading') {
    const HeadingTag = HEADING_TAGS[block.level - 1];
    return (
      <HeadingTag key={`heading-${index}`} className={HEADING_CLASSES[block.level - 1]}>
        {renderInline(block.text, `heading-${index}`)}
      </HeadingTag>
    );
  }

  if (block.type === 'code') {
    return (
      <pre
        key={`code-${index}`}
        className="p-4 rounded-2xl bg-[#101010] text-[#D8F651] font-mono text-xs overflow-x-auto leading-relaxed my-4"
      >
        <code className={block.language ? `language-${block.language}` : undefined}>{block.value}</code>
      </pre>
    );
  }

  if (block.type === 'list') {
    if (block.kind === 'ordered') {
      return (
        <ol key={`list-${index}`} className="space-y-2.5 my-4 pl-4 list-decimal list-inside">
          {block.items.map((item, itemIndex) => (
            <li key={`item-${itemIndex}`} className="text-[#1A1A1A]/90">
              {renderInline(item, `list-${index}-${itemIndex}`)}
            </li>
          ))}
        </ol>
      );
    }

    return (
      <ul key={`list-${index}`} className="space-y-2.5 my-4 pl-4">
        {block.items.map((item, itemIndex) => (
          <li key={`item-${itemIndex}`} className="flex items-start gap-2.5 text-[#1A1A1A]/90">
            <span className="w-1.5 h-1.5 rounded-full bg-[#101010] mt-2 shrink-0" />
            <span>{renderInline(item, `list-${index}-${itemIndex}`)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p key={`paragraph-${index}`} className="text-[#1A1A1A]/85 leading-relaxed font-normal">
      {renderInline(block.lines.join('\n'), `paragraph-${index}`)}
    </p>
  );
}

export function renderMarkdown(content: string): ReactNode[] {
  return parseBlocks(content).map(renderBlock);
}

export interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className }: MarkdownContentProps) {
  return <div className={className}>{renderMarkdown(content)}</div>;
}
