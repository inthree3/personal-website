import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './sanity/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:            'var(--bg)',
        surface:       'var(--surface)',
        border:        'var(--border)',
        accent:        'var(--accent)',
        'accent-warm': 'var(--accent-warm)',
        'text-primary':'var(--text-primary)',
        'text-muted':  'var(--text-muted)',
      },
      fontFamily: {
        serif: ['var(--font-dm-serif)', 'serif'],
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-jetbrains)', 'monospace'],
      },
      maxWidth: { content: '768px' },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
