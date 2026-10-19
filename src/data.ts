// Profile content. Stats with a `live` key are filled from the GitHub API at build time.
export const profile = {
  handle: 'tam11a',
  name: 'Ibrahim Sadik Tamim',
  wordmark: 'tam',
  tagline: 'Creative Software Engineer based in Dhaka.',
  timezone: 'Asia/Dhaka',
  rotator: [
    'Senior Software Engineer',
    'Co-Founder @ Defined Solution',
    'Software Engineer @ Cuebites',
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
