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
          DEFAULT: '#c2540c',
          light:   '#e07a3a',
          dark:    '#2b2620',
          accent:  '#fde8d3',
          muted:   '#faf6ef',
          cream:   '#f5efe3',
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
        glass: '0 8px 32px 0 rgba(43, 38, 32, 0.10)',
        'glass-sm': '0 4px 16px 0 rgba(43, 38, 32, 0.08)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
}