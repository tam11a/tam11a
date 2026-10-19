import { canvas, color, font, type FontKey } from '../tokens.ts';
import { measure } from './fonts.ts';
import type { FontKit } from './fonts.ts';

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Inline style for a text node in one of the token fonts. */
export const fontStyle = (key: FontKey, size: number, extra = '') =>
  `font-family:'${font[key].family}';font-weight:${font[key].weight};font-size:${size}px;${extra}`;

/** Static film grain: one turbulence pass, rasterised once (animating it would cost every viewer CPU). */
export const grainDefs = (id = 'grain') => `
  <filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0"/>
  </filter>`;

// Shared motion rules. Base state is always the final frame, so reduced motion just drops animations.
const baseCss = `
  .reveal{animation:fadeUp .9s var(--ease) both}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @keyframes fade{from{opacity:0}to{opacity:1}}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

export interface Card {
  height: number;
  title: string;
  desc: string;
  defs?: string;
  css?: string;
  body: string;
  fonts: FontKit;
  width?: number;
}

/** Wraps a section in the shared rounded black card with grain and hairline border. */
export async function card({ height, title, desc, defs = '', css = '', body, fonts, width = canvas.width }: Card) {
  const { radius } = canvas;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<defs>
  <clipPath id="frame"><rect width="${width}" height="${height}" rx="${radius}"/></clipPath>
  ${grainDefs()}
  ${defs}
</defs>
<style>
  :root{--ease:cubic-bezier(.16,1,.3,1)}
  *{transform-box:fill-box}
  ${await fonts.css()}
  ${baseCss}
  ${css}
</style>
<g clip-path="url(#frame)">
  <rect width="${width}" height="${height}" fill="${color.bg}"/>
  ${body}
  <rect width="${width}" height="${height}" filter="url(#grain)" opacity="0.07"/>
</g>
<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${radius}" fill="none" stroke="${color.line}"/>
</svg>`;
}

// ---- Shared building blocks for section cards ----------------------------------------

/** Ping, line-draw, accent bar and glow motions used across cards. */
export const sharedCss = `
  .ping{transform-origin:center;animation:ping 2s cubic-bezier(0,0,.2,1) infinite}
  @keyframes ping{from{transform:scale(1);opacity:.9}to{transform:scale(3.2);opacity:0}}
  .rule{transform-origin:left;animation:draw 1.2s var(--ease) both}
  .bar{transform-origin:left;animation:draw .9s var(--ease) .35s both}
  @keyframes draw{from{transform:scaleX(0)}}
  .glow{transform-origin:center;animation:breathe 9s ease-in-out infinite alternate}
  @keyframes breathe{from{opacity:.6;transform:scale(.92)}to{opacity:1;transform:scale(1.06)}}
  .nudge{animation:nudge 2.6s var(--ease) 1.6s infinite}
  @keyframes nudge{0%,55%,100%{transform:none}25%{transform:translate(3px,-3px)}}`;

/** Small uppercase Anta label. */
export function mono(
  fonts: FontKit,
  s: string,
  x: number,
  y: number,
  { size = 12, fill = color.muted as string, anchor = 'start', tracking = 1.4 } = {},
) {
  const t = fonts.use('mono', s.toUpperCase());
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" fill="${fill}" style="${fontStyle('mono', size, `letter-spacing:${tracking}px`)}">${esc(t)}</text>`;
}

/** "# 00X" + "Title." + drawn accent bar, the portfolio's section opener. */
export function header(fonts: FontKit, num: string, title: string, x = canvas.pad) {
  const heading = fonts.use('bodyBold', title);
  fonts.use('bodyBold', '.');
  const w = measure('bodyBold', heading, 44);
  return `
  <text class="reveal" x="${x}" y="72" fill="${color.muted}" style="${fontStyle('mono', 14)}">${esc(fonts.use('mono', num))}</text>
  <text class="reveal" style="animation-delay:.1s;${fontStyle('bodyBold', 44)}" x="${x}" y="128" fill="${color.fg}">${esc(heading)}<tspan fill="${color.accent}">.</tspan></text>
  <rect class="bar" x="${x}" y="148" width="${(w + 12).toFixed(1)}" height="2" fill="${color.accent}"/>`;
}

/** Outlined tag pills laid out left to right; returns markup and the row's end x. */
export function pills(fonts: FontKit, tags: string[], x: number, y: number, maxX = Infinity) {
  let cx = x;
  const out: string[] = [];
  for (const tag of tags) {
    const t = fonts.use('mono', tag.toUpperCase());
    const w = measure('mono', t, 11, 1) + 20;
    if (cx + w > maxX) break;
    out.push(`<rect x="${cx.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="24" rx="12" fill="none" stroke="${color.line}"/>
      <text x="${(cx + 10).toFixed(1)}" y="${y + 16}" fill="${color.subtle}" style="${fontStyle('mono', 11, 'letter-spacing:1px')}">${esc(t)}</text>`);
    cx += w + 8;
  }
  return { body: out.join(''), end: cx };
}

/** ↗ arrow, the portfolio's link affordance. */
export const arrow = (x: number, y: number, s = 10, stroke: string = color.accent) =>
  `<path class="nudge" d="M${x} ${y + s}l${s}-${s}m-${s * 0.75} 0h${s * 0.75}v${s * 0.75}" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;

/** Merge a character grid into horizontal runs of rects (pixel art without 1000s of nodes). */
export function pixels(map: string[], palette: Record<string, string>, x: number, y: number, s: number) {
  const out: string[] = [];
  map.forEach((row, r) => {
    for (let c = 0; c < row.length; ) {
      const ch = row[c];
      let e = c;
      while (e < row.length && row[e] === ch) e++;
      if (palette[ch]) out.push(`<rect x="${x + c * s}" y="${y + r * s}" width="${(e - c) * s}" height="${s}" fill="${palette[ch]}"/>`);
      c = e;
    }
  });
  return out.join('');
}
