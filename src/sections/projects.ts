import { projects } from '../data.ts';
import { FontKit, wrap } from '../lib/fonts.ts';
import { arrow, card, esc, fontStyle, header, mono, pills, sharedCss } from '../lib/svg.ts';
import { canvas, color } from '../tokens.ts';

const W = canvas.width;
const P = canvas.pad;
const COL = 400;

/** Section opener; the cards below it are separate images so each can link to its case study. */
export async function projectsHeader() {
  const fonts = new FontKit();
  const intro = wrap('body', fonts.use('body', 'Selected work. Tap a card to read the case study.'), 19, W - P - COL)
    .map((l, i) => `<tspan x="${COL}" y="${100 + i * 30}">${esc(l)}</tspan>`)
    .join('');
  const H = 196;
  const all = 'View all projects';
  const body = `
  <g class="glow"><circle cx="${W}" cy="${H}" r="320" fill="url(#glowPj)"/></g>
  ${header(fonts, '# 005', 'Projects')}
  <text class="reveal" style="animation-delay:.2s;${fontStyle('body', 19)}" fill="${color.subtle}">${intro}</text>
  <g class="reveal" style="animation-delay:.3s">
    ${mono(fonts, all, W - P - 22, 148, { anchor: 'end', fill: color.fg })}
    ${arrow(W - P - 12, 138, 9)}
  </g>`;
  return card({
    height: H,
    title: 'Projects — tam11a',
    desc: `Selected projects: ${projects.map((p) => p.name).join(', ')}.`,
    defs: `<radialGradient id="glowPj"><stop offset="0" stop-color="${color.accent}" stop-opacity=".2"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></radialGradient>`,
    css: sharedCss,
    body,
    fonts,
  });
}

/** Half-width project card with a light that runs around its border. */
export async function projectCard(i: number) {
  const p = projects[i];
  const fonts = new FontKit();
  const CW = 490;
  const CH = 290;
  const pad = 32;

  const lines = wrap('body', fonts.use('body', p.summary), 16, CW - 2 * pad).slice(0, 3);
  const summary = lines.map((l, k) => `<tspan x="${pad}" y="${160 + k * 25}">${esc(l)}</tspan>`).join('');
  const tags = pills(fonts, p.tags, pad, CH - pad - 24, CW - pad);
  const cx = CW / 2;
  const cy = CH / 2;
  const offset = -(i * 1.1).toFixed(1); // stagger so the six borders don't run in lockstep

  const body = `
  <circle class="glow" cx="${i % 2 ? CW : 0}" cy="0" r="260" fill="url(#glowC)"/>
  <rect x="1" y="1" width="${CW - 2}" height="${CH - 2}" rx="15" fill="none" stroke="url(#run)" stroke-width="1.6"/>
  ${mono(fonts, String(i + 1).padStart(2, '0'), pad, pad + 20, { size: 13 })}
  <g class="reveal" style="animation-delay:.1s">
    <circle cx="${CW - pad - 18}" cy="${pad + 14}" r="18" fill="none" stroke="${color.line}"/>
    ${arrow(CW - pad - 23, pad + 9, 10)}
  </g>
  <text class="reveal" style="animation-delay:.15s;${fontStyle('bodyBold', 26)}" x="${pad}" y="122" fill="${color.fg}">${esc(fonts.use('bodyBold', p.name))}</text>
  <text class="reveal" style="animation-delay:.25s;${fontStyle('body', 16)}" fill="${color.subtle}">${summary}</text>
  <g class="reveal" style="animation-delay:.35s">${tags.body}</g>`;

  const defs = `
  <radialGradient id="glowC"><stop offset="0" stop-color="${color.accent}" stop-opacity=".16"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></radialGradient>
  <linearGradient id="run" gradientUnits="userSpaceOnUse" x1="0" y1="${cy}" x2="${CW}" y2="${cy}">
    <stop offset=".35" stop-color="${color.accent}" stop-opacity="0"/>
    <stop offset=".5" stop-color="${color.accent}"/>
    <stop offset=".65" stop-color="${color.accent}" stop-opacity="0"/>
    <animateTransform attributeName="gradientTransform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="7s" begin="${offset}s" repeatCount="indefinite"/>
  </linearGradient>`;

  return card({
    width: CW,
    height: CH,
    title: `${p.name} — project`,
    desc: `${p.summary} Tags: ${p.tags.join(', ')}.`,
    defs,
    css: sharedCss,
    body,
    fonts,
  });
}

export const projectCount = projects.length;
