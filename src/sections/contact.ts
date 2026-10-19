import { siDribbble } from 'simple-icons';
import { contact, profile } from '../data.ts';
import { FontKit, measure } from '../lib/fonts.ts';
import { arrow, card, esc, fontStyle, header, headerM, mono, sharedCss } from '../lib/svg.ts';
import { canvas, color, mobile } from '../tokens.ts';

const W = canvas.width;
const P = canvas.pad;
const COL = 400;

/** Closing card: big call to action, email, and the tam. sign-off. */
export async function contactCard(year = new Date().getFullYear()) {
  const fonts = new FontKit();
  const email = fonts.use('mono', contact.email.toUpperCase());
  const emailW = measure('mono', email, 15, 1.4);
  const footY = 360;

  const body = `
  <g class="glow"><circle cx="${W - 120}" cy="40" r="440" fill="url(#glowK)"/></g>
  ${header(fonts, '# 007', "Let's build something great")}
  <g class="reveal" style="animation-delay:.4s">
    ${mono(fonts, 'Mail', COL, 222)}
    <text x="${COL}" y="252" fill="${color.fg}" style="${fontStyle('mono', 15, 'letter-spacing:1.4px')}">${esc(email)}</text>
    <rect class="uline" x="${COL}" y="262" width="${emailW.toFixed(1)}" height="1.5" fill="${color.accent}"/>
    ${arrow(COL + emailW + 10, 240, 9)}
  </g>
  <g class="reveal" style="animation-delay:.5s">
    <circle cx="${P + 4}" cy="${218}" r="3.5" fill="${color.accent}"/>
    <circle class="ping" cx="${P + 4}" cy="${218}" r="3.5" fill="none" stroke="${color.accent}"/>
    ${mono(fonts, 'Open to work', P + 18, 222, { fill: color.accent })}
    ${mono(fonts, 'Dhaka, Bangladesh · GMT+6', P, 248)}
  </g>

  <line class="rule" x1="${P}" x2="${W - P}" y1="${footY - 56}" y2="${footY - 56}" stroke="${color.line}" style="animation-delay:.6s"/>
  <g class="reveal" style="animation-delay:.7s">
    <text x="${P}" y="${footY}" fill="${color.fg}" style="${fontStyle('display', 34)}">${esc(fonts.use('display', profile.wordmark))}<tspan class="beat" fill="${color.accent}">${fonts.use('display', '.')}</tspan></text>
    ${mono(fonts, `© ${year} ${profile.name}`, W / 2, footY - 4, { anchor: 'middle' })}
    ${mono(fonts, 'Built with Node · SVG · Actions', W - P, footY - 4, { anchor: 'end' })}
  </g>`;

  const css = `${sharedCss}
  .uline{transform-origin:left;animation:uline 3.2s cubic-bezier(.65,0,.35,1) 1s infinite}
  @keyframes uline{0%{transform:scaleX(0);transform-origin:left}40%,60%{transform:scaleX(1);transform-origin:left}60.01%{transform-origin:right}100%{transform:scaleX(0);transform-origin:right}}
  .beat{animation:beat 2.6s ease-in-out infinite}
  @keyframes beat{0%,100%{opacity:1}50%{opacity:.4}}`;

  return card({
    height: footY + 42,
    title: 'Contact — tam11a',
    desc: `Let's build something great. Mail ${contact.email}. Open to work, based in Dhaka, Bangladesh.`,
    defs: `<radialGradient id="glowK"><stop offset="0" stop-color="${color.accent}" stop-opacity=".28"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></radialGradient>`,
    css,
    body,
    fonts,
  });
}

