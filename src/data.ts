// Profile content. Stats with a `live` key are filled from the GitHub API at build time.
export const profile = {
  handle: 'tam11a',
  name: 'Ibrahim Sadik Tamim',
  wordmark: 'tam',
  tagline: 'Creative Software Engineer based in Dhaka.',
  timezone: 'Asia/Dhaka',
  rotator: [
    'Senior Software Engineer',
    'Software Engineer @ Cuebites',
    'Ex Co-Founder @ Defined Solution',
    'NASA Space Apps National Champion',
    'Lazy Engineer × Noob Gamer',
  ],
  about: {
    facts: [
      { label: 'Role', value: 'Senior Software Engineer' },
      { label: 'Based in', value: 'Dhaka, Bangladesh' },
      { label: 'Experience', value: '4+ Years' },
      { label: 'Status', value: 'Open to work', status: true },
    ],
    bio: 'I bridge strategic vision with technical expertise. Proficient in an assortment of technologies including JavaScript, TypeScript, C#, and Python. My focus is ensuring products are robust, scalable, and user-focused.',
    stats: [
      { value: '4', suffix: '+', label: 'Years shipping' },
      { live: 'repos', label: 'Repositories' },
      { live: 'contributions', label: 'Contributions / yr' },
    ] as { value?: string; suffix?: string; label: string; live?: 'repos' | 'contributions' }[],
  },
};

export const site = 'https://tam11a.dev';

export const proficiencies = {
  intro: 'The stack I reach for, and the craft around it.',
  groups: [
    { label: 'Skills', items: ['Software Architecture', 'UI/UX Design', 'DevOps Technologies', 'Project Management'] },
    { label: 'Tech stack', items: ['Astro', 'React / Next.js', 'Node.js / Nest.js', 'JavaScript / TypeScript', 'SQL / NoSQL'] },
    { label: 'Tools', items: ['Linear', 'VS Code', 'Figma', 'GitHub'] },
    { label: 'Languages', items: ['English (Professional)', 'Bengali (Native)', 'Hindi (Bilingual)'] },
  ],
  // simple-icons export names; two marquee rows scrolling in opposite directions.
  marquee: [
    ['siTypescript', 'siReact', 'siNextdotjs', 'siAstro', 'siNodedotjs', 'siNestjs', 'siJavascript', 'siTailwindcss', 'siGsap'],
    ['siDotnet', 'siPython', 'siPostgresql', 'siMongodb', 'siRedis', 'siPrisma', 'siDocker', 'siFigma', 'siLinear', 'siGit'],
  ],
};

export const work = {
  intro: "It's been a pleasure to work with a few startups, corporates and brands.",
  roles: [
    {
      company: 'Cuebites Digital',
      country: 'AU',
      title: 'Software Engineer',
      type: 'Full-time',
      period: '2026 — Present',
      current: true,
      summary: 'Orchestrating the delivery of scalable, high-performance software solutions while bridging the gap between technical excellence and strategic business growth.',
      tags: ['React', 'Next.js', 'TypeScript', 'Performance Optimization'],
    },
    {
      company: 'Defined Solution',
      country: 'BD',
      title: 'Co-Founder & Senior Software Engineer',
      type: 'Full-time',
      period: '2024 — 2025',
      summary: 'Collaborated with a talented team to design and implement innovative software solutions that empowered businesses to thrive in a dynamic digital landscape.',
      tags: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Software Architecture'],
    },
    {
      company: 'Reserveit',
      country: 'BD',
      title: 'Full-Stack Engineer',
      type: 'Full-time',
      period: '2021 — 2023',
      summary: 'Played a key role in developing one of the first restaurant reservation platforms in Bangladesh, streamlining the dining experience by enabling users to book tables online.',
      tags: ['React', 'Next.js', 'TypeScript', 'SSR', 'SSG'],
    },
    {
      company: 'Planet X Inc.',
      country: 'BD',
      title: 'Jr. Full-Stack Engineer',
      type: 'Full-time',
      period: '2021',
      summary: 'Began my software engineering journey contributing to an IoT dashboard application and device code for monitoring IoT devices.',
      tags: ['React', 'Node.js', 'IoT', 'Real-time Data', 'Embedded Systems'],
    },
  ] as { company: string; country: string; title: string; type: string; period: string; current?: boolean; summary: string; tags: string[] }[],
};

export const honors = [
  { year: '2024', title: 'CSE Fest 2K24 Hackathon', badge: 'Champion', detail: '1st Place at the CSE Fest 2K24 Hackathon' },
  { year: '2020', title: 'NASA Space Apps Challenge', badge: 'Champion', detail: 'National Champion, Bangladesh — 2020' },
];

export const projects = [
  { slug: 'munchies-bangladesh', name: 'Munchies Bangladesh', summary: "Late-night food delivery platform — because cravings don't follow a schedule.", tags: ['UI/UX', 'React', 'Figma'] },
  { slug: 'sultans-dine', name: "Sultan's Dine", summary: 'UI/UX case study reimagining the digital dining experience for a premium restaurant brand.', tags: ['UI/UX', 'Case Study', 'Figma'] },
  { slug: 'grade-limited', name: 'Grade Bangladesh', summary: 'B2B e-commerce platform helping businesses save big on everyday employee essentials.', tags: ['B2B', 'Next.js', 'TypeScript'] },
  { slug: 'rayos-bangladesh', name: 'Rayos Bangladesh', summary: 'Medical equipment marketplace making healthcare tech accessible to everyday consumers.', tags: ['B2C', 'Next.js', 'Healthcare'] },
  { slug: 'pnd-service', name: 'PND Service Bangladesh', summary: 'B2B wholesale platform empowering Facebook marketplace sellers to scale with zero upfront cost.', tags: ['B2B', 'Next.js', 'Wholesale'] },
  { slug: 'fascino', name: 'Fascino POS System', summary: 'Multi-channel POS software for Fascino, one of the finest fashion houses in Bangladesh, streamlining sales, inventory, and customer management.', tags: ['React', 'TypeScript', 'POS'] },
];

export const contact = {
  email: 'ibrahimsadiktamim@gmail.com',
  links: [
    { id: 'mail', label: 'Mail', href: 'mailto:ibrahimsadiktamim@gmail.com' },
    { id: 'site', label: 'Portfolio', href: 'https://tam11a.dev' },
    { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/tam11a' },
    { id: 'dribbble', label: 'Dribbble', href: 'https://dribbble.com/tam11a' },
    { id: 'resume', label: 'Resume', href: 'https://tam11a.dev/resume_ibrahimsadiktamim.pdf' },
  ],
};
