import type { Live } from '../lib/github.ts';
import { FontKit } from '../lib/fonts.ts';
import { card, mono, pixels } from '../lib/svg.ts';
import { canvas, color } from '../tokens.ts';

const W = canvas.width;
const H = 340;
const GROUND = 268;
const PX = 5; // one "pixel" in the sprites
const T = 3.2; // seconds per bug cycle

// tam, in 12 × 16 pixels: hair, glasses, beard, orange hoodie.
const head = [
  '...hhhhhh...',
  '..hhhhhhhh..',
  '..hhssssshh.',
  '..hggsggsh..',
  '..hssssssh..',
  '...sbsssbs..',
  '...bbbbbbb..',
  '....bbbbb...',
  '...oooooo...',
  '..oooooooo..',
  '.soooooooos.',
  '.s.oooooo.s.',
  '...oooooo...',
];
const legsA = ['...pp..pp...', '..pp....pp..', '.ww......ww.'];
const legsB = ['....pppp....', '....pppp....', '....wwww....'];
const pal = { h: '#3f3f46', s: '#e0a27a', g: '#18181b', b: '#27272a', o: color.accent, p: '#52525b', w: color.fg };

const bug = ['.g....g.', '..g..g..', '.gggggg.', 'gg.gg.gg', '.gggggg.', 'g.g..g.g'];
const coin = ['..cc..', '.cccc.', 'ccllcc', 'ccllcc', '.cccc.', '..cc..'];

/** Deterministic pseudo-random so rebuilds don't reshuffle the skyline. */
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
}

function skyline() {
  const r = rng(11);
  const out: string[] = [];
  for (let x = 0; x < W; ) {
    const w = 40 + Math.floor(r() * 5) * 10;
    const h = 50 + Math.floor(r() * 9) * 10;
    const fill = r() < 0.5 ? '#121212' : '#171717';
    const b = [`<rect x="${x}" y="${GROUND - h}" width="${w - 6}" height="${h}" fill="${fill}"/>`];
    for (let wy = GROUND - h + 10; wy < GROUND - 14; wy += 14)
      for (let wx = x + 8; wx < x + w - 14; wx += 12)
        if (r() < 0.22) b.push(`<rect class="win" style="animation-delay:${(r() * 6).toFixed(1)}s" x="${wx}" y="${wy}" width="4" height="5" fill="${color.accent}" fill-opacity=".55"/>`);
    out.push(b.join(''));
    x += w;
  }
  return out.join('');
}

/** Closing pixel level: tam runs through Dhaka, hops bugs, grabs commits. */
export async function egg(data: Live) {
  const fonts = new FontKit();
  const r = rng(3);
  const stars = Array.from({ length: 40 }, () =>
    `<rect class="star" style="animation-delay:${(r() * 4).toFixed(1)}s" x="${Math.floor(r() * W)}" y="${Math.floor(r() * 150) + 20}" width="3" height="3" fill="${color.fg}" fill-opacity=".7"/>`,
  ).join('');

  const city = skyline();
  const ground = Array.from({ length: W / 40 + 2 }, (_, i) =>
    `<rect x="${i * 40}" y="${GROUND}" width="38" height="6" fill="#262626"/><rect x="${i * 40 + 8}" y="${GROUND + 14}" width="14" height="4" fill="#1a1a1a"/>`,
  ).join('');

  const charX = 180;
  const charH = (head.length + legsA.length) * PX;
  const charY = GROUND - charH;
  const bugY = GROUND - bug.length * PX;
  const startX = W + 30;
  const travel = startX + 80;
  const hit = (startX + 20 - (charX + 30)) / travel; // fraction of the cycle when the bug reaches tam
  const pct = (f: number) => `${(f * 100).toFixed(1)}%`;
  const apex = 100;

  const hud = `
  ${mono(fonts, '1UP  TAM11A', 40, 44, { fill: color.fg, size: 14, tracking: 2 })}
  ${mono(fonts, 'LEVEL 1-1 · DHAKA', W / 2, 44, { anchor: 'middle', size: 14, tracking: 2 })}
  ${mono(fonts, `COMMITS ${data.contributions.toLocaleString('en-US')}`, W - 40, 44, { anchor: 'end', fill: color.accent, size: 14, tracking: 2 })}
  <g class="blink">${mono(fonts, 'Thanks for scrolling this far', W / 2, H - 22, { anchor: 'middle', size: 12, tracking: 2 })}</g>`;

  const body = `
  ${stars}
  <g class="far">${city}<g transform="translate(${W} 0)">${city}</g></g>
  <g class="near">${ground}</g>
  <rect x="0" y="${GROUND + 6}" width="${W}" height="${H - GROUND}" fill="#0b0b0b" fill-opacity=".6"/>

  <g class="bug">${pixels(bug, { g: '#88CE02' }, startX, bugY, PX)}</g>
  <g class="coin">${pixels(coin, { c: color.accent, l: '#ffb08f' }, startX + 5, charY - apex + 4, PX)}</g>

  <g class="jump">
    ${pixels(head, pal, charX, charY, PX)}
    <g class="fa">${pixels(legsA, pal, charX, charY + head.length * PX, PX)}</g>
    <g class="fb">${pixels(legsB, pal, charX, charY + head.length * PX, PX)}</g>
  </g>
  <g class="plus">${mono(fonts, '+1 commit', charX + 30, charY - apex - 14, { anchor: 'middle', fill: color.accent, size: 13, tracking: 1.4 })}</g>
  ${hud}`;

  const css = `
  .star{animation:tw 3.2s steps(2) infinite}
  @keyframes tw{50%{opacity:.15}}
  .win{animation:tw 6s steps(2) infinite}
  .far{animation:scroll 40s linear infinite}
  @keyframes scroll{to{transform:translateX(-${W}px)}}
  .near{animation:ground .5s linear infinite}
  @keyframes ground{to{transform:translateX(-40px)}}
  .fa{animation:run .28s steps(1) infinite}
  .fb{animation:run .28s steps(1) -.14s infinite}
  @keyframes run{50%{opacity:0}}
  .bug{animation:walk ${T}s linear infinite}
  .coin{animation:walk ${T}s linear infinite, grab ${T}s steps(1) infinite}
  @keyframes walk{to{transform:translateX(-${travel}px)}}
  @keyframes grab{0%{opacity:1}${pct(hit)}{opacity:0}}
  .jump{animation:jump ${T}s infinite}
  @keyframes jump{
    0%,${pct(hit - 0.09)}{transform:translateY(0);animation-timing-function:cubic-bezier(.2,.7,.4,1)}
    ${pct(hit)}{transform:translateY(-${apex}px);animation-timing-function:cubic-bezier(.6,0,.8,.3)}
    ${pct(hit + 0.09)},100%{transform:translateY(0)}}
  .plus{opacity:0;animation:plus ${T}s infinite}
  @keyframes plus{0%,${pct(hit)}{opacity:0;transform:translateY(0)}${pct(hit + 0.02)}{opacity:1}${pct(hit + 0.16)},100%{opacity:0;transform:translateY(-24px)}}
  .blink{animation:tw 1.4s steps(2) infinite}
  @media (prefers-reduced-motion:reduce){.plus,.coin{display:none}}`;

  return card({
    height: H,
    title: 'Level 1-1 — tam11a',
    desc: `Pixel-art mini level: tam runs through Dhaka at night, jumping over bugs and collecting commits. ${data.contributions} commits this year.`,
    css,
    body,
    fonts,
  });
}
