import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        bengali: ['"Noto Sans Bengali"', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
        sans: ['"Noto Sans JP"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        pill: '999px',
      },
    },
  },
  plugins: [],
} satisfies Config
