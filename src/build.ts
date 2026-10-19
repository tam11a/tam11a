import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { contact, projects, site } from './data.ts';
import { loadLive } from './lib/github.ts';
import { previewHtml } from './preview.ts';
import { about, aboutMobile } from './sections/about.ts';
import { activity } from './sections/activity.ts';
import { contactButton, contactButtonMobile, contactCard, contactMobile } from './sections/contact.ts';
import { egg } from './sections/egg.ts';
import { honorsCard, honorsMobile } from './sections/honors.ts';
import { live, liveMobile } from './sections/live.ts';
import { proficienciesCard, proficienciesMobile } from './sections/proficiencies.ts';
import { projectCard, projectsHeader } from './sections/projects.ts';
import { workCard, workMobile } from './sections/work.ts';

// dist/ is what the workflow publishes to the `output` branch. snake.svg is dropped
// there by Platane/snk earlier in the same job; local builds fall back to our heatmap.
const OUT = 'dist';
const PUBLISHED = 'https://raw.githubusercontent.com/tam11a/tam11a/output';
mkdirSync(OUT, { recursive: true });

const data = await loadLive();
const snakePath = `${OUT}/snake.svg`;
const snake = existsSync(snakePath) ? readFileSync(snakePath, 'utf8') : undefined;
console.log(`data: ${data.source}, ${data.contributions} contributions, snake: ${snake ? 'yes' : 'no (heatmap)'}`);

// `mobile` renders the phone variant, published as <name>.m.svg and swapped in below PHONE.
interface Img { file: string; render: () => Promise<string>; mobile?: () => Promise<string>; href: string; alt: string }
const PHONE = '(max-width: 600px)';
const mobileFile = (f: string) => f.replace(/\.svg$/, '.m.svg');
type Block = { img: Img } | { row: Img[]; width: string };

const gh = 'https://github.com/tam11a';
// Sections parked for now; flip to true to bring them back.
const SHOW = { projects: false, activity: false };
const layout: Block[] = [
  { img: { file: 'about.svg', render: () => about(data), mobile: () => aboutMobile(data), href: site, alt: 'About — Senior Software Engineer in Dhaka, Bangladesh. 4+ years. Open to work.' } },
  { img: { file: 'proficiencies.svg', render: proficienciesCard, mobile: proficienciesMobile, href: site, alt: 'Proficiencies — skills, tech stack, tools and languages' } },
  { img: { file: 'work.svg', render: workCard, mobile: workMobile, href: `${site}/experience`, alt: 'Work — Cuebites Digital, Defined Solution, Reserveit, Planet X' } },
  { img: { file: 'honors.svg', render: honorsCard, mobile: honorsMobile, href: `${site}/honors`, alt: 'Honors — CSE Fest 2K24 Hackathon champion, NASA Space Apps national champion 2020' } },
  ...(SHOW.projects
    ? [
      { img: { file: 'projects.svg', render: projectsHeader, href: `${site}/projects`, alt: 'Projects' } },
      ...[0, 2, 4].map((k) => ({
        width: '49%',
        row: [k, k + 1].map((i) => ({
          file: `project-${i + 1}.svg`,
          render: () => projectCard(i),
          href: `${site}/projects/${projects[i].slug}`,
          alt: `${projects[i].name} — ${projects[i].summary}`,
        })),
      })),
      ]
    : []),
  { img: { file: 'live.svg', render: () => live(data, snake), mobile: () => liveMobile(data), href: gh, alt: 'Live GitHub stats: contributions, streaks, stars, contribution snake and top languages' } },
  ...(SHOW.activity
    ? [{ img: { file: 'activity.svg', render: () => activity(data), href: `${gh}?tab=repositories`, alt: 'Recently active public repositories' } }]
    : []),
  { img: { file: 'contact.svg', render: () => contactCard(), mobile: () => contactMobile(), href: contact.links[0].href, alt: `Contact — ${contact.email}` } },
  {
    width: '18%', // five per row plus the gaps between images, even on a ~290px phone column
    row: contact.links.map((l, i) => ({ file: `btn-${l.id}.svg`, render: () => contactButton(i), mobile: () => contactButtonMobile(i), href: l.href, alt: l.label })),
  },
  { img: { file: 'egg.svg', render: () => egg(data), mobile: () => egg(data, true), href: site, alt: 'Pixel-art tam runs through Dhaka at night, jumping bugs and collecting commits' } },
];

const imgs = layout.flatMap((b) => ('row' in b ? b.row : [b.img]));
for (const s of imgs) {
  const variants: [string, () => Promise<string>][] = [[s.file, s.render]];
  if (s.mobile) variants.push([mobileFile(s.file), s.mobile]);
  for (const [file, render] of variants) {
    const svg = await render();
    writeFileSync(`${OUT}/${file}`, svg);
    console.log(`${OUT}/${file.padEnd(22)} ${(Buffer.byteLength(svg) / 1024).toFixed(1).padStart(5)} KB`);
  }
}

/** README is plain HTML so the same markup drives both GitHub and the local preview. */
function readme(base: string) {
  const tag = (i: Img, width = '100%') => {
    const img = `<img src="${base}/${i.file}" alt="${i.alt.replace(/"/g, '&quot;')}" width="${width}">`;
    const pic = i.mobile ? `<picture><source media="${PHONE}" srcset="${base}/${mobileFile(i.file)}">${img}</picture>` : img;
    return `<a href="${i.href}">${pic}</a>`;
  };
  return layout
    .map((b) => {
      if ('row' in b) return `<p>\n${b.row.map((i) => tag(i, b.width)).join('\n')}\n</p>`;
      return tag(b.img);
    })
    .join('\n\n');
}

writeFileSync('README.md', `<!-- Generated by \`npm run build\` (src/build.ts). Edit the sources, not this file. -->\n\n${readme(PUBLISHED)}\n`);
writeFileSync('preview.html', previewHtml(readme(OUT)));
console.log('README.md, preview.html');
