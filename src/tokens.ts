// Design tokens lifted from the v4 portfolio (v4-tam11a.netlify.app).
export const color = {
  bg: '#000000',
  fg: '#F5F5F5',
  accent: '#F53F06',
  muted: '#71717A', // labels, section numbers
  subtle: '#A1A1AA', // body copy
  line: 'rgba(245,245,245,0.1)',
  faint: 'rgba(245,245,245,0.05)',
} as const;

export const font = {
  display: { family: 'Josefin Sans', weight: 700, file: 'josefin-sans/files/josefin-sans-latin-700-normal.woff2' },
  body: { family: 'Josefin Sans', weight: 300, file: 'josefin-sans/files/josefin-sans-latin-300-normal.woff2' },
  bodyBold: { family: 'Josefin Sans', weight: 600, file: 'josefin-sans/files/josefin-sans-latin-600-normal.woff2' },
  mono: { family: 'Anta', weight: 400, file: 'anta/files/anta-latin-400-normal.woff2' },
} as const;

export type FontKey = keyof typeof font;

// Every card shares the README content width so sections line up edge to edge.
export const canvas = { width: 1000, radius: 16, pad: 56 } as const;

// Phone variants: ~330px README column, so a 400px canvas renders at ~80% and
// nothing below 13px stays legible.
export const mobile = { width: 400, pad: 24, min: 13 } as const;

export const ease = {
  out: 'cubic-bezier(.16,1,.3,1)',
  inOut: 'cubic-bezier(.65,0,.35,1)',
} as const;
