import * as icons from 'simple-icons';
import { proficiencies } from '../data.ts';
import { FontKit, measure, wrap } from '../lib/fonts.ts';
import { card, esc, fontStyle, header, headerM, mono, para, sharedCss } from '../lib/svg.ts';
import { canvas, color, mobile } from '../tokens.ts';

const W = canvas.width;
const P = canvas.pad;
const COL = 400;

/** One marquee row: logo + name chips, repeated so a -width translate loops seamlessly. */
function marqueeRow(fonts: FontKit, slugs: string[], y: number, reverse: boolean, id: string, width = W, size = 22, text = 13) {
  const gap = 44;
  const chips: { svg: string; w: number }[] = slugs.map((slug) => {
    const icon = (icons as Record<string, any>)[slug];
    const name = fonts.use('mono', icon.title.toUpperCase());
    const tw = measure('mono', name, text, 1.4);
    return {
      w: size + 12 + tw,
      svg: (x: number) =>
        `<path transform="translate(${x.toFixed(1)} ${y - size + 4}) scale(${size / 24})" d="${icon.path}" fill="${color.fg}"/>
         <text x="${(x + size + 12).toFixed(1)}" y="${y}" fill="${color.subtle}" style="${fontStyle('mono', text, 'letter-spacing:1.4px')}">${esc(name)}</text>`,
    } as any;
  });
  const span = chips.reduce((a, c) => a + c.w + gap, 0);
  const copies = Math.ceil((width * 2) / span) + 1;
  const parts: string[] = [];
  let x = 0;
  for (let k = 0; k < copies; k++) for (const c of chips) (parts.push((c.svg as any)(x)), (x += c.w + gap));
  const dur = (span / 38).toFixed(1); // ~38 px/s, slow enough to read
  return {
    css: `.${id}{animation:${id} ${dur}s linear infinite${reverse ? ' reverse' : ''}}
      @keyframes ${id}{from{transform:translateX(0)}to{transform:translateX(-${span.toFixed(1)}px)}}`,
    body: `<g class="${id}">${parts.join('')}</g>`,
  };
}

export async function proficienciesCard() {
  const fonts = new FontKit();
  const { groups, marquee, intro } = proficiencies;

  // Header row like Work: title left, intro right, divider, then content full width.
  const TOP = 206;
  const introLines = wrap('body', fonts.use('body', intro), 19, W - P - COL)
    .map((l, i) => `<tspan x="${COL}" y="${100 + i * 30}">${esc(l)}</tspan>`)
    .join('');

  // Four lists side by side, labels and items straight from the portfolio.
  const colW = (W - 2 * P) / groups.length;
  const lists = groups
    .map((g, i) => {
      const x = P + i * colW;
      const y = TOP + 56;
      const items = g.items
        .map((it, k) => {
          const iy = y + 38 + k * 30;
          return `<g class="reveal" style="animation-delay:${(0.25 + i * 0.08 + k * 0.05).toFixed(2)}s">
            <rect x="${x}" y="${iy - 9}" width="6" height="6" fill="${color.accent}"/>
            <text x="${x + 18}" y="${iy}" fill="${color.fg}" style="${fontStyle('body', 17)}">${esc(fonts.use('body', it))}</text></g>`;
        })
        .join('');
      return `<g class="reveal" style="animation-delay:${(0.15 + i * 0.08).toFixed(2)}s">${mono(fonts, g.label, x, y)}</g>${items}`;
    })
    .join('');

  const longest = Math.max(...groups.map((g) => g.items.length));
  const ruleY = TOP + 56 + 38 + (longest - 1) * 30 + 40;
  const rowA = marqueeRow(fonts, marquee[0], ruleY + 64, false, 'mqA');
  const rowB = marqueeRow(fonts, marquee[1], ruleY + 120, true, 'mqB');
  const H = ruleY + 160;

  const body = `
  <g class="glow"><circle cx="${W}" cy="0" r="380" fill="url(#glowP)"/></g>
  ${header(fonts, '# 002', 'Proficiencies')}
  <text class="reveal" style="animation-delay:.2s;${fontStyle('body', 19)}" fill="${color.subtle}">${introLines}</text>
  <g class="reveal" style="animation-delay:.3s">${mono(fonts, `${groups.length} groups · ${marquee.flat().length} technologies`, COL, 166)}</g>
  <line class="rule" x1="${P}" x2="${W - P}" y1="${TOP}" y2="${TOP}" stroke="${color.line}" style="animation-delay:.3s"/>
  ${lists}
  <line class="rule" x1="${P}" x2="${W - P}" y1="${ruleY}" y2="${ruleY}" stroke="${color.line}" style="animation-delay:.6s"/>
  <g mask="url(#edges)" class="reveal" style="animation-delay:.7s">${rowA.body}${rowB.body}</g>`;

  const defs = `
  <radialGradient id="glowP"><stop offset="0" stop-color="${color.accent}" stop-opacity=".2"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></radialGradient>
  <linearGradient id="fadeX"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".12" stop-color="#fff"/><stop offset=".88" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <mask id="edges" maskUnits="userSpaceOnUse" x="0" y="${ruleY}" width="${W}" height="${H - ruleY}"><rect x="0" y="${ruleY}" width="${W}" height="${H - ruleY}" fill="url(#fadeX)"/></mask>`;

  return card({
    height: H,
    title: 'Proficiencies — tam11a',
    desc: `${groups.map((g) => `${g.label}: ${g.items.join(', ')}`).join('. ')}.`,
    defs,
    css: `${sharedCss}${rowA.css}${rowB.css}`,
    body,
    fonts,
  });
}

