import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as fontkit from 'fontkit';
import subsetFont from 'subset-font';
import { font, type FontKey } from '../tokens.ts';

const require = createRequire(import.meta.url);
const buffers = new Map<FontKey, Buffer>();
const faces = new Map<FontKey, any>();

function buffer(key: FontKey) {
  if (!buffers.has(key)) buffers.set(key, readFileSync(require.resolve(`@fontsource/${font[key].file}`)));
  return buffers.get(key)!;
}

function face(key: FontKey) {
  if (!faces.has(key)) faces.set(key, fontkit.create(buffer(key)));
  return faces.get(key)!;
}

/** Rendered width of `text` in px, including CSS letter-spacing. */
export function measure(key: FontKey, text: string, size: number, tracking = 0) {
  const f = face(key);
  const run = f.layout(text);
  return (run.advanceWidth / f.unitsPerEm) * size + tracking * text.length;
}

/** Greedy word wrap against measured widths. */
export function wrap(key: FontKey, text: string, size: number, maxWidth: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(key, next, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Tracks which glyphs each SVG uses so only those get embedded.
 * SVGs loaded through <img> can't fetch web fonts, so they ship as base64 subsets.
 */
export class FontKit {
  private used = new Map<FontKey, Set<string>>();

  use(key: FontKey, text: string) {
    const set = this.used.get(key) ?? new Set<string>();
    for (const ch of text) set.add(ch);
    this.used.set(key, set);
    return text;
  }

  async css() {
    const rules: string[] = [];
    for (const [key, chars] of this.used) {
      const sub = await subsetFont(buffer(key), [...chars].join('') + ' ', { targetFormat: 'woff2' });
      const { family, weight } = font[key];
      rules.push(
        `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff2;base64,${sub.toString('base64')}) format('woff2')}`,
      );
    }
    return rules.join('\n');
  }
}

/** Cuts `text` with an ellipsis so it fits `maxWidth`. */
export function truncate(key: FontKey, text: string, size: number, maxWidth: number, tracking = 0) {
  if (measure(key, text, size, tracking) <= maxWidth) return text;
  let out = text;
  while (out && measure(key, out + '…', size, tracking) > maxWidth) out = out.slice(0, -1);
  return out.trimEnd() + '…';
}
