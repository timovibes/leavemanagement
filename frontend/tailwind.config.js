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
          DEFAULT: '#1f7a8c',
          light:   '#bfdbf7',
          dark:    '#022b3a',
          accent:  '#e1e5f2',
          muted:   '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'system-ui', 'serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(2, 43, 58, 0.12)',
        'glass-sm': '0 4px 16px 0 rgba(2, 43, 58, 0.08)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
}