const s = color.accent;
const icon: Record<string, (x: number, y: number) => string> = {
  mail: (x, y) => `<rect x="${x}" y="${y + 3}" width="20" height="14" rx="2.5" fill="none" stroke="${s}" stroke-width="1.8"/><path d="M${x + 1} ${y + 5}l9 6.5 9-6.5" fill="none" stroke="${s}" stroke-width="1.8" stroke-linejoin="round"/>`,
  site: (x, y) => `<circle cx="${x + 10}" cy="${y + 10}" r="9" fill="none" stroke="${s}" stroke-width="1.8"/><ellipse cx="${x + 10}" cy="${y + 10}" rx="4" ry="9" fill="none" stroke="${s}" stroke-width="1.5"/><path d="M${x + 1} ${y + 10}h18" stroke="${s}" stroke-width="1.5"/>`,
  linkedin: (x, y) => `<rect x="${x}" y="${y}" width="20" height="20" rx="3.5" fill="${s}"/><path d="M${x + 5} ${y + 8.5}v7M${x + 9.5} ${y + 15.5}v-7M${x + 9.5} ${y + 11.5}q0-3 3-3t3 3v4" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/><circle cx="${x + 5}" cy="${y + 5}" r="1.3" fill="#000"/>`,
  dribbble: (x, y) => `<path transform="translate(${x - 1} ${y - 1}) scale(${22 / 24})" d="${siDribbble.path}" fill="${s}"/>`,
  resume: (x, y) => `<path d="M${x + 3} ${y}h9l5 5v15h-14z" fill="none" stroke="${s}" stroke-width="1.8" stroke-linejoin="round"/><path d="M${x + 10} ${y + 7}v8m-3-3 3 3 3-3" fill="none" stroke="${s}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
};

/** Pill button image; README lays five of these out in a row, each with its own link. */
export async function contactButton(i: number) {
  const link = contact.links[i];
  const fonts = new FontKit();
  const BW = 188;
  const BH = 60;
  const label = fonts.use('mono', link.label.toUpperCase());
  const body = `
  <rect x="1" y="1" width="${BW - 2}" height="${BH - 2}" rx="15" fill="none" stroke="url(#run)" stroke-width="1.5"/>
  ${icon[link.id](22, BH / 2 - 10)}
  <text x="56" y="${BH / 2 + 5}" fill="${color.fg}" style="${fontStyle('mono', 13, 'letter-spacing:1.4px')}">${esc(label)}</text>
  ${arrow(BW - 34, BH / 2 - 6, 9, color.muted)}`;
  const defs = `
  <linearGradient id="run" gradientUnits="userSpaceOnUse" x1="-${BW}" y1="0" x2="0" y2="0">
    <stop offset="0" stop-color="${color.accent}" stop-opacity="0"/><stop offset=".5" stop-color="${color.accent}"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="0 0;${BW * 2} 0;${BW * 2} 0" keyTimes="0;.45;1" dur="5s" begin="${(i * 0.35).toFixed(2)}s" repeatCount="indefinite"/>
  </linearGradient>`;
  return card({
    width: BW,
    height: BH,
    title: link.label,
    desc: `${link.label}: ${link.href.replace(/^mailto:/, '')}`,
    defs,
    css: sharedCss,
    body,
    fonts,
  });
}

/** Phone layout: the call to action over two lines, status, email, then the sign-off. */
export async function contactMobile(year = new Date().getFullYear()) {
  const fonts = new FontKit();
  const MW = mobile.width;
  const MP = mobile.pad;
  const h = headerM(fonts, '# 007', ["Let's build", 'something great']);
  const email = fonts.use('mono', contact.email.toUpperCase());
  const emailW = measure('mono', email, 14, 1.2);
  const sY = h.bottom + 44;
  const mY = sY + 72;
  const footY = mY + 104;

  const body = `
  <g class="glow"><circle cx="${MW}" cy="0" r="320" fill="url(#glowK)"/></g>
  ${h.body}
  <g class="reveal" style="animation-delay:.3s">
    <circle cx="${MP + 4}" cy="${sY - 4}" r="3.5" fill="${color.accent}"/>
    <circle class="ping" cx="${MP + 4}" cy="${sY - 4}" r="3.5" fill="none" stroke="${color.accent}"/>
    ${mono(fonts, 'Open to work', MP + 18, sY, { size: mobile.min, fill: color.accent })}
    ${mono(fonts, 'Dhaka, Bangladesh · GMT+6', MP, sY + 24, { size: mobile.min })}
  </g>
  <g class="reveal" style="animation-delay:.4s">
    ${mono(fonts, 'Mail', MP, mY, { size: mobile.min })}
    <text x="${MP}" y="${mY + 28}" fill="${color.fg}" style="${fontStyle('mono', 14, 'letter-spacing:1.2px')}">${esc(email)}</text>
    <rect class="uline" x="${MP}" y="${mY + 38}" width="${emailW.toFixed(1)}" height="1.5" fill="${color.accent}"/>
    ${arrow(MP + emailW + 8, mY + 17, 8)}
  </g>
  <line class="rule" x1="${MP}" x2="${MW - MP}" y1="${footY - 50}" y2="${footY - 50}" stroke="${color.line}" style="animation-delay:.5s"/>
  <g class="reveal" style="animation-delay:.6s">
    <text x="${MP}" y="${footY}" fill="${color.fg}" style="${fontStyle('display', 30)}">${esc(fonts.use('display', profile.wordmark))}<tspan class="beat" fill="${color.accent}">${fonts.use('display', '.')}</tspan></text>
    ${mono(fonts, `© ${year} ${profile.name}`, MW - MP, footY - 4, { size: 11, anchor: 'end' })}
  </g>`;

  return card({
    width: MW,
    height: footY + 36,
    title: 'Contact — tam11a',
    desc: `Let's build something great. Mail ${contact.email}. Open to work, based in Dhaka, Bangladesh.`,
    defs: `<radialGradient id="glowK"><stop offset="0" stop-color="${color.accent}" stop-opacity=".28"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></radialGradient>`,
    css: `${sharedCss}
  .uline{transform-origin:left;animation:uline 3.2s cubic-bezier(.65,0,.35,1) 1s infinite}
  @keyframes uline{0%{transform:scaleX(0);transform-origin:left}40%,60%{transform:scaleX(1);transform-origin:left}60.01%{transform-origin:right}100%{transform:scaleX(0);transform-origin:right}}
  .beat{animation:beat 2.6s ease-in-out infinite}
  @keyframes beat{0%,100%{opacity:1}50%{opacity:.4}}`,
    body,
    fonts,
  });
}

