import { profile } from '../data.ts';
import { FontKit, measure, wrap } from '../lib/fonts.ts';
import type { Live } from '../lib/github.ts';
import { odometer, odometerCss } from '../lib/odometer.ts';
import { card, esc, fontStyle } from '../lib/svg.ts';
import { canvas, color } from '../tokens.ts';

const W = canvas.width;
const P = canvas.pad;
const COL = 400; // content column, mirrors the portfolio's label | content split

/** Circular text badge that slowly spins, the classic portfolio "available" stamp. */
function badge(fonts: FontKit, cx: number, cy: number, r: number) {
  const size = 11;
  const phrase = fonts.use('mono', 'OPEN TO WORK — BASED IN DHAKA — ');
  // Spread the glyphs so the phrase closes the circle exactly.
  const tracking = (2 * Math.PI * r - measure('mono', phrase, size)) / [...phrase].length;
  const path = `M${cx - r} ${cy}a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1 -${2 * r} 0`;
  const origin = `transform-box:view-box;transform-origin:${cx}px ${cy}px`;
  return {
    defs: `<path id="ring" d="${path}"/>`,
    body: `<g class="reveal" style="animation-delay:.4s">
      <circle cx="${cx}" cy="${cy}" r="${r + 16}" fill="none" stroke="${color.line}"/>
      <circle cx="${cx}" cy="${cy}" r="${r - 16}" fill="none" stroke="${color.line}"/>
      <g class="spin" style="${origin}">
        <text fill="${color.muted}" style="${fontStyle('mono', size, `letter-spacing:${tracking.toFixed(2)}px`)}"><textPath href="#ring">${esc(phrase)}</textPath></text>
      </g>
      <g class="sway" style="${origin}">
        <path d="M${cx - 9} ${cy + 9}l18-18m-13 0h13v13" fill="none" stroke="${color.accent}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </g>`,
  };
}

