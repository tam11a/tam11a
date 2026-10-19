import type { Live } from '../lib/github.ts';
import { FontKit, measure } from '../lib/fonts.ts';
import { odometer, odometerCss } from '../lib/odometer.ts';
import { card, esc, fontStyle } from '../lib/svg.ts';
import { canvas, color } from '../tokens.ts';

const W = canvas.width;
const P = canvas.pad;
const COL = 400;
const GRID_W = W - 2 * P;

/** Orange ramp shared by the heatmap, the snake's dots and the language bar. */
export const ramp = ['#161616', '#3d1002', '#6e1c03', '#ac2c04', color.accent];
const langRamp = [color.accent, '#c4380a', '#8a2a08', '#5a1d07', '#3a1305', '#262626'];

/** Our own contribution grid, used when the snake SVG isn't available (local builds). */
function heatmap(days: Live['days'], y: number) {
  const nonzero = days.map((d) => d.count).filter(Boolean).sort((a, b) => a - b);
  const q = (p: number) => nonzero[Math.floor(p * (nonzero.length - 1))] ?? 1;
  const cuts = [q(0.25), q(0.5), q(0.75)];
  const level = (n: number) => (n === 0 ? 0 : 1 + cuts.filter((c) => n > c).length);

  const pitch = GRID_W / 53;
  const cell = pitch - 3;
  const cols: string[][] = [];
  let col = 0;
  days.forEach((d, i) => {
    const row = new Date(`${d.date}T00:00:00Z`).getUTCDay();
    if (row === 0 && i > 0) col++;
    (cols[col] ??= []).push(
      `<rect x="${(P + col * pitch).toFixed(1)}" y="${(y + row * pitch).toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" rx="3" fill="${ramp[level(d.count)]}"/>`,
    );
  });
  return {
    height: 7 * pitch - 3,
    body: cols.map((c, i) => `<g class="pop" style="animation-delay:${(0.6 + i * 0.018).toFixed(3)}s">${c.join('')}</g>`).join(''),
  };
}

/** Platane/snk output, isolated inside an <image> so its CSS can't collide with ours. */
function snakeImage(svg: string, y: number) {
  const vb = svg.match(/viewBox="([^"]+)"/)?.[1].split(/[\s,]+/).map(Number);
  const [w, h] = vb ? [vb[2], vb[3]] : [880, 192];
  const height = (GRID_W * h) / w;
  const data = Buffer.from(svg).toString('base64');
  return {
    height,
    body: `<image class="reveal" style="animation-delay:.6s" x="${P}" y="${y}" width="${GRID_W}" height="${height.toFixed(1)}" href="data:image/svg+xml;base64,${data}"/>`,
  };
}

