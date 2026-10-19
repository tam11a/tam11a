import { profile } from '../data.ts';
import type { Live } from '../lib/github.ts';
import { FontKit, measure, truncate } from '../lib/fonts.ts';
import { card, esc, fontStyle } from '../lib/svg.ts';
import { canvas, color } from '../tokens.ts';

const W = canvas.width;
const P = canvas.pad;
const ROW = 76;

function ago(iso: string, now: Date) {
  const mins = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 6e4));
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  const m = Math.round(d / 30);
  return m < 12 ? `${m}mo ago` : `${Math.round(m / 12)}y ago`;
}

/** Five most recently pushed public repos (own + orgs), refreshed hourly. */
export async function activity(data: Live) {
  const fonts = new FontKit();
  const mono = (s: string, x: number, y: number, fill: string = color.muted, anchor = 'start') =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" style="${fontStyle('mono', 12, 'letter-spacing:1.4px')}">${esc(fonts.use('mono', s.toUpperCase()))}</text>`;

  const top = 172;
  const nameX = P + 56;
  const metaX = W - P;

  const rows = data.recent
    .map((r, i) => {
      const y = top + i * ROW;
      const fresh = data.fetchedAt.getTime() - new Date(r.pushedAt).getTime() < 864e5;
      const owner = r.owner === profile.handle ? '' : `${r.owner} / `;
      const name = fonts.use('bodyBold', r.name);
      const ownerW = owner ? measure('bodyBold', fonts.use('bodyBold', owner), 20) : 0;
      const desc = fonts.use('body', truncate('body', r.description || 'No description yet.', 15, 560));

      const meta: string[] = [];
      let mx = metaX;
      const when = ago(r.pushedAt, data.fetchedAt);
      meta.push(mono(when, mx, y + 6, fresh ? color.accent : color.muted, 'end'));
      mx -= measure('mono', when.toUpperCase(), 12, 1.4) + 22;
      if (r.stars) {
        const s = String(r.stars);
        meta.push(mono(s, mx, y + 6, color.muted, 'end'));
        mx -= measure('mono', s, 12, 1.4) + 8;
        meta.push(`<path d="M${mx - 5} ${y - 4}l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="${color.muted}"/>`);
        mx -= 26;
      }
      if (r.language) {
        meta.push(mono(r.language, mx, y + 6, color.muted, 'end'));
        mx -= measure('mono', r.language.toUpperCase(), 12, 1.4) + 10;
        meta.push(`<circle cx="${mx}" cy="${y + 2}" r="3.5" fill="${color.accent}"/>`);
      }

      return `<g class="reveal" style="animation-delay:${(0.35 + i * 0.1).toFixed(2)}s">
        <text x="${P}" y="${y + 6}" fill="${color.muted}" style="${fontStyle('mono', 13)}">${fonts.use('mono', String(i + 1).padStart(2, '0'))}</text>
        <text x="${nameX}" y="${y + 6}" style="${fontStyle('bodyBold', 20)}">${owner ? `<tspan fill="${color.muted}">${esc(owner)}</tspan>` : ''}<tspan fill="${color.fg}">${esc(name)}</tspan></text>
        ${fresh ? `<g transform="translate(${(nameX + ownerW + measure('bodyBold', name, 20) + 14).toFixed(1)} ${y})"><circle r="3" fill="${color.accent}"/><circle class="ping" r="3" fill="none" stroke="${color.accent}"/></g>` : ''}
        <text x="${nameX}" y="${y + 32}" fill="${color.subtle}" style="${fontStyle('body', 15)}">${esc(desc)}</text>
        ${meta.join('')}
        <line x1="${P}" x2="${W - P}" y1="${y + 52}" y2="${y + 52}" stroke="${color.line}"/>
      </g>`;
    })
    .join('');

  const H = top + data.recent.length * ROW + 20;
  const heading = fonts.use('bodyBold', 'Recently active');
  fonts.use('bodyBold', '.');
  const headingW = measure('bodyBold', heading, 44);

  const body = `
  <rect class="scan" x="0" y="${top - 30}" width="${W}" height="${ROW}" fill="url(#scan)"/>

  <text class="reveal" x="${P}" y="72" fill="${color.muted}" style="${fontStyle('mono', 14)}">${fonts.use('mono', '# 006 — FEED')}</text>
  <text class="reveal" style="animation-delay:.1s;${fontStyle('bodyBold', 44)}" x="${P}" y="128" fill="${color.fg}">${heading}<tspan fill="${color.accent}">.</tspan></text>
  <rect class="bar" x="${P}" y="148" width="${headingW + 12}" height="2" fill="${color.accent}"/>
  <g class="reveal" style="animation-delay:.2s">${mono('Public repos · last push', W - P, 128, color.muted, 'end')}</g>

  ${rows}`;

  // A soft highlight sweeps down the list, one row at a time.
  const n = data.recent.length;
  const stops = Array.from({ length: n }, (_, i) => {
    const a = ((i / n) * 100).toFixed(1);
    const b = (((i + 0.8) / n) * 100).toFixed(1);
    return `${a}%,${b}%{transform:translateY(${i * ROW}px)}`;
  }).join('');

  const css = `
  .ping{transform-origin:center;animation:ping 2s cubic-bezier(0,0,.2,1) infinite}
  @keyframes ping{from{transform:scale(1);opacity:.9}to{transform:scale(3.2);opacity:0}}
  .bar{transform-origin:left;animation:draw .9s var(--ease) .35s both}
  @keyframes draw{from{transform:scaleX(0)}}
  .scan{animation:scan ${n * 2.4}s cubic-bezier(.65,0,.35,1) 1.5s infinite both}
  @keyframes scan{${stops}100%{transform:translateY(0)}}
  @media (prefers-reduced-motion:reduce){.scan{display:none}}`;

  const defs = `
  <linearGradient id="scan" x1="0" x2="1"><stop offset="0" stop-color="${color.accent}" stop-opacity="0"/><stop offset=".5" stop-color="${color.accent}" stop-opacity=".07"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/></linearGradient>`;

  return card({
    height: H,
    title: 'Recently active — tam11a',
    desc: data.recent.map((r) => `${r.owner}/${r.name}: ${r.description} (${ago(r.pushedAt, data.fetchedAt)})`).join('. '),
    defs,
    css,
    body,
    fonts,
  });
}