/** Phone button: a square with just the icon, so five still fit in one row. */
export async function contactButtonMobile(i: number) {
  const link = contact.links[i];
  const fonts = new FontKit();
  const S = 96;
  const body = `
  <rect x="1" y="1" width="${S - 2}" height="${S - 2}" rx="15" fill="none" stroke="url(#run)" stroke-width="2"/>
  <g transform="translate(${S / 2 - 20} ${S / 2 - 20}) scale(2)">${icon[link.id](0, 0)}</g>`;
  return card({
    width: S,
    height: S,
    title: link.label,
    desc: `${link.label}: ${link.href.replace(/^mailto:/, '')}`,
    defs: `<linearGradient id="run" gradientUnits="userSpaceOnUse" x1="0" y1="${S / 2}" x2="${S}" y2="${S / 2}">
      <stop offset=".3" stop-color="${color.accent}" stop-opacity="0"/><stop offset=".5" stop-color="${color.accent}"/><stop offset=".7" stop-color="${color.accent}" stop-opacity="0"/>
      <animateTransform attributeName="gradientTransform" type="rotate" from="0 ${S / 2} ${S / 2}" to="360 ${S / 2} ${S / 2}" dur="6s" begin="-${(i * 1.2).toFixed(1)}s" repeatCount="indefinite"/>
    </linearGradient>`,
    css: sharedCss,
    body,
    fonts,
  });
}
