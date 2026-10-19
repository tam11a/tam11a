import { profile } from '../data.ts';
import { FontKit, measure } from '../lib/fonts.ts';
import type { Live } from '../lib/github.ts';
import { card, esc, fontStyle } from '../lib/svg.ts';
import { canvas, color } from '../tokens.ts';

const W = canvas.width;
const H = 460;
const P = canvas.pad;

/**
 * "Good evening from Dhaka". The hourly cron rebuilds this, so it shows the part of day
 * rather than minutes, which would always be stale by the time someone looks.
 */
function dhakaClock(now: Date) {
  const hh = Number(new Intl.DateTimeFormat('en-GB', { timeZone: profile.timezone, hour: '2-digit', hour12: false }).format(now)) % 24;
  const part = hh < 5 ? 'night' : hh < 12 ? 'morning' : hh < 17 ? 'afternoon' : hh < 20 ? 'evening' : 'night';
  return { part, greeting: `Good ${part} from Dhaka`, zone: 'GMT+6' };
}

/** Sun with turning rays by day, crescent with a twinkle by night. */
function skyIcon(part: string, cx: number, cy: number) {
  const origin = `transform-box:view-box;transform-origin:${cx}px ${cy}px`;
  if (part === 'night' || part === 'evening') {
    return `<g fill="${color.accent}">
      <path d="M${cx + 2} ${cy - 7}a7 7 0 1 0 5 12a5.6 5.6 0 0 1 -5 -12z"/>
      <path class="twinkle" style="transform-box:view-box;transform-origin:${cx + 9}px ${cy - 7}px" d="M${cx + 9} ${cy - 10}l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>
    </g>`;
  }
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    const [x1, y1, x2, y2] = [7.5, 7.5, 10.5, 10.5].map((r, k) => (k % 2 ? cy + Math.sin(a) * r : cx + Math.cos(a) * r));
    return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }).join('');
  return `<circle cx="${cx}" cy="${cy}" r="4.5" fill="${color.accent}"/>
    <path class="rays" style="${origin}" d="${rays}" stroke="${color.accent}" stroke-width="1.6" stroke-linecap="round"/>`;
}

/**
 * Typewriter built from SMIL (works in every browser's <img> renderer, unlike CSS width).
 * Each phrase owns a clip rect whose width jumps to the measured width of each typed prefix.
 */
function rotator(fonts: FontKit, x: number, y: number) {
  const size = 14;
  const tracking = 1.2;
  const type = 0.065;
  const erase = 0.03;
  const hold = 1.9;
  const gap = 0.35;
  const phrases = profile.rotator.map((p) => fonts.use('mono', p.toUpperCase()));

  type Step = { t: number; w: number };
  const tracks: Step[][] = [];
  let t = 0;
  for (const p of phrases) {
    const chars = [...p];
    const prefix = (k: number) => measure('mono', chars.slice(0, k).join(''), size, tracking);
    const steps: Step[] = [{ t, w: 0 }];
    for (let k = 1; k <= chars.length; k++) steps.push({ t: (t += type), w: prefix(k) });
    t += hold;
    for (let k = chars.length - 1; k >= 0; k--) steps.push({ t: (t += erase), w: prefix(k) });
    t += gap;
    tracks.push(steps);
  }
  const total = t;

  const key = (s: Step[]) => {
    // Discrete SMIL needs keyTimes starting at 0; pad the front/back with an empty frame.
    const pts = [{ t: 0, w: 0 }, ...s.filter((p) => p.t > 0)];
    return {
      values: pts.map((p) => p.w.toFixed(1)).join(';'),
      keyTimes: pts.map((p) => (p.t / total).toFixed(5)).join(';'),
    };
  };

  const clips = tracks
    .map((s, i) => {
      const k = key(s);
      return `<clipPath id="type${i}"><rect x="${x}" y="${y - 16}" width="0" height="24">
        <animate attributeName="width" dur="${total.toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" values="${k.values}" keyTimes="${k.keyTimes}"/>
      </rect></clipPath>`;
    })
    .join('');

  const caret = key(tracks.flat());
  const caretX = caret.values
    .split(';')
    .map((w) => `${(Number(w) + 4).toFixed(1)},0`)
    .join(';');

  const text = phrases
    .map(
      (p, i) =>
        `<text x="${x}" y="${y}" clip-path="url(#type${i})" fill="${color.fg}" style="${fontStyle('mono', size, `letter-spacing:${tracking}px`)}">${esc(p)}</text>`,
    )
    .join('');

  // Static fallback for reduced motion: first phrase fully typed.
  const still = `<text class="still" x="${x}" y="${y}" fill="${color.fg}" style="${fontStyle('mono', size, `letter-spacing:${tracking}px`)}">${esc(phrases[0])}</text>`;

  return {
    defs: clips,
    body: `<g class="typer">${text}
      <g><animateTransform attributeName="transform" type="translate" dur="${total.toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" values="${caretX}" keyTimes="${caret.keyTimes}"/>
        <rect class="caret" x="${x}" y="${y - 13}" width="8" height="16" fill="${color.accent}"/>
      </g></g>${still}`,
  };
}

