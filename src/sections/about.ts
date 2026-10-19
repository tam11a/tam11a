import { profile } from '../data.ts';
import { FontKit, measure, wrap } from '../lib/fonts.ts';
import type { Live } from '../lib/github.ts';
import { odometer, odometerCss } from '../lib/odometer.ts';
import { card, esc, fontStyle, mono, para } from '../lib/svg.ts';
import { canvas, color, mobile } from '../tokens.ts';

const W = canvas.width;
const P = canvas.pad;

/** Circular text badge that slowly spins, the classic portfolio "available" stamp. */
function badge(fonts: FontKit, cx: number, cy: number, r: number, size = 11) {
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

  // Facts: one full-width row, columns sized to their content with even gaps between.
  const factSize = 15;
  const widths = facts.map((f) =>
    Math.max(
      measure('mono', f.label.toUpperCase(), 12, 1.4),
      measure('mono', f.value.toUpperCase(), factSize, 1.2) + ('status' in f && f.status ? 18 : 0),
    ),
  );
  const factGap = (W - 2 * P - widths.reduce((a, b) => a + b, 0)) / (facts.length - 1);
  let fx = P;
  const factEls = facts
    .map((f, i) => {
      const x = fx;
      fx += widths[i] + factGap;
      const y = 64;
      const val = fonts.use('mono', f.value.toUpperCase());
      const status = 'status' in f && f.status;
      const valueEl = status
        ? `<circle cx="${x + 5}" cy="${y + 25}" r="4" fill="${color.accent}"/>
           <circle class="ping" cx="${x + 5}" cy="${y + 25}" r="4" fill="none" stroke="${color.accent}" stroke-width="1.4"/>
           <text x="${x + 18}" y="${y + 30}" fill="${color.accent}" style="${fontStyle('mono', factSize, 'letter-spacing:1.2px')}">${esc(val)}</text>`
        : `<text x="${x.toFixed(1)}" y="${y + 30}" fill="${color.fg}" style="${fontStyle('mono', factSize, 'letter-spacing:1.2px')}">${esc(val)}</text>`;
      return `<g class="reveal" style="animation-delay:${(0.1 + i * 0.1).toFixed(2)}s">${label(f.label, Number(x.toFixed(1)), y)}${valueEl}</g>`;
    })
    .join('');

  const bioSize = 19;
  const bioLines = wrap('body', fonts.use('body', bio), bioSize, W - 2 * P);
  const bioTop = 180;
  const bioEl = bioLines
    .map((l, i) => `<tspan x="${P}" y="${bioTop + i * 31}">${esc(l)}</tspan>`)
    .join('');
  const bioEnd = bioTop + (bioLines.length - 1) * 31;

  // Stats strip, with the spinning badge as a fourth item on the right.
  const ruleY = bioEnd + 46;
  const numY = ruleY + 92;
  const badgeR = 52;
  const badgeSpace = 2 * (badgeR + 16) + 24;
  const statW = (W - 2 * P - badgeSpace) / stats.length;
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
  const ring = badge(fonts, W - P - badgeR - 16, (ruleY + H) / 2, badgeR);

  const body = `
  <g class="glow"><circle cx="150" cy="0" r="420" fill="url(#glowT)"/></g>
  <g class="glow"><circle cx="${W - 40}" cy="${H - 10}" r="360" fill="url(#glowC)"/></g>

  ${factEls}

  <line class="rule" x1="${P}" x2="${W - P}" y1="${bioTop - 52}" y2="${bioTop - 52}" stroke="${color.line}" style="animation-delay:.4s"/>
  <text class="reveal" style="animation-delay:.5s;${fontStyle('body', bioSize)}" fill="${color.subtle}">${bioEl}</text>

  <line class="rule" x1="${P}" x2="${W - P}" y1="${ruleY}" y2="${ruleY}" stroke="${color.line}" style="animation-delay:.7s"/>
  ${statEls}
  <line x1="${W - P - badgeSpace + 8}" x2="${W - P - badgeSpace + 8}" y1="${ruleY + 28}" y2="${numY + 44}" stroke="${color.line}"/>
  ${ring.body}`;

  const css = `
  .glow{transform-origin:center;animation:breathe 9s ease-in-out infinite alternate}
  @keyframes breathe{from{opacity:.6;transform:scale(.92)}to{opacity:1;transform:scale(1.06)}}
  .ping{transform-origin:center;animation:ping 2s cubic-bezier(0,0,.2,1) infinite}
  @keyframes ping{from{transform:scale(1);opacity:.9}to{transform:scale(3.2);opacity:0}}
  .rule{transform-origin:left;animation:draw 1.2s var(--ease) both}
  @keyframes draw{from{transform:scaleX(0)}}
  ${odometerCss}
  .spin{animation:spin 24s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .sway{animation:nudge 3s cubic-bezier(.16,1,.3,1) 1.5s infinite}
  @keyframes nudge{0%,55%,100%{transform:none}25%{transform:translate(4px,-4px)}}`;

  const defs = `
  <radialGradient id="glowT"><stop offset="0" stop-color="${color.accent}" stop-opacity=".4"/><stop offset=".5" stop-color="${color.accent}" stop-opacity=".08"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></radialGradient>
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

/** Phone layout: facts stacked in rows, bio, then a 2 × 2 of stats with the badge as the fourth cell. */
export async function aboutMobile(live: Live) {
  const fonts = new FontKit();
  const MW = mobile.width;
  const MP = mobile.pad;
  const { facts, bio } = profile.about;
  const stats = profile.about.stats.map((s) => ({ ...s, value: s.live ? live[s.live].toLocaleString('en-US') : s.value! }));

  // Role gets its own row (it's the longest); the rest pair up.
  const slots = [
    [0, MP, 44],
    [1, MP, 112],
    [2, MP + 216, 112],
    [3, MP, 180],
  ] as const;
  const factEls = slots
    .map(([i, x, y], k) => {
      const f = facts[i];
      const status = 'status' in f && f.status;
      const val = f.value.toUpperCase();
      const value = status
        ? `<circle cx="${x + 5}" cy="${y + 23}" r="4" fill="${color.accent}"/><circle class="ping" cx="${x + 5}" cy="${y + 23}" r="4" fill="none" stroke="${color.accent}" stroke-width="1.4"/>
           ${mono(fonts, val, x + 18, y + 28, { size: 15, fill: color.accent, tracking: 1.2 })}`
        : mono(fonts, val, x, y + 28, { size: 15, fill: color.fg, tracking: 1.2 });
      return `<g class="reveal" style="animation-delay:${(0.1 + k * 0.08).toFixed(2)}s">${mono(fonts, f.label, x, y, { size: mobile.min })}${value}</g>`;
    })
    .join('');

  const rule1 = 236;
  const b = para(fonts, bio, MP, rule1 + 44, MW - 2 * MP, 16, 25, color.subtle, 0.4);
  const rule2 = b.last + 38;

  // Left column a bit wider so "Contributions / yr" clears the divider.
  const colX = [MP, MP + 200];
  const rowY = [rule2 + 70, rule2 + 178];
  const statDefs: string[] = [];
  const statEls = stats
    .map((st, i) => {
      const x = colX[i % 2];
      const y = rowY[Math.floor(i / 2)];
      const o = odometer(fonts, st.value, x, y, 46, 0.6 + i * 0.12, `m${i}`);
      statDefs.push(o.defs);
      const suffix = st.suffix
        ? `<text x="${(x + o.width + 2).toFixed(1)}" y="${y}" fill="${color.accent}" style="${fontStyle('display', 46)}">${esc(fonts.use('display', st.suffix))}</text>`
        : '';
      return `<g>${o.body}${suffix}</g><g class="reveal" style="animation-delay:${(0.9 + i * 0.15).toFixed(2)}s">${mono(fonts, st.label, x, y + 30, { size: mobile.min })}</g>`;
    })
    .join('');
  const ring = badge(fonts, (colX[1] + MW - MP) / 2 - 6, rowY[1] + 2, 36, 10);
  const H = rowY[1] + 76;

  const body = `
  <g class="glow"><circle cx="40" cy="0" r="300" fill="url(#glowT)"/></g>
  <g class="glow"><circle cx="${MW}" cy="${H}" r="260" fill="url(#glowC)"/></g>
  ${factEls}
  <line class="rule" x1="${MP}" x2="${MW - MP}" y1="${rule1}" y2="${rule1}" stroke="${color.line}" style="animation-delay:.35s"/>
  ${b.body}
  <line class="rule" x1="${MP}" x2="${MW - MP}" y1="${rule2}" y2="${rule2}" stroke="${color.line}" style="animation-delay:.6s"/>
  <line x1="${colX[1] - 16}" x2="${colX[1] - 16}" y1="${rule2 + 24}" y2="${H - 24}" stroke="${color.line}"/>
  <line x1="${MP}" x2="${MW - MP}" y1="${rowY[0] + 50}" y2="${rowY[0] + 50}" stroke="${color.line}"/>
  ${statEls}
  ${ring.body}`;

  const css = `
  .glow{transform-origin:center;animation:breathe 9s ease-in-out infinite alternate}
  @keyframes breathe{from{opacity:.6;transform:scale(.92)}to{opacity:1;transform:scale(1.06)}}
  .ping{transform-origin:center;animation:ping 2s cubic-bezier(0,0,.2,1) infinite}
  @keyframes ping{from{transform:scale(1);opacity:.9}to{transform:scale(3.2);opacity:0}}
  .rule{transform-origin:left;animation:draw 1.2s var(--ease) both}
  @keyframes draw{from{transform:scaleX(0)}}
  ${odometerCss}
  .spin{animation:spin 24s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .sway{animation:nudge 3s cubic-bezier(.16,1,.3,1) 1.5s infinite}
  @keyframes nudge{0%,55%,100%{transform:none}25%{transform:translate(4px,-4px)}}`;

  return card({
    width: MW,
    height: H,
    title: 'About — tam11a',
    desc: `${facts.map((f) => `${f.label}: ${f.value}`).join('. ')}. ${bio}`,
    defs: `<radialGradient id="glowT"><stop offset="0" stop-color="${color.accent}" stop-opacity=".4"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></radialGradient>
      <radialGradient id="glowC"><stop offset="0" stop-color="${color.accent}" stop-opacity=".22"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></radialGradient>
      ${ring.defs}${statDefs.join('')}`,
    css,
    body,
    fonts,
  });
}
