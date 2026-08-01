/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#000000',
          light:   '#4d4d4d',
          dark:    '#000000',
          accent:  '#f0f0f0',
          muted:   '#fafafa',
        },
      },
      fontFamily: {
        sans: ['"Space Mono"', 'ui-monospace', 'monospace'],
        display: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glass: '0 4px 20px 0 rgba(0, 0, 0, 0.08)',
        'glass-sm': '0 2px 10px 0 rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}