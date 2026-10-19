import { honors } from '../data.ts';
import { FontKit, wrap } from '../lib/fonts.ts';
import { card, esc, fontStyle, header, mono, sharedCss } from '../lib/svg.ts';
import { canvas, color } from '../tokens.ts';

const W = canvas.width;
const P = canvas.pad;
const COL = 400;

const trophy = (x: number, y: number) => `
  <g transform="translate(${x} ${y})" fill="${color.accent}" fill-opacity=".14" stroke="${color.accent}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
    <path d="M10 0h28v14a14 14 0 0 1 -28 0z"/>
    <path d="M10 4h-8v4a9 9 0 0 0 9 9M38 4h8v4a9 9 0 0 1 -9 9" fill="none"/>
    <path d="M24 28v8M15 44h18l-2 -8h-14z"/>
  </g>`;

const sparkle = (x: number, y: number, s: number, delay: number) =>
  `<path class="twinkle" style="animation-delay:${delay}s;transform-box:view-box;transform-origin:${x}px ${y}px" d="M${x} ${y - s}q${s * 0.15} ${s * 0.85} ${s} ${s}q-${s * 0.85} ${s * 0.15} -${s} ${s}q-${s * 0.15} -${s * 0.85} -${s} -${s}q${s * 0.85} -${s * 0.15} ${s} -${s}z" fill="${color.fg}"/>`;

/** Two trophy cards; a light sheen sweeps across each in turn. */
export async function honorsCard() {
  const fonts = new FontKit();
  const intro = wrap('body', fonts.use('body', 'Awards and recognitions earned through competitions and challenges.'), 19, W - P - COL)
    .map((l, i) => `<tspan x="${COL}" y="${100 + i * 30}">${esc(l)}</tspan>`)
    .join('');

  const top = 196;
  const gap = 24;
  const cw = (W - 2 * P - gap) / 2;
  const ch = 230;
  const defs: string[] = [];

  const cards = honors
    .map((h, i) => {
      const x = P + i * (cw + gap);
      defs.push(`<clipPath id="hc${i}"><rect x="${x}" y="${top}" width="${cw}" height="${ch}" rx="14"/></clipPath>`);
      const badge = fonts.use('mono', h.badge.toUpperCase());
      const year = fonts.use('display', h.year);
      return `<g class="reveal" style="animation-delay:${(0.3 + i * 0.15).toFixed(2)}s">
        <g clip-path="url(#hc${i})">
          <rect x="${x}" y="${top}" width="${cw}" height="${ch}" fill="#0a0a0a"/>
          <text x="${x + cw + 8}" y="${top + ch + 22}" text-anchor="end" fill="none" stroke="${color.fg}" stroke-opacity=".07" stroke-width="1.5" style="${fontStyle('display', 150)}">${year}</text>
          <rect class="sheen" style="animation-delay:${(2 + i * 1.6).toFixed(1)}s" x="${x - 160}" y="${top - 40}" width="110" height="${ch + 80}" fill="url(#sheen)" transform="skewX(-18)"/>
        </g>
        <rect x="${x + 0.5}" y="${top + 0.5}" width="${cw - 1}" height="${ch - 1}" rx="14" fill="none" stroke="${color.line}"/>
        ${trophy(x + 28, top + 30)}
        ${sparkle(x + 84, top + 34, 6, 0.4 + i)}${sparkle(x + 92, top + 62, 3.5, 1.2 + i)}
        <rect x="${x + cw - 28 - 96}" y="${top + 30}" width="96" height="24" rx="12" fill="${color.accent}" fill-opacity=".12" stroke="${color.accent}" stroke-opacity=".5"/>
        <text x="${x + cw - 28 - 48}" y="${top + 46}" text-anchor="middle" fill="${color.accent}" style="${fontStyle('mono', 11, 'letter-spacing:1.4px')}">${esc(badge)}</text>
        ${mono(fonts, h.year, x + 28, top + 128)}
        <text x="${x + 28}" y="${top + 162}" fill="${color.fg}" style="${fontStyle('bodyBold', 24)}">${esc(fonts.use('bodyBold', h.title))}</text>
        <text x="${x + 28}" y="${top + 192}" fill="${color.subtle}" style="${fontStyle('body', 16)}">${esc(fonts.use('body', h.detail))}</text>
      </g>`;
    })
    .join('');

  const H = top + ch + 56;
  const body = `
  <g class="glow"><circle cx="${W / 2}" cy="${top + ch / 2}" r="420" fill="url(#glowH)"/></g>
  ${header(fonts, '# 004', 'Honors')}
  <text class="reveal" style="animation-delay:.2s;${fontStyle('body', 19)}" fill="${color.subtle}">${intro}</text>
  ${cards}`;

  const css = `${sharedCss}
  .sheen{animation:sheen 4.8s cubic-bezier(.65,0,.35,1) infinite both}
  @keyframes sheen{0%{transform:skewX(-18deg) translateX(0)}45%,100%{transform:skewX(-18deg) translateX(${cw + 320}px)}}
  .twinkle{animation:twinkle 2.6s ease-in-out infinite}
  @keyframes twinkle{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(.3);opacity:.2}}
  @media (prefers-reduced-motion:reduce){.sheen{display:none}}`;

  return card({
    height: H,
    title: 'Honors — tam11a',
    desc: honors.map((h) => `${h.title} ${h.year}: ${h.badge}. ${h.detail}.`).join(' '),
    defs: `<radialGradient id="glowH"><stop offset="0" stop-color="${color.accent}" stop-opacity=".14"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></radialGradient>
      <linearGradient id="sheen"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".09"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      ${defs.join('')}`,
    css,
    body,
    fonts,
  });
}