export async function hero(live: Live) {
  const fonts = new FontKit();
  const { part, greeting, zone } = dhakaClock(live.fetchedAt);

  // Wordmark: each letter positioned by measured prefix width so kerning survives the split.
  const size = 196;
  const base = 292;
  const word = profile.wordmark;
  fonts.use('display', word + '.');
  const letters = [...word]
    .map((ch, i) => {
      const x = P - 8 + measure('display', word.slice(0, i), size);
      return `<text class="letter" style="animation-delay:${0.15 + i * 0.09}s;${fontStyle('display', size)}" x="${x.toFixed(1)}" y="${base}" fill="${color.fg}">${ch}</text>`;
    })
    .join('');
  const dotX = P - 8 + measure('display', word, size);

  const typer = rotator(fonts, P + 22, H - 34);
  const label = fonts.use('mono', '# 000');
  const right = fonts.use('mono', `${greeting} — ${zone}`.toUpperCase());
  const rightW = measure('mono', right, 12, 1.2);
  const link = fonts.use('mono', 'TAM11A.DEV');
  const tagline = fonts.use('body', profile.tagline);

  const tick = (x: number, y: number) =>
    `<path d="M${x - 6} ${y}h12M${x} ${y - 6}v12" stroke="${color.muted}" stroke-opacity=".5"/>`;

  const body = `
  <g class="glow"><circle cx="150" cy="40" r="460" fill="url(#glowA)"/></g>
  <g class="glow2"><circle cx="${W - 60}" cy="${H + 40}" r="320" fill="url(#glowB)"/></g>

  ${tick(P - 24, 36)}${tick(W - P + 24, 36)}${tick(P - 24, H - 72)}${tick(W - P + 24, H - 72)}

  <text class="reveal" x="${P}" y="68" fill="${color.muted}" style="${fontStyle('mono', 14)}">${label}</text>
  <g class="reveal" style="animation-delay:.2s">
    ${skyIcon(part, W - P - rightW - 20, 63)}
    <text x="${W - P}" y="68" text-anchor="end" fill="${color.muted}" style="${fontStyle('mono', 12, 'letter-spacing:1.2px')}">${right}</text>
  </g>

  <g clip-path="url(#mark)">${letters}</g>
  <text class="dot" x="${dotX.toFixed(1)}" y="${base}" fill="${color.accent}" style="${fontStyle('display', size)}">.</text>

  <text class="reveal" style="animation-delay:.75s;${fontStyle('body', 27)}" x="${P}" y="${base + 62}" fill="${color.fg}">${esc(tagline)}</text>

  <line class="rule" x1="${P}" x2="${W - P}" y1="${H - 72}" y2="${H - 72}" stroke="${color.line}"/>

  <g class="reveal" style="animation-delay:1.1s">
    <path d="M${P} ${H - 44}l7 5-7 5" fill="none" stroke="${color.accent}" stroke-width="1.6"/>
    ${typer.body}
    <text x="${W - P - 18}" y="${H - 34}" text-anchor="end" fill="${color.muted}" style="${fontStyle('mono', 12, 'letter-spacing:1.2px')}">${link}</text>
    <path class="arrow" d="M${W - P - 10} ${H - 38}l8-8m-6 0h6v6" fill="none" stroke="${color.accent}" stroke-width="1.6"/>
  </g>`;

  const css = `
  .glow,.glow2{transform-origin:center}
  .glow{animation:drift 16s ease-in-out infinite alternate}
  .glow2{animation:drift 22s ease-in-out -6s infinite alternate-reverse}
  @keyframes drift{0%{transform:translate(0,0) scale(1)}50%{transform:translate(70px,26px) scale(1.12)}100%{transform:translate(-30px,50px) scale(.94)}}
  .letter{animation:rise 1.1s var(--ease) both}
  @keyframes rise{from{transform:translateY(105%)}}
  .dot{transform-origin:center;animation:pop .7s cubic-bezier(.34,1.56,.64,1) .5s both, beat 2.6s ease-in-out 1.6s infinite}
  @keyframes pop{from{transform:scale(0);opacity:0}}
  @keyframes beat{0%,100%{opacity:1}50%{opacity:.45}}
  .rays{animation:spin 18s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .twinkle{animation:twinkle 2.8s ease-in-out infinite}
  @keyframes twinkle{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.4);opacity:.4}}
  .rule{transform-origin:left;animation:draw 1.2s var(--ease) .9s both}
  @keyframes draw{from{transform:scaleX(0)}}
  .caret{animation:blink 1s steps(1) infinite}
  @keyframes blink{50%{opacity:0}}
  .arrow{animation:nudge 2.4s var(--ease) 2s infinite}
  @keyframes nudge{0%,60%,100%{transform:none}30%{transform:translate(3px,-3px)}}
  .still{display:none}
  @media (prefers-reduced-motion:reduce){.typer{display:none}.still{display:inline}}`;

  const defs = `
  <radialGradient id="glowA"><stop offset="0" stop-color="${color.accent}" stop-opacity=".55"/><stop offset=".45" stop-color="${color.accent}" stop-opacity=".12"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowB"><stop offset="0" stop-color="${color.accent}" stop-opacity=".18"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></radialGradient>
  <clipPath id="mark"><rect x="0" y="${base - size}" width="${W}" height="${size + 8}"/></clipPath>
  ${typer.defs}`;

  return card({
    height: H,
    title: `${profile.name} — tam.`,
    desc: `${profile.tagline} ${profile.rotator.join(' · ')}`,
    defs,
    css,
    body,
    fonts,
  });
}
