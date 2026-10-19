import { work } from '../data.ts';
import { FontKit, measure, wrap } from '../lib/fonts.ts';
import { arrow, card, esc, fontStyle, header, headerM, mono, para, pills, sharedCss } from '../lib/svg.ts';
import { canvas, color, mobile } from '../tokens.ts';

const W = canvas.width;
const P = canvas.pad;
const COL = 400; // header intro column, same split as the other cards
const RAIL = P + 8; // timeline runs full width under the header
const X = RAIL + 36; // entry content
const TOP = 206; // header divider

/** Vertical timeline: the rail draws down and each node lights up as it's reached. */
export async function workCard() {
  const fonts = new FontKit();
  const intro = wrap('body', fonts.use('body', work.intro), 19, W - P - COL)
    .map((l, i) => `<tspan x="${COL}" y="${100 + i * 30}">${esc(l)}</tspan>`)
    .join('');

  let y = TOP + 74;
  const nodes: number[] = [];
  const entries = work.roles
    .map((r, i) => {
      const y0 = y;
      nodes.push(y0 - 7);
      const delay = 0.35 + i * 0.28;
      const company = fonts.use('bodyBold', r.company);
      const cw = measure('bodyBold', company, 24);
      const country = mono(fonts, r.country, X + cw + 10, y0, { size: 11 });
      const current = r.current
        ? (() => {
            const x = X + cw + 10 + measure('mono', r.country, 11, 1.4) + 14;
            const t = 'Current';
            const w = measure('mono', t.toUpperCase(), 10, 1.2) + 30;
            return `<rect x="${x}" y="${y0 - 16}" width="${w}" height="20" rx="10" fill="${color.accent}" fill-opacity=".12" stroke="${color.accent}" stroke-opacity=".5"/>
              <circle cx="${x + 11}" cy="${y0 - 6}" r="2.5" fill="${color.accent}"/>
              ${mono(fonts, t, x + 19, y0 - 2, { size: 10, fill: color.accent, tracking: 1.2 })}`;
          })()
        : '';
      const lines = wrap('body', fonts.use('body', r.summary), 16, W - P - X);
      const summary = lines
        .map((l, k) => `<tspan x="${X}" y="${y0 + 58 + k * 25}">${esc(l)}</tspan>`)
        .join('');
      const tagY = y0 + 58 + (lines.length - 1) * 25 + 20;
      const tags = pills(fonts, r.tags, X, tagY, W - P);
      y = tagY + 24 + 72; // breathing room between a role's tags and the next role
      return `<g class="reveal" style="animation-delay:${delay.toFixed(2)}s">
        <text x="${X}" y="${y0}" fill="${color.fg}" style="${fontStyle('bodyBold', 24)}">${esc(company)}</text>
        ${country}${current}
        ${mono(fonts, r.period, W - P, y0, { anchor: 'end' })}
        ${mono(fonts, `${r.title} / ${r.type}`, X, y0 + 26, { fill: color.accent, size: 12, tracking: 1.2 })}
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
  <g class="glow"><circle cx="${W}" cy="${H}" r="420" fill="url(#glowW)"/></g>
  ${header(fonts, '# 003', 'Work')}
  <text class="reveal" style="animation-delay:.2s;${fontStyle('body', 18)}" fill="${color.subtle}">${intro}</text>
  <g class="reveal" style="animation-delay:.3s">
    ${mono(fonts, `${work.roles.length} roles · since 2021`, COL, 166)}
    ${mono(fonts, 'View all experience', W - P - 22, 166, { anchor: 'end', fill: color.fg })}
    ${arrow(W - P - 12, 156, 9)}
  </g>
  <line class="rule" x1="${P}" x2="${W - P}" y1="${TOP}" y2="${TOP}" stroke="${color.line}" style="animation-delay:.3s"/>

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

/** Phone layout: stacked header, then the timeline with period and type under each company. */
export async function workMobile() {
  const fonts = new FontKit();
  const MW = mobile.width;
  const MP = mobile.pad;
  const rail = MP + 7;
  const x = rail + 26;
  const cw = MW - MP - x;

  const h = headerM(fonts, '# 003', ['Work']);
  const p = para(fonts, work.intro, MP, h.bottom + 40, MW - 2 * MP, 16, 25);
  const metaY = p.last + 34;
  const top = metaY + 30;

  let y = top + 58;
  const nodes: number[] = [];
  const entries = work.roles
    .map((r, i) => {
      const y0 = y;
      nodes.push(y0 - 7);
      const company = fonts.use('bodyBold', r.company);
      const compW = measure('bodyBold', company, 21);
      const countryX = x + compW + 8;
      const current = r.current
        ? (() => {
            const px = countryX + measure('mono', r.country, 11, 1.4) + 10;
            const w = measure('mono', 'CURRENT', 11, 1.2) + 28;
            return `<rect x="${px}" y="${y0 - 15}" width="${w}" height="20" rx="10" fill="${color.accent}" fill-opacity=".12" stroke="${color.accent}" stroke-opacity=".5"/>
              <circle cx="${px + 10}" cy="${y0 - 5}" r="2.5" fill="${color.accent}"/>
              ${mono(fonts, 'Current', px + 18, y0 - 1, { size: 11, fill: color.accent, tracking: 1.2 })}`;
          })()
        : '';
      // Titles can be long in Anta; wrap them like body copy, leaving room for tracking.
      const titleLines = wrap('mono', r.title.toUpperCase(), mobile.min, cw - 30);
      const titleEls = titleLines.map((l, k) => mono(fonts, l, x, y0 + 50 + k * 20, { size: mobile.min, fill: color.accent, tracking: 1.2 })).join('');
      const sumTop = y0 + 50 + (titleLines.length - 1) * 20 + 30;
      const sum = para(fonts, r.summary, x, sumTop, cw, 15, 23, color.subtle, 0);
      const tags = pills(fonts, r.tags, x, sum.last + 18, MW - MP, 11);
      y = tags.bottom + 64;
      return `<g class="reveal" style="animation-delay:${(0.3 + i * 0.25).toFixed(2)}s">
        <text x="${x}" y="${y0}" fill="${color.fg}" style="${fontStyle('bodyBold', 21)}">${esc(company)}</text>
        ${mono(fonts, r.country, countryX, y0, { size: 11 })}${current}
        ${mono(fonts, `${r.period} · ${r.type}`, x, y0 + 26, { size: mobile.min })}
        ${titleEls}
        ${sum.body.replace('class="reveal" style="animation-delay:0s;', 'style="')}
        ${tags.body}
      </g>`;
    })
    .join('');

  const H = y - 24;
  const railTop = nodes[0];
  const railBot = nodes.at(-1)!;
  const nodeEls = work.roles
    .map((r, i) => {
      const ny = nodes[i];
      return `<g class="node" style="animation-delay:${(0.3 + i * 0.25).toFixed(2)}s;transform-box:view-box;transform-origin:${rail}px ${ny}px">
        <circle cx="${rail}" cy="${ny}" r="6" fill="${color.bg}" stroke="${r.current ? color.accent : color.muted}" stroke-width="1.5"/>
        <circle cx="${rail}" cy="${ny}" r="2.5" fill="${r.current ? color.accent : color.muted}"/>
        ${r.current ? `<circle class="ping" cx="${rail}" cy="${ny}" r="6" fill="none" stroke="${color.accent}"/>` : ''}
      </g>`;
    })
    .join('');

  const body = `
  <g class="glow"><circle cx="${MW}" cy="${H}" r="300" fill="url(#glowW)"/></g>
  ${h.body}
  ${p.body}
  <g class="reveal" style="animation-delay:.25s">
    ${mono(fonts, `${work.roles.length} roles · since 2021`, MP, metaY, { size: mobile.min })}
    ${mono(fonts, 'View all', MW - MP - 20, metaY, { size: mobile.min, anchor: 'end', fill: color.fg })}
    ${arrow(MW - MP - 10, metaY - 10, 9)}
  </g>
  <line class="rule" x1="${MP}" x2="${MW - MP}" y1="${top}" y2="${top}" stroke="${color.line}" style="animation-delay:.3s"/>
  <line x1="${rail}" x2="${rail}" y1="${railTop}" y2="${railBot}" stroke="${color.line}" stroke-width="1.5"/>
  <line class="railfill" x1="${rail}" x2="${rail}" y1="${railTop}" y2="${railBot}" stroke="url(#railG)" stroke-width="1.5"/>
  ${nodeEls}
  ${entries}`;

  return card({
    width: MW,
    height: H,
    title: 'Work — tam11a',
    desc: work.roles.map((r) => `${r.company} (${r.country}), ${r.title}, ${r.period}: ${r.summary}`).join(' '),
    defs: `<radialGradient id="glowW"><stop offset="0" stop-color="${color.accent}" stop-opacity=".18"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></radialGradient>
      <linearGradient id="railG" gradientUnits="userSpaceOnUse" x1="0" y1="${railTop}" x2="0" y2="${railBot}"><stop offset="0" stop-color="${color.accent}"/><stop offset="1" stop-color="${color.accent}" stop-opacity=".1"/></linearGradient>`,
    css: `${sharedCss}
  .railfill{transform-origin:top;animation:down ${(0.3 + work.roles.length * 0.25).toFixed(2)}s linear .3s both}
  @keyframes down{from{transform:scaleY(0)}}
  .node{animation:pop .5s cubic-bezier(.34,1.56,.64,1) both}
  @keyframes pop{from{transform:scale(0)}}`,
    body,
    fonts,
  });
}