export async function live(data: Live, snake?: string) {
  const fonts = new FontKit();
  const label = (s: string, x: number, y: number, anchor = 'start', fill: string = color.muted) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" style="${fontStyle('mono', 12, 'letter-spacing:1.4px')}">${esc(fonts.use('mono', s.toUpperCase()))}</text>`;

  const updated = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(data.fetchedAt);

  // Stats: 2 × 2 grid in the content column, same rhythm as About's facts.
  const stats = [
    { value: data.contributions, label: 'Contributions / yr' },
    { value: data.streak.current, label: 'Current streak · days' },
    { value: data.streak.longest, label: 'Longest streak · days' },
    { value: data.stars, label: 'Stars earned' },
  ];
  const colW = (W - P - COL) / 2;
  const statDefs: string[] = [];
  const statEls = stats
    .map((s, i) => {
      const x = COL + (i % 2) * colW;
      const y = 112 + Math.floor(i / 2) * 104;
      const o = odometer(fonts, s.value.toLocaleString('en-US'), x, y, 52, 0.3 + i * 0.12, `l${i}`);
      statDefs.push(o.defs);
      return `${o.body}<g class="reveal" style="animation-delay:${(0.5 + i * 0.12).toFixed(2)}s">${label(s.label, x, y + 30)}</g>`;
    })
    .join('');

  // Contribution grid: snake when CI produced one, otherwise our heatmap.
  const gridLabelY = 336;
  const gridY = gridLabelY + 24;
  const grid = snake ? snakeImage(snake, gridY - 12) : heatmap(data.days, gridY);
  const legendX = W - P;
  const legend = ramp
    .map((c, i) => `<rect x="${legendX - 58 - (ramp.length - 1 - i) * 16}" y="${gridLabelY - 10}" width="11" height="11" rx="2.5" fill="${c}"/>`)
    .join('');

  // Languages: one stacked bar, segments grow in sequence.
  const langLabelY = gridY + grid.height + 54;
  const barY = langLabelY + 20;
  let bx = P;
  const segs = data.languages
    .map((l, i) => {
      const w = l.share * GRID_W;
      const r = `<rect class="grow" style="animation-delay:${(1 + i * 0.12).toFixed(2)}s" x="${bx.toFixed(1)}" y="${barY}" width="${Math.max(w - 2, 1).toFixed(1)}" height="10" fill="${langRamp[i] ?? langRamp.at(-1)}"/>`;
      bx += w;
      return r;
    })
    .join('');
  let lx = P;
  const legendY = barY + 44;
  const langLegend = data.languages
    .map((l, i) => {
      const name = fonts.use('bodyBold', l.name);
      const pct = fonts.use('mono', `${(l.share * 100).toFixed(1)}%`);
      const el = `<g class="reveal" style="animation-delay:${(1.1 + i * 0.1).toFixed(2)}s">
        <rect x="${lx}" y="${legendY - 10}" width="10" height="10" rx="2" fill="${langRamp[i] ?? langRamp.at(-1)}"/>
        <text x="${lx + 18}" y="${legendY}" fill="${color.fg}" style="${fontStyle('bodyBold', 15)}">${esc(name)}</text>
        <text x="${(lx + 26 + measure('bodyBold', name, 15)).toFixed(1)}" y="${legendY}" fill="${color.muted}" style="${fontStyle('mono', 12)}">${pct}</text></g>`;
      lx += 26 + measure('bodyBold', name, 15) + measure('mono', pct, 12) + 30;
      return el;
    })
    .join('');

  const H = legendY + 52;
  const heading = fonts.use('bodyBold', 'Live');
  fonts.use('bodyBold', '.');
  const headingW = measure('bodyBold', heading, 44);

  const body = `
  <g class="glow"><circle cx="40" cy="${H}" r="380" fill="url(#glowL)"/></g>

  <text class="reveal" x="${P}" y="72" fill="${color.muted}" style="${fontStyle('mono', 14)}">${fonts.use('mono', '# 006')}</text>
  <text class="reveal" style="animation-delay:.1s;${fontStyle('bodyBold', 44)}" x="${P}" y="128" fill="${color.fg}">${heading}<tspan fill="${color.accent}">.</tspan></text>
  <rect class="bar" x="${P}" y="148" width="${headingW + 12}" height="2" fill="${color.accent}"/>
  <g class="reveal" style="animation-delay:.3s">
    <circle cx="${P + 4}" cy="${190}" r="3.5" fill="${color.accent}"/>
    <circle class="ping" cx="${P + 4}" cy="${190}" r="3.5" fill="none" stroke="${color.accent}"/>
    ${label('Updated hourly', P + 18, 194, 'start', color.fg)}
    ${label(`Last ${updated} GMT+6`, P, 218)}
  </g>

  ${statEls}

  <line class="rule" x1="${P}" x2="${W - P}" y1="${gridLabelY - 46}" y2="${gridLabelY - 46}" stroke="${color.line}" style="animation-delay:.5s"/>
  <g class="reveal" style="animation-delay:.55s">
    ${label('Contributions — last 12 months', P, gridLabelY)}
    ${label('Less', legendX - 58 - (ramp.length - 1) * 16 - 10, gridLabelY, 'end')}
    ${legend}
    ${label('More', legendX, gridLabelY, 'end')}
  </g>
  ${grid.body}

  <g class="reveal" style="animation-delay:.9s">${label('Languages — by bytes written', P, langLabelY)}</g>
  <g clip-path="url(#barClip)">${segs}</g>
  ${langLegend}`;

  const css = `
  .glow{transform-origin:center;animation:breathe 9s ease-in-out infinite alternate}
  @keyframes breathe{from{opacity:.6;transform:scale(.92)}to{opacity:1;transform:scale(1.06)}}
  .ping{transform-origin:center;animation:ping 2s cubic-bezier(0,0,.2,1) infinite}
  @keyframes ping{from{transform:scale(1);opacity:.9}to{transform:scale(3.2);opacity:0}}
  .rule{transform-origin:left;animation:draw 1.2s var(--ease) both}
  .bar{transform-origin:left;animation:draw .9s var(--ease) .35s both}
  .grow{transform-origin:left;animation:draw .8s var(--ease) both}
  @keyframes draw{from{transform:scaleX(0)}}
  .pop{animation:fade .5s ease-out both}
  ${odometerCss}`;

  const defs = `
  <radialGradient id="glowL"><stop offset="0" stop-color="${color.accent}" stop-opacity=".2"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></radialGradient>
  <clipPath id="barClip"><rect x="${P}" y="${barY}" width="${GRID_W}" height="10" rx="5"/></clipPath>
  ${statDefs.join('')}`;

  return card({
    height: H,
    title: 'Live — tam11a on GitHub',
    desc: `${data.contributions} contributions in the last year. Current streak ${data.streak.current} days, longest ${data.streak.longest}. ${data.stars} stars earned. Languages: ${data.languages.map((l) => `${l.name} ${(l.share * 100).toFixed(0)}%`).join(', ')}.`,
    defs,
    css,
    body,
    fonts,
  });
}
