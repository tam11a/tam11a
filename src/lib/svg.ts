import { canvas, color, font, type FontKey } from '../tokens.ts';
import { FontKit } from './fonts.ts';

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Inline style for a text node in one of the token fonts. */
export const fontStyle = (key: FontKey, size: number, extra = '') =>
  `font-family:'${font[key].family}';font-weight:${font[key].weight};font-size:${size}px;${extra}`;

/** Static film grain: one turbulence pass, rasterised once (animating it would cost every viewer CPU). */
export const grainDefs = (id = 'grain') => `
  <filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0"/>
  </filter>`;

// Shared motion rules. Base state is always the final frame, so reduced motion just drops animations.
const baseCss = `
  .reveal{animation:fadeUp .9s var(--ease) both}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @keyframes fade{from{opacity:0}to{opacity:1}}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

export interface Card {
  height: number;
  title: string;
  desc: string;
  defs?: string;
  css?: string;
  body: string;
  fonts: FontKit;
  width?: number;
}

/** Wraps a section in the shared rounded black card with grain and hairline border. */
export async function card({ height, title, desc, defs = '', css = '', body, fonts, width = canvas.width }: Card) {
  const { radius } = canvas;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<defs>
  <clipPath id="frame"><rect width="${width}" height="${height}" rx="${radius}"/></clipPath>
  ${grainDefs()}
  ${defs}
</defs>
<style>
  :root{--ease:cubic-bezier(.16,1,.3,1)}
  *{transform-box:fill-box}
  ${await fonts.css()}
  ${baseCss}
  ${css}
</style>
<g clip-path="url(#frame)">
  <rect width="${width}" height="${height}" fill="${color.bg}"/>
  ${body}
  <rect width="${width}" height="${height}" filter="url(#grain)" opacity="0.07"/>
</g>
<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${radius}" fill="none" stroke="${color.line}"/>
</svg>`;
}
