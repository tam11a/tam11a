import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { loadLive } from './lib/github.ts';
import { previewHtml } from './preview.ts';
import { about } from './sections/about.ts';
import { activity } from './sections/activity.ts';
import { hero } from './sections/hero.ts';
import { live } from './sections/live.ts';

// dist/ is what the workflow publishes to the `output` branch. snake.svg is dropped
// there by Platane/snk earlier in the same job; local builds fall back to our heatmap.
const OUT = 'dist';
mkdirSync(OUT, { recursive: true });

const data = await loadLive();
const snakePath = `${OUT}/snake.svg`;
const snake = existsSync(snakePath) ? readFileSync(snakePath, 'utf8') : undefined;
console.log(`data: ${data.source}, ${data.contributions} contributions, snake: ${snake ? 'yes' : 'no (heatmap)'}`);

const profileUrl = 'https://github.com/tam11a';
const sections = [
  { file: 'hero.svg', render: () => hero(data), href: 'https://tam11a.dev', alt: 'tam. — Creative Software Engineer based in Dhaka' },
  { file: 'about.svg', render: () => about(data), href: 'https://tam11a.dev', alt: 'About — Senior Software Engineer, Dhaka, open to work' },
  { file: 'live.svg', render: () => live(data, snake), href: profileUrl, alt: 'Live GitHub stats, contribution graph and languages' },
  { file: 'activity.svg', render: () => activity(data), href: `${profileUrl}?tab=repositories`, alt: 'Recently active repositories' },
];

for (const s of sections) {
  const svg = await s.render();
  writeFileSync(`${OUT}/${s.file}`, svg);
  console.log(`${OUT}/${s.file}  ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
}
writeFileSync('preview.html', previewHtml(sections.map((s) => ({ ...s, file: `${OUT}/${s.file}` }))));
console.log('preview.html');