/** Phone layout: stacked header, lists in a 2 × 2 grid, one marquee row with every logo. */
export async function proficienciesMobile() {
  const fonts = new FontKit();
  const MW = mobile.width;
  const MP = mobile.pad;
  const { groups, marquee, intro } = proficiencies;

  const h = headerM(fonts, '# 002', ['Proficiencies']);
  const p = para(fonts, intro, MP, h.bottom + 40, MW - 2 * MP, 16, 25);
  const meta = mono(fonts, `${groups.length} groups · ${marquee.flat().length} technologies`, MP, p.last + 32, { size: mobile.min });
  const top = p.last + 64;

  const colW = (MW - 2 * MP) / 2;
  const rowH = 46 + 5 * 26 + 16;
  const lists = groups
    .map((g, i) => {
      const x = MP + (i % 2) * colW;
      const y = top + 44 + Math.floor(i / 2) * rowH;
      const items = g.items
        .map((it, k) => {
          const iy = y + 32 + k * 26;
          return `<rect x="${x}" y="${iy - 8}" width="5" height="5" fill="${color.accent}"/>
            <text x="${x + 14}" y="${iy}" fill="${color.fg}" style="${fontStyle('body', 14.5)}">${esc(fonts.use('body', it))}</text>`;
        })
        .join('');
      return `<g class="reveal" style="animation-delay:${(0.2 + i * 0.08).toFixed(2)}s">${mono(fonts, g.label, x, y, { size: mobile.min })}${items}</g>`;
    })
    .join('');

  const longestBottom = Math.max(...groups.slice(2).map((g) => g.items.length));
  const ruleY = top + 44 + rowH + 32 + (longestBottom - 1) * 26 + 34;
  const row = marqueeRow(fonts, marquee.flat(), ruleY + 52, false, 'mqM', MW, 18, mobile.min);
  const H = ruleY + 84;

  const body = `
  <g class="glow"><circle cx="${MW}" cy="0" r="260" fill="url(#glowP)"/></g>
  ${h.body}
  ${p.body}
  <g class="reveal" style="animation-delay:.25s">${meta}</g>
  <line class="rule" x1="${MP}" x2="${MW - MP}" y1="${top}" y2="${top}" stroke="${color.line}" style="animation-delay:.3s"/>
  ${lists}
  <line class="rule" x1="${MP}" x2="${MW - MP}" y1="${ruleY}" y2="${ruleY}" stroke="${color.line}" style="animation-delay:.6s"/>
  <g mask="url(#edges)" class="reveal" style="animation-delay:.7s">${row.body}</g>`;

  return card({
    width: MW,
    height: H,
    title: 'Proficiencies — tam11a',
    desc: `${groups.map((g) => `${g.label}: ${g.items.join(', ')}`).join('. ')}.`,
    defs: `<radialGradient id="glowP"><stop offset="0" stop-color="${color.accent}" stop-opacity=".2"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></radialGradient>
      <linearGradient id="fadeX"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".1" stop-color="#fff"/><stop offset=".9" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <mask id="edges" maskUnits="userSpaceOnUse" x="0" y="${ruleY}" width="${MW}" height="${H - ruleY}"><rect x="0" y="${ruleY}" width="${MW}" height="${H - ruleY}" fill="url(#fadeX)"/></mask>`,
    css: `${sharedCss}${row.css}`,
    body,
    fonts,
  });
}
