import { color } from '../tokens.ts';
import { FontKit, measure } from './fonts.ts';
import { esc, fontStyle } from './svg.ts';

export const odometerCss = `
  .roll{animation-name:roll;animation-timing-function:cubic-bezier(.22,1,.36,1);animation-fill-mode:both}
  @keyframes roll{from{transform:translateY(0)}}`;

/**
 * Odometer-style number: each digit is a clipped column of 0–9 that spins down to its value.
 * The final translate is the element's own style, so the keyframe only needs a `from`.
 */
export function odometer(fonts: FontKit, value: string, x: number, y: number, size: number, delay: number, id: string) {
  const lineH = size * 1.15;
  const digits = [...value];
  let cx = x;
  const defs: string[] = [];
  const parts: string[] = [];

  digits.forEach((ch, i) => {
    const w = measure('display', ch, size);
    fonts.use('display', ch);
    if (!/\d/.test(ch)) {
      parts.push(`<text x="${cx.toFixed(1)}" y="${y}" fill="${color.fg}" style="${fontStyle('display', size)}">${esc(ch)}</text>`);
      cx += w;
      return;
    }
    const d = Number(ch);
    const loops = 1 + (digits.length - 1 - i === 0 ? 1 : 0); // ones column spins an extra lap
    const seq = [...Array.from({ length: loops * 10 }, (_, k) => k % 10), ...Array.from({ length: d + 1 }, (_, k) => k)];
    fonts.use('display', '0123456789');
    const clip = `${id}c${i}`;
    defs.push(`<clipPath id="${clip}"><rect x="${(cx - 4).toFixed(1)}" y="${y - size * 0.82}" width="${(w + 8).toFixed(1)}" height="${size * 0.98}"/></clipPath>`);
    const stack = seq
      .map((n, k) => `<text x="${(cx + w / 2).toFixed(1)}" y="${(y + k * lineH).toFixed(1)}" text-anchor="middle">${n}</text>`)
      .join('');
    parts.push(
      `<g clip-path="url(#${clip})"><g class="roll" fill="${color.fg}" style="transform:translateY(-${((seq.length - 1) * lineH).toFixed(1)}px);animation-delay:${(delay + i * 0.06).toFixed(2)}s;animation-duration:${(1.4 + i * 0.12).toFixed(2)}s;${fontStyle('display', size)}">${stack}</g></g>`,
    );
    cx += w;
  });
  return { defs: defs.join(''), body: parts.join(''), width: cx - x };
}