export async function about(live: Live) {
  const fonts = new FontKit();
  const { facts, bio } = profile.about;
  const stats = profile.about.stats.map((s) => ({
    ...s,
    value: s.live ? live[s.live].toLocaleString('en-US') : s.value!,
  }));

  const label = (s: string, x: number, y: number, extra = '') =>
    `<text x="${x}" y="${y}" fill="${color.muted}" style="${fontStyle('mono', 12, 'letter-spacing:1.4px')}" ${extra}>${esc(fonts.use('mono', s.toUpperCase()))}</text>`;

  // Facts grid: 2 × 2, same labels and order as the portfolio.
  const colW = (W - P - COL) / 2;
  const factEls = facts
    .map((f, i) => {
      const x = COL + (i % 2) * colW;
      const y = 72 + Math.floor(i / 2) * 76;
      const val = fonts.use('mono', f.value.toUpperCase());
      const status = 'status' in f && f.status;
      const valueEl = status
        ? `<circle cx="${x + 5}" cy="${y + 25}" r="4" fill="${color.accent}"/>
           <circle class="ping" cx="${x + 5}" cy="${y + 25}" r="4" fill="none" stroke="${color.accent}" stroke-width="1.4"/>
           <text x="${x + 18}" y="${y + 30}" fill="${color.accent}" style="${fontStyle('mono', 15, 'letter-spacing:1.2px')}">${esc(val)}</text>`
        : `<text x="${x}" y="${y + 30}" fill="${color.fg}" style="${fontStyle('mono', 15, 'letter-spacing:1.2px')}">${esc(val)}</text>`;
      return `<g class="reveal" style="animation-delay:${(0.15 + i * 0.1).toFixed(2)}s">${label(f.label, x, y)}${valueEl}</g>`;
    })
    .join('');

  const bioSize = 19;
  const bioLines = wrap('body', fonts.use('body', bio), bioSize, W - P - COL);
  const bioTop = 260;
  const bioEl = bioLines
    .map((l, i) => `<tspan x="${COL}" y="${bioTop + i * 31}">${esc(l)}</tspan>`)
    .join('');
  const bioEnd = bioTop + (bioLines.length - 1) * 31;

  // Stats strip
  const ruleY = bioEnd + 46;
  const numY = ruleY + 92;
  const statW = (W - 2 * P) / stats.length;
  const statDefs: string[] = [];
  const statEls = stats
    .map((s, i) => {
      const x = P + i * statW;
      const o = odometer(fonts, s.value, x, numY, 64, 0.8 + i * 0.12, `s${i}`);
      statDefs.push(o.defs);
      const suffix =
        s.suffix
          ? `<text x="${(x + o.width + 2).toFixed(1)}" y="${numY}" fill="${color.accent}" style="${fontStyle('display', 64)}">${esc(fonts.use('display', s.suffix))}</text>`
          : '';
      const liveDot =
        s.live
          ? `<g transform="translate(${x + measure('mono', s.label.toUpperCase(), 12, 1.4) + 16} ${numY + 34})"><circle r="2.5" fill="${color.accent}"/><circle class="ping" r="2.5" fill="none" stroke="${color.accent}"/></g>`
          : '';
      const sep = i ? `<line x1="${x - 24}" x2="${x - 24}" y1="${ruleY + 28}" y2="${numY + 44}" stroke="${color.line}"/>` : '';
      return `${sep}<g>${o.body}${suffix}</g><g class="reveal" style="animation-delay:${(1 + i * 0.2).toFixed(2)}s">${label(s.label, x, numY + 38)}${liveDot}</g>`;
    })
    .join('');

  const H = numY + 80;

  const ring = badge(fonts, P + 86, bioTop + 4, 70);
  const heading = fonts.use('bodyBold', 'About');
  const headingW = measure('bodyBold', heading, 44);
  fonts.use('bodyBold', '.');

  const body = `
  <g class="glow"><circle cx="${W - 40}" cy="${H - 10}" r="360" fill="url(#glowC)"/></g>

  <text class="reveal" x="${P}" y="72" fill="${color.muted}" style="${fontStyle('mono', 14)}">${fonts.use('mono', '# 001')}</text>
  <text class="reveal" style="animation-delay:.1s;${fontStyle('bodyBold', 44)}" x="${P}" y="128" fill="${color.fg}">${heading}<tspan fill="${color.accent}">.</tspan></text>
  <rect class="bar" x="${P}" y="148" width="${headingW + 12}" height="2" fill="${color.accent}"/>

  ${ring.body}
  ${factEls}

  <line class="rule" x1="${COL}" x2="${W - P}" y1="${bioTop - 52}" y2="${bioTop - 52}" stroke="${color.line}" style="animation-delay:.5s"/>
  <text class="reveal" style="animation-delay:.6s;${fontStyle('body', bioSize)}" fill="${color.subtle}">${bioEl}</text>

  <line class="rule" x1="${P}" x2="${W - P}" y1="${ruleY}" y2="${ruleY}" stroke="${color.line}" style="animation-delay:.8s"/>
  ${statEls}`;

  const css = `
  .glow{transform-origin:center;animation:breathe 9s ease-in-out infinite alternate}
  @keyframes breathe{from{opacity:.6;transform:scale(.92)}to{opacity:1;transform:scale(1.06)}}
  .ping{transform-origin:center;animation:ping 2s cubic-bezier(0,0,.2,1) infinite}
  @keyframes ping{from{transform:scale(1);opacity:.9}to{transform:scale(3.2);opacity:0}}
  .rule{transform-origin:left;animation:draw 1.2s var(--ease) both}
  @keyframes draw{from{transform:scaleX(0)}}
  .bar{transform-origin:left;animation:draw .9s var(--ease) .35s both}
  ${odometerCss}
  .spin{animation:spin 24s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .sway{animation:nudge 3s cubic-bezier(.16,1,.3,1) 1.5s infinite}
  @keyframes nudge{0%,55%,100%{transform:none}25%{transform:translate(4px,-4px)}}`;

  const defs = `
  <radialGradient id="glowC"><stop offset="0" stop-color="${color.accent}" stop-opacity=".22"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></radialGradient>
  ${ring.defs}
  ${statDefs.join('')}`;

  return card({
    height: H,
    title: 'About — tam11a',
    desc: `${facts.map((f) => `${f.label}: ${f.value}`).join('. ')}. ${bio} ${stats.map((s) => `${s.value}${s.suffix ?? ''} ${s.label}`).join(', ')}.`,
    defs,
    css,
    body,
    fonts,
  });
}
