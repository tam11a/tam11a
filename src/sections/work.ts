import { work } from '../data.ts';
import { FontKit, measure, wrap } from '../lib/fonts.ts';
import { arrow, card, esc, fontStyle, header, mono, pills, sharedCss } from '../lib/svg.ts';
import { canvas, color } from '../tokens.ts';

const W = canvas.width;
const P = canvas.pad;
const COL = 400;
const RAIL = COL - 44;

/** Vertical timeline: the rail draws down and each node lights up as it's reached. */
export async function workCard() {
  const fonts = new FontKit();
  const intro = wrap('body', fonts.use('body', work.intro), 18, 250)
    .map((l, i) => `<tspan x="${P}" y="${200 + i * 28}">${esc(l)}</tspan>`)
    .join('');

  let y = 92;
  const nodes: number[] = [];
  const entries = work.roles
    .map((r, i) => {
      const y0 = y;
      nodes.push(y0 - 7);
      const delay = 0.35 + i * 0.28;
      const company = fonts.use('bodyBold', r.company);
      const cw = measure('bodyBold', company, 24);
      const country = mono(fonts, r.country, COL + cw + 10, y0, { size: 11 });
      const current = r.current
        ? (() => {
            const x = COL + cw + 10 + measure('mono', r.country, 11, 1.4) + 14;
            const t = 'Current';
            const w = measure('mono', t.toUpperCase(), 10, 1.2) + 30;
            return `<rect x="${x}" y="${y0 - 16}" width="${w}" height="20" rx="10" fill="${color.accent}" fill-opacity=".12" stroke="${color.accent}" stroke-opacity=".5"/>
              <circle cx="${x + 11}" cy="${y0 - 6}" r="2.5" fill="${color.accent}"/>
              ${mono(fonts, t, x + 19, y0 - 2, { size: 10, fill: color.accent, tracking: 1.2 })}`;
          })()
        : '';
      const lines = wrap('body', fonts.use('body', r.summary), 16, W - P - COL);
      const summary = lines
        .map((l, k) => `<tspan x="${COL}" y="${y0 + 58 + k * 25}">${esc(l)}</tspan>`)
        .join('');
      const tagY = y0 + 58 + (lines.length - 1) * 25 + 20;
      const tags = pills(fonts, r.tags, COL, tagY, W - P);
      y = tagY + 24 + 46;
      return `<g class="reveal" style="animation-delay:${delay.toFixed(2)}s">
        <text x="${COL}" y="${y0}" fill="${color.fg}" style="${fontStyle('bodyBold', 24)}">${esc(company)}</text>
        ${country}${current}
        ${mono(fonts, r.period, W - P, y0, { anchor: 'end' })}
        ${mono(fonts, `${r.title} / ${r.type}`, COL, y0 + 26, { fill: color.accent, size: 12, tracking: 1.2 })}
        <text fill="${color.subtle}" style="${fontStyle('body', 16)}">${summary}</text>
        ${tags.body}
      </g>`;
    })
    .join('');

  const H = y - 10;
  const railTop = nodes[0];
  const railBot = nodes.at(-1)!;
  const nodeEls = work.roles
    .map((r, i) => {
      const delay = 0.35 + i * 0.28;
      const ny = nodes[i];
      return `<g class="node" style="animation-delay:${delay.toFixed(2)}s;transform-box:view-box;transform-origin:${RAIL}px ${ny}px">
        <circle cx="${RAIL}" cy="${ny}" r="7" fill="${color.bg}" stroke="${r.current ? color.accent : color.muted}" stroke-width="1.5"/>
        <circle cx="${RAIL}" cy="${ny}" r="3" fill="${r.current ? color.accent : color.muted}"/>
        ${r.current ? `<circle class="ping" cx="${RAIL}" cy="${ny}" r="7" fill="none" stroke="${color.accent}"/>` : ''}
      </g>`;
    })
    .join('');

  const body = `
  <g class="glow"><circle cx="0" cy="${H}" r="420" fill="url(#glowW)"/></g>
  ${header(fonts, '# 003', 'Work')}
  <text class="reveal" style="animation-delay:.2s;${fontStyle('body', 18)}" fill="${color.subtle}">${intro}</text>
  <g class="reveal" style="animation-delay:.3s">
    ${mono(fonts, `${work.roles.length} roles · since 2021`, P, 290)}
    ${mono(fonts, 'View all experience', P, 318, { fill: color.fg })}
    ${arrow(P + measure('mono', 'VIEW ALL EXPERIENCE', 12, 1.4) + 8, 308, 9)}
  </g>

  <line x1="${RAIL}" x2="${RAIL}" y1="${railTop}" y2="${railBot}" stroke="${color.line}" stroke-width="1.5"/>
  <line class="railfill" x1="${RAIL}" x2="${RAIL}" y1="${railTop}" y2="${railBot}" stroke="url(#railG)" stroke-width="1.5"/>
  ${nodeEls}
  ${entries}`;

  const css = `${sharedCss}
  .railfill{transform-origin:top;animation:down ${(0.35 + work.roles.length * 0.28).toFixed(2)}s linear .35s both}
  @keyframes down{from{transform:scaleY(0)}}
  .node{animation:pop .5s cubic-bezier(.34,1.56,.64,1) both}
  @keyframes pop{from{transform:scale(0)}}`;

  const defs = `
  <radialGradient id="glowW"><stop offset="0" stop-color="${color.accent}" stop-opacity=".18"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></radialGradient>
  <linearGradient id="railG" gradientUnits="userSpaceOnUse" x1="0" y1="${railTop}" x2="0" y2="${railBot}"><stop offset="0" stop-color="${color.accent}"/><stop offset="1" stop-color="${color.accent}" stop-opacity=".1"/></linearGradient>`;

  return card({
    height: H,
    title: 'Work — tam11a',
    desc: work.roles.map((r) => `${r.company} (${r.country}), ${r.title}, ${r.period}: ${r.summary}`).join(' '),
    defs,
    css,
    body,
    fonts,
  });
}
